import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Trees,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { PohonGisItem, Penyulang } from '../../types';
import { readGisFile, convertToPohonItems, RawGisFeature } from '../../utils/gisFileParser';

interface ImportPohonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: PohonGisItem[]) => void;
  penyulangList?: Penyulang[];
}

export const ImportPohonModal: React.FC<ImportPohonModalProps> = ({
  isOpen,
  onClose,
  onImport,
  penyulangList = []
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedItems, setParsedItems] = useState<PohonGisItem[]>([]);
  const [defaultPenyulang, setDefaultPenyulang] = useState('PASSO');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const rawFeatures: RawGisFeature[] = await readGisFile(file);
      if (rawFeatures.length === 0) {
        setErrorMsg('Tidak ditemukan data koordinat geografis (lat, lng) valid dalam file ini.');
        setParsedItems([]);
      } else {
        const converted = convertToPohonItems(rawFeatures, defaultPenyulang);
        setParsedItems(converted);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Gagal memproses file: ${err.message || 'Format tidak didukung'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent = `penyulang,section,notiang,lokasi,lat,lng,jenispohon,jumlahpohon,jarak,tingkatbahaya,statuseksekusi,pelaksana,keterangan
PASSO,SEC-PASSO-01,TG-14,Jl. Wolter Monginsidi Paso,-3.628100,128.242300,Pohon Trembesi Rimbun,2,< 1 meter,Kritis (Bahaya Padam),Perlu Tebas,Tim ROW Baguala,Dahan mendekati jumper 20kV
WAIHERU,SEC-WAIHERU-02,TG-32,Desa Waiheru Dalam,-3.619500,128.228900,Pohon Kelapa Tinggi,1,Menempel Kawat,Potensi Roboh,Perlu Tebang,Tim ROW Baguala,Pohon condong 20 derajat ke jaringan
HUTUMURI,SEC-HUTUMURI-01,TG-08,Jalur Hative Besar,-3.641200,128.256700,Ranting Bambu Liar,4,1 - 2.5 meter,Rawan Sentuh,Perlu Izin Warga,Tim ROW Baguala,Perlu koordinasi kepala dusun`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Template_Import_Peta_Pohon_ROW.csv';
    link.click();
  };

  const handleDownloadGeoJsonTemplate = () => {
    const sampleGeoJson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [128.2423, -3.6281]
          },
          properties: {
            name: "Pohon Trembesi Rimbun",
            penyulang: "PASSO",
            section: "SEC-PASSO-01",
            notiang: "TG-14",
            lokasi: "Jl. Wolter Monginsidi Paso",
            tingkatbahaya: "Kritis (Bahaya Padam)",
            jarak: "< 1 meter",
            statuseksekusi: "Perlu Tebas",
            jumlah: 2
          }
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [128.2289, -3.6195]
          },
          properties: {
            name: "Pohon Kelapa Miring",
            penyulang: "WAIHERU",
            section: "SEC-WAIHERU-02",
            notiang: "TG-32",
            lokasi: "Desa Waiheru",
            tingkatbahaya: "Potensi Roboh",
            jarak: "Menempel Kawat",
            statuseksekusi: "Perlu Tebang",
            jumlah: 1
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleGeoJson, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Template_Import_Pohon_ROW.geojson';
    link.click();
  };

  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;
    onImport(parsedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Import File Peta Pohon & ROW GIS
              </h2>
              <p className="text-xs text-slate-400">
                Unggah data titik pohon/vegetasi rawan dari file KML, KMZ, GeoJSON, atau Excel/CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Format Badges & Template Downloads */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-semibold">Format didukung:</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded border border-emerald-500/30">.KML / .KMZ</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded border border-blue-500/30">.GeoJSON</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded border border-amber-500/30">.CSV / Excel</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Template CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadGeoJsonTemplate}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                Template GeoJSON
              </button>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]'
                : 'border-slate-700 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".kml,.kmz,.geojson,.json,.csv,.txt,.xml"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full mb-3 ring-8 ring-emerald-500/5">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              {fileName ? fileName : 'Klik atau Tarik & Lepas File ke Sini'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Sistem akan membaca koordinat latitude, longitude, nama jenis pohon, lokasi, dan status bahaya secara otomatis.
            </p>
            {isProcessing && (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Membaca dan memetakan struktur file...
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gagal Membaca File</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedItems.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hasil Ekstraksi ({parsedItems.length} Titik Valid)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Penyulang default:</span>
                  <select
                    value={defaultPenyulang}
                    onChange={(e) => {
                      setDefaultPenyulang(e.target.value);
                      setParsedItems((prev) =>
                        prev.map((item) => ({ ...item, penyulang: e.target.value }))
                      );
                    }}
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    {penyulangList.length > 0 ? (
                      penyulangList.map((p) => (
                        <option key={p.id} value={p.nama}>{p.nama}</option>
                      ))
                    ) : (
                      <>
                        <option value="PASSO">PASSO</option>
                        <option value="WAIHERU">WAIHERU</option>
                        <option value="HUTUMURI">HUTUMURI</option>
                        <option value="LATERI">LATERI</option>
                        <option value="TIAL">TIAL</option>
                        <option value="SULI">SULI</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Penyulang</th>
                      <th className="py-2 px-3">Jenis Pohon</th>
                      <th className="py-2 px-3">Lokasi</th>
                      <th className="py-2 px-3">Koordinat (Lat, Lng)</th>
                      <th className="py-2 px-3">Bahaya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-900/60 text-slate-300">
                    {parsedItems.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-1.5 px-3 font-bold text-emerald-400">{item.penyulang}</td>
                        <td className="py-1.5 px-3 font-medium">{item.jenisPohon}</td>
                        <td className="py-1.5 px-3 truncate max-w-[150px]">{item.lokasi}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-400 text-[11px]">
                          {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                        </td>
                        <td className="py-1.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.tingkatBahaya.includes('Kritis')
                              ? 'bg-red-500/20 text-red-400'
                              : item.tingkatBahaya.includes('Roboh')
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {item.tingkatBahaya}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedItems.length > 10 && (
                  <div className="py-2 px-3 bg-slate-950/80 text-center text-[11px] text-slate-400 font-semibold border-t border-slate-800">
                    ... dan {parsedItems.length - 10} titik lainnya
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          
          <button
            type="button"
            disabled={parsedItems.length === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              parsedItems.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            Impor {parsedItems.length > 0 ? `${parsedItems.length} Titik Pohon` : 'Data'} ke Peta
          </button>
        </div>

      </div>
    </div>
  );
};
