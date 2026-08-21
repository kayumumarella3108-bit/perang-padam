import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Gauge,
  Sliders,
  Sparkles,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { MasterGardu, PengukuranGardu } from '../../types';

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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [activeGardu, setActiveGardu] = useState<MasterGardu | null>(null);

  // Map refs (No clustering, fast lightweight canvas/layer group)
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const rawMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Record<string, L.Marker>>({});

  // Unique penyulang list for filter
  const penyulangOptions = useMemo(
    () => Array.from(new Set(masterGarduList.map((g) => g.penyulang).filter(Boolean))),
    [masterGarduList]
  );

  // Helper to get latest measurement status for a gardu
  const getGarduStatus = (gardu: MasterGardu) => {
    const measurements = pengukuranList.filter(
      (p) =>
        p.noGardu?.toLowerCase() === gardu.noGarduBaru?.toLowerCase() ||
        p.noGardu?.toLowerCase() === gardu.noGarduLama?.toLowerCase()
    );
    if (measurements.length === 0) return { label: 'Belum Ukur', color: '#64748b', category: 'Belum Ukur', pct: 0 };

    const latest = measurements[measurements.length - 1];
    const daya = Number(gardu.daya) || 160;
    const iNominal = (daya * 1000) / (Math.sqrt(3) * 400);
    const iMax = Math.max(latest.iRTotal || 0, latest.iSTotal || 0, latest.iTTotal || 0);
    const pct = iNominal > 0 ? (iMax / iNominal) * 100 : 0;

    if (pct < 0) return { label: 'Under 0%', color: '#64748b', category: 'Under 0%', pct };
    if (pct <= 20) return { label: '0% - 20%', color: '#38bdf8', category: '0% - 20%', pct };
    if (pct <= 40) return { label: '20% - 40%', color: '#22d3ee', category: '20% - 40%', pct };
    if (pct <= 60) return { label: '40% - 60%', color: '#10b981', category: '40% - 60%', pct };
    if (pct <= 80) return { label: '60% - 80%', color: '#14b8a6', category: '60% - 80%', pct };
    if (pct <= 100) return { label: '80% - 100%', color: '#f59e0b', category: '80% - 100%', pct };
    return { label: '> 100%', color: '#f43f5e', category: '> 100%', pct };
  };

  // Filtered Gardu list
  const filteredGarduList = useMemo(() => {
    return masterGarduList.filter((g) => {
      const matchSearch =
        (g.noGarduBaru || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.noGarduLama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.alamatGardu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.penyulang || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchPenyulang = selectedPenyulang === 'ALL' || g.penyulang === selectedPenyulang;
      
      const status = getGarduStatus(g);
      let matchStatus = true;
      if (selectedStatusFilter !== 'ALL') {
        matchStatus = status.label === selectedStatusFilter;
      }

      return matchSearch && matchPenyulang && matchStatus;
    });
  }, [masterGarduList, searchQuery, selectedPenyulang, selectedStatusFilter, pengukuranList]);

  // Status statistics for summary
  const stats = useMemo(() => {
    let critical = 0;
    let overload = 0;
    let normal = 0;
    let unmeasured = 0;
    let mappedCount = 0;

    masterGarduList.forEach((g) => {
      const lat = parseFloat(g.latt as string);
      const lng = parseFloat(g.long as string);
      if (!isNaN(lat) && !isNaN(lng)) mappedCount++;

      const st = getGarduStatus(g);
      if (st.category === 'CRITICAL') critical++;
      else if (st.category === 'OVERLOAD') overload++;
      else if (st.category === 'NORMAL') normal++;
      else unmeasured++;
    });

    return { total: masterGarduList.length, mappedCount, critical, overload, normal, unmeasured };
  }, [masterGarduList, pengukuranList]);

  // Helper to get tile url
  const getTileUrl = (style: 'dark' | 'satellite' | 'street') => {
    if (style === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (style === 'street') {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  };

  // Initialize Map with Leaflet Canvas Renderer Engine
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create high-performance Leaflet map with Canvas preference
    const map = L.map(mapContainerRef.current, {
      center: [-3.659, 128.192],
      zoom: 13,
      zoomControl: false,
      preferCanvas: true,
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true
    });

    // Create high-performance Leaflet canvas renderer
    const canvasRenderer = L.canvas({ padding: 0.5 });
    canvasRendererRef.current = canvasRenderer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer(getTileUrl('dark'), {
      attribution: '&copy; OpenStreetMap & CARTO',
      maxZoom: 19
    }).addTo(map);

    (map as any)._customTileLayer = tileLayer;

    // Create Layer Groups
    const rawGroup = L.layerGroup().addTo(map);
    rawMarkerGroupRef.current = rawGroup;

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

    let attribution = '&copy; OpenStreetMap & CARTO';
    if (mapStyle === 'satellite') {
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (mapStyle === 'street') {
      attribution = '&copy; OpenStreetMap contributors';
    }

    const newLayer = L.tileLayer(getTileUrl(mapStyle), { attribution, maxZoom: 19 }).addTo(map);
    (map as any)._customTileLayer = newLayer;
  }, [mapStyle]);

  // Build & Render Lightweight Distribution Transformer Markers (No clustering, fast color dots)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear raw marker group
    if (rawMarkerGroupRef.current) {
      rawMarkerGroupRef.current.clearLayers();
    }

    markersMapRef.current = {};
    const validItemsWithCoords: [number, number][] = [];
    const targetGroup = rawMarkerGroupRef.current;
    if (!targetGroup) return;

    // Iterate through filtered gardu list and construct lightweight color-coded markers
    filteredGarduList.forEach((gardu) => {
      const rawLat = gardu.latitude !== undefined ? gardu.latitude : gardu.latt;
      const rawLng = gardu.longitude !== undefined ? gardu.longitude : gardu.long;
      const lat = parseFloat(String(rawLat ?? ''));
      const lng = parseFloat(String(rawLng ?? ''));

      if (isNaN(lat) || isNaN(lng)) return;

      validItemsWithCoords.push([lat, lng]);

      const status = getGarduStatus(gardu);
      const kodeTrafo = gardu.noGarduBaru || gardu.noBaru || gardu.noGarduLama || '';

      // Lightweight marker with transformer code label badge
      const customIcon = L.divIcon({
        className: 'gardu-label-marker',
        html: `
          <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap; transform: translate(-10px, -10px); pointer-events: auto;">
            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${status.color}; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.6); flex-shrink: 0;"></div>
            ${kodeTrafo ? `<span style="background: rgba(15, 23, 42, 0.9); color: white; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${kodeTrafo}</span>` : ''}
          </div>
        `,
        iconSize: [120, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; padding: 4px; min-width: 220px; color: #0f172a;">
          <div style="font-weight: 900; font-size: 13.5px; margin-bottom: 2px; color: #1e3a8a; display: flex; align-items: center; justify-content: space-between; gap: 4px;">
            <span>⚡ ${gardu.noGarduBaru || '-'}</span>
            <span style="font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: white; background: ${status.color};">
              ${status.label.split(' ')[0]}
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; line-height: 1.35;">
            <b>No. Lama:</b> ${gardu.noGarduLama || '-'}<br/>
            <b>Alamat:</b> ${gardu.alamatGardu || '-'}
          </div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; font-size: 11px; margin-bottom: 6px; line-height: 1.4;">
            <b>Penyulang:</b> ${gardu.penyulang || '-'}<br/>
            <b>Daya Trafo:</b> ${gardu.daya || 0} kVA (${gardu.jumlahFasa || '3 Fasa'})<br/>
            <b>Status Beban:</b> <span style="color: ${status.color}; font-weight: bold;">${status.label} (${status.pct.toFixed(1)}%)</span>
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #2563eb; color: white; padding: 6px; border-radius: 6px; font-size: 10.5px; font-weight: 800; text-decoration: none; box-shadow: 0 2px 4px rgba(37,99,235,0.3);">
            Buka Navigasi Google Maps ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        autoPanPadding: [50, 50]
      });

      marker.on('click', () => {
        setActiveGardu(gardu);
      });

      targetGroup.addLayer(marker);
      markersMapRef.current[gardu.id] = marker;
    });

    // Auto-fit bounds if we have valid items
    if (validItemsWithCoords.length > 0) {
      const bounds = L.latLngBounds(validItemsWithCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [filteredGarduList]);

  // Focus specific gardu from sidebar list
  const handleFocusGardu = (gardu: MasterGardu) => {
    setActiveGardu(gardu);
    const lat = parseFloat(gardu.latt as string);
    const lng = parseFloat(gardu.long as string);
    const map = mapInstanceRef.current;
    if (!map || isNaN(lat) || isNaN(lng)) return;

    const marker = markersMapRef.current[gardu.id];
    if (marker) {
      map.setView([lat, lng], 17, { animate: true });
      setTimeout(() => {
        marker.openPopup();
      }, 300);
    } else {
      map.setView([lat, lng], 17, { animate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Stats with Cluster & Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Gardu</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">{stats.total} Trafo</div>
            <div className="text-[10px] text-emerald-600 font-bold">{stats.mappedCount} Titik GPS Valid</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-4.5 h-4.5" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedStatusFilter === 'CRITICAL'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/50 shadow-xs'
              : 'bg-white border-slate-200 shadow-2xs hover:border-rose-200'
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3" /> Trafo Critical
            </span>
            <div className="text-lg font-black text-rose-600 mt-0.5">{stats.critical} Gardu</div>
            <div className="text-[10px] text-slate-500 font-semibold">{'>'} 100% Kapasitas</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'OVERLOAD' ? 'ALL' : 'OVERLOAD')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedStatusFilter === 'OVERLOAD'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/50 shadow-xs'
              : 'bg-white border-slate-200 shadow-2xs hover:border-amber-200'
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Overload</span>
            <div className="text-lg font-black text-amber-600 mt-0.5">{stats.overload} Gardu</div>
            <div className="text-[10px] text-slate-500 font-semibold">80% - 100% Beban</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Gauge className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Fast Render
            </span>
            <div className="text-lg font-black text-indigo-700 mt-0.5">
              Tanpa Cluster
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">Marker Warna Ringan</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Main Map & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ height: '720px' }}>
        
        {/* Left Sidebar: Gardu List & Filter */}
        <div className="lg:col-span-4 flex flex-col border-r border-slate-200 bg-slate-50/50 h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Gardu Distribusi ({filteredGarduList.length})
              </h3>
              {selectedStatusFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedStatusFilter('ALL')}
                  className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>

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

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedPenyulang}
                  onChange={(e) => setSelectedPenyulang(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Feeder ({penyulangOptions.length})</option>
                  {penyulangOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Status Beban</option>
                  <option value="Under 0%">Under 0%</option>
                  <option value="0% - 20%">0% - 20%</option>
                  <option value="20% - 40%">20% - 40%</option>
                  <option value="40% - 60%">40% - 60%</option>
                  <option value="60% - 80%">60% - 80%</option>
                  <option value="80% - 100%">80% - 100%</option>
                  <option value="> 100%">{'>'} 100%</option>
                  <option value="Belum Ukur">Belum Ukur</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gardu Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredGarduList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium space-y-2">
                <AlertTriangle className="w-6 h-6 text-slate-300 mx-auto" />
                <div>Tidak ada data gardu yang sesuai dengan pencarian / filter.</div>
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
                        ? 'bg-blue-50/90 border-blue-400 shadow-sm ring-1 ring-blue-400/50'
                        : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{gardu.noGarduBaru || gardu.noGarduLama}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {gardu.alamatGardu || 'Alamat tidak tersedia'}
                        </div>
                      </div>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md text-white shrink-0 shadow-2xs"
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
                          <AlertTriangle className="w-3 h-3" /> No GPS
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Interactive Leaflet Map with Canvas & Cluster Engine */}
        <div className="lg:col-span-8 relative h-full">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Top Right Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
            {/* Map Style Controls */}
            <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl">
              <button
                onClick={() => setMapStyle('dark')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mapStyle === 'dark' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Satelit</span>
              </button>
              <button
                onClick={() => setMapStyle('street')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mapStyle === 'street' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Street</span>
              </button>
            </div>
          </div>

          {/* Bottom Left Legend & Quick Status Filter Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-3 rounded-2xl border border-slate-700 shadow-2xl text-white text-[11px] space-y-2">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
              <span className="font-extrabold text-slate-300 text-[10px] uppercase tracking-wider">
                Status Beban Trafo
              </span>
              <span className="text-[9px] font-bold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                Canvas 60fps
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {[
                { label: 'Under 0%', color: '#64748b' },
                { label: '0% - 20%', color: '#38bdf8' },
                { label: '20% - 40%', color: '#22d3ee' },
                { label: '40% - 60%', color: '#10b981' },
                { label: '60% - 80%', color: '#14b8a6' },
                { label: '80% - 100%', color: '#f59e0b' },
                { label: '> 100%', color: '#f43f5e' },
                { label: 'Belum Ukur', color: '#64748b' },
              ].map((item) => {
                const isActive = selectedStatusFilter === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedStatusFilter(isActive ? 'ALL' : item.label)}
                    className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer text-left ${
                      isActive ? 'bg-blue-900/50 text-blue-300 font-black' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Gardu Drawer */}
          {activeGardu && (
            <div className="absolute top-4 left-4 z-30 bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {activeGardu.noGarduBaru || activeGardu.noGarduLama}
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

              <div className="text-[10px] text-slate-300 space-y-1">
                <div><b>Alamat:</b> {activeGardu.alamatGardu || '-'}</div>
                <div><b>No. Lama:</b> {activeGardu.noGarduLama || '-'}</div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span className="truncate max-w-[200px]">Koordinat: {activeGardu.latt}, {activeGardu.long}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeGardu.latt},${activeGardu.long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline font-bold shrink-0"
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
