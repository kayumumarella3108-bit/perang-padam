export type ViewType = 
  | 'dashboard'
  | 'peta_penyulang'
  | 'health_index'
  | 'matriks_gangguan'
  | 'row'
  | 'inspeksi_tier1'
  | 'inspeksi_tier2'
  | 'pemeliharaan_20kv'
  | 'perintah_kerja'
  | 'master_data'
  | 'pengukuran_gardu'
  | 'saidi_saifi'
  | 'material'
  | 'alker_apd'
  | 'kendaraan_operasional'
  | 'kelola_user'
  | 'sld_visio'
  | 'peta'
  | 'aset_jaringan'
  | 'gangguan';

export type MasterTab = 'penyulang' | 'section' | 'gardu' | 'log_aktivitas';

export interface Penyulang {
  id: string;
  namaGi: string;
  namaPenyulang: string;
  status: 'Utama' | 'Percabangan';
  kodeId: string;
  panjangJaringanKms: number;
  frekuensiGangguan: number;
  healthIndexStatus: 'Sempurna' | 'Sehat' | 'Sakit' | 'Kronis';
  sectionTerlama?: string;
  gangguanTerakhir?: string;
}

export interface SectionJaringan {
  id: string;
  namaSection: string;
  penyulangId: string;
  namaPenyulang: string;
  jumlahPelanggan: number;
  sistemOperasi: 'Radial' | 'Loop';
  penyulangDiSupply: string;
}

export interface GangguanLog {
  id: string;
  tanggal: string;
  penyulangId: string;
  namaPenyulang: string;
  section: string;
  jamKeluar: string;
  jamMasuk: string;
  durasi: string;
  relayBekerja: string;
  arusR: number;
  arusS: number;
  arusT: number;
  arusIN: number;
  penyebab: string;
  kodeGangguan: string;
  detailLokasi: string;
  catatan: string;
}

export interface ROWItem {
  id: string;
  tanggal?: string;
  penyulang?: string;
  section?: string;
  jumlahTemuanInspeksi?: number | string;
  realisasiPangkas?: number | string;
  perluIzin?: number | string;
  perluPadam?: number | string;
  pohonBesar?: number | string;
  luarTemuan?: string;
  tiangId?: string;
  namaPenyulang?: string;
  lokasi?: string;
  lat?: number;
  lng?: number;
  jumlahPohon?: number;
  jenisPohon?: string;
  status?: 'Perlu Pangkas' | 'Selesai' | 'Jadwal Ulang';
  prioritas?: 'Tinggi' | 'Sedang' | 'Rendah';
  tanggalTemuan?: string;
}

export interface InspeksiItem {
  id: string;
  tiangOrGarduId: string;
  tipe: 'Tier 1' | 'Tier 2' | 'Gardu';
  namaPenyulang: string;
  lokasi: string;
  temuan: string;
  kondisi: 'Baik' | 'Ringan' | 'Berat';
  tanggalInspeksi: string;
  petugas: string;
}

export interface Tier1Item {
  id: string;
  tanggal: string;
  penyulang: string;
  section: string;
  temuanRow: string;
  konstruksi: string;
}

export interface Tier2Item {
  id: string;
  tanggal: string;
  penyulang: string;
  section: string;
  jenisTier2: 'Thermovision' | 'Ultrasound';
  temuanThermoUltrasound: string;
}

export interface MonitoringPemeliharaanItem {
  id: string;
  tanggal: string;
  penyulang: string;
  section: string;
  jenisPemeliharaan: string[];
  keterangan: string;
}

export interface SaidiSaifiData {
  id: string;
  bulan: string;
  tahun: number;
  ensKumulatifKwh: number;
  targetSaidi: number;
  realisasiSaidi: number;
  targetSaifi: number;
  realisasiSaifi: number;
  tarifListrik: number; // Rp 1444.7
  estimasiKerugianRp: number;
  catatan: string;
}

export interface User {
  id?: string;
  username: string;
  name: string;
  role: 'Koordinator' | 'Admin Teknik' | 'Bagian Teknik' | 'Team Leader' | 'Manager ULP' | 'UP3' | 'UIW' | 'PLN Nusadaya' | string;
  unit?: string;
  status?: string;
  avatarUrl?: string;
  password?: string;
}

export interface ActivityLog {
  id: string;
  waktu: string;
  user: string;
  aktivitas: string;
  modul: string;
}

export interface MapLayerItem {
  id: string;
  nama: string;
  tiangCount: number;
  ruteLength: string;
  tanggalImport: string;
  kategori: 'ROW' | 'Inspeksi' | 'Maintenance';
  visible: boolean;
  color: string;
  coordinates: [number, number][];
}

export interface SldComponent {
  id: string;
  type: 'trafo' | 'pmt' | 'recloser' | 'lbs' | 'busbar' | 'feeder';
  name: string;
  status: 'OPEN' | 'CLOSED' | 'NORMAL';
  x: number;
  y: number;
  giName: string;
}

export interface MaterialStokItem {
  id: string;
  tanggalMasuk: string;
  namaMaterial: string;
  qty: number;
  satuan: string;
  keterangan?: string;
  noDokumen?: string;
}

export interface MaterialPemakaianItem {
  id: string;
  tanggal: string;
  namaMaterial: string;
  qty: number;
  satuan: string;
  lokasi: string;
  jenisPekerjaan: string;
  petugas?: string;
}

export interface AlkerApdItem {
  id: string;
  namaAlker: string;
  tipe: 'Alat Kerja' | 'APD' | 'Alat Ukur';
  jumlah: number;
  kondisi: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
  tanggalInput: string;
  unit?: string;
  penanggungJawab?: string;
  catatan?: string;
}

export interface PerintahKerja {
  id: string;
  noSpk: string;
  tanggal: string;
  jenisPekerjaan: 'ROW' | 'Inspeksi' | 'Pemeliharaan';
  penyulangId?: string;
  namaPenyulang: string;
  section: string;
  target: string;
  jumlahPersonil: number;
  status: 'Terencana' | 'Dalam Proses' | 'Selesai' | 'Dibatalkan';
  timAtauPetugas?: string;
  catatan?: string;
  createdAt?: string;
}

export interface MasterGardu {
  id: string;
  unit: string; // Unit (e.g. ULP Baguala)
  noGarduLama: string; // No Gardu Lama
  noGarduBaru: string; // No Gardu Baru
  alamatGardu: string; // ALAMAT GARDU
  latt: number | string; // LATT
  long: number | string; // LONG
  ssotNumber: string; // Ssotnumber
  penyulang: string; // Penyulang
  daya: number; // Daya (kVA) e.g. 100, 160, 250, 400
  jumlahFasa: '1 Fasa' | '3 Fasa' | string; // Jumlah Fasa
}

export interface JurusanData {
  nama: string; // JURUSAN 1, JURUSAN 2, etc.
  iRTotal: number;
  iSTotal: number;
  iTTotal: number;
  iNTotal: number;
  vRN: number;
  vSN: number;
  vTN: number;
  vRS: number;
  vST: number;
  vRT: number;
  iPeakR: number;
  iPeakS: number;
  iPeakT: number;
  tpfR: number;
  tpfS: number;
  tpfT: number;
  titikUkur: string;
}

export interface PengukuranGardu {
  id: string;
  garduId?: string;
  noGardu: string; // No Gardu Baru / Lama
  unit?: string;
  penyulang?: string;
  dayaKva?: number;
  alamat?: string;
  tanggalUkur: string; // Tanggal Ukur YYYY-MM-DD
  petugas: string; // Petugas
  
  // Total / Main Trafo Measurements
  iRTotal: number;
  iSTotal: number;
  iTTotal: number;
  iNTotal: number;
  vRN: number;
  vSN: number;
  vTN: number;
  vRS: number;
  vST: number;
  vRT: number;
  thdR: number;
  thdS: number;
  thdT: number;
  iPeakR: number;
  iPeakS: number;
  iPeakT: number;
  tpfR: number;
  tpfS: number;
  tpfT: number;

  // Jurusan 1 s/d 4
  jurusan1: JurusanData;
  jurusan2: JurusanData;
  jurusan3: JurusanData;
  jurusan4: JurusanData;

  createdAt?: string;
}

export interface MaterialKendaraan {
  id?: string;
  namaMaterial: string;
  jumlah: number;
  satuan: string;
}

export interface KendaraanOperasional {
  id: string;
  jenisKendaraan: 'Mobil Operasional' | 'Motor Operasional';
  namaKendaraan: string;
  noPolisi: string;
  unit: string;
  penanggungJawab: string;
  kondisiKendaraan: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
  kondisiBan: 'Baik - Tebal' | 'Cukup' | 'Aus / Perlu Ganti';
  kondisiAki: 'Normal - Baik' | 'Lemah' | 'Perlu Stroom / Ganti';
  kebersihan: 'Sangat Bersih' | 'Bersih' | 'Kotor';
  kilometer?: number;
  tanggalPengecekan: string;
  catatan?: string;
  materials: MaterialKendaraan[];
}

export interface AsetJaringan {
  id: string;
  namaPenyulang: string;
  panjangJtmSutm: number;
  panjangJtmSktm: number;
  panjangJtmMvtic: number;
  panjangJtmTotal: number;
  lbsManual: number;
  lbsMotorized: number;
  lbsThreeWay: number;
  recloser: number;
  garduHubung: number;
  pmcb: number;
  autoLink: number;
  fco: number;
  scada: number;
  nonScada: number;
  panjangJtr: number;
  lastUpdate: string;
}
