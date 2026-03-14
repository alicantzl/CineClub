import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Terminal, 
  Database,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchMovies } from '../services/tmdbService';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { Room } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    movies: any[];
    users: any[];
    rooms: any[];
  }>({ movies: [], users: [], rooms: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performGlobalSearch();
      } else {
        setResults({ movies: [], users: [], rooms: [] });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performGlobalSearch = async () => {
    setIsSearching(true);
    try {
      const [movies] = await Promise.all([
        searchMovies(searchQuery)
      ]);

      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, limit(10));
      const usersSnap = await getDocs(usersQuery);
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.username?.toLowerCase().includes(searchQuery.toLowerCase()));

      const roomsRef = collection(db, 'rooms');
      const roomsSnap = await getDocs(query(roomsRef, limit(10)));
      const rooms = roomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((r: any) => r.name?.toLowerCase().includes(searchQuery.toLowerCase()));

      setResults({ movies: movies.slice(0, 12), users, rooms });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-start pt-[10vh] px-6 md:px-20 overflow-hidden">
      
      {/* ── NEURAL SEARCH OVERLAY ── */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-[60px] transition-all duration-1000"
        onClick={onClose}
      >
        {/* Data Grid Background */}
        <div className="absolute inset-0 bg-intelligence-grid opacity-[0.05]" />
        {/* Pulsating Radial Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.05)_0%,transparent_70%)] animate-pulse-slow" />
      </div>

      {/* ── SEARCH INPUT ARCHITECTURE ── */}
      <div className="relative w-full max-w-7xl z-10 animate-fade-in">
        <div className="relative flex items-center group">
          <div className="absolute left-10 text-white/20 transition-all duration-500 group-focus-within:text-rose-500 group-focus-within:scale-125">
            <Search className="w-10 h-10" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-white/[0.02] border-b-2 border-white/5 focus:border-rose-500 outline-none p-12 pl-24 text-6xl md:text-8xl font-black italic text-white placeholder:text-white/[0.03] transition-all duration-700 uppercase tracking-tighter"
            placeholder="SİSTEM TARAMASI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="absolute right-10 w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all active:scale-75"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Intelligence Scanning Indicator */}
        {isSearching && (
          <div className="absolute -bottom-1 left-0 w-full h-1 bg-white/5 overflow-hidden">
            <div className="w-1/3 h-full bg-rose-500 animate-[shimmer_2s_infinite]" />
          </div>
        )}
      </div>

      {/* ── INTELLIGENCE BLOCKS (RESULTS) ── */}
      <div className="relative w-full max-w-7xl mt-12 overflow-y-auto no-scrollbar pb-32 animate-fade-in animation-delay-200">
        
        {searchQuery.trim().length <= 2 && (
          <div className="flex flex-col items-center justify-center py-40 opacity-20 space-y-8">
             <Terminal className="w-24 h-24 text-white animate-pulse" />
             <p className="text-2xl font-black uppercase tracking-[1em] italic">Keşif Protokolü Bekleniyor</p>
          </div>
        )}

        {searchQuery.trim().length > 2 && (
          <div className="space-y-32">
            
            {/* Identity Files (Users) */}
            {results.users.length > 0 && (
              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-[1em] italic">ID_IDENTITY_FILES</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-rose-500/20 to-transparent" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {results.users.map((user: any) => (
                    <div key={user.id} className="group p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-rose-500/30 transition-all duration-500 cursor-pointer text-center relative overflow-hidden">
                       <img 
                         src={user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.uid}`} 
                         className="w-20 h-20 rounded-2xl mx-auto mb-4 border border-white/10 group-hover:border-rose-500/40 transition-all duration-700" 
                         alt="" 
                       />
                       <p className="text-sm font-black text-white italic truncate uppercase">{user.displayName || 'Anonim'}</p>
                       <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">@{user.username || 'user'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Signals (Rooms) */}
            {results.rooms.length > 0 && (
              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em] italic">ACTIVE_SIGNALS</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.rooms.map((room: Room) => (
                    <div key={room.id} onClick={() => { navigate(`/room/${room.id}`); onClose(); }} className="group relative aspect-video rounded-[40px] overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-700 cursor-pointer shadow-2xl">
                       <img src={room.backdropUrl || `https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-110" alt="" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                       <div className="absolute inset-0 p-8 flex flex-col justify-end">
                          <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-emerald-400 transition-colors uppercase">{room.name}</h4>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest italic mt-1">{room.hostName.toUpperCase()} KOMUTASINDA</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vision Data (Movies) */}
            {results.movies.length > 0 && (
              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-[1em] italic">VISION_ARCHIVE_DATA</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-12">
                  {results.movies.map((movie: any) => (
                    <div key={movie.id} className="group cursor-pointer space-y-4">
                       <div className="relative aspect-[2/3] rounded-[30px] overflow-hidden border border-white/5 hover:border-blue-500 transition-all duration-700 shadow-xl group-hover:-translate-y-2">
                          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="w-full h-10 bg-white text-black font-black text-[10px] rounded-xl flex items-center justify-center gap-2 uppercase italic">
                               DETAYLAR <ArrowRight className="w-3 h-3" />
                             </button>
                          </div>
                       </div>
                       <div>
                          <p className="text-sm font-black text-white italic leading-tight uppercase group-hover:text-blue-400 transition-colors line-clamp-1">{movie.title}</p>
                          <p className="text-[9px] text-white/20 font-bold tracking-widest mt-1 uppercase italic">{movie.release_date?.substring(0,4)} // {movie.vote_average.toFixed(1)} ★</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.movies.length === 0 && results.users.length === 0 && results.rooms.length === 0 && !isSearching && (
              <div className="flex flex-col items-center justify-center py-40 opacity-20 space-y-8">
                 <Database className="w-24 h-24 text-white" />
                 <p className="text-2xl font-black uppercase tracking-[1em] italic">Veri Analizinde Sonuç Bulunamadı</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Diagnostics Footer */}
      <div className="fixed bottom-12 left-20 right-20 flex items-center justify-between pointer-events-none z-20 animate-fade-in animation-delay-500">
         <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.8em]">SYSTEM_DIAGNOSTICS</span>
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">NEURAL_LINK: OPTIMAL</span>
            </div>
         </div>
         <div className="flex flex-col items-end gap-2">
            <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.8em]">SCAN_ENGINE</span>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">TMDB_CORE_V4_ONLINE</span>
         </div>
      </div>
    </div>
  );
}
