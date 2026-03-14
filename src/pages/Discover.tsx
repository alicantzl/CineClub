import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import {
  Search,
  Film,
  Star,
  TrendingUp,
  Play,
  Award,
  X,
  Loader2
} from 'lucide-react';
import { tmdbService } from '../services/tmdbService';
import CreateRoomModal from '../components/CreateRoomModal';
import type { TMDBMovie } from '../services/tmdbService';

const GENRES = ['Tümü', 'Aksiyon', 'Komedi', 'Dram', 'Gerilim', 'Animasyon', 'Belgesel', 'Bilim-Kurgu', 'Korku'];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [popular, setPopular] = useState<TMDBMovie[]>([]);
  const [topRated, setTopRated] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGenre, setActiveGenre] = useState('Tümü');
  const [activeSection, setActiveSection] = useState<'trending' | 'popular' | 'top'>('trending');

  useEffect(() => {
    const load = async () => {
      try {
        const [t, p, r] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getMovies('popular'),
          tmdbService.getMovies('top_rated'),
        ]);
        setTrending(t);
        setPopular(p);
        setTopRated(r);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const res = await tmdbService.searchMovies(searchQuery);
          setSearchResults(res);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const currentList = activeSection === 'trending' ? trending : activeSection === 'popular' ? popular : topRated;

  return (
    <Layout noPadding>
      <div
        className="w-full h-full overflow-y-auto custom-scrollbar"
        style={{ background: '#060912' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 px-8 lg:px-10 py-5"
          style={{ background: 'rgba(6,9,18,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200" style={{ color: searchQuery ? '#60a5fa' : 'rgba(255,255,255,0.3)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Film veya dizi ara..."
                className="w-full pl-11 pr-10 py-3 text-sm text-white rounded-xl transition-all duration-200 focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${searchQuery ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: searchQuery ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none'
                }}
              />
              {isSearching ? (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: '#60a5fa' }} />
              ) : searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Section tabs */}
            {!searchQuery && (
              <div
                className="flex items-center gap-1 p-1 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {[
                  { id: 'trending', label: 'Trend', icon: TrendingUp },
                  { id: 'popular', label: 'Popüler', icon: Award },
                  { id: 'top', label: 'En İyi', icon: Star },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id as 'trending' | 'popular' | 'top')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200"
                    style={{
                      background: activeSection === s.id ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: activeSection === s.id ? '#60a5fa' : 'rgba(255,255,255,0.45)',
                      border: activeSection === s.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                    }}
                  >
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Genre pills */}
          {!searchQuery && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className="px-4 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-200 press shrink-0"
                  style={{
                    background: activeGenre === g ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeGenre === g ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: activeGenre === g ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 lg:px-10 py-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl shimmer" />
              ))}
            </div>
          ) : searchQuery ? (
            /* Search Results */
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold text-white">Arama Sonuçları</h2>
                {searchResults.length > 0 && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                  >
                    {searchResults.length} film
                  </span>
                )}
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Film className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <p className="font-semibold text-white mb-1">Sonuç bulunamadı</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    "{searchQuery}" için sonuç yok. Farklı bir şey dene.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {searchResults.map((m, i) => (
                    <MovieCard key={m.id} movie={m} i={i} onSelect={() => setIsModalOpen(true)} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Browse mode */
            <div className="animate-fade-in">
              {/* Section title */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    {activeSection === 'trending' ? 'Bu Hafta Trend' : activeSection === 'popular' ? 'Popüler Filmler' : 'En İyi Puanlı'}
                  </h2>
                  {activeSection === 'trending' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f97316' }} />
                      <span className="text-[10px] font-bold" style={{ color: '#fb923c' }}>CANLI</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {currentList.length} film
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {currentList.map((m, i) => (
                  <MovieCard key={m.id} movie={m} i={i} onSelect={() => setIsModalOpen(true)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
}

function MovieCard({ movie, i, onSelect }: { movie: TMDBMovie; i: number; onSelect: (m: TMDBMovie) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative animate-float-up cursor-pointer"
      style={{ animationDelay: `${(i % 6) * 60}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(movie)}
    >
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-400"
        style={{
          aspectRatio: '2/3',
          border: '1px solid rgba(255,255,255,0.06)',
          transform: hovered ? 'translateY(-5px) scale(1.02)' : 'none',
          boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#111827' }}>
            <Film className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300"
          style={{
            background: 'rgba(6,9,18,0.8)',
            opacity: hovered ? 1 : 0
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
              transform: hovered ? 'scale(1)' : 'scale(0.8)'
            }}
          >
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Oda Aç</span>
        </div>

        {/* Rating */}
        <div
          className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        >
          <Star className="w-2.5 h-2.5" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span className="text-[10px] font-bold text-white">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-2.5 px-0.5">
        <p className="text-[12px] font-semibold text-white truncate transition-colors duration-200" style={{ color: hovered ? '#93c5fd' : '#fff' }}>
          {movie.title}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {movie.release_date?.substring(0, 4)} · Film
        </p>
      </div>
    </div>
  );
}
