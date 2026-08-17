import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  Building,
  Zap,
  CheckCircle2,
  X,
  Link,
  Download,
  AlertCircle
} from 'lucide-react';

interface SurveyPhotoUploadSectionProps {
  fotoBangunan?: string;
  fotoTitikSambung?: string;
  onChangeFotoBangunan: (urlOrBase64: string | undefined) => void;
  onChangeFotoTitikSambung: (urlOrBase64: string | undefined) => void;
  namaPelanggan?: string;
  titikSambungNama?: string;
}

// Client-side image compression helper to ensure lightweight storage
export async function compressImageFile(file: File, maxWidth = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = elem.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

export const SurveyPhotoUploadSection: React.FC<SurveyPhotoUploadSectionProps> = ({
  fotoBangunan,
  fotoTitikSambung,
  onChangeFotoBangunan,
  onChangeFotoTitikSambung,
  namaPelanggan = 'Pelanggan',
  titikSambungNama = 'Tiang JTR'
}) => {
  // Modal state for full image preview
  const [previewModalImg, setPreviewModalImg] = useState<{ src: string; title: string } | null>(null);

  // URL input modal / toggle
  const [activeUrlInput, setActiveUrlInput] = useState<'bangunan' | 'titik_sambung' | null>(null);
  const [tempUrlValue, setTempUrlValue] = useState('');

  // Hidden File Inputs
  const fileInputBangunanRef = useRef<HTMLInputElement>(null);
  const cameraInputBangunanRef = useRef<HTMLInputElement>(null);
  const fileInputSambungRef = useRef<HTMLInputElement>(null);
  const cameraInputSambungRef = useRef<HTMLInputElement>(null);

  const [loadingBangunan, setLoadingBangunan] = useState(false);
  const [loadingSambung, setLoadingSambung] = useState(false);

  const handleFileUpload = async (
    file: File | null,
    target: 'bangunan' | 'titik_sambung'
  ) => {
    if (!file) return;
    try {
      if (target === 'bangunan') setLoadingBangunan(true);
      else setLoadingSambung(true);

      const compressedBase64 = await compressImageFile(file);
      if (target === 'bangunan') {
        onChangeFotoBangunan(compressedBase64);
      } else {
        onChangeFotoTitikSambung(compressedBase64);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Gagal memproses foto. Silakan coba file gambar lain.');
    } finally {
      if (target === 'bangunan') setLoadingBangunan(false);
      else setLoadingSambung(false);
    }
  };

  const handleSaveUrl = (target: 'bangunan' | 'titik_sambung') => {
    if (!tempUrlValue.trim()) return;
    if (target === 'bangunan') {
      onChangeFotoBangunan(tempUrlValue.trim());
    } else {
      onChangeFotoTitikSambung(tempUrlValue.trim());
    }
    setActiveUrlInput(null);
    setTempUrlValue('');
  };

  return (
    <div className="space-y-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            Dokumentasi Foto Lapangan (Bangunan & Titik Sambung)
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Unggah atau ambil foto bangunan calon pelanggan dan tiang titik sambung untuk kelengkapan Berita Acara Survey.
          </p>
        </div>
      </div>

      {/* Grid: Foto Bangunan & Foto Titik Sambung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* 1. KARTU FOTO BANGUNAN */}
        <div className="flex flex-col bg-slate-900/90 border border-sky-900/60 rounded-xl overflow-hidden shadow-lg">
          {/* Header Card */}
          <div className="px-3.5 py-2.5 bg-sky-950/60 border-b border-sky-800/50 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              1. Foto Bangunan Pelanggan
            </span>
            {fotoBangunan ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                Terunggah
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Belum ada foto
              </span>
            )}
          </div>

          {/* Body Preview / Upload State */}
          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            {fotoBangunan ? (
              <div className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center">
                <img
                  src={fotoBangunan}
                  alt={`Foto Bangunan ${namaPelanggan}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModalImg({
                        src: fotoBangunan,
                        title: `Foto Bangunan: ${namaPelanggan}`
                      })
                    }
                    className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-lg cursor-pointer"
                    title="Perbesar Foto"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputBangunanRef.current?.click()}
                    className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-lg cursor-pointer"
                    title="Ganti Foto"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFotoBangunan(undefined)}
                    className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg cursor-pointer"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-sky-800/40 bg-sky-950/10 p-4 text-center flex flex-col items-center justify-center min-h-[140px]">
                {loadingBangunan ? (
                  <div className="text-xs text-sky-400 animate-pulse flex items-center gap-2">
                    <Camera className="w-4 h-4 animate-spin" />
                    <span>Memproses gambar bangunan...</span>
                  </div>
                ) : (
                  <>
                    <Building className="w-8 h-8 text-sky-500/50 mb-1.5" />
                    <p className="text-xs text-slate-300 font-semibold">Tampak Depan Bangunan / Rumah</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Foto tampak depan calon pelanggan & rencana posisi kWh meter
                    </p>
                  </>
                )}
              </div>
            )}

            {/* URL Input Bar if opened */}
            {activeUrlInput === 'bangunan' && (
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 border border-sky-800/60 rounded-lg">
                <input
                  type="url"
                  placeholder="https://contoh.com/foto-bangunan.jpg"
                  value={tempUrlValue}
                  onChange={(e) => setTempUrlValue(e.target.value)}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveUrl('bangunan')}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold rounded"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveUrlInput(null);
                    setTempUrlValue('');
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => cameraInputBangunanRef.current?.click()}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 rounded-lg text-sky-200 text-[11px] font-semibold transition-all cursor-pointer"
                title="Buka Kamera HP / Laptop"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>Kamera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputBangunanRef.current?.click()}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
                title="Pilih File dari Galeri / Dokumen"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Galeri</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveUrlInput(activeUrlInput === 'bangunan' ? null : 'bangunan');
                  setTempUrlValue(fotoBangunan || '');
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
                title="Tautkan Link URL"
              >
                <Link className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link URL</span>
              </button>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputBangunanRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileUpload(file, 'bangunan');
              }}
            />
            <input
              type="file"
              ref={cameraInputBangunanRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileUpload(file, 'bangunan');
              }}
            />
          </div>
        </div>

        {/* 2. KARTU FOTO TITIK SAMBUNG */}
        <div className="flex flex-col bg-slate-900/90 border border-amber-900/60 rounded-xl overflow-hidden shadow-lg">
          {/* Header Card */}
          <div className="px-3.5 py-2.5 bg-amber-950/60 border-b border-amber-800/50 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              2. Foto Titik Sambung / Tiang JTR
            </span>
            {fotoTitikSambung ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                Terunggah
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Belum ada foto
              </span>
            )}
          </div>

          {/* Body Preview / Upload State */}
          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            {fotoTitikSambung ? (
              <div className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center">
                <img
                  src={fotoTitikSambung}
                  alt={`Foto Titik Sambung ${titikSambungNama}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModalImg({
                        src: fotoTitikSambung,
                        title: `Foto Titik Sambung: ${titikSambungNama}`
                      })
                    }
                    className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-lg cursor-pointer"
                    title="Perbesar Foto"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputSambungRef.current?.click()}
                    className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-lg cursor-pointer"
                    title="Ganti Foto"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFotoTitikSambung(undefined)}
                    className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg cursor-pointer"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-amber-800/40 bg-amber-950/10 p-4 text-center flex flex-col items-center justify-center min-h-[140px]">
                {loadingSambung ? (
                  <div className="text-xs text-amber-400 animate-pulse flex items-center gap-2">
                    <Camera className="w-4 h-4 animate-spin" />
                    <span>Memproses gambar tiang sambung...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-8 h-8 text-amber-500/50 mb-1.5" />
                    <p className="text-xs text-slate-300 font-semibold">Tiang JTR / Jalur Tarikan SR</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Foto tiang asal sambungan dan kondisi tarikan kabel SR
                    </p>
                  </>
                )}
              </div>
            )}

            {/* URL Input Bar if opened */}
            {activeUrlInput === 'titik_sambung' && (
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 border border-amber-800/60 rounded-lg">
                <input
                  type="url"
                  placeholder="https://contoh.com/foto-tiang-sambung.jpg"
                  value={tempUrlValue}
                  onChange={(e) => setTempUrlValue(e.target.value)}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveUrl('titik_sambung')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold rounded"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveUrlInput(null);
                    setTempUrlValue('');
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => cameraInputSambungRef.current?.click()}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 rounded-lg text-amber-200 text-[11px] font-semibold transition-all cursor-pointer"
                title="Buka Kamera HP / Laptop"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Kamera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputSambungRef.current?.click()}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
                title="Pilih File dari Galeri / Dokumen"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Galeri</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveUrlInput(activeUrlInput === 'titik_sambung' ? null : 'titik_sambung');
                  setTempUrlValue(fotoTitikSambung || '');
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
                title="Tautkan Link URL"
              >
                <Link className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link URL</span>
              </button>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputSambungRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileUpload(file, 'titik_sambung');
              }}
            />
            <input
              type="file"
              ref={cameraInputSambungRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileUpload(file, 'titik_sambung');
              }}
            />
          </div>
        </div>
      </div>

      {/* Full-Screen / Lightbox Modal for Photo Preview */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {previewModalImg.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black/60 max-h-[75vh] overflow-auto">
              <img
                src={previewModalImg.src}
                alt={previewModalImg.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Dokumentasi Visual Survey Lapangan ULP Baguala</span>
              <a
                href={previewModalImg.src}
                download="foto_survey_baguala.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Foto
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
