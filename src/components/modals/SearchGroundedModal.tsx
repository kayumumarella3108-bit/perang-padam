import React, { useState } from 'react';
import { Search, X, Globe, ExternalLink, Sparkles, CloudSun, ShieldCheck, Zap, BookOpen, Loader2, CheckCircle2 } from 'lucide-react';

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface SearchGroundedModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const QUICK_SUGGESTIONS = [
  { label: 'Prakiraan Cuaca & Petir Ambon', query: 'Bagaimana prakiraan cuaca, potensi angin kencang dan petir di Ambon Maluku hari ini untuk kewaspadaan jaringan listrik PLN?', icon: CloudSun },
  { label: 'Standar Jarak Safe Clearance ROW 20kV', query: 'Berapa jarak aman minimal (Right of Way / ROW) pohon dan bangunan terhadap jaringan SUTM 20kV menurut PUIL 2020 dan aturan PLN?', icon: ShieldCheck },
  { label: 'Tarif & Spesifikasi SPKLU PLN', query: 'Berapa tarif resmi pengisian listrik SPKLU PLN Fast Charging per kWh dan bagaimana spesifikasi teknis dispenser SPKLU di Indonesia?', icon: Zap },
  { label: 'Prosedur Pemeliharaan Preventif 20kV', query: 'Apa langkah pemeliharaan preventif jaringan distribusi 20kV yang efektif untuk menekan tingkat SAIDI dan SAIFI?', icon: BookOpen },
];

export const SearchGroundedModal: React.FC<SearchGroundedModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialQuery && isOpen) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setGroundingChunks([]);
    setSearchQueries([]);

    try {
      const res = await fetch('/api/gemini/search-grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        throw new Error('Gagal mengambil data dari server.');
      }

      const data = await res.json();
      setAnswer(data.answer);
      setGroundingChunks(data.groundingChunks || []);
      setSearchQueries(data.webSearchQueries || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Terjadi kendala saat melakukan pencarian real-time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 text-blue-400">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">Pencarian Real-Time PLN</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Gemini 3.5 Flash + Google Search
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dapatkan informasi terkini seputar cuaca, regulasi ROW PUIL, tarif SPKLU, & standar teknis kelistrikan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 md:p-6 bg-slate-900 border-b border-slate-800/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tanyakan hal seputar cuaca Ambon, aturan ROW PUIL 2020, SPKLU, atau teknik PLN..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Cari Data</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">Contoh:</span>
            {QUICK_SUGGESTIONS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item.query);
                    handleSearch(item.query);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-xs text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Result Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-spin mb-3">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white">Menghubungkan ke Google Search & Gemini 3.5 Flash...</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Mengambil data terkini dari BMKG, Peraturan PLN PUIL 2020, dan portal informasi kelistrikan terpercaya.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!loading && !answer && !error && (
            <div className="py-10 text-center">
              <Globe className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ketikkan pertanyaan atau pilih salah satu chip rekomendasi di atas untuk mulai mencari informasi real-time berakurasi tinggi dengan Google Search Grounding.
              </p>
            </div>
          )}

          {!loading && answer && (
            <div className="space-y-6">
              {/* Answer Box */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Hasil Analisis Google Search Grounded
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Gemini 3.5 Flash</span>
                </div>
                {answer}
              </div>

              {/* Web Search Queries used */}
              {searchQueries.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Kata Kunci Pencarian Google:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchQueries.map((sq, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-mono">
                        "{sq}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounding Sources (Google Search Chunks) */}
              {groundingChunks.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Sumber Rujukan Terverifikasi Google Search ({groundingChunks.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groundingChunks.map((chunk, index) => {
                      if (!chunk.web?.uri) return null;
                      return (
                        <a
                          key={index}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-start gap-2.5 text-left group cursor-pointer"
                        >
                          <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div className="overflow-hidden flex-1">
                            <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 line-clamp-1 transition-colors">
                              {chunk.web.title || chunk.web.uri}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <span>{chunk.web.uri}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
