import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  Download,
  Activity,
  Info,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PengukuranGardu, MasterGardu, Penyulang } from '../../types';

interface ImportPengukuranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: PengukuranGardu[]) => void;
  masterGarduList?: MasterGardu[];
  penyulangList?: Penyulang[];
}

export const ImportPengukuranModal: React.FC<ImportPengukuranModalProps> = ({
  isOpen,
  onClose,
  onImport,
  masterGarduList = [],
  penyulangList = []
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<PengukuranGardu[]>([]);
  const [validationReport, setValidationReport] = useState<{
    total: number;
    validCount: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate and download sample Excel template for Pengukuran Gardu
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No. Gardu': 'BG-01',
        'Tanggal Ukur (YYYY-MM-DD)': '2026-08-20',
        'Unit PLN': 'ULP Baguala',
        'Penyulang': 'PASSO',
        'Daya (kVA)': 160,
        'Petugas Ukur': 'Tim Har-Dist ULP Baguala',
        'Alamat Gardu': 'Jl. Syaranualo Passo',
        'Arus Total R (A)': 185,
        'Arus Total S (A)': 190,
        'Arus Total T (A)': 180,
        'Arus Total N (A)': 15,
        'Tegangan VR-N (V)': 220,
        'Tegangan VS-N (V)': 222,
        'Tegangan VT-N (V)': 219,
        'Tegangan VR-S (V)': 380,
        'Tegangan VS-T (V)': 382,
        'Tegangan VR-T (V)': 381,
        'Cos Phi / TPF R': 0.92,
        'Cos Phi / TPF S': 0.92,
        'Cos Phi / TPF T': 0.92,
        'Jurusan 1 - Arus R (A)': 95,
        'Jurusan 1 - Arus S (A)': 98,
        'Jurusan 1 - Arus T (A)': 92,
        'Jurusan 1 - Arus N (A)': 8,
        'Jurusan 2 - Arus R (A)': 90,
        'Jurusan 2 - Arus S (A)': 92,
        'Jurusan 2 - Arus T (A)': 88,
        'Jurusan 2 - Arus N (A)': 7
      },
      {
        'No. Gardu': 'BG-02',
        'Tanggal Ukur (YYYY-MM-DD)': '2026-08-20',
        'Unit PLN': 'ULP Baguala',
        'Penyulang': 'PASSO',
        'Daya (kVA)': 100,
        'Petugas Ukur': 'Tim Yantek Baguala',
        'Alamat Gardu': 'Jl. Raya Laha Passo',
        'Arus Total R (A)': 110,
        'Arus Total S (A)': 115,
        'Arus Total T (A)': 108,
        'Arus Total N (A)': 12,
        'Tegangan VR-N (V)': 221,
        'Tegangan VS-N (V)': 220,
        'Tegangan VT-N (V)': 218,
        'Tegangan VR-S (V)': 380,
        'Tegangan VS-T (V)': 381,
        'Tegangan VR-T (V)': 379,
        'Cos Phi / TPF R': 0.91,
        'Cos Phi / TPF S': 0.91,
        'Cos Phi / TPF T': 0.91,
        'Jurusan 1 - Arus R (A)': 110,
        'Jurusan 1 - Arus S (A)': 115,
        'Jurusan 1 - Arus T (A)': 108,
        'Jurusan 1 - Arus N (A)': 12,
        'Jurusan 2 - Arus R (A)': 0,
        'Jurusan 2 - Arus S (A)': 0,
        'Jurusan 2 - Arus T (A)': 0,
        'Jurusan 2 - Arus N (A)': 0
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Pengukuran_Beban');
    XLSX.writeFile(wb, 'Template_Import_Pengukuran_Beban_Gardu.xlsx');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    setParsedRows([]);
    setValidationReport(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          setValidationReport({
            total: 0,
            validCount: 0,
            errors: ['File Excel kosong atau tidak memiliki data baris yang valid.']
          });
          setIsProcessing(false);
          return;
        }

        const items: PengukuranGardu[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, idx) => {
          const findVal = (...keys: string[]) => {
            for (const k of keys) {
              const matchedKey = Object.keys(row).find(
                (rk) => rk.trim().toLowerCase() === k.trim().toLowerCase()
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return row[matchedKey];
              }
            }
            return '';
          };

          const parseNum = (val: any, fallback = 0): number => {
            if (typeof val === 'number') return isNaN(val) ? fallback : val;
            if (!val) return fallback;
            const cleaned = String(val).replace(/,/g, '.').replace(/[^0-9.-]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? fallback : parsed;
          };

          const noGarduRaw = findVal(
            'No. Gardu', 'No Gardu', 'KODE GARDU', 'NO_GARDU', 'Gardu', 'No. Gardu Baru', 'GARDU', 'Nama Gardu'
          );
          const noGardu = String(noGarduRaw || `GARDU-${idx + 1}`).trim();

          // Auto-match master gardu info if available
          const matchedMaster = masterGarduList.find(
            (mg) =>
              (mg.noGarduBaru && mg.noGarduBaru.trim().toLowerCase() === noGardu.toLowerCase()) ||
              (mg.noGarduLama && mg.noGarduLama.trim().toLowerCase() === noGardu.toLowerCase()) ||
              (mg.ssotNumber && mg.ssotNumber !== '-' && mg.ssotNumber.trim().toLowerCase() === noGardu.toLowerCase())
          );

          let tglVal = findVal('Tanggal Ukur (YYYY-MM-DD)', 'Tanggal Ukur', 'Tanggal', 'TGL_UKUR', 'Tgl Ukur', 'Tgl', 'DATE');
          let tglUkur = new Date().toISOString().split('T')[0];
          if (tglVal) {
            if (tglVal instanceof Date) {
              tglUkur = tglVal.toISOString().split('T')[0];
            } else {
              const str = String(tglVal).trim();
              if (str.length >= 10 && str.includes('-')) {
                tglUkur = str.substring(0, 10);
              }
            }
          }

          const unit = String(findVal('Unit PLN', 'Unit', 'ULP', 'Unit ULP') || matchedMaster?.unit || 'ULP Baguala');
          const penyulang = String(findVal('Penyulang', 'Nama Penyulang', 'FEEDER') || matchedMaster?.penyulang || 'PASSO');
          const dayaKva = parseNum(findVal('Daya (kVA)', 'Daya', 'KVA', 'Daya Trafo'), matchedMaster?.daya || 160);
          const petugas = String(findVal('Petugas Ukur', 'Petugas', 'Tim Ukur', 'Tim', 'PETUGAS') || 'Tim Har-Dist ULP');
          const alamat = String(findVal('Alamat Gardu', 'Alamat', 'Lokasi', 'LOKASI GARDU') || matchedMaster?.alamatGardu || 'Jl. Raya Baguala, Ambon');

          // Arus Total
          const iRTotal = parseNum(findVal('Arus Total R (A)', 'Arus R Total', 'I_R', 'IR', 'Arus R', 'R Total'), 100);
          const iSTotal = parseNum(findVal('Arus Total S (A)', 'Arus S Total', 'I_S', 'IS', 'Arus S', 'S Total'), 105);
          const iTTotal = parseNum(findVal('Arus Total T (A)', 'Arus T Total', 'I_T', 'IT', 'Arus T', 'T Total'), 98);
          const iNTotal = parseNum(findVal('Arus Total N (A)', 'Arus N Total', 'I_N', 'IN', 'Arus N', 'N Total'), 10);

          // Tegangan
          const vRN = parseNum(findVal('Tegangan VR-N (V)', 'V_RN', 'VRN', 'VR-N', 'V R-N'), 220);
          const vSN = parseNum(findVal('Tegangan VS-N (V)', 'V_SN', 'VSN', 'VS-N', 'V S-N'), 220);
          const vTN = parseNum(findVal('Tegangan VT-N (V)', 'V_TN', 'VTN', 'VT-N', 'V T-N'), 220);
          const vRS = parseNum(findVal('Tegangan VR-S (V)', 'V_RS', 'VRS', 'VR-S'), 380);
          const vST = parseNum(findVal('Tegangan VS-T (V)', 'V_ST', 'VST', 'VS-T'), 380);
          const vRT = parseNum(findVal('Tegangan VR-T (V)', 'V_RT', 'VRT', 'VR-T'), 380);

          // Power factor / Cosphi
          const tpfR = parseNum(findVal('Cos Phi / TPF R', 'Cos Phi R', 'TPF R', 'Cosphi'), 0.92);
          const tpfS = parseNum(findVal('Cos Phi / TPF S', 'Cos Phi S', 'TPF S'), 0.92);
          const tpfT = parseNum(findVal('Cos Phi / TPF T', 'Cos Phi T', 'TPF T'), 0.92);

          // Jurusan 1
          const j1_iR = parseNum(findVal('Jurusan 1 - Arus R (A)', 'J1_IR', 'J1 IR'), iRTotal);
          const j1_iS = parseNum(findVal('Jurusan 1 - Arus S (A)', 'J1_IS', 'J1 IS'), iSTotal);
          const j1_iT = parseNum(findVal('Jurusan 1 - Arus T (A)', 'J1_IT', 'J1 IT'), iTTotal);
          const j1_iN = parseNum(findVal('Jurusan 1 - Arus N (A)', 'J1_IN', 'J1 IN'), iNTotal);

          // Jurusan 2
          const j2_iR = parseNum(findVal('Jurusan 2 - Arus R (A)', 'J2_IR', 'J2 IR'), 0);
          const j2_iS = parseNum(findVal('Jurusan 2 - Arus S (A)', 'J2_IS', 'J2 IS'), 0);
          const j2_iT = parseNum(findVal('Jurusan 2 - Arus T (A)', 'J2_IT', 'J2 IT'), 0);
          const j2_iN = parseNum(findVal('Jurusan 2 - Arus N (A)', 'J2_IN', 'J2 IN'), 0);

          const newPengukuran: PengukuranGardu = {
            id: `UKUR_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
            garduId: matchedMaster?.id || '',
            noGardu,
            unit,
            penyulang,
            dayaKva,
            alamat,
            tanggalUkur,
            petugas,
            iRTotal,
            iSTotal,
            iTTotal,
            iNTotal,
            vRN,
            vSN,
            vTN,
            vRS,
            vST,
            vRT,
            thdR: 2.5,
            thdS: 2.5,
            thdT: 2.5,
            iPeakR: Math.round(iRTotal * 1.15),
            iPeakS: Math.round(iSTotal * 1.15),
            iPeakT: Math.round(iTTotal * 1.15),
            tpfR,
            tpfS,
            tpfT,
            jurusan1: {
              nama: 'JURUSAN 1',
              iRTotal: j1_iR,
              iSTotal: j1_iS,
              iTTotal: j1_iT,
              iNTotal: j1_iN,
              vRN,
              vSN,
              vTN,
              vRS,
              vST,
              vRT,
              iPeakR: Math.round(j1_iR * 1.15),
              iPeakS: Math.round(j1_iS * 1.15),
              iPeakT: Math.round(j1_iT * 1.15),
              tpfR,
              tpfS,
              tpfT,
              titikUkur: 'Pangkal Jurusan 1'
            },
            jurusan2: {
              nama: 'JURUSAN 2',
              iRTotal: j2_iR,
              iSTotal: j2_iS,
              iTTotal: j2_iT,
              iNTotal: j2_iN,
              vRN,
              vSN,
              vTN,
              vRS,
              vST,
              vRT,
              iPeakR: Math.round(j2_iR * 1.15),
              iPeakS: Math.round(j2_iS * 1.15),
              iPeakT: Math.round(j2_iT * 1.15),
              tpfR,
              tpfS,
              tpfT,
              titikUkur: 'Pangkal Jurusan 2'
            },
            jurusan3: {
              nama: 'JURUSAN 3',
              iRTotal: 0,
              iSTotal: 0,
              iTTotal: 0,
              iNTotal: 0,
              vRN,
              vSN,
              vTN,
              vRS,
              vST,
              vRT,
              iPeakR: 0,
              iPeakS: 0,
              iPeakT: 0,
              tpfR: 0.92,
              tpfS: 0.92,
              tpfT: 0.92,
              titikUkur: 'Pangkal Jurusan 3'
            },
            jurusan4: {
              nama: 'JURUSAN 4',
              iRTotal: 0,
              iSTotal: 0,
              iTTotal: 0,
              iNTotal: 0,
              vRN,
              vSN,
              vTN,
              vRS,
              vST,
              vRT,
              iPeakR: 0,
              iPeakS: 0,
              iPeakT: 0,
              tpfR: 0.92,
              tpfS: 0.92,
              tpfT: 0.92,
              titikUkur: 'Pangkal Jurusan 4'
            },
            createdAt: new Date().toISOString()
          };

          items.push(newPengukuran);
        });

        setParsedRows(items);
        setValidationReport({
          total: rawJson.length,
          validCount: items.length,
          errors
        });
      } catch (err: any) {
        setValidationReport({
          total: 0,
          validCount: 0,
          errors: [`Gagal memproses file Excel: ${err.message || 'Format file tidak didukung.'}`]
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleApplyImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Import Data Pengukuran Beban Gardu</h2>
              <p className="text-xs text-slate-400">
                Unggah file Excel (.xlsx / .xls) untuk mengimpor histori pengukuran arus &amp; tegangan trafo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Download Template Action Bar */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="text-xs text-blue-900">
                <span className="font-bold">Gunakan Format Kolom Standar PLN:</span> No. Gardu, Tanggal Ukur, Penyulang, Daya kVA, Arus Total R/S/T/N, Tegangan VR-N/VS-N/VT-N.
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template Excel</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : fileName
                ? 'border-emerald-300 bg-emerald-50/20'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                <p className="text-xs font-bold text-slate-700">Membaca &amp; Memvalidasi Baris Excel...</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">{fileName}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  ✓ File berhasil dibaca. Klik di sini untuk mengganti file.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Tarik &amp; Lepaskan File Excel Pengukuran Gardu di Sini
                </p>
                <p className="text-[11px] text-slate-500 mt-1">atau klik untuk memilih file dari komputer (.xlsx, .xls, .csv)</p>
              </div>
            )}
          </div>

          {/* Validation & Preview Summary */}
          {validationReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Total Baris Terbaca:</span>
                  <span className="text-sm font-black text-slate-900">{validationReport.total} Baris</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-800">Siap Diimpor / Upload:</span>
                  <span className="text-sm font-black text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {validationReport.validCount} Pengukuran
                  </span>
                </div>
              </div>

              {/* Error list if any */}
              {validationReport.errors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Catatan Validasi File:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {validationReport.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>Pratinjau Data Pengukuran Gardu ({parsedRows.length})</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">Menampilkan maks 10 data pertama</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[9px] sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">No. Gardu</th>
                          <th className="py-2 px-3">Tgl Ukur &amp; Petugas</th>
                          <th className="py-2 px-3">Penyulang &amp; Daya</th>
                          <th className="py-2 px-3 text-center">Arus Total R/S/T/N</th>
                          <th className="py-2 px-3 text-center">Tegangan V R-N/S-N/T-N</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {parsedRows.slice(0, 10).map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-blue-900">
                              <div>{p.noGardu}</div>
                              <div className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">{p.alamat}</div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-800">{p.tanggalUkur}</div>
                              <div className="text-[10px] text-slate-500">{p.petugas}</div>
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-800">{p.penyulang}</span>
                              <div className="text-[10px] font-bold text-blue-700">{p.dayaKva} kVA</div>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-700">
                              <span className="text-blue-700">{p.iRTotal}</span> / {' '}
                              <span className="text-amber-700">{p.iSTotal}</span> / {' '}
                              <span className="text-rose-700">{p.iTTotal}</span> | {' '}
                              <span className="text-slate-500">N:{p.iNTotal}A</span>
                            </td>
                            <td className="py-2 px-3 text-center font-semibold text-slate-600">
                              {p.vRN}V / {p.vSN}V / {p.vTN}V
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleApplyImport}
            disabled={parsedRows.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              parsedRows.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Upload &amp; Simpan ({parsedRows.length} Data Pengukuran)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
