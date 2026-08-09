import React, { useState } from 'react';
import { X, Factory, Plus } from 'lucide-react';
import { Penyulang } from '../../types';

interface TambahPenyulangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (penyulang: Penyulang) => void;
  initialData?: Penyulang | null;
}

export const TambahPenyulangModal: React.FC<TambahPenyulangModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [namaGi, setNamaGi] = useState('GI PASSO');
  const [namaPenyulang, setNamaPenyulang] = useState('BAGUALA');
  const [status, setStatus] = useState<'Utama' | 'Percabangan'>('Utama');
  const [kodeId, setKodeId] = useState('BGL');
  const [panjangJaringanKms, setPanjangJaringanKms] = useState(12.5);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNamaGi(initialData.namaGi);
        setNamaPenyulang(initialData.namaPenyulang);
        setStatus(initialData.status);
        setKodeId(initialData.kodeId);
        setPanjangJaringanKms(initialData.panjangJaringanKms);
      } else {
        setNamaGi('GI PASSO');
        setNamaPenyulang('BAGUALA');
        setStatus('Utama');
        setKodeId('BGL');
        setPanjangJaringanKms(12.5);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPenyulang.trim()) return;

    const savedPenyulang: Penyulang = {
      id: initialData ? initialData.id : `p_${Date.now()}`,
      namaGi,
      namaPenyulang,
      status,
      kodeId,
      panjangJaringanKms: Number(panjangJaringanKms) || 0,
      frekuensiGangguan: initialData ? initialData.frekuensiGangguan : 0,
      healthIndexStatus: initialData ? initialData.healthIndexStatus : 'Sempurna'
    };

    onSave(savedPenyulang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-md max-h-[90vh] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <h3 className="text-base font-extrabold text-slate-900">
            Tambah Penyulang Baru
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-3.5 text-xs pr-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              NAMA GARDU INDUK (GI)
            </label>
            <input
              type="text"
              value={namaGi}
              onChange={(e) => setNamaGi(e.target.value)}
              placeholder="e.g. GI PASSO"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              NAMA PENYULANG
            </label>
            <input
              type="text"
              value={namaPenyulang}
              onChange={(e) => setNamaPenyulang(e.target.value)}
              placeholder="e.g. BAGUALA"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              STATUS PENYULANG
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Utama' | 'Percabangan')}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
            >
              <option value="Utama" className="bg-white">Utama</option>
              <option value="Percabangan" className="bg-white">Percabangan</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              KODE / ID
            </label>
            <input
              type="text"
              value={kodeId}
              onChange={(e) => setKodeId(e.target.value)}
              placeholder="e.g. BGL"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              TOTAL PANJANG JARINGAN (KMS)
            </label>
            <input
              type="number"
              step="0.1"
              value={panjangJaringanKms}
              onChange={(e) => setPanjangJaringanKms(Number(e.target.value))}
              placeholder="0"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
