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
  MonitoringPemeliharaanItem
} from '../types';

export const INITIAL_PENYULANG: Penyulang[] = [
  { id: '1', namaGi: 'GI PASSO', namaPenyulang: 'ACC', status: 'Percabangan', kodeId: 'ACC', panjangJaringanKms: 8.7, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '2', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'ALLANG', status: 'Percabangan', kodeId: 'ALB', panjangJaringanKms: 18.2, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '3', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'BANDARA 1', status: 'Utama', kodeId: 'BDR1', panjangJaringanKms: 11.05, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '4', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'BANDARA 2', status: 'Utama', kodeId: 'BDR2', panjangJaringanKms: 19.5, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '5', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'GALALA 1', status: 'Percabangan', kodeId: 'GLL1', panjangJaringanKms: 8.6, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '6', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'GALALA 2', status: 'Percabangan', kodeId: 'GLL2', panjangJaringanKms: 8.6, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '7', namaGi: 'GI PASSO', namaPenyulang: 'HUTUMURI', status: 'Percabangan', kodeId: 'HTM', panjangJaringanKms: 14.85, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '8', namaGi: 'GI PASSO', namaPenyulang: 'KARPAN 1', status: 'Percabangan', kodeId: 'KRP1', panjangJaringanKms: 6.8, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '9', namaGi: 'GI PASSO', namaPenyulang: 'LATERI 1', status: 'Percabangan', kodeId: 'LTR1', panjangJaringanKms: 13.25, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '10', namaGi: 'GI PASSO', namaPenyulang: 'LATERI 2', status: 'Utama', kodeId: 'LTR2', panjangJaringanKms: 9.95, frekuensiGangguan: 1, healthIndexStatus: 'Sehat', sectionTerlama: 'GI PASSO - IC LATERI 2 GH HATIVE', gangguanTerakhir: '2026-01-12' },
  { id: '11', namaGi: 'GI PASSO', namaPenyulang: 'MCM', status: 'Percabangan', kodeId: 'MCM', panjangJaringanKms: 8.8, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '12', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'MVTIC 1', status: 'Utama', kodeId: 'MTC1', panjangJaringanKms: 3.7, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '13', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'MVTIC 2', status: 'Utama', kodeId: 'MTC2', panjangJaringanKms: 8.35, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '14', namaGi: 'GI PASSO', namaPenyulang: 'PASSO', status: 'Utama', kodeId: 'PSO', panjangJaringanKms: 4.4, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '15', namaGi: 'GI PASSO', namaPenyulang: 'RIJALI', status: 'Percabangan', kodeId: 'RJL', panjangJaringanKms: 1.9, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '16', namaGi: 'GI PASSO', namaPenyulang: 'TANTUI ATAS', status: 'Percabangan', kodeId: 'TTL', panjangJaringanKms: 8.75, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '17', namaGi: 'GI PASSO', namaPenyulang: 'TULEHU', status: 'Utama', kodeId: 'TLH', panjangJaringanKms: 55.9, frekuensiGangguan: 1, healthIndexStatus: 'Sehat', sectionTerlama: 'GH Asten - Ujung Jaring', gangguanTerakhir: '2026-01-05' },
  { id: '18', namaGi: 'GI PASSO', namaPenyulang: 'WAIHERU 1', status: 'Percabangan', kodeId: 'WH1', panjangJaringanKms: 18.1, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '19', namaGi: 'GI PASSO', namaPenyulang: 'WAIHERU 2', status: 'Utama', kodeId: 'WH2', panjangJaringanKms: 3.3, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '20', namaGi: 'GI PASSO', namaPenyulang: 'WAIHERU 2 GI PASSO', status: 'Utama', kodeId: 'WH2.III', panjangJaringanKms: 4.2, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '21', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'WAIHERU 3 POKA', status: 'Percabangan', kodeId: 'WH3 POKA', panjangJaringanKms: 11.6, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '22', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'WAYAME 1', status: 'Percabangan', kodeId: 'WYM1', panjangJaringanKms: 15.75, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '23', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'WAYAME 2', status: 'Utama', kodeId: 'WYM2', panjangJaringanKms: 9.9, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '24', namaGi: 'GI NATIVE BESAR', namaPenyulang: 'WAYAME 2', status: 'Utama', kodeId: 'WYM2', panjangJaringanKms: 2.35, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' },
  { id: '25', namaGi: 'GI PASSO', namaPenyulang: 'BAGUALA UTAMA', status: 'Utama', kodeId: 'BGL', panjangJaringanKms: 12.4, frekuensiGangguan: 0, healthIndexStatus: 'Sempurna' }
];

export const INITIAL_SECTIONS: SectionJaringan[] = [
  { id: 's1', namaSection: 'GI Passo - IC Lateri 2 (GH Hative Kecil)', penyulangId: '10', namaPenyulang: 'LATERI 2', jumlahPelanggan: 0, sistemOperasi: 'Loop', penyulangDiSupply: 'LATERI 1' },
  { id: 's2', namaSection: 'GI Passo - LBS Transit', penyulangId: '19', namaPenyulang: 'WAIHERU 2', jumlahPelanggan: 982, sistemOperasi: 'Radial', penyulangDiSupply: 'PENYULANG UTAMA' },
  { id: 's3', namaSection: 'GI Passo - PMFD Air Besar Passo', penyulangId: '19', namaPenyulang: 'WAIHERU 2', jumlahPelanggan: 1242, sistemOperasi: 'Radial', penyulangDiSupply: 'PENYULANG UTAMA' },
  { id: 's4', namaSection: 'GIS Passo - IC Waiheru 2 (GH Baguala)', penyulangId: '20', namaPenyulang: 'WAIHERU 2 GI PASSO', jumlahPelanggan: 504, sistemOperasi: 'Radial', penyulangDiSupply: 'PENYULANG UTAMA' },
  { id: 's5', namaSection: 'LBS SMA 5 - LBS Tantui', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 1445, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's6', namaSection: 'REC Pohon - LBS Air Besar Passo', penyulangId: '19', namaPenyulang: 'WAIHERU 2', jumlahPelanggan: 280, sistemOperasi: 'Radial', penyulangDiSupply: 'PENYULANG UTAMA' },
  { id: 's7', namaSection: 'GH Hative Kecil (Hative) - Ujung Jaringan', penyulangId: '2', namaPenyulang: 'ALLANG', jumlahPelanggan: 3354, sistemOperasi: 'Radial', penyulangDiSupply: '-' },
  { id: 's8', namaSection: 'GI Passo - GH Halong', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 10505, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's9', namaSection: 'GH Halong - GH Karpan', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 5451, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's10', namaSection: 'GI Passo - LBS Passo Ujung', penyulangId: '11', namaPenyulang: 'MCM', jumlahPelanggan: 261, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA LTR2' },
  { id: 's11', namaSection: 'GH Karpan - FCO Lateri', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 759, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's12', namaSection: 'LBS Transit - LBS Natsepa', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 111, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's13', namaSection: 'GI Passo - LBS Suli', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 350, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's14', namaSection: 'GI Passo - Recloser Tulehu', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 647, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WKH GI' },
  { id: 's15', namaSection: 'REC Tulehu - GH Asten Ujung', penyulangId: '9', namaPenyulang: 'LATERI 1', jumlahPelanggan: 1, sistemOperasi: 'Radial', penyulangDiSupply: 'UTAMA WH 2 GI' }
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
    kodeGangguan: 'E-3',
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
    kodeGangguan: 'E-3',
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
  { id: 'alker1', namaAlker: 'Full Body Harness K3 20kV', tipe: 'APD', jumlah: 12, kondisi: 'Baik', tanggalInput: '2026-01-15', penanggungJawab: 'Tim Yantek Baguala', catatan: 'Inspeksi rutin K3' },
  { id: 'alker2', namaAlker: 'Helm Safety PLN K3 Electrical', tipe: 'APD', jumlah: 20, kondisi: 'Baik', tanggalInput: '2026-01-15', penanggungJawab: 'Tim Yantek & Pemeliharaan', catatan: 'Siap pakai' },
  { id: 'alker3', namaAlker: 'Sarung Tangan Isolari 20kV Class 3', tipe: 'APD', jumlah: 8, kondisi: 'Baik', tanggalInput: '2026-01-20', penanggungJawab: 'Petugas Pekerjaan Bertegangan', catatan: 'Terkalibrasi s/d 2027' },
  { id: 'alker4', namaAlker: 'Stick 20kV Teleskopik (20m)', tipe: 'Alat Kerja', jumlah: 5, kondisi: 'Baik', tanggalInput: '2026-01-10', penanggungJawab: 'Tim Pemeliharaan', catatan: 'Tersimpan di Mobil Yantek' },
  { id: 'alker5', namaAlker: 'Tang Press Hidrolik 16-300mm2', tipe: 'Alat Kerja', jumlah: 3, kondisi: 'Perlu Perbaikan', tanggalInput: '2026-01-22', penanggungJawab: 'Tim Konstruksi', catatan: 'Oli hidrolik merembes' },
  { id: 'alker6', namaAlker: 'Insulation Tester Megger 5kV', tipe: 'Alat Ukur', jumlah: 2, kondisi: 'Baik', tanggalInput: '2026-01-25', penanggungJawab: 'Tim Inspeksi 20kV', catatan: 'Terkalibrasi KAN' },
  { id: 'alker7', namaAlker: 'Earth Tester Kyoritsu 4105A', tipe: 'Alat Ukur', jumlah: 3, kondisi: 'Baik', tanggalInput: '2026-01-28', penanggungJawab: 'Tim Pemeliharaan Gardu', catatan: 'Pengujian pentahanan' },
  { id: 'alker8', namaAlker: 'Sepatu Safety High Voltage Class 2', tipe: 'APD', jumlah: 15, kondisi: 'Baik', tanggalInput: '2026-01-15', penanggungJawab: 'Tim Yantek Baguala', catatan: 'Perlengkapan wajib' }
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
