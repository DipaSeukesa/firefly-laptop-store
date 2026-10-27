// src/lib/gemini.js
// Service Integrasi Google Gemini AI & Voice-to-Text (Web Speech API)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Speech Recognition Wrapper (Web Speech API Native)
 * Mode Continuous (seperti Gboard / Google Keyboard):
 * - Tidak cepat menutup saat jeda bicara
 * - Otomatis mengumpulkan kalimat panjang & multi-item
 * - Mendukung Bahasa Indonesia (id-ID)
 */
export const initSpeechRecognition = ({ onResult, onStatusChange, onError }) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('⚠️ [Voice VTT] Web Speech API tidak didukung di browser ini.');
    if (onError) onError('Browser tidak mendukung Speech Recognition. Gunakan Google Chrome atau Edge.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'id-ID';
  recognition.continuous = true; // KUNCI: Terus mendengarkan tanpa putus saat jeda bicara
  recognition.interimResults = true;

  let isExplicitlyStopped = true;
  let finalTranscript = '';

  recognition.onstart = () => {
    console.log('🎙️ [Voice VTT] Mikrofon aktif (Continuous Dictation Mode - Gboard style)...');
    if (onStatusChange) onStatusChange('LISTENING');
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += (finalTranscript ? ' ' : '') + piece.trim();
      } else {
        interimTranscript += piece;
      }
    }
    const currentCombined = (finalTranscript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    console.log('📝 [Voice VTT] Transkrip aktif:', currentCombined);
    if (onResult) onResult(currentCombined);
  };

  recognition.onerror = (event) => {
    // Abaikan error "no-speech" agar tidak mematikan mic jika teknisi sedang membaca part/jeda bicara
    if (event.error === 'no-speech') {
      console.log('⏳ [Voice VTT] Menunggu ucapan teknisi (hening sejenak)...');
      return;
    }
    console.warn('⚠️ [Voice VTT] Event status:', event.error);
    if (event.error === 'not-allowed') {
      isExplicitlyStopped = true;
      if (onStatusChange) onStatusChange('ERROR');
      if (onError) onError('Akses mikrofon ditolak oleh browser.');
    }
  };

  recognition.onend = () => {
    // Jika tidak dihentikan sengaja oleh user, auto-resume agar mic tetap menyala seperti Google Keyboard
    if (!isExplicitlyStopped) {
      console.log('🔄 [Voice VTT] Mempertahankan mikrofon tetap aktif...');
      try {
        recognition.start();
      } catch (err) {
        console.warn('⚠️ [Voice VTT] Gagal auto-restart:', err.message);
        if (onStatusChange) onStatusChange('IDLE');
      }
    } else {
      console.log('⏹️ [Voice VTT] Sesi mikrofon dihentikan oleh pengguna.');
      if (onStatusChange) onStatusChange('IDLE');
    }
  };

  return {
    start: () => {
      isExplicitlyStopped = false;
      finalTranscript = '';
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition start warning:', err.message);
      }
    },
    stop: () => {
      isExplicitlyStopped = true;
      try {
        recognition.stop();
      } catch (err) { /* ignore */ }
    },
    reset: () => {
      finalTranscript = '';
    }
  };
};

/**
 * Menganalisis ucapan teknisi / teks input (Mendukung Batch Multi-Item Sekaligus)
 * Menghasilkan data aset terstruktur, estimasi harga modal pasaran ID, target jual ~25%, dan spesifikasi lengkap
 */
export const parseAssetWithGemini = async (inputPrompt) => {
  console.log('%c🚀 [Gemini AI] Memulai analisis teks input:', 'color: #06b6d4; font-weight: bold;', inputPrompt);

  if (!GEMINI_API_KEY) {
    console.error('❌ [Gemini AI] Kunci VITE_GEMINI_API_KEY kosong di .env');
    throw new Error('VITE_GEMINI_API_KEY belum dikonfigurasi di file .env');
  }

  const systemInstruction = `
Kamu adalah Sistem Intelijen Inventaris untuk Firefly Laptop Store & Reality Lab.
Tugasmu adalah menganalisis teks input (hasil ucapan teknisi / voice to text / ketikan perintah).
Teknisi dapat menyebutkan SATU BARANG atau BEBERAPA BARANG SEKALIGUS dalam satu kalimat ucapan (Multi-Item Batch).
Contoh input multi-item: "tambahkan adaptop acer adp-65 jhbb dan toshiba sadp-75PBB pada rak 2".

PANDUAN EKSTRAKSI BATCH & INTELIJEN:
1. DETEKSI MULTI-ITEM:
   - Jika teks menyebut lebih dari 1 barang (misal dipisahkan kata "dan", "serta", koma, atau baris baru), pisahkan menjadi masing-masing item terpisah di array 'items'.
   - Jika hanya 1 barang yang disebut, array 'items' tetap berisi 1 objek.

2. PEMBERSIHAN NAMA BARANG:
   - Bersihkan kata awalan instruksi seperti "TAMBAHKAN STOK", "INPUT", "*", "MASUKKAN", "tambahkan", dll.
   - Ambil nama barang resmi dan lengkap beserta varian/daya. Contoh:
     * "Adaptor Acer 65W ADP-65JH BB"
     * "Adaptor Toshiba 75W SADP-75PB B"

3. ESTIMASI HARGA MODAL PASARAN E-COMMERCE INDONESIA (TOKOPEDIA / SHOPEE):
   - Jika teknisi TIDAK menyebutkan harga modal:
     * Estimasi harga modal pasaran rata-rata barang tersebut di e-commerce Indonesia (Tokopedia, Shopee, Bukalapak) untuk kondisi barang tersebut (Bagus / Bekas Normal / Original OEM).
     * Contoh: Adaptor Acer 65W / Toshiba 75W bekas normal berkisar Rp 90.000 - Rp 120.000. Masukkan angka integer wajar (misal: 95000, 105000).
   - Jika teknisi MENYEBUTKAN harga modal (misal "modal 80rb"): gunakan angka tersebut.

4. ESTIMASI HARGA JUAL TARGET (MARGIN KEUNTUNGAN ~25%):
   - Jika teknisi TIDAK menyebutkan harga jual target:
     * Hitung harga jual target dengan menambahkan margin keuntungan kira-kira 25% di atas harga modal.
     * Bulatkan ke kelipatan Rp 5.000 terdekat (contoh: modal 95.000 -> target jual 120.000; modal 105.000 -> target jual 130.000).
   - Jika teknisi MENYEBUTKAN harga jual target: gunakan angka yang disebutkan.

5. SPESIFIKASI TEKNIS MENDALAM:
   - Jika CHARGER / ADAPTOR: cari spesifikasi riil part number tersebut:
     * brand (e.g. Acer, Toshiba, Lenovo, Asus, Dell, HP)
     * part_number (e.g. ADP-65JH BB, SADP-75PB B)
     * daya (e.g. "65W", "75W", "90W")
     * output_voltase (e.g. "19V", "20V")
     * output_ampere (e.g. "3.42A", "3.95A", "4.5A")
     * tipe_jack (e.g. "DC 5.5 x 1.7 mm (Ujung Biru)", "DC 5.5 x 2.5 mm", "Slim Tip Kotak Kuning")
     * kompatibilitas (seri laptop kompatibel)
   - Jika SENSOR / MIKROKONTROLER / IC:
     * voltase_kerja (e.g. "3.3V - 5V"), antarmuka (e.g. "I2C", "SPI"), fungsi_utama
   - Masukkan ke objek JSON 'spesifikasi'.

6. KATEGORI & LAYER:
   - Layer 1: Laptop dagangan, unit siap jual.
   - Layer 2: Komponen, charger, adaptor, sensor, modul, sparepart.
   - Layer 3: Tools, obeng, timah, solder, alat ukur.

7. LOKASI PENYIMPANAN:
   - Jika teks menyebut lokasi (misal "rak 2" atau "rk2"), seluruh item yang dimaksud diarahkan ke kode lokasi reality lab: "RK2-BX1" (atau sesuai input teknisi).

8. ATURAN CHECK CONSTRAINT SUPABASE (WAJIB TEPAT):
   - 'kondisi' HANYA BOLEH: 'Bagus' | 'Rusak' | 'Butuh Servis' | 'Suku Cadang' (Default: 'Bagus').
   - 'status_barang' HANYA BOLEH: 'Tersedia' | 'Servis' | 'Digunakan' | 'Habis' (Default: 'Tersedia').
   - 'qty': Angka integer (misal jika ada "1", isi 1).
   - 'harga_modal': number (angka integer rupiah).
   - 'harga_jual_target': number (angka integer rupiah).

9. CATATAN TEKNIS LENGKAP:
   - Rangkum estimasi harga pasaran e-commerce, target margin 25%, dan spesifikasi teknis unit.

10. CARI LINK FOTO PRODUK ASLI DARI INTERNET SELUAS-LUASNYA (REAL IMAGE URL):
   - Cari dan sertakan URL link gambar produk asli dari internet seluas-luasnya (bebas dari situs web mana pun: Google Images, web resmi pabrikan/brand, web distributor, blog review, e-commerce Tokopedia/Shopee/Amazon/Bukalapak, Wikimedia, atau direct image CDN).
   - Yang penting adalah gambar yang representatif dari barang/seri tersebut (tidak dibatasi toko e-commerce tertentu, gambar apa pun yang cocok dari web dipersilakan).
   - Pastikan berupa direct image URL (diawali https:// dan sebaiknya berakhiran .jpg, .jpeg, .png, .webp atau URL CDN gambar).
   - Masukkan ke field 'foto_url'. Jika sama sekali tidak menemukan link, isi dengan null.

KEMBALIKAN HANYA OBJEK JSON MURNI TANPA BACKTICK MARKDOWN:
{
  "total_items": 2,
  "items": [
    {
      "nama_barang": "Adaptor Acer 65W ADP-65JH BB",
      "foto_url": "https://images.tokopedia.net/img/cache/700/VqbcmM/2023/11/30/3280ea5e-714c-4dfd-a900-34fcd2ea650e.jpg.webp",
      "kategori_layer": 2,
      "kategori_barang": "Charger & Adaptor",
      "kondisi": "Bagus",
      "status_barang": "Tersedia",
      "qty": 1,
      "harga_modal": 95000,
      "harga_jual_target": 120000,
      "lokasi_penyimpanan": "RK2-BX1",
      "kode_unit": "SN-ACR-65W",
      "spesifikasi": {
        "brand": "Acer",
        "part_number": "ADP-65JH BB",
        "daya": "65W",
        "output_voltase": "19V",
        "output_ampere": "3.42A",
        "tipe_jack": "DC 5.5 x 1.7 mm (Ujung Biru)",
        "kompatibilitas": "Acer Aspire Series, TravelMate Series"
      },
      "catatan_teknis": "Estimasi modal pasaran e-commerce Rp 95.000. Target jual Rp 120.000 (margin ~25%). Original Acer 65W 19V 3.42A."
    }
  ]
}
`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: `${systemInstruction}\n\nInput Teknisi:\n"${inputPrompt}"` }
        ]
      }
    ]
  };

  // Hitung timeout dinamis berdasarkan banyaknya baris / item
  const lineCount = (inputPrompt.match(/\n/g) || []).length + 1;
  // Minimal 35 detik, tambah 2.5 detik per baris teks, maksimal 90 detik
  const timeoutMs = Math.min(Math.max(35000, lineCount * 2500), 90000);

  // Model prioritas: gemini-3.5-flash-lite (tercepat) disusul gemini-3.5-flash
  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`🤖 [Gemini AI] Mengirim request ke model: ${model} (Timeout: ${timeoutMs / 1000}s untuk ${lineCount} baris)...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      console.log(`📡 [Gemini AI] Response status [${model}]:`, response.status);
      const data = await response.json();

      if (data.error) {
        console.warn(`⚠️ [Gemini AI] Error dari model ${model}:`, data.error.message);
        lastError = new Error(data.error.message);
        continue;
      }

      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error('Respon Gemini kosong.');
      }

      console.log('📄 [Gemini AI] Respon mentah diterima (panjang teks:', textResponse.length, 'karakter)');

      // Ekstraksi blok JSON yang kokoh (menghindari teks percakapan intro/outro dari AI)
      let jsonStr = textResponse;
      const jsonBlockMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonBlockMatch) {
        jsonStr = jsonBlockMatch[1];
      } else {
        const objectMatch = textResponse.match(/\{[\s\S]*\}/);
        const arrayMatch = textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (objectMatch) jsonStr = objectMatch[0];
        else if (arrayMatch) jsonStr = arrayMatch[0];
      }

      const parsed = JSON.parse(jsonStr.trim());
      
      // Standarisasi output: pastikan array items selalu ada (baik outputnya langsung array atau { items: [...] })
      let items = [];
      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (Array.isArray(parsed.items)) {
        items = parsed.items;
      } else if (parsed.nama_barang) {
        items = [parsed];
      }

      const result = {
        total_items: items.length,
        items: items,
        // Spread item pertama untuk backward compatibility jika pemanggil membaca .nama_barang langsung
        ...(items[0] || {})
      };

      console.log(`%c✅ [Gemini AI] Sukses parse ${items.length} item:`, 'color: #10b981; font-weight: bold;', result);
      console.table(items.map(it => ({
        Nama: it.nama_barang,
        Qty: it.qty,
        Modal: it.harga_modal,
        TargetJual: it.harga_jual_target,
        Lokasi: it.lokasi_penyimpanan,
        Spek: it.spesifikasi ? Object.entries(it.spesifikasi).map(([k,v]) => `${k}:${v}`).join(', ') : ''
      })));

      return result;
    } catch (err) {
      console.warn(`⚠️ [Gemini AI] Gagal pada model ${model}:`, err.message);
      lastError = err;
    }
  }

  console.error('❌ [Gemini AI] Semua model gagal:', lastError);
  throw lastError || new Error('Gagal menghubungi Gemini AI.');
};

