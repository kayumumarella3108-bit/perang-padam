import React, { useState, useEffect } from 'react';
import { X, Zap, Calendar, Clock, AlertTriangle, Users, Calculator } from 'lucide-react';
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

  // SAIDI SAIFI estimation inputs
  const [jumlahPelangganPadam, setJumlahPelangganPadam] = useState<number>(2450);
  const [totalPelangganUlp, setTotalPelangganUlp] = useState<number>(48524);

  // Derive master data calculations
  const selectedPenyulang = penyulangList.find((p) => p.id === penyulangId);
  const availableSections = sectionList.filter((s) => s.penyulangId === penyulangId || s.namaPenyulang?.toLowerCase() === selectedPenyulang?.namaPenyulang?.toLowerCase());

  // Calculate total customers for current feeder from section master data
  const feederSectionsCustomerSum = availableSections.reduce(
    (sum, sec) => sum + (sec.jumlahPelanggan || 0),
    0
  );
  const feederTotalCustomers =
    selectedPenyulang?.jumlahPelanggan && selectedPenyulang.jumlahPelanggan > 0
      ? selectedPenyulang.jumlahPelanggan
      : feederSectionsCustomerSum > 0
      ? feederSectionsCustomerSum
      : 9800;

  // Calculate total ULP customers from all sections across all feeders in Master Data
  const masterDataTotalUlp = sectionList.reduce(
    (sum, sec) => sum + (sec.jumlahPelanggan || 0),
    0
  );
  const safeMasterUlp = masterDataTotalUlp > 0 ? masterDataTotalUlp : 48524;

  useEffect(() => {
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
      setJumlahPelangganPadam(editItem.jumlahPelangganPadam || feederTotalCustomers);
      setTotalPelangganUlp(editItem.totalPelangganUlp || safeMasterUlp);
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
      setTotalPelangganUlp(safeMasterUlp);
    }
  }, [editItem, isOpen, initialPenyulangId]);

  // Sync customer count dynamically when Penyulang or Section changes
  useEffect(() => {
    if (!isOpen) return;

    if (section && section.trim() !== '') {
      const matchedSec = availableSections.find(
        (s) => s.namaSection.toLowerCase() === section.toLowerCase()
      );
      if (matchedSec && matchedSec.jumlahPelanggan) {
        setJumlahPelangganPadam(matchedSec.jumlahPelanggan);
      } else {
        // Fallback or user custom section
      }
    } else {
      // If section is blank or Pangkal / Whole feeder selected -> default to feeder total
      setJumlahPelangganPadam(feederTotalCustomers);
    }
  }, [section, penyulangId, isOpen, feederTotalCustomers]);

  if (!isOpen) return null;

  // Calculate duration in minutes and format string
  const calculateDurationMinutes = (): number => {
    try {
      const [hOut, mOut] = jamKeluar.split(':').map(Number);
      const [hIn, mIn] = jamMasuk.split(':').map(Number);
      let diffMinutes = (hIn * 60 + mIn) - (hOut * 60 + mOut);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      return diffMinutes;
    } catch {
      return 90;
    }
  };

  const durasiMenit = calculateDurationMinutes();
  const durasiHours = durasiMenit / 60;
  const durasiCalculated = `${Math.floor(durasiMenit / 60)}j ${durasiMenit % 60}m`;

  // Calculate SAIDI and SAIFI estimates for this event
  const safeTotalUlp = totalPelangganUlp > 0 ? totalPelangganUlp : 48500;
  const estimasiSaifi = jumlahPelangganPadam / safeTotalUlp; // Kali / Plg
  const estimasiSaidiMenit = (jumlahPelangganPadam * durasiMenit) / safeTotalUlp; // Menit / Plg
  const estimasiSaidiJam = estimasiSaidiMenit / 60; // Jam / Plg

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
      catatan,
      // SAIDI SAIFI calculation values
      jumlahPelangganPadam: Number(jumlahPelangganPadam) || 0,
      totalPelangganUlp: Number(safeTotalUlp),
      estimasiSaidiMenit: Number(estimasiSaidiMenit.toFixed(4)),
      estimasiSaidiJam: Number(estimasiSaidiJam.toFixed(5)),
      estimasiSaifi: Number(estimasiSaifi.toFixed(5))
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
                Ekosistem gangguan trip & kalkulasi estimasi SAIDI SAIFI section
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
              Section Jaringan Padam (Master Data)
            </label>
            {availableSections.length > 0 ? (
              <select
                value={section}
                onChange={(e) => {
                  const secVal = e.target.value;
                  setSection(secVal);
                  const matched = availableSections.find((s) => s.namaSection === secVal);
                  if (matched && matched.jumlahPelanggan) {
                    setJumlahPelangganPadam(matched.jumlahPelanggan);
                  }
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer mb-2"
              >
                <option value="" className="bg-white">-- Pilih Section --</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.namaSection} className="bg-white">
                    {s.namaSection} ({s.jumlahPelanggan?.toLocaleString('id-ID') || 0} Plg)
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
              <span className="text-[10px] text-emerald-600 block font-normal">Durasi Padam</span>
              {durasiCalculated} ({durasiMenit}m)
            </div>
          </div>

          {/* SAIDI SAIFI ESTIMATION CALCULATION CARD */}
          <div className="p-3.5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl border border-blue-800/50 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-blue-800/60 pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs text-blue-200 uppercase tracking-wider">
                  Kalkulasi Estimasi SAIDI & SAIFI Event
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
                Tersinkron Master Data
              </span>
            </div>

            {/* Master Data Sync Summary Bar */}
            <div className="p-2 bg-blue-900/40 rounded-xl border border-blue-800/40 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-blue-200">
                <span>Penyulang <strong>{selectedPenyulang?.namaPenyulang || 'Terpilih'}</strong> ({availableSections.length} Section):</span>
                <span className="font-bold text-amber-300 font-mono">{feederTotalCustomers.toLocaleString('id-ID')} Plg</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Pelanggan ULP (Akumulasi Master Data):</span>
                <span className="font-bold text-emerald-300 font-mono">{safeMasterUlp.toLocaleString('id-ID')} Plg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-300">
                    Pelanggan Padam:
                  </label>
                  <button
                    type="button"
                    onClick={() => setJumlahPelangganPadam(feederTotalCustomers)}
                    className="text-[9px] text-blue-300 hover:text-white underline cursor-pointer"
                    title="Gunakan total pelanggan seluruh penyulang jika Trip Pangkal"
                  >
                    1 Feeder Full ({feederTotalCustomers.toLocaleString('id-ID')})
                  </button>
                </div>
                <input
                  type="number"
                  value={jumlahPelangganPadam}
                  onChange={(e) => setJumlahPelangganPadam(Number(e.target.value))}
                  min={1}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-300">
                    Total Pelanggan ULP:
                  </label>
                  <button
                    type="button"
                    onClick={() => setTotalPelangganUlp(safeMasterUlp)}
                    className="text-[9px] text-emerald-300 hover:text-white underline cursor-pointer"
                    title="Reset ke total ULP dari Master Data"
                  >
                    Sync ULP ({safeMasterUlp.toLocaleString('id-ID')})
                  </button>
                </div>
                <input
                  type="number"
                  value={totalPelangganUlp}
                  onChange={(e) => setTotalPelangganUlp(Number(e.target.value))}
                  min={1}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Calculated Badges */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-blue-900/50 border border-blue-700/50">
                <span className="text-[10px] text-blue-300 uppercase font-semibold block">ESTIMASI SAIDI EVENT</span>
                <div className="text-sm font-extrabold text-blue-300 mt-0.5">
                  {estimasiSaidiMenit.toFixed(3)} <span className="text-[10px] font-normal">Menit/Plg</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">({estimasiSaidiJam.toFixed(4)} Jam/Plg)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-900/50 border border-purple-700/50">
                <span className="text-[10px] text-purple-300 uppercase font-semibold block">ESTIMASI SAIFI EVENT</span>
                <div className="text-sm font-extrabold text-purple-300 mt-0.5">
                  {estimasiSaifi.toFixed(4)} <span className="text-[10px] font-normal">Kali/Plg</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">({jumlahPelangganPadam.toLocaleString('id-ID')} / {safeTotalUlp.toLocaleString('id-ID')})</span>
              </div>
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
              Simpan Data Gangguan & Estimasi SAIDI SAIFI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
