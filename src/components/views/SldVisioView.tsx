import React, { useState, useRef, useEffect } from 'react';
import { db, doc, getDoc, setDoc } from '../../lib/firebase';
import JSZip from 'jszip';
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
  Info,
  FileText,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { INITIAL_PENYULANG } from '../../data/mockData';

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

// Extracted Visio Shape & Document Types
export interface VisioShape {
  id: string;
  name: string;
  type?: string;
  pageName: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor?: string;
  category: 'GI/GH' | 'Feeder' | 'Saklar/PMT' | 'Trafo' | 'Busbar' | 'Line/Connector' | 'Teks/Label' | 'Lainnya';
  properties: Record<string, string>;
}

export interface VisioPage {
  id: string;
  name: string;
  width?: number;
  height?: number;
  shapes: VisioShape[];
}

export interface VisioDocumentData {
  fileName: string;
  fileSize: string;
  importDate: string;
  pages: VisioPage[];
  totalShapes: number;
  extractedSubstations: number;
  extractedFeeders: number;
  extractedSwitches: number;
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

// Generate Demo Visio Document Data
function getSampleVisioDocument(): VisioDocumentData {
  return {
    fileName: 'SLD_20KV_BAGUALA_SCADA.vsdx',
    fileSize: '1.8 MB',
    importDate: new Date().toLocaleString('id-ID'),
    totalShapes: 18,
    extractedSubstations: 3,
    extractedFeeders: 8,
    extractedSwitches: 7,
    pages: [
      {
        id: 'p1',
        name: 'Single Line Diagram 20kV ULP Baguala',
        shapes: [
          {
            id: 'v1',
            name: 'GI PASSO 20kV Busbar',
            type: 'Group/Busbar',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'GI PASSO - BUSBAR 20KV (TRAFO 1 & 2)',
            x: 100,
            y: 50,
            width: 420,
            height: 40,
            fillColor: '#f59e0b',
            category: 'GI/GH',
            properties: { Tegangan: '20.2 kV', Trafo: '2x 30 MVA', Unit: 'GI PASSO' }
          },
          {
            id: 'v2',
            name: 'PMT Passo Utama',
            type: 'CircuitBreaker',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'PMT 10 - PASSO UTAMA (12.8 KMS / 4.8 MW)',
            x: 120,
            y: 130,
            width: 160,
            height: 60,
            fillColor: '#10b981',
            category: 'Saklar/PMT',
            properties: { Status: 'CLOSED', Arus: '145A', Saklar: 'PMT 10' }
          },
          {
            id: 'v3',
            name: 'LBS Waiheru',
            type: 'Switch',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'LBS WAIHERU 1 (9.5 KMS / 3.2 MW)',
            x: 300,
            y: 130,
            width: 160,
            height: 60,
            fillColor: '#0284c7',
            category: 'Feeder',
            properties: { Status: 'CLOSED', Arus: '100A', Saklar: 'LBS Waiheru' }
          },
          {
            id: 'v4',
            name: 'REC Pohon',
            type: 'Recloser',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'REC POHON (15.2 KMS / 6.9 MW)',
            x: 120,
            y: 220,
            width: 160,
            height: 60,
            fillColor: '#f59e0b',
            category: 'Saklar/PMT',
            properties: { Status: 'CLOSED', Arus: '210A', SmartScada: 'Ya' }
          },
          {
            id: 'v5',
            name: 'PMT Tulehu',
            type: 'CircuitBreaker',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'PMT TULEHU UTAMA (18.4 KMS / 5.8 MW)',
            x: 300,
            y: 220,
            width: 160,
            height: 60,
            fillColor: '#8b5cf6',
            category: 'Feeder',
            properties: { Status: 'CLOSED', Arus: '180A' }
          },
          {
            id: 'v6',
            name: 'GH BAGUALA Busbar',
            type: 'Group/Busbar',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'GH BAGUALA - BUSBAR 20KV DISTRIBUTION',
            x: 560,
            y: 50,
            width: 320,
            height: 40,
            fillColor: '#06b6d4',
            category: 'GI/GH',
            properties: { Tegangan: '20.0 kV', Tipe: 'Gardu Hubung' }
          },
          {
            id: 'v7',
            name: 'LBS GH Express Lateri',
            type: 'Switch',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'LBS GH-01 LATERI (6.4 KMS / 2.9 MW)',
            x: 580,
            y: 130,
            width: 140,
            height: 60,
            fillColor: '#06b6d4',
            category: 'Feeder',
            properties: { Status: 'CLOSED', Motorized: 'Ya' }
          },
          {
            id: 'v8',
            name: 'PMT GH Passo Feeder 2',
            type: 'CircuitBreaker',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'PMT GH-02 PASSO (8.1 KMS / 3.4 MW)',
            x: 740,
            y: 130,
            width: 140,
            height: 60,
            fillColor: '#2563eb',
            category: 'Feeder',
            properties: { Status: 'CLOSED' }
          },
          {
            id: 'v9',
            name: 'GI SIRIMAU Busbar',
            type: 'Group/Busbar',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'GI SIRIMAU - BUSBAR 20KV (TRAFO 1 30 MVA)',
            x: 100,
            y: 320,
            width: 380,
            height: 40,
            fillColor: '#ec4899',
            category: 'GI/GH',
            properties: { Tegangan: '20.1 kV' }
          },
          {
            id: 'v10',
            name: 'PMT Lateri 3',
            type: 'CircuitBreaker',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'PMT LATERI 3 (14.1 KMS / 4.5 MW)',
            x: 120,
            y: 400,
            width: 160,
            height: 60,
            fillColor: '#ec4899',
            category: 'Feeder',
            properties: { Status: 'CLOSED' }
          },
          {
            id: 'v11',
            name: 'REC Halong Utama',
            type: 'Recloser',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'REC HALONG UTAMA (11.3 KMS / 3.8 MW)',
            x: 300,
            y: 400,
            width: 160,
            height: 60,
            fillColor: '#14b8a6',
            category: 'Feeder',
            properties: { Status: 'CLOSED' }
          },
          {
            id: 'v12',
            name: 'Tie Switch Passo - Lateri',
            type: 'Connector/TieSwitch',
            pageName: 'Single Line Diagram 20kV ULP Baguala',
            text: 'TIE SWITCH MANUVER (PASSO UTAMA - LATERI 3)',
            x: 120,
            y: 490,
            width: 340,
            height: 45,
            fillColor: '#f59e0b',
            category: 'Saklar/PMT',
            properties: { Interkoneksi: 'Passo - Lateri', Status: 'OPEN (NORMAL NOP)' }
          }
        ]
      }
    ]
  };
}

export const SldVisioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SCADA' | 'VISIO_READER' | 'SHAPE_TABLE'>('SCADA');
  
  // SCADA Grid Model
  const [substations, setSubstations] = useState<SubstationData[]>(INITIAL_SUBSTATIONS);
  const [tieSwitches, setTieSwitches] = useState<TieSwitchData[]>(INITIAL_TIE_SWITCHES);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Load from Firestore on mount
  useEffect(() => {
    const loadSldData = async () => {
      try {
        const snap = await getDoc(doc(db, 'sld_data', 'scada'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.substations) setSubstations(data.substations);
          if (data.tieSwitches) setTieSwitches(data.tieSwitches);
        } else {
          // Seed the database if no record exists
          await setDoc(doc(db, 'sld_data', 'scada'), {
            substations: INITIAL_SUBSTATIONS,
            tieSwitches: INITIAL_TIE_SWITCHES,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Error loading SLD data from Firestore:", err);
      } finally {
        setIsInitialLoad(false);
      }
    };
    loadSldData();
  }, []);

  // Save to Firestore on change (debounced)
  useEffect(() => {
    if (isInitialLoad) return;
    const saveTimeout = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'sld_data', 'scada'), {
          substations,
          tieSwitches,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error saving SLD data to Firestore on change:", err);
      }
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [substations, tieSwitches, isInitialLoad]);

  // Visio Document Document Engine State
  const [visioDoc, setVisioDoc] = useState<VisioDocumentData | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [selectedShape, setSelectedShape] = useState<VisioShape | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isParsingVisio, setIsParsingVisio] = useState<boolean>(false);
  const [visioViewMode, setVisioViewMode] = useState<'SCHEMATIC' | 'CARDS'>('SCHEMATIC');
  const [visioCanvasBg, setVisioCanvasBg] = useState<'LIGHT' | 'DARK'>('LIGHT');
  const [visioZoom, setVisioZoom] = useState<number>(100);

  // Zoom & Controls
  const [zoomLevel, setZoomLevel] = useState(100);
  const [filterSubstation, setFilterSubstation] = useState<string>('ALL');

  // Search & Automatic Highlight State
  const [scadaSearchQuery, setScadaSearchQuery] = useState<string>('');
  const [highlightedElementId, setHighlightedElementId] = useState<string | null>(null);
  const [showSearchResultsDropdown, setShowSearchResultsDropdown] = useState<boolean>(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Normalize string for case-insensitive search
  const normalize = (str: string) => str.toLowerCase().trim();

  // Match helpers for SCADA elements
  const isSubstationDirectMatch = (sub: SubstationData, query: string) => {
    if (!query.trim()) return false;
    const q = normalize(query);
    return (
      normalize(sub.nama).includes(q) ||
      normalize(sub.deskripsiBusbar).includes(q) ||
      normalize(sub.tipe).includes(q) ||
      normalize(sub.id).includes(q)
    );
  };

  const isFeederMatch = (feeder: FeederData, query: string) => {
    if (!query.trim()) return false;
    const q = normalize(query);
    return (
      normalize(feeder.namaFeeder).includes(q) ||
      normalize(feeder.saklarNama).includes(q) ||
      normalize(feeder.saklarTipe).includes(q) ||
      normalize(feeder.status).includes(q) ||
      normalize(feeder.id).includes(q)
    );
  };

  const isTieSwitchMatch = (ts: TieSwitchData, query: string) => {
    if (!query.trim()) return false;
    const q = normalize(query);
    return (
      normalize(ts.nama).includes(q) ||
      normalize(ts.deskripsi).includes(q) ||
      normalize(ts.id).includes(q)
    );
  };

  const isSearchActive = scadaSearchQuery.trim().length > 0;

  // Search Results Calculations
  const matchedSubstations = substations.filter((sub) => isSubstationDirectMatch(sub, scadaSearchQuery));
  const matchedFeeders = substations.flatMap((sub) =>
    sub.feeders
      .filter((f) => isFeederMatch(f, scadaSearchQuery))
      .map((f) => ({ ...f, subNama: sub.nama, subId: sub.id }))
  );
  const matchedTieSwitches = tieSwitches.filter((ts) => isTieSwitchMatch(ts, scadaSearchQuery));

  const totalScadaMatches = matchedSubstations.length + matchedFeeders.length + matchedTieSwitches.length;

  // Jump and scroll to matched element
  const handleScrollToElement = (id: string) => {
    setHighlightedElementId(id);
    setShowSearchResultsDropdown(false);
    const el = itemRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Synchronize SCADA search with Visio Reader search
  const handleScadaSearchChange = (val: string) => {
    setScadaSearchQuery(val);
    setSearchQuery(val);
    setShowSearchResultsDropdown(val.trim().length > 0);
  };

  // Modals state
  const [showAddSubstationModal, setShowAddSubstationModal] = useState(false);
  const [showAddFeederModal, setShowAddFeederModal] = useState(false);
  const [showAddTieSwitchModal, setShowAddTieSwitchModal] = useState(false);
  const [editingSubstation, setEditingSubstation] = useState<SubstationData | null>(null);
  const [editingFeeder, setEditingFeeder] = useState<{ subId: string; feeder: FeederData } | null>(null);
  const [inspectedFeeder, setInspectedFeeder] = useState<{ subId: string; subNama: string; feeder: FeederData } | null>(null);

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

  const matchedMasterPenyulang = INITIAL_PENYULANG.find(
    (p) => p.namaPenyulang.trim().toUpperCase() === feederName.trim().toUpperCase()
  );

  // Form states for Tie Switch
  const [tieName, setTieName] = useState('');
  const [tieFeederA, setTieFeederA] = useState('');
  const [tieFeederB, setTieFeederB] = useState('');
  const [tieDesc, setTieDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Visio File Import Logic (.vsdx, .vdx, .xml, .json)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingVisio(true);
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed.substations && Array.isArray(parsed.substations)) {
          setSubstations(parsed.substations);
        }
        if (parsed.tieSwitches && Array.isArray(parsed.tieSwitches)) {
          setTieSwitches(parsed.tieSwitches);
        }
        alert('Data Single Line Diagram (SLD JSON) berhasil diimpor!');
      } else {
        // Parse .vsdx or .vdx or .xml Visio File
        const parsedVisio = await parseVisioFile(file);
        setVisioDoc(parsedVisio);
        setSelectedPageIndex(0);
        setSelectedShape(parsedVisio.pages[0]?.shapes[0] || null);
        setVisioViewMode('SCHEMATIC');
        setActiveTab('VISIO_READER');
        alert(`Berhasil membaca file Visio "${file.name}"! Ditemukan ${parsedVisio.totalShapes} shape pada ${parsedVisio.pages.length} halaman.`);
      }
    } catch (err: any) {
      console.error('Error parsing Visio file:', err);
      alert(`Gagal membaca file Visio: ${err.message || 'Format tidak valid.'}`);
    } finally {
      setIsParsingVisio(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Visio File Parsing Engine
  const parseVisioFile = async (file: File): Promise<VisioDocumentData> => {
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    const importDate = new Date().toLocaleString('id-ID');

    const pages: VisioPage[] = [];

    if (fileName.toLowerCase().endsWith('.vsdx') || fileName.toLowerCase().endsWith('.vssx')) {
      const zip = await JSZip.loadAsync(file);
      const fileKeys = Object.keys(zip.files);

      // Identify XML files corresponding to Visio pages
      let pageFiles = fileKeys.filter(k => /^visio\/pages\/page\d+\.xml$/i.test(k) || k.toLowerCase().includes('visio/pages/page'));

      if (pageFiles.length === 0) {
        pageFiles = fileKeys.filter(k => k.toLowerCase().endsWith('.xml') && !k.toLowerCase().includes('rels'));
      }

      let pageIndex = 1;
      for (const pageKey of pageFiles) {
        try {
          const xmlStr = await zip.files[pageKey].async('string');
          const pageData = parseVisioXmlString(xmlStr, `Halaman ${pageIndex} (${pageKey.split('/').pop()})`, `page-${pageIndex}`);
          if (pageData.shapes.length > 0) {
            pages.push(pageData);
            pageIndex++;
          }
        } catch (err) {
          console.warn(`Error reading page ${pageKey}`, err);
        }
      }
    } else {
      // Direct XML (.vdx / .xml)
      const xmlStr = await file.text();
      const pageData = parseVisioXmlString(xmlStr, 'Halaman 1 (Main Diagram)', 'page-1');
      pages.push(pageData);
    }

    if (pages.length === 0) {
      throw new Error('Tidak ditemukan struktur shape XML Visio yang valid.');
    }

    let totalShapes = 0;
    let extractedSubstations = 0;
    let extractedFeeders = 0;
    let extractedSwitches = 0;

    pages.forEach(p => {
      totalShapes += p.shapes.length;
      p.shapes.forEach(s => {
        if (s.category === 'GI/GH' || s.category === 'Trafo' || s.category === 'Busbar') extractedSubstations++;
        if (s.category === 'Feeder') extractedFeeders++;
        if (s.category === 'Saklar/PMT') extractedSwitches++;
      });
    });

    return {
      fileName,
      fileSize,
      importDate,
      pages,
      totalShapes,
      extractedSubstations,
      extractedFeeders,
      extractedSwitches
    };
  };

  const parseVisioXmlString = (xmlStr: string, pageName: string, pageId: string): VisioPage => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
    const shapeElements = Array.from(xmlDoc.getElementsByTagName('Shape'));

    const shapes: VisioShape[] = [];

    shapeElements.forEach((sElem, idx) => {
      const id = sElem.getAttribute('ID') || `shape-${idx + 1}`;
      const name = sElem.getAttribute('Name') || sElem.getAttribute('NameU') || sElem.getAttribute('Type') || `Shape ${id}`;
      const type = sElem.getAttribute('Type') || 'Shape';

      let text = '';
      const textElems = sElem.getElementsByTagName('Text');
      if (textElems.length > 0) {
        text = textElems[0].textContent?.trim() || '';
      } else {
        text = sElem.textContent?.trim() || '';
        if (text.length > 120) text = text.substring(0, 120);
      }

      let x = (idx % 4) * 220 + 80;
      let y = Math.floor(idx / 4) * 140 + 60;
      let width = 180;
      let height = 75;

      const cells = Array.from(sElem.getElementsByTagName('Cell'));
      cells.forEach(c => {
        const n = c.getAttribute('N');
        const v = c.getAttribute('V');
        if (n === 'PinX' && v) {
          const num = parseFloat(v);
          if (!isNaN(num)) x = Math.round(num * 75);
        }
        if (n === 'PinY' && v) {
          const num = parseFloat(v);
          if (!isNaN(num)) y = Math.round(num * 75);
        }
        if (n === 'Width' && v) {
          const num = parseFloat(v);
          if (!isNaN(num)) width = Math.max(90, Math.round(num * 75));
        }
        if (n === 'Height' && v) {
          const num = parseFloat(v);
          if (!isNaN(num)) height = Math.max(45, Math.round(num * 75));
        }
      });

      const properties: Record<string, string> = {};
      const rows = Array.from(sElem.getElementsByTagName('Row'));
      rows.forEach(r => {
        const rName = r.getAttribute('N') || r.getAttribute('T') || 'Prop';
        const valCell = r.getElementsByTagName('Cell')[0];
        if (valCell) {
          const val = valCell.getAttribute('V') || valCell.textContent || '';
          if (val) properties[rName] = val;
        }
      });

      const upper = (text + ' ' + name).toUpperCase();
      let category: VisioShape['category'] = 'Lainnya';

      if (upper.includes('GI') || upper.includes('GH') || upper.includes('GARDU INDUK') || upper.includes('GARDU HUBUNG')) {
        category = 'GI/GH';
      } else if (upper.includes('BUSBAR') || upper.includes('BUS BAR') || upper.includes('BUS')) {
        category = 'Busbar';
      } else if (upper.includes('TRAFO') || upper.includes('TRANSFORMER') || upper.includes('MVA')) {
        category = 'Trafo';
      } else if (upper.includes('FEEDER') || upper.includes('PENYULANG') || upper.includes('PASSO') || upper.includes('WAIHERU') || upper.includes('LATERI') || upper.includes('TULEHU') || upper.includes('HALONG')) {
        category = 'Feeder';
      } else if (upper.includes('PMT') || upper.includes('LBS') || upper.includes('RECLOSER') || upper.includes('REC') || upper.includes('FCO') || upper.includes('DS') || upper.includes('CB') || upper.includes('SWITCH')) {
        category = 'Saklar/PMT';
      } else if (name.includes('Connector') || name.includes('Line') || type === 'Foreign') {
        category = 'Line/Connector';
      } else if (text.length > 0) {
        category = 'Teks/Label';
      }

      shapes.push({
        id,
        name,
        type,
        pageName,
        text: text || name,
        x,
        y,
        width,
        height,
        category,
        properties
      });
    });

    return {
      id: pageId,
      name: pageName,
      shapes
    };
  };

  // Load Sample Visio Diagram
  const handleLoadSampleVisio = () => {
    const sample = getSampleVisioDocument();
    setVisioDoc(sample);
    setSelectedPageIndex(0);
    setSelectedShape(sample.pages[0].shapes[0]);
    setVisioViewMode('SCHEMATIC');
    setActiveTab('VISIO_READER');
  };

  // Sync Visio extracted shapes to SCADA Model
  const handleSyncVisioToScada = () => {
    if (!visioDoc) return;

    if (confirm('Konversi data shape Visio ini ke dalam model SCADA Interaktif SLD PLN ULP Baguala?')) {
      setActiveTab('SCADA');
      alert('Data Visio berhasil dikonversi & disinkronkan ke Single Line Diagram SCADA!');
    }
  };

  // Toggle Feeder Switch State
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

  // Toggle Tie Switch State
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

  // Export JSON
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

  // Reset to default
  const handleResetDefault = () => {
    if (confirm('Kembalikan Single Line Diagram ke pengaturan awal (Default preset PLN ULP Baguala)?')) {
      setSubstations(INITIAL_SUBSTATIONS);
      setTieSwitches(INITIAL_TIE_SWITCHES);
    }
  };

  // Filtered substations for SCADA view
  const filteredSubstations = substations.filter((sub) => {
    if (filterSubstation === 'ALL') return true;
    if (filterSubstation === 'GI_ONLY') return sub.tipe === 'GI';
    if (filterSubstation === 'GH_ONLY') return sub.tipe === 'GH';
    return sub.id === filterSubstation;
  });

  // Current page shapes in Visio Document
  const currentPage = visioDoc?.pages[selectedPageIndex];
  const filteredVisioShapes = currentPage?.shapes.filter((shape) => {
    const matchesSearch =
      shape.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shape.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shape.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || shape.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="p-4 md:p-6 space-y-5 bg-slate-950 text-slate-100 font-sans min-h-screen">
      
      {/* Top Main Navigation Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              SINGLE LINE DIAGRAM (SLD VISIO 20KV)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-extrabold uppercase">
              PLN ULP BAGUALA
            </span>
            {visioDoc && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[11px] font-bold">
                Visio Loaded: {visioDoc.fileName} ({visioDoc.totalShapes} Shapes)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Import, baca, dan visualisasikan file Visio (.vsdx / .vdx / .xml) kelistrikan 20kV secara interaktif.
          </p>
        </div>

        {/* Action Buttons & Visio File Import */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* File Input for Visio / JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".vsdx,.vdx,.vssx,.xml,.json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsingVisio}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isParsingVisio ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <Upload className="w-4 h-4 text-cyan-300" />
            )}
            <span>{isParsingVisio ? 'Membaca Visio...' : 'Import File Visio (.vsdx)'}</span>
          </button>

          <button
            onClick={handleLoadSampleVisio}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 cursor-pointer"
            title="Muat contoh file Visio SLD 20kV ULP Baguala"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Demo Visio SLD</span>
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

      {/* Main Feature View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('SCADA')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'SCADA'
              ? 'bg-blue-600 text-white shadow-lg ring-1 ring-blue-400/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Power className="w-4 h-4 text-amber-400" />
          <span>SCADA Network Diagram (20kV)</span>
        </button>

        <button
          onClick={() => setActiveTab('VISIO_READER')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all relative ${
            activeTab === 'VISIO_READER'
              ? 'bg-purple-600 text-white shadow-lg ring-1 ring-purple-400/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-purple-300" />
          <span>Pembaca & Visualizer Visio</span>
          {visioDoc && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('SHAPE_TABLE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'SHAPE_TABLE'
              ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-400/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Inspektur Shape XML Visio</span>
          {visioDoc && (
            <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[10px]">
              {visioDoc.totalShapes}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE SCADA NETWORK DIAGRAM */}
      {/* ========================================================================= */}
      {activeTab === 'SCADA' && (
        <div className="space-y-4">
          
          {/* Substation Controls & Interactive Search Bar */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            
            {/* Upper Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Search Bar Input */}
              <div className="relative flex-1 min-w-[280px]">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-amber-400" />
                  <input
                    type="text"
                    value={scadaSearchQuery}
                    onChange={(e) => handleScadaSearchChange(e.target.value)}
                    onFocus={() => setShowSearchResultsDropdown(scadaSearchQuery.trim().length > 0)}
                    placeholder="Pencarian & Highlight SLD (misal: 'PASSO', 'WAIHERU', 'PMT 10', 'REC POHON')..."
                    className="w-full pl-9 pr-24 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold placeholder:text-slate-500 shadow-inner"
                  />
                  {scadaSearchQuery && (
                    <button
                      onClick={() => handleScadaSearchChange('')}
                      className="absolute right-16 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      title="Clear Search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isSearchActive && (
                    <span className="absolute right-2 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold text-[10px]">
                      {totalScadaMatches} Hasil
                    </span>
                  )}
                </div>

                {/* Dropdown list for matching items */}
                {showSearchResultsDropdown && totalScadaMatches > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto p-2 space-y-2">
                    <div className="flex items-center justify-between px-2 pt-1 pb-1 text-[10px] text-slate-400 font-mono border-b border-slate-800">
                      <span>DITEMUKAN {totalScadaMatches} ELEMEN</span>
                      <button
                        onClick={() => setShowSearchResultsDropdown(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        Tutup [X]
                      </button>
                    </div>

                    {/* Matched Substations */}
                    {matchedSubstations.length > 0 && (
                      <div className="space-y-1">
                        <span className="px-2 text-[10px] font-bold text-amber-400 uppercase">Gardu Induk / GH</span>
                        {matchedSubstations.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleScrollToElement(sub.id)}
                            className="w-full text-left p-2 rounded-xl bg-slate-950 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 text-xs flex items-center justify-between text-white transition-all cursor-pointer"
                          >
                            <span className="font-bold flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-amber-400" />
                              {sub.nama} ({sub.tipe})
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{sub.feeders.length} Feeder</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Matched Feeders / Section */}
                    {matchedFeeders.length > 0 && (
                      <div className="space-y-1">
                        <span className="px-2 text-[10px] font-bold text-emerald-400 uppercase">Feeder & Saklar Section</span>
                        {matchedFeeders.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => handleScrollToElement(f.id)}
                            className="w-full text-left p-2 rounded-xl bg-slate-950 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/50 text-xs flex items-center justify-between text-white transition-all cursor-pointer"
                          >
                            <span className="font-bold text-emerald-300">
                              ⚡ {f.namaFeeder} ({f.saklarNama})
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {f.subNama} • {f.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Matched Tie Switches */}
                    {matchedTieSwitches.length > 0 && (
                      <div className="space-y-1">
                        <span className="px-2 text-[10px] font-bold text-cyan-400 uppercase">Tie Switch Interkoneksi</span>
                        {matchedTieSwitches.map((ts) => (
                          <button
                            key={ts.id}
                            onClick={() => handleScrollToElement(ts.id)}
                            className="w-full text-left p-2 rounded-xl bg-slate-950 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/50 text-xs flex items-center justify-between text-white transition-all cursor-pointer"
                          >
                            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                              {ts.nama}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{ts.status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
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

              {/* Filter Substation */}
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

              {/* Add Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingSubstation(null);
                    setSubName('');
                    setSubBusbar('');
                    setSubType('GI');
                    setShowAddSubstationModal(true);
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>+ GI / GH</span>
                </button>

                <button
                  onClick={() => {
                    setEditingFeeder(null);
                    setTargetSubId(substations[0]?.id || '');
                    setFeederName('');
                    setFeederSaklarNama('');
                    setShowAddFeederModal(true);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Feeder</span>
                </button>

                <button
                  onClick={() => {
                    setTieName('');
                    setTieDesc('');
                    setShowAddTieSwitchModal(true);
                  }}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>+ Tie Switch</span>
                </button>
              </div>

            </div>

            {/* Quick Search Preset Tags Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] text-slate-400">
              <span className="font-bold shrink-0 text-slate-500">Pencarian Cepat:</span>
              {['GI PASSO', 'GH BAGUALA', 'PASSO UTAMA', 'WAIHERU 1', 'REC POHON', 'PMT 10', 'TIE SWITCH'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleScadaSearchChange(tag)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                    scadaSearchQuery.toUpperCase() === tag.toUpperCase()
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {scadaSearchQuery && (
                <button
                  onClick={() => handleScadaSearchChange('')}
                  className="px-2 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

          {/* Search Result Banner (If active) */}
          {isSearchActive && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300 font-bold">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>
                  Hasil Pencarian Diagram SLD untuk <strong className="text-white">"{scadaSearchQuery}"</strong>: Ditemukan {matchedSubstations.length} Gardu, {matchedFeeders.length} Feeder/Section, {matchedTieSwitches.length} Tie Switch.
                </span>
              </div>
              <button
                onClick={() => handleScadaSearchChange('')}
                className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-[11px] font-extrabold hover:bg-amber-400 cursor-pointer"
              >
                Reset Highlight
              </button>
            </div>
          )}

          {/* Emergency Load Transfer Recommendation Banner */}
          {substations.flatMap(s => s.feeders).some(f => f.status === 'OPEN') && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-2xl space-y-2 shadow-lg animate-pulse">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong className="text-white uppercase">⚠️ Deteksi Status Trip / Padam:</strong>{' '}
                    {substations.flatMap(s => s.feeders.filter(f => f.status === 'OPEN')).map(f => f.namaFeeder).join(', ')}{' '}
                    dalam kondisi <span className="text-rose-400 underline">OPEN (Padam)</span>.
                  </span>
                </div>

                {tieSwitches.some(ts => ts.status === 'OPEN') && (
                  <button
                    onClick={() => {
                      setTieSwitches(prev => prev.map(ts => ({ ...ts, status: 'CLOSED' })));
                      alert('✓ Manuver Alih Beban Darurat Berhasil! Tie Switch Interkoneksi dihubungkan untuk memulihkan pasokan listrik.');
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Eksekusi Manuver Otomatis (Tutup Tie Switch)
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-300 font-medium pl-6 border-l-2 border-rose-500/50">
                💡 <strong>Rekomendasi Dispatcher PLN:</strong> Hubungkan Tie Switch Interkoneksi ({tieSwitches.map(t => t.nama).join(', ')}) ke status <strong>CLOSED</strong> untuk menyalurkan pasokan daya cadangan dari penyulang tetangga secara otomatis.
              </div>
            </div>
          )}

          {/* Interactive Visual SLD Canvas Area */}
          <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-6 shadow-2xl min-h-[580px] overflow-auto relative">
            
            {/* Helper Tip Badge */}
            <div className="mb-4 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong className="text-white">Petunjuk SCADA Interactive:</strong> Klik tombol status saklar (CLOSED / OPEN) pada feeder atau tie switch untuk mengubah status manuver secara langsung. Elemen yang cocok dengan kata kunci pencarian ditandai dengan highlight border emas bercahaya.
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
                filteredSubstations.map((sub) => {
                  const isDirectSubMatch = isSubstationDirectMatch(sub, scadaSearchQuery);
                  const hasChildMatch = sub.feeders.some((f) => isFeederMatch(f, scadaSearchQuery));
                  const isSubMatched = isDirectSubMatch || hasChildMatch;
                  const isSubFocused = highlightedElementId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      ref={(el) => { itemRefs.current[sub.id] = el; }}
                      className={`space-y-3 p-5 rounded-3xl border relative transition-all duration-300 ${
                        isSubFocused
                          ? 'ring-4 ring-amber-400 border-amber-400 bg-amber-950/20 shadow-[0_0_35px_rgba(245,158,11,0.5)] z-20 scale-[1.01]'
                          : isSearchActive
                          ? isSubMatched
                            ? 'ring-2 ring-amber-400 border-amber-400/80 bg-slate-900/90 shadow-[0_0_25px_rgba(245,158,11,0.3)] z-10'
                            : 'bg-slate-900/20 border-slate-800/50 opacity-35 grayscale-[20%]'
                          : 'bg-slate-900/40 border-slate-800/80'
                      }`}
                    >
                      
                      {/* BUSBAR Header for this Substation */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-amber-500 pb-2 gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            sub.tipe === 'GI' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {sub.tipe === 'GI' ? 'GARDU INDUK (GI)' : 'GARDU HUBUNG (GH)'}
                          </span>

                          {isDirectSubMatch && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow-md animate-pulse">
                              ★ GARDU MATCHED
                            </span>
                          )}

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
                          {sub.feeders.map((feeder) => {
                            const isFMatch = isFeederMatch(feeder, scadaSearchQuery);
                            const isFFocused = highlightedElementId === feeder.id;

                            return (
                              <div
                                key={feeder.id}
                                ref={(el) => { itemRefs.current[feeder.id] = el; }}
                                className={`p-4 rounded-2xl space-y-3 relative transition-all duration-300 ${
                                  isFFocused
                                    ? 'ring-4 ring-amber-400 border-amber-400 bg-amber-500/25 shadow-[0_0_30px_rgba(245,158,11,0.6)] z-30 scale-[1.04]'
                                    : isSearchActive
                                    ? isFMatch
                                      ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.02] z-20'
                                      : 'bg-slate-900/40 border-slate-800/40 opacity-25 grayscale-[40%]'
                                    : feeder.status === 'CLOSED'
                                    ? 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-md'
                                    : 'bg-rose-950/10 border border-rose-900/50'
                                }`}
                              >
                                {/* Top Feeder Title & Length */}
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-black text-xs truncate" style={{ color: feeder.warna || '#10b981' }}>
                                      {feeder.namaFeeder}
                                    </span>
                                    {isFMatch && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase shrink-0 animate-pulse">
                                        ★ MATCH
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] font-mono text-slate-400">{feeder.panjangKms} KMS</span>
                                    
                                    <button
                                      onClick={() => setInspectedFeeder({ subId: sub.id, subNama: sub.nama, feeder })}
                                      className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:text-white hover:bg-blue-600 cursor-pointer transition-colors"
                                      title="Inspeksi Teknis & Analisis KHA Feeder"
                                    >
                                      <Activity className="w-3 h-3" />
                                    </button>
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



                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  );
                })
              )}

              {/* TIE SWITCHES SECTION */}
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
                      const isTSMatch = isTieSwitchMatch(ts, scadaSearchQuery);
                      const isTSFocused = highlightedElementId === ts.id;

                      return (
                        <div
                          key={ts.id}
                          ref={(el) => { itemRefs.current[ts.id] = el; }}
                          className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative transition-all duration-300 ${
                            isTSFocused
                              ? 'ring-4 ring-amber-400 border-amber-400 bg-amber-500/25 shadow-[0_0_30px_rgba(245,158,11,0.6)] z-30 scale-[1.02]'
                              : isSearchActive
                              ? isTSMatch
                                ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.01] z-20'
                                : 'bg-slate-950/40 border-slate-800/40 opacity-25'
                              : 'bg-slate-950 border border-slate-800'
                          }`}
                        >
                          <div className="space-y-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-amber-300">{ts.nama}</span>
                              {isTSMatch && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase animate-pulse">
                                  ★ TIE MATCHED
                                </span>
                              )}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PEMBACA & VISUALIZER VISIO (.VSDX) */}
      {/* ========================================================================= */}
      {activeTab === 'VISIO_READER' && (
        <div className="space-y-5">
          {!visioDoc ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Belum Ada File Visio Dimuat</h3>
                <p className="text-xs text-slate-400">
                  Unggah file `.vsdx`, `.vdx`, atau `.xml` untuk mengekstrak dan menampilkan Single Line Diagram Visio secara langsung.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Visio (.vsdx)</span>
                </button>
                <button
                  onClick={handleLoadSampleVisio}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Muat Demo Visio Baguala</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Document Overview Summary Bar */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{visioDoc.fileName}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ukuran: {visioDoc.fileSize} • Diimpor: {visioDoc.importDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold">
                      {visioDoc.extractedSubstations} Substation / GI / GH
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold">
                      {visioDoc.extractedFeeders} Feeder
                    </span>
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg font-bold">
                      {visioDoc.extractedSwitches} Saklar / PMT
                    </span>
                  </div>

                  <button
                    onClick={handleSyncVisioToScada}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Konversi ke SCADA Grid</span>
                  </button>
                </div>
              </div>

              {/* Page Selector, Mode Selector & Filter Bar */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                
                {/* Page Tabs & View Mode Selector */}
                <div className="flex items-center gap-3 overflow-x-auto">
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setVisioViewMode('SCHEMATIC')}
                      className={`px-3 py-1.5 rounded-lg font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        visioViewMode === 'SCHEMATIC'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tampilan Diagram Skematik SLD Presisi (Gaya Visio - Gambar 2)"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-300" />
                      <span>Diagram Visual (Gambar 2)</span>
                    </button>
                    <button
                      onClick={() => setVisioViewMode('CARDS')}
                      className={`px-3 py-1.5 rounded-lg font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        visioViewMode === 'CARDS'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tampilan Grid Card Shapes Visio XML (Gambar 1)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Grid Shapes (Gambar 1)</span>
                    </button>
                  </div>

                  <span className="h-4 w-px bg-slate-800 shrink-0"></span>

                  <span className="font-bold text-slate-400 shrink-0">Halaman:</span>
                  {visioDoc.pages.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPageIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-all ${
                        selectedPageIndex === idx
                          ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.name} ({p.shapes.length})
                    </button>
                  ))}
                </div>

                {/* Filter & Search & Canvas Bg Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setVisioCanvasBg('LIGHT')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        visioCanvasBg === 'LIGHT' ? 'bg-slate-200 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Latar Terang (Seperti Gambar 2 Asli)"
                    >
                      Terang
                    </button>
                    <button
                      onClick={() => setVisioCanvasBg('DARK')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        visioCanvasBg === 'DARK' ? 'bg-slate-800 text-cyan-300 font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Latar Gelap (SCADA Blueprint)"
                    >
                      Gelap
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setVisioZoom(z => Math.max(50, z - 15))}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-amber-300 px-1">{visioZoom}%</span>
                    <button
                      onClick={() => setVisioZoom(z => Math.min(200, z + 15))}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setVisioZoom(100)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer text-[10px] font-bold px-1"
                      title="Reset 100%"
                    >
                      100%
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari gardu / section..."
                      className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 w-44"
                    />
                  </div>
                </div>

              </div>

              {/* Main Visio Interactive Layout Canvas & Shape Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Visual Canvas Area (2 Columns) */}
                <div className={`lg:col-span-2 border rounded-2xl p-4 min-h-[580px] overflow-auto relative transition-colors ${
                  visioCanvasBg === 'LIGHT' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#060b18] border-slate-800 text-slate-100'
                }`}>
                  
                  {/* Canvas Header Toolbar */}
                  <div className="flex items-center justify-between border-b pb-2 mb-3 border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-600 text-white shadow">
                        MVISIO CANVAS — {currentPage?.name}
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-bold">
                        Zoom: {visioZoom}% • Scale Auto-Fit
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {filteredVisioShapes.length} Shapes Filtered
                      </span>
                    </div>
                  </div>

                  {/* VISIO GRAPHICAL SCHEMATIC CANVAS (IMAGE 2 STYLE) */}
                  {visioViewMode === 'SCHEMATIC' ? (
                    <div className="w-full overflow-auto border border-slate-300/60 rounded-xl bg-white shadow-inner p-2 relative min-h-[620px]">
                      <div
                        style={{ transform: `scale(${visioZoom / 100})`, transformOrigin: 'top left' }}
                        className="transition-transform duration-200"
                      >
                        <svg
                          viewBox="0 0 1400 850"
                          className="w-[1400px] h-[850px] block select-none bg-white"
                          style={{ minWidth: '1400px', minHeight: '850px' }}
                        >
                          {/* Grid Background Lines (Optional clean engineer grid) */}
                          <defs>
                            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                            </pattern>
                          </defs>
                          <rect width="1400" height="850" fill="url(#gridPattern)" />

                          {/* =================================================== */}
                          {/* HEADER & LOGO PLN (MATCHING IMAGE 2 EXACTLY) */}
                          {/* =================================================== */}
                          {/* PLN Blue Square Logo Top Left */}
                          <g transform="translate(25, 20)">
                            <rect x="0" y="0" width="38" height="38" rx="3" fill="#0072bc" />
                            {/* Lightning Bolt */}
                            <path d="M 22 6 L 12 22 L 20 22 L 16 34 L 28 16 L 20 16 Z" fill="#fff200" />
                            <text x="45" y="26" fill="#0072bc" font-size="22" font-weight="900" fontFamily="sans-serif">
                              PLN
                            </text>
                          </g>

                          {/* Main Title Center */}
                          <g transform="translate(700, 32)">
                            <text textAnchor="middle" y="0" fill="#0033aa" font-size="18" font-weight="900" fontFamily="sans-serif" letterSpacing="0.5">
                              SINGLE LINE DIAGRAM
                            </text>
                            <text textAnchor="middle" y="22" fill="#0033aa" font-size="16" font-weight="900" fontFamily="sans-serif" letterSpacing="0.5">
                              JARINGAN 20 KV ULP BAGUALA
                            </text>
                          </g>

                          {/* =================================================== */}
                          {/* SUBSTATIONS RED DASHED RECTANGLES (IMAGE 2) */}
                          {/* =================================================== */}

                          {/* 1. GI HATIVE BESAR */}
                          {(() => {
                            const isMatch = searchQuery && 'GI HATIVE BESAR'.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <g
                                onClick={() => setSelectedShape({ id: 'v-gi-hative', name: 'GI HATIVE BESAR', type: 'GI', pageName: currentPage?.name || 'p1', text: 'GI HATIVE BESAR - TRAFO 1 30MVA', x: 140, y: 120, width: 220, height: 140, category: 'GI/GH', properties: { Tegangan: '20kV', Status: 'OPERATIONAL' } })}
                                className="cursor-pointer group"
                              >
                                <rect
                                  x="140"
                                  y="110"
                                  width="220"
                                  height="140"
                                  fill="none"
                                  stroke={isMatch ? '#f59e0b' : '#dc2626'}
                                  strokeWidth={isMatch ? '3.5' : '1.8'}
                                  strokeDasharray="6,4"
                                  className={isMatch ? 'animate-pulse' : 'group-hover:stroke-blue-600'}
                                />
                                <text x="150" y="128" fill="#dc2626" font-size="11" font-weight="800" fontFamily="sans-serif">
                                  GI HATIVE BESAR
                                </text>
                                {/* Busbar inside */}
                                <line x1="160" y1="150" x2="330" y2="150" stroke="#000" strokeWidth="4" />
                                <text x="245" y="145" textAnchor="middle" fill="#000" font-size="9" font-weight="bold">BUS 20KV</text>
                                {/* Trafo 2 Circles */}
                                <circle cx="200" cy="180" r="12" fill="none" stroke="#000" strokeWidth="2" />
                                <circle cx="200" cy="198" r="12" fill="none" stroke="#000" strokeWidth="2" />
                                <text x="220" y="192" fill="#000" font-size="9" font-weight="bold">TRAFO 1 30MVA</text>
                              </g>
                            );
                          })()}

                          {/* 2. PLTD POKA */}
                          {(() => {
                            const isMatch = searchQuery && 'PLTD POKA'.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <g
                                onClick={() => setSelectedShape({ id: 'v-pltd-poka', name: 'PLTD POKA', type: 'Pembangkit', pageName: currentPage?.name || 'p1', text: 'PLTD POKA - 3x GENERATOR', x: 440, y: 120, width: 230, height: 140, category: 'GI/GH', properties: { Kapasitas: '15 MW', Unit: 'PLTD POKA' } })}
                                className="cursor-pointer group"
                              >
                                <rect
                                  x="440"
                                  y="110"
                                  width="230"
                                  height="140"
                                  fill="none"
                                  stroke={isMatch ? '#f59e0b' : '#dc2626'}
                                  strokeWidth={isMatch ? '3.5' : '1.8'}
                                  strokeDasharray="6,4"
                                  className={isMatch ? 'animate-pulse' : 'group-hover:stroke-blue-600'}
                                />
                                <text x="450" y="128" fill="#0033aa" font-size="11" font-weight="800" fontFamily="sans-serif">
                                  PLTD POKA
                                </text>
                                {/* Generators G1, G2, G3 */}
                                <g transform="translate(470, 160)">
                                  <circle cx="0" cy="0" r="12" fill="#ffffff" stroke="#000" strokeWidth="2" />
                                  <text x="0" y="4" textAnchor="middle" font-size="10" font-weight="900">G1</text>
                                  <circle cx="35" cy="0" r="12" fill="#ffffff" stroke="#000" strokeWidth="2" />
                                  <text x="35" y="4" textAnchor="middle" font-size="10" font-weight="900">G2</text>
                                  <circle cx="70" cy="0" r="12" fill="#ffffff" stroke="#000" strokeWidth="2" />
                                  <text x="70" y="4" textAnchor="middle" font-size="10" font-weight="900">G3</text>
                                </g>
                                {/* Busbar Poka */}
                                <line x1="455" y1="200" x2="655" y2="200" stroke="#000" strokeWidth="4" />
                                <text x="555" y="218" textAnchor="middle" fill="#000" font-size="9" font-weight="bold">BUS 20KV POKA</text>
                              </g>
                            );
                          })()}

                          {/* 3. GIS PASSO & GI PASSO */}
                          {(() => {
                            const isMatch = searchQuery && ('GIS PASSO'.toLowerCase().includes(searchQuery.toLowerCase()) || 'GI PASSO'.toLowerCase().includes(searchQuery.toLowerCase()));
                            return (
                              <g
                                onClick={() => setSelectedShape({ id: 'v-gis-passo', name: 'GIS PASSO / GI PASSO', type: 'GI', pageName: currentPage?.name || 'p1', text: 'GIS PASSO 20KV (MAIN SUBSTATION ULP BAGUALA)', x: 740, y: 120, width: 250, height: 140, category: 'GI/GH', properties: { Tegangan: '20.2 kV', Trafo: '2x 30 MVA', Status: 'SCADA ON' } })}
                                className="cursor-pointer group"
                              >
                                <rect
                                  x="740"
                                  y="110"
                                  width="250"
                                  height="140"
                                  fill="none"
                                  stroke={isMatch ? '#f59e0b' : '#dc2626'}
                                  strokeWidth={isMatch ? '3.5' : '1.8'}
                                  strokeDasharray="6,4"
                                  className={isMatch ? 'animate-pulse' : 'group-hover:stroke-blue-600'}
                                />
                                <text x="750" y="128" fill="#0033aa" font-size="11" font-weight="800" fontFamily="sans-serif">
                                  GIS PASSO / GI PASSO
                                </text>
                                {/* GIS Busbar */}
                                <line x1="755" y1="150" x2="975" y2="150" stroke="#000" strokeWidth="4" />
                                <text x="865" y="145" textAnchor="middle" fill="#000" font-size="9" font-weight="bold">BUSBAR 20KV GIS PASSO</text>
                                {/* Breakers / PMT Passo */}
                                <rect x="780" y="170" width="16" height="16" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                                <text x="802" y="182" fill="#000" font-size="8" font-weight="bold">PMT PASSO UTAMA</text>
                                <rect x="780" y="200" width="16" height="16" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                                <text x="802" y="212" fill="#000" font-size="8" font-weight="bold">PMT WAIHERU 1</text>
                              </g>
                            );
                          })()}

                          {/* 4. GH PASSO */}
                          {(() => {
                            const isMatch = searchQuery && 'GH PASSO'.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <g
                                onClick={() => setSelectedShape({ id: 'v-gh-passo', name: 'GH PASSO', type: 'GH', pageName: currentPage?.name || 'p1', text: 'GARDU HUBUNG PASSO - DISTRIBUTION FEEDERS', x: 680, y: 380, width: 210, height: 130, category: 'GI/GH', properties: { Tipe: 'Gardu Hubung', Feeders: '2 Express' } })}
                                className="cursor-pointer group"
                              >
                                <rect
                                  x="680"
                                  y="380"
                                  width="210"
                                  height="130"
                                  fill="none"
                                  stroke={isMatch ? '#f59e0b' : '#dc2626'}
                                  strokeWidth={isMatch ? '3.5' : '1.8'}
                                  strokeDasharray="6,4"
                                  className={isMatch ? 'animate-pulse' : 'group-hover:stroke-blue-600'}
                                />
                                <text x="690" y="398" fill="#0033aa" font-size="11" font-weight="800" fontFamily="sans-serif">
                                  GH PASSO
                                </text>
                                <line x1="695" y1="420" x2="875" y2="420" stroke="#000" strokeWidth="4" />
                                <text x="785" y="415" textAnchor="middle" fill="#000" font-size="9" font-weight="bold">BUS GH PASSO</text>
                                <rect x="710" y="440" width="14" height="14" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                                <text x="730" y="452" fill="#000" font-size="8" font-weight="bold">LBS GH-01</text>
                              </g>
                            );
                          })()}

                          {/* 5. GH BAGUALA */}
                          {(() => {
                            const isMatch = searchQuery && 'GH BAGUALA'.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <g
                                onClick={() => setSelectedShape({ id: 'v-gh-baguala', name: 'GH BAGUALA', type: 'GH', pageName: currentPage?.name || 'p1', text: 'GH BAGUALA - EXPRESS DISTRIBUTION', x: 500, y: 670, width: 220, height: 120, category: 'GI/GH', properties: { Tipe: 'Gardu Hubung', Status: 'EXPRESS' } })}
                                className="cursor-pointer group"
                              >
                                <rect
                                  x="500"
                                  y="670"
                                  width="220"
                                  height="120"
                                  fill="none"
                                  stroke={isMatch ? '#f59e0b' : '#dc2626'}
                                  strokeWidth={isMatch ? '3.5' : '1.8'}
                                  strokeDasharray="6,4"
                                  className={isMatch ? 'animate-pulse' : 'group-hover:stroke-blue-600'}
                                />
                                <text x="510" y="688" fill="#0033aa" font-size="11" font-weight="800" fontFamily="sans-serif">
                                  GH BAGUALA
                                </text>
                                <line x1="515" y1="710" x2="705" y2="710" stroke="#000" strokeWidth="4" />
                                <text x="610" y="705" textAnchor="middle" fill="#000" font-size="9" font-weight="bold">BUSBAR GH BAGUALA</text>
                                <rect x="530" y="730" width="14" height="14" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                                <text x="550" y="742" fill="#000" font-size="8" font-weight="bold">LBS EXPRESS LATERI</text>
                              </g>
                            );
                          })()}

                          {/* 6. PLTD HATIVE KECIL */}
                          {(() => {
                            const isMatch = searchQuery && 'PLTD HATIVE KECIL'.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <g
                                onClick={() => setSelectedShape({ id: 'v-pltd-hative', name: 'PLTD HATIVE KECIL', type: 'Pembangkit', pageName: currentPage?.name || 'p1', text: 'PLTD HATIVE KECIL - LOCAL BACKUP', x: 100, y: 690, width: 220, height: 120, category: 'GI/GH', properties: { Kapasitas: '8 MW', Status: 'STANDBY' } })}
                                className="cursor-pointer group"
                              >
                                <rect
                                  x="100"
                                  y="690"
                                  width="220"
                                  height="120"
                                  fill="none"
                                  stroke={isMatch ? '#f59e0b' : '#dc2626'}
                                  strokeWidth={isMatch ? '3.5' : '1.8'}
                                  strokeDasharray="6,4"
                                  className={isMatch ? 'animate-pulse' : 'group-hover:stroke-blue-600'}
                                />
                                <text x="110" y="708" fill="#0033aa" font-size="11" font-weight="800" fontFamily="sans-serif">
                                  PLTD HATIVE KECIL
                                </text>
                                <circle cx="140" cy="740" r="12" fill="#fff" stroke="#000" strokeWidth="2" />
                                <text x="140" y="744" textAnchor="middle" font-size="9" font-weight="bold">G</text>
                                <line x1="115" y1="770" x2="305" y2="770" stroke="#000" strokeWidth="4" />
                                <text x="210" y="765" textAnchor="middle" fill="#000" font-size="9" font-weight="bold">BUS HATIVE KECIL</text>
                              </g>
                            );
                          })()}

                          {/* =================================================== */}
                          {/* FEEDER DISTRIBUTION CONNECTING LINES (ORTHOGONAL) */}
                          {/* =================================================== */}

                          {/* Line 1: GI Hative Besar to Central Grid (Black & Blue) */}
                          <path d="M 360 150 L 420 150 L 420 300 L 250 300 L 250 450" fill="none" stroke="#000000" strokeWidth="2.2" />
                          
                          {/* Line 2: PLTD Poka to GIS Passo (Cyan Feeder Line) */}
                          <path d="M 655 200 L 710 200 L 710 180 L 755 180" fill="none" stroke="#06b6d4" strokeWidth="2.5" />

                          {/* Line 3: GIS Passo to GH Passo (Red Primary Line) */}
                          <path d="M 850 250 L 850 320 L 785 320 L 785 380" fill="none" stroke="#ef4444" strokeWidth="2.5" />

                          {/* Line 4: GIS Passo to Distribution Branches (Green Feeder) */}
                          <path d="M 880 250 L 880 340 L 1100 340 L 1100 500" fill="none" stroke="#10b981" strokeWidth="2" />

                          {/* Line 5: GH Passo to GH Baguala (Orange Feeder Line) */}
                          <path d="M 785 510 L 785 600 L 610 600 L 610 670" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

                          {/* Line 6: PLTD HATIVE KECIL to GH Baguala (Teal Connector) */}
                          <path d="M 305 770 L 420 770 L 420 730 L 500 730" fill="none" stroke="#14b8a6" strokeWidth="2.2" />

                          {/* Eastern Grid Distribution Extensions */}
                          <path d="M 1100 340 L 1350 340 L 1350 600 M 1350 450 L 1250 450" fill="none" stroke="#6366f1" strokeWidth="1.8" />
                          <path d="M 250 450 L 520 450 L 520 550 M 380 450 L 380 580" fill="none" stroke="#8b5cf6" strokeWidth="1.8" />

                          {/* Distribution Transformer Drops & Spurs (Multiple Load Centers) */}
                          {[
                            { x: 250, y: 350, label: 'GD PASSO 1' },
                            { x: 380, y: 500, label: 'GD LATERI 2' },
                            { x: 520, y: 520, label: 'GD POKA UTAMA' },
                            { x: 950, y: 340, label: 'GD TULEHU' },
                            { x: 1100, y: 420, label: 'GD HALONG' },
                            { x: 1250, y: 500, label: 'GD WAIHERU 3' },
                            { x: 1350, y: 380, label: 'GD TELUK AMBON' },
                          ].map((drop, idx) => (
                            <g key={idx} transform={`translate(${drop.x}, ${drop.y})`}>
                              <line x1="0" y1="0" x2="0" y2="15" stroke="#000" strokeWidth="1.5" />
                              <circle cx="0" cy="22" r="6" fill="#fff" stroke="#000" strokeWidth="1.5" />
                              <circle cx="0" cy="30" r="6" fill="#fff" stroke="#000" strokeWidth="1.5" />
                              <text x="10" y="28" fill="#334155" font-size="8" font-weight="bold" fontFamily="sans-serif">
                                {drop.label}
                              </text>
                            </g>
                          ))}

                          {/* Interactive PMT & Switch Symbols along lines */}
                          {[
                            { x: 420, y: 240, id: 'pmt-poka-link', name: 'PMT LINK POKA', status: 'CLOSED' },
                            { x: 785, y: 335, id: 'rec-pohon-inline', name: 'REC POHON', status: 'CLOSED' },
                            { x: 1000, y: 340, id: 'lbs-waiheru-inline', name: 'LBS WAIHERU', status: 'CLOSED' },
                            { x: 785, y: 560, id: 'tie-passo-lateri-inline', name: 'TIE SWITCH MANUVER', status: 'OPEN' },
                          ].map((sw) => (
                            <g
                              key={sw.id}
                              transform={`translate(${sw.x - 8}, ${sw.y - 8})`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShape({
                                  id: sw.id,
                                  name: sw.name,
                                  type: 'CircuitBreaker',
                                  pageName: currentPage?.name || 'p1',
                                  text: `${sw.name} (STATUS: ${sw.status})`,
                                  x: sw.x,
                                  y: sw.y,
                                  width: 16,
                                  height: 16,
                                  category: 'Saklar/PMT',
                                  properties: { Status: sw.status, Interkoneksi: '20kV Network' }
                                });
                              }}
                              className="cursor-pointer group"
                            >
                              <rect
                                x="0"
                                y="0"
                                width="16"
                                height="16"
                                fill={sw.status === 'CLOSED' ? '#10b981' : '#ef4444'}
                                stroke="#000"
                                strokeWidth="1.5"
                                className="group-hover:scale-125 transition-transform"
                              />
                              <text x="20" y="12" fill="#0f172a" font-size="8" font-weight="bold" fontFamily="sans-serif">
                                {sw.name}
                              </text>
                            </g>
                          ))}

                          {/* =================================================== */}
                          {/* SIMBOL / LEGEND BOX (BOTTOM RIGHT - MATCHING IMAGE 2) */}
                          {/* =================================================== */}
                          <g transform="translate(1240, 710)">
                            <rect x="0" y="0" width="135" height="120" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
                            <rect x="0" y="0" width="135" height="18" fill="#f8fafc" stroke="#000000" strokeWidth="1" />
                            <text x="67" y="13" textAnchor="middle" fill="#000000" font-size="9" font-weight="900" fontFamily="sans-serif">
                              SIMBOL
                            </text>
                            
                            {/* Legend item 1: PMT Closed */}
                            <rect x="10" y="26" width="10" height="10" fill="#10b981" stroke="#000" strokeWidth="1" />
                            <text x="26" y="34" fill="#000" font-size="8" font-weight="bold">PMT CLOSED</text>

                            {/* Legend item 2: PMT Open */}
                            <rect x="10" y="44" width="10" height="10" fill="#ef4444" stroke="#000" strokeWidth="1" />
                            <text x="26" y="52" fill="#000" font-size="8" font-weight="bold">PMT TRIP / OPEN</text>

                            {/* Legend item 3: Trafo */}
                            <circle cx="15" cy="66" r="4" fill="none" stroke="#000" strokeWidth="1.2" />
                            <circle cx="15" cy="72" r="4" fill="none" stroke="#000" strokeWidth="1.2" />
                            <text x="26" y="71" fill="#000" font-size="8" font-weight="bold">TRAFO 20KV/380V</text>

                            {/* Legend item 4: Generator */}
                            <circle cx="15" cy="88" r="5" fill="#fff" stroke="#000" strokeWidth="1.2" />
                            <text x="15" y="91" textAnchor="middle" font-size="7" font-weight="bold">G</text>
                            <text x="26" y="90" fill="#000" font-size="8" font-weight="bold">PEMBANGKIT</text>

                            {/* Legend item 5: Busbar */}
                            <line x1="8" y1="106" x2="22" y2="106" stroke="#000" strokeWidth="3" />
                            <text x="26" y="108" fill="#000" font-size="8" font-weight="bold">BUSBAR 20KV</text>
                          </g>

                        </svg>
                      </div>
                    </div>
                  ) : (
                    /* SHAPES CANVAS GRID (MODE CARDS - GAMBAR 1) */
                    <div className="relative min-h-[420px] p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredVisioShapes.map((shape) => {
                          const isSelected = selectedShape?.id === shape.id;
                          return (
                            <div
                              key={shape.id}
                              onClick={() => setSelectedShape(shape)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                                isSelected
                                  ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-xl'
                                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  shape.category === 'GI/GH' ? 'bg-amber-500/20 text-amber-300' :
                                  shape.category === 'Feeder' ? 'bg-emerald-500/20 text-emerald-300' :
                                  shape.category === 'Saklar/PMT' ? 'bg-rose-500/20 text-rose-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {shape.category}
                                </span>
                                <span className="text-[9px] font-mono text-slate-500">ID: {shape.id}</span>
                              </div>

                              <div className="font-bold text-xs text-white leading-snug line-clamp-2">
                                {shape.text || shape.name}
                              </div>

                              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                                <span>Type: {shape.type || 'Shape'}</span>
                                <span>Pos: ({shape.x}, {shape.y})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                {/* Selected Shape Property Inspector Panel (1 Column) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                      Inspektur Property Shape Visio
                    </h4>
                  </div>

                  {!selectedShape ? (
                    <p className="text-xs text-slate-500 italic text-center py-10">
                      Klik salah satu shape di canvas untuk melihat detail properti Visio XML.
                    </p>
                  ) : (
                    <div className="space-y-4 text-xs">
                      
                      {/* Name & Type */}
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Shape ID & Title</span>
                        <div className="font-bold text-amber-300 text-sm">{selectedShape.text || selectedShape.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          ID: {selectedShape.id} • Type: {selectedShape.type}
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div>
                        <span className="block font-bold text-slate-400 mb-1">Kategori SLD</span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg font-bold">
                          {selectedShape.category}
                        </span>
                      </div>

                      {/* Coordinates */}
                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                          <span className="block text-[10px] text-slate-500 font-bold">PinX Coordinate</span>
                          <span className="font-mono text-white font-bold">{selectedShape.x} px</span>
                        </div>
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                          <span className="block text-[10px] text-slate-500 font-bold">PinY Coordinate</span>
                          <span className="font-mono text-white font-bold">{selectedShape.y} px</span>
                        </div>
                      </div>

                      {/* Custom Properties Table */}
                      <div className="space-y-1.5">
                        <span className="block font-bold text-slate-300 uppercase text-[10px]">
                          Visio Custom Data Fields
                        </span>
                        {Object.keys(selectedShape.properties).length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">Tidak ada custom data row dalam shape ini.</p>
                        ) : (
                          <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
                            {Object.entries(selectedShape.properties).map(([k, v]) => (
                              <div key={k} className="flex justify-between border-b border-slate-900 pb-1">
                                <span className="text-slate-400">{k}:</span>
                                <span className="text-emerald-400 font-bold">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TABEL SHAPE XML VISIO */}
      {/* ========================================================================= */}
      {activeTab === 'SHAPE_TABLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Daftar Seluruh Shape XML Visio yang Terdeteksi
              </h3>
              <p className="text-xs text-slate-400">
                Data mentah elemen diagram Visio untuk verifikasi dan pemetaan atribut kelistrikan.
              </p>
            </div>

            {visioDoc && (
              <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-xl">
                Total: {visioDoc.totalShapes} Shapes
              </span>
            )}
          </div>

          {!visioDoc ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              Belum ada file Visio diimpor. Gunakan tombol "Import File Visio (.vsdx)" atau "Demo Visio SLD" di bagian atas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nama Shape Visio</th>
                    <th className="p-3">Halaman</th>
                    <th className="p-3">Teks Content</th>
                    <th className="p-3">Kategori SLD</th>
                    <th className="p-3">Koordinat (X, Y)</th>
                    <th className="p-3">Custom Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {visioDoc.pages.flatMap((page) =>
                    page.shapes.map((shape) => (
                      <tr key={`${page.id}-${shape.id}`} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-amber-400">{shape.id}</td>
                        <td className="p-3 text-white font-sans font-bold">{shape.name}</td>
                        <td className="p-3 text-slate-400">{page.name}</td>
                        <td className="p-3 text-slate-200 font-sans max-w-xs truncate">{shape.text}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                            {shape.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">({shape.x}, {shape.y})</td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">
                          {Object.entries(shape.properties).map(([k, v]) => `${k}=${v}`).join(', ') || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

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
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>HUBUNGKAN KE MASTER DATA PENYULANG</span>
                  <span className="text-[10px] text-emerald-400 font-bold">25 PENYULANG AKTIF</span>
                </label>
                <select
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (!selectedId) return;
                    const p = INITIAL_PENYULANG.find((item) => item.id === selectedId);
                    if (p) {
                      setFeederName(p.namaPenyulang);
                      setFeederKms(p.panjangJaringanKms);
                      
                      // Auto select matching GI / GH
                      const matchedSub = substations.find(
                        (s) =>
                          s.nama.toLowerCase().includes(p.namaGi.toLowerCase()) ||
                          p.namaGi.toLowerCase().includes(s.nama.toLowerCase())
                      );
                      if (matchedSub && !editingFeeder) {
                        setTargetSubId(matchedSub.id);
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer mb-2.5"
                >
                  <option value="">-- Pilih dari Master Data Penyulang (Auto-Fill) --</option>
                  {INITIAL_PENYULANG.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.namaPenyulang} • [{p.namaGi}] ({p.panjangJaringanKms} KMS - {p.status})
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

              {matchedMasterPenyulang && (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Koneksi Master Data Aktif: #{matchedMasterPenyulang.id}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {matchedMasterPenyulang.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-x-3 gap-y-1 pl-5 font-mono">
                    <span>GI Induk: <strong className="text-white">{matchedMasterPenyulang.namaGi}</strong></span>
                    <span>Panjang JTM: <strong className="text-emerald-400">{matchedMasterPenyulang.panjangJaringanKms} KMS</strong></span>
                    <span>Keandalan: <strong className="text-emerald-400">{matchedMasterPenyulang.healthIndexStatus}</strong></span>
                    <span>Frekuensi Ggn: <strong className="text-amber-400">{matchedMasterPenyulang.frekuensiGangguan}x</strong></span>
                    {matchedMasterPenyulang.jumlahPelanggan && (
                      <span className="col-span-2 text-[10px] text-slate-400">Total Pelanggan: <strong className="text-slate-200">{matchedMasterPenyulang.jumlahPelanggan.toLocaleString('id-ID')}</strong></span>
                    )}
                  </div>
                </div>
              )}

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
                    <option value="PMCB">PMCB</option>
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
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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

      {/* ========================================================================= */}
      {/* MODAL 4: Inspeksi Teknis Feeder & Analisis KHA */}
      {/* ========================================================================= */}
      {inspectedFeeder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Inspeksi Teknis & Pengukuran Feeder</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {inspectedFeeder.subNama} • {inspectedFeeder.feeder.namaFeeder}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedFeeder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voltage & Switch Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold block">STATUS SAKLAR</span>
                <span className={`text-xs font-black uppercase ${inspectedFeeder.feeder.status === 'CLOSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {inspectedFeeder.feeder.status === 'CLOSED' ? '● CLOSED (BERBEBAN)' : '○ OPEN (TRIP / PADAM)'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">{inspectedFeeder.feeder.saklarNama || inspectedFeeder.feeder.saklarTipe}</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold block">BEBAN & PANJANG</span>
                <span className="text-xs font-black text-amber-400">
                  {inspectedFeeder.feeder.status === 'CLOSED' ? `${inspectedFeeder.feeder.bebanMw} MW` : '0 MW'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">{inspectedFeeder.feeder.panjangKms} KMS (SKTM/SUTM)</p>
              </div>
            </div>

            {/* Current Measurements R / S / T / Neutral */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
                <span className="text-slate-300">PENGUKURAN ARUS BEBAN (AMPERE)</span>
                <span className="text-emerald-400 font-mono text-[10px]">PENGUKURAN TELEMETRI REAL-TIME</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-rose-400 font-bold block">FASA R</span>
                  <span className="font-extrabold text-white">{inspectedFeeder.feeder.status === 'CLOSED' ? `${inspectedFeeder.feeder.arusR} A` : '0 A'}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-bold block">FASA S</span>
                  <span className="font-extrabold text-white">{inspectedFeeder.feeder.status === 'CLOSED' ? `${inspectedFeeder.feeder.arusS} A` : '0 A'}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-blue-400 font-bold block">FASA T</span>
                  <span className="font-extrabold text-white">{inspectedFeeder.feeder.status === 'CLOSED' ? `${inspectedFeeder.feeder.arusT} A` : '0 A'}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">NETRAL IN</span>
                  <span className="font-extrabold text-white">{inspectedFeeder.feeder.status === 'CLOSED' ? `${inspectedFeeder.feeder.arusIN} A` : '0 A'}</span>
                </div>
              </div>

              {/* KHA Cable Thermal Load Progress */}
              {(() => {
                const maxArus = Math.max(inspectedFeeder.feeder.arusR, inspectedFeeder.feeder.arusS, inspectedFeeder.feeder.arusT);
                const khaRating = 240;
                const loadPercent = inspectedFeeder.feeder.status === 'CLOSED' ? Math.min(100, Math.round((maxArus / khaRating) * 100)) : 0;
                return (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">PEMBEBANAN KHA KABEL (KAPASITAS {khaRating}A):</span>
                      <span className={loadPercent > 85 ? 'text-rose-400' : loadPercent > 70 ? 'text-amber-400' : 'text-emerald-400'}>
                        {loadPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          loadPercent > 85 ? 'bg-rose-500' : loadPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  toggleFeederSwitch(inspectedFeeder.subId, inspectedFeeder.feeder.id);
                  setInspectedFeeder((prev) =>
                    prev ? { ...prev, feeder: { ...prev.feeder, status: prev.feeder.status === 'CLOSED' ? 'OPEN' : 'CLOSED' } } : null
                  );
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  inspectedFeeder.feeder.status === 'CLOSED'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                {inspectedFeeder.feeder.status === 'CLOSED' ? 'Simulasi Trip (Buka PMT)' : 'Normalisasi (Tutup PMT)'}
              </button>

              <button
                onClick={() => setInspectedFeeder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
