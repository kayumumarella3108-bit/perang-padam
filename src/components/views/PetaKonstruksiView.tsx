import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Wrench,
  Search,
  Plus,
  Filter,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  X,
  Check,
  Download,
  Upload,
  Calendar,
  Layers,
  Moon,
  Globe,
  Info,
  DollarSign,
  TrendingUp,
  HardHat,
  Building,
  Hammer,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';
import { KonstruksiGisItem, User, Penyulang } from '../../types';
import { ImportKonstruksiModal } from '../modals/ImportKonstruksiModal';

interface PetaKonstruksiViewProps {
  currentUser?: User | null;
  konstruksiList: KonstruksiGisItem[];
  penyulangList?: Penyulang[];
  onAddKonstruksi: (item: KonstruksiGisItem) => void;
  onImportBatch?: (items: KonstruksiGisItem[]) => void;
  onUpdateKonstruksi: (item: KonstruksiGisItem) => void;
  onDeleteKonstruksi: (id: string) => void;
}

export const PetaKonstruksiView: React.FC<PetaKonstruksiViewProps> = ({
  currentUser,
  konstruksiList,
  penyulangList = [],
  onAddKonstruksi,
  onImportBatch,
  onUpdateKonstruksi,
  onDeleteKonstruksi
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPenyulang, setSelectedPenyulang] = useState<string>('Semua');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [activeTab, setActiveTab] = useState<'peta' | 'tabel' | 'proyek'>('peta');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KonstruksiGisItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<KonstruksiGisItem | null>(null);

  // Form State
  const [formNamaProyek, setFormNamaProyek] = useState('');
  const [formNomorSpk, setFormNomorSpk] = useState('');
  const [formPenyulang, setFormPenyulang] = useState('PASSO');
  const [formSection, setFormSection] = useState('');
  const [formLokasi, setFormLokasi] = useState('');
  const [formLat, setFormLat] = useState<number>(-3.6260);
  const [formLng, setFormLng] = useState<number>(128.2380);
  const [formKategori, setFormKategori] = useState<KonstruksiGisItem['kategoriKonstruksi']>('Rekonstruksi Tiang Miring / Keropos');
  const [formStatus, setFormStatus] = useState<KonstruksiGisItem['statusProyek']>('Sedang Dikerjakan');
  const [formProgres, setFormProgres] = useState<number>(50);
  const [formTargetSelesai, setFormTargetSelesai] = useState<string>('2026-03-31');
  const [formTglMulai, setFormTglMulai] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formAnggaran, setFormAnggaran] = useState<number>(50000000);
  const [formPelaksana, setFormPelaksana] = useState('PT Maluku Daya Mandiri');
  const [formPengawas, setFormPengawas] = useState('Samsul Bahri (Supervisor Teknik)');
  const [formVolume, setFormVolume] = useState('4 Tiang Beton 12m/350daN');
  const [formKeterangan, setFormKeterangan] = useState('');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.FeatureGroup | null>(null);

  const getTileUrl = (style: 'dark' | 'satellite' | 'street') => {
    switch (style) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'street':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'dark':
      default:
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-3.62, 128.25],
      zoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tile = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap | Leaflet GIS'
    }).addTo(map);

    tileLayerRef.current = tile;
    layerGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    map.on('click', (e: L.LeafletMouseEvent) => {
      setFormLat(Number(e.latlng.lat.toFixed(6)));
      setFormLng(Number(e.latlng.lng.toFixed(6)));
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 19 }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapStyle]);

  // Filtered List
  const filteredList = konstruksiList.filter((item) => {
    const matchSearch =
      (item.namaProyek || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nomorSpk || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.penyulang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.lokasi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pelaksanaVendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pengawasPln || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchPenyulang = selectedPenyulang === 'Semua' || item.penyulang === selectedPenyulang;
    const matchKategori = selectedKategori === 'Semua' || item.kategoriKonstruksi === selectedKategori;
    const matchStatus = selectedStatus === 'Semua' || item.statusProyek === selectedStatus;

    return matchSearch && matchPenyulang && matchKategori && matchStatus;
  });

  // Calculate Statistics
  const totalProyek = konstruksiList.length;
  const onGoingProyek = konstruksiList.filter((k) => k.statusProyek === 'Sedang Dikerjakan' || k.statusProyek === 'Uji Komisioning').length;
  const selesaiProyek = konstruksiList.filter((k) => k.statusProyek === 'Selesai Beroperasi').length;
  const totalAnggaran = konstruksiList.reduce((acc, curr) => acc + (curr.anggaranRp || 0), 0);
  const avgProgres = totalProyek > 0 ? Math.round(konstruksiList.reduce((acc, curr) => acc + (curr.progresPersen || 0), 0) / totalProyek) : 0;

  // Render Polylines & Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    filteredList.forEach((item) => {
      if (!item.lat || !item.lng) return;

      // Status Color
      let statusColor = '#3B82F6'; // Blue
      if (item.statusProyek === 'Sedang Dikerjakan') statusColor = '#F59E0B'; // Amber
      if (item.statusProyek === 'Uji Komisioning') statusColor = '#8B5CF6'; // Purple
      if (item.statusProyek === 'Selesai Beroperasi') statusColor = '#10B981'; // Emerald

      // Draw polyline if exists
      if (item.coordinatesPolyline && item.coordinatesPolyline.length > 1) {
        const polyline = L.polyline(item.coordinatesPolyline, {
          color: statusColor,
          weight: 5,
          opacity: 0.85,
          dashArray: item.statusProyek === 'Sedang Dikerjakan' ? '8, 8' : undefined
        }).addTo(lg);

        polyline.bindTooltip(`${item.namaProyek} (${item.progresPersen}%)`, {
          sticky: true,
          className: 'custom-leaflet-tooltip'
        });
      }

      // Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-construction-pin',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: ${statusColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: #ffffff;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div style="position: absolute; bottom: -8px; background: #0f172a; color: #f8fafc; font-size: 9.5px; font-weight: 800; padding: 1px 5px; border-radius: 5px; border: 1px solid ${statusColor}; white-space: nowrap;">
              ${item.progresPersen}%
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(lg);

      const formatRupiah = (num?: number) => {
        if (!num) return 'Rp 0';
        return 'Rp ' + num.toLocaleString('id-ID');
      };

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 270px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="font-weight: 800; font-size: 13px; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 2px; background: ${statusColor};"></span>
              ${item.penyulang}
            </div>
            <span style="font-size: 10px; font-weight: 800; background: ${statusColor}25; color: ${statusColor}; border: 1px solid ${statusColor}60; padding: 2px 6px; border-radius: 6px;">
              ${item.statusProyek} (${item.progresPersen}%)
            </span>
          </div>

          <div style="font-size: 12px; font-weight: 800; color: #38bdf8; margin-bottom: 6px;">
            ${item.namaProyek}
          </div>

          <div style="font-size: 11px; color: #cbd5e1; space-y: 4px; line-height: 1.5;">
            <div><strong>📜 SPK:</strong> ${item.nomorSpk || '-'}</div>
            <div><strong>📍 Lokasi:</strong> ${item.lokasi}</div>
            <div><strong>🏗️ Kategori:</strong> ${item.kategoriKonstruksi}</div>
            <div><strong>📦 Volume:</strong> ${item.volumeAset}</div>
            <div><strong>💰 Anggaran:</strong> <span style="color: #4ade80; font-weight: 700;">${formatRupiah(item.anggaranRp)}</span></div>
            <div><strong>🏢 Vendor:</strong> ${item.pelaksanaVendor}</div>
            <div><strong>👷 Pengawas PLN:</strong> ${item.pengawasPln}</div>
            <div><strong>🎯 Target Selesai:</strong> ${item.targetSelesai}</div>
            ${item.keterangan ? `<div style="margin-top: 6px; padding: 6px; background: rgba(30,41,59,0.7); border-radius: 6px; font-style: italic; color: #94a3b8; font-size: 10.5px;">${item.keterangan}</div>` : ''}
          </div>

          <div style="margin-top: 10px; display: flex; gap: 6px;">
            <button onclick="window.viewKonstruksiDetail('${item.id}')" style="flex: 1; background: #0284c7; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              🔍 Detail & Progres
            </button>
            <button onclick="window.quickDoneKonstruksi('${item.id}')" style="background: #059669; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              ✓ 100% Selesai
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
    });

    if (filteredList.length > 0) {
      const bounds = lg.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [filteredList]);

  // Window Callbacks
  useEffect(() => {
    (window as any).viewKonstruksiDetail = (id: string) => {
      const found = konstruksiList.find((k) => k.id === id);
      if (found) setSelectedDetail(found);
    };

    (window as any).quickDoneKonstruksi = (id: string) => {
      const found = konstruksiList.find((k) => k.id === id);
      if (found) {
        onUpdateKonstruksi({
          ...found,
          statusProyek: 'Selesai Beroperasi',
          progresPersen: 100
        });
      }
    };

    return () => {
      delete (window as any).viewKonstruksiDetail;
      delete (window as any).quickDoneKonstruksi;
    };
  }, [konstruksiList, onUpdateKonstruksi]);

  // Form Reset / Open
  const openAddModal = () => {
    setEditingItem(null);
    setFormNamaProyek('');
    setFormNomorSpk(`SPK/KONST/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`);
    setFormPenyulang(penyulangList[0]?.namaPenyulang || 'PASSO');
    setFormSection('');
    setFormLokasi('');
    setFormLat(-3.6260);
    setFormLng(128.2380);
    setFormKategori('Rekonstruksi Tiang Miring / Keropos');
    setFormStatus('Sedang Dikerjakan');
    setFormProgres(50);
    setFormTargetSelesai('2026-03-31');
    setFormTglMulai(new Date().toISOString().split('T')[0]);
    setFormAnggaran(50000000);
    setFormPelaksana('PT Maluku Daya Mandiri');
    setFormPengawas('Samsul Bahri (Supervisor Teknik)');
    setFormVolume('4 Tiang Beton 12m/350daN');
    setFormKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: KonstruksiGisItem) => {
    setEditingItem(item);
    setFormNamaProyek(item.namaProyek);
    setFormNomorSpk(item.nomorSpk || '');
    setFormPenyulang(item.penyulang);
    setFormSection(item.section || '');
    setFormLokasi(item.lokasi);
    setFormLat(item.lat);
    setFormLng(item.lng);
    setFormKategori(item.kategoriKonstruksi);
    setFormStatus(item.statusProyek);
    setFormProgres(item.progresPersen);
    setFormTargetSelesai(item.targetSelesai);
    setFormTglMulai(item.tglMulai || '');
    setFormAnggaran(item.anggaranRp || 0);
    setFormPelaksana(item.pelaksanaVendor);
    setFormPengawas(item.pengawasPln);
    setFormVolume(item.volumeAset);
    setFormKeterangan(item.keterangan || '');
    setIsModalOpen(true);
    setSelectedDetail(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaProyek || !formPenyulang || !formLokasi || !formLat || !formLng) {
      alert('Mohon lengkapi Nama Proyek, Penyulang, Lokasi, dan Koordinat GIS!');
      return;
    }

    const payload: KonstruksiGisItem = {
      id: editingItem ? editingItem.id : `kst-${Date.now()}`,
      namaProyek: formNamaProyek,
      nomorSpk: formNomorSpk,
      penyulang: formPenyulang,
      section: formSection,
      lokasi: formLokasi,
      lat: Number(formLat),
      lng: Number(formLng),
      kategoriKonstruksi: formKategori,
      statusProyek: formStatus,
      progresPersen: Number(formProgres),
      targetSelesai: formTargetSelesai,
      tglMulai: formTglMulai,
      anggaranRp: Number(formAnggaran),
      pelaksanaVendor: formPelaksana,
      pengawasPln: formPengawas,
      volumeAset: formVolume,
      keterangan: formKeterangan,
      coordinatesPolyline: editingItem?.coordinatesPolyline || [
        [Number(formLat) - 0.001, Number(formLng) - 0.001],
        [Number(formLat), Number(formLng)],
        [Number(formLat) + 0.001, Number(formLng) + 0.001]
      ]
    };

    if (editingItem) {
      onUpdateKonstruksi(payload);
    } else {
      onAddKonstruksi(payload);
    }

    setIsModalOpen(false);
  };

  const handleBatchImport = (items: KonstruksiGisItem[]) => {
    if (onImportBatch) {
      onImportBatch(items);
    } else {
      items.forEach((it) => onAddKonstruksi(it));
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Nama Proyek',
      'No SPK',
      'Penyulang',
      'Section',
      'Lokasi',
      'Latitude',
      'Longitude',
      'Kategori Konstruksi',
      'Status Proyek',
      'Progres (%)',
      'Anggaran (Rp)',
      'Vendor Pelaksana',
      'Pengawas PLN',
      'Target Selesai',
      'Volume Aset',
      'Keterangan'
    ];

    const rows = filteredList.map((k) => [
      k.id,
      `"${(k.namaProyek || '').replace(/"/g, '""')}"`,
      k.nomorSpk || '-',
      k.penyulang,
      k.section || '-',
      `"${(k.lokasi || '').replace(/"/g, '""')}"`,
      k.lat,
      k.lng,
      `"${k.kategoriKonstruksi}"`,
      k.statusProyek,
      k.progresPersen,
      k.anggaranRp || 0,
      `"${(k.pelaksanaVendor || '').replace(/"/g, '""')}"`,
      `"${(k.pengawasPln || '').replace(/"/g, '""')}"`,
      k.targetSelesai,
      `"${(k.volumeAset || '').replace(/"/g, '""')}"`,
      `"${(k.keterangan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_GIS_Peta_Konstruksi_20kV_PLN_Baguala_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRupiah = (num?: number) => {
    if (!num) return 'Rp 0';
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl shadow-inner">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wide">PETA KONSTRUKSI 20KV GIS</h1>
              <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                Proyek & Rekonstruksi
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Monitoring Spasial Proyek Uprating, Sisipan Gardu, dan Perluasan JTM ULP Baguala
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('peta')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'peta' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Peta GIS
            </button>
            <button
              onClick={() => setActiveTab('tabel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tabel' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Daftar Proyek ({filteredList.length})
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Download rekap data GIS proyek konstruksi format CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Export CSV
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 hover:border-amber-500/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            title="Import data KML, KMZ, GeoJSON, atau CSV/Excel"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            Import File
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Proyek Konstruksi
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Paket Proyek</div>
            <div className="text-lg font-black text-white">{totalProyek} Proyek</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/20 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Sedang Dikerjakan</div>
            <div className="text-lg font-black text-amber-400">{onGoingProyek} Paket</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-purple-500/20 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Rata-Rata Progres</div>
            <div className="text-lg font-black text-purple-400">{avgProgres}% Selesai</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Total Investasi</div>
            <div className="text-base font-black text-emerald-400 truncate">{formatRupiah(totalAnggaran)}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/70 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari proyek, SPK, lokasi, vendor, pengawas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Filter Penyulang */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">Feeder:</span>
            <select
              value={selectedPenyulang}
              onChange={(e) => setSelectedPenyulang(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900">Semua Penyulang</option>
              {Array.from(new Set(konstruksiList.map((k) => k.penyulang))).map((pName) => (
                <option key={pName} value={pName} className="bg-slate-900">
                  {pName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kategori */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">Kategori:</span>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900">Semua Kategori</option>
              <option value="Rekonstruksi Tiang Miring / Keropos" className="bg-slate-900">Rekonstruksi Tiang</option>
              <option value="Uprating / Penggantian Konduktor" className="bg-slate-900">Uprating Konduktor</option>
              <option value="Pemasangan LBS Motorized / Recloser" className="bg-slate-900">Pemasangan LBS/Recloser</option>
              <option value="Pembangunan GTT Sisipan" className="bg-slate-900">Pembangunan GTT Sisipan</option>
              <option value="Pembangunan JTM Baru (Perluasan)" className="bg-slate-900">Perluasan JTM Baru</option>
              <option value="Penggantian Isolator Flashover / Arrester" className="bg-slate-900">Penggantian Isolator</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900">Semua Status</option>
              <option value="Rencana" className="bg-slate-900 text-blue-400">Rencana</option>
              <option value="Sedang Dikerjakan" className="bg-slate-900 text-amber-400">Sedang Dikerjakan</option>
              <option value="Uji Komisioning" className="bg-slate-900 text-purple-400">Uji Komisioning</option>
              <option value="Selesai Beroperasi" className="bg-slate-900 text-emerald-400">Selesai Beroperasi</option>
            </select>
          </div>

          {/* Map Layer Mode */}
          {activeTab === 'peta' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 ml-auto">
              <button
                onClick={() => setMapStyle('dark')}
                className={`p-1.5 rounded-lg transition-all ${mapStyle === 'dark' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`p-1.5 rounded-lg transition-all ${mapStyle === 'satellite' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Satelit Mode"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMapStyle('street')}
                className={`p-1.5 rounded-lg transition-all ${mapStyle === 'street' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Street Map"
              >
                <MapPin className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'peta' && (
          <div className="w-full h-full relative">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Legend */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-xl max-w-xs text-xs space-y-2 pointer-events-auto">
              <div className="font-black text-slate-200 flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  LEGENDA PETA KONSTRUKSI
                </span>
                <span className="text-[10px] text-slate-400">{filteredList.length} Proyek</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                  <span className="text-slate-300"><strong>Sedang Dikerjakan</strong> (On Progress)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-purple-500 inline-block"></span>
                  <span className="text-slate-300"><strong>Uji Komisioning</strong> (Testing)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                  <span className="text-slate-300"><strong>Selesai Beroperasi</strong> (Energized)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                  <span className="text-slate-300"><strong>Rencana</strong> (Planned)</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                Garis putus-putus menunjukkan trase penarikan kabel / rekonstruksi span JTM.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tabel' && (
          <div className="w-full h-full overflow-y-auto p-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-white text-sm">Daftar Proyek Konstruksi Jaringan 20kV</h3>
                  <p className="text-xs text-slate-400">Total {filteredList.length} proyek sesuai filter</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                      <th className="py-3 px-4">Nama Proyek & SPK</th>
                      <th className="py-3 px-4">Penyulang & Lokasi</th>
                      <th className="py-3 px-4">Kategori & Volume</th>
                      <th className="py-3 px-4">Progres (%)</th>
                      <th className="py-3 px-4">Anggaran (Rp)</th>
                      <th className="py-3 px-4">Pelaksana Vendor</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                          Tidak ada data proyek konstruksi GIS yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((item) => {
                        let statusBadge = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
                        if (item.statusProyek === 'Sedang Dikerjakan') statusBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
                        if (item.statusProyek === 'Uji Komisioning') statusBadge = 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
                        if (item.statusProyek === 'Selesai Beroperasi') statusBadge = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-all">
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-extrabold text-white line-clamp-1">{item.namaProyek}</div>
                              <div className="text-[10.5px] text-amber-400 font-mono font-bold">{item.nomorSpk || '-'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-emerald-400">{item.penyulang}</div>
                              <div className="text-[11px] text-slate-300 line-clamp-1">{item.lokasi}</div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-semibold text-slate-200">{item.kategoriKonstruksi}</div>
                              <div className="text-[10.5px] text-slate-400">{item.volumeAset}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full ${item.progresPersen === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${item.progresPersen}%` }}
                                  />
                                </div>
                                <span className="font-extrabold text-white font-mono">{item.progresPersen}%</span>
                              </div>
                              <span className={`inline-block px-1.5 py-0.2 mt-1 rounded text-[9.5px] font-bold ${statusBadge}`}>
                                {item.statusProyek}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              {formatRupiah(item.anggaranRp)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-200">{item.pelaksanaVendor}</div>
                              <div className="text-[10.5px] text-slate-400">Pengawas: {item.pengawasPln}</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-300">
                              {item.targetSelesai}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedDetail(item)}
                                  className="p-1.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-all"
                                  title="Lihat Detail"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus proyek ${item.namaProyek}?`)) {
                                      onDeleteKonstruksi(item.id);
                                    }
                                  }}
                                  className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-lg transition-all"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Proyek */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <HardHat className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">
                  {editingItem ? 'Edit Proyek Konstruksi GIS' : 'Tambah Proyek Konstruksi GIS Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Nama Proyek Konstruksi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rekonstruksi Tiang Miring & Perkuatan Pondasi Ambles"
                    value={formNamaProyek}
                    onChange={(e) => setFormNamaProyek(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nomor SPK / Kontrak</label>
                  <input
                    type="text"
                    placeholder="Contoh: SPK/KONST/2026/014"
                    value={formNomorSpk}
                    onChange={(e) => setFormNomorSpk(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Penyulang *</label>
                  <select
                    value={formPenyulang}
                    onChange={(e) => setFormPenyulang(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  >
                    {penyulangList.length > 0 ? (
                      penyulangList.map((p) => (
                        <option key={p.id} value={p.namaPenyulang}>
                          {p.namaPenyulang} ({p.namaGi})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="PASSO">PASSO</option>
                        <option value="LATERI 1">LATERI 1</option>
                        <option value="LATERI 2">LATERI 2</option>
                        <option value="TULEHU">TULEHU</option>
                        <option value="WAIHERU 1">WAIHERU 1</option>
                        <option value="WAIHERU 2">WAIHERU 2</option>
                        <option value="GALALA 1">GALALA 1</option>
                        <option value="HUTUMURI">HUTUMURI</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Lokasi Pekerjaan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Raya Passo Baguala Depan SPBU"
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formLat}
                    onChange={(e) => setFormLat(parseFloat(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formLng}
                    onChange={(e) => setFormLng(parseFloat(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kategori Konstruksi *</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Rekonstruksi Tiang Miring / Keropos">Rekonstruksi Tiang Miring / Keropos</option>
                    <option value="Uprating / Penggantian Konduktor">Uprating / Penggantian Konduktor</option>
                    <option value="Pemasangan LBS Motorized / Recloser">Pemasangan LBS Motorized / Recloser</option>
                    <option value="Pembangunan GTT Sisipan">Pembangunan GTT Sisipan</option>
                    <option value="Pembangunan JTM Baru (Perluasan)">Pembangunan JTM Baru (Perluasan)</option>
                    <option value="Penggantian Isolator Flashover / Arrester">Penggantian Isolator Flashover / Arrester</option>
                    <option value="Pemasangan Animal Guard / Penghalang Panjat">Pemasangan Animal Guard / Penghalang Panjat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status Proyek *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Rencana">Rencana (Planned)</option>
                    <option value="Sedang Dikerjakan">Sedang Dikerjakan (In Progress)</option>
                    <option value="Uji Komisioning">Uji Komisioning (Testing)</option>
                    <option value="Selesai Beroperasi">Selesai Beroperasi (Energized)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Progres Pekerjaan (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formProgres}
                      onChange={(e) => setFormProgres(parseInt(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-mono font-extrabold text-amber-400 w-12 text-right">{formProgres}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Anggaran Proyek (Rp)</label>
                  <input
                    type="number"
                    step={500000}
                    value={formAnggaran}
                    onChange={(e) => setFormAnggaran(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pelaksana / Vendor</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Maluku Daya Mandiri"
                    value={formPelaksana}
                    onChange={(e) => setFormPelaksana(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pengawas Lapangan PLN</label>
                  <input
                    type="text"
                    placeholder="Contoh: Samsul Bahri (Spv Teknik)"
                    value={formPengawas}
                    onChange={(e) => setFormPengawas(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={formTargetSelesai}
                    onChange={(e) => setFormTargetSelesai(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Volume Aset Terpasang</label>
                  <input
                    type="text"
                    placeholder="Contoh: 4 Tiang Beton 12m/350daN + 2 Set Guy Wire"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Keterangan & Catatan Teknis</label>
                  <textarea
                    rows={3}
                    placeholder="Deskripsi teknis kendala, progres harian, atau koordinasi SCADA..."
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black transition-all shadow-lg shadow-amber-900/30"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Proyek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Proyek */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base truncate max-w-xs">
                  {selectedDetail.namaProyek}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Status & Progres</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono font-black text-sm">{selectedDetail.progresPersen}%</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                      {selectedDetail.statusProyek}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">No SPK</span>
                  <span className="text-amber-300 font-mono font-bold">{selectedDetail.nomorSpk || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Penyulang</span>
                  <span className="text-emerald-400 font-extrabold">{selectedDetail.penyulang}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Lokasi</span>
                  <span className="text-slate-200 font-semibold text-right max-w-[65%]">{selectedDetail.lokasi}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Kategori</span>
                  <span className="text-slate-200 font-bold">{selectedDetail.kategoriKonstruksi}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Volume Aset</span>
                  <span className="text-slate-300">{selectedDetail.volumeAset}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Anggaran Investasi</span>
                  <span className="text-emerald-400 font-mono font-black text-sm">{formatRupiah(selectedDetail.anggaranRp)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Pelaksana Vendor</span>
                  <span className="text-slate-200 font-bold">{selectedDetail.pelaksanaVendor}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Pengawas PLN</span>
                  <span className="text-slate-300">{selectedDetail.pengawasPln}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Target Selesai</span>
                  <span className="text-cyan-400 font-mono font-bold">{selectedDetail.targetSelesai}</span>
                </div>
              </div>

              {selectedDetail.keterangan && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 font-bold mb-1">Catatan Teknis Proyek:</div>
                  <p className="text-slate-300 italic">{selectedDetail.keterangan}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onUpdateKonstruksi({
                      ...selectedDetail,
                      statusProyek: 'Selesai Beroperasi',
                      progresPersen: 100
                    });
                    setSelectedDetail(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Tandai Selesai (100%)
                </button>
                <button
                  onClick={() => openEditModal(selectedDetail)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
                >
                  Edit Proyek
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import File Modal */}
      <ImportKonstruksiModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBatchImport}
        penyulangList={penyulangList}
      />
    </div>
  );
};
