import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Upload,
  Download,
  Power,
  Zap,
  Activity,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Building2,
  Layers,
  ArrowRightLeft,
  Search,
  FileJson,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';

export type SubstationType = 'GI' | 'GH';

export interface FeederData {
  id: string;
  namaFeeder: string;
  panjangKms: number;
  saklarTipe: string;
  saklarNama: string;
  status: 'CLOSED' | 'OPEN';
  arusR: number;
  arusS: number;
  arusT: number;
  arusIN: number;
  bebanMw: number;
  warna: string;
}

export interface SubstationData {
  id: string;
  nama: string;
  tipe: SubstationType;
  deskripsiBusbar: string;
  teganganKv: number;
  frekuensiHz: number;
  feeders: FeederData[];
}

export interface TieSwitchData {
  id: string;
  nama: string;
  substationAId: string;
  feederAId: string;
  substationBId: string;
  feederBId: string;
  deskripsi: string;
  status: 'CLOSED' | 'OPEN';
}

const INITIAL_SUBSTATIONS: SubstationData[] = [
  {
    id: 'gi-passo',
    nama: 'GI PASSO',
    tipe: 'GI',
    deskripsiBusbar: 'BUSBAR 20KV GI PASSO (TRAFO 1 & TRAFO 2)',
    teganganKv: 20.2,
    frekuensiHz: 50.0,
    feeders: [
      {
        id: 'f-passo-utama',
        namaFeeder: 'PASSO UTAMA',
        panjangKms: 12.8,
        saklarTipe: 'PMT CB Outgoing',
        saklarNama: 'PMT 10',
        status: 'CLOSED',
        arusR: 145,
        arusS: 148,
        arusT: 142,
        arusIN: 5,
        bebanMw: 4.8,
        warna: '#10b981'
      },
      {
        id: 'f-waiheru-1',
        namaFeeder: 'WAIHERU 1',
        panjangKms: 9.5,
        saklarTipe: 'LBS Section',
        saklarNama: 'LBS Waiheru',
        status: 'CLOSED',
        arusR: 98,
        arusS: 102,
        arusT: 95,
        arusIN: 3,
        bebanMw: 3.2,
        warna: '#0284c7'
      },
      {
        id: 'f-rec-pohon',
        namaFeeder: 'REC POHON',
        panjangKms: 15.2,
        saklarTipe: 'Recloser Smart',
        saklarNama: 'REC POHON',
        status: 'CLOSED',
        arusR: 210,
        arusS: 205,
        arusT: 215,
        arusIN: 8,
        bebanMw: 6.9,
        warna: '#f59e0b'
      },
      {
        id: 'f-tulehu-utama',
        namaFeeder: 'TULEHU UTAMA',
        panjangKms: 18.4,
        saklarTipe: 'PMT CB Outgoing',
        saklarNama: 'PMT Tulehu',
        status: 'CLOSED',
        arusR: 180,
        arusS: 175,
        arusT: 185,
        arusIN: 6,
        bebanMw: 5.8,
        warna: '#8b5cf6'
      }
    ]
  },
  {
    id: 'gh-baguala',
    nama: 'GH BAGUALA',
    tipe: 'GH',
    deskripsiBusbar: 'BUSBAR 20KV GH BAGUALA (EXPRESS FEEDER DISTRIBUTION)',
    teganganKv: 20.0,
    frekuensiHz: 50.0,
    feeders: [
      {
        id: 'f-gh-express-lateri',
        namaFeeder: 'GH EXPRESS LATERI',
        panjangKms: 6.4,
        saklarTipe: 'LBS Motorized',
        saklarNama: 'LBS GH-01',
        status: 'CLOSED',
        arusR: 110,
        arusS: 112,
        arusT: 108,
        arusIN: 2,
        bebanMw: 2.9,
        warna: '#06b6d4'
      },
      {
        id: 'f-gh-passo-feeder2',
        namaFeeder: 'GH PASSO FEEDER 2',
        panjangKms: 8.1,
        saklarTipe: 'PMT CB Outgoing',
        saklarNama: 'PMT GH-02',
        status: 'CLOSED',
        arusR: 125,
        arusS: 120,
        arusT: 128,
        arusIN: 4,
        bebanMw: 3.4,
        warna: '#2563eb'
      }
    ]
  },
  {
    id: 'gi-sirimau',
    nama: 'GI SIRIMAU',
    tipe: 'GI',
    deskripsiBusbar: 'BUSBAR 20KV GI SIRIMAU (TRAFO 1 - 30 MVA)',
    teganganKv: 20.1,
    frekuensiHz: 50.0,
    feeders: [
      {
        id: 'f-lateri-3',
        namaFeeder: 'LATERI 3',
        panjangKms: 14.1,
        saklarTipe: 'PMT CB Outgoing',
        saklarNama: 'PMT Lateri',
        status: 'CLOSED',
        arusR: 160,
        arusS: 165,
        arusT: 158,
        arusIN: 5,
        bebanMw: 4.5,
        warna: '#ec4899'
      },
      {
        id: 'f-halong-utama',
        namaFeeder: 'HALONG UTAMA',
        panjangKms: 11.3,
        saklarTipe: 'Recloser Smart',
        saklarNama: 'REC Halong',
        status: 'CLOSED',
        arusR: 130,
        arusS: 128,
        arusT: 132,
        arusIN: 3,
        bebanMw: 3.8,
        warna: '#14b8a6'
      }
    ]
  }
];

const INITIAL_TIE_SWITCHES: TieSwitchData[] = [
  {
    id: 'tie-passo-lateri',
    nama: 'TIE SWITCH MANUVER (PASSO UTAMA - LATERI 3)',
    substationAId: 'gi-passo',
    feederAId: 'f-passo-utama',
    substationBId: 'gi-sirimau',
    feederBId: 'f-lateri-3',
    deskripsi: 'Saklar interkoneksi manuver darurat antara Penyulang Passo Utama (GI Passo) & Lateri 3 (GI Sirimau)',
    status: 'OPEN'
  },
  {
    id: 'tie-waiheru-gh',
    nama: 'TIE SWITCH MANUVER (WAIHERU 1 - GH EXPRESS LATERI)',
    substationAId: 'gi-passo',
    feederAId: 'f-waiheru-1',
    substationBId: 'gh-baguala',
    feederBId: 'f-gh-express-lateri',
    deskripsi: 'Interkoneksi cadangan antara Waiheru 1 dan GH Express Baguala',
    status: 'OPEN'
  }
];

export const SldVisioView: React.FC = () => {
  const [substations, setSubstations] = useState<SubstationData[]>(INITIAL_SUBSTATIONS);
  const [tieSwitches, setTieSwitches] = useState<TieSwitchData[]>(INITIAL_TIE_SWITCHES);
  
  const [zoomLevel, setZoomLevel] = useState(100);
  const [filterSubstation, setFilterSubstation] = useState<string>('ALL');

  // Modals state
  const [showAddSubstationModal, setShowAddSubstationModal] = useState(false);
  const [showAddFeederModal, setShowAddFeederModal] = useState(false);
  const [showAddTieSwitchModal, setShowAddTieSwitchModal] = useState(false);
  const [editingSubstation, setEditingSubstation] = useState<SubstationData | null>(null);
  const [editingFeeder, setEditingFeeder] = useState<{ subId: string; feeder: FeederData } | null>(null);

  // Form states for Substation
  const [subName, setSubName] = useState('');
  const [subType, setSubType] = useState<SubstationType>('GI');
  const [subBusbar, setSubBusbar] = useState('');
  const [subTegangan, setSubTegangan] = useState(20.0);

  // Form states for Feeder
  const [targetSubId, setTargetSubId] = useState('');
  const [feederName, setFeederName] = useState('');
  const [feederKms, setFeederKms] = useState(10.0);
  const [feederSaklarTipe, setFeederSaklarTipe] = useState('PMT CB Outgoing');
  const [feederSaklarNama, setFeederSaklarNama] = useState('');
  const [feederStatus, setFeederStatus] = useState<'CLOSED' | 'OPEN'>('CLOSED');
  const [feederArusR, setFeederArusR] = useState(120);
  const [feederArusS, setFeederArusS] = useState(122);
  const [feederArusT, setFeederArusT] = useState(118);
  const [feederArusIN, setFeederArusIN] = useState(4);
  const [feederBebanMw, setFeederBebanMw] = useState(3.5);

  // Form states for Tie Switch
  const [tieName, setTieName] = useState('');
  const [tieFeederA, setTieFeederA] = useState('');
  const [tieFeederB, setTieFeederB] = useState('');
  const [tieDesc, setTieDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle Feeder Switch State directly
  const toggleFeederSwitch = (subId: string, feederId: string) => {
    setSubstations((prev) =>
      prev.map((sub) => {
        if (sub.id !== subId) return sub;
        return {
          ...sub,
          feeders: sub.feeders.map((f) =>
            f.id === feederId ? { ...f, status: f.status === 'CLOSED' ? 'OPEN' : 'CLOSED' } : f
          )
        };
      })
    );
  };

  // Toggle Tie Switch State directly
  const toggleTieSwitch = (tieId: string) => {
    setTieSwitches((prev) =>
      prev.map((ts) =>
        ts.id === tieId ? { ...ts, status: ts.status === 'CLOSED' ? 'OPEN' : 'CLOSED' } : ts
      )
    );
  };

  // Handle Add / Edit Substation
  const handleSaveSubstation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    if (editingSubstation) {
      setSubstations((prev) =>
        prev.map((sub) =>
          sub.id === editingSubstation.id
            ? {
                ...sub,
                nama: subName.toUpperCase(),
                tipe: subType,
                deskripsiBusbar: subBusbar || `BUSBAR 20KV ${subName.toUpperCase()}`,
                teganganKv: subTegangan
              }
            : sub
        )
      );
      setEditingSubstation(null);
    } else {
      const newSub: SubstationData = {
        id: `sub-${Date.now()}`,
        nama: subName.toUpperCase(),
        tipe: subType,
        deskripsiBusbar: subBusbar || `BUSBAR 20KV ${subName.toUpperCase()}`,
        teganganKv: subTegangan,
        frekuensiHz: 50.0,
        feeders: []
      };
      setSubstations((prev) => [...prev, newSub]);
    }

    setSubName('');
    setSubBusbar('');
    setShowAddSubstationModal(false);
  };

  const handleOpenEditSubstation = (sub: SubstationData) => {
    setEditingSubstation(sub);
    setSubName(sub.nama);
    setSubType(sub.tipe);
    setSubBusbar(sub.deskripsiBusbar);
    setSubTegangan(sub.teganganKv);
    setShowAddSubstationModal(true);
  };

  const handleDeleteSubstation = (subId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus Gardu Induk / GH ini beserta seluruh penyulangnya?')) {
      setSubstations((prev) => prev.filter((s) => s.id !== subId));
    }
  };

  // Handle Add / Edit Feeder
  const handleSaveFeeder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feederName.trim() || !targetSubId) return;

    if (editingFeeder) {
      setSubstations((prev) =>
        prev.map((sub) => {
          if (sub.id !== editingFeeder.subId) return sub;
          return {
            ...sub,
            feeders: sub.feeders.map((f) =>
              f.id === editingFeeder.feeder.id
                ? {
                    ...f,
                    namaFeeder: feederName.toUpperCase(),
                    panjangKms: Number(feederKms),
                    saklarTipe: feederSaklarTipe,
                    saklarNama: feederSaklarNama || feederSaklarTipe,
                    status: feederStatus,
                    arusR: Number(feederArusR),
                    arusS: Number(feederArusS),
                    arusT: Number(feederArusT),
                    arusIN: Number(feederArusIN),
                    bebanMw: Number(feederBebanMw)
                  }
                : f
            )
          };
        })
      );
      setEditingFeeder(null);
    } else {
      const colors = ['#10b981', '#2563eb', '#f59e0b', '#8b5cf6', '#0284c7', '#ec4899', '#14b8a6', '#06b6d4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newFeeder: FeederData = {
        id: `f-${Date.now()}`,
        namaFeeder: feederName.toUpperCase(),
        panjangKms: Number(feederKms),
        saklarTipe: feederSaklarTipe,
        saklarNama: feederSaklarNama || feederSaklarTipe,
        status: feederStatus,
        arusR: Number(feederArusR),
        arusS: Number(feederArusS),
        arusT: Number(feederArusT),
        arusIN: Number(feederArusIN),
        bebanMw: Number(feederBebanMw),
        warna: randomColor
      };

      setSubstations((prev) =>
        prev.map((sub) => (sub.id === targetSubId ? { ...sub, feeders: [...sub.feeders, newFeeder] } : sub))
      );
    }

    setFeederName('');
    setFeederSaklarNama('');
    setShowAddFeederModal(false);
  };

  const handleOpenEditFeeder = (subId: string, feeder: FeederData) => {
    setEditingFeeder({ subId, feeder });
    setTargetSubId(subId);
    setFeederName(feeder.namaFeeder);
    setFeederKms(feeder.panjangKms);
    setFeederSaklarTipe(feeder.saklarTipe);
    setFeederSaklarNama(feeder.saklarNama);
    setFeederStatus(feeder.status);
    setFeederArusR(feeder.arusR);
    setFeederArusS(feeder.arusS);
    setFeederArusT(feeder.arusT);
    setFeederArusIN(feeder.arusIN);
    setFeederBebanMw(feeder.bebanMw);
    setShowAddFeederModal(true);
  };

  const handleDeleteFeeder = (subId: string, feederId: string) => {
    if (confirm('Hapus penyulang / bay outgoing ini?')) {
      setSubstations((prev) =>
        prev.map((sub) =>
          sub.id === subId
            ? { ...sub, feeders: sub.feeders.filter((f) => f.id !== feederId) }
            : sub
        )
      );
    }
  };

  // Handle Add Tie Switch
  const handleSaveTieSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieFeederA || !tieFeederB) return;

    const allFeeders = substations.flatMap((s) => s.feeders.map((f) => ({ ...f, subId: s.id })));
    const fA = allFeeders.find((f) => f.id === tieFeederA);
    const fB = allFeeders.find((f) => f.id === tieFeederB);

    const newTie: TieSwitchData = {
      id: `tie-${Date.now()}`,
      nama: (tieName || '').toUpperCase() || `TIE SWITCH (${fA?.namaFeeder || 'A'} - ${fB?.namaFeeder || 'B'})`,
      substationAId: fA?.subId || '',
      feederAId: tieFeederA,
      substationBId: fB?.subId || '',
      feederBId: tieFeederB,
      deskripsi: tieDesc || `Saklar manuver darurat antara ${fA?.namaFeeder} dan ${fB?.namaFeeder}`,
      status: 'OPEN'
    };

    setTieSwitches((prev) => [...prev, newTie]);
    setTieName('');
    setTieDesc('');
    setShowAddTieSwitchModal(false);
  };

  const handleDeleteTieSwitch = (tieId: string) => {
    if (confirm('Hapus Tie Switch ini?')) {
      setTieSwitches((prev) => prev.filter((t) => t.id !== tieId));
    }
  };

  // Export Data JSON
  const handleExportJson = () => {
    const data = {
      substations,
      tieSwitches,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SLD_Visio_PerangPadamBaguala_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // Import Data JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.substations && Array.isArray(parsed.substations)) {
          setSubstations(parsed.substations);
        }
        if (parsed.tieSwitches && Array.isArray(parsed.tieSwitches)) {
          setTieSwitches(parsed.tieSwitches);
        }
        alert('Data Single Line Diagram (SLD) berhasil diimpor!');
      } catch (err) {
        alert('Gagal membaca file JSON. Pastikan format file sesuai.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default preset
  const handleResetDefault = () => {
    if (confirm('Kembalikan Single Line Diagram ke pengaturan awal (Default preset PLN ULP Baguala)?')) {
      setSubstations(INITIAL_SUBSTATIONS);
      setTieSwitches(INITIAL_TIE_SWITCHES);
    }
  };

  // Filtered substations
  const filteredSubstations = substations.filter((sub) => {
    if (filterSubstation === 'ALL') return true;
    if (filterSubstation === 'GI_ONLY') return sub.tipe === 'GI';
    if (filterSubstation === 'GH_ONLY') return sub.tipe === 'GH';
    return sub.id === filterSubstation;
  });

  return (
    <div className="p-4 md:p-6 space-y-5 bg-slate-950 text-slate-100 font-sans min-h-screen">
      
      {/* 1. Header Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              SINGLE LINE DIAGRAM (SLD VISIO 20KV)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-extrabold uppercase">
              PERANG PADAM BAGUALA SCADA
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
              {substations.length} Substation ({substations.filter(s=>s.tipe==='GI').length} GI / {substations.filter(s=>s.tipe==='GH').length} GH)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Visualisasi skematik interaktif kelistrikan 20kV. Tambahkan & edit Gardu Induk (GI), Gardu Hubung (GH), Outgoing Feeder, serta Tie Switch.
          </p>
        </div>

        {/* Action Controls & Input Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Zoom Control Group */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-xs font-bold text-slate-300 min-w-[45px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Substation Filter */}
          <div className="relative">
            <select
              value={filterSubstation}
              onChange={(e) => setFilterSubstation(e.target.value)}
              className="pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
            >
              <option value="ALL">Semua GI & GH ({substations.length})</option>
              <option value="GI_ONLY">Hanya Gardu Induk (GI)</option>
              <option value="GH_ONLY">Hanya Gardu Hubung (GH)</option>
              {substations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.tipe})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Create Substation Button */}
          <button
            onClick={() => {
              setEditingSubstation(null);
              setSubName('');
              setSubBusbar('');
              setSubType('GI');
              setShowAddSubstationModal(true);
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>+ Tambah GI / GH</span>
          </button>

          {/* Create Feeder Button */}
          <button
            onClick={() => {
              setEditingFeeder(null);
              setTargetSubId(substations[0]?.id || '');
              setFeederName('');
              setFeederSaklarNama('');
              setShowAddFeederModal(true);
            }}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Feeder</span>
          </button>

          {/* Create Tie Switch Button */}
          <button
            onClick={() => {
              setTieName('');
              setTieDesc('');
              setShowAddTieSwitchModal(true);
            }}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>+ Tie Switch</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title="Simpan konfigurasi SLD ke file JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title="Unggah file JSON skema SLD"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import</span>
          </button>

          {/* Reset Preset */}
          <button
            onClick={handleResetDefault}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs border border-slate-700 cursor-pointer"
            title="Reset ke skema preset awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>

      {/* 2. Interactive Visual SLD Canvas Area */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-6 shadow-2xl min-h-[580px] overflow-auto relative">
        
        {/* Helper Tip Badge */}
        <div className="mb-4 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong className="text-white">Petunjuk SCADA Interactive:</strong> Klik tombol status saklar (CLOSED / OPEN) pada feeder atau tie switch untuk mengubah status manuver secara langsung.
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> CLOSED (Berbeban)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> OPEN (Padam / Trip)
            </span>
          </div>
        </div>

        {/* Zoom Scaled Container */}
        <div
          className="transition-transform duration-200 origin-top-left space-y-12 pb-8"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {filteredSubstations.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Building2 className="w-12 h-12 mx-auto text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-400">Belum Ada Gardu Induk (GI) atau Gardu Hubung (GH) Ditambahkan</p>
              <button
                onClick={() => {
                  setEditingSubstation(null);
                  setSubName('');
                  setSubBusbar('');
                  setShowAddSubstationModal(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                + Tambah GI / GH Sekarang
              </button>
            </div>
          ) : (
            filteredSubstations.map((sub) => (
              <div key={sub.id} className="space-y-3 bg-slate-900/40 p-5 rounded-3xl border border-slate-800/80 relative">
                
                {/* BUSBAR Header for this Substation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-amber-500 pb-2 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      sub.tipe === 'GI' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {sub.tipe === 'GI' ? 'GARDU INDUK (GI)' : 'GARDU HUBUNG (GH)'}
                    </span>
                    <span className="text-sm font-black text-amber-400 tracking-wider">
                      ⚡ {sub.deskripsiBusbar}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      TEGANGAN: {sub.teganganKv} kV • FREKUENSI: {sub.frekuensiHz} Hz
                    </span>

                    {/* Substation Edit / Delete Controls */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleOpenEditSubstation(sub)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                        title="Edit GI / GH ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubstation(sub.id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Hapus GI / GH ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feeders / Outgoing Bays Grid */}
                {sub.feeders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    <span>Belum ada penyulang di {sub.nama}. </span>
                    <button
                      onClick={() => {
                        setEditingFeeder(null);
                        setTargetSubId(sub.id);
                        setFeederName('');
                        setShowAddFeederModal(true);
                      }}
                      className="text-blue-400 font-bold hover:underline ml-1 cursor-pointer"
                    >
                      + Tambah Feeder
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
                    {sub.feeders.map((feeder) => (
                      <div
                        key={feeder.id}
                        className={`p-4 bg-slate-900/90 border rounded-2xl space-y-3 relative transition-all ${
                          feeder.status === 'CLOSED'
                            ? 'border-slate-800 hover:border-slate-700 shadow-md'
                            : 'border-rose-900/50 bg-rose-950/10'
                        }`}
                      >
                        {/* Top Feeder Title & Length */}
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs" style={{ color: feeder.warna || '#10b981' }}>
                            {feeder.namaFeeder}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400">{feeder.panjangKms} KMS</span>
                            
                            {/* Feeder Edit/Delete Actions */}
                            <button
                              onClick={() => handleOpenEditFeeder(sub.id, feeder)}
                              className="text-slate-500 hover:text-blue-400 cursor-pointer p-0.5"
                              title="Edit Penyulang"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteFeeder(sub.id, feeder.id)}
                              className="text-slate-500 hover:text-rose-400 cursor-pointer p-0.5"
                              title="Hapus Penyulang"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Circuit Breaker Button */}
                        <button
                          onClick={() => toggleFeederSwitch(sub.id, feeder.id)}
                          className={`w-full p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between cursor-pointer transition-all shadow-sm ${
                            feeder.status === 'CLOSED'
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-rose-500/15 border-rose-500/50 text-rose-400 hover:bg-rose-500/25'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate pr-1">
                            <Power className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{feeder.saklarNama || feeder.saklarTipe}</span>
                          </span>
                          <span className="font-extrabold text-[10px] uppercase shrink-0 px-2 py-0.5 rounded bg-slate-950/60">
                            {feeder.status === 'CLOSED' ? 'CLOSED' : 'OPEN (TRIP)'}
                          </span>
                        </button>

                        {/* Currents & MW Load Stats */}
                        <div className="text-[11px] text-slate-400 space-y-1 font-mono pt-1 border-t border-slate-800/80">
                          <div className="flex justify-between">
                            <span>Arus R/S/T:</span>
                            <span className="font-bold text-slate-200">
                              {feeder.status === 'CLOSED' ? `${feeder.arusR}A / ${feeder.arusS}A / ${feeder.arusT}A` : '0A / 0A / 0A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Beban Daya:</span>
                            <span className={`font-bold ${feeder.status === 'CLOSED' ? 'text-amber-400' : 'text-slate-500'}`}>
                              {feeder.status === 'CLOSED' ? `${feeder.bebanMw} MW` : '0 MW'}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))
          )}

          {/* 3. TIE SWITCHES / INTERCONNECTION MANEUVER SECTION */}
          {tieSwitches.length > 0 && (
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Sistem Tie Switch Interkoneksi & Saklar Manuver Penyulang
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{tieSwitches.length} Titik Manuver Active</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tieSwitches.map((ts) => {
                  return (
                    <div
                      key={ts.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                    >
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-300">{ts.nama}</span>
                          <button
                            onClick={() => handleDeleteTieSwitch(ts.id)}
                            className="text-slate-500 hover:text-rose-400 p-0.5"
                            title="Hapus Tie Switch"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">{ts.deskripsi}</p>
                      </div>

                      <button
                        onClick={() => toggleTieSwitch(ts.id)}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs cursor-pointer border transition-all flex items-center gap-2 shrink-0 ${
                          ts.status === 'CLOSED'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{ts.status === 'CLOSED' ? 'CLOSED (BERHUBUNG)' : 'OPEN (NORMAL NOP)'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Tambah / Edit Gardu Induk or Gardu Hubung */}
      {/* ========================================================================= */}
      {showAddSubstationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                {editingSubstation ? 'Edit Substation (GI / GH)' : 'Tambah Gardu Induk / GH Baru'}
              </h3>
              <button
                onClick={() => setShowAddSubstationModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubstation} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">TIPE SUBSTATION</label>
                <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value as SubstationType)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="GI">Gardu Induk (GI)</option>
                  <option value="GH">Gardu Hubung (GH)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">NAMA SUBSTATION</label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. GI PASSO / GH BAGUALA"
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">DESKRIPSI BUSBAR</label>
                <input
                  type="text"
                  value={subBusbar}
                  onChange={(e) => setSubBusbar(e.target.value)}
                  placeholder="e.g. BUSBAR 20KV GI PASSO (TRAFO 1 & 2)"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">TEGANGAN SISTEM (kV)</label>
                <input
                  type="number"
                  step="0.1"
                  value={subTegangan}
                  onChange={(e) => setSubTegangan(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSubstationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan Substation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Tambah / Edit Feeder */}
      {/* ========================================================================= */}
      {showAddFeederModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                {editingFeeder ? 'Edit Feeder / Penyulang' : 'Tambah Feeder Outgoing Baru'}
              </h3>
              <button
                onClick={() => setShowAddFeederModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeder} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">GARDU INDUK / GH INDUK</label>
                <select
                  value={targetSubId}
                  onChange={(e) => setTargetSubId(e.target.value)}
                  disabled={!!editingFeeder}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {substations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.tipe})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">NAMA PENYULANG / FEEDER</label>
                <input
                  type="text"
                  value={feederName}
                  onChange={(e) => setFeederName(e.target.value)}
                  placeholder="e.g. PASSO UTAMA / WAIHERU 2"
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">PANJANG (KMS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={feederKms}
                    onChange={(e) => setFeederKms(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">TIPE SAKLAR</label>
                  <select
                    value={feederSaklarTipe}
                    onChange={(e) => setFeederSaklarTipe(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PMT CB Outgoing">PMT CB Outgoing</option>
                    <option value="LBS Section">LBS Section</option>
                    <option value="Recloser Smart">Recloser Smart</option>
                    <option value="LBS Motorized">LBS Motorized</option>
                    <option value="Fuse Cut Out">Fuse Cut Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">NAMA SAKLAR / KODE PMT</label>
                <input
                  type="text"
                  value={feederSaklarNama}
                  onChange={(e) => setFeederSaklarNama(e.target.value)}
                  placeholder="e.g. PMT 10 / LBS Waiheru"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">STATUS AWAL SAKLAR</label>
                <select
                  value={feederStatus}
                  onChange={(e) => setFeederStatus(e.target.value as 'CLOSED' | 'OPEN')}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="CLOSED">CLOSED (Menyalur/Berbeban)</option>
                  <option value="OPEN">OPEN (Padam/Trip)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Parameter Beban & Arus</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400">Arus R (A)</label>
                    <input
                      type="number"
                      value={feederArusR}
                      onChange={(e) => setFeederArusR(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400">Arus S (A)</label>
                    <input
                      type="number"
                      value={feederArusS}
                      onChange={(e) => setFeederArusS(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400">Arus T (A)</label>
                    <input
                      type="number"
                      value={feederArusT}
                      onChange={(e) => setFeederArusT(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400">Beban (MW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={feederBebanMw}
                      onChange={(e) => setFeederBebanMw(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddFeederModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan Feeder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Tambah Tie Switch Interkoneksi */}
      {/* ========================================================================= */}
      {showAddTieSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                Tambah Tie Switch Interkoneksi Baru
              </h3>
              <button
                onClick={() => setShowAddTieSwitchModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTieSwitch} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">NAMA TIE SWITCH</label>
                <input
                  type="text"
                  value={tieName}
                  onChange={(e) => setTieName(e.target.value)}
                  placeholder="e.g. TIE SWITCH PASSO - LATERI"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">PENYULANG ASAL (A)</label>
                <select
                  value={tieFeederA}
                  onChange={(e) => setTieFeederA(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Pilih Feeder A --</option>
                  {substations.flatMap((s) =>
                    s.feeders.map((f) => (
                      <option key={f.id} value={f.id}>
                        [{s.nama}] {f.namaFeeder}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">PENYULANG TUJUAN (B)</label>
                <select
                  value={tieFeederB}
                  onChange={(e) => setTieFeederB(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Pilih Feeder B --</option>
                  {substations.flatMap((s) =>
                    s.feeders.map((f) => (
                      <option key={f.id} value={f.id}>
                        [{s.nama}] {f.namaFeeder}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">DESKRIPSI LOKASI MANUVER</label>
                <textarea
                  value={tieDesc}
                  onChange={(e) => setTieDesc(e.target.value)}
                  rows={2}
                  placeholder="Detail saklar manuver antar feeder..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTieSwitchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan Tie Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
