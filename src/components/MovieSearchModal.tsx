import { useState, useEffect } from 'react';
import { Search, X, Loader2, Play } from 'lucide-react';
import { searchMovies, getMovieTrailerId } from '../services/tmdbService';
import type { TMDBMovie } from '../services/tmdbService';

interface MovieSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (movie: TMDBMovie, youtubeId: string) => void;
}

export default function MovieSearchModal({ isOpen, onClose, onSelect }: MovieSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const movies = await searchMovies(query);
          setResults(movies);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = async (movie: TMDBMovie) => {
    setSelectingId(movie.id);
    try {
      const trailerId = await getMovieTrailerId(movie.id);
      onSelect(movie, trailerId);
    } catch (error) {
      console.error(error);
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-[#0b0f19]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
        
        {/* Header Search */}
        <div className="p-6 border-b border-white/5 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Film veya Dizi Ara..." 
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-full py-3.5 pl-12 pr-6 text-white text-lg focus:outline-none transition-all placeholder-gray-500"
            />
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
             <div className="h-40 flex items-center justify-center text-indigo-400">
               <Loader2 className="w-8 h-8 animate-spin" />
             </div>
          ) : results.length > 0 ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {results.map((movie) => (
                   <div 
                     key={movie.id} 
                     onClick={() => !selectingId && handleSelect(movie)}
                     className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-transparent hover:border-indigo-500/50 transition-all ${selectingId === movie.id ? 'opacity-50 pointer-events-none' : ''}`}
                   >
                     <div className="aspect-[2/3] bg-gray-900 w-full relative">
                        {movie.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 bg-[#131b2c] p-4 text-center text-sm">Afiş Yok</div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                           <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mb-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                             {selectingId === movie.id ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Play className="w-5 h-5 text-white ml-1" />}
                           </div>
                        </div>
                     </div>
                     <div className="pt-3 pb-1">
                        <h3 className="text-white font-bold text-sm line-clamp-1">{movie.title}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{movie.release_date?.substring(0,4)}</span>
                          <span className="text-xs font-semibold text-yellow-500 flex items-center">★ {movie.vote_average?.toFixed(1)}</span>
                        </div>
                     </div>
                   </div>
                ))}
             </div>
          ) : query.length > 2 ? (
             <div className="h-40 flex items-center justify-center text-gray-500">
                <p>"{query}" için sonuç bulunamadı.</p>
             </div>
          ) : (
             <div className="h-[40vh] flex flex-col items-center justify-center text-gray-500 space-y-4">
                <Search className="w-12 h-12 opacity-20" />
                <p>İzlemek istediğiniz filmin adını yazın</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
