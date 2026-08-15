import React, { useState, useEffect, useMemo } from 'react';
import { X, Zap, Calendar, Clock, AlertTriangle, Users, Calculator, ListFilter, Camera, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
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

// Standard PLN Cause options categorized by Fault Code (Kode Gangguan)
const STANDARD_PENYEBAB_MAP: Record<string, string[]> = {
  'E-1': [
    'Pohon Tumbang Menimpa SUTM',
    'Dahan / Ranting Pohon Sentuh Jaringan SUTM',
    'Daun / Dahan Pelepah Kelapa Menimpa Kawat',
    'Pohon Bambu Roboh Mengenai SUTM'
  ],
  'E-2': [
    'Sambaran Petir / Overvoltage Atmosferik',
    'Bencana Alam Tanah Longsor / Banjir Bandang',
    'Angin Kencang / Hujan Deras'
  ],
  'E-3': [
    'Burung Hinggap / Tersangkut di Jaringan SUTM',
    'Kelelawar / Tikus / Ular Naik di Trafo / Tiang',
    'Pekerjaan Pihak Ketiga (Alat Berat / Galian)',
    'Kendaraan Menabrak Tiang Listrik'
  ],
  'E-4': [
    'Tali / Benang Layangan Kawat Menyangkut di JTM',
    'Umbul-umbul / Spanduk / Baliho Terbang Menempel SUTM',
    'Atap Seng / Plastik Terbang Menempel SUTM'
  ],
  'E-5': [
    'Tidak Ditemukan (Gangguan Sesaat / Transient Fault)',
    'Penelusuran Jalur Selesai - Hasil Nihil / Normal Kembali'
  ],
  'I-1': [
    'Isolator Tumpu / Tarik Flashover / Retak',
    'Arrester Bocor / Megger Rendah / Peledakan',
    'Jumperan Putus / Joint Panas / Connector Slack',
    'Fuse Cut Out (FCO) Peledakan / CO Element Putus',
    'Kabel SKTM / SUTM Terkelupas / Short Circuit'
  ],
  'I-2': [
    'Peralatan LBS / Recloser Fails / Trip Mekanis',
    'Cubicle / Switchgear GI / GH Merekah',
    'Relay Proteksi OCR / GFR Malfungsi',
    'CT / PT Rusak / Terbakar'
  ],
  'I-3': [
    'Trafo Distribusi Kerusakan Enclosure / Minyak Merembes',
    'Trafo Distribusi Overload / Beda Fasa',
    'Bushing Trafo Flashover'
  ],
  'I-4': [
    'Tiang Miring / Retak / Roboh Terkikis',
    'Crossarm Bengkok / Korosi Berat'
  ]
};

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
  const [arusR, setArusR] = useState<number | string>(150);
  const [satuanR, setSatuanR] = useState<'A' | 'kA'>('A');

  const [arusS, setArusS] = useState<number | string>(180);
  const [satuanS, setSatuanS] = useState<'A' | 'kA'>('A');

  const [arusT, setArusT] = useState<number | string>(160);
  const [satuanT, setSatuanT] = useState<'A' | 'kA'>('A');

  const [arusIN, setArusIN] = useState<number | string>(320);
  const [satuanIN, setSatuanIN] = useState<'A' | 'kA'>('A');

  const [penyebab, setPenyebab] = useState('Pohon tumbang / ranting / petir / komponen rusak');
  const [kodeGangguan, setKodeGangguan] = useState('E-3');
  const [detailLokasi, setDetailLokasi] = useState('e.g. Tiang BG-45 s/d BG-52 Jl. Laterhairy');
  const [catatan, setCatatan] = useState('Keterangan tindakan penanganan gangguan...');
  const [fotoPenyebab, setFotoPenyebab] = useState<string>('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/i)) {
        alert('Format file tidak didukung. Harap pilih foto berformat .JPG, .JPEG, atau .PNG');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFotoPenyebab(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // SAIDI SAIFI estimation inputs
  const [jumlahPelangganPadam, setJumlahPelangganPadam] = useState<number>(2450);
  const [totalPelangganUlp, setTotalPelangganUlp] = useState<number>(48524);

  // Derive master data calculations
  const selectedPenyulang = penyulangList.find((p) => p.id === penyulangId);
  const availableSections = sectionList.filter((s) => s.penyulangId === penyulangId || s.namaPenyulang?.toLowerCase() === selectedPenyulang?.namaPenyulang?.toLowerCase());

  // Calculate total customers for current feeder from section or feeder master data
  const feederSectionsCustomerSum = availableSections.reduce(
    (sum, sec) => sum + (sec.jumlahPelanggan || 0),
    0
  );
  const feederTotalCustomers =
    selectedPenyulang?.jumlahPelanggan && selectedPenyulang.jumlahPelanggan > 0
      ? selectedPenyulang.jumlahPelanggan
      : feederSectionsCustomerSum;

  // Calculate total ULP customers from all penyulangs and sections in Master Data
  const masterDataTotalUlp = useMemo(() => {
    const sumFromPenyulangs = penyulangList.reduce((acc, p) => {
      const fSections = sectionList.filter(
        (s) => s.penyulangId === p.id || s.namaPenyulang?.toLowerCase() === p.namaPenyulang?.toLowerCase()
      );
      const sumSec = fSections.reduce((sAcc, s) => sAcc + (s.jumlahPelanggan || 0), 0);
      const pPlg = p.jumlahPelanggan && p.jumlahPelanggan > 0 ? p.jumlahPelanggan : sumSec;
      return acc + pPlg;
    }, 0);

    if (sumFromPenyulangs > 0) return sumFromPenyulangs;

    const sumFromSections = sectionList.reduce(
      (sum, sec) => sum + (sec.jumlahPelanggan || 0),
      0
    );
    return sumFromSections > 0 ? sumFromSections : 91740;
  }, [penyulangList, sectionList]);

  const safeMasterUlp = masterDataTotalUlp;

  useEffect(() => {
    if (editItem) {
      setTanggal(editItem.tanggal || '2026-08-08');
      setPenyulangId(editItem.penyulangId || penyulangList[0]?.id || '17');
      setSection(editItem.section || '');
      setJamKeluar(editItem.jamKeluar || '08:00');
      setJamMasuk(editItem.jamMasuk || '09:30');
      setRelayBekerja(editItem.relayBekerja || 'OCR');

      const valR = editItem.arusR || 0;
      if (valR > 0 && valR < 50) {
        setArusR(valR);
        setSatuanR('kA');
      } else {
        setArusR(valR);
        setSatuanR('A');
      }

      const valS = editItem.arusS || 0;
      if (valS > 0 && valS < 50) {
        setArusS(valS);
        setSatuanS('kA');
      } else {
        setArusS(valS);
        setSatuanS('A');
      }

      const valT = editItem.arusT || 0;
      if (valT > 0 && valT < 50) {
        setArusT(valT);
        setSatuanT('kA');
      } else {
        setArusT(valT);
        setSatuanT('A');
      }

      const valIN = editItem.arusIN || 0;
      if (valIN > 0 && valIN < 50) {
        setArusIN(valIN);
        setSatuanIN('kA');
      } else {
        setArusIN(valIN);
        setSatuanIN('A');
      }

      setPenyebab(editItem.penyebab || '');
      setKodeGangguan(editItem.kodeGangguan || 'E-3');
      setDetailLokasi(editItem.detailLokasi || '');
      setCatatan(editItem.catatan || '');
      setFotoPenyebab(editItem.fotoPenyebab || '');
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
      setSatuanR('A');
      setArusS(180);
      setSatuanS('A');
      setArusT(160);
      setSatuanT('A');
      setArusIN(320);
      setSatuanIN('A');
      setPenyebab('Pohon tumbang / ranting / petir / komponen rusak');
      setKodeGangguan('E-3');
      setDetailLokasi('e.g. Tiang BG-45 s/d BG-52 Jl. Laterhairy');
      setCatatan('Keterangan tindakan penanganan gangguan...');
      setFotoPenyebab('');
      setTotalPelangganUlp(safeMasterUlp);
    }
  }, [editItem, isOpen, initialPenyulangId]);

  const isSectionFromGi = (sectionStr: string): boolean => {
    if (!sectionStr) return false;
    const s = String(sectionStr).trim().toUpperCase();
    return (
      s.startsWith('GI') ||
      s.startsWith('GIS') ||
      s.startsWith('G.I') ||
      s.startsWith('PMT') ||
      s.startsWith('GARDU INDUK') ||
      /\bGI\b/.test(s) ||
      /\bGIS\b/.test(s)
    );
  };

  const parseArusValue = (val: string | number): number => {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const cleaned = String(val).replace(',', '.').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleSatuanChange = (
    newUnit: 'A' | 'kA',
    currentUnit: 'A' | 'kA',
    currentVal: string | number,
    setVal: (val: string | number) => void,
    setUnit: (unit: 'A' | 'kA') => void
  ) => {
    if (newUnit === currentUnit) return;
    setUnit(newUnit);
    const num = parseArusValue(currentVal);
    if (num > 0) {
      if (newUnit === 'kA' && currentUnit === 'A') {
        const converted = Number((num / 1000).toFixed(3));
        setVal(converted);
      } else if (newUnit === 'A' && currentUnit === 'kA') {
        const converted = Number((num * 1000).toFixed(1));
        setVal(converted);
      }
    }
  };

  // Sync customer count dynamically when Penyulang or Section changes
  useEffect(() => {
    if (!isOpen) return;

    if (section && section.trim() !== '') {
      const matchedSec = availableSections.find(
        (s) => s.namaSection && section && s.namaSection.toLowerCase() === section.toLowerCase()
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

    const valR = parseArusValue(arusR);
    const valS = parseArusValue(arusS);
    const valT = parseArusValue(arusT);
    const valIN = parseArusValue(arusIN);

    const calculatedArusR = satuanR === 'kA' ? valR * 1000 : valR;
    const calculatedArusS = satuanS === 'kA' ? valS * 1000 : valS;
    const calculatedArusT = satuanT === 'kA' ? valT * 1000 : valT;
    const calculatedArusIN = satuanIN === 'kA' ? valIN * 1000 : valIN;

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
      arusR: calculatedArusR || 0,
      arusS: calculatedArusS || 0,
      arusT: calculatedArusT || 0,
      arusIN: calculatedArusIN || 0,
      penyebab,
      kodeGangguan,
      detailLokasi,
      catatan,
      fotoPenyebab: fotoPenyebab || undefined,
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
            {section && isSectionFromGi(section) && (
              <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200/80 rounded-lg text-blue-700 text-[10px] font-extrabold">
                <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Section berasal dari GI (Otomatis masuk Kategori Trip Pangkal)</span>
              </div>
            )}
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">Relay Bekerja *</label>
              <span className="text-[10px] text-blue-600 font-semibold">Klik Pilihan Preset Relay</span>
            </div>

            {/* Clickable Preset Relay Chips */}
            <div className="flex flex-wrap gap-1.5 pb-0.5">
              {['OCR', 'GFR', 'RECLOSER', 'UFR', 'REF', 'SSO'].map((relay) => {
                const isSelected = (relayBekerja || '')
                  .toUpperCase()
                  .split('/')
                  .map((s) => s.trim())
                  .includes(relay);
                return (
                  <button
                    key={relay}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        const parts = (relayBekerja || '')
                          .split('/')
                          .map((p) => p.trim())
                          .filter((p) => p && p.toUpperCase() !== relay);
                        setRelayBekerja(parts.join(' / '));
                      } else {
                        const parts = (relayBekerja || '')
                          .split('/')
                          .map((p) => p.trim())
                          .filter(Boolean);
                        if (!parts.includes(relay)) {
                          parts.push(relay);
                        }
                        setRelayBekerja(parts.join(' / '));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{relay}
                  </button>
                );
              })}

              {/* Combo Preset Options */}
              {['OCR / GFR', 'OCR / GFR / RECLOSER'].map((combo) => {
                const isMatch = (relayBekerja || '').trim().toUpperCase() === combo.toUpperCase();
                return (
                  <button
                    key={combo}
                    type="button"
                    onClick={() => setRelayBekerja(combo)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      isMatch
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {combo}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={relayBekerja}
              onChange={(e) => setRelayBekerja(e.target.value)}
              placeholder="OCR / GFR / RECLOSER / UFR..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Arus RST & IN with Unit Choice (A / kA) per Column */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Relay Arus R S T *</label>
                <span className="text-[10px] text-blue-600 font-semibold">Pilih Satuan (A / kA) per Kolom</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* Phase R */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Fasa R</label>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={arusR}
                      onChange={(e) => setArusR(e.target.value)}
                      placeholder="Arus R"
                      className="w-full px-2 py-2 bg-transparent text-xs text-slate-800 font-medium focus:outline-none min-w-0"
                    />
                    <select
                      value={satuanR}
                      onChange={(e) => handleSatuanChange(e.target.value as 'A' | 'kA', satuanR, arusR, setArusR, setSatuanR)}
                      className="px-1.5 py-2 bg-slate-200/80 border-l border-slate-200 text-[11px] font-extrabold text-slate-800 cursor-pointer focus:outline-none hover:bg-slate-300 shrink-0"
                    >
                      <option value="A">A</option>
                      <option value="kA">kA</option>
                    </select>
                  </div>
                </div>

                {/* Phase S */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Fasa S</label>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={arusS}
                      onChange={(e) => setArusS(e.target.value)}
                      placeholder="Arus S"
                      className="w-full px-2 py-2 bg-transparent text-xs text-slate-800 font-medium focus:outline-none min-w-0"
                    />
                    <select
                      value={satuanS}
                      onChange={(e) => handleSatuanChange(e.target.value as 'A' | 'kA', satuanS, arusS, setArusS, setSatuanS)}
                      className="px-1.5 py-2 bg-slate-200/80 border-l border-slate-200 text-[11px] font-extrabold text-slate-800 cursor-pointer focus:outline-none hover:bg-slate-300 shrink-0"
                    >
                      <option value="A">A</option>
                      <option value="kA">kA</option>
                    </select>
                  </div>
                </div>

                {/* Phase T */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Fasa T</label>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={arusT}
                      onChange={(e) => setArusT(e.target.value)}
                      placeholder="Arus T"
                      className="w-full px-2 py-2 bg-transparent text-xs text-slate-800 font-medium focus:outline-none min-w-0"
                    />
                    <select
                      value={satuanT}
                      onChange={(e) => handleSatuanChange(e.target.value as 'A' | 'kA', satuanT, arusT, setArusT, setSatuanT)}
                      className="px-1.5 py-2 bg-slate-200/80 border-l border-slate-200 text-[11px] font-extrabold text-slate-800 cursor-pointer focus:outline-none hover:bg-slate-300 shrink-0"
                    >
                      <option value="A">A</option>
                      <option value="kA">kA</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Arus IN */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] font-bold text-slate-500">Arus Neutral / IN</label>
                <span className="text-[10px] text-slate-400 font-medium">Bisa 0 jika tidak ada arus netral</span>
              </div>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <input
                  type="text"
                  inputMode="decimal"
                  value={arusIN}
                  onChange={(e) => setArusIN(e.target.value)}
                  placeholder="Arus Neutral IN"
                  className="w-full px-3 py-2.5 bg-transparent text-xs text-slate-800 font-medium focus:outline-none min-w-0"
                />
                <select
                  value={satuanIN}
                  onChange={(e) => handleSatuanChange(e.target.value as 'A' | 'kA', satuanIN, arusIN, setArusIN, setSatuanIN)}
                  className="px-2.5 py-2.5 bg-slate-200/80 border-l border-slate-200 text-[11px] font-extrabold text-slate-800 cursor-pointer focus:outline-none hover:bg-slate-300 shrink-0"
                >
                  <option value="A">A (Ampere)</option>
                  <option value="kA">kA (Kiloampere)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kode Gangguan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kode Gangguan (PLN Standard) *</label>
            <select
              value={kodeGangguan}
              onChange={(e) => {
                const newCode = e.target.value;
                setKodeGangguan(newCode);
                // Auto suggest first cause option if current cause is empty or default
                const options = STANDARD_PENYEBAB_MAP[newCode];
                if (options && options.length > 0 && (!penyebab || penyebab.startsWith('Pohon') || penyebab.startsWith('Tidak Ditemukan'))) {
                  setPenyebab(options[0]);
                }
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
            >
              <optgroup label="Eksternal (E)">
                <option value="E-1" className="bg-white">E-1 (Pohon / Ranting / Dahan)</option>
                <option value="E-2" className="bg-white">E-2 (Bencana Alam / Petir / Hujan Deras)</option>
                <option value="E-3" className="bg-white">E-3 (Pekerjaan Pihak III / Binatang / Kendaraan)</option>
                <option value="E-4" className="bg-white">E-4 (Layang-layang / Umbul-umbul / Baliho)</option>
                <option value="E-5" className="bg-white">Tidak Ditemukan</option>
              </optgroup>
              <optgroup label="Internal (I)">
                <option value="I-1" className="bg-white">I-1 (Komponen JTM / Isolator / Arrester)</option>
                <option value="I-2" className="bg-white">I-2 (Peralatan JTM / LBS / Recloser / Relay)</option>
                <option value="I-3" className="bg-white">I-3 (Trafo Distribusi & Bushing)</option>
                <option value="I-4" className="bg-white">I-4 (Tiang / Crossarm)</option>
              </optgroup>
            </select>
          </div>

          {/* Penyebab Gangguan dengan Pilihan Dropdown Preset + Custom */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Penyebab Gangguan *</label>
              <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                <ListFilter className="w-3 h-3" /> Pilihan Standard & Custom
              </span>
            </div>

            {/* Dropdown Preset Options */}
            <select
              value={
                STANDARD_PENYEBAB_MAP[kodeGangguan]?.includes(penyebab)
                  ? penyebab
                  : 'custom'
              }
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  setPenyebab(e.target.value);
                }
              }}
              className="w-full px-3 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 mb-2 cursor-pointer"
            >
              <option value="" disabled>-- Pilih Preset Penyebab Gangguan --</option>
              {(STANDARD_PENYEBAB_MAP[kodeGangguan] || []).map((opt) => (
                <option key={opt} value={opt} className="bg-white">
                  {opt}
                </option>
              ))}
              <option value="custom" className="bg-white text-blue-700 font-bold">
                + Ketik / Edit Penyebab Manual...
              </option>
            </select>

            {/* Custom Input Field */}
            <input
              type="text"
              value={penyebab}
              onChange={(e) => setPenyebab(e.target.value)}
              placeholder="Detail penyebab gangguan..."
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
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

          {/* Foto Dokumentasi Penyebab Gangguan (JPG / JPEG / PNG) */}
          <div className="space-y-1.5 p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Foto Dokumentasi Penyebab Gangguan</span>
              </label>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                JPG / JPEG / PNG
              </span>
            </div>

            {fotoPenyebab ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-900 flex flex-col items-center">
                <img
                  src={fotoPenyebab}
                  alt="Dokumentasi Penyebab Gangguan"
                  className="w-full max-h-48 object-contain bg-slate-950"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <label className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-md flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ganti</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setFotoPenyebab('')}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-md flex items-center gap-1"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-xl bg-white hover:bg-blue-50/50 transition-colors cursor-pointer text-center group">
                <div className="p-2.5 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Upload Foto Dokumentasi Penyebab
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Klik untuk memilih file foto (Format JPG, JPEG, PNG • Maks 5MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
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
