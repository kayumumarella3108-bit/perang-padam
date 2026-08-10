import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Users, Target, Layers, Wrench, Trees, Search } from 'lucide-react';
import { PerintahKerja, Penyulang, SectionJaringan } from '../../types';

interface InputSpkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spk: PerintahKerja) => void;
  penyulangList: Penyulang[];
  sectionList: SectionJaringan[];
  editItem?: PerintahKerja | null;
}

export const InputSpkModal: React.FC<InputSpkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  penyulangList,
  sectionList,
  editItem
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const generateAutoSpkNo = () => {
    const yearMonth = todayStr.slice(0, 7).replace('-', '/');
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `SPK/ULP-BGL/${yearMonth}/${randomNum}`;
  };

  const [noSpk, setNoSpk] = useState(generateAutoSpkNo());
  const [tanggal, setTanggal] = useState(todayStr);
  const [jenisPekerjaan, setJenisPekerjaan] = useState<'ROW' | 'Inspeksi' | 'Pemeliharaan'>('ROW');
  const [penyulangId, setPenyulangId] = useState(penyulangList[0]?.id || '');
  const [namaPenyulang, setNamaPenyulang] = useState(penyulangList[0]?.namaPenyulang || '');
  const [section, setSection] = useState('');
  const [target, setTarget] = useState('');
  const [jumlahPersonil, setJumlahPersonil] = useState(4);
  const [status, setStatus] = useState<'Terencana' | 'Dalam Proses' | 'Selesai' | 'Dibatalkan'>('Terencana');
  const [timAtauPetugas, setTimAtauPetugas] = useState('Tim Yantek ULP Baguala');
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (editItem) {
      setNoSpk(editItem.noSpk || generateAutoSpkNo());
      setTanggal(editItem.tanggal || todayStr);
      setJenisPekerjaan(editItem.jenisPekerjaan || 'ROW');
      setNamaPenyulang(editItem.namaPenyulang || penyulangList[0]?.namaPenyulang || '');
      const foundPenyulang = penyulangList.find((p) => p.namaPenyulang === editItem.namaPenyulang);
      setPenyulangId(foundPenyulang?.id || editItem.penyulangId || penyulangList[0]?.id || '');
      setSection(editItem.section || '');
      setTarget(editItem.target || '');
      setJumlahPersonil(editItem.jumlahPersonil || 4);
      setStatus(editItem.status || 'Terencana');
      setTimAtauPetugas(editItem.timAtauPetugas || 'Tim Yantek ULP Baguala');
      setCatatan(editItem.catatan || '');
    } else {
      setNoSpk(generateAutoSpkNo());
      setTanggal(todayStr);
      setJenisPekerjaan('ROW');
      if (penyulangList.length > 0) {
        setPenyulangId(penyulangList[0].id);
        setNamaPenyulang(penyulangList[0].namaPenyulang);
      }
      setSection('');
      setTarget('');
      setJumlahPersonil(4);
      setStatus('Terencana');
      setTimAtauPetugas('Tim Yantek ULP Baguala');
      setCatatan('');
    }
  }, [editItem, isOpen]);

  const handlePenyulangChange = (id: string) => {
    setPenyulangId(id);
    const found = penyulangList.find((p) => p.id === id);
    if (found) {
      setNamaPenyulang(found.namaPenyulang);
    }
  };

  const filteredSections = sectionList.filter((s) => s.penyulangId === penyulangId || s.namaPenyulang === namaPenyulang);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noSpk.trim() || !namaPenyulang || !section.trim() || !target.trim()) {
      alert('Mohon lengkapi No. SPK, Penyulang, Section, dan Target Pekerjaan.');
      return;
    }

    const spkData: PerintahKerja = {
      id: editItem ? editItem.id : `spk_${Date.now()}`,
      noSpk: noSpk.trim(),
      tanggal,
      jenisPekerjaan,
      penyulangId,
      namaPenyulang,
      section: section.trim(),
      target: target.trim(),
      jumlahPersonil: Number(jumlahPersonil) || 1,
      status,
      timAtauPetugas: timAtauPetugas.trim(),
      catatan: catatan.trim(),
      createdAt: editItem?.createdAt || new Date().toISOString()
    };

    onSave(spkData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editItem ? 'Edit Perintah Kerja Harian (SPK)' : 'Input Perintah Kerja Harian (SPK)'}
              </h3>
              <p className="text-xs text-slate-300">Formulir penugasan pekerjaan teknis harian jaringan 20kV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Jenis Pekerjaan Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Jenis Pekerjaan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setJenisPekerjaan('ROW')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  jenisPekerjaan === 'ROW'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Trees className="w-4 h-4 text-emerald-600" />
                <span>ROW (Pangkas)</span>
              </button>

              <button
                type="button"
                onClick={() => setJenisPekerjaan('Inspeksi')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  jenisPekerjaan === 'Inspeksi'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Search className="w-4 h-4 text-blue-600" />
                <span>Inspeksi</span>
              </button>

              <button
                type="button"
                onClick={() => setJenisPekerjaan('Pemeliharaan')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  jenisPekerjaan === 'Pemeliharaan'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm ring-2 ring-amber-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Pemeliharaan</span>
              </button>
            </div>
          </div>

          {/* Row 1: No SPK & Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. SPK / Surat Perintah Kerja <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={noSpk}
                  onChange={(e) => setNoSpk(e.target.value)}
                  placeholder="e.g. SPK/ULP-BGL/2026/08/001"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pelaksanaan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Penyulang & Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penyulang <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={penyulangId}
                  onChange={(e) => handlePenyulangChange(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {penyulangList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.namaPenyulang} ({p.kodeId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Section / Lokasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="section-suggestions"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. GH Asten - LBS Paso"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <datalist id="section-suggestions">
                {filteredSections.map((s) => (
                  <option key={s.id} value={s.namaSection} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 3: Target & Jumlah Personil */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. Pangkas 20 Pohon Trambesi / Inspeksi 15 Tiang / Ganti Isolator 2 Set"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Personil <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={jumlahPersonil}
                  onChange={(e) => setJumlahPersonil(Number(e.target.value))}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Tim / Petugas & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tim Pelaksana / Vendor
              </label>
              <input
                type="text"
                value={timAtauPetugas}
                onChange={(e) => setTimAtauPetugas(e.target.value)}
                placeholder="e.g. Tim Yantek Baguala / Vendor Maintenance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pekerjaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Terencana">Terencana</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Instruksi Khusus
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Instruksi K3, kebutuhan pemadaman / koordinasi penyulang, perizinan, dll..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Footer Modal */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{editItem ? 'Simpan Perubahan' : 'Terbitkan SPK'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
