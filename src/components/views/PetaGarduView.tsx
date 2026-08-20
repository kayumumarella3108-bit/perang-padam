import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Search,
  Building2,
  Layers,
  Moon,
  Globe,
  Zap,
  Activity,
  ChevronRight,
  Info,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Gauge
} from 'lucide-react';
import { MasterGardu, PengukuranGardu } from '../../types';
import { ELECTRIC_ICON_SVG_STRINGS } from '../common/ElectricIcons';

interface PetaGarduViewProps {
  masterGarduList: MasterGardu[];
  pengukuranList: PengukuranGardu[];
  onUpdateGardu?: (gardu: MasterGardu) => void;
}

export const PetaGarduView: React.FC<PetaGarduViewProps> = ({
  masterGarduList,
  pengukuranList,
  onUpdateGardu
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPenyulang, setSelectedPenyulang] = useState('ALL');
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [activeGardu, setActiveGardu] = useState<MasterGardu | null>(null);
  const [editingIconGarduId, setEditingIconGarduId] = useState<string | null>(null);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Record<string, L.Marker>>({});

  // Unique penyulang list for filter
  const penyulangOptions = Array.from(new Set(masterGarduList.map((g) => g.penyulang).filter(Boolean)));

  // Helper to get latest measurement status for a gardu
  const getGarduStatus = (gardu: MasterGardu) => {
    // Find latest measurement matching noGarduBaru or noGarduLama
    const measurements = pengukuranList.filter(
      (p) =>
        p.noGardu?.toLowerCase() === gardu.noGarduBaru?.toLowerCase() ||
        p.noGardu?.toLowerCase() === gardu.noGarduLama?.toLowerCase()
    );
    if (measurements.length === 0) return { label: 'Belum Ukur', color: '#64748b', pct: 0 };

    const latest = measurements[measurements.length - 1];
    const daya = gardu.daya || 160;
    const iNominal = (daya * 1000) / (Math.sqrt(3) * 400);
    const iMax = Math.max(latest.iRTotal || 0, latest.iSTotal || 0, latest.iTTotal || 0);
    const pct = iNominal > 0 ? (iMax / iNominal) * 100 : 0;

    if (pct > 100) return { label: 'Critical (>100%)', color: '#f43f5e', pct };
    if (pct > 80) return { label: 'Overload (80-100%)', color: '#f59e0b', pct };
    if (pct > 60) return { label: 'Normal (60-80%)', color: '#10b981', pct };
    return { label: 'Normal / Underload', color: '#0ea5e9', pct };
  };

  // Filtered Gardu list
  const filteredGarduList = masterGarduList.filter((g) => {
    const matchSearch =
      (g.noGarduBaru || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.noGarduLama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.alamatGardu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.penyulang || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchPenyulang = selectedPenyulang === 'ALL' || g.penyulang === selectedPenyulang;
    return matchSearch && matchPenyulang;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center Ambon / ULP Baguala (-3.659, 128.192)
    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([-3.659, 128.192], 13);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap & CARTO',
        maxZoom: 19
      }
    ).addTo(map);

    (map as any)._customTileLayer = tileLayer;

    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const tileLayer = (map as any)._customTileLayer;
    if (tileLayer) {
      map.removeLayer(tileLayer);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap & CARTO';

    if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (mapStyle === 'street') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const newLayer = L.tileLayer(url, { attribution, maxZoom: 19 }).addTo(map);
    (map as any)._customTileLayer = newLayer;
  }, [mapStyle]);

  // Render markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();
    markersMapRef.current = {};

    const validItemsWithCoords: [number, number][] = [];

    filteredGarduList.forEach((gardu) => {
      const lat = parseFloat(gardu.latt as string);
      const lng = parseFloat(gardu.long as string);

      if (isNaN(lat) || isNaN(lng)) return;

      validItemsWithCoords.push([lat, lng]);

      const status = getGarduStatus(gardu);

      const tipeUpper = ((gardu.tipeGardu || '') + ' ' + (gardu.iconType || '')).toUpperCase();
      let garduSvg = ELECTRIC_ICON_SVG_STRINGS.garduTrafo;
      if (tipeUpper.includes('BETON') || tipeUpper.includes('KIOS') || tipeUpper.includes('BANGUNAN')) {
        garduSvg = ELECTRIC_ICON_SVG_STRINGS.garduBeton;
      } else if (tipeUpper.includes('CANTOL')) {
        garduSvg = ELECTRIC_ICON_SVG_STRINGS.garduPortal;
      } else if (tipeUpper.includes('PORTAL') || tipeUpper.includes('2 TIANG')) {
        garduSvg = ELECTRIC_ICON_SVG_STRINGS.garduPortal;
      } else if (tipeUpper.includes('SINGLE')) {
        garduSvg = ELECTRIC_ICON_SVG_STRINGS.tiangSingle;
      } else if (tipeUpper.includes('DOUBLE')) {
        garduSvg = ELECTRIC_ICON_SVG_STRINGS.tiangDouble;
      } else if (tipeUpper.includes('LBS') || tipeUpper.includes('SWITCH')) {
        garduSvg = ELECTRIC_ICON_SVG_STRINGS.tiangLBS;
      }

      const customIcon = L.divIcon({
        className: 'custom-gardu-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="width: 34px; height: 34px; border-radius: 10px; background: #0f172a; border: 2px solid ${status.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: ${status.color};">
              ${garduSvg}
            </div>
            <div style="position: absolute; bottom: -16px; background: #0f172a; color: #f8fafc; font-size: 8.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px; border: 1px solid ${status.color}; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">
              ${gardu.noGarduBaru || gardu.noGarduLama || 'Gardu'}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; padding: 4px; min-width: 200px; color: #0f172a;">
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px; color: #1e3a8a; display: flex; align-items: center; gap: 4px;">
            ⚡ ${gardu.noGarduBaru || '-'}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            No. Lama: ${gardu.noGarduLama || '-'}<br/>
            Alamat: ${gardu.alamatGardu || '-'}
          </div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
            <b>Penyulang:</b> ${gardu.penyulang || '-'}<br/>
            <b>Daya Trafo:</b> ${gardu.daya || 0} kVA (${gardu.jumlahFasa || '3 Fasa'})<br/>
            <b>Status Beban:</b> <span style="color: ${status.color}; font-weight: bold;">${status.label} (${status.pct.toFixed(1)}%)</span>
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #2563eb; color: white; padding: 5px; border-radius: 6px; font-size: 10px; font-weight: bold; text-decoration: none;">
            Buka di Google Maps ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setActiveGardu(gardu);
      });

      markerGroup.addLayer(marker);
      markersMapRef.current[gardu.id] = marker;
    });

    // Auto-fit bounds if we have valid items
    if (validItemsWithCoords.length > 0) {
      const bounds = L.latLngBounds(validItemsWithCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [filteredGarduList, pengukuranList]);

  // Focus specific gardu from sidebar list
  const handleFocusGardu = (gardu: MasterGardu) => {
    setActiveGardu(gardu);
    const lat = parseFloat(gardu.latt as string);
    const lng = parseFloat(gardu.long as string);
    const map = mapInstanceRef.current;
    if (!map || isNaN(lat) || isNaN(lng)) return;

    map.setView([lat, lng], 17, { animate: true });
    const marker = markersMapRef.current[gardu.id];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 300);
    }
  };

  const totalGarduCount = masterGarduList.length;
  const garduWithCoordsCount = masterGarduList.filter(
    (g) => !isNaN(parseFloat(g.latt as string)) && !isNaN(parseFloat(g.long as string))
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Master Gardu</span>
            <div className="text-xl font-black text-slate-900 mt-1">{totalGarduCount} Gardu</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gardu Terpetakan (GPS)</span>
            <div className="text-xl font-black text-emerald-600 mt-1">{garduWithCoordsCount} Titik Koordinat</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penyulang Aktif</span>
            <div className="text-xl font-black text-indigo-600 mt-1">{penyulangOptions.length} Penyulang</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Map & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ height: '700px' }}>
        
        {/* Left Sidebar: Gardu List & Filter */}
        <div className="lg:col-span-4 flex flex-col border-r border-slate-200 bg-slate-50/50 h-full">
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Daftar Titik Gardu Distribusi ({filteredGarduList.length})
            </h3>

            {/* Search & Penyulang Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari No. Gardu / Alamat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedPenyulang}
                onChange={(e) => setSelectedPenyulang(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Penyulang ({penyulangOptions.length})</option>
                {penyulangOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gardu Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredGarduList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                Tidak ada data gardu yang sesuai dengan pencarian.
              </div>
            ) : (
              filteredGarduList.map((gardu) => {
                const lat = parseFloat(gardu.latt as string);
                const lng = parseFloat(gardu.long as string);
                const hasCoord = !isNaN(lat) && !isNaN(lng);
                const status = getGarduStatus(gardu);
                const isSelected = activeGardu?.id === gardu.id;

                return (
                  <div
                    key={gardu.id}
                    onClick={() => hasCoord && handleFocusGardu(gardu)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{gardu.noGarduBaru || gardu.noGarduLama}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {gardu.alamatGardu || 'Alamat tidak tersedia'}
                        </div>
                      </div>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md text-white shrink-0"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.label.split(' ')[0]}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {gardu.penyulang || 'Penyulang Umum'} ({gardu.daya || 0} kVA)
                      </span>
                      {hasCoord ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-bold">
                          <MapPin className="w-3 h-3" /> GPS Valid
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3" /> No Lat/Long
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Interactive Leaflet Map */}
        <div className="lg:col-span-8 relative h-full">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Top Right Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl">
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapStyle === 'dark' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Satelit</span>
            </button>
            <button
              onClick={() => setMapStyle('street')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapStyle === 'street' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Street</span>
            </button>
          </div>

          {/* Bottom Left Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-2.5 rounded-xl border border-slate-700 shadow-xl text-white text-[11px] space-y-1.5">
            <div className="font-bold text-slate-300 text-[10px] uppercase tracking-wider mb-1">
              Legenda Status Trafo
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f43f5e] inline-block shadow"></span>
              <span>Critical ({'>'}100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block shadow"></span>
              <span>Overload (80-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981] inline-block shadow"></span>
              <span>Normal (60-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0ea5e9] inline-block shadow"></span>
              <span>Underload / Normal</span>
            </div>
          </div>

          {/* Active Gardu Drawer & Icon Selector Per Titik */}
          {activeGardu && (
            <div className="absolute top-4 left-4 z-30 bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    ⚡ {activeGardu.noGarduBaru || activeGardu.noGarduLama}
                  </div>
                  <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
                    {activeGardu.penyulang} &bull; {activeGardu.daya || 160} kVA
                  </div>
                </div>
                <button
                  onClick={() => setActiveGardu(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Icon Selector Per Titik (1-Click Change) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider block">
                  🎨 Ubah Icon Marker Titik Ini:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'GTT Trafo', value: 'GTT Trafo', emoji: '⚡' },
                    { label: 'Gardu Beton', value: 'Gardu Beton', emoji: '🏢' },
                    { label: 'Gardu Cantol', value: 'Gardu Cantol', emoji: '🔌' },
                    { label: 'Gardu Portal', value: 'Gardu Portal', emoji: '📐' },
                    { label: 'Tiang Single', value: 'Tiang Single', emoji: '💈' },
                    { label: 'Tiang Double', value: 'Tiang Double', emoji: '🗼' }
                  ].map((opt) => {
                    const isCurrent =
                      (activeGardu.tipeGardu || '').toLowerCase().includes(opt.value.toLowerCase()) ||
                      (activeGardu.iconType || '').toLowerCase().includes(opt.value.toLowerCase());

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...activeGardu,
                            tipeGardu: opt.value,
                            iconType: opt.value
                          };
                          setActiveGardu(updated);
                          if (onUpdateGardu) {
                            onUpdateGardu(updated);
                          }
                        }}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 justify-center ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{opt.emoji}</span>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Alamat: {activeGardu.alamatGardu || '-'}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeGardu.latt},${activeGardu.long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline font-bold"
                >
                  GPS ↗
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
