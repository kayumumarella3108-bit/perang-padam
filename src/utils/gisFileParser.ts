import JSZip from 'jszip';
import { PohonGisItem, KonstruksiGisItem } from '../types';

export interface RawGisFeature {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  coordinates?: [number, number][]; // for lines/polygons
  properties: Record<string, any>;
}

// Clean and extract string text from XML node
function getNodeText(parent: Element, tag: string): string {
  const node = parent.getElementsByTagName(tag)[0];
  return node ? (node.textContent || '').trim() : '';
}

// Extract extended data attributes from KML Placemark
function extractExtendedData(placemark: Element): Record<string, string> {
  const props: Record<string, string> = {};
  const dataNodes = placemark.getElementsByTagName('Data');
  for (let i = 0; i < dataNodes.length; i++) {
    const d = dataNodes[i];
    const name = d.getAttribute('name') || '';
    const val = getNodeText(d, 'value');
    if (name) props[name.toLowerCase()] = val;
  }
  const simpleNodes = placemark.getElementsByTagName('SimpleData');
  for (let i = 0; i < simpleNodes.length; i++) {
    const d = simpleNodes[i];
    const name = d.getAttribute('name') || '';
    const val = (d.textContent || '').trim();
    if (name) props[name.toLowerCase()] = val;
  }
  return props;
}

// Parse KML text into raw GIS features
export function parseKmlFeatures(kmlText: string): RawGisFeature[] {
  const features: RawGisFeature[] = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
    const placemarks = xmlDoc.getElementsByTagName('Placemark');

    for (let i = 0; i < placemarks.length; i++) {
      const p = placemarks[i];
      const name = getNodeText(p, 'name') || `Titik ${i + 1}`;
      const desc = getNodeText(p, 'description');
      const extProps = extractExtendedData(p);

      // Coordinates
      const coordNode = p.getElementsByTagName('coordinates')[0];
      if (!coordNode || !coordNode.textContent) continue;

      const rawCoords = coordNode.textContent.trim().split(/\s+/);
      const parsedCoords: [number, number][] = [];

      for (const item of rawCoords) {
        const parts = item.split(',');
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0]);
          const lat = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            parsedCoords.push([lat, lng]);
          }
        }
      }

      if (parsedCoords.length > 0) {
        features.push({
          name,
          description: desc,
          lat: parsedCoords[0][0],
          lng: parsedCoords[0][1],
          coordinates: parsedCoords.length > 1 ? parsedCoords : undefined,
          properties: extProps
        });
      }
    }
  } catch (err) {
    console.error('Error parsing KML XML:', err);
  }
  return features;
}

// Parse GeoJSON text into raw GIS features
export function parseGeoJsonFeatures(jsonText: string): RawGisFeature[] {
  const features: RawGisFeature[] = [];
  try {
    const data = JSON.parse(jsonText);
    const rawList = data.type === 'FeatureCollection' ? data.features : (Array.isArray(data) ? data : [data]);

    for (let i = 0; i < rawList.length; i++) {
      const feat = rawList[i];
      const geom = feat.geometry || feat;
      const props = feat.properties || {};
      const name = props.name || props.Nama || props.lokasi || props.title || `Titik ${i + 1}`;

      if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
        const lng = Number(geom.coordinates[0]);
        const lat = Number(geom.coordinates[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          features.push({
            name,
            lat,
            lng,
            properties: props
          });
        }
      } else if ((geom.type === 'LineString' || geom.type === 'MultiPoint') && Array.isArray(geom.coordinates)) {
        const coords: [number, number][] = [];
        for (const pt of geom.coordinates) {
          const lng = Number(pt[0]);
          const lat = Number(pt[1]);
          if (!isNaN(lat) && !isNaN(lng)) coords.push([lat, lng]);
        }
        if (coords.length > 0) {
          features.push({
            name,
            lat: coords[0][0],
            lng: coords[0][1],
            coordinates: coords,
            properties: props
          });
        }
      }
    }
  } catch (err) {
    console.error('Error parsing GeoJSON:', err);
  }
  return features;
}

// Parse CSV / TSV text
export function parseCsvFeatures(csvText: string): RawGisFeature[] {
  const features: RawGisFeature[] = [];
  try {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) return features;

    // Detect delimiter
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let insideQuote = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          insideQuote = !insideQuote;
        } else if (char === delimiter && !insideQuote) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseRow(firstLine).map((h) => h.toLowerCase().trim().replace(/[^a-z0-9_]/g, ''));

    // Find coordinate indices
    let latIdx = headers.findIndex((h) => ['lat', 'latitude', 'lintang', 'y', 'koordinaty'].includes(h));
    let lngIdx = headers.findIndex((h) => ['lng', 'lon', 'long', 'longitude', 'bujur', 'x', 'koordinatx'].includes(h));
    let nameIdx = headers.findIndex((h) => ['name', 'nama', 'jenispohon', 'namaproyek', 'judul', 'lokasi'].includes(h));

    if (latIdx === -1) {
      latIdx = headers.findIndex((h) => h.includes('lat') || h.includes('y'));
    }
    if (lngIdx === -1) {
      lngIdx = headers.findIndex((h) => h.includes('lng') || h.includes('lon') || h.includes('x'));
    }

    for (let i = 1; i < lines.length; i++) {
      const cells = parseRow(lines[i]);
      if (cells.length <= 1) continue;

      const props: Record<string, any> = {};
      headers.forEach((h, idx) => {
        if (cells[idx] !== undefined) props[h] = cells[idx];
      });

      let lat = latIdx !== -1 ? parseFloat(cells[latIdx]) : NaN;
      let lng = lngIdx !== -1 ? parseFloat(cells[lngIdx]) : NaN;

      // Fallback search in cells if coords in specific format
      if (isNaN(lat) || isNaN(lng)) {
        for (const cell of cells) {
          const num = parseFloat(cell);
          if (!isNaN(num)) {
            if (num >= -10 && num <= 10 && isNaN(lat)) lat = num;
            else if (num >= 90 && num <= 145 && isNaN(lng)) lng = num;
          }
        }
      }

      if (!isNaN(lat) && !isNaN(lng)) {
        const name = nameIdx !== -1 && cells[nameIdx] ? cells[nameIdx] : `Baris ${i}`;
        features.push({
          name,
          lat,
          lng,
          properties: props
        });
      }
    }
  } catch (err) {
    console.error('Error parsing CSV:', err);
  }
  return features;
}

// Convert Raw features to PohonGisItem
export function convertToPohonItems(
  features: RawGisFeature[],
  defaultPenyulang = 'PASSO'
): PohonGisItem[] {
  return features.map((feat, idx) => {
    const p = feat.properties;
    const rawPenyulang = p.penyulang || p.feeder || defaultPenyulang;
    const rawSection = p.section || p.seksi || '';
    const rawNoTiang = p.notiangorspan || p.notiang || p.tiang || `TG-${Math.floor(Math.random() * 80 + 10)}`;
    const rawLokasi = p.lokasi || p.alamat || feat.description || feat.name || `Jalur 20kV ${rawPenyulang}`;
    const rawJenisPohon = p.jenispohon || p.pohon || feat.name || 'Pohon Trembesi / Campuran';
    const rawJumlah = parseInt(p.jumlahpohon || p.jumlah || '1') || 1;

    // Tingkat bahaya detection
    let bahaya: PohonGisItem['tingkatBahaya'] = 'Kritis (Bahaya Padam)';
    const combinedText = `${feat.name} ${feat.description || ''} ${JSON.stringify(p)}`.toLowerCase();
    if (combinedText.includes('aman') || combinedText.includes('terpangkas') || combinedText.includes('bersih')) {
      bahaya = 'Aman / Terpangkas';
    } else if (combinedText.includes('roboh') || combinedText.includes('condong') || combinedText.includes('tumbang')) {
      bahaya = 'Potensi Roboh';
    } else if (combinedText.includes('rawan') || combinedText.includes('waspada') || combinedText.includes('sedang')) {
      bahaya = 'Rawan Sentuh';
    }

    // Jarak ke jaringan
    let jarak: PohonGisItem['jarakKeJaringan'] = '< 1 meter';
    if (combinedText.includes('nempel') || combinedText.includes('menempel')) {
      jarak = 'Menempel Kawat';
    } else if (combinedText.includes('> 2.5') || combinedText.includes('aman')) {
      jarak = '> 2.5 meter';
    } else if (combinedText.includes('1 - 2.5') || combinedText.includes('2 meter')) {
      jarak = '1 - 2.5 meter';
    }

    // Status eksekusi
    let status: PohonGisItem['statusEksekusi'] = 'Perlu Tebas';
    if (bahaya === 'Aman / Terpangkas' || combinedText.includes('selesai')) {
      status = 'Selesai Pangkas';
    } else if (combinedText.includes('izin') || combinedText.includes('warga') || combinedText.includes('masyarakat')) {
      status = 'Perlu Izin Warga';
    } else if (combinedText.includes('padam') || combinedText.includes('jtm')) {
      status = 'Perlu Padam';
    } else if (combinedText.includes('tebang') || combinedText.includes('potong besar')) {
      status = 'Perlu Tebang';
    }

    return {
      id: `pohon-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      penyulang: rawPenyulang,
      section: rawSection,
      noTiangOrSpan: rawNoTiang,
      lokasi: rawLokasi,
      lat: feat.lat,
      lng: feat.lng,
      jarakKeJaringan: jarak,
      tingkatBahaya: bahaya,
      statusEksekusi: status,
      jenisPohon: rawJenisPohon,
      jumlahPohon: rawJumlah,
      tglTemuan: p.tgltemuan || new Date().toISOString().split('T')[0],
      tglEksekusi: p.tgleksekusi || (status === 'Selesai Pangkas' ? new Date().toISOString().split('T')[0] : undefined),
      pelaksana: p.pelaksana || 'Tim ROW ULP Baguala',
      keterangan: p.keterangan || feat.description || `Data import GIS [${feat.name}]`
    };
  });
}

// Convert Raw features to KonstruksiGisItem
export function convertToKonstruksiItems(
  features: RawGisFeature[],
  defaultPenyulang = 'PASSO'
): KonstruksiGisItem[] {
  return features.map((feat, idx) => {
    const p = feat.properties;
    const rawNamaProyek = p.namaproyek || p.judul || p.temuan || p.proyek || feat.name || `Temuan Konstruksi JTM ${defaultPenyulang}`;
    const rawSpk = p.nomorspk || p.nospk || p.nolaporan || p.spk || `INSP/KNST/${new Date().getFullYear()}/${Math.floor(Math.random() * 800 + 100)}`;
    const rawNoTiang = p.notiang || p.tiang || p.gardu || p.nogardu || `TG-${Math.floor(Math.random() * 80 + 10)}`;
    const rawPenyulang = p.penyulang || p.feeder || defaultPenyulang;
    const rawLokasi = p.lokasi || p.alamat || feat.description || `Jalur 20kV ${rawPenyulang}`;

    // Kategori Deteksi
    const combinedText = `${rawNamaProyek} ${feat.description || ''} ${JSON.stringify(p)}`.toLowerCase();
    let kategori: KonstruksiGisItem['kategoriKonstruksi'] = 'TRAVERS / Cross Arm';

    if (combinedText.includes('travers') || combinedText.includes('cross arm') || combinedText.includes('crossarm') || combinedText.includes('arm tie')) {
      kategori = 'TRAVERS / Cross Arm';
    } else if (combinedText.includes('beugel') || combinedText.includes('bugel') || combinedText.includes('baut') || combinedText.includes('guy wire') || combinedText.includes('trekschoor') || combinedText.includes('skur')) {
      kategori = 'BEUGEL & Aksesoris Tiang';
    } else if (combinedText.includes('gardu') || combinedText.includes('gtt') || combinedText.includes('trafo') || combinedText.includes('phb-tr') || combinedText.includes('phb tr') || combinedText.includes('bushing')) {
      kategori = 'GARDU DISTRIBUSI & GTT';
    } else if (combinedText.includes('kabel') || combinedText.includes('konduktor') || combinedText.includes('jumper') || combinedText.includes('cco') || combinedText.includes('rantas') || combinedText.includes('andongan') || combinedText.includes('a3c') || combinedText.includes('aaac')) {
      kategori = 'KABEL, Konduktor & Jumper';
    } else if (combinedText.includes('isolator') || combinedText.includes('arrester') || combinedText.includes('la') || combinedText.includes('flashover') || combinedText.includes('pin post')) {
      kategori = 'ISOLATOR & Arrester';
    } else if (combinedText.includes('tiang') || combinedText.includes('miring') || combinedText.includes('pondasi') || combinedText.includes('ambles') || combinedText.includes('retak')) {
      kategori = 'TIANG DISTRIBUSI';
    } else if (combinedText.includes('lbs') || combinedText.includes('fco') || combinedText.includes('cut out') || combinedText.includes('recloser') || combinedText.includes('ds') || combinedText.includes('saklar')) {
      kategori = 'PERALATAN HUBUNG (LBS/FCO/DS)';
    } else if (combinedText.includes('grounding') || combinedText.includes('pembumian') || combinedText.includes('animal guard') || combinedText.includes('anti climbing') || combinedText.includes('penghalang panjat')) {
      kategori = 'GROUNDING & Animal Guard';
    } else {
      kategori = 'MATERIAL / Konstruksi Lainnya';
    }

    // Tingkat Bahaya Detection
    let bahaya: KonstruksiGisItem['tingkatBahaya'] = 'Tinggi (Perlu Tindak Lanjut Cepat)';
    if (combinedText.includes('kritis') || combinedText.includes('segera') || combinedText.includes('padam') || combinedText.includes('putus') || combinedText.includes('patah') || combinedText.includes('meledak') || combinedText.includes('terbakar')) {
      bahaya = 'Kritis (Potensi Gangguan Segera)';
    } else if (combinedText.includes('sedang') || combinedText.includes('terjadwal') || combinedText.includes('berkala')) {
      bahaya = 'Sedang (Perbaikan Terjadwal)';
    } else if (combinedText.includes('ringan') || combinedText.includes('monitoring') || combinedText.includes('aman')) {
      bahaya = 'Ringan (Monitoring)';
    }

    // Status & Progres
    let status: KonstruksiGisItem['statusProyek'] = 'Sedang Dikerjakan';
    let progres = parseInt(p.progres || p.progrespersen || '40') || 40;
    if (combinedText.includes('selesai') || combinedText.includes('tuntas') || progres === 100) {
      status = 'Selesai Diperbaiki';
      progres = 100;
    } else if (combinedText.includes('belum') || combinedText.includes('baru') || progres === 0) {
      status = 'Belum Ditindaklanjuti';
      progres = 0;
    } else if (combinedText.includes('jadwal') || combinedText.includes('wo') || combinedText.includes('rencana')) {
      status = 'Terjadwal WO / Pemeliharaan';
      if (progres > 30) progres = 20;
    }

    const anggaran = parseFloat(p.anggaran || p.anggaranrp || p.biaya || '3500000') || 3500000;
    const vendor = p.pelaksanavendor || p.pelaksana || p.timhar || 'Tim Pemeliharaan JTM ULP Baguala';
    const pengawas = p.pengawaspln || p.pengawas || p.petugas || 'Samsul Bahri (Supervisor Teknik)';
    const volume = p.volumeaset || p.volume || '1 Titik Temuan Konstruksi';
    const kebutuhanMaterial = p.kebutuhanmaterial || p.material || p.alat || `Material perbaikan untuk kategori ${kategori}`;
    const jenisAnomali = p.jenisanomali || p.anomali || p.kondisi || feat.description || `Anomali konstruksi ${rawNamaProyek} pada ${rawNoTiang}`;

    return {
      id: `kst-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      namaProyek: rawNamaProyek,
      nomorSpk: rawSpk,
      noTiang: rawNoTiang,
      penyulang: rawPenyulang,
      section: p.section || '',
      lokasi: rawLokasi,
      lat: feat.lat,
      lng: feat.lng,
      kategoriKonstruksi: kategori,
      jenisAnomali: jenisAnomali,
      tingkatBahaya: bahaya,
      kebutuhanMaterial: kebutuhanMaterial,
      statusProyek: status,
      progresPersen: progres,
      targetSelesai: p.targetselesai || '2026-03-31',
      tglMulai: p.tglmulai || new Date().toISOString().split('T')[0],
      tglTemuan: p.tgltemuan || new Date().toISOString().split('T')[0],
      anggaranRp: anggaran,
      pelaksanaVendor: vendor,
      pengawasPln: pengawas,
      volumeAset: volume,
      keterangan: p.keterangan || feat.description || `Temuan inspeksi konstruksi [${feat.name}]`,
      coordinatesPolyline: feat.coordinates || [
        [feat.lat - 0.0008, feat.lng - 0.0008],
        [feat.lat, feat.lng],
        [feat.lat + 0.0008, feat.lng + 0.0008]
      ]
    };
  });
}

// Master File Reader supporting .kml, .kmz, .geojson, .json, .csv, .txt
export async function readGisFile(file: File): Promise<RawGisFeature[]> {
  const nameLower = file.name.toLowerCase();

  // KMZ or Zip archive
  if (nameLower.endsWith('.kmz') || nameLower.endsWith('.zip')) {
    const zip = await JSZip.loadAsync(file);
    const kmlFile = Object.keys(zip.files).find((fn) => fn.toLowerCase().endsWith('.kml'));
    if (kmlFile) {
      const text = await zip.files[kmlFile].async('text');
      return parseKmlFeatures(text);
    }
    const jsonFile = Object.keys(zip.files).find((fn) => fn.toLowerCase().endsWith('.geojson') || fn.toLowerCase().endsWith('.json'));
    if (jsonFile) {
      const text = await zip.files[jsonFile].async('text');
      return parseGeoJsonFeatures(text);
    }
    return [];
  }

  const text = await file.text();

  // KML
  if (nameLower.endsWith('.kml') || text.includes('<kml') || text.includes('<Placemark')) {
    return parseKmlFeatures(text);
  }

  // GeoJSON / JSON
  if (nameLower.endsWith('.geojson') || nameLower.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    return parseGeoJsonFeatures(text);
  }

  // CSV / TSV / Text
  return parseCsvFeatures(text);
}
