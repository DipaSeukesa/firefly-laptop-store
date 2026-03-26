import React from 'react';
import { X } from 'lucide-react';

const formatRupiah = (angka) => {
  if (!angka) return '';
  return new Intl.NumberFormat('id-ID').format(angka);
};

const parseAngka = (str) => {
  return str.toString().replace(/\./g, '');
};

const TransactionModal = ({
  showModal,
  setShowModal,
  formData,
  setFormData,
  handleSave,
  wallets
}) => {
  if (!showModal) return null;

  // Mencari wallet Aset Toko secara dinamis
  const asetWalletId = wallets.find(w => w.name.toLowerCase().includes("aset toko"))?.id;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[80] flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">

        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black mb-6 uppercase tracking-tighter text-white">Input Transaksi</h2>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Switch Toko / Pribadi */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipe_transaksi: 'toko', kategori: 'pemasukan penjualan', dari_wallet_id: '', ke_wallet_id: '' })}
              className={`py-3 rounded-xl font-bold text-[10px] uppercase transition-all ${formData.tipe_transaksi === 'toko' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
            >
              Toko
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipe_transaksi: 'pribadi', kategori: 'Pemasukan', dari_wallet_id: '', ke_wallet_id: '' })}
              className={`py-3 rounded-xl font-bold text-[10px] uppercase transition-all ${formData.tipe_transaksi === 'pribadi' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}
            >
              Pribadi
            </button>
          </div>

          {/* Baris Kategori & Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Kategori</label>
              <select
                value={formData.kategori}
                onChange={e => {
                  const val = e.target.value;
                  let targetWallet = '';
                  // Automasi: Jika pembelian aset, langsung arahkan target ke ID Aset Toko
                  if (val === 'pembelian aset') targetWallet = asetWalletId || '';

                  setFormData({ ...formData, kategori: val, sub_kategori: '', dari_wallet_id: '', ke_wallet_id: targetWallet });
                }}
                className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl outline-none mt-1 text-sm text-white"
              >
                {formData.tipe_transaksi === 'toko' ? (
                  <>
                    <option value="pemasukan penjualan">Pemasukan Penjualan</option>
                    <option value="pemasukan jasa">Pemasukan Jasa</option>
                    <option value="pembelian aset">Pembelian Aset Toko</option>
                    <option value="pengeluaran operasional">Pengeluaran Operasional</option>
                  </>
                ) : (
                  <>
                    <option value="Pemasukan">Pemasukan Pribadi</option>
                    <option value="Pengeluaran">Pengeluaran Pribadi</option>
                    <option value="transfer">Transfer Antar Dompet</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Tanggal</label>
              <input type="date" required value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-sm mt-1 text-white outline-none" />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Keterangan</label>
            <input required placeholder="Detail transaksi..." value={formData.keterangan} onChange={e => setFormData({ ...formData, keterangan: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-sm mt-1 text-white outline-none" />
          </div>

          {/* Sub Jenis Pribadi */}
          {formData.tipe_transaksi === 'pribadi' && formData.kategori !== 'transfer' && (
            <div className="animate-in fade-in duration-300">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Sub Jenis {formData.kategori}</label>
              <select required value={formData.sub_kategori} onChange={e => setFormData({ ...formData, sub_kategori: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl outline-none mt-1 text-sm text-white">
                <option value="">-- Pilih Jenis --</option>
                {formData.kategori === 'Pemasukan' ? (
                  ['Gaji Guru', 'Hibah', 'Lainnya'].map(v => <option key={v} value={v}>{v}</option>)
                ) : (
                  ['Makanan Pokok', 'Cemilan', 'Tanggungan', 'Kebutuhan Sekunder', 'Tagihan'].map(v => <option key={v} value={v}>{v}</option>)
                )}
              </select>
            </div>
          )}

          {/* Alur Dompet (Logika Lock/Unlock) */}
          <div className="grid grid-cols-2 gap-3">
            {/* DARI (SUMBER) - TETAP ADA */}
            <div>
              <label className="text-[10px] font-bold text-rose-400 uppercase ml-2">Dari (Sumber)</label>
              <select
                disabled={formData.kategori.includes('pemasukan') || formData.kategori === 'Pemasukan'}
                required={!(formData.kategori.includes('pemasukan') || formData.kategori === 'Pemasukan')}
                value={formData.dari_wallet_id}
                onChange={e => setFormData({ ...formData, dari_wallet_id: e.target.value })}
                className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-sm mt-1 text-white outline-none disabled:opacity-50 disabled:bg-slate-900"
              >
                {formData.kategori.includes('pemasukan') || formData.kategori === 'Pemasukan' ? (
                  <option value="">Sumber Luar</option>
                ) : (
                  <>
                    <option value="">-- Pilih Sumber --</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </>
                )}
              </select>
            </div>

            {/* KE (TARGET) - DENGAN LOGIKA ASET TOKO */}
            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase ml-2">Ke (Target)</label>
              <select
                // Unlock disabled jika pembelian aset agar data tersimpan ke Aset Toko
                disabled={(formData.kategori.includes('pengeluaran') || formData.kategori === 'Pengeluaran' || formData.kategori === 'pengeluaran operasional') && formData.kategori !== 'pembelian aset'}
                required
                value={formData.ke_wallet_id}
                onChange={e => setFormData({ ...formData, ke_wallet_id: e.target.value })}
                className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-sm mt-1 text-white outline-none disabled:opacity-50 disabled:bg-slate-900"
              >
                {formData.kategori === 'pembelian aset' ? (
                  <option value={asetWalletId}>{wallets.find(w => w.id === asetWalletId)?.name || "Aset Toko"}</option>
                ) : (formData.kategori.includes('pengeluaran') || formData.kategori === 'Pengeluaran' || formData.kategori === 'pengeluaran operasional') ? (
                  <option value="">Ke Luar (Otomatis)</option>
                ) : (
                  <>
                    <option value="">-- Pilih Target --</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Nominal Section */}
<div className="grid grid-cols-2 gap-3">
  {/* Kolom Kiri: Nominal Utama */}
  {/* Hapus 'Pengeluaran' dari sini agar dia jadi col-span-2 saat dipilih */}
  <div className={(formData.kategori === 'pemasukan penjualan' || formData.kategori === 'pemasukan jasa' || formData.kategori === 'transfer') ? 'col-span-1' : 'col-span-2'}>
    <label className="text-[10px] font-bold text-indigo-400 uppercase ml-2 flex justify-between">
      <span>
        {formData.kategori === 'transfer' ? 'Nominal Transfer' :
          formData.kategori.includes('pemasukan') || formData.kategori === 'Pemasukan' ? 'Nominal' :
            'Nominal'}
      </span>
      <span className="text-slate-500 font-black">IDR</span>
    </label>

    <div className="relative group">
      <input
        type="text"
        required
        placeholder="0"
        value={formatRupiah(formData.jumlah)}
        onChange={e => {
          const cleanValue = parseAngka(e.target.value);
          if (!isNaN(cleanValue)) {
            setFormData({ ...formData, jumlah: cleanValue });
          }
        }}
        className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl font-black mt-1 text-white outline-none text-xl focus:border-indigo-500 transition-all"
      />
    </div>

    {/* Suggestions hanya muncul di bawah input utama */}
    {formData.jumlah && formData.jumlah.length > 0 && formData.jumlah.length < 7 && (
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar animate-in slide-in-from-top-1 duration-200">
        {[1, 10, 100, 1000].map(multiplier => {
          const suggestion = parseInt(formData.jumlah) * Math.pow(10, multiplier.toString().length - 1);
          if (suggestion > parseInt(formData.jumlah) && suggestion < 1000000000) {
            return (
              <button
                key={multiplier}
                type="button"
                onClick={() => setFormData({ ...formData, jumlah: suggestion.toString() })}
                className="bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 px-4 py-2 rounded-xl text-[11px] font-black text-indigo-400 hover:text-white transition-all whitespace-nowrap"
              >
                +{formatRupiah(suggestion)}
              </button>
            );
          }
          return null;
        })}
      </div>
    )}
  </div>

  {/* Kolom Kanan: Modal (HPP) ATAU Fee Admin Transfer */}
  {(formData.kategori === 'pemasukan penjualan' ||
    formData.kategori === 'pemasukan jasa' ||
    formData.kategori === 'transfer') && (
      <div className="animate-in fade-in slide-in-from-right-2 duration-300">
        <label className="text-[10px] font-bold text-rose-500 uppercase ml-2 flex justify-between">
          <span>
            {formData.kategori === 'transfer' ? 'Fee Admin' : 'Modal (HPP)'}
          </span>
          <span className="opacity-50 text-[8px]">Opsional</span>
        </label>
        <input
          type="text"
          placeholder="0"
          value={formatRupiah(formData.kategori === 'transfer' ? formData.fee_transfer : formData.harga_beli)}
          onChange={e => {
            const cleanValue = parseAngka(e.target.value);
            if (!isNaN(cleanValue)) {
              if (formData.kategori === 'transfer') {
                setFormData({ ...formData, fee_transfer: cleanValue });
              } else {
                setFormData({ ...formData, harga_beli: cleanValue });
              }
            }
          }}
          className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl mt-1 text-white outline-none font-bold focus:border-rose-500 transition-all text-lg"
        />
      </div>
    )}
</div>


          <button type="submit" className="w-full bg-indigo-600 p-4 rounded-2xl font-black text-sm mt-4 uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-transform text-white">
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;