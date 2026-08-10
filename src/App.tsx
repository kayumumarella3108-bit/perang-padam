import React, { useState, useEffect, useMemo } from 'react';
import {
  ViewType,
  User,
  Penyulang,
  SectionJaringan,
  GangguanLog,
  ROWItem,
  InspeksiItem,
  Tier1Item,
  Tier2Item,
  MonitoringPemeliharaanItem,
  MapLayerItem,
  ActivityLog,
  SaidiSaifiData,
  MaterialStokItem,
  MaterialPemakaianItem,
  AlkerApdItem,
  PerintahKerja,
  MasterGardu,
  PengukuranGardu,
  KendaraanOperasional,
  AsetJaringan,
  JadwalPiket
} from './types';
import {
  INITIAL_PENYULANG,
  INITIAL_SECTIONS,
  INITIAL_GANGGUAN,
  INITIAL_ROW,
  INITIAL_ROW_DATA,
  INITIAL_INSPEKSI,
  INITIAL_TIER1,
  INITIAL_TIER2,
  INITIAL_MONITORING,
  INITIAL_MAP_LAYERS,
  INITIAL_ACTIVITIES,
  INITIAL_SAIDI,
  INITIAL_MATERIAL_STOK,
  INITIAL_MATERIAL_PEMAKAIAN,
  INITIAL_ALKER_APD,
  INITIAL_PERINTAH_KERJA,
  INITIAL_MASTER_GARDU,
  INITIAL_PENGUKURAN_GARDU,
  INITIAL_KENDARAAN_OPERASIONAL,
  INITIAL_ASET_JARINGAN,
  INITIAL_JADWAL_PIKET
} from './data/mockData';
import { db, collection, onSnapshot, doc, getDoc, getDocs, setDoc, deleteDoc, query, limit, OperationType, handleFirestoreError, registerDeletedId, filterDeleted } from './lib/firebase';
import { Lock } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PetaPenyulangView } from './components/views/PetaPenyulangView';
import { HealthIndexView } from './components/views/HealthIndexView';
import { GangguanTripView } from './components/views/GangguanTripView';
import { PemeliharaanView } from './components/views/PemeliharaanView';
import { MasterDataView } from './components/views/MasterDataView';
import { SaidiSaifiView } from './components/views/SaidiSaifiView';
import { MaterialView } from './components/views/MaterialView';
import { AlkerApdView } from './components/views/AlkerApdView';
import { UserManagementView } from './components/views/UserManagementView';
import { PerintahKerjaView } from './components/views/PerintahKerjaView';
import { PengukuranGarduView } from './components/views/PengukuranGarduView';
import { KendaraanOperasionalView } from './components/views/KendaraanOperasionalView';
import { AsetJaringanView } from './components/views/AsetJaringanView';
import { JadwalPiketView } from './components/views/JadwalPiketView';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);

  // Active view & navigation state
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Domain data states
  const [penyulangList, setPenyulangList] = useState<Penyulang[]>(() => filterDeleted(INITIAL_PENYULANG));
  const [sectionList, setSectionList] = useState<SectionJaringan[]>(() => filterDeleted(INITIAL_SECTIONS));
  const [gangguanList, setGangguanList] = useState<GangguanLog[]>(() => filterDeleted(INITIAL_GANGGUAN));
  const [rowList, setRowList] = useState<ROWItem[]>(() => filterDeleted(INITIAL_ROW));
  const [tier1List, setTier1List] = useState<Tier1Item[]>(() => filterDeleted(INITIAL_TIER1));
  const [tier2List, setTier2List] = useState<Tier2Item[]>(() => filterDeleted(INITIAL_TIER2));
  
  // Dynamically compute inspeksiList from tier1 and tier2 data
  const inspeksiList = useMemo(() => {
    const combined: InspeksiItem[] = [];
    tier1List.forEach(t1 => {
      combined.push({
        id: t1.id,
        tiangOrGarduId: t1.section || '-',
        tipe: 'Tier 1',
        namaPenyulang: t1.penyulang || '-',
        lokasi: t1.section || '-',
        temuan: t1.konstruksi || t1.temuanRow || '-',
        kondisi: (t1.konstruksi && t1.konstruksi.toLowerCase().includes('retak')) ? 'Berat' : 'Ringan',
        tanggalInspeksi: t1.tanggal,
        petugas: 'Tim Tier 1'
      });
    });
    tier2List.forEach(t2 => {
      combined.push({
        id: t2.id,
        tiangOrGarduId: t2.section || '-',
        tipe: 'Tier 2',
        namaPenyulang: t2.penyulang || '-',
        lokasi: t2.section || '-',
        temuan: t2.temuanThermoUltrasound || t2.jenisTier2 || '-',
        kondisi: 'Berat',
        tanggalInspeksi: t2.tanggal,
        petugas: 'Tim Tier 2'
      });
    });
    return combined.length > 0 ? combined : filterDeleted(INITIAL_INSPEKSI);
  }, [tier1List, tier2List]);

  const [monitoringList, setMonitoringList] = useState<MonitoringPemeliharaanItem[]>(() => filterDeleted(INITIAL_MONITORING));
  const [mapLayers, setMapLayers] = useState<MapLayerItem[]>(() => filterDeleted(INITIAL_MAP_LAYERS));
  const [activities, setActivities] = useState<ActivityLog[]>(() => filterDeleted(INITIAL_ACTIVITIES));
  const [saidiList, setSaidiList] = useState<SaidiSaifiData[]>(() => filterDeleted(INITIAL_SAIDI));
  
  // Material & Alker APD States
  const [stokList, setStokList] = useState<MaterialStokItem[]>(() => filterDeleted(INITIAL_MATERIAL_STOK));
  const [pemakaianList, setPemakaianList] = useState<MaterialPemakaianItem[]>(() => filterDeleted(INITIAL_MATERIAL_PEMAKAIAN));
  const [alkerApdList, setAlkerApdList] = useState<AlkerApdItem[]>(() => filterDeleted(INITIAL_ALKER_APD));
  
  // Perintah Kerja Harian (SPK) State
  const [spkList, setSpkList] = useState<PerintahKerja[]>(() => filterDeleted(INITIAL_PERINTAH_KERJA));

  // Master Gardu & Pengukuran Gardu States
  const [masterGarduList, setMasterGarduList] = useState<MasterGardu[]>(() => filterDeleted(INITIAL_MASTER_GARDU));
  const [pengukuranList, setPengukuranList] = useState<PengukuranGardu[]>(() => filterDeleted(INITIAL_PENGUKURAN_GARDU));

  // Monitoring Kendaraan Operasional State
  const [kendaraanList, setKendaraanList] = useState<KendaraanOperasional[]>(() => filterDeleted(INITIAL_KENDARAAN_OPERASIONAL));
  const [asetJaringanList, setAsetJaringanList] = useState<AsetJaringan[]>(() => filterDeleted(INITIAL_ASET_JARINGAN));
  const [jadwalPiketList, setJadwalPiketList] = useState<JadwalPiket[]>(() => filterDeleted(INITIAL_JADWAL_PIKET));

  // User Management State (RBAC)
  const [usersList, setUsersList] = useState<User[]>(() => filterDeleted([
    { id: 'usr_1', username: 'koordinator_baguala', name: 'Bpk. Ahmad Fauzi', role: 'Koordinator', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'usr_2', username: 'admin_teknik_1', name: 'Sdr. Rizky Ramadhan', role: 'Admin Teknik', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'usr_3', username: 'bagian_teknik', name: 'Sdr. Hendra Pratama', role: 'Bagian Teknik', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'usr_4', username: 'tl_baguala', name: 'Sdr. Samuel Leimena', role: 'Team Leader', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { id: 'usr_5', username: 'manager_ulp', name: 'Bpk. Daniel Wattimena', role: 'Manager ULP', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { id: 'usr_6', username: 'keandalan_up3', name: 'Tim Keandalan UP3 Ambon', role: 'UP3', unit: 'UP3 Ambon', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { id: 'usr_7', username: 'distribusi_uiw', name: 'Divisi Distribusi UIW MMU', role: 'UIW', unit: 'UIW MMU', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
    { id: 'usr_8', username: 'pln_nusadaya', name: 'Monitoring PLN Nusadaya', role: 'PLN Nusadaya', unit: 'PLN Nusadaya', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
  ]));

  // REALTIME FIRESTORE SYNCHRONIZATION
  useEffect(() => {
    const checkAndSeed = async () => {
      // 1. Check local storage first
      if (localStorage.getItem('perangpadam_seeded') === 'true') {
        console.log('Database already seeded (verified by client local cache)');
        return;
      }

      try {
        const seedRef = doc(db, 'system_metadata', 'seeding');
        const seedSnap = await getDoc(seedRef);
        
        if (seedSnap.exists()) {
          console.log('Database already seeded (verified by cloud metadata)');
          localStorage.setItem('perangpadam_seeded', 'true');
          return;
        }

        // Double check if any actual data collection is already populated to avoid overwriting existing data
        const testSnap = await getDocs(query(collection(db, 'penyulang_list'), limit(1)));
        if (!testSnap.empty) {
          console.log('Database collections already contain data. Skipping seeding and establishing seeding flag.');
          await setDoc(seedRef, { seeded: true, timestamp: Date.now() });
          localStorage.setItem('perangpadam_seeded', 'true');
          return;
        }

        console.log('Initial startup: Seeding database with default records...');

        // Seed default users
        const defaultUsers = [
          { id: 'usr_1', username: 'koordinator_baguala', name: 'Bpk. Ahmad Fauzi', role: 'Koordinator', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_2', username: 'admin_teknik_1', name: 'Sdr. Rizky Ramadhan', role: 'Admin Teknik', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_3', username: 'bagian_teknik', name: 'Sdr. Hendra Pratama', role: 'Bagian Teknik', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_4', username: 'tl_baguala', name: 'Sdr. Samuel Leimena', role: 'Team Leader', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_5', username: 'manager_ulp', name: 'Bpk. Daniel Wattimena', role: 'Manager ULP', unit: 'ULP Baguala', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_6', username: 'keandalan_up3', name: 'Tim Keandalan UP3 Ambon', role: 'UP3', unit: 'UP3 Ambon', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_7', username: 'distribusi_uiw', name: 'Divisi Distribusi UIW MMU', role: 'UIW', unit: 'UIW MMU', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_8', username: 'pln_nusadaya', name: 'Monitoring PLN Nusadaya', role: 'PLN Nusadaya', unit: 'PLN Nusadaya', status: 'Aktif', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
        ];
        for (const item of defaultUsers) {
          await setDoc(doc(db, 'app_users', item.id), item);
        }

        // Seed penyulang
        for (const item of INITIAL_PENYULANG) {
          await setDoc(doc(db, 'penyulang_list', item.id), item);
        }

        // Seed sections
        for (const item of INITIAL_SECTIONS) {
          await setDoc(doc(db, 'section_list', item.id), item);
        }

        // Seed map layers
        for (const item of INITIAL_MAP_LAYERS) {
          const firestoreDoc = {
            ...item,
            coordinates: item.coordinates.map((c) => ({ lat: c[0], lng: c[1] }))
          };
          await setDoc(doc(db, 'map_layers', item.id), firestoreDoc);
        }

        // Seed material stok
        for (const item of INITIAL_MATERIAL_STOK) {
          await setDoc(doc(db, 'material_stok', item.id), item);
        }

        // Seed material pemakaian
        for (const item of INITIAL_MATERIAL_PEMAKAIAN) {
          await setDoc(doc(db, 'material_pemakaian', item.id), item);
        }

        // Seed APD & alat kerja
        for (const item of INITIAL_ALKER_APD) {
          await setDoc(doc(db, 'alkerdan_apd', item.id), item);
        }

        // Seed gangguan logs
        for (const item of INITIAL_GANGGUAN) {
          await setDoc(doc(db, 'gangguan_logs', item.id), item);
        }

        // Seed SAIDI / SAIFI
        for (const item of INITIAL_SAIDI) {
          await setDoc(doc(db, 'saidi_saifi_logs', item.id), item);
        }

        // Seed activity logs
        for (const item of INITIAL_ACTIVITIES) {
          await setDoc(doc(db, 'activity_logs', item.id), item);
        }

        // Seed pemeliharaan ROW
        const combinedRow = [...INITIAL_ROW, ...INITIAL_ROW_DATA];
        for (const item of combinedRow) {
          await setDoc(doc(db, 'pemeliharaan_row', item.id), item);
        }

        // Seed pemeliharaan tier 1
        for (const item of INITIAL_TIER1) {
          await setDoc(doc(db, 'pemeliharaan_tier1', item.id), item);
        }

        // Seed pemeliharaan tier 2
        for (const item of INITIAL_TIER2) {
          await setDoc(doc(db, 'pemeliharaan_tier2', item.id), item);
        }

        // Seed pemeliharaan monitoring
        for (const item of INITIAL_MONITORING) {
          await setDoc(doc(db, 'pemeliharaan_monitoring', item.id), item);
        }

        // Seed perintah kerja harian
        for (const item of INITIAL_PERINTAH_KERJA) {
          await setDoc(doc(db, 'perintah_kerja_harian', item.id), item);
        }

        // Seed kendaraan operasional
        for (const item of INITIAL_KENDARAAN_OPERASIONAL) {
          await setDoc(doc(db, 'kendaraan_operasional', item.id), item);
        }

        // Seed aset jaringan
        for (const item of INITIAL_ASET_JARINGAN) {
          await setDoc(doc(db, 'aset_jaringan', item.id), item);
        }

        // Seed jadwal piket
        for (const item of INITIAL_JADWAL_PIKET) {
          await setDoc(doc(db, 'jadwal_piket', item.id), item);
        }

        await setDoc(seedRef, { seeded: true, timestamp: Date.now() });
        localStorage.setItem('perangpadam_seeded', 'true');
        console.log('Seeding completed successfully!');
      } catch (err) {
        console.error('Error in checkAndSeed:', err);
      }
    };

    checkAndSeed();

    // 1. Sync Material Stok Masuk
    const unsubStok = onSnapshot(collection(db, 'material_stok'), (snapshot) => {
      const items: MaterialStokItem[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as MaterialStokItem));
      setStokList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'material_stok');
    });

    // 2. Sync Material Pemakaian
    const unsubPemakaian = onSnapshot(collection(db, 'material_pemakaian'), (snapshot) => {
      const items: MaterialPemakaianItem[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as MaterialPemakaianItem));
      setPemakaianList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'material_pemakaian');
    });

    // 3. Sync Alat Kerja & APD
    const unsubAlker = onSnapshot(collection(db, 'alkerdan_apd'), (snapshot) => {
      const items: AlkerApdItem[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as AlkerApdItem));
      setAlkerApdList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'alkerdan_apd');
    });

    // 4. Sync Gangguan Logs
    const unsubGangguan = onSnapshot(collection(db, 'gangguan_logs'), (snapshot) => {
      const items: GangguanLog[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as GangguanLog));
      setGangguanList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gangguan_logs');
    });

    // 5. Sync SAIDI/SAIFI
    const unsubSaidi = onSnapshot(collection(db, 'saidi_saifi_logs'), (snapshot) => {
      const items: SaidiSaifiData[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as SaidiSaifiData));
      setSaidiList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'saidi_saifi_logs');
    });

    // 6. Sync Users list
    const unsubUsers = onSnapshot(collection(db, 'app_users'), (snapshot) => {
      const items: User[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as User));
      setUsersList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'app_users');
    });

    // 7. Sync Penyulang List
    const unsubPenyulang = onSnapshot(collection(db, 'penyulang_list'), (snapshot) => {
      const items: Penyulang[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as Penyulang));
      setPenyulangList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'penyulang_list');
    });

    // 8. Sync Section List
    const unsubSection = onSnapshot(collection(db, 'section_list'), (snapshot) => {
      const items: SectionJaringan[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as SectionJaringan));
      setSectionList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'section_list');
    });

    // 9. Sync Map Layers
    const unsubMapLayers = onSnapshot(collection(db, 'map_layers'), (snapshot) => {
      const items: MapLayerItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const item: MapLayerItem = {
          ...data,
          id: data.id,
          nama: data.nama,
          tiangCount: data.tiangCount,
          ruteLength: data.ruteLength,
          tanggalImport: data.tanggalImport,
          kategori: data.kategori,
          visible: data.visible,
          color: data.color,
          coordinates: (data.coordinates || []).map((c: any) => [c.lat, c.lng] as [number, number])
        } as MapLayerItem;
        items.push(item);
      });
      setMapLayers(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'map_layers');
    });

    // 10. Sync Activity Logs
    const unsubActivities = onSnapshot(collection(db, 'activity_logs'), (snapshot) => {
      const items: ActivityLog[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as ActivityLog));
      setActivities(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activity_logs');
    });

    // 11. Sync Pemeliharaan ROW
    const unsubRow = onSnapshot(collection(db, 'pemeliharaan_row'), (snapshot) => {
      const items: ROWItem[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as ROWItem));
      setRowList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pemeliharaan_row');
    });

    // 12. Sync Inspeksi / Tier 1
    const unsubTier1 = onSnapshot(collection(db, 'pemeliharaan_tier1'), (snapshot) => {
      const items: Tier1Item[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as Tier1Item));
      setTier1List(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pemeliharaan_tier1');
    });

    // 13. Sync Inspeksi / Tier 2
    const unsubTier2 = onSnapshot(collection(db, 'pemeliharaan_tier2'), (snapshot) => {
      const items: Tier2Item[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as Tier2Item));
      setTier2List(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pemeliharaan_tier2');
    });

    // 14. Sync Pemeliharaan Monitoring
    const unsubMonitoring = onSnapshot(collection(db, 'pemeliharaan_monitoring'), (snapshot) => {
      const items: MonitoringPemeliharaanItem[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as MonitoringPemeliharaanItem));
      setMonitoringList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pemeliharaan_monitoring');
    });

    // 15. Sync Perintah Kerja Harian (SPK)
    const unsubSpk = onSnapshot(collection(db, 'perintah_kerja_harian'), (snapshot) => {
      const items: PerintahKerja[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as PerintahKerja));
      setSpkList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'perintah_kerja_harian');
    });

    // 16. Sync Kendaraan Operasional
    const unsubKendaraan = onSnapshot(collection(db, 'kendaraan_operasional'), (snapshot) => {
      const items: KendaraanOperasional[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as KendaraanOperasional));
      setKendaraanList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'kendaraan_operasional');
    });

    // 17. Sync Master Gardu
    const unsubMasterGardu = onSnapshot(collection(db, 'master_gardu'), (snapshot) => {
      const items: MasterGardu[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as MasterGardu));
      setMasterGarduList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'master_gardu');
    });

    // 18. Sync Pengukuran Gardu
    const unsubPengukuran = onSnapshot(collection(db, 'pengukuran_gardu'), (snapshot) => {
      const items: PengukuranGardu[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as PengukuranGardu));
      setPengukuranList(filterDeleted(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pengukuran_gardu');
    });

    // Aset Jaringan Sync
    const unsubscribeAset = onSnapshot(collection(db, 'aset_jaringan'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AsetJaringan));
      setAsetJaringanList(filterDeleted(list));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'aset_jaringan'));

    // Jadwal Piket Sync
    const unsubscribeJadwal = onSnapshot(collection(db, 'jadwal_piket'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JadwalPiket));
      setJadwalPiketList(filterDeleted(list));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'jadwal_piket'));

    return () => {
      unsubStok();
      unsubPemakaian();
      unsubAlker();
      unsubGangguan();
      unsubSaidi();
      unsubUsers();
      unsubPenyulang();
      unsubSection();
      unsubMapLayers();
      unsubActivities();
      unsubRow();
      unsubTier1();
      unsubTier2();
      unsubMonitoring();
      unsubSpk();
      unsubKendaraan();
      unsubMasterGardu();
      unsubPengukuran();
      unsubscribeAset();
      unsubscribeJadwal();
    };
  }, []);

  // Helper to append log
  const logActivity = async (aktivitas: string, modul: string) => {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      waktu: new Date().toLocaleString('id-ID'),
      user: user ? user.name : 'Operator SCADA',
      aktivitas,
      modul
    };
    try {
      await setDoc(doc(db, 'activity_logs', newLog.id), newLog);
    } catch (err) {
      console.error('Error saving activity log to Firestore:', err);
    }
  };

  // Login handler
  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    logActivity(`User ${authenticatedUser.name} berhasil login ke sistem PLN ULP Baguala`, 'Sistem Auth');
  };

  // Logout handler
  const handleLogout = () => {
    if (user) {
      logActivity(`User ${user.name} logout`, 'Sistem Auth');
    }
    setUser(null);
  };

  // Handlers for Map Layers
  const handleToggleMapLayer = async (id: string) => {
    const layer = mapLayers.find((l) => l.id === id);
    if (layer) {
      const updated = { ...layer, visible: !layer.visible };
      setMapLayers((prev) =>
        prev.map((l) => (l.id === id ? updated : l))
      );
      try {
        const firestoreDoc = {
          ...updated,
          coordinates: updated.coordinates.map((c) => ({ lat: c[0], lng: c[1] }))
        };
        await setDoc(doc(db, 'map_layers', id), firestoreDoc);
      } catch (err) {
        console.error('Error toggling map layer in Firestore:', err);
      }
    }
  };

  const handleDeleteMapLayer = async (id: string) => {
    setMapLayers((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteDoc(doc(db, 'map_layers', id));
      logActivity('Menghapus layer peta GIS feeder import', 'Peta Feeder');
    } catch (err) {
      console.error('Error deleting map layer from Firestore:', err);
    }
  };

  const handleAddMapLayer = async (layer: MapLayerItem) => {
    setMapLayers((prev) => [layer, ...prev]);
    try {
      const firestoreDoc = {
        ...layer,
        coordinates: layer.coordinates.map((c) => ({ lat: c[0], lng: c[1] }))
      };
      await setDoc(doc(db, 'map_layers', layer.id), firestoreDoc);
      logActivity(`Mengimpor peta feeder baru: ${layer.nama}`, 'Peta Feeder');
    } catch (err) {
      console.error('Error adding map layer to Firestore:', err);
    }
  };

  const handleUpdateMapLayer = async (updatedLayer: MapLayerItem) => {
    setMapLayers((prev) => prev.map((l) => (l.id === updatedLayer.id ? updatedLayer : l)));
    try {
      const firestoreDoc = {
        ...updatedLayer,
        coordinates: updatedLayer.coordinates.map((c) => ({ lat: c[0], lng: c[1] }))
      };
      await setDoc(doc(db, 'map_layers', updatedLayer.id), firestoreDoc);
      logActivity(`Mengubah file layer peta GIS: ${updatedLayer.nama}`, 'Peta Feeder');
    } catch (err) {
      console.error('Error updating map layer in Firestore:', err);
    }
  };

  // Synchronized Penyulang List computed directly from gangguan_logs
  const syncedPenyulangList = React.useMemo(() => {
    return penyulangList.map((p) => {
      const feederLogs = gangguanList.filter(
        (g) =>
          g.penyulangId === p.id ||
          (g.namaPenyulang && g.namaPenyulang.trim().toUpperCase() === p.namaPenyulang.trim().toUpperCase())
      );

      const frekuensiGangguan = feederLogs.length;

      let healthIndexStatus: 'Sempurna' | 'Sehat' | 'Sakit' | 'Kronis' = 'Sempurna';
      if (frekuensiGangguan === 0) healthIndexStatus = 'Sempurna';
      else if (frekuensiGangguan <= 3) healthIndexStatus = 'Sehat';
      else if (frekuensiGangguan <= 6) healthIndexStatus = 'Sakit';
      else healthIndexStatus = 'Kronis';

      const sortedLogs = [...feederLogs].sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
      const latestLog = sortedLogs[0];
      let gangguanTerakhir = '';
      if (latestLog) {
        const kodeDisplay = latestLog.kodeGangguan === 'E-5' ? 'Tidak Ditemukan' : (latestLog.kodeGangguan || '-');
        gangguanTerakhir = `${latestLog.tanggal} (${kodeDisplay})`;
      }

      let sectionTerlama = p.sectionTerlama || '';
      if (sortedLogs.length > 0) {
        const secCounts: Record<string, number> = {};
        sortedLogs.forEach((g) => {
          if (g.section && g.section.trim()) {
            secCounts[g.section.trim()] = (secCounts[g.section.trim()] || 0) + 1;
          }
        });
        let maxSec = '';
        let maxCnt = 0;
        Object.entries(secCounts).forEach(([sec, cnt]) => {
          if (cnt > maxCnt) {
            maxCnt = cnt;
            maxSec = sec;
          }
        });
        sectionTerlama = maxSec || sortedLogs[0].section || p.sectionTerlama || '';
      }

      return {
        ...p,
        frekuensiGangguan,
        healthIndexStatus,
        sectionTerlama,
        gangguanTerakhir
      };
    });
  }, [penyulangList, gangguanList]);

  // Handlers for Gangguan (Cloud Firestore synced)
  const handleAddGangguan = async (log: GangguanLog) => {
    setGangguanList((prev) => {
      const exists = prev.some((g) => g.id === log.id);
      if (exists) {
        return prev.map((g) => (g.id === log.id ? log : g));
      }
      return [log, ...prev];
    });

    try {
      await setDoc(doc(db, 'gangguan_logs', log.id), log);
      
      // Recalculate health index for the affected feeder and save to Firestore
      const affectedPenyulang = penyulangList.find(
        (p) => p.id === log.penyulangId || (log.namaPenyulang && p.namaPenyulang.toUpperCase() === log.namaPenyulang.toUpperCase())
      );
      if (affectedPenyulang) {
        const updatedLogs = [...gangguanList.filter((g) => g.id !== log.id), log].filter(
          (g) => g.penyulangId === affectedPenyulang.id || (g.namaPenyulang && g.namaPenyulang.trim().toUpperCase() === affectedPenyulang.namaPenyulang.trim().toUpperCase())
        );
        const newFreq = updatedLogs.length;
        let newStatus: 'Sempurna' | 'Sehat' | 'Sakit' | 'Kronis' = 'Sempurna';
        if (newFreq === 0) newStatus = 'Sempurna';
        else if (newFreq <= 3) newStatus = 'Sehat';
        else if (newFreq <= 6) newStatus = 'Sakit';
        else newStatus = 'Kronis';

        const sortedLogs = [...updatedLogs].sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
        const latestLog = sortedLogs[0];
        const kodeDisplay = latestLog ? (latestLog.kodeGangguan === 'E-5' ? 'Tidak Ditemukan' : latestLog.kodeGangguan) : '';
        const gangguanTerakhir = latestLog ? `${latestLog.tanggal} (${kodeDisplay})` : '';

        const updatedPenyulang = {
          ...affectedPenyulang,
          frekuensiGangguan: newFreq,
          healthIndexStatus: newStatus,
          sectionTerlama: log.section || affectedPenyulang.sectionTerlama,
          gangguanTerakhir
        };

        await setDoc(doc(db, 'penyulang_list', updatedPenyulang.id), updatedPenyulang);
      }
    } catch (err) {
      console.error('Error saving Gangguan to Firestore:', err);
    }

    logActivity(`Menyimpan log gangguan trip penyulang ${log.namaPenyulang} (${log.kodeGangguan})`, 'Matriks Gangguan');
  };

  const handleDeleteGangguan = async (id: string) => {
    registerDeletedId(id);
    const logToDelete = gangguanList.find((g) => g.id === id);
    setGangguanList((prev) => prev.filter((g) => g.id !== id));
    try {
      await deleteDoc(doc(db, 'gangguan_logs', id));
      
      if (logToDelete) {
        const affectedPenyulang = penyulangList.find(
          (p) => p.id === logToDelete.penyulangId || (logToDelete.namaPenyulang && p.namaPenyulang.toUpperCase() === logToDelete.namaPenyulang.toUpperCase())
        );
        if (affectedPenyulang) {
          const remainingLogs = gangguanList.filter(
            (g) => g.id !== id && (g.penyulangId === affectedPenyulang.id || (g.namaPenyulang && g.namaPenyulang.trim().toUpperCase() === affectedPenyulang.namaPenyulang.trim().toUpperCase()))
          );
          const newFreq = remainingLogs.length;
          let newStatus: 'Sempurna' | 'Sehat' | 'Sakit' | 'Kronis' = 'Sempurna';
          if (newFreq === 0) newStatus = 'Sempurna';
          else if (newFreq <= 3) newStatus = 'Sehat';
          else if (newFreq <= 6) newStatus = 'Sakit';
          else newStatus = 'Kronis';

          const sortedLogs = [...remainingLogs].sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
          const latestLog = sortedLogs[0];
          const kodeDisplay = latestLog ? (latestLog.kodeGangguan === 'E-5' ? 'Tidak Ditemukan' : latestLog.kodeGangguan) : '';
          const gangguanTerakhir = latestLog ? `${latestLog.tanggal} (${kodeDisplay})` : '';

          const updatedPenyulang = {
            ...affectedPenyulang,
            frekuensiGangguan: newFreq,
            healthIndexStatus: newStatus,
            gangguanTerakhir
          };
          await setDoc(doc(db, 'penyulang_list', updatedPenyulang.id), updatedPenyulang);
        }
      }
    } catch (err) {
      console.error('Error deleting Gangguan from Firestore:', err);
    }
    logActivity('Menghapus log gangguan penyulang', 'Matriks Gangguan');
  };

  // Handlers for Master Data
  const handleAddPenyulang = async (p: Penyulang) => {
    const isEdit = penyulangList.some((item) => item.id === p.id);
    setPenyulangList((prev) => {
      const exists = prev.some((item) => item.id === p.id);
      if (exists) {
        return prev.map((item) => (item.id === p.id ? p : item));
      }
      return [p, ...prev];
    });
    try {
      await setDoc(doc(db, 'penyulang_list', p.id), p);
      logActivity(
        isEdit
          ? `Mengubah data master penyulang: ${p.namaPenyulang} (${p.kodeId})`
          : `Menambah penyulang baru: ${p.namaPenyulang} (${p.kodeId})`,
        'Master Data'
      );
    } catch (err) {
      console.error('Error saving Penyulang to Firestore:', err);
    }
  };

  const handleDeletePenyulang = async (id: string) => {
    registerDeletedId(id);
    setPenyulangList((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'penyulang_list', id));
      logActivity('Menghapus data master penyulang', 'Master Data');
    } catch (err) {
      console.error('Error deleting Penyulang from Firestore:', err);
    }
  };

  const handleAddSection = async (s: SectionJaringan) => {
    const isEdit = sectionList.some((item) => item.id === s.id);
    setSectionList((prev) => {
      const exists = prev.some((item) => item.id === s.id);
      if (exists) {
        return prev.map((item) => (item.id === s.id ? s : item));
      }
      return [s, ...prev];
    });
    try {
      await setDoc(doc(db, 'section_list', s.id), s);
      logActivity(
        isEdit
          ? `Mengubah data master section jaringan: ${s.namaSection}`
          : `Menambah section baru: ${s.namaSection}`,
        'Master Data'
      );
    } catch (err) {
      console.error('Error saving Section to Firestore:', err);
    }
  };

  const handleDeleteSection = async (id: string) => {
    registerDeletedId(id);
    setSectionList((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'section_list', id));
      logActivity('Menghapus data section jaringan', 'Master Data');
    } catch (err) {
      console.error('Error deleting Section from Firestore:', err);
    }
  };

  // Handlers for SAIDI / SAIFI (Cloud Firestore synced)
  const handleAddSaidi = async (data: SaidiSaifiData) => {
    setSaidiList((prev) => [data, ...prev]);
    try {
      await setDoc(doc(db, 'saidi_saifi_logs', data.id), data);
    } catch (err) {
      console.error('Error saving SAIDI to Firestore:', err);
    }
    logActivity(`Memperbarui data SAIDI/SAIFI & ENS bulan ${data.bulan} ${data.tahun}`, 'SAIDI/SAIFI');
  };

  const handleDeleteSaidi = async (id: string) => {
    registerDeletedId(id);
    setSaidiList((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'saidi_saifi_logs', id));
    } catch (err) {
      console.error('Error deleting SAIDI from Firestore:', err);
    }
    logActivity('Menghapus data rekap SAIDI/SAIFI', 'SAIDI/SAIFI');
  };

  // Handlers for Material Stok Masuk
  const handleAddStok = async (item: MaterialStokItem) => {
    setStokList((prev) => [item, ...prev]);
    try {
      await setDoc(doc(db, 'material_stok', item.id), item);
    } catch (err) {
      console.error('Error saving Material Stok to Firestore:', err);
    }
    logActivity(`Menambah stok masuk material: ${item.namaMaterial} (${item.qty} ${item.satuan})`, 'Manajemen Material');
  };

  const handleUpdateStok = async (item: MaterialStokItem) => {
    setStokList((prev) => prev.map((s) => (s.id === item.id ? item : s)));
    try {
      await setDoc(doc(db, 'material_stok', item.id), item);
    } catch (err) {
      console.error('Error updating Material Stok in Firestore:', err);
    }
    logActivity(`Memperbarui stok masuk material: ${item.namaMaterial}`, 'Manajemen Material');
  };

  const handleDeleteStok = async (id: string) => {
    registerDeletedId(id);
    setStokList((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'material_stok', id));
    } catch (err) {
      console.error('Error deleting Material Stok from Firestore:', err);
    }
    logActivity('Menghapus data stok masuk material', 'Manajemen Material');
  };

  // Handlers for Material Pemakaian
  const handleAddPemakaian = async (item: MaterialPemakaianItem) => {
    setPemakaianList((prev) => [item, ...prev]);
    try {
      await setDoc(doc(db, 'material_pemakaian', item.id), item);
    } catch (err) {
      console.error('Error saving Pemakaian Material to Firestore:', err);
    }
    logActivity(`Catat pemakaian material: ${item.namaMaterial} (${item.qty} ${item.satuan}) di ${item.lokasi}`, 'Manajemen Material');
  };

  const handleUpdatePemakaian = async (item: MaterialPemakaianItem) => {
    setPemakaianList((prev) => prev.map((p) => (p.id === item.id ? item : p)));
    try {
      await setDoc(doc(db, 'material_pemakaian', item.id), item);
    } catch (err) {
      console.error('Error updating Pemakaian Material in Firestore:', err);
    }
    logActivity(`Memperbarui log pemakaian material: ${item.namaMaterial}`, 'Manajemen Material');
  };

  const handleDeletePemakaian = async (id: string) => {
    registerDeletedId(id);
    setPemakaianList((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'material_pemakaian', id));
    } catch (err) {
      console.error('Error deleting Pemakaian Material from Firestore:', err);
    }
    logActivity('Menghapus log pemakaian material', 'Manajemen Material');
  };

  // Handlers for Alat Kerja dan APD
  const handleAddAlkerApd = async (item: AlkerApdItem) => {
    setAlkerApdList((prev) => [item, ...prev]);
    try {
      await setDoc(doc(db, 'alkerdan_apd', item.id), item);
    } catch (err) {
      console.error('Error saving Alat Kerja / APD to Firestore:', err);
    }
    logActivity(`Menambah inventaris Alker/APD: ${item.namaAlker} (${item.jumlah} unit)`, 'Alat Kerja & APD');
  };

  const handleUpdateAlkerApd = async (item: AlkerApdItem) => {
    setAlkerApdList((prev) => prev.map((a) => (a.id === item.id ? item : a)));
    try {
      await setDoc(doc(db, 'alkerdan_apd', item.id), item);
    } catch (err) {
      console.error('Error updating Alat Kerja / APD in Firestore:', err);
    }
    logActivity(`Memperbarui data Alker/APD: ${item.namaAlker}`, 'Alat Kerja & APD');
  };

  const handleDeleteAlkerApd = async (id: string) => {
    registerDeletedId(id);
    setAlkerApdList((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'alkerdan_apd', id));
    } catch (err) {
      console.error('Error deleting Alat Kerja / APD from Firestore:', err);
    }
    logActivity('Menghapus data inventaris Alker/APD', 'Alat Kerja & APD');
  };

  // User Management Handlers
  const handleAddUser = async (newUser: User) => {
    setUsersList((prev) => [newUser, ...prev]);
    try {
      const docId = newUser.id || newUser.username;
      await setDoc(doc(db, 'app_users', docId), newUser);
    } catch (err) {
      console.error('Error saving user to Firestore:', err);
    }
    logActivity(`Menambah user baru: ${newUser.name} (${newUser.role})`, 'Kelola User');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUsersList((prev) => prev.map((u) => (u.username === updatedUser.username ? updatedUser : u)));
    try {
      const docId = updatedUser.id || updatedUser.username;
      await setDoc(doc(db, 'app_users', docId), updatedUser);
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
    }
    logActivity(`Memperbarui role/data user: ${updatedUser.name} (${updatedUser.role})`, 'Kelola User');
  };

  const handleDeleteUser = async (idOrUsername: string) => {
    registerDeletedId(idOrUsername);
    setUsersList((prev) => prev.filter((u) => u.id !== idOrUsername && u.username !== idOrUsername));
    try {
      await deleteDoc(doc(db, 'app_users', idOrUsername));
    } catch (err) {
      console.error('Error deleting user from Firestore:', err);
    }
    logActivity('Menghapus user dari sistem', 'Kelola User');
  };

  // Perintah Kerja Harian (SPK) Handlers
  const handleAddSpk = async (newSpk: PerintahKerja) => {
    setSpkList((prev) => [newSpk, ...prev]);
    try {
      await setDoc(doc(db, 'perintah_kerja_harian', newSpk.id), newSpk);
    } catch (err) {
      console.error('Error saving SPK to Firestore:', err);
    }
    logActivity(`Penerbitan SPK baru ${newSpk.noSpk} (${newSpk.jenisPekerjaan})`, newSpk.namaPenyulang);
  };

  const handleUpdateSpk = async (updatedSpk: PerintahKerja) => {
    setSpkList((prev) => prev.map((s) => (s.id === updatedSpk.id ? updatedSpk : s)));
    try {
      await setDoc(doc(db, 'perintah_kerja_harian', updatedSpk.id), updatedSpk);
    } catch (err) {
      console.error('Error updating SPK in Firestore:', err);
    }
    logActivity(`Memperbarui SPK ${updatedSpk.noSpk} -> Status: ${updatedSpk.status}`, updatedSpk.namaPenyulang);
  };

  const handleDeleteSpk = async (id: string) => {
    registerDeletedId(id);
    setSpkList((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'perintah_kerja_harian', id));
    } catch (err) {
      console.error('Error deleting SPK from Firestore:', err);
    }
    logActivity('Menghapus data Surat Perintah Kerja (SPK)', 'Perintah Kerja');
  };

  // Master Gardu Handlers
  const handleAddMasterGardu = async (gardu: MasterGardu) => {
    setMasterGarduList((prev) => {
      const exists = prev.some((g) => g.id === gardu.id);
      if (exists) {
        return prev.map((g) => (g.id === gardu.id ? gardu : g));
      }
      return [gardu, ...prev];
    });
    try {
      await setDoc(doc(db, 'master_gardu', gardu.id), gardu);
    } catch (err) {
      console.error('Error saving Master Gardu to Firestore:', err);
    }
    logActivity(`Memperbarui/Tambah Master Gardu: ${gardu.noGarduBaru} (${gardu.penyulang})`, gardu.penyulang);
  };

  const handleDeleteMasterGardu = async (id: string) => {
    registerDeletedId(id);
    setMasterGarduList((prev) => prev.filter((g) => g.id !== id));
    try {
      await deleteDoc(doc(db, 'master_gardu', id));
    } catch (err) {
      console.error('Error deleting Master Gardu from Firestore:', err);
    }
    logActivity('Menghapus Master Gardu', 'Master Data');
  };

  // Pengukuran Gardu Handlers
  const handleAddPengukuranGardu = async (pkg: PengukuranGardu) => {
    setPengukuranList((prev) => {
      const exists = prev.some((p) => p.id === pkg.id);
      if (exists) {
        return prev.map((p) => (p.id === pkg.id ? pkg : p));
      }
      return [pkg, ...prev];
    });
    try {
      await setDoc(doc(db, 'pengukuran_gardu', pkg.id), pkg);
    } catch (err) {
      console.error('Error saving Pengukuran Gardu to Firestore:', err);
    }
    logActivity(`Input/Edit Pengukuran Gardu: ${pkg.noGardu} (${pkg.tanggalUkur})`, pkg.penyulang);
  };

  const handleDeletePengukuranGardu = async (id: string) => {
    registerDeletedId(id);
    setPengukuranList((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'pengukuran_gardu', id));
    } catch (err) {
      console.error('Error deleting Pengukuran Gardu from Firestore:', err);
    }
    logActivity('Menghapus data pengukuran beban gardu', 'Pengukuran Gardu');
  };

  // Kendaraan Operasional Handlers
  const handleAddKendaraan = async (kendaraan: KendaraanOperasional) => {
    setKendaraanList((prev) => [kendaraan, ...prev]);
    try {
      await setDoc(doc(db, 'kendaraan_operasional', kendaraan.id), kendaraan);
    } catch (err) {
      console.error('Error saving Kendaraan Operasional to Firestore:', err);
    }
    logActivity(`Tambah Kendaraan Operasional: ${kendaraan.namaKendaraan} (${kendaraan.noPolisi})`, 'Kendaraan Operasional');
  };

  const handleUpdateKendaraan = async (kendaraan: KendaraanOperasional) => {
    setKendaraanList((prev) => prev.map((k) => (k.id === kendaraan.id ? kendaraan : k)));
    try {
      await setDoc(doc(db, 'kendaraan_operasional', kendaraan.id), kendaraan);
    } catch (err) {
      console.error('Error updating Kendaraan Operasional to Firestore:', err);
    }
    logActivity(`Update Kendaraan Operasional: ${kendaraan.namaKendaraan} (${kendaraan.noPolisi})`, 'Kendaraan Operasional');
  };

  const handleDeleteKendaraan = async (id: string) => {
    registerDeletedId(id);
    setKendaraanList((prev) => prev.filter((k) => k.id !== id));
    try {
      await deleteDoc(doc(db, 'kendaraan_operasional', id));
    } catch (err) {
      console.error('Error deleting Kendaraan Operasional from Firestore:', err);
    }
    logActivity('Menghapus data Kendaraan Operasional', 'Kendaraan Operasional');
  };

  // Aset Jaringan Handlers
  const handleAddAset = async (data: Omit<AsetJaringan, 'id'>) => {
    const id = `aset-${Date.now()}`;
    const newAset = { id, ...data };
    setAsetJaringanList(prev => [newAset, ...prev]);
    try {
      await setDoc(doc(db, 'aset_jaringan', id), newAset);
    } catch (err) {
      console.error('Error saving Aset Jaringan to Firestore:', err);
    }
    logActivity(`Tambah Aset Jaringan: ${data.namaPenyulang}`, 'Aset Jaringan');
  };

  const handleUpdateAset = async (id: string, data: Partial<AsetJaringan>) => {
    setAsetJaringanList(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    try {
      const docRef = doc(db, 'aset_jaringan', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await setDoc(docRef, { ...snap.data(), ...data });
      }
    } catch (err) {
      console.error('Error updating Aset Jaringan to Firestore:', err);
    }
    logActivity(`Update Aset Jaringan: ${data.namaPenyulang || id}`, 'Aset Jaringan');
  };

  const handleDeleteAset = async (id: string) => {
    registerDeletedId(id);
    setAsetJaringanList(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'aset_jaringan', id));
    } catch (err) {
      console.error('Error deleting Aset Jaringan from Firestore:', err);
    }
    logActivity('Menghapus data Aset Jaringan', 'Aset Jaringan');
  };

  // Jadwal Piket Handlers
  const handleAddJadwal = async (data: Omit<JadwalPiket, 'id'>) => {
    const id = `jp-${Date.now()}`;
    const newJadwal = { id, ...data };
    setJadwalPiketList(prev => [newJadwal, ...prev]);
    try {
      await setDoc(doc(db, 'jadwal_piket', id), newJadwal);
    } catch (err) {
      console.error('Error saving Jadwal Piket to Firestore:', err);
    }
    logActivity(`Tambah Jadwal Piket: ${data.namaPetugas}`, 'Jadwal Piket');
  };

  const handleUpdateJadwal = async (id: string, data: Partial<JadwalPiket>) => {
    setJadwalPiketList(prev => prev.map(j => j.id === id ? { ...j, ...data } : j));
    try {
      const docRef = doc(db, 'jadwal_piket', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await setDoc(docRef, { ...snap.data(), ...data });
      }
    } catch (err) {
      console.error('Error updating Jadwal Piket in Firestore:', err);
    }
    logActivity(`Update Jadwal Piket: ${data.namaPetugas || id}`, 'Jadwal Piket');
  };

  const handleDeleteJadwal = async (id: string) => {
    registerDeletedId(id);
    setJadwalPiketList(prev => prev.filter(j => j.id !== id));
    try {
      await deleteDoc(doc(db, 'jadwal_piket', id));
    } catch (err) {
      console.error('Error deleting Jadwal Piket from Firestore:', err);
    }
    logActivity('Menghapus data Jadwal Piket', 'Jadwal Piket');
  };

  // If not logged in, display Login Screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} usersList={usersList} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Top Header Navigation */}
      <TopHeader
        user={user}
        onLogout={handleLogout}
        activeView={activeView}
        onSelectView={setActiveView}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <Sidebar activeView={activeView} onSelectView={setActiveView} isOpen={sidebarOpen} currentUser={user} />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          {(activeView === 'dashboard' || !activeView) && (
            <DashboardView
              penyulangList={syncedPenyulangList}
              sectionList={sectionList}
              gangguanList={gangguanList}
              rowList={rowList}
              inspeksiList={inspeksiList}
              saidiList={saidiList}
              activities={activities}
              stokList={stokList}
              spkList={spkList}
              onSelectView={setActiveView}
            />
          )}

          {(activeView === 'peta_penyulang' || activeView === 'peta') && (
            <PetaPenyulangView
              layers={mapLayers}
              onToggleLayer={handleToggleMapLayer}
              onDeleteLayer={handleDeleteMapLayer}
              onAddLayer={handleAddMapLayer}
              onUpdateLayer={handleUpdateMapLayer}
            />
          )}

          {activeView === 'health_index' && (
            <HealthIndexView
              penyulangList={syncedPenyulangList}
              gangguanList={gangguanList}
              sectionList={sectionList}
              onAddGangguan={handleAddGangguan}
            />
          )}

          {(activeView === 'matriks_gangguan' || activeView === 'gangguan') && (
            <GangguanTripView
              currentUser={user}
              gangguanList={gangguanList}
              penyulangList={syncedPenyulangList}
              sectionList={sectionList}
              onAddGangguan={handleAddGangguan}
              onDeleteGangguan={handleDeleteGangguan}
            />
          )}

          {(activeView === 'row' ||
            activeView === 'inspeksi_tier1' ||
            activeView === 'inspeksi_tier2' ||
            activeView === 'pemeliharaan_20kv') && (
            <PemeliharaanView
              currentUser={user}
              currentSubView={activeView}
              rowList={rowList}
              tier1List={tier1List}
              tier2List={tier2List}
              monitoringList={monitoringList}
            />
          )}

          {activeView === 'master_data' && (
            <MasterDataView
              penyulangList={syncedPenyulangList}
              sectionList={sectionList}
              activities={activities}
              onAddPenyulang={handleAddPenyulang}
              onDeletePenyulang={handleDeletePenyulang}
              onAddSection={handleAddSection}
              onDeleteSection={handleDeleteSection}
            />
          )}

          {activeView === 'saidi_saifi' && (
            <SaidiSaifiView
              currentUser={user}
              saidiList={saidiList}
              penyulangList={syncedPenyulangList}
              onAddSaidi={handleAddSaidi}
              onDeleteSaidi={handleDeleteSaidi}
            />
          )}

          {activeView === 'material' && (
            <MaterialView
              currentUser={user}
              stokList={stokList}
              pemakaianList={pemakaianList}
              onAddStok={handleAddStok}
              onUpdateStok={handleUpdateStok}
              onDeleteStok={handleDeleteStok}
              onAddPemakaian={handleAddPemakaian}
              onUpdatePemakaian={handleUpdatePemakaian}
              onDeletePemakaian={handleDeletePemakaian}
            />
          )}

          {activeView === 'alker_apd' && (
            <AlkerApdView
              currentUser={user}
              alkerApdList={alkerApdList}
              onAddAlkerApd={handleAddAlkerApd}
              onUpdateAlkerApd={handleUpdateAlkerApd}
              onDeleteAlkerApd={handleDeleteAlkerApd}
            />
          )}

          {activeView === 'kendaraan_operasional' && (
            <KendaraanOperasionalView
              currentUser={user}
              kendaraanList={kendaraanList}
              onAddKendaraan={handleAddKendaraan}
              onUpdateKendaraan={handleUpdateKendaraan}
              onDeleteKendaraan={handleDeleteKendaraan}
            />
          )}

          {activeView === 'aset_jaringan' && (
            <AsetJaringanView
              asetList={asetJaringanList}
              penyulangList={penyulangList}
              onAdd={handleAddAset}
              onUpdate={handleUpdateAset}
              onDelete={handleDeleteAset}
            />
          )}

          {activeView === 'jadwal_piket' && (
            <JadwalPiketView
              jadwalList={jadwalPiketList}
              onAdd={handleAddJadwal}
              onUpdate={handleUpdateJadwal}
              onDelete={handleDeleteJadwal}
            />
          )}

          {activeView === 'perintah_kerja' && (
            <PerintahKerjaView
              currentUser={user}
              spkList={spkList}
              penyulangList={syncedPenyulangList}
              sectionList={sectionList}
              onAddSpk={handleAddSpk}
              onUpdateSpk={handleUpdateSpk}
              onDeleteSpk={handleDeleteSpk}
            />
          )}

          {activeView === 'pengukuran_gardu' && (
            <PengukuranGarduView
              currentUser={user}
              pengukuranList={pengukuranList}
              masterGarduList={masterGarduList}
              penyulangList={syncedPenyulangList}
              onAddPengukuran={handleAddPengukuranGardu}
              onDeletePengukuran={handleDeletePengukuranGardu}
              onAddGardu={handleAddMasterGardu}
              onDeleteGardu={handleDeleteMasterGardu}
            />
          )}

          {activeView === 'kelola_user' && (
            user.role === 'Koordinator' ? (
              <UserManagementView
                currentUser={user}
                usersList={usersList}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onSwitchUserRole={(switchedUser) => {
                  setUser(switchedUser);
                  logActivity(`Switch mode/role sebagai: ${switchedUser.name} (${switchedUser.role})`, 'Simulasi RBAC');
                }}
              />
            ) : (
              <div className="p-12 text-center max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm mt-12 font-sans">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Akses Ditolak</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Menu Kelola User & Hak Akses hanya dapat diakses oleh pengguna dengan role <strong>Koordinator</strong>.
                </p>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
