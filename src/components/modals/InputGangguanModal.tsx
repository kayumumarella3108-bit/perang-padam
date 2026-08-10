import React, { useState } from 'react';
import { X, Zap, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { GangguanLog, Penyulang, SectionJaringan } from '../../types';

interface InputGangguanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: GangguanLog) => void;
  penyulangList: Penyulang[];
  sectionList: SectionJaringan[];
  editItem?: GangguanLog | null;
  initialPenyulangId?: string;
}

export const InputGangguanModal: React.FC<InputGangguanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  penyulangList,
  sectionList,
  editItem,
  initialPenyulangId
}) => {
  const [tanggal, setTanggal] = useState('2026-08-08');
  const [penyulangId, setPenyulangId] = useState(initialPenyulangId || penyulangList[0]?.id || '17');
  const [section, setSection] = useState('');
  const [jamKeluar, setJamKeluar] = useState('08:00');
  const [jamMasuk, setJamMasuk] = useState('09:30');
  const [relayBekerja, setRelayBekerja] = useState('OCR / GFR / RECLOSER');
  const [arusR, setArusR] = useState(150);
  const [arusS, setArusS] = useState(180);
  const [arusT, setArusT] = useState(160);
  const [arusIN, setArusIN] = useState(320);
  const [penyebab, setPenyebab] = useState('Pohon tumbang / ranting / petir / komponen rusak');
  const [kodeGangguan, setKodeGangguan] = useState('E-3');
  const [detailLokasi, setDetailLokasi] = useState('e.g. Tiang BG-45 s/d BG-52 Jl. Laterhairy');
  const [catatan, setCatatan] = useState('Keterangan tindakan penanganan gangguan...');

  React.useEffect(() => {
    if (editItem) {
      setTanggal(editItem.tanggal || '2026-08-08');
      setPenyulangId(editItem.penyulangId || penyulangList[0]?.id || '17');
      setSection(editItem.section || '');
      setJamKeluar(editItem.jamKeluar || '08:00');
      setJamMasuk(editItem.jamMasuk || '09:30');
      setRelayBekerja(editItem.relayBekerja || 'OCR');
      setArusR(editItem.arusR || 0);
      setArusS(editItem.arusS || 0);
      setArusT(editItem.arusT || 0);
      setArusIN(editItem.arusIN || 0);
      setPenyebab(editItem.penyebab || '');
      setKodeGangguan(editItem.kodeGangguan || 'E-3');
      setDetailLokasi(editItem.detailLokasi || '');
      setCatatan(editItem.catatan || '');
    } else {
      setTanggal('2026-08-08');
      setPenyulangId(initialPenyulangId || penyulangList[0]?.id || '17');
      setSection('');
      setJamKeluar('08:00');
      setJamMasuk('09:30');
      setRelayBekerja('OCR / GFR / RECLOSER');
      setArusR(150);
      setArusS(180);
      setArusT(160);
      setArusIN(320);
      setPenyebab('Pohon tumbang / ranting / petir / komponen rusak');
      setKodeGangguan('E-3');
      setDetailLokasi('e.g. Tiang BG-45 s/d BG-52 Jl. Laterhairy');
      setCatatan('Keterangan tindakan penanganan gangguan...');
    }
  }, [editItem, isOpen, initialPenyulangId]);

  if (!isOpen) return null;

  // Calculate duration automatically
  const calculateDuration = () => {
    try {
      const [hOut, mOut] = jamKeluar.split(':').map(Number);
      const [hIn, mIn] = jamMasuk.split(':').map(Number);
      let diffMinutes = (hIn * 60 + mIn) - (hOut * 60 + mOut);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}j ${mins}m`;
    } catch {
      return '1j 30m';
    }
  };

  const durasiCalculated = calculateDuration();

  const selectedPenyulang = penyulangList.find((p) => p.id === penyulangId);
  const availableSections = sectionList.filter((s) => s.penyulangId === penyulangId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPenyulang) return;

    const newLog: GangguanLog = {
      id: editItem ? editItem.id : `g_${Date.now()}`,
      tanggal,
      penyulangId,
      namaPenyulang: selectedPenyulang.namaPenyulang,
      section: section || selectedPenyulang.sectionTerlama || 'GH Asten - Ujung Jaringan',
      jamKeluar,
      jamMasuk,
      durasi: durasiCalculated,
      relayBekerja,
      arusR: Number(arusR) || 0,
      arusS: Number(arusS) || 0,
      arusT: Number(arusT) || 0,
      arusIN: Number(arusIN) || 0,
      penyebab,
      kodeGangguan,
      detailLokasi,
      catatan
    };

    onSave(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-12 bg-slate-950/70 backdrop-blur-md font-sans overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
              <Zap className="w-5 h-5 fill-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Input Gangguan Penyulang
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ekosistem gangguan trip & pemadaman penyulang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Tanggal Gangguan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tanggal Gangguan *
            </label>
            <div className="relative">
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Nama Penyulang */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Penyulang (Master Data) *
            </label>
            <select
              value={penyulangId}
              onChange={(e) => {
                setPenyulangId(e.target.value);
                setSection('');
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
            >
              {penyulangList.map((p) => (
                <option key={p.id} value={p.id} className="bg-white">
                  {p.namaPenyulang} ({p.namaGi})
                </option>
              ))}
            </select>
          </div>

          {/* Section Jaringan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Section Jaringan (Master Data)
            </label>
            {availableSections.length > 0 ? (
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer mb-2"
              >
                <option value="" className="bg-white">-- Pilih Section --</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.namaSection} className="bg-white">
                    {s.namaSection}
                  </option>
                ))}
              </select>
            ) : null}
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Atau ketik nama section..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Jam Keluar, Jam Masuk, Durasi */}
          <div className="grid grid-cols-3 gap-2 items-end">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jam Keluar</label>
              <input
                type="time"
                value={jamKeluar}
                onChange={(e) => setJamKeluar(e.target.value)}
                required
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jam Masuk</label>
              <input
                type="time"
                value={jamMasuk}
                onChange={(e) => setJamMasuk(e.target.value)}
                required
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-center text-xs">
              <span className="text-[10px] text-emerald-600 block font-normal">Durasi Auto</span>
              {durasiCalculated}
            </div>
          </div>

          {/* Relay Bekerja */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Relay Bekerja</label>
            <input
              type="text"
              value={relayBekerja}
              onChange={(e) => setRelayBekerja(e.target.value)}
              placeholder="OCR / GFR / RECLOSER"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Arus RST & IN */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Relay Arus R S T</label>
              <span className="text-[10px] text-blue-600 font-semibold">Satuan: Ampere (A)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={arusR}
                onChange={(e) => setArusR(Number(e.target.value))}
                placeholder="Arus R (A)"
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <input
                type="number"
                value={arusS}
                onChange={(e) => setArusS(Number(e.target.value))}
                placeholder="Arus S (A)"
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <input
                type="number"
                value={arusT}
                onChange={(e) => setArusT(Number(e.target.value))}
                placeholder="Arus T (A)"
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Arus IN */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Arus IN (A)</label>
            <input
              type="number"
              value={arusIN}
              onChange={(e) => setArusIN(Number(e.target.value))}
              placeholder="Arus IN (Bisa 0)"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Penyebab Gangguan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Penyebab Gangguan</label>
            <input
              type="text"
              value={penyebab}
              onChange={(e) => setPenyebab(e.target.value)}
              placeholder="Pohon rimbun / hewan / petir / komponen rusak"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Kode Gangguan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kode Gangguan</label>
            <select
              value={kodeGangguan}
              onChange={(e) => setKodeGangguan(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
            >
              <optgroup label="Internal (I)">
                <option value="I-1" className="bg-white">I-1 (Komponen JTM)</option>
                <option value="I-2" className="bg-white">I-2 (Peralatan JTM)</option>
                <option value="I-3" className="bg-white">I-3 (Trafo dan Lainnya)</option>
                <option value="I-4" className="bg-white">I-4 (Tiang)</option>
              </optgroup>
              <optgroup label="Eksternal (E)">
                <option value="E-1" className="bg-white">E-1 (Pohon)</option>
                <option value="E-2" className="bg-white">E-2 (Bencana Alam)</option>
                <option value="E-3" className="bg-white">E-3 (Pekerjaan Pihak III / Binatang)</option>
                <option value="E-4" className="bg-white">E-4 (Layang-layang / Umbul-umbul, DLL)</option>
                <option value="E-5" className="bg-white">Tidak Ditemukan</option>
              </optgroup>
            </select>
          </div>

          {/* Detail Lokasi Gangguan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Detail Lokasi Gangguan</label>
            <input
              type="text"
              value={detailLokasi}
              onChange={(e) => setDetailLokasi(e.target.value)}
              placeholder="e.g. Tiang BG-45 s/d BG-52 Jl. Laterhairy"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan / Keterangan</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Keterangan tindakan penanganan gangguan..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 shrink-0">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-sm shadow-blue-500/30 transition-all cursor-pointer"
            >
              Simpan Data Gangguan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
