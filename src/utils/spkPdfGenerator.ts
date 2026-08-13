import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PerintahKerja } from '../types';

export const generateSpkPDF = (spk: PerintahKerja) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header Logo & KOP
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PT PLN (PERSERO) UIW MMU - UP3 AMBON - ULP PASSO', 14, 10);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SURAT PERINTAH KERJA (SPK)', 105, 26, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Nomor Dokumen: ${spk.noSpk || spk.id}`, 105, 32, { align: 'center' });

  // Details Table
  autoTable(doc, {
    startY: 38,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      ['Tanggal Terbit', ':', spk.tanggal || '-', 'Jumlah Personil', ':', `${spk.jumlahPersonil || 1} Orang`],
      ['Penyulang', ':', spk.namaPenyulang || '-', 'Section / Lokasi', ':', spk.section || '-'],
      ['Jenis Pekerjaan', ':', spk.jenisPekerjaan || '-', 'Target Kerja', ':', spk.target || '-'],
      ['Petugas / Tim', ':', spk.timAtauPetugas || '-', 'Status SPK', ':', spk.status || '-']
    ],
    margin: { left: 14, right: 14 }
  });

  // Uraian Pekerjaan
  // @ts-expect-error - lastAutoTable exists on jsPDF instance
  let nextY = (doc.lastAutoTable?.finalY || 70) + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Detail & Uraian Perintah Kerja:', 14, nextY);

  autoTable(doc, {
    startY: nextY + 3,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    head: [['Parameter', 'Keterangan Rinci']],
    body: [
      ['Jenis Pekerjaan', spk.jenisPekerjaan || '-'],
      ['Target Volume / Lokasi', spk.target || '-'],
      ['Catatan Supervisor', spk.catatan || '-']
    ],
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    margin: { left: 14, right: 14 }
  });

  // Tanda tangan
  // @ts-expect-error - lastAutoTable exists on jsPDF instance
  nextY = (doc.lastAutoTable?.finalY || 130) + 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text('Petugas Pelaksana,', 30, nextY);
  doc.text('Supervisor Teknik ULP Passo,', 140, nextY);

  doc.setFont('helvetica', 'bold');
  doc.text(`( ${spk.timAtauPetugas || 'Petugas'} )`, 30, nextY + 25);
  doc.text('( Supervisor Teknik )', 140, nextY + 25);

  doc.save(`SPK_${(spk.noSpk || spk.id).replace(/\//g, '_')}.pdf`);
};
