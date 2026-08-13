import {
  Penyulang,
  SectionJaringan,
  GangguanLog,
  ROWItem,
  InspeksiItem,
  SaidiSaifiData,
  ActivityLog,
  MapLayerItem,
  SldComponent,
  MaterialStokItem,
  MaterialPemakaianItem,
  AlkerApdItem,
  Tier1Item,
  Tier2Item,
  MonitoringPemeliharaanItem,
  PerintahKerja,
  MasterGardu,
  PengukuranGardu,
  KendaraanOperasional,
  AsetJaringan,
  JadwalPiket
} from '../types';

export const INITIAL_PENYULANG: Penyulang[] = [
  { id: '1', namaGi: 'GI PASSO', namaPenyulang: 'ACC', status: 'Percabangan', kodeId: 'ACC', panjangJaringanKms: 8.7, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 1200 },
  { id: '2', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'ALLANG', status: 'Percabangan', kodeId: 'ALB', panjangJaringanKms: 18.2, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 3354 },
  { id: '3', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'BANDARA 1', status: 'Utama', kodeId: 'BDR1', panjangJaringanKms: 11.05, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 2150 },
  { id: '4', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'BANDARA 2', status: 'Utama', kodeId: 'BDR2', panjangJaringanKms: 19.5, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 2800 },
  { id: '5', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'GALALA 1', status: 'Percabangan', kodeId: 'GLL1', panjangJaringanKms: 8.6, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 1950 },
  { id: '6', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'GALALA 2', status: 'Percabangan', kodeId: 'GLL2', panjangJaringanKms: 8.6, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 1950 },
  { id: '7', namaGi: 'GI PASSO', namaPenyulang: 'HUTUMURI', status: 'Percabangan', kodeId: 'HTM', panjangJaringanKms: 14.85, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 3538 },
  { id: '8', namaGi: 'GI PASSO', namaPenyulang: 'KARPAN 1', status: 'Percabangan', kodeId: 'KRP1', panjangJaringanKms: 6.8, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 2200 },
  { id: '9', namaGi: 'GI PASSO', namaPenyulang: 'LATERI 1', status: 'Percabangan', kodeId: 'LTR1', panjangJaringanKms: 13.25, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 19269 },
  { id: '10', namaGi: 'GI PASSO', namaPenyulang: 'LATERI 2', status: 'Utama', kodeId: 'LTR2', panjangJaringanKms: 9.95, frekuensiGangguan: 1, healthIndexStatus: 'Sehat', sectionTerlama: 'GI PASSO - IC LATERI 2 GH HATIVE', gangguanTerakhir: '2026-01-12', jumlahPelanggan: 2450 },
  { id: '11', namaGi: 'GI PASSO', namaPenyulang: 'MCM', status: 'Percabangan', kodeId: 'MCM', panjangJaringanKms: 8.8, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 261 },
  { id: '12', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'MVTIC 1', status: 'Utama', kodeId: 'MTC1', panjangJaringanKms: 3.7, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 1100 },
  { id: '13', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'MVTIC 2', status: 'Utama', kodeId: 'MTC2', panjangJaringanKms: 8.35, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 1400 },
  { id: '14', namaGi: 'GI PASSO', namaPenyulang: 'PASSO', status: 'Utama', kodeId: 'PSO', panjangJaringanKms: 4.4, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 1850 },
  { id: '15', namaGi: 'GI PASSO', namaPenyulang: 'RIJALI', status: 'Percabangan', kodeId: 'RJL', panjangJaringanKms: 1.9, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 950 },
  { id: '16', namaGi: 'GI PASSO', namaPenyulang: 'TANTUI ATAS', status: 'Percabangan', kodeId: 'TTL', panjangJaringanKms: 8.75, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 1600 },
  { id: '17', namaGi: 'GI PASSO', namaPenyulang: 'TULEHU', status: 'Utama', kodeId: 'TLH', panjangJaringanKms: 55.9, frekuensiGangguan: 1, healthIndexStatus: 'Sehat', sectionTerlama: 'GH Asten - Ujung Jaring', gangguanTerakhir: '2026-01-05', jumlahPelanggan: 12692 },
  { id: '18', namaGi: 'GI PASSO', namaPenyulang: 'WAIHERU 1', status: 'Percabangan', kodeId: 'WH1', panjangJaringanKms: 18.1, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 3005 },
  { id: '19', namaGi: 'GI PASSO', namaPenyulang: 'WAIHERU 2', status: 'Utama', kodeId: 'WH2', panjangJaringanKms: 3.3, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 2504 },
  { id: '20', namaGi: 'GI PASSO', namaPenyulang: 'WAIHERU 2 GI PASSO', status: 'Utama', kodeId: 'WH2.III', panjangJaringanKms: 4.2, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 504 },
  { id: '21', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'WAIHERU 3 POKA', status: 'Percabangan', kodeId: 'WH3 POKA', panjangJaringanKms: 11.6, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 2100 },
  { id: '22', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'WAYAME 1', status: 'Percabangan', kodeId: 'WYM1', panjangJaringanKms: 15.75, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 3200 },
  { id: '23', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'WAYAME 2', status: 'Utama', kodeId: 'WYM2', panjangJaringanKms: 9.9, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 2800 },
  { id: '24', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'WAYAME 3', status: 'Utama', kodeId: 'WYM3', panjangJaringanKms: 2.35, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 8154 },
  { id: '25', namaGi: 'GI PASSO', namaPenyulang: 'BAGUALA UTAMA', status: 'Utama', kodeId: 'BGL', panjangJaringanKms: 12.4, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna', jumlahPelanggan: 2400 }
];

export const INITIAL_SECTIONS: SectionJaringan[] = [
  { id: 's1', namaSection: 'GI Passo - IC Lateri 2 (GH Hative Kecil)', penyulangId: '10', namaPenyulang: 'LATERI 2', jumlahPelanggan: 2450, sistemOperasi: 'Loop', penyulangDiSupply: 'LATERI 1' },
  { id: 's2', namaSection: 'GI Passo - LBS Transit', penyulangId: '19', namaPenyulang: 'WAIHERU 2', jumlahPelanggan: 982, sistemOperasi: 'Radial', penyulangDiSupply: 'PENYULANG UTAMA' },
  { id: 's3', namaSection: 'GI Passo - PMFD Air Besar Passo', penyulangId: '19', namaPenyulang: 'WAIHERU 2', jumlahPelanggan: 1242, sistemOperasi: 'Radial', penyulangDiSupply: 'PENYULANG UTAMA' },
  { id: 's4', namaSection: 'GIS Passo - IC Waiheru 2 (GH Baguala)', penyulangId: '20', namaPenyulang: 'WAIHERU 2 GI PASSO', jumlahPelanggan: 504, sistemOperasi: 'Radial', penyulangDiSupply: 'PENYULANG UTAMA' },
  { id: 's5', namaSection: 'LBS SMA 5 - LBS Tantui', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 1445, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's6', namaSection: 'REC Pohon - LBS Air Besar Passo', penyulangId: '19', namaPenyulang: 'WAIHERU 2', jumlahPelanggan: 280, sistemOperasi: 'Radial', penyulangDiSupply: 'PENYULANG UTAMA' },
  { id: 's7', namaSection: 'OG ALLANG - UJUNG JARING', penyulangId: '2', namaPenyulang: 'ALLANG', jumlahPelanggan: 3354, sistemOperasi: 'Radial', penyulangDiSupply: '-' },
  { id: 's8', namaSection: 'GI Passo - GH Halong', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 10505, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's9', namaSection: 'GH Halong - GH Karpan', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 5451, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's10', namaSection: 'GI Passo - LBS Passo Ujung', penyulangId: '11', namaPenyulang: 'MCM', jumlahPelanggan: 261, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA LTR2' },
  { id: 's11', namaSection: 'GH Karpan - FCO Lateri', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 759, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's12', namaSection: 'LBS Transit - LBS Natsepa', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 111, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's13', namaSection: 'GI Passo - LBS Suli', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 350, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's14', namaSection: 'GI Passo - Recloser Tulehu', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 647, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's15', namaSection: 'REC Tulehu - GH Asten Ujung', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 1, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WH 2 GI' },
  { id: 's16', namaSection: 'OG HUTUMURI - UJUNG JARING', penyulangId: '7', namaPenyulang: 'HUTUMURI', jumlahPelanggan: 3538, sistemOperasi: 'Radial', penyulangDiSupply: '-' },
  { id: 's17', namaSection: 'GI PASSO - IC LATERI 3 HATIVE', penyulangId: '10', namaPenyulang: 'LATERI 3', jumlahPelanggan: 2450, sistemOperasi: 'Radial', penyulangDiSupply: '-' },
  { id: 's18', namaSection: 'LBS Waiheru 1 - IC Waiheru 1 (GH Poka (NO))', penyulangId: '18', namaPenyulang: 'WAIHERU 1', jumlahPelanggan: 3005, sistemOperasi: 'Radial', penyulangDiSupply: '-' },
  { id: 's19', namaSection: 'GI Hative Besar - IC Wayame 1 GH Poka', penyulangId: '24', namaPenyulang: 'WAYAME 3', jumlahPelanggan: 8154, sistemOperasi: 'Radial', penyulangDiSupply: '-' },
  { id: 's20', namaSection: 'GH Aston - Ujung jaring', penyulangId: '17', namaPenyulang: 'TULEHU', jumlahPelanggan: 12692, sistemOperasi: 'Radial', penyulangDiSupply: '-' }
];

export const INITIAL_GANGGUAN: GangguanLog[] = [
  {
    id: 'g1',
    tanggal: '2026-01-12',
    penyulangId: '10',
    namaPenyulang: 'LATERI 2',
    section: 'GI Passo - IC Lateri 2 GH HATIVE',
    jamKeluar: '14:20',
    jamMasuk: '15:10',
    durasi: '0j 50m',
    relayBekerja: 'GFR',
    arusR: 8,
    arusS: 8,
    arusT: 510,
    arusIN: 72,
    penyebab: 'Tidak Ditemukan',
    kodeGangguan: 'E-5',
    detailLokasi: 'Tiang LTR2-45 s/d LTR2-52',
    catatan: 'Penelusuran jalur completed, penormalan bertahap.'
  },
  {
    id: 'g2',
    tanggal: '2026-01-05',
    penyulangId: '17',
    namaPenyulang: 'TULEHU',
    section: 'GH Asten - Ujung Jaring',
    jamKeluar: '08:00',
    jamMasuk: '09:30',
    durasi: '1j 30m',
    relayBekerja: 'GFR / OCR',
    arusR: 168,
    arusS: 207,
    arusT: 184,
    arusIN: 397,
    penyebab: 'Burung Pada SUTM / Pohon Tumbang',
    kodeGangguan: 'E-1',
    detailLokasi: 'Lokasi Tulehu Kampung Baru',
    catatan: 'Pembersihan bangkai burung dan pemangkasan dahan pohon.'
  }
];

export const INITIAL_ROW: ROWItem[] = [
  { id: 'row1', tiangId: 'T-102', namaPenyulang: 'TULEHU', lokasi: 'Jl. Raya Tulehu Km 22', lat: -3.585, lng: 128.32, jumlahPohon: 5, jenisPohon: 'Pohon Kelapa & Mangga', status: 'Perlu Pangkas', prioritas: 'Tinggi', tanggalTemuan: '2026-02-01' },
  { id: 'row2', tiangId: 'T-045', namaPenyulang: 'LATERI 2', lokasi: 'Jl. Laterhairy Passo', lat: -3.642, lng: 128.25, jumlahPohon: 3, jenisPohon: 'Pohon Bambu', status: 'Perlu Pangkas', prioritas: 'Sedang', tanggalTemuan: '2026-02-03' },
  { id: 'row3', tiangId: 'T-088', namaPenyulang: 'WAIHERU 1', lokasi: 'Depan Kampus Unpatti Poka', lat: -3.655, lng: 128.19, jumlahPohon: 2, jenisPohon: 'Pohon Trembesi', status: 'Selesai', prioritas: 'Tinggi', tanggalTemuan: '2026-01-25' }
];

export const INITIAL_INSPEKSI: InspeksiItem[] = [
  { id: 'insp1', tiangOrGarduId: 'GD-PASSO-03', tipe: 'Gardu', namaPenyulang: 'PASSO', lokasi: 'Gardu Distribusi Passo Plaza', temuan: 'Minyak Trafo Merembes Ringan', kondisi: 'Ringan', tanggalInspeksi: '2026-02-04', petugas: 'Tim Inspeksi 1' },
  { id: 'insp2', tiangOrGarduId: 'T-112', tipe: 'Tier 1', namaPenyulang: 'KARPAN 1', lokasi: 'Jl. Karpan Raya', temuan: 'Isolator Tumpu Retak Hairline', kondisi: 'Ringan', tanggalInspeksi: '2026-02-05', petugas: 'Tim Inspeksi 2' },
  { id: 'insp3', tiangOrGarduId: 'T-204', tipe: 'Tier 2', namaPenyulang: 'HUTUMURI', lokasi: 'Desa Hutumuri', temuan: 'Arrester Korosi Severely', kondisi: 'Berat', tanggalInspeksi: '2026-02-06', petugas: 'Tim Inspeksi 1' }
];

export const INITIAL_SAIDI: SaidiSaifiData[] = [
  {
    id: 'saidi1',
    bulan: 'Januari',
    tahun: 2026,
    ensKumulatifKwh: 1240.5,
    targetSaidi: 0.200,
    realisasiSaidi: 0.085,
    targetSaifi: 0.050,
    realisasiSaifi: 0.022,
    tarifListrik: 1444.7,
    estimasiKerugianRp: 1792150,
    catatan: 'Keandalan tercapai sesuai target bulanan.'
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  { id: 'act1', waktu: '2026-02-07 10:15', user: 'Administrator ROW', aktivitas: 'Import file KML Feeder Karpan 1', modul: 'Peta Penyulang' },
  { id: 'act2', waktu: '2026-02-07 09:40', user: 'Administrator ROW', aktivitas: 'Input Data Gangguan Penyulang LATERI 2', modul: 'Gangguan & Trip' },
  { id: 'act3', waktu: '2026-02-06 16:10', user: 'Admin System', aktivitas: 'Menambahkan Section Baru: REC POHON', modul: 'Master Data' },
  { id: 'act4', waktu: '2026-02-05 11:20', user: 'Administrator ROW', aktivitas: 'Update Data SAIDI/SAIFI Januari 2026', modul: 'SAIDI / SAIFI' }
];

export const INITIAL_MAP_LAYERS: MapLayerItem[] = [
  {
    id: 'ml1',
    nama: 'KARPAN 1',
    tiangCount: 15,
    ruteLength: '15 titik',
    tanggalImport: '5/8/2026',
    kategori: 'Inspeksi',
    visible: true,
    color: '#3b82f6',
    coordinates: [
      [-3.635, 128.210],
      [-3.630, 128.218],
      [-3.625, 128.225],
      [-3.620, 128.232]
    ]
  },
  {
    id: 'ml2',
    nama: 'RIJALI',
    tiangCount: 37,
    ruteLength: '37 titik',
    tanggalImport: '5/8/2026',
    kategori: 'Inspeksi',
    visible: true,
    color: '#10b981',
    coordinates: [
      [-3.640, 128.200],
      [-3.645, 128.215],
      [-3.650, 128.230],
      [-3.655, 128.245]
    ]
  },
  {
    id: 'ml3',
    nama: 'TANTUI ATAS',
    tiangCount: 15,
    ruteLength: '15 titik',
    tanggalImport: '5/8/2026',
    kategori: 'Maintenance',
    visible: true,
    color: '#a855f7',
    coordinates: [
      [-3.620, 128.220],
      [-3.615, 128.235],
      [-3.610, 128.250],
      [-3.605, 128.265]
    ]
  },
  {
    id: 'ml4',
    nama: 'PASSO UTAMA',
    tiangCount: 42,
    ruteLength: '42 titik',
    tanggalImport: '5/8/2026',
    kategori: 'Inspeksi',
    visible: true,
    color: '#10b981',
    coordinates: [
      [-3.625, 128.240],
      [-3.620, 128.255],
      [-3.615, 128.270],
      [-3.600, 128.290]
    ]
  },
  {
    id: 'ml5',
    nama: 'TULEHU UTAMA',
    tiangCount: 88,
    ruteLength: '88 titik',
    tanggalImport: '5/8/2026',
    kategori: 'Maintenance',
    visible: true,
    color: '#a855f7',
    coordinates: [
      [-3.600, 128.290],
      [-3.590, 128.310],
      [-3.580, 128.330],
      [-3.570, 128.345]
    ]
  }
];

export const INITIAL_SLD_COMPONENTS: SldComponent[] = [
  { id: 'c1', type: 'busbar', name: 'BUSBAR 20kV GI PASSO', status: 'NORMAL', x: 100, y: 150, giName: 'GI PASSO' },
  { id: 'c2', type: 'pmt', name: 'PMT OUTGOING PASSO', status: 'CLOSED', x: 250, y: 150, giName: 'GI PASSO' },
  { id: 'c3', type: 'recloser', name: 'RECLOSER PASSO PLAZA', status: 'CLOSED', x: 400, y: 150, giName: 'GI PASSO' },
  { id: 'c4', type: 'lbs', name: 'LBS TRANSIT PASSO', status: 'CLOSED', x: 550, y: 150, giName: 'GI PASSO' },
  { id: 'c5', type: 'trafo', name: 'TRAFO 20MVA GI PASSO', status: 'NORMAL', x: 100, y: 80, giName: 'GI PASSO' },
  
  { id: 'c6', type: 'busbar', name: 'BUSBAR 20kV GI NATIVE', status: 'NORMAL', x: 100, y: 350, giName: 'GI NATIVE' },
  { id: 'c7', type: 'pmt', name: 'PMT OUTGOING BANDARA 1', status: 'CLOSED', x: 250, y: 350, giName: 'GI NATIVE' },
  { id: 'c8', type: 'lbs', name: 'LBS AIR BESAR', status: 'CLOSED', x: 400, y: 350, giName: 'GI NATIVE' },
  { id: 'c9', type: 'trafo', name: 'TRAFO 30MVA GI NATIVE', status: 'NORMAL', x: 100, y: 280, giName: 'GI NATIVE' }
];

export const INITIAL_MATERIAL_STOK: MaterialStokItem[] = [
  { id: 'stok1', tanggalMasuk: '2026-02-01', namaMaterial: 'Kabel AAAC 150 mm2', qty: 500, satuan: 'meter', keterangan: 'Pengadaan Gudang ULP Baguala', noDokumen: 'SPK/2026/01/BGL' },
  { id: 'stok2', tanggalMasuk: '2026-02-02', namaMaterial: 'Isolator Tumpu 20kV', qty: 50, satuan: 'pcs', keterangan: 'Dropping UP3 Ambon', noDokumen: 'DO/2026/089' },
  { id: 'stok3', tanggalMasuk: '2026-02-03', namaMaterial: 'Fuse Cut Out (FCO) 20kV', qty: 25, satuan: 'set', keterangan: 'Stok Cadangan Pemeliharaan', noDokumen: 'DO/2026/092' },
  { id: 'stok4', tanggalMasuk: '2026-02-04', namaMaterial: 'Lighting Arrester 20kV 10kA', qty: 30, satuan: 'set', keterangan: 'Dropping UP3 Ambon', noDokumen: 'DO/2026/095' },
  { id: 'stok5', tanggalMasuk: '2026-02-05', namaMaterial: 'CO Element 10A', qty: 100, satuan: 'pcs', keterangan: 'Stok Rutin Yantek', noDokumen: 'SPK/2026/02/BGL' },
  { id: 'stok6', tanggalMasuk: '2026-02-06', namaMaterial: 'Klem AL/CU 150-240', qty: 80, satuan: 'pcs', keterangan: 'Gudang Baguala', noDokumen: 'SPK/2026/03/BGL' }
];

export const INITIAL_MATERIAL_PEMAKAIAN: MaterialPemakaianItem[] = [
  { id: 'pem1', tanggal: '2026-02-04', namaMaterial: 'Kabel AAAC 150 mm2', qty: 120, satuan: 'meter', lokasi: 'Feeder Passo - Tiang #34', jenisPekerjaan: 'Perbaikan Gangguan Kawat Putus', petugas: 'Tim Yantek Baguala 01' },
  { id: 'pem2', tanggal: '2026-02-05', namaMaterial: 'Isolator Tumpu 20kV', qty: 8, satuan: 'pcs', lokasi: 'Penyulang Tulehu - Tiang #102', jenisPekerjaan: 'Penggantian Isolator Retak', petugas: 'Tim Pemeliharaan Baguala' },
  { id: 'pem3', tanggal: '2026-02-06', namaMaterial: 'CO Element 10A', qty: 6, satuan: 'pcs', lokasi: 'Gardu BG-012 Passo', jenisPekerjaan: 'Penanganan FCO Putus', petugas: 'Tim Yantek Baguala 02' },
  { id: 'pem4', tanggal: '2026-02-07', namaMaterial: 'Lighting Arrester 20kV 10kA', qty: 3, satuan: 'set', lokasi: 'Penyulang Lateri 2 - Tiang #45', jenisPekerjaan: 'Perbaikan Pasca Sambaran Petir', petugas: 'Tim Pemeliharaan Baguala' }
];

export const INITIAL_ALKER_APD: AlkerApdItem[] = [
  { id: 'alker1', namaAlker: 'Full Body Harness K3 20kV', tipe: 'APD', jumlah: 12, kondisi: 'Baik', tanggalInput: '2026-01-15', unit: 'ULP Baguala', penanggungJawab: 'Tim Yantek Baguala', catatan: 'Inspeksi rutin K3' },
  { id: 'alker2', namaAlker: 'Helm Safety PLN K3 Electrical', tipe: 'APD', jumlah: 20, kondisi: 'Baik', tanggalInput: '2026-01-15', unit: 'ULP Baguala', penanggungJawab: 'Tim Yantek & Pemeliharaan', catatan: 'Siap pakai' },
  { id: 'alker3', namaAlker: 'Sarung Tangan Isolari 20kV Class 3', tipe: 'APD', jumlah: 8, kondisi: 'Baik', tanggalInput: '2026-01-20', unit: 'ULP Baguala', penanggungJawab: 'Petugas Pekerjaan Bertegangan', catatan: 'Terkalibrasi s/d 2027' },
  { id: 'alker4', namaAlker: 'Stick 20kV Teleskopik (20m)', tipe: 'Alat Kerja', jumlah: 5, kondisi: 'Baik', tanggalInput: '2026-01-10', unit: 'ULP Baguala', penanggungJawab: 'Tim Pemeliharaan', catatan: 'Tersimpan di Mobil Yantek' },
  { id: 'alker5', namaAlker: 'Tang Press Hidrolik 16-300mm2', tipe: 'Alat Kerja', jumlah: 3, kondisi: 'Perlu Perbaikan', tanggalInput: '2026-01-22', unit: 'ULP Baguala', penanggungJawab: 'Tim Konstruksi', catatan: 'Oli hidrolik merembes' },
  { id: 'alker6', namaAlker: 'Insulation Tester Megger 5kV', tipe: 'Alat Ukur', jumlah: 2, kondisi: 'Baik', tanggalInput: '2026-01-25', unit: 'ULP Baguala', penanggungJawab: 'Tim Inspeksi 20kV', catatan: 'Terkalibrasi KAN' },
  { id: 'alker7', namaAlker: 'Earth Tester Kyoritsu 4105A', tipe: 'Alat Ukur', jumlah: 3, kondisi: 'Baik', tanggalInput: '2026-01-28', unit: 'ULP Baguala', penanggungJawab: 'Tim Pemeliharaan Gardu', catatan: 'Pengujian pentahanan' },
  { id: 'alker8', namaAlker: 'Sepatu Safety High Voltage Class 2', tipe: 'APD', jumlah: 15, kondisi: 'Baik', tanggalInput: '2026-01-15', unit: 'ULP Baguala', penanggungJawab: 'Tim Yantek Baguala', catatan: 'Perlengkapan wajib' }
];

export const INITIAL_ROW_DATA: ROWItem[] = [
  {
    id: 'row_1',
    tanggal: '2026-02-08',
    penyulang: 'TULEHU',
    section: 'GH Asten - Ujung Jaringan',
    jumlahTemuanInspeksi: 12,
    realisasiPangkas: 8,
    perluIzin: 3,
    perluPadam: 1,
    pohonBesar: 4,
    luarTemuan: '2 Pohon kelapa miring dekat fasa R'
  },
  {
    id: 'row_2',
    tanggal: '2026-02-06',
    penyulang: 'PASSO',
    section: 'LBS Air Besar - IC Lateri',
    jumlahTemuanInspeksi: 7,
    realisasiPangkas: 7,
    perluIzin: 0,
    perluPadam: 0,
    pohonBesar: 1,
    luarTemuan: 'Ranting pohon trambesi rimbun'
  }
];

export const INITIAL_TIER1: Tier1Item[] = [
  {
    id: 't1_1',
    tanggal: '2026-02-08',
    penyulang: 'TULEHU',
    section: 'GH Asten - Ujung Jaringan',
    temuanRow: 'Dahan pohon kelapa mendekati SUTM (1.5 meter)',
    konstruksi: 'Isolator Tumpu retak pada tiang TLH-42 & Arrester korosi'
  },
  {
    id: 't1_2',
    tanggal: '2026-02-06',
    penyulang: 'LATERI 2',
    section: 'GI Passo - IC Lateri 2 GH Hative',
    temuanRow: 'Ranting pohon trambesi menyentuh fasa R',
    konstruksi: 'Jumperan kendor pada tiang LTR2-18'
  }
];

export const INITIAL_TIER2: Tier2Item[] = [
  {
    id: 't2_1',
    tanggal: '2026-02-07',
    penyulang: 'PASSO',
    section: 'LBS Air Besar Passo',
    jenisTier2: 'Thermovision',
    temuanThermoUltrasound: 'Hotspot temperatur 82°C pada klem jumper LBS Passo'
  },
  {
    id: 't2_2',
    tanggal: '2026-02-05',
    penyulang: 'WAIHERU 1',
    section: 'GI Passo - LBS Transit',
    jenisTier2: 'Ultrasound',
    temuanThermoUltrasound: 'Deteksi bunyi parsial discharge (PD) 42dB pada isolator Gantung'
  }
];

export const INITIAL_MONITORING: MonitoringPemeliharaanItem[] = [
  {
    id: 'm1',
    tanggal: '2026-02-08',
    penyulang: 'TULEHU',
    section: 'GH Asten - Ujung Jaringan',
    jenisPemeliharaan: ['SUTM', 'Peralatan SUTM', 'Tekep Isolator', 'Cover Trafo'],
    keterangan: 'Pemasangan cover trafo dan penggantian tekep isolator rusak'
  },
  {
    id: 'm2',
    tanggal: '2026-02-04',
    penyulang: 'KARPAN 1',
    section: 'LBS SMA 5 - LBS Tantui',
    jenisPemeliharaan: ['SUTR', 'Gardu', 'PHBTR', 'Protective Sleeve'],
    keterangan: 'Pembersihan PHBTR dan perbaikan grounding tiang gardu'
  }
];

export const INITIAL_PERINTAH_KERJA: PerintahKerja[] = [
  {
    id: 'spk_1',
    noSpk: 'SPK/ULP-BGL/2026/02/001',
    tanggal: '2026-02-10',
    jenisPekerjaan: 'ROW',
    namaPenyulang: 'PASSO',
    section: 'LBS Air Besar Passo - GH Passo',
    target: 'Pangkas Pohon Bambu & Trambesi (25 Pohon / 1.5 kms)',
    jumlahPersonil: 6,
    status: 'Dalam Proses',
    timAtauPetugas: 'Tim ROW Yantek Baguala 1',
    catatan: 'Koordinasi dengan Kepala Desa Passo untuk izin pemangkasan',
    createdAt: '2026-02-09T08:00:00Z'
  },
  {
    id: 'spk_2',
    noSpk: 'SPK/ULP-BGL/2026/02/002',
    tanggal: '2026-02-11',
    jenisPekerjaan: 'Inspeksi',
    namaPenyulang: 'TULEHU',
    section: 'GH Asten - Recloser Tulehu',
    target: 'Inspeksi Tier 1 SUTM 30 Tiang & Visual Isolator',
    jumlahPersonil: 4,
    status: 'Terencana',
    timAtauPetugas: 'Tim Inspeksi Teknik ULP',
    catatan: 'Bawa thermovision & grounding set',
    createdAt: '2026-02-09T09:30:00Z'
  },
  {
    id: 'spk_3',
    noSpk: 'SPK/ULP-BGL/2026/02/003',
    tanggal: '2026-02-08',
    jenisPekerjaan: 'Pemeliharaan',
    namaPenyulang: 'LATERI 2',
    section: 'GI Passo - IC Lateri 2 GH Hative',
    target: 'Penggantian Isolator Tumpu Pecah & Tekep Trafo (3 titik)',
    jumlahPersonil: 5,
    status: 'Selesai',
    timAtauPetugas: 'Tim Pemeliharaan 20kV Baguala',
    catatan: 'Pekerjaan selesai 100%, sistem kembali normal tanpa gangguan',
    createdAt: '2026-02-07T14:00:00Z'
  }
];

export const INITIAL_MASTER_GARDU: MasterGardu[] = [
  {
    id: 'gd_1',
    unit: 'ULP Baguala',
    noGarduLama: 'PSO-004',
    noGarduBaru: 'GD-PSO-004',
    alamatGardu: 'Jl. Syaranamual Passo No. 12',
    latt: -3.6492,
    long: 128.2312,
    ssotNumber: 'SSOT-BGL-2026-001',
    penyulang: 'PASSO',
    daya: 160,
    jumlahFasa: '3 Fasa'
  },
  {
    id: 'gd_2',
    unit: 'ULP Baguala',
    noGarduLama: 'LTR2-015',
    noGarduBaru: 'GD-LTR2-015',
    alamatGardu: 'Jl. Laksdya Leo Wattimena Lateri',
    latt: -3.6521,
    long: 128.2145,
    ssotNumber: 'SSOT-BGL-2026-002',
    penyulang: 'LATERI 2',
    daya: 250,
    jumlahFasa: '3 Fasa'
  },
  {
    id: 'gd_3',
    unit: 'ULP Baguala',
    noGarduLama: 'WH2-008',
    noGarduBaru: 'GD-WH2-008',
    alamatGardu: 'Jl. Laksda Yos Sudarso Waiheru',
    latt: -3.6395,
    long: 128.2011,
    ssotNumber: 'SSOT-BGL-2026-003',
    penyulang: 'WAIHERU 2',
    daya: 100,
    jumlahFasa: '3 Fasa'
  },
  {
    id: 'gd_4',
    unit: 'ULP Baguala',
    noGarduLama: 'TLH-021',
    noGarduBaru: 'GD-TLH-021',
    alamatGardu: 'Jl. Raya Tulehu Pertigaan Pasar',
    latt: -3.5871,
    long: 128.3289,
    ssotNumber: 'SSOT-BGL-2026-004',
    penyulang: 'TULEHU',
    daya: 400,
    jumlahFasa: '3 Fasa'
  }
];

export const INITIAL_PENGUKURAN_GARDU: PengukuranGardu[] = [
  {
    id: 'pkg_1',
    garduId: 'gd_1',
    noGardu: 'GD-PSO-004',
    unit: 'ULP Baguala',
    penyulang: 'PASSO',
    dayaKva: 160,
    alamat: 'Jl. Syaranamual Passo No. 12',
    tanggalUkur: '2026-02-08',
    petugas: 'Ahmad & Tim Yantek',
    iRTotal: 145,
    iSTotal: 140,
    iTTotal: 138,
    iNTotal: 12,
    vRN: 228,
    vSN: 226,
    vTN: 227,
    vRS: 395,
    vST: 393,
    vRT: 394,
    thdR: 2.1,
    thdS: 2.3,
    thdT: 2.0,
    iPeakR: 165,
    iPeakS: 158,
    iPeakT: 152,
    tpfR: 0.92,
    tpfS: 0.91,
    tpfT: 0.93,
    jurusan1: {
      nama: 'JURUSAN 1 (Jl. Raya Passo)',
      iRTotal: 45, iSTotal: 42, iTTotal: 40, iNTotal: 5,
      vRN: 228, vSN: 226, vTN: 227, vRS: 395, vST: 393, vRT: 394,
      iPeakR: 52, iPeakS: 48, iPeakT: 45,
      tpfR: 0.92, tpfS: 0.91, tpfT: 0.93,
      titikUkur: 'PHB-TR Rak 1'
    },
    jurusan2: {
      nama: 'JURUSAN 2 (Komp. Perumahan)',
      iRTotal: 50, iSTotal: 48, iTTotal: 49, iNTotal: 4,
      vRN: 228, vSN: 226, vTN: 227, vRS: 395, vST: 393, vRT: 394,
      iPeakR: 58, iPeakS: 54, iPeakT: 55,
      tpfR: 0.92, tpfS: 0.91, tpfT: 0.93,
      titikUkur: 'PHB-TR Rak 2'
    },
    jurusan3: {
      nama: 'JURUSAN 3 (Pasar Passo)',
      iRTotal: 50, iSTotal: 50, iTTotal: 49, iNTotal: 3,
      vRN: 228, vSN: 226, vTN: 227, vRS: 395, vST: 393, vRT: 394,
      iPeakR: 55, iPeakS: 56, iPeakT: 52,
      tpfR: 0.92, tpfS: 0.91, tpfT: 0.93,
      titikUkur: 'PHB-TR Rak 3'
    },
    jurusan4: {
      nama: 'JURUSAN 4 (Cadangan)',
      iRTotal: 0, iSTotal: 0, iTTotal: 0, iNTotal: 0,
      vRN: 228, vSN: 226, vTN: 227, vRS: 395, vST: 393, vRT: 394,
      iPeakR: 0, iPeakS: 0, iPeakT: 0,
      tpfR: 0.92, tpfS: 0.91, tpfT: 0.93,
      titikUkur: 'PHB-TR Rak 4'
    },
    createdAt: '2026-02-08T10:00:00Z'
  },
  {
    id: 'pkg_2',
    garduId: 'gd_2',
    noGardu: 'GD-LTR2-015',
    unit: 'ULP Baguala',
    penyulang: 'LATERI 2',
    dayaKva: 250,
    alamat: 'Jl. Laksdya Leo Wattimena Lateri',
    tanggalUkur: '2026-02-09',
    petugas: 'Rizky & Tim Teknik',
    iRTotal: 320,
    iSTotal: 280,
    iTTotal: 210,
    iNTotal: 65,
    vRN: 215,
    vSN: 218,
    vTN: 222,
    vRS: 375,
    vST: 380,
    vRT: 382,
    thdR: 4.2,
    thdS: 3.8,
    thdT: 3.5,
    iPeakR: 360,
    iPeakS: 310,
    iPeakT: 240,
    tpfR: 0.88,
    tpfS: 0.89,
    tpfT: 0.90,
    jurusan1: {
      nama: 'JURUSAN 1 (Lateri Dalam)',
      iRTotal: 110, iSTotal: 90, iTTotal: 70, iNTotal: 25,
      vRN: 215, vSN: 218, vTN: 222, vRS: 375, vST: 380, vRT: 382,
      iPeakR: 125, iPeakS: 100, iPeakT: 80,
      tpfR: 0.88, tpfS: 0.89, tpfT: 0.90,
      titikUkur: 'PHB-TR Jurusan 1'
    },
    jurusan2: {
      nama: 'JURUSAN 2 (Jl. Utama Lateri)',
      iRTotal: 120, iSTotal: 100, iTTotal: 80, iNTotal: 22,
      vRN: 215, vSN: 218, vTN: 222, vRS: 375, vST: 380, vRT: 382,
      iPeakR: 135, iPeakS: 110, iPeakT: 90,
      tpfR: 0.88, tpfS: 0.89, tpfT: 0.90,
      titikUkur: 'PHB-TR Jurusan 2'
    },
    jurusan3: {
      nama: 'JURUSAN 3 (Pesisir Lateri)',
      iRTotal: 90, iSTotal: 90, iTTotal: 60, iNTotal: 18,
      vRN: 215, vSN: 218, vTN: 222, vRS: 375, vST: 380, vRT: 382,
      iPeakR: 100, iPeakS: 100, iPeakT: 70,
      tpfR: 0.88, tpfS: 0.89, tpfT: 0.90,
      titikUkur: 'PHB-TR Jurusan 3'
    },
    jurusan4: {
      nama: 'JURUSAN 4 (Kawasan Industri)',
      iRTotal: 0, iSTotal: 0, iTTotal: 0, iNTotal: 0,
      vRN: 215, vSN: 218, vTN: 222, vRS: 375, vST: 380, vRT: 382,
      iPeakR: 0, iPeakS: 0, iPeakT: 0,
      tpfR: 0.88, tpfS: 0.89, tpfT: 0.90,
      titikUkur: 'PHB-TR Jurusan 4'
    },
    createdAt: '2026-02-09T09:00:00Z'
  }
];

export const INITIAL_KENDARAAN_OPERASIONAL: KendaraanOperasional[] = [
  {
    id: 'knd-01',
    jenisKendaraan: 'Mobil Operasional',
    namaKendaraan: 'Mobil Hilux Yantek Baguala 01',
    noPolisi: 'DE 8192 AB',
    unit: 'ULP Baguala',
    penanggungJawab: 'Tim Yantek Regu A (Samuel & Budi)',
    kondisiKendaraan: 'Baik',
    kondisiBan: 'Baik - Tebal',
    kondisiAki: 'Normal - Baik',
    kebersihan: 'Sangat Bersih',
    kilometer: 45280,
    tanggalPengecekan: '2026-02-09',
    catatan: 'Siap tempur gangguan 24 jam. Oli mesin baru diganti.',
    materials: [
      { id: 'm1', namaMaterial: 'Tap Connector 70-150 mm2', jumlah: 25, satuan: 'Pcs' },
      { id: 'm2', namaMaterial: 'Kabel Twisted 3x70 + 1x50 mm2', jumlah: 100, satuan: 'Meter' },
      { id: 'm3', namaMaterial: 'Fuse Cut Out (FCO) 20kV', jumlah: 6, satuan: 'Set' },
      { id: 'm4', namaMaterial: 'Fuse Link 10A / 15A / 20A', jumlah: 18, satuan: 'Pcs' },
      { id: 'm5', namaMaterial: 'Jointing Cable XLPE 20kV 3x240', jumlah: 2, satuan: 'Set' },
      { id: 'm6', namaMaterial: 'Isolasi 3M Heavy Duty & Electrical Tape', jumlah: 12, satuan: 'Roll' },
      { id: 'm7', namaMaterial: 'Grounding Set Portable 20kV', jumlah: 2, satuan: 'Set' }
    ]
  },
  {
    id: 'knd-02',
    jenisKendaraan: 'Mobil Operasional',
    namaKendaraan: 'Mobil Isuzu D-Max Yantek Passo 02',
    noPolisi: 'DE 8421 BC',
    unit: 'ULP Baguala',
    penanggungJawab: 'Tim Pemeliharaan (Hendra & Tim)',
    kondisiKendaraan: 'Perlu Perbaikan',
    kondisiBan: 'Cukup',
    kondisiAki: 'Lemah',
    kebersihan: 'Bersih',
    kilometer: 88400,
    tanggalPengecekan: '2026-02-08',
    catatan: 'Aki lemah saat starter pagi, perlu di-stroom/ganti. Rem belakang agak dalam.',
    materials: [
      { id: 'm1', namaMaterial: 'NH Fuse 160A / 250A', jumlah: 10, satuan: 'Pcs' },
      { id: 'm2', namaMaterial: 'Isolator Tumpu 20kV Porcelain', jumlah: 4, satuan: 'Pcs' },
      { id: 'm3', namaMaterial: 'Kabel SR 2x10 mm2', jumlah: 75, satuan: 'Meter' },
      { id: 'm4', namaMaterial: 'Konektor Piercing Insulated', jumlah: 30, satuan: 'Pcs' },
      { id: 'm5', namaMaterial: 'Cabel Ties Heavy Duty 40cm', jumlah: 2, satuan: 'Pack' }
    ]
  },
  {
    id: 'knd-03',
    jenisKendaraan: 'Motor Operasional',
    namaKendaraan: 'Motor Trail KLX Yantek Lapangan 01',
    noPolisi: 'DE 3341 XY',
    unit: 'ULP Baguala',
    penanggungJawab: 'Petugas Inspeksi (Rizky Ramadhan)',
    kondisiKendaraan: 'Baik',
    kondisiBan: 'Baik - Tebal',
    kondisiAki: 'Normal - Baik',
    kebersihan: 'Bersih',
    kilometer: 18230,
    tanggalPengecekan: '2026-02-09',
    catatan: 'Siap untuk medan sulit & gang sulit diakses mobil.',
    materials: [
      { id: 'm1', namaMaterial: 'Fuse Link 6A / 10A', jumlah: 10, satuan: 'Pcs' },
      { id: 'm2', namaMaterial: 'Tap Connector 25-70 mm2', jumlah: 12, satuan: 'Pcs' },
      { id: 'm3', namaMaterial: 'Isolasi Listrik Vinyl', jumlah: 5, satuan: 'Roll' },
      { id: 'm4', namaMaterial: 'Tang Kombinasi & Tang Potong 1000V', jumlah: 1, satuan: 'Set' },
      { id: 'm5', namaMaterial: 'Multitester Digital Portable', jumlah: 1, satuan: 'Unit' }
    ]
  },
  {
    id: 'knd-04',
    jenisKendaraan: 'Motor Operasional',
    namaKendaraan: 'Motor Matik Supra/Revo Patroli ROW 02',
    noPolisi: 'DE 2190 YZ',
    unit: 'ULP Baguala',
    penanggungJawab: 'Petugas ROW (Faisal)',
    kondisiKendaraan: 'Baik',
    kondisiBan: 'Baik - Tebal',
    kondisiAki: 'Normal - Baik',
    kebersihan: 'Bersih',
    kilometer: 24100,
    tanggalPengecekan: '2026-02-07',
    catatan: 'Dilengkapi bracket gergaji & alat pemangkas dahan teleskopik.',
    materials: [
      { id: 'm1', namaMaterial: 'Tali Tambang Manila 12mm', jumlah: 30, satuan: 'Meter' },
      { id: 'm2', namaMaterial: 'Sarung Tangan K3 1000V', jumlah: 2, satuan: 'Pasang' },
      { id: 'm3', namaMaterial: 'Kabel Ties Heavy Duty', jumlah: 1, satuan: 'Pack' }
    ]
  },
  {
    id: 'knd-05',
    jenisKendaraan: 'Mobil Operasional',
    namaKendaraan: 'Mobil Crane / Skylift Yantek UP3 03',
    noPolisi: 'DE 9012 AA',
    unit: 'ULP Baguala',
    penanggungJawab: 'Tim Khusus PDKB / Skylift',
    kondisiKendaraan: 'Baik',
    kondisiBan: 'Baik - Tebal',
    kondisiAki: 'Normal - Baik',
    kebersihan: 'Sangat Bersih',
    kilometer: 31200,
    tanggalPengecekan: '2026-02-09',
    catatan: 'Hidrolik boom dan bucket telah diinspeksi & sertifikasi terkalibrasi.',
    materials: [
      { id: 'm1', namaMaterial: 'Lightning Arrester 20kV 10kA', jumlah: 6, satuan: 'Pcs' },
      { id: 'm2', namaMaterial: 'Pin Isolator 20kV + Pin', jumlah: 6, satuan: 'Pcs' },
      { id: 'm3', namaMaterial: 'Conductor AAAC-S 150 mm2', jumlah: 200, satuan: 'Meter' },
      { id: 'm4', namaMaterial: 'Strain Clamp 70-150 mm2', jumlah: 12, satuan: 'Pcs' },
      { id: 'm5', namaMaterial: 'Suspension Clamp AAAC-S', jumlah: 8, satuan: 'Pcs' }
    ]
  }
];

export const INITIAL_ASET_JARINGAN: AsetJaringan[] = [
  {
    id: 'aset_1',
    namaPenyulang: 'PASSO',
    panjangJtmSutm: 4.4,
    panjangJtmSktm: 0,
    panjangJtmMvtic: 0,
    panjangJtmTotal: 4.4,
    lbsManual: 2,
    lbsMotorized: 1,
    lbsThreeWay: 0,
    recloser: 1,
    garduHubung: 0,
    pmcb: 0,
    autoLink: 2,
    fco: 5,
    scada: 1,
    nonScada: 4,
    panjangJtr: 12.5,
    lastUpdate: '2026-02-09T08:00:00Z'
  },
  {
    id: 'aset_2',
    namaPenyulang: 'TULEHU',
    panjangJtmSutm: 52.4,
    panjangJtmSktm: 3.5,
    panjangJtmMvtic: 0,
    panjangJtmTotal: 55.9,
    lbsManual: 5,
    lbsMotorized: 2,
    lbsThreeWay: 1,
    recloser: 2,
    garduHubung: 1,
    pmcb: 1,
    autoLink: 4,
    fco: 15,
    scada: 3,
    nonScada: 12,
    panjangJtr: 45.8,
    lastUpdate: '2026-02-09T08:00:00Z'
  },
  {
    id: 'aset_3',
    namaPenyulang: 'LATERI 2',
    panjangJtmSutm: 9.95,
    panjangJtmSktm: 0,
    panjangJtmMvtic: 0,
    panjangJtmTotal: 9.95,
    lbsManual: 1,
    lbsMotorized: 1,
    lbsThreeWay: 0,
    recloser: 1,
    garduHubung: 1,
    pmcb: 0,
    autoLink: 1,
    fco: 3,
    scada: 1,
    nonScada: 2,
    panjangJtr: 18.2,
    lastUpdate: '2026-02-09T08:00:00Z'
  }
];

// Schedule patterns for August 2026 (1 - 31)
const PATTERN_A: Record<string, string> = {
  '1': 'S', '2': 'M', '3': 'M', '4': 'L', '5': 'L', '6': 'P', '7': 'P', '8': 'S',
  '9': 'S', '10': 'M', '11': 'M', '12': 'L', '13': 'L', '14': 'P', '15': 'P', '16': 'S',
  '17': 'S', '18': 'M', '19': 'M', '20': 'L', '21': 'L', '22': 'P', '23': 'P', '24': 'S',
  '25': 'S', '26': 'M', '27': 'M', '28': 'L', '29': 'L', '30': 'P', '31': 'P'
};

const PATTERN_B: Record<string, string> = {
  '1': 'M', '2': 'L', '3': 'L', '4': 'P', '5': 'P', '6': 'S', '7': 'S', '8': 'M',
  '9': 'M', '10': 'L', '11': 'L', '12': 'P', '13': 'P', '14': 'S', '15': 'S', '16': 'M',
  '17': 'M', '18': 'L', '19': 'L', '20': 'P', '21': 'P', '22': 'S', '23': 'S', '24': 'M',
  '25': 'M', '26': 'L', '27': 'L', '28': 'P', '29': 'P', '30': 'S', '31': 'S'
};

const PATTERN_C: Record<string, string> = {
  '1': 'L', '2': 'P', '3': 'P', '4': 'S', '5': 'S', '6': 'M', '7': 'M', '8': 'L',
  '9': 'L', '10': 'P', '11': 'P', '12': 'S', '13': 'S', '14': 'M', '15': 'M', '16': 'L',
  '17': 'L', '18': 'P', '19': 'P', '20': 'S', '21': 'S', '22': 'M', '23': 'M', '24': 'L',
  '25': 'L', '26': 'P', '27': 'P', '28': 'S', '29': 'S', '30': 'M', '31': 'M'
};

const PATTERN_D: Record<string, string> = {
  '1': 'P', '2': 'S', '3': 'S', '4': 'M', '5': 'M', '6': 'L', '7': 'L', '8': 'P',
  '9': 'P', '10': 'S', '11': 'S', '12': 'M', '13': 'M', '14': 'L', '15': 'L', '16': 'P',
  '17': 'P', '18': 'S', '19': 'S', '20': 'M', '21': 'M', '22': 'L', '23': 'L', '24': 'P',
  '25': 'P', '26': 'S', '27': 'S', '28': 'M', '29': 'M', '30': 'L', '31': 'L'
};

const PATTERN_ULC_1: Record<string, string> = {
  '1': 'L', '2': 'L', '3': 'L', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'L', '9': 'L', '10': 'P', '11': 'P', '12': 'P', '13': 'P', '14': 'P', '15': 'L', '16': 'L', '17': 'S', '18': 'S', '19': 'S', '20': 'S', '21': 'S', '22': 'L', '23': 'L', '24': 'P', '25': 'P', '26': 'P', '27': 'P', '28': 'P', '29': 'L', '30': 'L', '31': 'P'
};

const PATTERN_ULC_2: Record<string, string> = {
  '1': 'L', '2': 'L', '3': 'L', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'L', '9': 'L', '10': 'S', '11': 'S', '12': 'S', '13': 'S', '14': 'S', '15': 'L', '16': 'L', '17': 'P', '18': 'P', '19': 'P', '20': 'P', '21': 'P', '22': 'L', '23': 'L', '24': 'S', '25': 'S', '26': 'S', '27': 'S', '28': 'S', '29': 'L', '30': 'L', '31': 'S'
};

export const INITIAL_JADWAL_PIKET: JadwalPiket[] = [
  // --- ULC BAGUALA ---
  { id: 'jp_ulc_1', namaPetugas: 'MARTHINUS APONNO', noHp: '0852 4453 7044', unit: 'ULC BAGUALA', jadwal: PATTERN_ULC_1, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_ulc_2', namaPetugas: 'MYCHEL F CAMERLING', noHp: '082199756293', unit: 'ULC BAGUALA', jadwal: PATTERN_ULC_1, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_ulc_3', namaPetugas: 'RESSA RUHUPESSY', noHp: '0812 4000 9740', unit: 'ULC BAGUALA', jadwal: PATTERN_ULC_2, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_ulc_4', namaPetugas: 'FREDY J. AKIHARY', noHp: '0812 4000 9741', unit: 'ULC BAGUALA', jadwal: PATTERN_ULC_2, lastUpdate: '2026-08-01T08:00:00Z' },

  // --- KP GALALA ---
  { id: 'jp_gal_1', namaPetugas: 'MICHAEL D. PATTIPEILOHY', noHp: '081342847046', unit: 'KP GALALA', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_gal_2', namaPetugas: 'GERALDY MAIRUHU', noHp: '0821 1432 3094', unit: 'KP GALALA', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_gal_3', namaPetugas: 'YUSUF', noHp: '082211240871', unit: 'KP GALALA', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_gal_4', namaPetugas: 'RENOLD PALIJAMA', noHp: '085243902172', unit: 'KP GALALA', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_gal_5', namaPetugas: 'JUENTRY K SIPAHELUT', noHp: '085254270862', unit: 'KP GALALA', jadwal: PATTERN_C, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_gal_6', namaPetugas: 'AKRAMANTO RIDWAN', noHp: '082251889595', unit: 'KP GALALA', jadwal: PATTERN_C, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_gal_7', namaPetugas: 'MUSYADIN ALIYASA', noHp: '082198049457', unit: 'KP GALALA', jadwal: PATTERN_D, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_gal_8', namaPetugas: 'ALEXANDER SAUKOLY', noHp: '082197591719', unit: 'KP GALALA', jadwal: PATTERN_D, lastUpdate: '2026-08-01T08:00:00Z' },

  // --- KP LAHA ---
  { id: 'jp_lah_1', namaPetugas: 'CORNELES LALIHATU', noHp: '0821 9785 5656', unit: 'KP LAHA', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_lah_2', namaPetugas: 'VALER DEMNY', noHp: '082248285352', unit: 'KP LAHA', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_lah_3', namaPetugas: 'LA IMAN', noHp: '082198423363', unit: 'KP LAHA', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_lah_4', namaPetugas: 'LEOPOLD SABANDAR', noHp: '0812 4855 4129', unit: 'KP LAHA', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_lah_5', namaPetugas: 'DUDY J. TANIKWELE', noHp: '082238586082', unit: 'KP LAHA', jadwal: PATTERN_C, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_lah_6', namaPetugas: 'ARNOLD D. APITULEY', noHp: '085243569433', unit: 'KP LAHA', jadwal: PATTERN_C, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_lah_7', namaPetugas: 'MUHAMMAD WALLY', noHp: '082199172064', unit: 'KP LAHA', jadwal: PATTERN_D, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_lah_8', namaPetugas: 'ARIOK ANDARIAS MANUHUA', noHp: '082248285352', unit: 'KP LAHA', jadwal: PATTERN_D, lastUpdate: '2026-08-01T08:00:00Z' },

  // --- KP ALLANG ---
  { id: 'jp_alg_1', namaPetugas: 'LA JAYA', noHp: '082198424139', unit: 'KP ALLANG', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_alg_2', namaPetugas: 'DEDI WAEL', noHp: '082198220266', unit: 'KP ALLANG', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_alg_3', namaPetugas: 'USANI', noHp: '082152847355', unit: 'KP ALLANG', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_alg_4', namaPetugas: 'IRFAN IPAENIN', noHp: '082199543549', unit: 'KP ALLANG', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_alg_5', namaPetugas: 'HERMAN SAPAWE', noHp: '081240970275', unit: 'KP ALLANG', jadwal: PATTERN_C, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_alg_6', namaPetugas: 'LA ODE BUDI', noHp: '082198589673', unit: 'KP ALLANG', jadwal: PATTERN_C, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_alg_7', namaPetugas: 'GEMELITO C. PATTIRADJAWANE', noHp: '085354358718', unit: 'KP ALLANG', jadwal: PATTERN_D, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_alg_8', namaPetugas: 'RAHMAT RENWARIN', noHp: '0813 4301 5452', unit: 'KP ALLANG', jadwal: PATTERN_D, lastUpdate: '2026-08-01T08:00:00Z' },

  // --- KP TULEHU ---
  { id: 'jp_tul_1', namaPetugas: 'RAFLI LESTALUHU', noHp: '081292384069', unit: 'KP TULEHU', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_tul_2', namaPetugas: 'PAULUS I. UBJAAN', noHp: '081248778474', unit: 'KP TULEHU', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_tul_3', namaPetugas: 'WELHELEM A. LELEULYA', noHp: '082199425010', unit: 'KP TULEHU', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_tul_4', namaPetugas: 'FUAD LESSY', noHp: '082239773467', unit: 'KP TULEHU', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_tul_5', namaPetugas: 'BAKRI TUHAREA', noHp: '081344582301', unit: 'KP TULEHU', jadwal: PATTERN_C, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_tul_6', namaPetugas: 'FADEL KOTTA', noHp: '082197750459', unit: 'KP TULEHU', jadwal: PATTERN_C, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_tul_7', namaPetugas: 'LA ERWIN', noHp: '081354110341', unit: 'KP TULEHU', jadwal: PATTERN_D, lastUpdate: '2026-08-01T08:00:00Z' },
  { id: 'jp_tul_8', namaPetugas: 'MANNLY MAPUASATTE', noHp: '082190494574', unit: 'KP TULEHU', jadwal: PATTERN_D, lastUpdate: '2026-08-01T08:00:00Z' },

  // --- KP PASSO ---
  { id: 'jp_pas_1', namaPetugas: 'SAMSUL BAHRI', noHp: '081234567893', unit: 'KP PASSO', jadwal: PATTERN_A, lastUpdate: '2026-08-01T08:00:00Z' },

  // --- KP POKA ---
  { id: 'jp_pok_1', namaPetugas: 'LA ODE DARMIN', noHp: '081234567891', unit: 'KP POKA', jadwal: PATTERN_B, lastUpdate: '2026-08-01T08:00:00Z' }
];
