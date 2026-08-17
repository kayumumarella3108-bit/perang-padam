import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, Zap, Hash, Layers } from 'lucide-react';
import { MasterGardu, Penyulang } from '../../types';

interface MasterGarduModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gardu: MasterGardu) => void;
  editingGardu?: MasterGardu | null;
  penyulangList: Penyulang[];
}

export const MasterGarduModal: React.FC<MasterGarduModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGardu,
  penyulangList
}) => {
  const [formData, setFormData] = useState<Partial<MasterGardu>>({
    unit: 'ULP Baguala',
    noGarduLama: '',
    noGarduBaru: '',
    alamatGardu: '',
    latt: -3.6500,
    long: 128.2000,
    ssotNumber: '',
    penyulang: penyulangList[0]?.namaPenyulang || 'PASSO',
    daya: 160,
    jumlahFasa: '3 Fasa'
  });

  useEffect(() => {
    if (editingGardu) {
      setFormData(editingGardu);
    } else {
      setFormData({
        unit: 'ULP Baguala',
        noGarduLama: '',
        noGarduBaru: '',
        alamatGardu: '',
        latt: -3.6500,
        long: 128.2000,
        ssotNumber: `SSOT-BGL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        penyulang: penyulangList[0]?.namaPenyulang || 'PASSO',
        daya: 160,
        jumlahFasa: '3 Fasa'
      });
    }
  }, [editingGardu, isOpen, penyulangList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.noGarduBaru && !formData.noGarduLama) {
      alert('Harap isi Nomor Gardu Baru atau Nomor Gardu Lama');
      return;
    }

    const garduData: MasterGardu = {
      id: editingGardu?.id || `gd_${Date.now()}`,
      unit: formData.unit || 'ULP Baguala',
      noGarduLama: formData.noGarduLama || '-',
      noGarduBaru: formData.noGarduBaru || formData.noGarduLama || 'GD-000',
      alamatGardu: formData.alamatGardu || '-',
      latt: Number(formData.latt) || 0,
      long: Number(formData.long) || 0,
      ssotNumber: formData.ssotNumber || '-',
      penyulang: formData.penyulang || 'PASSO',
      daya: Number(formData.daya) || 100,
      jumlahFasa: formData.jumlahFasa || '3 Fasa'
    };

    onSave(garduData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400 border border-blue-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {editingGardu ? 'Edit Master Data Gardu' : 'Tambah Master Data Gardu Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Lengkapi atribut gardu distribusi, daya, koordinat, dan penyulang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit PLN
              </label>
              <select
                value={formData.unit || 'ULP Baguala'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                required
              >
                <option value="ULP Baguala">ULP Baguala</option>
                <option value="PLN Nusa Daya">PLN Nusa Daya</option>
                <option value="UP3">UP3</option>
                <option value="UIW">UIW</option>
                <option value="PLN">PLN</option>
              </select>
            </div>

            {/* Penyulang */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Penyulang 20kV
              </label>
              <select
                value={formData.penyulang || ''}
                onChange={(e) => setFormData({ ...formData, penyulang: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {penyulangList.map((p) => (
                  <option key={p.id} value={p.namaPenyulang}>
                    {p.namaPenyulang} ({p.namaGi})
                  </option>
                ))}
              </select>
            </div>

            {/* No Gardu Lama */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No Gardu Lama
              </label>
              <input
                type="text"
                value={formData.noGarduLama || ''}
                onChange={(e) => setFormData({ ...formData, noGarduLama: e.target.value })}
                placeholder="mis. PSO-004"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* No Gardu Baru */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No Gardu Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.noGarduBaru || ''}
                onChange={(e) => setFormData({ ...formData, noGarduBaru: e.target.value })}
                placeholder="mis. GD-PSO-004"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Daya (kVA) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daya Trafo (kVA)
              </label>
              <select
                value={formData.daya || 160}
                onChange={(e) => setFormData({ ...formData, daya: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value={25}>25 kVA</option>
                <option value={50}>50 kVA</option>
                <option value={100}>100 kVA</option>
                <option value={160}>160 kVA</option>
                <option value={250}>250 kVA</option>
                <option value={400}>400 kVA</option>
                <option value={630}>630 kVA</option>
                <option value={1000}>1000 kVA</option>
              </select>
            </div>

            {/* Jumlah Fasa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Fasa
              </label>
              <select
                value={formData.jumlahFasa || '3 Fasa'}
                onChange={(e) => setFormData({ ...formData, jumlahFasa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="3 Fasa">3 Fasa</option>
                <option value="1 Fasa">1 Fasa</option>
              </select>
            </div>

            {/* Ssotnumber */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ssotnumber (Nomor Asset)
              </label>
              <input
                type="text"
                value={formData.ssotNumber || ''}
                onChange={(e) => setFormData({ ...formData, ssotNumber: e.target.value })}
                placeholder="mis. SSOT-BGL-2026-001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Alamat Gardu */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Gardu
              </label>
              <textarea
                rows={2}
                value={formData.alamatGardu || ''}
                onChange={(e) => setFormData({ ...formData, alamatGardu: e.target.value })}
                placeholder="mis. Jl. Syaranamual Passo, Samping Kantor Camat"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                LATT (Latitude)
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.latt || ''}
                onChange={(e) => setFormData({ ...formData, latt: e.target.value })}
                placeholder="-3.649200"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                LONG (Longitude)
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.long || ''}
                onChange={(e) => setFormData({ ...formData, long: e.target.value })}
                placeholder="128.231200"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Master Gardu</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
