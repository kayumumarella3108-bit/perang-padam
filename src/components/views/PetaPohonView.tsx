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
  Clock,
  Trash2,
  Edit2,
  X,
  Check,
  Download,
  Upload,
  Printer,
  Calendar,
  Layers,
  Moon,
  Globe,
  Camera,
  Info,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState<'peta' | 'tabel' | 'galeri'>('peta');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PohonGisItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PohonGisItem | null>(null);

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
  const hasInitialFittedRef = useRef(false);
  const lastSelectedPenyulangRef = useRef(selectedPenyulang);

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
      zoom: 12,
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

    // Click map to pick location in modal if open
    map.on('click', (e: L.LeafletMouseEvent) => {
      setFormLat(Number(e.latlng.lat.toFixed(6)));
      setFormLng(Number(e.latlng.lng.toFixed(6)));
    });

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

  // Calculate Statistics
  const totalTitik = pohonList.length;
  const totalKritis = pohonList.filter((p) => p.tingkatBahaya === 'Kritis (Bahaya Padam)' || p.jarakKeJaringan === '< 1 meter' || p.jarakKeJaringan === 'Menempel Kawat').length;
  const totalPerluIzinPadam = pohonList.filter((p) => p.statusEksekusi === 'Perlu Izin Warga' || p.statusEksekusi === 'Perlu Padam').length;
  const totalSelesai = pohonList.filter((p) => p.statusEksekusi === 'Selesai Pangkas').length;
  const totalPohonCount = pohonList.reduce((acc, curr) => acc + (curr.jumlahPohon || 1), 0);

  // Focus map to all markers
  const handleFocusMap = () => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;
    const bounds = markerGroupRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  };

  // Render Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;
    const mg = markerGroupRef.current;
    mg.clearLayers();

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
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            ${!isDone && item.tingkatBahaya.includes('Kritis') ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${markerColor}; opacity: 0.4;" class="${pulseEffect}"></div>` : ''}
            <div style="width: 30px; height: 30px; border-radius: 50%; background: ${markerColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #ffffff;">
              ${isDone 
                ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v10M12 10 7 15h10l-5-5zM12 3l-4 5h8l-4-5z"/></svg>`
              }
            </div>
            <div style="position: absolute; bottom: -6px; background: #0f172a; color: ${isDone ? '#34d399' : '#f8fafc'}; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 4px; border: 1px solid ${markerColor}; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.6);">
              ${isDone ? `✓ ${item.noTiangOrSpan || item.penyulang}` : (item.noTiangOrSpan || item.penyulang)}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(mg);

      // Popup Content
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 250px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="font-weight: 800; font-size: 13px; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${markerColor};"></span>
              ${item.penyulang} - ${item.noTiangOrSpan}
            </div>
            <span style="font-size: 10px; font-weight: 700; background: ${markerColor}25; color: ${markerColor}; border: 1px solid ${markerColor}60; padding: 2px 6px; border-radius: 6px;">
              ${isDone ? '✓ Aman / Terpangkas' : item.tingkatBahaya}
            </span>
          </div>
          
          <div style="font-size: 11px; color: #cbd5e1; space-y: 4px; line-height: 1.5;">
            <div><strong>📍 Lokasi:</strong> ${item.lokasi}</div>
            <div><strong>🌳 Jenis:</strong> ${item.jenisPohon} (${item.jumlahPohon || 1} Pohon)</div>
            <div><strong>📏 Jarak Jaringan:</strong> <span style="color: ${isDone ? '#34d399' : (item.jarakKeJaringan === '< 1 meter' ? '#ef4444' : '#f59e0b')}; font-weight: 700;">${isDone ? '> 2.5 meter (Aman)' : item.jarakKeJaringan}</span></div>
            <div><strong>⚡ Status Eksekusi:</strong> <span style="font-weight: 700; color: ${isDone ? '#34d399' : '#38bdf8'};">${item.statusEksekusi}</span></div>
            <div><strong>📅 Temuan:</strong> ${item.tglTemuan} ${item.tglEksekusi ? `| <strong>Tgl Pangkas:</strong> ${item.tglEksekusi}` : ''}</div>
            <div><strong>👷 Pelaksana:</strong> ${item.pelaksana || '-'}</div>
            ${item.keterangan ? `<div style="margin-top: 6px; padding: 6px; background: rgba(30,41,59,0.7); border-radius: 6px; font-style: italic; color: #94a3b8; font-size: 10.5px;">${item.keterangan}</div>` : ''}
          </div>

          <div style="margin-top: 10px; display: flex; gap: 6px;">
            <button onclick="window.viewPohonDetail('${item.id}')" style="flex: 1; background: #0284c7; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              🔍 Detail & Ubah
            </button>
            ${isDone 
              ? `<button onclick="window.reopenPohon('${item.id}')" style="background: #e11d48; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;" title="Buka kembali untuk jadwal tebas ulang">
                  ↩ Buka Kembali
                 </button>`
              : `<button onclick="window.quickDonePohon('${item.id}')" style="background: #059669; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  ✓ Selesai
                 </button>`
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-leaflet-popup'
      });
    });

    // Only adjust map bounds on initial load or if user explicitly changes selectedPenyulang filter
    if (filteredList.length > 0) {
      const bounds = mg.getBounds();
      if (bounds.isValid()) {
        if (!hasInitialFittedRef.current || lastSelectedPenyulangRef.current !== selectedPenyulang) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
          hasInitialFittedRef.current = true;
          lastSelectedPenyulangRef.current = selectedPenyulang;
        }
      }
    }
  }, [filteredList, selectedPenyulang]);

  // Window callbacks for Leaflet Popups
  useEffect(() => {
    (window as any).viewPohonDetail = (id: string) => {
      const found = pohonList.find((p) => p.id === id);
      if (found) setSelectedDetail(found);
    };

    (window as any).quickDonePohon = (id: string) => {
      const found = pohonList.find((p) => p.id === id);
      if (found) {
        // If a status filter was restricting view, reset to 'Semua' so the updated item remains visible on the map
        if (selectedStatus !== 'Semua') setSelectedStatus('Semua');
        if (selectedBahaya !== 'Semua' && selectedBahaya !== 'Aman / Terpangkas') setSelectedBahaya('Semua');

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
        if (selectedStatus !== 'Semua') setSelectedStatus('Semua');
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
      delete (window as any).quickDonePohon;
      delete (window as any).reopenPohon;
    };
  }, [pohonList, onUpdatePohon, selectedStatus, selectedBahaya]);

  // Form Reset / Load Editing
  const openAddModal = () => {
    setEditingItem(null);
    setFormPenyulang(penyulangList[0]?.namaPenyulang || 'PASSO');
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
    setFormJenisPohon(item.jenisPohon || '');
    setFormJumlah(item.jumlahPohon || 1);
    setFormTglTemuan(item.tglTemuan || new Date().toISOString().split('T')[0]);
    setFormTglEksekusi(item.tglEksekusi || '');
    setFormPelaksana(item.pelaksana || '');
    setFormKeterangan(item.keterangan || '');
    setIsModalOpen(true);
    setSelectedDetail(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPenyulang || !formLokasi || !formLat || !formLng) {
      alert('Mohon lengkapi Penyulang, Lokasi, dan Koordinat GIS!');
      return;
    }

    const payload: PohonGisItem = {
      id: editingItem ? editingItem.id : `phn-${Date.now()}`,
      penyulang: formPenyulang,
      section: formSection,
      noTiangOrSpan: formNoTiang || `TG-${Math.floor(Math.random() * 90 + 10)}`,
      lokasi: formLokasi,
      lat: Number(formLat),
      lng: Number(formLng),
      jarakKeJaringan: formJarak,
      tingkatBahaya: formBahaya,
      statusEksekusi: formStatus,
      jenisPohon: formJenisPohon || 'Pohon Campuran',
      jumlahPohon: Number(formJumlah) || 1,
      tglTemuan: formTglTemuan,
      tglEksekusi: formTglEksekusi || undefined,
      pelaksana: formPelaksana,
      keterangan: formKeterangan
    };

    if (editingItem) {
      if (selectedStatus !== 'Semua') setSelectedStatus('Semua');
      if (selectedBahaya !== 'Semua') setSelectedBahaya('Semua');
      onUpdatePohon(payload);
    } else {
      if (selectedStatus !== 'Semua') setSelectedStatus('Semua');
      if (selectedBahaya !== 'Semua') setSelectedBahaya('Semua');
      onAddPohon(payload);
    }

    setIsModalOpen(false);
  };

  const handleBatchImport = (items: PohonGisItem[]) => {
    if (onImportBatch) {
      onImportBatch(items);
    } else {
      items.forEach((it) => onAddPohon(it));
    }
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
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl shadow-inner">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wide">PETA POHON & ROW GIS</h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                20 kV Baguala
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Pemetaan Spasial Pohon Kritis & Titik Rawan Right-of-Way Jalur Distribusi
            </p>
          </div>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tabs */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('peta')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'peta' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Peta GIS
            </button>
            <button
              onClick={() => setActiveTab('tabel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tabel' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Daftar Titik ({filteredList.length})
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Download rekap data GIS format CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 hover:border-emerald-500/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            title="Import data KML, KMZ, GeoJSON, atau CSV/Excel"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            Import File
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Titik Pohon
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Titik Temuan</div>
            <div className="text-lg font-black text-white">
              {totalTitik} <span className="text-xs font-semibold text-slate-400">({totalPohonCount} Pohon)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-rose-500/20 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Kritis / Menempel</div>
            <div className="text-lg font-black text-rose-400">{totalKritis} Titik</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/20 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Perlu Izin / Padam</div>
            <div className="text-lg font-black text-amber-400">{totalPerluIzinPadam} Titik</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Selesai Pangkas</div>
            <div className="text-lg font-black text-emerald-400">{totalSelesai} Titik</div>
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
              placeholder="Cari lokasi, tiang, penyulang, jenis pohon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
            <span className="text-slate-400 font-bold">Penyulang:</span>
            <select
              value={selectedPenyulang}
              onChange={(e) => setSelectedPenyulang(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900">Semua Feeder</option>
              {Array.from(new Set(pohonList.map((p) => p.penyulang))).map((pName) => (
                <option key={pName} value={pName} className="bg-slate-900">
                  {pName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tingkat Bahaya */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">Bahaya:</span>
            <select
              value={selectedBahaya}
              onChange={(e) => setSelectedBahaya(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900">Semua Status</option>
              <option value="Kritis (Bahaya Padam)" className="bg-slate-900 text-rose-400">🔴 Kritis (Padam)</option>
              <option value="Potensi Roboh" className="bg-slate-900 text-orange-400">🟠 Potensi Roboh</option>
              <option value="Rawan Sentuh" className="bg-slate-900 text-amber-400">🟡 Rawan Sentuh</option>
              <option value="Aman / Terpangkas" className="bg-slate-900 text-emerald-400">🟢 Aman Terpangkas</option>
            </select>
          </div>

          {/* Filter Status Eksekusi */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">Tindakan:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900">Semua Tindakan</option>
              <option value="Perlu Tebas" className="bg-slate-900">Perlu Tebas</option>
              <option value="Perlu Tebang" className="bg-slate-900">Perlu Tebang</option>
              <option value="Perlu Izin Warga" className="bg-slate-900">Perlu Izin Warga</option>
              <option value="Perlu Padam" className="bg-slate-900">Perlu Padam</option>
              <option value="Selesai Pangkas" className="bg-slate-900 text-emerald-400">Selesai Pangkas</option>
            </select>
          </div>

          {/* Map Layer Mode */}
          {activeTab === 'peta' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 ml-auto">
              <button
                onClick={handleFocusMap}
                className="px-2 py-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition-all flex items-center gap-1 text-[11px] font-bold"
                title="Fokuskan Semua Titik Pohon di Peta"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Fokus Peta</span>
              </button>
              <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
              <button
                onClick={() => setMapStyle('dark')}
                className={`p-1.5 rounded-lg transition-all ${mapStyle === 'dark' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`p-1.5 rounded-lg transition-all ${mapStyle === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Satelit Mode"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMapStyle('street')}
                className={`p-1.5 rounded-lg transition-all ${mapStyle === 'street' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
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

            {/* Floating Map Legend */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-xl max-w-xs text-xs space-y-2 pointer-events-auto">
              <div className="font-black text-slate-200 flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  LEGENDA PETA POHON
                </span>
                <span className="text-[10px] text-slate-400">{filteredList.length} Titik</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse inline-block"></span>
                  <span className="text-slate-300"><strong>Kritis</strong> (&lt; 1m / Menempel Kawat)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
                  <span className="text-slate-300"><strong>Potensi Roboh</strong> (Condong &gt; 15°)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-slate-300"><strong>Rawan Sentuh</strong> (1 - 2.5m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-300"><strong>Aman / Selesai</strong> (&gt; 2.5m)</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                Klik marker untuk detail & update eksekusi tebas.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tabel' && (
          <div className="w-full h-full overflow-y-auto p-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-white text-sm">Daftar Titik Pohon ROW Jalur 20kV</h3>
                  <p className="text-xs text-slate-400">Total {filteredList.length} titik sesuai filter</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                      <th className="py-3 px-4">Penyulang & Tiang</th>
                      <th className="py-3 px-4">Lokasi GIS</th>
                      <th className="py-3 px-4">Jenis & Jml Pohon</th>
                      <th className="py-3 px-4">Jarak Jaringan</th>
                      <th className="py-3 px-4">Tingkat Bahaya</th>
                      <th className="py-3 px-4">Status Eksekusi</th>
                      <th className="py-3 px-4">Pelaksana</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                          Tidak ada data pohon GIS yang cocok dengan pencarian / filter.
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((item) => {
                        let badgeBg = 'bg-slate-800 text-slate-300';
                        if (item.tingkatBahaya === 'Kritis (Bahaya Padam)') badgeBg = 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
                        else if (item.tingkatBahaya === 'Potensi Roboh') badgeBg = 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
                        else if (item.tingkatBahaya === 'Rawan Sentuh') badgeBg = 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
                        else if (item.tingkatBahaya === 'Aman / Terpangkas') badgeBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-all">
                            <td className="py-3 px-4">
                              <div className="font-extrabold text-white">{item.penyulang}</div>
                              <div className="text-[11px] text-emerald-400 font-mono font-bold">{item.noTiangOrSpan}</div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-semibold text-slate-200">{item.lokasi}</div>
                              <div className="text-[10.5px] text-slate-400 font-mono">{item.lat.toFixed(5)}, {item.lng.toFixed(5)}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-200">{item.jenisPohon}</div>
                              <div className="text-[11px] text-slate-400">{item.jumlahPohon || 1} Pohon</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-bold ${item.jarakKeJaringan === '< 1 meter' || item.jarakKeJaringan === 'Menempel Kawat' ? 'text-rose-400' : 'text-amber-400'}`}>
                                {item.jarakKeJaringan}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${badgeBg}`}>
                                {item.tingkatBahaya}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                                item.statusEksekusi === 'Selesai Pangkas'
                                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {item.statusEksekusi}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-slate-300 font-medium">{item.pelaksana || '-'}</div>
                              <div className="text-[10px] text-slate-500">Tgl: {item.tglTemuan}</div>
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
                                    if (confirm(`Hapus data titik pohon ${item.penyulang} - ${item.noTiangOrSpan}?`)) {
                                      onDeletePohon(item.id);
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

      {/* Modal Add / Edit Pohon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Trees className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">
                  {editingItem ? 'Edit Titik Pohon GIS' : 'Tambah Titik Pohon GIS Baru'}
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
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Penyulang *</label>
                  <select
                    value={formPenyulang}
                    onChange={(e) => setFormPenyulang(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
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

                <div>
                  <label className="block text-slate-300 font-bold mb-1">No Tiang / Span JTM *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PSO-45 atau LTR1-112"
                    value={formNoTiang}
                    onChange={(e) => setFormNoTiang(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Lokasi Detail *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Raya Passo Pantai depan Pasar Baguala"
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
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
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
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
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Jarak ke Jaringan 20kV *</label>
                  <select
                    value={formJarak}
                    onChange={(e) => setFormJarak(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Menempel Kawat">Menempel Kawat (0 meter)</option>
                    <option value="< 1 meter">&lt; 1 meter (Kritis)</option>
                    <option value="1 - 2.5 meter">1 - 2.5 meter (Rawan)</option>
                    <option value="> 2.5 meter">&gt; 2.5 meter (Aman)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tingkat Bahaya *</label>
                  <select
                    value={formBahaya}
                    onChange={(e) => setFormBahaya(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Kritis (Bahaya Padam)">Kritis (Bahaya Padam)</option>
                    <option value="Potensi Roboh">Potensi Roboh</option>
                    <option value="Rawan Sentuh">Rawan Sentuh</option>
                    <option value="Aman / Terpangkas">Aman / Terpangkas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status Eksekusi *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Perlu Tebas">Perlu Tebas (Ranting)</option>
                    <option value="Perlu Tebang">Perlu Tebang (Batang Pohon)</option>
                    <option value="Perlu Izin Warga">Perlu Izin Warga</option>
                    <option value="Perlu Padam">Perlu Padam Feeder</option>
                    <option value="Selesai Pangkas">Selesai Pangkas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Jenis Pohon</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bambu Betung / Kelapa / Sengon"
                    value={formJenisPohon}
                    onChange={(e) => setFormJenisPohon(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Jumlah Pohon (Batang)</label>
                  <input
                    type="number"
                    min={1}
                    value={formJumlah}
                    onChange={(e) => setFormJumlah(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tanggal Temuan</label>
                  <input
                    type="date"
                    value={formTglTemuan}
                    onChange={(e) => setFormTglTemuan(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tanggal Eksekusi Selesai</label>
                  <input
                    type="date"
                    value={formTglEksekusi}
                    onChange={(e) => setFormTglEksekusi(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Petugas / Tim Pelaksana</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tim ROW Baguala - Valer Demny"
                    value={formPelaksana}
                    onChange={(e) => setFormPelaksana(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Keterangan & Catatan Khusus</label>
                  <textarea
                    rows={3}
                    placeholder="Catatan kondisi pohon, negosiasi warga, atau peralatan khusus..."
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition-all shadow-lg shadow-emerald-900/30"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-base">
                  Detail Pohon GIS: {selectedDetail.penyulang} - {selectedDetail.noTiangOrSpan}
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
                  <span className="text-slate-400 font-bold">Penyulang</span>
                  <span className="text-white font-extrabold">{selectedDetail.penyulang}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">No Tiang / Span</span>
                  <span className="text-emerald-400 font-mono font-black">{selectedDetail.noTiangOrSpan}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Lokasi</span>
                  <span className="text-slate-200 font-semibold text-right max-w-[65%]">{selectedDetail.lokasi}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Koordinat</span>
                  <span className="text-cyan-400 font-mono">{selectedDetail.lat.toFixed(6)}, {selectedDetail.lng.toFixed(6)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Jenis & Jumlah</span>
                  <span className="text-slate-200 font-bold">{selectedDetail.jenisPohon} ({selectedDetail.jumlahPohon} Pohon)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Jarak ke Jaringan</span>
                  <span className={`font-black ${selectedDetail.jarakKeJaringan === '< 1 meter' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {selectedDetail.jarakKeJaringan}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-bold">Tingkat Bahaya</span>
                  <span className="text-rose-400 font-bold">{selectedDetail.tingkatBahaya}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Status Eksekusi</span>
                  <span className="text-emerald-400 font-bold">{selectedDetail.statusEksekusi}</span>
                </div>
              </div>

              {selectedDetail.keterangan && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 font-bold mb-1">Catatan Lapangan:</div>
                  <p className="text-slate-300 italic">{selectedDetail.keterangan}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {selectedDetail.statusEksekusi === 'Selesai Pangkas' ? (
                  <button
                    onClick={() => {
                      if (selectedStatus !== 'Semua') setSelectedStatus('Semua');
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
                      if (selectedStatus !== 'Semua') setSelectedStatus('Semua');
                      if (selectedBahaya !== 'Semua' && selectedBahaya !== 'Aman / Terpangkas') setSelectedBahaya('Semua');
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
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
                >
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import File Modal */}
      <ImportPohonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBatchImport}
        penyulangList={penyulangList}
      />
    </div>
  );
};
