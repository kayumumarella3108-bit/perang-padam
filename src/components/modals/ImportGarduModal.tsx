import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  Download,
  Building2,
  Info,
  MapPin,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MasterGardu, Penyulang } from '../../types';

interface ImportGarduModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: MasterGardu[]) => void;
  penyulangList?: Penyulang[];
}

export const ImportGarduModal: React.FC<ImportGarduModalProps> = ({
  isOpen,
  onClose,
  onImport,
  penyulangList = []
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<MasterGardu[]>([]);
  const [validationReport, setValidationReport] = useState<{
    total: number;
    validCoordsCount: number;
    missingCoordsCount: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate and download a sample Excel template for Master Gardu
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Unit PLN': 'ULP Baguala',
        'No. Gardu Baru': 'BG-01',
        'No. Gardu Lama': 'B-12',
        'Alamat Gardu': 'Jl. Syaranualo Passo, Passo',
        'Latitude (LATT)': -3.64251,
        'Longitude (LONG)': 128.24180,
        'SSOT Number': 'SSOT-BG01',
        'Penyulang': 'PASSO',
        'Daya (kVA)': 160,
        'Jumlah Fasa': '3 Fasa',
        'Tipe Gardu': 'GTT Trafo'
      },
      {
        'Unit PLN': 'ULP Baguala',
        'No. Gardu Baru': 'BG-02',
        'No. Gardu Lama': 'B-15',
        'Alamat Gardu': 'Jl. Laperissa Passo, Ambon',
        'Latitude (LATT)': -3.64912,
        'Longitude (LONG)': 128.24520,
        'SSOT Number': 'SSOT-BG02',
        'Penyulang': 'PASSO',
        'Daya (kVA)': 250,
        'Jumlah Fasa': '3 Fasa',
        'Tipe Gardu': 'Gardu Beton'
      },
      {
        'Unit PLN': 'ULP Baguala',
        'No. Gardu Baru': 'BG-03',
        'No. Gardu Lama': 'B-18',
        'Alamat Gardu': 'Jl. Transit Lateri, Lateri',
        'Latitude (LATT)': -3.63890,
        'Longitude (LONG)': 128.22150,
        'SSOT Number': 'SSOT-BG03',
        'Penyulang': 'LATERI 1',
        'Daya (kVA)': 100,
        'Jumlah Fasa': '3 Fasa',
        'Tipe Gardu': 'Gardu Portal'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Unit
      { wch: 16 }, // No Baru
      { wch: 16 }, // No Lama
      { wch: 32 }, // Alamat
      { wch: 18 }, // Lat
      { wch: 18 }, // Long
      { wch: 16 }, // SSOT
      { wch: 16 }, // Penyulang
      { wch: 12 }, // Daya
      { wch: 14 }, // Fasa
      { wch: 16 }  // Tipe
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Gardu');

    XLSX.writeFile(workbook, 'Template_Master_Gardu_PLN.xlsx');
  };

  // Helper to match column headers intelligently without cross-matching
  const findHeaderValue = (
    row: Record<string, any>,
    possibleKeys: string[],
    excludeSubstrings: string[] = []
  ): any => {
    const keys = Object.keys(row);

    // Phase 1: Exact normalized match
    for (const targetKey of possibleKeys) {
      const targetNorm = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const key of keys) {
        const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normKey === targetNorm) {
          return row[key];
        }
      }
    }

    // Phase 2: Substring match with exclusion check (e.g. skip 'lama' when looking for 'baru')
    for (const targetKey of possibleKeys) {
      const targetNorm = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const key of keys) {
        const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

        const isExcluded = excludeSubstrings.some((ex) =>
          normKey.includes(ex.toLowerCase().replace(/[^a-z0-9]/g, ''))
        );
        if (isExcluded) continue;

        if (normKey.includes(targetNorm)) {
          return row[key];
        }
      }
    }

    // Phase 3: Fallback substring match if no clean match was found
    for (const targetKey of possibleKeys) {
      const targetNorm = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const key of keys) {
        const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normKey.includes(targetNorm)) {
          return row[key];
        }
      }
    }

    return undefined;
  };

  // Parse Excel or CSV file
  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    setValidationReport(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (rawJson.length === 0) {
        throw new Error('File Excel tidak berisi baris data.');
      }

      const items: MasterGardu[] = [];
      let validCoordsCount = 0;
      let missingCoordsCount = 0;
      const errors: string[] = [];

      rawJson.forEach((row, idx) => {
        const rowNum = idx + 2;

        const unit = String(findHeaderValue(row, ['unit', 'unit pln', 'ulp']) || 'ULP Baguala').trim();
        
        let rawNoGarduBaru = String(
          findHeaderValue(
            row,
            ['no gardu baru', 'nogardubaru', 'gardu baru', 'kode gardu baru', 'id gardu baru', 'no gardu', 'nogardu', 'nama gardu', 'kode gardu', 'id gardu'],
            ['lama']
          ) || ''
        ).trim();

        let rawNoGarduLama = String(
          findHeaderValue(
            row,
            ['no gardu lama', 'nogardulama', 'gardu lama', 'kode gardu lama', 'id gardu lama', 'kode lama', 'no lama', 'lama'],
            ['baru']
          ) || ''
        ).trim();

        // Handle composite formats like "BGLWHR2016 (Lama: WHR-016)" or "BGLWHR2016 / WHR-016"
        if (!rawNoGarduLama && rawNoGarduBaru) {
          if (rawNoGarduBaru.toLowerCase().includes('lama:')) {
            const parts = rawNoGarduBaru.split(/lama:/i);
            rawNoGarduBaru = parts[0].replace(/[\(\)\[\]]/g, '').trim();
            rawNoGarduLama = parts[1].replace(/[\(\)\[\]]/g, '').trim();
          } else if (rawNoGarduBaru.includes('/')) {
            const parts = rawNoGarduBaru.split('/');
            if (parts.length >= 2) {
              rawNoGarduBaru = parts[0].trim();
              rawNoGarduLama = parts[1].trim();
            }
          }
        }

        const noGarduBaru = rawNoGarduBaru || rawNoGarduLama;
        const noGarduLama = rawNoGarduLama || rawNoGarduBaru;

        const alamatGardu = String(
          findHeaderValue(row, ['alamat gardu', 'alamat', 'lokasi', 'lokasi gardu']) || ''
        ).trim();

        const latVal = findHeaderValue(row, ['latt', 'latitude', 'lat', 'y', 'koordinat y']);
        const longVal = findHeaderValue(row, ['long', 'longitude', 'lng', 'x', 'koordinat x']);

        const latNum = parseFloat(String(latVal).replace(',', '.'));
        const longNum = parseFloat(String(longVal).replace(',', '.'));

        const ssotNumber = String(
          findHeaderValue(row, ['ssot number', 'ssot', 'ssotnumber', 'id ssot']) || `SSOT-${noGarduBaru || idx}`
        ).trim();

        const defaultPenyulang = penyulangList[0]?.namaPenyulang || 'PASSO';
        const penyulang = String(
          findHeaderValue(row, ['penyulang', 'feeder', 'penyulang id']) || defaultPenyulang
        ).trim().toUpperCase();

        const dayaRaw = findHeaderValue(row, ['daya (kva)', 'daya', 'daya kva', 'kapasitas']);
        const daya = parseInt(String(dayaRaw), 10) || 160;

        const jumlahFasa = String(
          findHeaderValue(row, ['jumlah fasa', 'fasa', 'phase']) || '3 Fasa'
        ).trim();

        const tipeGardu = String(
          findHeaderValue(row, ['tipe gardu', 'tipe', 'jenis gardu', 'jenis']) || 'GTT Trafo'
        ).trim();

        if (!noGarduBaru && !noGarduLama) {
          errors.push(`Baris ${rowNum}: Nomor gardu kosong.`);
          return;
        }

        const hasValidCoords = !isNaN(latNum) && !isNaN(longNum) && latNum !== 0 && longNum !== 0;
        if (hasValidCoords) {
          validCoordsCount++;
        } else {
          missingCoordsCount++;
        }

        const newGardu: MasterGardu = {
          id: `gardu_import_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          unit: unit || 'ULP Baguala',
          noGarduBaru: noGarduBaru || `G-${idx + 1}`,
          noGarduLama: noGarduLama || noGarduBaru || `G-${idx + 1}`,
          alamatGardu: alamatGardu || 'Jl. Raya Baguala, Ambon',
          latt: hasValidCoords ? latNum : -3.659,
          long: hasValidCoords ? longNum : 128.192,
          ssotNumber: ssotNumber || `SSOT-${idx + 1}`,
          penyulang: penyulang || defaultPenyulang,
          daya: daya,
          jumlahFasa: jumlahFasa.includes('1') ? '1 Fasa' : '3 Fasa',
          tipeGardu: tipeGardu
        };

        items.push(newGardu);
      });

      setParsedRows(items);
      setValidationReport({
        total: items.length,
        validCoordsCount,
        missingCoordsCount,
        errors
      });
    } catch (err: any) {
      console.error('Failed to parse Excel file:', err);
      setValidationReport({
        total: 0,
        validCoordsCount: 0,
        missingCoordsCount: 0,
        errors: [err.message || 'Gagal membaca file Excel. Pastikan format file .xlsx atau .csv valid.']
      });
    } finally {
      setIsProcessing(false);
    }
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Import Master Data Gardu dari Excel / CSV</h2>
              <p className="text-xs font-semibold text-slate-500">Konversi data file .xlsx/.xls otomatis menjadi data Master Gardu PLN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Template Download Option */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-blue-950">Belum punya format Excel Master Gardu?</h4>
                <p className="text-[11px] font-medium text-blue-700">Unduh template standar Excel yang sudah dikonfigurasi dengan kolom PLN</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/40 scale-[0.99]'
                : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
              {isProcessing ? (
                <RefreshCw className="w-7 h-7 animate-spin text-emerald-600" />
              ) : (
                <Upload className="w-7 h-7 text-emerald-600" />
              )}
            </div>

            <h3 className="text-sm font-extrabold text-slate-800">
              {fileName ? fileName : 'Klik atau Tarik File Excel / CSV di sini'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Mendukung format .xlsx, .xls, dan .csv (Maks. 500+ baris data gardu)
            </p>
          </div>

          {/* Validation & Preview Report */}
          {validationReport && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Baris</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">{validationReport.total} Gardu</div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Koordinat GPS Valid</span>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">{validationReport.validCoordsCount} Titik</div>
                </div>

                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Default Coords (Ambon)</span>
                  <div className="text-lg font-black text-amber-700 mt-0.5">{validationReport.missingCoordsCount} Titik</div>
                </div>
              </div>

              {validationReport.errors.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Catatan Impor Data:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validationReport.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Preview Table */}
              {parsedRows.length > 0 && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
                    <span>Preview Data Terkonversi ({parsedRows.length} Gardu)</span>
                    <span className="text-[10px] font-normal text-slate-500">Siap diimpor ke Master Data</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[9px] sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">No. Gardu (Baru / Lama)</th>
                          <th className="py-2 px-3">Penyulang</th>
                          <th className="py-2 px-3">Daya &amp; Tipe</th>
                          <th className="py-2 px-3">Alamat</th>
                          <th className="py-2 px-3">Koordinat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {parsedRows.slice(0, 10).map((g, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-blue-900">
                              <div>{g.noGarduBaru}</div>
                              <div className="text-[10px] text-slate-400 font-normal">Lama: {g.noGarduLama || '-'}</div>
                            </td>
                            <td className="py-2 px-3">{g.penyulang}</td>
                            <td className="py-2 px-3 font-semibold text-slate-700">{g.daya} kVA ({g.tipeGardu || 'Trafo'})</td>
                            <td className="py-2 px-3 truncate max-w-[180px]">{g.alamatGardu}</td>
                            <td className="py-2 px-3 font-mono text-[10px] text-slate-500">
                              {g.latt}, {g.long}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedRows.length > 10 && (
                      <div className="p-2 text-center text-[11px] font-bold text-slate-400 bg-slate-50 border-t border-slate-100">
                        + {parsedRows.length - 10} baris gardu lainnya...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Konversi &amp; Import ({parsedRows.length} Gardu)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
