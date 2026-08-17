import React, { useState, useEffect } from 'react';
import { X, Save, Activity, Calendar, UserCheck, Zap, Shield, HelpCircle } from 'lucide-react';
import { PengukuranGardu, MasterGardu, JurusanData } from '../../types';

interface PengukuranGarduModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: PengukuranGardu) => void;
  editingPengukuran?: PengukuranGardu | null;
  masterGarduList: MasterGardu[];
}

const defaultJurusan = (nama: string): JurusanData => ({
  nama,
  iRTotal: 0,
  iSTotal: 0,
  iTTotal: 0,
  iNTotal: 0,
  vRN: 220,
  vSN: 220,
  vTN: 220,
  vRS: 380,
  vST: 380,
  vRT: 380,
  iPeakR: 0,
  iPeakS: 0,
  iPeakT: 0,
  tpfR: 0.90,
  tpfS: 0.90,
  tpfT: 0.90,
  titikUkur: 'PHB-TR'
});

export const PengukuranGarduModal: React.FC<PengukuranGarduModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPengukuran,
  masterGarduList
}) => {
  const [selectedGarduId, setSelectedGarduId] = useState<string>('');
  const [noGardu, setNoGardu] = useState<string>('');
  const [unit, setUnit] = useState<string>('ULP Baguala');
  const [penyulang, setPenyulang] = useState<string>('PASSO');
  const [dayaKva, setDayaKva] = useState<number>(160);
  const [alamat, setAlamat] = useState<string>('');
  const [tanggalUkur, setTanggalUkur] = useState<string>(new Date().toISOString().split('T')[0]);
  const [petugas, setPetugas] = useState<string>('');

  // Main Trafo Measurements
  const [iRTotal, setIRTotal] = useState<number>(0);
  const [iSTotal, setISTotal] = useState<number>(0);
  const [iTTotal, setITTotal] = useState<number>(0);
  const [iNTotal, setINTotal] = useState<number>(0);
  const [vRN, setVRN] = useState<number>(220);
  const [vSN, setVSN] = useState<number>(220);
  const [vTN, setVTN] = useState<number>(220);
  const [vRS, setVRS] = useState<number>(380);
  const [vST, setVST] = useState<number>(380);
  const [vRT, setVRT] = useState<number>(380);
  const [thdR, setThdR] = useState<number>(2.0);
  const [thdS, setThdS] = useState<number>(2.0);
  const [thdT, setThdT] = useState<number>(2.0);
  const [iPeakR, setIPeakR] = useState<number>(0);
  const [iPeakS, setIPeakS] = useState<number>(0);
  const [iPeakT, setIPeakT] = useState<number>(0);
  const [tpfR, setTpfR] = useState<number>(0.92);
  const [tpfS, setTpfS] = useState<number>(0.92);
  const [tpfT, setTpfT] = useState<number>(0.92);

  // Jurusan 1 s/d 4
  const [jurusan1, setJurusan1] = useState<JurusanData>(defaultJurusan('JURUSAN 1'));
  const [jurusan2, setJurusan2] = useState<JurusanData>(defaultJurusan('JURUSAN 2'));
  const [jurusan3, setJurusan3] = useState<JurusanData>(defaultJurusan('JURUSAN 3'));
  const [jurusan4, setJurusan4] = useState<JurusanData>(defaultJurusan('JURUSAN 4'));

  const [activeJurusanTab, setActiveJurusanTab] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    if (editingPengukuran) {
      setSelectedGarduId(editingPengukuran.garduId || '');
      setNoGardu(editingPengukuran.noGardu);
      setUnit(editingPengukuran.unit || 'ULP Baguala');
      setPenyulang(editingPengukuran.penyulang || 'PASSO');
      setDayaKva(editingPengukuran.dayaKva || 160);
      setAlamat(editingPengukuran.alamat || '');
      setTanggalUkur(editingPengukuran.tanggalUkur);
      setPetugas(editingPengukuran.petugas);

      setIRTotal(editingPengukuran.iRTotal || 0);
      setISTotal(editingPengukuran.iSTotal || 0);
      setITTotal(editingPengukuran.iTTotal || 0);
      setINTotal(editingPengukuran.iNTotal || 0);

      setVRN(editingPengukuran.vRN || 220);
      setVSN(editingPengukuran.vSN || 220);
      setVTN(editingPengukuran.vTN || 220);
      setVRS(editingPengukuran.vRS || 380);
      setVST(editingPengukuran.vST || 380);
      setVRT(editingPengukuran.vRT || 380);

      setThdR(editingPengukuran.thdR || 2.0);
      setThdS(editingPengukuran.thdS || 2.0);
      setThdT(editingPengukuran.thdT || 2.0);

      setIPeakR(editingPengukuran.iPeakR || 0);
      setIPeakS(editingPengukuran.iPeakS || 0);
      setIPeakT(editingPengukuran.iPeakT || 0);

      setTpfR(editingPengukuran.tpfR || 0.92);
      setTpfS(editingPengukuran.tpfS || 0.92);
      setTpfT(editingPengukuran.tpfT || 0.92);

      setJurusan1(editingPengukuran.jurusan1 || defaultJurusan('JURUSAN 1'));
      setJurusan2(editingPengukuran.jurusan2 || defaultJurusan('JURUSAN 2'));
      setJurusan3(editingPengukuran.jurusan3 || defaultJurusan('JURUSAN 3'));
      setJurusan4(editingPengukuran.jurusan4 || defaultJurusan('JURUSAN 4'));
    } else {
      if (masterGarduList.length > 0) {
        const first = masterGarduList[0];
        setSelectedGarduId(first.id);
        setNoGardu(first.noGarduBaru || first.noGarduLama);
        setUnit(first.unit);
        setPenyulang(first.penyulang);
        setDayaKva(first.daya);
        setAlamat(first.alamatGardu);
      }
    }
  }, [editingPengukuran, isOpen, masterGarduList]);

  const handleSelectGarduChange = (garduId: string) => {
    setSelectedGarduId(garduId);
    const g = masterGarduList.find(x => x.id === garduId);
    if (g) {
      setNoGardu(g.noGarduBaru || g.noGarduLama);
      setUnit(g.unit);
      setPenyulang(g.penyulang);
      setDayaKva(g.daya);
      setAlamat(g.alamatGardu);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noGardu) {
      alert('Nomor Gardu tidak boleh kosong');
      return;
    }
    if (!petugas) {
      alert('Petugas pengukur wajib diisi');
      return;
    }

    const pkgData: PengukuranGardu = {
      id: editingPengukuran?.id || `pkg_${Date.now()}`,
      garduId: selectedGarduId,
      noGardu,
      unit,
      penyulang,
      dayaKva,
      alamat,
      tanggalUkur,
      petugas,

      iRTotal: Number(iRTotal),
      iSTotal: Number(iSTotal),
      iTTotal: Number(iTTotal),
      iNTotal: Number(iNTotal),

      vRN: Number(vRN),
      vSN: Number(vSN),
      vTN: Number(vTN),
      vRS: Number(vRS),
      vST: Number(vST),
      vRT: Number(vRT),

      thdR: Number(thdR),
      thdS: Number(thdS),
      thdT: Number(thdT),

      iPeakR: Number(iPeakR),
      iPeakS: Number(iPeakS),
      iPeakT: Number(iPeakT),

      tpfR: Number(tpfR),
      tpfS: Number(tpfS),
      tpfT: Number(tpfT),

      jurusan1,
      jurusan2,
      jurusan3,
      jurusan4,

      createdAt: editingPengukuran?.createdAt || new Date().toISOString()
    };

    onSave(pkgData);
    onClose();
  };

  const updateJurusanField = (jurNum: 1 | 2 | 3 | 4, field: keyof JurusanData, val: any) => {
    const setter = jurNum === 1 ? setJurusan1 : jurNum === 2 ? setJurusan2 : jurNum === 3 ? setJurusan3 : setJurusan4;
    setter(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const currentJurusanData = activeJurusanTab === 1 ? jurusan1 : activeJurusanTab === 2 ? jurusan2 : activeJurusanTab === 3 ? jurusan3 : jurusan4;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400 border border-blue-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {editingPengukuran ? 'Edit Form Pengukuran Gardu' : 'Form Input Pengukuran Gardu & Beban Trafo'}
              </h3>
              <p className="text-xs text-slate-400">
                Input lengkap parameter tegangan (V), arus (I), THD, I-PEAK, TPF Trafo Utama dan Jurusan 1-4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-sans">
          
          {/* Section 1: Data Umum Gardu & Pengukuran */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Informasi Utama Pengukuran</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Select Master Gardu */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pilih Master Gardu
                </label>
                <select
                  value={selectedGarduId}
                  onChange={(e) => handleSelectGarduChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Input Manual / Pilih Gardu --</option>
                  {masterGarduList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.noGarduBaru} ({g.penyulang} - {g.daya} kVA)
                    </option>
                  ))}
                </select>
              </div>

              {/* No Gardu */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Gardu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={noGardu}
                  onChange={(e) => setNoGardu(e.target.value)}
                  placeholder="mis. GD-PSO-004"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tanggal Ukur */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tanggal Ukur <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggalUkur}
                  onChange={(e) => setTanggalUkur(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Petugas */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Petugas Pengukur <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={petugas}
                  onChange={(e) => setPetugas(e.target.value)}
                  placeholder="mis. Bpk. Ahmad & Tim Yantek"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Unit PLN */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Unit PLN
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ULP Baguala">ULP Baguala</option>
                  <option value="PLN Nusa Daya">PLN Nusa Daya</option>
                  <option value="UP3">UP3</option>
                  <option value="UIW">UIW</option>
                  <option value="PLN">PLN</option>
                </select>
              </div>

              {/* Penyulang */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Penyulang
                </label>
                <input
                  type="text"
                  value={penyulang}
                  onChange={(e) => setPenyulang(e.target.value)}
                  placeholder="mis. PASSO"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Daya Trafo (kVA) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Daya Trafo (kVA)
                </label>
                <input
                  type="number"
                  value={dayaKva}
                  onChange={(e) => setDayaKva(Number(e.target.value))}
                  placeholder="160"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Main / Total Trafo Measurements */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Pengukuran Total Trafo Utama</span>
              </h4>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Induk Trafo
              </span>
            </div>

            {/* Arus Total (I) */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-700">Arus Total (Amperes):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-blue-800">I (R TOTAL)</label>
                  <input
                    type="number" step="0.1"
                    value={iRTotal} onChange={(e) => setIRTotal(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-lg border border-blue-200 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-yellow-800">I (S TOTAL)</label>
                  <input
                    type="number" step="0.1"
                    value={iSTotal} onChange={(e) => setISTotal(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-lg border border-blue-200 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-800">I (T TOTAL)</label>
                  <input
                    type="number" step="0.1"
                    value={iTTotal} onChange={(e) => setITTotal(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-lg border border-blue-200 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700">I (N TOTAL)</label>
                  <input
                    type="number" step="0.1"
                    value={iNTotal} onChange={(e) => setINTotal(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-lg border border-blue-200 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Tegangan Phasa - Netral & Phasa - Phasa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[11px] font-bold text-slate-700">Tegangan Phasa - Netral (Volt):</span>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">V (R - N)</label>
                    <input
                      type="number" step="0.1"
                      value={vRN} onChange={(e) => setVRN(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">V (S - N)</label>
                    <input
                      type="number" step="0.1"
                      value={vSN} onChange={(e) => setVSN(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">V (T - N)</label>
                    <input
                      type="number" step="0.1"
                      value={vTN} onChange={(e) => setVTN(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700">Tegangan Phasa - Phasa (Volt):</span>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">V (R - S)</label>
                    <input
                      type="number" step="0.1"
                      value={vRS} onChange={(e) => setVRS(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">V (S - T)</label>
                    <input
                      type="number" step="0.1"
                      value={vST} onChange={(e) => setVST(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">V (R - T)</label>
                    <input
                      type="number" step="0.1"
                      value={vRT} onChange={(e) => setVRT(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* THD, IPEAK, TPF */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {/* THD */}
              <div>
                <span className="text-[11px] font-bold text-slate-700">Harmonisa THD (%):</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">THD-R</label>
                    <input type="number" step="0.1" value={thdR} onChange={(e) => setThdR(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">THD-S</label>
                    <input type="number" step="0.1" value={thdS} onChange={(e) => setThdS(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">THD-T</label>
                    <input type="number" step="0.1" value={thdT} onChange={(e) => setThdT(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                </div>
              </div>

              {/* IPEAK */}
              <div>
                <span className="text-[11px] font-bold text-slate-700">Arus Puncak IPEAK (A):</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">IPEAK-R</label>
                    <input type="number" step="0.1" value={iPeakR} onChange={(e) => setIPeakR(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">IPEAK-S</label>
                    <input type="number" step="0.1" value={iPeakS} onChange={(e) => setIPeakS(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">IPEAK-T</label>
                    <input type="number" step="0.1" value={iPeakT} onChange={(e) => setIPeakT(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                </div>
              </div>

              {/* TPF */}
              <div>
                <span className="text-[11px] font-bold text-slate-700">Faktor Daya TPF (Cos φ):</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">TPF-R</label>
                    <input type="number" step="0.01" value={tpfR} onChange={(e) => setTpfR(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">TPF-S</label>
                    <input type="number" step="0.01" value={tpfS} onChange={(e) => setTpfS(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500">TPF-T</label>
                    <input type="number" step="0.01" value={tpfT} onChange={(e) => setTpfT(Number(e.target.value))} className="w-full px-1.5 py-1 rounded border text-xs bg-white" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Jurusan 1 s/d 4 Tabs */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Parameter Pengukuran Per Jurusan (Outcoming Feeder)
              </h4>

              {/* Jurusan Tabs */}
              <div className="flex items-center gap-1">
                {([1, 2, 3, 4] as const).map((jNum) => (
                  <button
                    key={jNum}
                    type="button"
                    onClick={() => setActiveJurusanTab(jNum)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeJurusanTab === jNum
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Jurusan {jNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Form for Active Jurusan Tab */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama JURUSAN {activeJurusanTab}
                  </label>
                  <input
                    type="text"
                    value={currentJurusanData.nama}
                    onChange={(e) => updateJurusanField(activeJurusanTab, 'nama', e.target.value)}
                    placeholder={`mis. JURUSAN ${activeJurusanTab} (Arah Pasar)`}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    TITIK UKUR JUR {activeJurusanTab}
                  </label>
                  <input
                    type="text"
                    value={currentJurusanData.titikUkur}
                    onChange={(e) => updateJurusanField(activeJurusanTab, 'titikUkur', e.target.value)}
                    placeholder="mis. PHB-TR Rak 1 Jurusan 1"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Arus Jurusan */}
              <div>
                <span className="text-[11px] font-bold text-slate-700">Arus Jurusan {activeJurusanTab} (Amperes):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-700">I (R TOTAL)</label>
                    <input
                      type="number" step="0.1"
                      value={currentJurusanData.iRTotal}
                      onChange={(e) => updateJurusanField(activeJurusanTab, 'iRTotal', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-yellow-700">I (S TOTAL)</label>
                    <input
                      type="number" step="0.1"
                      value={currentJurusanData.iSTotal}
                      onChange={(e) => updateJurusanField(activeJurusanTab, 'iSTotal', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-rose-700">I (T TOTAL)</label>
                    <input
                      type="number" step="0.1"
                      value={currentJurusanData.iTTotal}
                      onChange={(e) => updateJurusanField(activeJurusanTab, 'iTTotal', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">I (N TOTAL)</label>
                    <input
                      type="number" step="0.1"
                      value={currentJurusanData.iNTotal}
                      onChange={(e) => updateJurusanField(activeJurusanTab, 'iNTotal', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tegangan Jurusan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-600">V Phasa - Netral (Volt):</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    <input type="number" step="0.1" placeholder="V R-N" value={currentJurusanData.vRN} onChange={(e) => updateJurusanField(activeJurusanTab, 'vRN', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                    <input type="number" step="0.1" placeholder="V S-N" value={currentJurusanData.vSN} onChange={(e) => updateJurusanField(activeJurusanTab, 'vSN', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                    <input type="number" step="0.1" placeholder="V T-N" value={currentJurusanData.vTN} onChange={(e) => updateJurusanField(activeJurusanTab, 'vTN', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-600">V Phasa - Phasa (Volt):</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    <input type="number" step="0.1" placeholder="V R-S" value={currentJurusanData.vRS} onChange={(e) => updateJurusanField(activeJurusanTab, 'vRS', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                    <input type="number" step="0.1" placeholder="V S-T" value={currentJurusanData.vST} onChange={(e) => updateJurusanField(activeJurusanTab, 'vST', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                    <input type="number" step="0.1" placeholder="V R-T" value={currentJurusanData.vRT} onChange={(e) => updateJurusanField(activeJurusanTab, 'vRT', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                  </div>
                </div>
              </div>

              {/* IPEAK & TPF Jurusan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-600">IPEAK (A):</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    <input type="number" step="0.1" placeholder="IPEAK-R" value={currentJurusanData.iPeakR} onChange={(e) => updateJurusanField(activeJurusanTab, 'iPeakR', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                    <input type="number" step="0.1" placeholder="IPEAK-S" value={currentJurusanData.iPeakS} onChange={(e) => updateJurusanField(activeJurusanTab, 'iPeakS', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                    <input type="number" step="0.1" placeholder="IPEAK-T" value={currentJurusanData.iPeakT} onChange={(e) => updateJurusanField(activeJurusanTab, 'iPeakT', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-600">TPF (Cos φ):</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    <input type="number" step="0.01" placeholder="TPF-R" value={currentJurusanData.tpfR} onChange={(e) => updateJurusanField(activeJurusanTab, 'tpfR', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                    <input type="number" step="0.01" placeholder="TPF-S" value={currentJurusanData.tpfS} onChange={(e) => updateJurusanField(activeJurusanTab, 'tpfS', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                    <input type="number" step="0.01" placeholder="TPF-T" value={currentJurusanData.tpfT} onChange={(e) => updateJurusanField(activeJurusanTab, 'tpfT', Number(e.target.value))} className="px-2 py-1 rounded border text-xs bg-white" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Pengukuran Gardu</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
