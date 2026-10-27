// src/lib/cloudinary.js
// Service Integrasi Upload Gambar Cloudinary untuk Aset Firefly

export const CLOUDINARY_CONFIG = {
  cloudName: 'beuxkf8t',
  uploadPreset: 'foto_aset_produk',
  assetFolder: 'firefly/asset',
  uploadUrl: 'https://api.cloudinary.com/v1_1/beuxkf8t/image/upload'
};

/**
 * Upload gambar ke Cloudinary (Mendukung File Lokal & Remote URL Internet)
 * @param {File|Blob|string} fileOrUrl - File dari input kamera/galeri ATAU string URL internet
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (fileOrUrl) => {
  if (!fileOrUrl) throw new Error('File atau URL gambar tidak boleh kosong');

  console.log('☁️ [Cloudinary] Mengunggah aset ke cloud:', CLOUDINARY_CONFIG.cloudName, 'folder:', CLOUDINARY_CONFIG.assetFolder);

  const formData = new FormData();
  formData.append('file', fileOrUrl);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', CLOUDINARY_CONFIG.assetFolder);

  const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (data.error) {
    console.error('❌ [Cloudinary] Error upload:', data.error.message);
    throw new Error(data.error.message || 'Gagal mengunggah gambar ke Cloudinary.');
  }

  console.log('✅ [Cloudinary] Berhasil upload! URL:', data.secure_url);
  return {
    url: data.secure_url,
    publicId: data.public_id
  };
};

/**
 * Menghasilkan link pencarian gambar Google Images berdasarkan nama/seri barang
 * @param {string} productName - Nama atau part number barang
 * @returns {string} URL pencarian gambar
 */
export const getGoogleImageSearchUrl = (productName) => {
  const query = encodeURIComponent(`${productName} product image`);
  return `https://www.google.com/search?tbm=isch&q=${query}`;
};
