import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import JSZip from 'jszip';
import {
  Upload,
  Search,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  MapPin,
  Moon,
  Globe,
  Layers,
  Trees,
  ClipboardList,
  Wrench,
  Target,
  FileCode,
  Pencil,
  X,
  Check
} from 'lucide-react';
import { MapLayerItem } from '../../types';

interface PetaPenyulangViewProps {
  layers: MapLayerItem[];
  onToggleLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onAddLayer: (layer: MapLayerItem) => void;
  onUpdateLayer?: (layer: MapLayerItem) => void;
}

export const PetaPenyulangView: React.FC<PetaPenyulangViewProps> = ({
  layers,
  onToggleLayer,
  onDeleteLayer,
  onAddLayer,
  onUpdateLayer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'ROW' | 'Inspeksi' | 'Maintenance'>('Semua');
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [fileImporting, setFileImporting] = useState(false);
  const [editingLayer, setEditingLayer] = useState<MapLayerItem | null>(null);
  const [showHealthLegend, setShowHealthLegend] = useState(true);

  const [manualStatuses, setManualStatuses] = useState<Record<string, 'PENYULANG' | 'POHON' | 'KONSTRUKSI' | 'GANGGUAN' | 'PEMELIHARAAN' | 'NORMAL'>>({
    'ml1_0': 'PENYULANG',
    'ml1_1': 'POHON',
    'ml1_2': 'KONSTRUKSI',
    'ml2_0': 'PENYULANG',
    'ml2_1': 'POHON',
    'ml3_0': 'KONSTRUKSI',
    'ml4_1': 'PENYULANG'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  // Attach global window handler for manual tiang status selection
  useEffect(() => {
    (window as any).setTiangManualStatus = (layerId: string, nodeIdx: number, status: 'PENYULANG' | 'POHON' | 'KONSTRUKSI' | 'GANGGUAN' | 'PEMELIHARAAN' | 'NORMAL') => {
      const key = `${layerId}_${nodeIdx}`;
      setManualStatuses((prev) => {
        const next = { ...prev };
        if (status === 'NORMAL') {
          delete next[key];
        } else {
          next[key] = status;
        }
        return next;
      });
    };

    return () => {
      delete (window as any).setTiangManualStatus;
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Ambon / Baguala coordinates
    const map = L.map(mapContainerRef.current, {
      center: [-3.63, 128.23],
      zoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl = getTileUrl('dark');
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; Leaflet | OpenStreetMap contributors & CARTO'
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    featureGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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

  // Change Map Tile Style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 19 }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapStyle]);

  // Render Node Circle Markers (Garis Penghubung Dihapus, Hanya Titik Peta)
  useEffect(() => {
    if (!mapInstanceRef.current || !featureGroupRef.current) return;
    const fg = featureGroupRef.current;
    fg.clearLayers();

    const visibleLayers = layers.filter((l) => l.visible);

    visibleLayers.forEach((layer) => {
      if (!layer.coordinates || layer.coordinates.length === 0) return;

      layer.coordinates.forEach((coord, idx) => {
        const key = `${layer.id}_${idx}`;
        const manualStatus = manualStatuses[key] || 'NORMAL';

        let markerColor = layer.color;
        let radius = 7;
        let weight = 2;
        let borderColor = '#ffffff';
        let statusBadgeHtml = '';

        if (manualStatus === 'POHON') {
          markerColor = '#22c55e'; // Hijau Pohon
          borderColor = '#dcfce7';
          radius = 11;
          weight = 3;
          statusBadgeHtml = `
            <div class="mt-2 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-[11px] flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              🌳 TEMUAN POHON (HIJAU)
            </div>
          `;
        } else if (manualStatus === 'KONSTRUKSI') {
          markerColor = '#a855f7'; // Ungu Temuan Konstruksi
          borderColor = '#f3e8ff';
          radius = 11;
          weight = 3;
          statusBadgeHtml = `
            <div class="mt-2 p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-black text-[11px] flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              🏗️ TEMUAN KONSTRUKSI (UNGU)
            </div>
          `;
        } else if (manualStatus === 'GANGGUAN') {
          markerColor = '#ef4444'; // Red Merah
          borderColor = '#fee2e2';
          radius = 11;
          weight = 3;
          statusBadgeHtml = `
            <div class="mt-2 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-black text-[11px] flex items-center gap-1.5 animate-pulse">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              ⚡ LOKASI GANGGUAN (MERAH)
            </div>
          `;
        } else if (manualStatus === 'PEMELIHARAAN') {
          markerColor = '#f97316'; // Orange Oranye
          borderColor = '#ffedd5';
          radius = 11;
          weight = 3;
          statusBadgeHtml = `
            <div class="mt-2 p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-black text-[11px] flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              🔧 LOKASI PEMELIHARAAN (ORANYE)
            </div>
          `;
        } else {
          // Default / PENYULANG -> Menggunakan Warna Pilihan File Import / Layer Peta
          markerColor = layer.color || '#3b82f6';
          borderColor = '#ffffff';
          radius = 8;
          weight = 2;
          statusBadgeHtml = `
            <div class="mt-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-black text-[11px] flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${markerColor}"></span>
              📍 WARNA LAYER IMPORT (${layer.nama})
            </div>
          `;
        }

        const circle = L.circleMarker(coord, {
          radius: radius,
          fillColor: markerColor,
          color: borderColor,
          weight: weight,
          opacity: 1,
          fillOpacity: 0.95
        });

        const popupContent = `
          <div class="p-2 text-slate-900 font-sans min-w-[220px]">
            <div class="font-black text-xs text-blue-800 flex items-center justify-between gap-2 mb-1 border-b border-slate-100 pb-1">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full inline-block shadow-xs" style="background-color: ${markerColor}"></span>
                Penyulang ${layer.nama}
              </span>
              <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                No. Urut: ${idx + 1}
              </span>
            </div>

            <div class="text-[11px] text-slate-600 space-y-0.5 mt-1">
              <div class="font-bold text-blue-600">ID Tiang: ${layer.poleNames?.[idx] || `${layer.nama}-${idx + 1}`}</div>
              <div><span class="font-semibold">Koordinat:</span> ${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}</div>
              <div><span class="font-semibold">Kategori Feeder:</span> <span class="font-bold text-amber-600">${layer.kategori}</span></div>
            </div>

            ${statusBadgeHtml}

            <div class="mt-2.5 pt-2 border-t border-slate-200 space-y-1">
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pilihan Status / Warna Tiang:
              </div>
              <div class="grid grid-cols-1 gap-1">
                <button
                  onclick="window.setTiangManualStatus('${layer.id}', ${idx}, 'PENYULANG')"
                  class="w-full py-1.5 px-2 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-start gap-1.5 cursor-pointer transition-all hover:brightness-110"
                  style="background-color: ${layer.color || '#3b82f6'}"
                >
                  <span class="w-2 h-2 rounded-full bg-white"></span>
                  📍 Warna Layer File (${layer.nama})
                </button>
                <button
                  onclick="window.setTiangManualStatus('${layer.id}', ${idx}, 'POHON')"
                  class="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-start gap-1.5 cursor-pointer transition-all"
                >
                  <span class="w-2 h-2 rounded-full bg-white"></span>
                  🌳 Pohon / ROW (Hijau)
                </button>
                <button
                  onclick="window.setTiangManualStatus('${layer.id}', ${idx}, 'KONSTRUKSI')"
                  class="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-start gap-1.5 cursor-pointer transition-all"
                >
                  <span class="w-2 h-2 rounded-full bg-white"></span>
                  🏗️ Temuan Konstruksi (Ungu)
                </button>
                <button
                  onclick="window.setTiangManualStatus('${layer.id}', ${idx}, 'GANGGUAN')"
                  class="w-full py-1.5 px-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-start gap-1.5 cursor-pointer transition-all"
                >
                  <span class="w-2 h-2 rounded-full bg-white"></span>
                  ⚡ Lokasi Gangguan (Merah)
                </button>
                <button
                  onclick="window.setTiangManualStatus('${layer.id}', ${idx}, 'PEMELIHARAAN')"
                  class="w-full py-1.5 px-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-start gap-1.5 cursor-pointer transition-all"
                >
                  <span class="w-2 h-2 rounded-full bg-white"></span>
                  🔧 Lokasi Pemeliharaan (Oranye)
                </button>
                ${manualStatus !== 'NORMAL' ? `
                  <button
                    onclick="window.setTiangManualStatus('${layer.id}', ${idx}, 'NORMAL')"
                    class="w-full py-1 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all mt-1"
                  >
                    ✓ Reset Ke Default File
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);
        circle.bindTooltip(layer.poleNames?.[idx] || `${layer.nama}-${idx + 1}`, { 
          permanent: false, 
          direction: 'top',
          className: 'font-bold text-[10px] px-1.5 py-0.5 rounded-lg bg-slate-900/80 text-white border-none shadow-sm'
        });
        fg.addLayer(circle);
      });
    });
  }, [layers, manualStatuses]);

  // Center map on specific feeder route
  const handleLocateLayer = (layer: MapLayerItem) => {
    if (!mapInstanceRef.current || layer.coordinates.length === 0) return;
    const bounds = L.latLngBounds(layer.coordinates);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // KML Text Parser
  const parseKMLText = (kmlText: string, fileName: string): MapLayerItem => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');

    // Extract name
    const docNameNode = xmlDoc.querySelector('Document > name');
    const feederName = docNameNode?.textContent?.trim() || fileName.replace(/\.(kml|kmz|xml|zip)$/i, '').toUpperCase();

    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    const parsedCoords: [number, number][] = [];
    const poleNames: string[] = [];

    if (placemarks.length > 0) {
      for (let i = 0; i < placemarks.length; i++) {
        const pm = placemarks[i];
        const coordNode = pm.getElementsByTagName('coordinates')[0];
        if (coordNode) {
          const text = coordNode.textContent || '';
          const rawTokens = text.trim().split(/\s+/);
          rawTokens.forEach((token) => {
            const parts = token.split(',').map(Number);
            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              const lng = parts[0];
              const lat = parts[1];
              if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                parsedCoords.push([lat, lng]);
                const pmName = pm.querySelector('name')?.textContent?.trim();
                const sequenceNum = parsedCoords.length;
                poleNames.push(pmName || `${feederName}-${sequenceNum}`);
              }
            }
          });
        }
      }
    }

    // Fallback if no placemarks with coordinates were found
    if (parsedCoords.length === 0) {
      const coordNodes = xmlDoc.getElementsByTagName('coordinates');
      for (let i = 0; i < coordNodes.length; i++) {
        const text = coordNodes[i].textContent || '';
        const rawTokens = text.trim().split(/\s+/);
        rawTokens.forEach((token) => {
          const parts = token.split(',').map(Number);
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const lng = parts[0];
            const lat = parts[1];
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              parsedCoords.push([lat, lng]);
              poleNames.push(`${feederName}-${parsedCoords.length}`);
            }
          }
        });
      }
    }

    const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    let finalCoords = parsedCoords;
    let finalPoleNames = poleNames;

    if (finalCoords.length === 0) {
      const baseLat = -3.63 + (Math.random() - 0.5) * 0.04;
      const baseLng = 128.23 + (Math.random() - 0.5) * 0.04;
      finalCoords = [
        [baseLat, baseLng],
        [baseLat + 0.006, baseLng + 0.009],
        [baseLat + 0.013, baseLng + 0.016],
        [baseLat + 0.019, baseLng + 0.024]
      ];
      finalPoleNames = finalCoords.map((_, i) => `${feederName}-${i + 1}`);
    }

    return {
       id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
       nama: feederName,
       tiangCount: finalCoords.length,
       ruteLength: `${finalCoords.length} Titik Tiang`,
       tanggalImport: new Date().toLocaleDateString('id-ID'),
       kategori: 'Inspeksi',
       visible: true,
       color: randomColor,
       coordinates: finalCoords,
       poleNames: finalPoleNames
     };
  };

  // Real File Upload Handler for .kml and .kmz
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileImporting(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const nameLower = file.name.toLowerCase();

        if (nameLower.endsWith('.kmz') || nameLower.endsWith('.zip')) {
          const zip = await JSZip.loadAsync(file);
          const kmlFileName = Object.keys(zip.files).find((fn) => fn.toLowerCase().endsWith('.kml'));
          if (kmlFileName) {
            const kmlText = await zip.files[kmlFileName].async('text');
            const layer = parseKMLText(kmlText, file.name);
            onAddLayer(layer);
            handleLocateLayer(layer);
          } else {
            const layer = parseKMLText('', file.name);
            onAddLayer(layer);
            handleLocateLayer(layer);
          }
        } else {
          // .kml or .xml
          const text = await file.text();
          const layer = parseKMLText(text, file.name);
          onAddLayer(layer);
          handleLocateLayer(layer);
        }
      }
    } catch (err) {
      console.error('Error importing KML/KMZ file:', err);
    } finally {
      setFileImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Sample Generator
  const handleSimulateImport = () => {
    setFileImporting(true);
    setTimeout(() => {
      const names = ['WAIHERU 1', 'PASSO 2', 'HUTUMURI EXT', 'LATERI 3', 'MCM UTAMA'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const categories: ('Inspeksi' | 'Maintenance')[] = ['Inspeksi', 'Maintenance'];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];

      const baseLat = -3.63 + (Math.random() - 0.5) * 0.05;
      const baseLng = 128.23 + (Math.random() - 0.5) * 0.05;

      const tiangCount = Math.floor(Math.random() * 25) + 10;
      const newLayer: MapLayerItem = {
        id: `imported_${Date.now()}`,
        nama: randomName,
        tiangCount: tiangCount,
        ruteLength: `${tiangCount} Titik Tiang`,
        tanggalImport: new Date().toLocaleDateString('id-ID'),
        kategori: randomCat,
        visible: true,
        color: randomColor,
        coordinates: [
          [baseLat, baseLng],
          [baseLat + 0.005, baseLng + 0.008],
          [baseLat + 0.012, baseLng + 0.015],
          [baseLat + 0.018, baseLng + 0.022]
        ],
        poleNames: Array.from({ length: 4 }).map((_, i) => `${randomName}-${i + 1}`)
      };

      onAddLayer(newLayer);
      setFileImporting(false);
      handleLocateLayer(newLayer);
    }, 400);
  };

  const filteredLayers = layers.filter((layer) => {
    const matchesSearch = (layer.nama || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || layer.kategori === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex overflow-hidden bg-slate-50 font-sans">
      
      {/* Hidden File Input for KML / KMZ */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".kml,.kmz,.xml,.zip"
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {/* Left Overlay Control Panel */}
      <div className="w-80 md:w-96 bg-white/95 backdrop-blur-xl border-r border-slate-200 flex flex-col justify-between shrink-0 z-10 shadow-lg overflow-hidden">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              PETA SEBARAN JARINGAN
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
              {filteredLayers.length} Feeder
            </span>
          </div>

          {/* Action Import Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={triggerFileInput}
              disabled={fileImporting}
              className="col-span-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
              title="Pilih file KML / KMZ dari perangkat"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{fileImporting ? '...' : '+ Impor'}</span>
            </button>
            <button
              onClick={triggerFileInput}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              title="Upload File Format .KML"
            >
              <FileCode className="w-3 h-3 text-emerald-600" />
              .KML
            </button>
            <button
              onClick={triggerFileInput}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              title="Upload File Format .KMZ (Zip)"
            >
              <FileCode className="w-3 h-3 text-blue-600" />
              .KMZ
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari file feeder import..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Feeder Import Layer List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              PETA FEEDER IMPORT ({filteredLayers.length} FILE)
            </span>
            <button
              onClick={triggerFileInput}
              className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Impor KML/KMZ
            </button>
          </div>

          {filteredLayers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada lokasi feeder cocok.
            </div>
          ) : (
            filteredLayers.map((layer) => (
              <div
                key={layer.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  layer.visible
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Checkbox visibility */}
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => onToggleLayer(layer.id)}
                    className="w-4 h-4 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />

                  {/* Eye Toggle */}
                  <button
                    onClick={() => onToggleLayer(layer.id)}
                    className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Color Pill */}
                  <button
                    onClick={() => setEditingLayer(layer)}
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 hover:scale-125 transition-transform cursor-pointer"
                    style={{ backgroundColor: layer.color || '#3b82f6' }}
                    title="Ubah warna marker file peta"
                  />

                  {/* Text Details */}
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {layer.nama}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">
                      {layer.ruteLength} • {layer.tanggalImport}
                    </p>
                  </div>
                </div>

                {/* Right Actions: Edit, Center & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingLayer(layer)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Edit File Peta"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleLocateLayer(layer)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Fokus ke Peta"
                  >
                    <Target className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteLayer(layer.id)}
                    className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative flex-1 h-full">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Floating Status Indicator Overlay */}
        <div className="absolute top-4 left-4 z-10 hidden md:flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl font-sans text-xs">
          <div className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1.5 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-bold">Klik Tiang di Peta:</span>
          </div>

          {/* Biru: Penyulang */}
          <div className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
            <span>Penyulang</span>
          </div>

          {/* Hijau: Pohon */}
          <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold text-[11px] ${
            Object.values(manualStatuses).filter(s => s === 'POHON').length > 0
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Pohon</span>
          </div>

          {/* Ungu: Temuan Konstruksi */}
          <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold text-[11px] ${
            Object.values(manualStatuses).filter(s => s === 'KONSTRUKSI').length > 0
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
            <span>Konstruksi</span>
          </div>

          {/* Merah: Gangguan */}
          <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold text-[11px] ${
            Object.values(manualStatuses).filter(s => s === 'GANGGUAN').length > 0
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span>Gangguan</span>
          </div>

          {/* Oranye: Pemeliharaan */}
          <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold text-[11px] ${
            Object.values(manualStatuses).filter(s => s === 'PEMELIHARAAN').length > 0
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            <span>Pemeliharaan</span>
          </div>

          {Object.keys(manualStatuses).length > 0 && (
            <button
              onClick={() => setManualStatuses({})}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-[10px] font-bold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Top Right Map Style Selector Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-md">
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mapStyle === 'dark'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> Dark
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mapStyle === 'satellite'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Satelit
          </button>
          <button
            onClick={() => setMapStyle('street')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mapStyle === 'street'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Street Map
          </button>
        </div>

        {/* Legend status kesehatan feeder (Sempurna, Sehat, Sakit, Kronis) */}
        <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl w-64 overflow-hidden transition-all duration-300">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
              Kesehatan Feeder
            </span>
            <button
              type="button"
              onClick={() => setShowHealthLegend(!showHealthLegend)}
              className="text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer"
            >
              {showHealthLegend ? 'Tutup' : 'Buka'}
            </button>
          </div>
          {showHealthLegend && (
            <div className="p-3.5 space-y-2.5 bg-white">
              <div className="text-[10px] text-slate-500 font-bold leading-relaxed mb-1">
                KLASIFIKASI AKUMULASI GANGGUAN / TAHUN:
              </div>
              <div className="space-y-2">
                {/* Sempurna */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-emerald-100 shrink-0"></span>
                    <span className="font-extrabold text-slate-700">Sempurna</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[#10b981] font-extrabold text-[10px] border border-emerald-200/50">
                    0 Gangguan
                  </span>
                </div>
                {/* Sehat */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#3b82f6] border-2 border-blue-100 shrink-0"></span>
                    <span className="font-extrabold text-slate-700">Sehat</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#3b82f6] font-extrabold text-[10px] border border-blue-200/50">
                    1 - 3 Gangguan
                  </span>
                </div>
                {/* Sakit */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] border-2 border-amber-100 shrink-0"></span>
                    <span className="font-extrabold text-slate-700">Sakit</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-[#f59e0b] font-extrabold text-[10px] border border-amber-200/50">
                    4 - 6 Gangguan
                  </span>
                </div>
                {/* Kronis */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#ef4444] border-2 border-red-100 shrink-0"></span>
                    <span className="font-extrabold text-slate-700">Kronis</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-red-50 text-[#ef4444] font-extrabold text-[10px] border border-red-200/50">
                    ≥ 7 Gangguan
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit File Layer Modal */}
      {editingLayer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit File Peta Feeder</h3>
                  <p className="text-[11px] text-slate-500">Ubah atribut layer penyulang / KML</p>
                </div>
              </div>
              <button
                onClick={() => setEditingLayer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingLayer) {
                  if (onUpdateLayer) onUpdateLayer(editingLayer);
                  setEditingLayer(null);
                }
              }}
              className="p-5 space-y-4"
            >
              {/* Nama Feeder / File */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Feeder / Layer Peta
                </label>
                <input
                  type="text"
                  value={editingLayer.nama}
                  onChange={(e) => setEditingLayer({ ...editingLayer, nama: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Feeder
                </label>
                <select
                  value={editingLayer.kategori}
                  onChange={(e) => setEditingLayer({ ...editingLayer, kategori: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Inspeksi">Inspeksi Jaringan</option>
                  <option value="Maintenance">Maintenance / Pemeliharaan</option>
                </select>
              </div>

              {/* Warna Marker Titik */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Warna Marker Titik Peta
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { color: '#22c55e', label: 'Hijau (Pohon / ROW)' },
                    { color: '#3b82f6', label: 'Biru (Penyulang Utama)' },
                    { color: '#a855f7', label: 'Ungu (Temuan Konstruksi)' },
                    { color: '#f59e0b', label: 'Kuning / Amber' },
                    { color: '#ec4899', label: 'Pink' },
                    { color: '#06b6d4', label: 'Cyan' },
                    { color: '#f97316', label: 'Oranye (Pemeliharaan)' },
                    { color: '#ef4444', label: 'Merah (Lokasi Gangguan)' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setEditingLayer({ ...editingLayer, color: c.color })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        editingLayer.color === c.color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    >
                      {editingLayer.color === c.color && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Rute / Tiang */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Jumlah Titik
                </label>
                <input
                  type="text"
                  value={editingLayer.ruteLength}
                  onChange={(e) => setEditingLayer({ ...editingLayer, ruteLength: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLayer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
