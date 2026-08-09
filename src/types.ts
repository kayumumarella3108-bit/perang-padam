export type ViewType = 
  | 'dashboard'
  | 'peta_penyulang'
  | 'health_index'
  | 'matriks_gangguan'
  | 'row'
  | 'inspeksi_tier1'
  | 'inspeksi_tier2'
  | 'pemeliharaan_20kv'
  | 'master_data'
  | 'saidi_saifi'
  | 'material'
  | 'alker_apd'
  | 'kelola_user'
  | 'sld_visio'
  | 'peta'
  | 'gangguan';

export type MasterTab = 'penyulang' | 'section' | 'log_aktivitas';

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
  penanggungJawab?: string;
  catatan?: string;
}
