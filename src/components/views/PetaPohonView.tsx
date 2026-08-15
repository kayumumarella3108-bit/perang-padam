import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Trees,
  Search,
  Plus,
  Filter,
  MapPin,
  AlertTriangle,
  CheckCircle2,
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
  Camera,
  RefreshCw,
  Target,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { PohonGisItem, User, Penyulang } from '../../types';
import { ImportPohonModal } from '../modals/ImportPohonModal';

interface PetaPohonViewProps {
  currentUser?: User | null;
  pohonList: PohonGisItem[];
  penyulangList?: Penyulang[];
  onAddPohon: (item: PohonGisItem) => void;
  onImportBatch?: (items: PohonGisItem[]) => void;
  onUpdatePohon: (item: PohonGisItem) => void;
  onDeletePohon: (id: string) => void;
}

export const PetaPohonView: React.FC<PetaPohonViewProps> = ({
  currentUser,
  pohonList,
  penyulangList = [],
  onAddPohon,
  onImportBatch,
  onUpdatePohon,
  onDeletePohon
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPenyulang, setSelectedPenyulang] = useState<string>('Semua');
  const [selectedBahaya, setSelectedBahaya] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'street'>('dark');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PohonGisItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PohonGisItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<PohonGisItem | null>(null);

  // Form states
  const [formPenyulang, setFormPenyulang] = useState('PASSO');
  const [formSection, setFormSection] = useState('');
  const [formNoTiang, setFormNoTiang] = useState('');
  const [formLokasi, setFormLokasi] = useState('');
  const [formLat, setFormLat] = useState<number>(-3.6280);
  const [formLng, setFormLng] = useState<number>(128.2420);
  const [formJarak, setFormJarak] = useState<'< 1 meter' | '1 - 2.5 meter' | '> 2.5 meter' | 'Menempel Kawat'>('< 1 meter');
  const [formBahaya, setFormBahaya] = useState<'Kritis (Bahaya Padam)' | 'Rawan Sentuh' | 'Aman / Terpangkas' | 'Potensi Roboh'>('Kritis (Bahaya Padam)');
  const [formStatus, setFormStatus] = useState<'Perlu Tebas' | 'Perlu Tebang' | 'Perlu Izin Warga' | 'Perlu Padam' | 'Selesai Pangkas'>('Perlu Tebas');
  const [formJenisPohon, setFormJenisPohon] = useState('');
  const [formJumlah, setFormJumlah] = useState<number>(1);
  const [formTglTemuan, setFormTglTemuan] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTglEksekusi, setFormTglEksekusi] = useState<string>('');
  const [formPelaksana, setFormPelaksana] = useState('Tim ROW Baguala - Valer Demny');
  const [formKeterangan, setFormKeterangan] = useState('');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerGroupRef = useRef<L.FeatureGroup | null>(null);
  const markersMapRef = useRef<Record<string, L.Marker>>({});
  const hasInitialFittedRef = useRef(false);

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
      center: [-3.625, 128.245],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tile = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap | Leaflet GIS'
    }).addTo(map);

    tileLayerRef.current = tile;
    markerGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile on Style Change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 19 }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapStyle]);

  // Filtered List
  const filteredList = pohonList.filter((item) => {
    const matchSearch =
      (item.lokasi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.penyulang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.noTiangOrSpan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.jenisPohon || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.keterangan || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchPenyulang = selectedPenyulang === 'Semua' || item.penyulang === selectedPenyulang;
    const matchBahaya = selectedBahaya === 'Semua' || item.tingkatBahaya === selectedBahaya;
    const matchStatus = selectedStatus === 'Semua' || item.statusEksekusi === selectedStatus;

    return matchSearch && matchPenyulang && matchBahaya && matchStatus;
  });

  // Calculate statistics
  const totalTitik = pohonList.length;
  const totalKritis = pohonList.filter(
    (p) => p.tingkatBahaya === 'Kritis (Bahaya Padam)' || p.jarakKeJaringan === '< 1 meter' || p.jarakKeJaringan === 'Menempel Kawat'
  ).length;
  const totalSelesai = pohonList.filter((p) => p.statusEksekusi === 'Selesai Pangkas').length;

  // Focus map to all markers
  const handleFocusMap = () => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;
    const bounds = markerGroupRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  };

  // Center and open popup for a specific tree item
  const handleLocateTree = (item: PohonGisItem) => {
    if (!mapInstanceRef.current || !item.lat || !item.lng) return;
    mapInstanceRef.current.setView([item.lat, item.lng], 17, { animate: true });
    const marker = markersMapRef.current[item.id];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 300);
    }
  };

  // Render Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;
    const mg = markerGroupRef.current;
    mg.clearLayers();
    markersMapRef.current = {};

    filteredList.forEach((item) => {
      if (!item.lat || !item.lng) return;

      const isDone = item.statusEksekusi === 'Selesai Pangkas';

      // Determine color based on hazard and status
      let markerColor = '#10B981'; // Green
      let pulseEffect = '';
      if (isDone) {
        markerColor = '#10B981'; // Emerald
      } else if (item.tingkatBahaya === 'Kritis (Bahaya Padam)' || item.jarakKeJaringan === '< 1 meter' || item.jarakKeJaringan === 'Menempel Kawat') {
        markerColor = '#EF4444'; // Red
        pulseEffect = 'animate-ping';
      } else if (item.tingkatBahaya === 'Potensi Roboh') {
        markerColor = '#F97316'; // Orange
      } else if (item.tingkatBahaya === 'Rawan Sentuh') {
        markerColor = '#F59E0B'; // Amber
      }

      const customIcon = L.divIcon({
        className: 'custom-tree-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${!isDone && item.tingkatBahaya.includes('Kritis') ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${markerColor}; opacity: 0.4;" class="${pulseEffect}"></div>` : ''}
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${markerColor}; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #ffffff;">
              ${isDone 
                ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v10M12 10 7 15h10l-5-5zM12 3l-4 5h8l-4-5z"/></svg>`
              }
            </div>
            <div style="position: absolute; bottom: -6px; background: #0f172a; color: ${isDone ? '#34d399' : '#f8fafc'}; font-size: 8.5px; font-weight: 800; padding: 1px 4px; border-radius: 4px; border: 1px solid ${markerColor}; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">
              ${isDone ? `✓ ${item.noTiangOrSpan || item.penyulang}` : (item.noTiangOrSpan || item.penyulang)}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(mg);
      markersMapRef.current[item.id] = marker;

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; width: 250px; padding: 2px; color: #1e293b;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 800; color: #0f172a;">
              ${item.penyulang} - ${item.noTiangOrSpan}
            </div>
            <span style="font-size: 9.5px; font-weight: 700; background: ${markerColor}20; color: ${markerColor}; border: 1px solid ${markerColor}50; padding: 2px 5px; border-radius: 4px;">
              ${isDone ? '✓ Terpangkas' : item.tingkatBahaya}
            </span>
          </div>
          
          <div style="font-size: 11.5px; line-height: 1.5; color: #334155; space-y: 2px;">
            <div><strong>📍 Lokasi:</strong> ${item.lokasi}</div>
            <div><strong>🌳 Jenis:</strong> ${item.jenisPohon} (${item.jumlahPohon || 1} Pohon)</div>
            <div><strong>📏 Jarak Kawat:</strong> <span style="color: ${isDone ? '#059669' : (item.jarakKeJaringan === '< 1 meter' ? '#dc2626' : '#d97706')}; font-weight: 700;">${isDone ? '> 2.5m (Aman)' : item.jarakKeJaringan}</span></div>
            <div><strong>⚡ Status:</strong> <span style="font-weight: 700; color: ${isDone ? '#059669' : '#0284c7'};">${item.statusEksekusi}</span></div>
            <div><strong>📅 Temuan:</strong> ${item.tglTemuan}</div>
            <div><strong>👷 Pelaksana:</strong> ${item.pelaksana || '-'}</div>
            ${item.keterangan ? `<div style="margin-top: 5px; padding: 5px; background: #f1f5f9; border-radius: 4px; font-style: italic; color: #64748b; font-size: 10.5px;">${item.keterangan}</div>` : ''}
          </div>

          <div style="margin-top: 10px; display: flex; gap: 5px;">
            <button onclick="window.viewPohonDetail('${item.id}')" style="flex: 1; background: #0284c7; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              🔍 Detail & Ubah
            </button>
            ${isDone 
              ? `<button onclick="window.reopenPohon('${item.id}')" style="background: #e11d48; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;" title="Buka kembali">
                  ↩ Buka
                 </button>`
              : `<button onclick="window.quickDonePohon('${item.id}')" style="background: #059669; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  ✓ Selesai
                 </button>`
            }
            <button onclick="window.deletePohonPrompt('${item.id}')" style="background: #ef4444; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;" title="Hapus titik pohon">
              🗑️
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'custom-pohon-leaflet-popup'
      });
    });

    if (filteredList.length > 0 && !hasInitialFittedRef.current) {
      const bounds = mg.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        hasInitialFittedRef.current = true;
      }
    }
  }, [filteredList]);

  // Window callbacks for Leaflet Popups
  useEffect(() => {
    (window as any).viewPohonDetail = (id: string) => {
      const found = pohonList.find((p) => p.id === id);
      if (found) setSelectedDetail(found);
    };

    (window as any).deletePohonPrompt = (id: string) => {
      const found = pohonList.find((p) => p.id === id);
      if (found) setDeletingItem(found);
    };

    (window as any).quickDonePohon = (id: string) => {
      const found = pohonList.find((p) => p.id === id);
      if (found) {
        onUpdatePohon({
          ...found,
          statusEksekusi: 'Selesai Pangkas',
          tingkatBahaya: 'Aman / Terpangkas',
          jarakKeJaringan: '> 2.5 meter',
          tglEksekusi: new Date().toISOString().split('T')[0]
        });
      }
    };

    (window as any).reopenPohon = (id: string) => {
      const found = pohonList.find((p) => p.id === id);
      if (found) {
        onUpdatePohon({
          ...found,
          statusEksekusi: 'Perlu Tebas',
          tingkatBahaya: 'Rawan Sentuh',
          jarakKeJaringan: '1 - 2.5 meter',
          tglEksekusi: undefined
        });
      }
    };

    return () => {
      delete (window as any).viewPohonDetail;
      delete (window as any).deletePohonPrompt;
      delete (window as any).quickDonePohon;
      delete (window as any).reopenPohon;
    };
  }, [pohonList, onUpdatePohon]);

  // Form Reset / Load Editing
  const openAddModal = () => {
    setEditingItem(null);
    setFormPenyulang(penyulangList[0]?.nama || 'PASSO');
    setFormSection('');
    setFormNoTiang('');
    setFormLokasi('');
    setFormLat(-3.6280);
    setFormLng(128.2420);
    setFormJarak('< 1 meter');
    setFormBahaya('Kritis (Bahaya Padam)');
    setFormStatus('Perlu Tebas');
    setFormJenisPohon('');
    setFormJumlah(1);
    setFormTglTemuan(new Date().toISOString().split('T')[0]);
    setFormTglEksekusi('');
    setFormPelaksana('Tim ROW Baguala - Valer Demny');
    setFormKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PohonGisItem) => {
    setEditingItem(item);
    setFormPenyulang(item.penyulang);
    setFormSection(item.section || '');
    setFormNoTiang(item.noTiangOrSpan || '');
    setFormLokasi(item.lokasi || '');
    setFormLat(item.lat);
    setFormLng(item.lng);
    setFormJarak(item.jarakKeJaringan);
    setFormBahaya(item.tingkatBahaya);
    setFormStatus(item.statusEksekusi);
    setFormJenisPohon(item.jenisPohon);
    setFormJumlah(item.jumlahPohon || 1);
    setFormTglTemuan(item.tglTemuan);
    setFormTglEksekusi(item.tglEksekusi || '');
    setFormPelaksana(item.pelaksana || 'Tim ROW Baguala');
    setFormKeterangan(item.keterangan || '');
    setIsModalOpen(true);
    setSelectedDetail(null);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: PohonGisItem = {
      id: editingItem ? editingItem.id : `pohon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      penyulang: formPenyulang,
      section: formSection || undefined,
      noTiangOrSpan: formNoTiang,
      lokasi: formLokasi,
      lat: Number(formLat),
      lng: Number(formLng),
      jarakKeJaringan: formJarak,
      tingkatBahaya: formBahaya,
      statusEksekusi: formStatus,
      jenisPohon: formJenisPohon || 'Pohon Campuran',
      jumlahPohon: Number(formJumlah) || 1,
      tglTemuan: formTglTemuan,
      tglEksekusi: formStatus === 'Selesai Pangkas' ? (formTglEksekusi || new Date().toISOString().split('T')[0]) : undefined,
      pelaksana: formPelaksana,
      keterangan: formKeterangan,
      fotoTemuan: editingItem?.fotoTemuan,
      fotoEksekusi: editingItem?.fotoEksekusi
    };

    if (editingItem) {
      onUpdatePohon(payload);
    } else {
      onAddPohon(payload);
    }

    setIsModalOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Penyulang',
      'Section',
      'No Tiang / Span',
      'Lokasi',
      'Latitude',
      'Longitude',
      'Jenis Pohon',
      'Jumlah',
      'Jarak Jaringan',
      'Tingkat Bahaya',
      'Status Eksekusi',
      'Tgl Temuan',
      'Tgl Eksekusi',
      'Pelaksana',
      'Keterangan'
    ];

    const rows = filteredList.map((p) => [
      p.id,
      p.penyulang,
      p.section || '-',
      p.noTiangOrSpan || '-',
      `"${(p.lokasi || '').replace(/"/g, '""')}"`,
      p.lat,
      p.lng,
      `"${(p.jenisPohon || '').replace(/"/g, '""')}"`,
      p.jumlahPohon || 1,
      p.jarakKeJaringan,
      p.tingkatBahaya,
      p.statusEksekusi,
      p.tglTemuan,
      p.tglEksekusi || '-',
      `"${(p.pelaksana || '').replace(/"/g, '""')}"`,
      `"${(p.keterangan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_GIS_Peta_Pohon_ROW_PLN_Baguala_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex overflow-hidden bg-slate-50 font-sans">
      {/* Left Control Sidebar - matching PetaPenyulang style */}
      <div className="w-80 md:w-96 bg-white/95 backdrop-blur-xl border-r border-slate-200 flex flex-col justify-between shrink-0 z-10 shadow-lg overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Trees className="w-4 h-4 text-emerald-600" />
              PETA TITIK POHON & ROW
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
              {filteredList.length} Titik
            </span>
          </div>

          {/* Action Import & Add Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={openAddModal}
              className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
              title="Tambah Titik Pohon Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah</span>
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              title="Upload File Format KML, KMZ, atau CSV"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              Impor File
            </button>
            <button
              onClick={handleExportCsv}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              title="Export CSV Rekap Pohon"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              CSV
            </button>
          </div>

          {/* Quick Counter Badges */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-1">
              <div className="text-[10px] text-slate-500 font-semibold">Total</div>
              <div className="text-xs font-black text-slate-800">{totalTitik}</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg py-1.5 px-1">
              <div className="text-[10px] text-rose-600 font-semibold">Kritis</div>
              <div className="text-xs font-black text-rose-700">{totalKritis}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-1">
              <div className="text-[10px] text-emerald-600 font-semibold">Selesai</div>
              <div className="text-xs font-black text-emerald-700">{totalSelesai}</div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiang, jenis pohon, lokasi..."
              className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <select
              value={selectedPenyulang}
              onChange={(e) => setSelectedPenyulang(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="Semua">Semua Feeder</option>
              {Array.from(new Set(pohonList.map((p) => p.penyulang))).map((pName) => (
                <option key={pName} value={pName}>
                  {pName}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Perlu Tebas">Perlu Tebas</option>
              <option value="Perlu Tebang">Perlu Tebang</option>
              <option value="Perlu Izin Warga">Perlu Izin Warga</option>
              <option value="Perlu Padam">Perlu Padam</option>
              <option value="Selesai Pangkas">Selesai Pangkas</option>
            </select>
          </div>
        </div>

        {/* Tree List in Sidebar */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              DAFTAR TITIK POHON ({filteredList.length})
            </span>
          </div>

          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada titik pohon yang cocok dengan pencarian / filter.
            </div>
          ) : (
            filteredList.map((item) => {
              const isDone = item.statusEksekusi === 'Selesai Pangkas';
              const isKritis = item.tingkatBahaya === 'Kritis (Bahaya Padam)' || item.jarakKeJaringan === '< 1 meter';

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                      : isKritis
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  } shadow-xs`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Status Pill Indicator */}
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 ring-2 ring-emerald-200'
                          : isKritis
                          ? 'bg-rose-500 ring-2 ring-rose-200 animate-pulse'
                          : item.tingkatBahaya === 'Potensi Roboh'
                          ? 'bg-orange-500'
                          : 'bg-amber-500'
                      }`}
                    />

                    {/* Text Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {item.penyulang} - {item.noTiangOrSpan}
                        </h3>
                        {isDone && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded">
                            Selesai
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                        {item.jenisPohon} • {item.jarakKeJaringan}
                      </p>
                      <p className="text-[9.5px] text-slate-400 truncate">
                        📍 {item.lokasi}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Locate, Toggle Done, Edit, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleLocateTree(item)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                      title="Fokus ke Titik Peta"
                    >
                      <Target className="w-3.5 h-3.5" />
                    </button>
                    
                    {isDone ? (
                      <button
                        onClick={() => {
                          onUpdatePohon({
                            ...item,
                            statusEksekusi: 'Perlu Tebas',
                            tingkatBahaya: 'Rawan Sentuh',
                            jarakKeJaringan: '1 - 2.5 meter',
                            tglEksekusi: undefined
                          });
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-emerald-600 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Buka kembali (Perlu Tebas Ulang)"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onUpdatePohon({
                            ...item,
                            statusEksekusi: 'Selesai Pangkas',
                            tingkatBahaya: 'Aman / Terpangkas',
                            jarakKeJaringan: '> 2.5 meter',
                            tglEksekusi: new Date().toISOString().split('T')[0]
                          });
                        }}
                        className="p-1.5 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        title="Tandai Selesai Pangkas"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit Data Pohon"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Titik Pohon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Map Container (Right) */}
      <div className="relative flex-1 h-full">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Control Bar for Map Style & Focus */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/80 p-1 rounded-xl shadow-xl">
          <button
            onClick={handleFocusMap}
            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-emerald-400 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
            title="Fokuskan Semua Titik Pohon"
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fokus Semua</span>
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
          <button
            onClick={() => setMapStyle('dark')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              mapStyle === 'dark' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dark Map"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              mapStyle === 'satellite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Satelit"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMapStyle('street')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              mapStyle === 'street' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Street Map"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal Add / Edit Pohon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    {editingItem ? 'Edit Data Titik Pohon GIS' : 'Tambah Titik Pohon Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Pemetaan koordinat & rencana pemangkasan ROW 20kV</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Penyulang *</label>
                  <select
                    value={formPenyulang}
                    onChange={(e) => setFormPenyulang(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {penyulangList.length > 0 ? (
                      penyulangList.map((p) => (
                        <option key={p.id} value={p.nama}>
                          {p.nama}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="PASSO">PASSO</option>
                        <option value="TULEHU">TULEHU</option>
                        <option value="LIANG">LIANG</option>
                        <option value="WAUR">WAUR</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nomor Tiang / Span *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: BT.14 - BT.15 / TP-02"
                    value={formNoTiang}
                    onChange={(e) => setFormNoTiang(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nama Section / Segmen</label>
                  <input
                    type="text"
                    placeholder="Contoh: Section Larier, Passo Indah"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Lokasi Detail *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Wolter Monginsidi RT.02 / Depan Gereja"
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Koordinat */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Koordinat GPS (Latitude & Longitude)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setFormLat(Number(pos.coords.latitude.toFixed(6)));
                          setFormLng(Number(pos.coords.longitude.toFixed(6)));
                        });
                      }
                    }}
                    className="text-[10.5px] font-bold text-emerald-400 hover:underline"
                  >
                    Ambil Lokasi Saya Sekarang
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLat}
                      onChange={(e) => setFormLat(parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLng}
                      onChange={(e) => setFormLng(parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Jenis Pohon</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pohon Kelapa, Sengon, Bambu"
                    value={formJenisPohon}
                    onChange={(e) => setFormJenisPohon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Jumlah Batang Pohon</label>
                  <input
                    type="number"
                    min="1"
                    value={formJumlah}
                    onChange={(e) => setFormJumlah(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Jarak ke Kawat 20kV</label>
                  <select
                    value={formJarak}
                    onChange={(e) => setFormJarak(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="< 1 meter">🔴 &lt; 1 meter (Kritis)</option>
                    <option value="Menempel Kawat">🔴 Menempel Kawat</option>
                    <option value="1 - 2.5 meter">🟡 1 - 2.5 meter (Rawan)</option>
                    <option value="> 2.5 meter">🟢 &gt; 2.5 meter (Aman)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tingkat Bahaya</label>
                  <select
                    value={formBahaya}
                    onChange={(e) => setFormBahaya(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="Kritis (Bahaya Padam)">Kritis (Bahaya Padam)</option>
                    <option value="Potensi Roboh">Potensi Roboh</option>
                    <option value="Rawan Sentuh">Rawan Sentuh</option>
                    <option value="Aman / Terpangkas">Aman / Terpangkas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status Tindakan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="Perlu Tebas">Perlu Tebas</option>
                    <option value="Perlu Tebang">Perlu Tebang</option>
                    <option value="Perlu Izin Warga">Perlu Izin Warga</option>
                    <option value="Perlu Padam">Perlu Padam</option>
                    <option value="Selesai Pangkas">Selesai Pangkas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tanggal Temuan</label>
                  <input
                    type="date"
                    value={formTglTemuan}
                    onChange={(e) => setFormTglTemuan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Pelaksana / Tim Kerja</label>
                  <input
                    type="text"
                    value={formPelaksana}
                    onChange={(e) => setFormPelaksana(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan kondisi pohon, negosiasi pemilik lahan, dll."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Titik Pohon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Pohon */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    {selectedDetail.penyulang} - {selectedDetail.noTiangOrSpan}
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedDetail.lokasi}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-slate-500 font-medium">Jenis Pohon</div>
                  <div className="font-bold text-white text-sm">{selectedDetail.jenisPohon}</div>
                  <div className="text-slate-400 text-[11px]">{selectedDetail.jumlahPohon || 1} Pohon</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Jarak ke Jaringan</div>
                  <div className="font-bold text-rose-400 text-sm">{selectedDetail.jarakKeJaringan}</div>
                  <div className="text-slate-400 text-[11px]">{selectedDetail.tingkatBahaya}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Status Tindakan</div>
                  <div className="font-bold text-emerald-400">{selectedDetail.statusEksekusi}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Tanggal Temuan</div>
                  <div className="font-bold text-slate-200">{selectedDetail.tglTemuan}</div>
                </div>
              </div>

              {selectedDetail.keterangan && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 italic">
                  "{selectedDetail.keterangan}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {selectedDetail.statusEksekusi === 'Selesai Pangkas' ? (
                  <button
                    onClick={() => {
                      onUpdatePohon({
                        ...selectedDetail,
                        statusEksekusi: 'Perlu Tebas',
                        tingkatBahaya: 'Rawan Sentuh',
                        jarakKeJaringan: '1 - 2.5 meter',
                        tglEksekusi: undefined
                      });
                      setSelectedDetail(null);
                    }}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Buka Kembali (Perlu Tebas Ulang)
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onUpdatePohon({
                        ...selectedDetail,
                        statusEksekusi: 'Selesai Pangkas',
                        tingkatBahaya: 'Aman / Terpangkas',
                        jarakKeJaringan: '> 2.5 meter',
                        tglEksekusi: new Date().toISOString().split('T')[0]
                      });
                      setSelectedDetail(null);
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Tandai Selesai Pangkas
                  </button>
                )}
                <button
                  onClick={() => openEditModal(selectedDetail)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    const itemToDelete = selectedDetail;
                    setSelectedDetail(null);
                    setDeletingItem(itemToDelete);
                  }}
                  className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-xl transition-all cursor-pointer"
                  title="Hapus Data Pohon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Titik Pohon */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Hapus Titik Pohon?</h3>
                <p className="text-xs text-slate-400">Data pohon ini akan dihapus dari peta & database.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <div><strong className="text-slate-400">Penyulang:</strong> {deletingItem.penyulang}</div>
              <div><strong className="text-slate-400">No. Tiang / Span:</strong> {deletingItem.noTiangOrSpan}</div>
              <div><strong className="text-slate-400">Jenis Pohon:</strong> {deletingItem.jenisPohon} ({deletingItem.jumlahPohon || 1} Pohon)</div>
              <div><strong className="text-slate-400">Lokasi:</strong> {deletingItem.lokasi}</div>
              <div><strong className="text-slate-400">Status:</strong> {deletingItem.statusEksekusi}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePohon(deletingItem.id);
                  setDeletingItem(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-900/40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Pohon Modal */}
      {isImportModalOpen && (
        <ImportPohonModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={(items) => {
            if (onImportBatch) {
              onImportBatch(items);
            } else {
              items.forEach((it) => onAddPohon(it));
            }
            setIsImportModalOpen(false);
          }}
          penyulangList={penyulangList}
        />
      )}
    </div>
  );
};
