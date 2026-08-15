import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  HardHat,
  RefreshCw,
  Info
} from 'lucide-react';
import { KonstruksiGisItem, Penyulang } from '../../types';
import { readGisFile, convertToKonstruksiItems, RawGisFeature } from '../../utils/gisFileParser';

interface ImportKonstruksiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: KonstruksiGisItem[]) => void;
  penyulangList?: Penyulang[];
}

export const ImportKonstruksiModal: React.FC<ImportKonstruksiModalProps> = ({
  isOpen,
  onClose,
  onImport,
  penyulangList = []
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedItems, setParsedItems] = useState<KonstruksiGisItem[]>([]);
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
        setErrorMsg('Tidak ditemukan data koordinat proyek geografis (lat, lng) valid dalam file ini.');
        setParsedItems([]);
      } else {
        const converted = convertToKonstruksiItems(rawFeatures, defaultPenyulang);
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
    const csvContent = `namaproyek,nomorspk,penyulang,section,lokasi,lat,lng,kategori,status,progres,anggaran,vendor,pengawas,targetselesai,volume,keterangan
Rekonstruksi Tiang Miring Paso,SPK/KONST/2026/081,PASSO,SEC-PASSO-02,Jl. Wolter Monginsidi Paso,-3.626100,128.238400,Rekonstruksi Tiang Miring / Keropos,Sedang Dikerjakan,60,45000000,PT Maluku Daya Mandiri,Samsul Bahri,2026-03-31,4 Tiang Beton 12m/350daN,Penggantian 4 tiang keropos
Pemasangan LBS Motorized Waiheru,SPK/KONST/2026/092,WAIHERU,SEC-WAIHERU-01,Desa Waiheru Dalam,-3.618200,128.230100,Pemasangan LBS Motorized / Recloser,Sedang Dikerjakan,40,75000000,PT Mandiri Listrik Ambon,Hendrikus Latumahina,2026-04-15,1 Unit LBS Motorized SF6,Otomasi SCADA Feeder
Pembangunan GTT Sisipan Suli,SPK/KONST/2026/104,SULI,SEC-SULI-03,Dusun Batugong Suli,-3.605400,128.281200,Pembangunan GTT Sisipan,Rencana,10,95000000,PT Citra Daya Prima,Samsul Bahri,2026-05-30,1 Unit Trafo 100kVA 20kV,Mengatasi overload trafo eksisting`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Template_Import_Peta_Konstruksi_20kV.csv';
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
            coordinates: [128.2384, -3.6261]
          },
          properties: {
            namaproyek: "Rekonstruksi Tiang Miring Paso",
            nomorspk: "SPK/KONST/2026/081",
            penyulang: "PASSO",
            lokasi: "Jl. Wolter Monginsidi Paso",
            kategori: "Rekonstruksi Tiang Miring / Keropos",
            status: "Sedang Dikerjakan",
            progres: 60,
            anggaran: 45000000,
            vendor: "PT Maluku Daya Mandiri"
          }
        },
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [128.2301, -3.6182],
              [128.2325, -3.6174],
              [128.2351, -3.6162]
            ]
          },
          properties: {
            namaproyek: "Uprating Konduktor A3C 150mm Waiheru",
            nomorspk: "SPK/KONST/2026/095",
            penyulang: "WAIHERU",
            lokasi: "Jalur Utama Waiheru",
            kategori: "Uprating / Penggantian Konduktor",
            status: "Sedang Dikerjakan",
            progres: 75,
            anggaran: 120000000,
            vendor: "PT Sinar Ambon Elektrika"
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleGeoJson, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Template_Import_Konstruksi_20kV.geojson';
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
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Import File Peta Konstruksi 20kV GIS
              </h2>
              <p className="text-xs text-slate-400">
                Unggah data proyek fisik / konstruksi dari file KML, KMZ, GeoJSON, atau Excel/CSV
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
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded border border-amber-500/30">.KML / .KMZ</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded border border-blue-500/30">.GeoJSON</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded border border-emerald-500/30">.CSV / Excel</span>
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
                ? 'border-amber-500 bg-amber-500/10 scale-[0.99]'
                : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/40 hover:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".kml,.kmz,.geojson,.json,.csv,.txt,.xml"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full mb-3 ring-8 ring-amber-500/5">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              {fileName ? fileName : 'Klik atau Tarik & Lepas File ke Sini'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Sistem akan mengekstrak koordinat, nama proyek konstruksi, nomor SPK, status progres (%), dan kategori pekerjaan secara otomatis.
            </p>
            {isProcessing && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Membaca dan memetakan struktur file konstruksi...
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
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hasil Ekstraksi ({parsedItems.length} Proyek Konstruksi Valid)
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
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
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
                      <th className="py-2 px-3">Nama Proyek</th>
                      <th className="py-2 px-3">No SPK</th>
                      <th className="py-2 px-3">Penyulang</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3">Progres</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-900/60 text-slate-300">
                    {parsedItems.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-1.5 px-3 font-bold text-white">{item.namaProyek}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-400 text-[11px]">{item.nomorSpk || '-'}</td>
                        <td className="py-1.5 px-3 font-bold text-amber-400">{item.penyulang}</td>
                        <td className="py-1.5 px-3 truncate max-w-[150px] text-slate-300">{item.kategoriKonstruksi}</td>
                        <td className="py-1.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300">
                            {item.progresPersen}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedItems.length > 10 && (
                  <div className="py-2 px-3 bg-slate-950/80 text-center text-[11px] text-slate-400 font-semibold border-t border-slate-800">
                    ... dan {parsedItems.length - 10} proyek lainnya
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
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            Impor {parsedItems.length > 0 ? `${parsedItems.length} Proyek Konstruksi` : 'Data'} ke Peta
          </button>
        </div>

      </div>
    </div>
  );
};
