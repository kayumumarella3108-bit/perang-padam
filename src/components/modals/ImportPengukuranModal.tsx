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
  Check,
  Calendar,
  Building2,
  Filter
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

export const parseExcelDate = (val: any): string | null => {
  if (val === undefined || val === null || val === '') return null;

  // 1. If XLSX parsed it as a JS Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. If it's an Excel numeric serial number
  if (typeof val === 'number') {
    if (val > 1000) {
      try {
        const utcDays = val - 25569;
        const utcValue = utcDays * 86400;
        const dateInfo = new Date(utcValue * 1000);
        if (!isNaN(dateInfo.getTime())) {
          const y = dateInfo.getUTCFullYear();
          const m = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
          const d = String(dateInfo.getUTCDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      } catch {}
    }
  }

  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str === '-' || str === '#n/a') {
    return null;
  }

  // 3. Regex ISO: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
    const d = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 4. Regex DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = String(parseInt(dmyMatch[1], 10)).padStart(2, '0');
    const m = String(parseInt(dmyMatch[2], 10)).padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // 5. Regex DD-MM-YY or DD/MM/YY
  const dmyShortMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/);
  if (dmyShortMatch) {
    const d = String(parseInt(dmyShortMatch[1], 10)).padStart(2, '0');
    const m = String(parseInt(dmyShortMatch[2], 10)).padStart(2, '0');
    const y = '20' + dmyShortMatch[3];
    return `${y}-${m}-${d}`;
  }

  // 6. Generic Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
};

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
  const [skippedCount, setSkippedCount] = useState(0);
  const [validationReport, setValidationReport] = useState<{
    total: number;
    validCount: number;
    skippedCount: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate and download sample Excel template for Pengukuran Gardu based on Master Data Gardu Lama
  const handleDownloadTemplate = () => {
    // Generate sample rows using real Gardu Lama from master data if available
    const sampleGarduList = masterGarduList.length > 0
      ? masterGarduList.slice(0, 5)
      : [
          { noGarduLama: 'BG001', unit: 'ULP Baguala', penyulang: 'PASSO', daya: 160, alamatGardu: 'Jl. Raya Passo' },
          { noGarduLama: 'BG002', unit: 'ULP Baguala', penyulang: 'PASSO', daya: 100, alamatGardu: 'Jl. Lateri Utama' },
          { noGarduLama: 'BG003', unit: 'ULP Baguala', penyulang: 'PASSO', daya: 250, alamatGardu: 'Jl. Halong Baru' }
        ];

    const todayStr = new Date().toISOString().split('T')[0];

    const templateData = sampleGarduList.map((g, i) => ({
      'No. Gardu Lama': g.noGarduLama || `BG00${i + 1}`,
      'Tanggal Ukur (YYYY-MM-DD)': todayStr,
      'Unit PLN': g.unit || 'ULP Baguala',
      'Penyulang': g.penyulang || 'PASSO',
      'Daya (kVA)': g.daya || 160,
      'Petugas Ukur': 'Tim Har-Dist ULP Baguala',
      'Alamat Gardu': g.alamatGardu || 'Jl. Raya Baguala, Ambon',
      'Arus Total R (A)': 180 + i * 5,
      'Arus Total S (A)': 185 + i * 5,
      'Arus Total T (A)': 175 + i * 5,
      'Arus Total N (A)': 15 + i * 2,
      'Tegangan VR-N (V)': 220,
      'Tegangan VS-N (V)': 222,
      'Tegangan VT-N (V)': 219,
      'Tegangan VR-S (V)': 380,
      'Tegangan VS-T (V)': 382,
      'Tegangan VR-T (V)': 381,
      'Cos Phi R': 0.92,
      'Cos Phi S': 0.92,
      'Cos Phi T': 0.92,
      'THD R (%)': 2.5,
      'THD S (%)': 2.5,
      'THD T (%)': 2.5,
      'Jurusan 1 - Arus R (A)': 95 + i * 2,
      'Jurusan 1 - Arus S (A)': 98 + i * 2,
      'Jurusan 1 - Arus T (A)': 92 + i * 2,
      'Jurusan 1 - Arus N (A)': 8,
      'Jurusan 2 - Arus R (A)': 85 + i * 3,
      'Jurusan 2 - Arus S (A)': 87 + i * 3,
      'Jurusan 2 - Arus T (A)': 83 + i * 3,
      'Jurusan 2 - Arus N (A)': 7,
      'Jurusan 3 - Arus R (A)': 0,
      'Jurusan 3 - Arus S (A)': 0,
      'Jurusan 3 - Arus T (A)': 0,
      'Jurusan 3 - Arus N (A)': 0,
      'Jurusan 4 - Arus R (A)': 0,
      'Jurusan 4 - Arus S (A)': 0,
      'Jurusan 4 - Arus T (A)': 0,
      'Jurusan 4 - Arus N (A)': 0
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Pengukuran_Gardu_Lama');
    XLSX.writeFile(wb, 'Template_Import_Pengukuran_Gardu_Lama.xlsx');
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
    setSkippedCount(0);
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
            skippedCount: 0,
            errors: ['File Excel kosong atau tidak memiliki data baris yang valid.']
          });
          setIsProcessing(false);
          return;
        }

        const items: PengukuranGardu[] = [];
        const errors: string[] = [];
        let skipped = 0;

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

          // 1. DATA GARDU: Disesuaikan dengan No. Gardu Lama Saja
          const noGarduLamaRaw = findVal(
            'No. Gardu Lama', 'No Gardu Lama', 'NO_GARDU_LAMA', 'Gardu Lama', 'KODE GARDU LAMA',
            'No. Gardu', 'No Gardu', 'KODE GARDU', 'NO_GARDU', 'Gardu', 'GARDU', 'Nama Gardu', 'Kode', 'GARDU_LAMA'
          );
          const noGarduInput = String(noGarduLamaRaw || '').trim();

          if (!noGarduInput) {
            skipped++;
            errors.push(`Baris ${idx + 1}: Ditolak / Tidak Terupload karena No. Gardu Lama kosong.`);
            return;
          }

          // Pencocokan Data Gardu Khusus Berdasarkan No. Gardu Lama di Master Data
          const matchedMaster = masterGarduList.find(
            (mg) =>
              mg.noGarduLama &&
              mg.noGarduLama.trim().toLowerCase() === noGarduInput.toLowerCase()
          ) || masterGarduList.find(
            (mg) =>
              (mg.noGarduBaru && mg.noGarduBaru.trim().toLowerCase() === noGarduInput.toLowerCase()) ||
              (mg.ssotNumber && mg.ssotNumber !== '-' && mg.ssotNumber.trim().toLowerCase() === noGarduInput.toLowerCase())
          );

          // Selalu prioritaskan format Gardu Lama
          const finalNoGarduLama = matchedMaster?.noGarduLama || noGarduInput;

          // 2. TANGGAL UKUR: Harus disesuaikan dengan data Excel. Jika belum ada tanggal, TIDAK BISA TERUPLOAD
          const tglVal = findVal(
            'Tanggal Ukur (YYYY-MM-DD)', 'Tanggal Ukur', 'Tanggal', 'TGL_UKUR', 'Tgl Ukur', 'Tgl', 'DATE',
            'TANGGAL PENGUKURAN', 'TGL UKUR', 'WAKTU UKUR', 'TGL_PENGUKURAN', 'TANGGAL'
          );

          const tglUkur = parseExcelDate(tglVal);

          if (!tglUkur) {
            skipped++;
            errors.push(`Baris ${idx + 1} (Gardu: ${finalNoGarduLama}): Ditolak / Tidak Terupload karena Tanggal Ukur belum diisi atau tidak sesuai format.`);
            return; // STRICT: Row WITHOUT a date cannot be uploaded
          }

          // 3. SEMUA DATA INPUT OTOMATIS TERINPUT SESUAI NILAI EXCEL
          const unit = String(findVal('Unit PLN', 'Unit', 'ULP', 'Unit ULP') || matchedMaster?.unit || 'ULP Baguala');
          const penyulang = String(findVal('Penyulang', 'Nama Penyulang', 'FEEDER', 'Penyulang Trafo') || matchedMaster?.penyulang || 'PASSO');
          const dayaKva = parseNum(findVal('Daya (kVA)', 'Daya', 'KVA', 'Daya Trafo', 'Kapasitas Trafo'), matchedMaster?.daya || 160);
          const petugas = String(findVal('Petugas Ukur', 'Petugas', 'Tim Ukur', 'Tim', 'PETUGAS', 'PETUGAS UKUR', 'NAMA PETUGAS') || 'Tim Har-Dist ULP');
          const alamat = String(findVal('Alamat Gardu', 'Alamat', 'Lokasi', 'LOKASI GARDU', 'ALAMAT') || matchedMaster?.alamatGardu || 'Jl. Raya Baguala, Ambon');

          // Arus Total R, S, T, N
          const iRTotal = parseNum(findVal('Arus Total R (A)', 'Arus Total R', 'Arus R Total', 'I_R', 'IR', 'Arus R', 'R Total', 'I R', 'IR (A)', 'R (A)'), 0);
          const iSTotal = parseNum(findVal('Arus Total S (A)', 'Arus Total S', 'Arus S Total', 'I_S', 'IS', 'Arus S', 'S Total', 'I S', 'IS (A)', 'S (A)'), 0);
          const iTTotal = parseNum(findVal('Arus Total T (A)', 'Arus Total T', 'Arus T Total', 'I_T', 'IT', 'Arus T', 'T Total', 'I T', 'IT (A)', 'T (A)'), 0);
          const iNTotal = parseNum(findVal('Arus Total N (A)', 'Arus Total N', 'Arus N Total', 'I_N', 'IN', 'Arus N', 'N Total', 'I N', 'IN (A)', 'N (A)'), 0);

          // Tegangan Fasa - Netral
          const vRN = parseNum(findVal('Tegangan VR-N (V)', 'Tegangan VR-N', 'V_RN', 'VRN', 'VR-N', 'V R-N', 'VR_N', 'VR N (V)'), 220);
          const vSN = parseNum(findVal('Tegangan VS-N (V)', 'Tegangan VS-N', 'V_SN', 'VSN', 'VS-N', 'V S-N', 'VS_N', 'VS N (V)'), 220);
          const vTN = parseNum(findVal('Tegangan VT-N (V)', 'Tegangan VT-N', 'V_TN', 'VTN', 'VT-N', 'V T-N', 'VT_N', 'VT N (V)'), 220);

          // Tegangan Fasa - Fasa
          const vRS = parseNum(findVal('Tegangan VR-S (V)', 'Tegangan VR-S', 'V_RS', 'VRS', 'VR-S', 'V R-S', 'VR_S', 'VR S (V)'), 380);
          const vST = parseNum(findVal('Tegangan VS-T (V)', 'Tegangan VS-T', 'V_ST', 'VST', 'VS-T', 'V S-T', 'VS_T', 'VS T (V)'), 380);
          const vRT = parseNum(findVal('Tegangan VR-T (V)', 'Tegangan VR-T', 'V_RT', 'VRT', 'VR-T', 'V R-T', 'VR_T', 'VR T (V)', 'Tegangan VT-R (V)', 'VTR', 'VT-R'), 380);

          // Power factor / Cosphi
          const tpfR = parseNum(findVal('Cos Phi R', 'Cos Phi / TPF R', 'Cosphi R', 'TPF R', 'Cos Phi', 'Cosphi', 'PF R', 'PF'), 0.92);
          const tpfS = parseNum(findVal('Cos Phi S', 'Cos Phi / TPF S', 'Cosphi S', 'TPF S', 'Cos Phi', 'Cosphi', 'PF S', 'PF'), 0.92);
          const tpfT = parseNum(findVal('Cos Phi T', 'Cos Phi / TPF T', 'Cosphi T', 'TPF T', 'Cos Phi', 'Cosphi', 'PF T', 'PF'), 0.92);

          // THD
          const thdR = parseNum(findVal('THD R (%)', 'THD R', 'THD_R', 'THD'), 2.5);
          const thdS = parseNum(findVal('THD S (%)', 'THD S', 'THD_S', 'THD'), 2.5);
          const thdT = parseNum(findVal('THD T (%)', 'THD T', 'THD_T', 'THD'), 2.5);

          // Jurusan 1
          const j1_iR = parseNum(findVal('Jurusan 1 - Arus R (A)', 'Jurusan 1 - Arus R', 'J1_IR', 'J1 IR', 'J1 R', 'Jurusan 1 R', 'J1_R'), iRTotal > 0 ? iRTotal : 0);
          const j1_iS = parseNum(findVal('Jurusan 1 - Arus S (A)', 'Jurusan 1 - Arus S', 'J1_IS', 'J1 IS', 'J1 S', 'Jurusan 1 S', 'J1_S'), iSTotal > 0 ? iSTotal : 0);
          const j1_iT = parseNum(findVal('Jurusan 1 - Arus T (A)', 'Jurusan 1 - Arus T', 'J1_IT', 'J1 IT', 'J1 T', 'Jurusan 1 T', 'J1_T'), iTTotal > 0 ? iTTotal : 0);
          const j1_iN = parseNum(findVal('Jurusan 1 - Arus N (A)', 'Jurusan 1 - Arus N', 'J1_IN', 'J1 IN', 'J1 N', 'Jurusan 1 N', 'J1_N'), iNTotal > 0 ? iNTotal : 0);

          // Jurusan 2
          const j2_iR = parseNum(findVal('Jurusan 2 - Arus R (A)', 'Jurusan 2 - Arus R', 'J2_IR', 'J2 IR', 'J2 R', 'Jurusan 2 R', 'J2_R'), 0);
          const j2_iS = parseNum(findVal('Jurusan 2 - Arus S (A)', 'Jurusan 2 - Arus S', 'J2_IS', 'J2 IS', 'J2 S', 'Jurusan 2 S', 'J2_S'), 0);
          const j2_iT = parseNum(findVal('Jurusan 2 - Arus T (A)', 'Jurusan 2 - Arus T', 'J2_IT', 'J2 IT', 'J2 T', 'Jurusan 2 T', 'J2_T'), 0);
          const j2_iN = parseNum(findVal('Jurusan 2 - Arus N (A)', 'Jurusan 2 - Arus N', 'J2_IN', 'J2 IN', 'J2 N', 'Jurusan 2 N', 'J2_N'), 0);

          // Jurusan 3
          const j3_iR = parseNum(findVal('Jurusan 3 - Arus R (A)', 'Jurusan 3 - Arus R', 'J3_IR', 'J3 IR', 'J3 R', 'Jurusan 3 R', 'J3_R'), 0);
          const j3_iS = parseNum(findVal('Jurusan 3 - Arus S (A)', 'Jurusan 3 - Arus S', 'J3_IS', 'J3 IS', 'J3 S', 'Jurusan 3 S', 'J3_S'), 0);
          const j3_iT = parseNum(findVal('Jurusan 3 - Arus T (A)', 'Jurusan 3 - Arus T', 'J3_IT', 'J3 IT', 'J3 T', 'Jurusan 3 T', 'J3_T'), 0);
          const j3_iN = parseNum(findVal('Jurusan 3 - Arus N (A)', 'Jurusan 3 - Arus N', 'J3_IN', 'J3 IN', 'J3 N', 'Jurusan 3 N', 'J3_N'), 0);

          // Jurusan 4
          const j4_iR = parseNum(findVal('Jurusan 4 - Arus R (A)', 'Jurusan 4 - Arus R', 'J4_IR', 'J4 IR', 'J4 R', 'Jurusan 4 R', 'J4_R'), 0);
          const j4_iS = parseNum(findVal('Jurusan 4 - Arus S (A)', 'Jurusan 4 - Arus S', 'J4_IS', 'J4 IS', 'J4 S', 'Jurusan 4 S', 'J4_S'), 0);
          const j4_iT = parseNum(findVal('Jurusan 4 - Arus T (A)', 'Jurusan 4 - Arus T', 'J4_IT', 'J4 IT', 'J4 T', 'Jurusan 4 T', 'J4_T'), 0);
          const j4_iN = parseNum(findVal('Jurusan 4 - Arus N (A)', 'Jurusan 4 - Arus N', 'J4_IN', 'J4 IN', 'J4 N', 'Jurusan 4 N', 'J4_N'), 0);

          const newPengukuran: PengukuranGardu = {
            id: `UKUR_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
            garduId: matchedMaster?.id || '',
            noGardu: finalNoGarduLama, // Sesuai No. Gardu Lama
            unit,
            penyulang,
            dayaKva,
            alamat,
            tanggalUkur: tglUkur, // Disesuaikan dengan data Excel
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
            thdR,
            thdS,
            thdT,
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
              iRTotal: j3_iR,
              iSTotal: j3_iS,
              iTTotal: j3_iT,
              iNTotal: j3_iN,
              vRN,
              vSN,
              vTN,
              vRS,
              vST,
              vRT,
              iPeakR: Math.round(j3_iR * 1.15),
              iPeakS: Math.round(j3_iS * 1.15),
              iPeakT: Math.round(j3_iT * 1.15),
              tpfR,
              tpfS,
              tpfT,
              titikUkur: 'Pangkal Jurusan 3'
            },
            jurusan4: {
              nama: 'JURUSAN 4',
              iRTotal: j4_iR,
              iSTotal: j4_iS,
              iTTotal: j4_iT,
              iNTotal: j4_iN,
              vRN,
              vSN,
              vTN,
              vRS,
              vST,
              vRT,
              iPeakR: Math.round(j4_iR * 1.15),
              iPeakS: Math.round(j4_iS * 1.15),
              iPeakT: Math.round(j4_iT * 1.15),
              tpfR,
              tpfS,
              tpfT,
              titikUkur: 'Pangkal Jurusan 4'
            },
            createdAt: new Date().toISOString()
          };

          items.push(newPengukuran);
        });

        setParsedRows(items);
        setSkippedCount(skipped);
        setValidationReport({
          total: rawJson.length,
          validCount: items.length,
          skippedCount: skipped,
          errors
        });
      } catch (err: any) {
        setValidationReport({
          total: 0,
          validCount: 0,
          skippedCount: 0,
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
                Pencocokan berbasis <b>No. Gardu Lama</b> &amp; validasi ketat <b>Tanggal Ukur</b> sesuai file Excel
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
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Ketentuan Import:</span> Data gardu disesuaikan dengan <b>No. Gardu Lama</b>. Baris tanpa tanggal ukur tidak akan terupload. Semua nilai arus, tegangan, cos phi &amp; jurusan otomatis terinput.
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template Excel (.xlsx)</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Total Baris:</span>
                  <span className="text-sm font-black text-slate-900">{validationReport.total} Baris</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-800">Valid &amp; Siap Upload:</span>
                  <span className="text-sm font-black text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {validationReport.validCount} Pengukuran
                  </span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  validationReport.skippedCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <span className="text-xs font-medium">Ditolak / Dilewati:</span>
                  <span className="text-sm font-black flex items-center gap-1">
                    {validationReport.skippedCount > 0 && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    {validationReport.skippedCount} Baris
                  </span>
                </div>
              </div>

              {/* Error / Warning list if any */}
              {validationReport.errors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1 max-h-36 overflow-y-auto">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900 sticky top-0 bg-rose-50 pb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Catatan Validasi ({validationReport.errors.length} Baris Ditolak):</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 font-medium">
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
                      <span>Pratinjau Data Pengukuran Gardu Lama ({parsedRows.length})</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">Menampilkan maks 10 data pertama</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[9px] sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">No. Gardu Lama</th>
                          <th className="py-2.5 px-3">Tanggal Ukur</th>
                          <th className="py-2.5 px-3">Penyulang &amp; Daya</th>
                          <th className="py-2.5 px-3 text-center">Arus Total R/S/T (N)</th>
                          <th className="py-2.5 px-3 text-center">Tegangan VR-N/VS-N/VT-N</th>
                          <th className="py-2.5 px-3 text-center">Cos Phi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {parsedRows.slice(0, 10).map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-blue-900">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>{p.noGardu}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-normal truncate max-w-[130px]">{p.alamat}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-emerald-800 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-emerald-600" />
                                <span>{p.tanggalUkur}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{p.petugas}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-800">{p.penyulang}</span>
                              <div className="text-[10px] font-bold text-blue-700">{p.dayaKva} kVA</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                              <span className="text-blue-700">{p.iRTotal}</span> / {' '}
                              <span className="text-amber-700">{p.iSTotal}</span> / {' '}
                              <span className="text-rose-700">{p.iTTotal}</span> <br/>
                              <span className="text-[10px] text-slate-500 font-normal">N: {p.iNTotal} A</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-600 text-[11px]">
                              {p.vRN}V / {p.vSN}V / {p.vTN}V
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-indigo-700">
                              {p.tpfR || 0.92}
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

