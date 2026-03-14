import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Users,
  Star,
  Database,
  Globe,
  Layers,
  ArrowRight,
  MonitorPlay,
  PlusCircle,
  History,
  Film,
  Zap,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import CreateRoomModal from '../components/CreateRoomModal';
import { subscribeToRooms } from '../services/roomService';
import { getTrendingMovies, getMovieTrailerId } from '../services/tmdbService';
import { useAuthStore } from '../store/authStore';
import type { Room } from '../types';
import type { TMDBMovie } from '../services/tmdbService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  
  // Data States
  const [rooms, setRooms] = useState<Room[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [trendScope, setTrendScope] = useState<'TR' | 'GLOBAL'>('GLOBAL');
  const [selectedMovieForRoom, setSelectedMovieForRoom] = useState<TMDBMovie | null>(null);
  const [activeTrailerId, setActiveTrailerId] = useState<string | null>(null);
  const [showIntelligenceFeed, setShowIntelligenceFeed] = useState(true);

  // Subscriptions & Data Fetch
  useEffect(() => {
    const unsubscribe = subscribeToRooms((updatedRooms) => {
      setRooms(updatedRooms);
    });
    fetchTrending();
    return () => unsubscribe();
  }, [trendScope]);

  const fetchTrending = async () => {
    setIsLoading(true);
    const movies = await getTrendingMovies(trendScope === 'TR' ? 'TR' : undefined);
    setTrendingMovies(movies);
    setIsLoading(false);
  };

  // Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (trendingMovies.length > 0 && !activeTrailerId) {
        setHeroIdx(prev => (prev + 1) % Math.min(trendingMovies.length, 5));
      }
    }, 12000);
    return () => clearInterval(timer);
  }, [trendingMovies, activeTrailerId]);

  const heroMovie = trendingMovies[heroIdx];

  // Intelligence Feed (Synthetic for now, based on rooms)
  const intelligenceEvents = useMemo(() => {
    const events = rooms.slice(0, 5).map(r => ({
      id: r.id,
      type: 'ROOM_START',
      label: 'YENİ OTURUM',
      msg: `${r.hostName.toUpperCase()} bir oda başlattı: ${r.name.toUpperCase()}`,
      time: 'ŞİMDİ',
      color: 'text-emerald-500'
    }));
    
    return [
      ...events,
      { id: 'sys-1', type: 'SYS', label: 'SİSTEM', msg: 'NEXUS ÇEKİRDEĞİ OPTİMAL DURUMDA.', time: 'AKTİF', color: 'text-blue-500' },
      { id: 'sys-2', type: 'SYS', label: 'HAVA DURUMU', msg: 'METAVERSE VERİ YAĞMURU BEKLENİYOR.', time: '02DAK', color: 'text-purple-500' },
    ];
  }, [rooms]);

  const handleWatchTrailer = async (movie: TMDBMovie) => {
    const trailerId = await getMovieTrailerId(movie.id);
    setActiveTrailerId(trailerId);
  };

  const handleQuickRoom = (movie: TMDBMovie) => {
    setSelectedMovieForRoom(movie);
    setIsNewRoomModalOpen(true);
  };

  const nextHero = () => setHeroIdx(prev => (prev + 1) % Math.min(trendingMovies.length, 5));
  const prevHero = () => setHeroIdx(prev => (prev - 1 + Math.min(trendingMovies.length, 5)) % Math.min(trendingMovies.length, 5));

  return (
    <Layout noPadding>
      <div className="flex flex-col min-h-screen bg-[#000000] overflow-x-hidden relative selection:bg-rose-500/30">
        
        {/* ── AMBIENT CANVAS ── */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute inset-0 noise-texture mix-blend-overlay opacity-10 pointer-events-none" />
           <div className="absolute inset-0 bg-intelligence-grid opacity-[0.03]" />
           <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-rose-500/[0.04] blur-[180px] rounded-full animate-blob" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-500/[0.04] blur-[150px] rounded-full animate-blob animation-delay-2000" />
        </div>

        {/* ── INTEGRATED TRAILER OVERLAY ── */}
        {activeTrailerId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
             <div className="relative w-full max-w-7xl aspect-video rounded-[40px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                <iframe 
                  src={`https://www.youtube.com/embed/${activeTrailerId}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
                <button 
                  onClick={() => setActiveTrailerId(null)}
                  className="absolute top-8 right-8 w-16 h-16 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center backdrop-blur-3xl transition-all hover:scale-110 active:scale-90"
                >
                   <X className="w-8 h-8" />
                </button>
             </div>
          </div>
        )}

        {/* ── HERO HORIZON ── */}
        <section className="relative h-screen min-h-[900px] flex items-center px-10 lg:px-20 xl:px-32 overflow-hidden border-b border-white/[0.02]">
           
           <div className="absolute inset-0 z-0">
              {trendingMovies.slice(0, 5).map((movie, idx) => (
                <div 
                  key={movie.id}
                  className={`absolute inset-0 transition-all duration-[2.5s] ease-in-out ${heroIdx === idx ? 'opacity-70 scale-100 rotate-0' : 'opacity-0 scale-110 rotate-1'}`}
                >
                   <img 
                     src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                     className="w-full h-full object-cover mix-blend-screen"
                     alt=""
                   />
                   <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                </div>
              ))}
              
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                 <div className="w-full h-[2px] bg-rose-500 absolute animate-[scanline_20s_linear_infinite]" />
              </div>
           </div>

           <div className="relative z-10 w-full max-w-7xl pt-20">
              <div className="space-y-12">
                 
                 <div className="flex items-center gap-6 animate-fade-in-up">
                    <div className="h-[1px] w-20 bg-rose-500" />
                    <div className="flex items-center gap-3 py-2 px-6 rounded-full border border-rose-500/20 bg-rose-500/5 backdrop-blur-3xl">
                       <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                       <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] italic">ÖNCELİKLİ ERİŞİM // SEKTÖR 0</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <span className="text-white/30 text-2xl font-black uppercase tracking-[0.6em] block italic animate-fade-in-up delay-100">
                      HOŞ GELDİN, KOMUTAN {userProfile?.displayName?.split(' ')?.[0]?.toUpperCase() || 'SİNEFİL'}
                    </span>
                    <h1 
                      key={heroMovie?.id}
                      className="font-outfit font-black text-white italic tracking-tighter leading-[0.8] animate-float-up text-glow-rose drop-shadow-2xl" 
                      style={{ fontSize: 'clamp(4rem, 8vw, 10rem)' }}
                    >
                      {heroMovie?.title.toUpperCase() || 'YÜKLENİYOR...'}
                    </h1>
                 </div>

                 <div className="max-w-3xl space-y-6 animate-fade-in-up delay-300">
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-lg font-black text-white italic">{heroMovie?.vote_average?.toFixed(1) || '0.0'}</span>
                       </div>
                       <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10">
                          <Clock className="w-4 h-4 text-rose-500" />
                          <span className="text-lg font-black text-white/50 italic">{heroMovie?.release_date?.substring(0,4)}</span>
                       </div>
                       <div className="h-4 w-[1px] bg-white/10" />
                       <span className="text-sm font-black text-rose-500/60 uppercase tracking-widest italic">KÜRESEL TREND #{(heroIdx + 1).toString().padStart(2, '0')}</span>
                    </div>
                    
                    <p className={`text-white/40 text-2xl font-medium leading-relaxed italic transition-all duration-700 ${synopsisExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
                       {heroMovie?.overview || 'Sinema verileri analiz ediliyor. Keyifli seyirler dileriz.'}
                    </p>
                    <button 
                      onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                      className="flex items-center gap-2 text-rose-500/80 hover:text-rose-500 text-xs font-black uppercase tracking-widest transition-colors italic group"
                    >
                       {synopsisExpanded ? <><ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> DAHA AZ ODAKLA</> : <><ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" /> VERİ SETİNİ GENİŞLET</>}
                    </button>
                 </div>

                 <div className="flex flex-wrap items-center gap-8 pt-8 animate-fade-in-up delay-500">
                    <button 
                      onClick={() => heroMovie && handleQuickRoom(heroMovie)}
                      className="h-24 px-16 rounded-[35px] bg-white text-black font-black uppercase tracking-[0.4em] flex items-center gap-6 hover:scale-110 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.15)] group/btn overflow-hidden relative"
                    >
                       <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                       <Play className="w-6 h-6 fill-black relative z-10" />
                       <span className="relative z-10">Hemen İzle</span>
                    </button>
                    <button 
                      onClick={() => heroMovie && handleWatchTrailer(heroMovie)}
                      className="h-24 px-12 rounded-[35px] border border-white/20 bg-white/[0.02] hover:bg-white/[0.08] text-white font-black uppercase tracking-[0.4em] flex items-center gap-6 transition-all backdrop-blur-3xl group/btn2"
                    >
                       <Volume2 className="w-6 h-6 opacity-40 group-hover/btn2:opacity-100 transition-all group-hover/btn2:scale-110" />
                       Fragmanı İzle
                    </button>
                 </div>
              </div>
           </div>

           {/* Hero Navigation Controls */}
           <div className="absolute right-12 bottom-24 flex flex-col items-center gap-12 z-20">
              <div className="flex flex-col gap-5">
                 <button onClick={prevHero} className="w-16 h-16 rounded-3xl border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white hover:text-black transition-all group backdrop-blur-3xl">
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                 </button>
                 <button onClick={nextHero} className="w-16 h-16 rounded-3xl border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white hover:text-black transition-all group backdrop-blur-3xl">
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
              <div className="flex flex-col gap-6">
                 {[0, 1, 2, 3, 4].map((idx) => (
                   <button 
                     key={idx}
                     onClick={() => setHeroIdx(idx)}
                     className={`w-1 transition-all duration-1000 rounded-full ${heroIdx === idx ? 'bg-rose-500 h-20 shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'bg-white/10 h-10 hover:bg-white/30'}`}
                   />
                 ))}
              </div>
           </div>
        </section>

        {/* ── INTELLIGENCE STATS ── */}
        <section className="py-24 px-10 lg:px-20 xl:px-32 relative z-20">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'AKTİF ODALAR', value: rooms.length.toString().padStart(2, '0'), icon: Zap, detail: 'CANLI SİNYAL', color: 'rose' },
                { label: 'TOPLULUK', value: '1.4K', icon: Users, detail: 'BAĞLI ÜYELER', color: 'blue' },
                { label: 'ARŞİV HACMİ', value: '12.8TB', icon: Database, detail: 'SİNEMA VERİSİ', color: 'purple' },
                { label: 'SİSTEM DURUMU', value: 'OK', icon: Activity, detail: 'MODÜLLER AKTİF', color: 'emerald' }
              ].map((stat, i) => (
                <div key={i} className="group p-12 rounded-[50px] bg-white/[0.01] border border-white/[0.05] hover:bg-white/[0.03] hover:border-white/20 transition-all duration-700 relative overflow-hidden glass-simple">
                   <div className="flex justify-between items-start mb-8">
                      <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                         <stat.icon className={`w-6 h-6 text-${stat.color}-500/60 group-hover:text-${stat.color}-400 transition-colors animate-pulse-slow`} />
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2">{stat.label}</span>
                         <span className={`text-[9px] font-black text-${stat.color}-500/40 uppercase tracking-widest italic group-hover:text-${stat.color}-500/80 transition-colors`}>{stat.detail}</span>
                      </div>
                   </div>
                   <h4 className="text-8xl font-outfit font-black italic tracking-tighter text-white uppercase group-hover:translate-x-3 transition-transform duration-700 leading-none">{stat.value}</h4>
                </div>
              ))}
           </div>
        </section>

        {/* ── LIVE INTERFACE: ROOMS & FEED ── */}
        <section className="py-32 px-10 lg:px-20 xl:px-32 relative">
           <div className="flex flex-col lg:flex-row gap-16">
              
              {/* Left Column: Active Rooms */}
              <div className="flex-1 space-y-20">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="space-y-6">
                       <div className="flex items-center gap-5">
                          <Activity className="w-6 h-6 text-emerald-500" />
                          <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.8em] italic">SENKRONİZE SALONLAR</span>
                       </div>
                       <h2 className="text-9xl font-outfit font-black italic tracking-tighter text-white leading-none uppercase">Aktif Odalar</h2>
                    </div>
                    <button 
                      onClick={() => { setSelectedMovieForRoom(null); setIsNewRoomModalOpen(true); }}
                      className="group h-24 px-12 rounded-[35px] bg-emerald-500 text-black flex items-center gap-8 shadow-[0_30px_60px_rgba(16,185,129,0.2)] hover:scale-105 transition-all font-black uppercase tracking-[0.3em] italic overflow-hidden relative"
                    >
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                       <PlusCircle className="w-7 h-7 relative z-10" />
                       <span className="relative z-10">Yeni Oda Oluştur</span>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {rooms.length === 0 ? (
                      <div className="col-span-full h-[500px] flex flex-col items-center justify-center bg-white/[0.01] rounded-[80px] border border-dashed border-white/5 hover:border-emerald-500/20 transition-all group cursor-pointer" onClick={() => setIsNewRoomModalOpen(true)}>
                         <MonitorPlay className="w-16 h-16 text-white/5 mb-8 group-hover:scale-110 group-hover:text-emerald-500/20 transition-all duration-1000" />
                         <p className="text-2xl font-black uppercase tracking-[0.6em] italic text-white/10 group-hover:text-white/30 transition-colors">Aktif oda aranıyor...</p>
                      </div>
                    ) : (
                      rooms.map((room) => (
                        <div key={room.id} onClick={() => navigate(`/room/${room.id}`)} className="group/room aspect-[16/9] rounded-[60px] bg-[#0c0c0e] border border-white/5 overflow-hidden cursor-pointer transition-all duration-1000 hover:border-emerald-500/40 relative">
                           <img 
                             src={room.backdropUrl || room.moviePoster || (trendingMovies.length > 0 ? `https://image.tmdb.org/t/p/w500${trendingMovies[0].backdrop_path}` : '')} 
                             className="w-full h-full object-cover opacity-20 group-hover/room:opacity-60 group-hover/room:scale-110 transition-all duration-[2s]" 
                             alt="" 
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                           <div className="absolute bottom-12 left-12 right-12 flex flex-col items-start gap-6">
                              <div className="flex items-center gap-4 py-2 px-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-2xl">
                                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                 <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest italic">YAYINDA</span>
                              </div>
                              <h3 className="text-6xl font-outfit font-black text-white italic uppercase tracking-tighter group-hover/room:text-emerald-400 transition-colors leading-none">{room.name}</h3>
                              <div className="flex justify-between w-full pt-6 border-t border-white/10 mt-2">
                                 <div className="flex items-center gap-4 text-white/40">
                                    <Users className="w-5 h-5" />
                                    <span className="text-xl font-black uppercase italic tracking-tighter">{room.activeUsersCount || 0} İzleyici</span>
                                 </div>
                                 <span className="text-[12px] font-black text-white/10 uppercase tracking-[0.3em] italic">{room.hostName.toUpperCase()}</span>
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>

              {/* Right Column: Intelligence Feed */}
              {showIntelligenceFeed && (
                <div className="w-full lg:w-[450px] shrink-0 space-y-10 animate-fade-in-right">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                         <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em] italic">CANLI AKIŞ VERİSİ</span>
                      </div>
                      <button onClick={() => setShowIntelligenceFeed(false)} className="text-white/10 hover:text-white/40 transition-colors">
                         <X className="w-5 h-5" />
                      </button>
                   </div>

                   <div className="space-y-6 bg-white/[0.01] border border-white/5 rounded-[50px] p-10 backdrop-blur-3xl min-h-[600px] relative overflow-hidden group/feed">
                      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />
                      
                      <div className="space-y-8 relative z-0">
                         {intelligenceEvents.map((ev, i) => (
                           <div key={ev.id} className="flex gap-6 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                              <div className="flex flex-col items-center gap-3">
                                 <div className={`w-3 h-3 rounded-full mt-2 border-2 border-black ${ev.color.replace('text-', 'bg-')}`} />
                                 <div className="w-[1.5px] flex-1 bg-white/5 last:hidden" />
                              </div>
                              <div className="space-y-2 pb-6 flex-1 min-w-0 border-b border-white/[0.03] last:border-0">
                                 <div className="flex items-center justify-between gap-4">
                                    <span className={`text-[10px] font-black ${ev.color} uppercase tracking-[0.4em] italic`}>{ev.label}</span>
                                    <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">{ev.time}</span>
                                 </div>
                                 <p className="text-[14px] font-bold text-white/50 uppercase italic leading-relaxed truncate">{ev.msg}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/[0.02] border border-white/10 rounded-3xl flex items-center justify-center gap-4">
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse">VERİ SENKRONİZASYONU TAMAMLANDI</span>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </section>

        {/* ── TREND ARCHIVE ── */}
        <section className="py-40 px-10 lg:px-20 xl:px-32 relative bg-[#050507]">
           <div className="absolute inset-0 bg-intelligence-grid opacity-[0.01] pointer-events-none" />
           
           <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-24 gap-12 relative z-10 animate-fade-in">
              <div className="space-y-8">
                 <div className="flex items-center gap-6">
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                    <span className="text-[12px] font-black text-blue-500 uppercase tracking-[1em] italic">GLOBAL & YEREL ANALİZ</span>
                 </div>
                 <h2 className="text-[9rem] font-outfit font-black italic tracking-tighter text-white leading-[0.8] uppercase">Haftalık Trendler</h2>
              </div>
              
              <div className="flex p-3 bg-white/[0.02] border border-white/10 rounded-[40px] backdrop-blur-3xl shrink-0 gap-2">
                 {[
                   { id: 'TR', label: 'TÜRKİYE' },
                   { id: 'GLOBAL', label: 'GLOBAL' }
                 ].map(s => (
                   <button 
                     key={s.id}
                     onClick={() => setTrendScope(s.id as any)}
                     className={`px-12 py-5 rounded-[30px] text-[11px] font-black uppercase tracking-[0.5em] transition-all duration-700 ${trendScope === s.id ? 'bg-blue-600 text-white shadow-[0_15px_40px_rgba(37,99,235,0.3)] scale-105' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
                   >
                      {s.label}
                   </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 relative z-10">
              {isLoading ? (
                 <div className="col-span-full py-60 flex flex-col items-center justify-center gap-10 animate-pulse">
                    <div className="w-32 h-32 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-[14px] font-black text-blue-500 uppercase tracking-[1em] italic">VERİ TABANI SENKRONİZE EDİLİYOR...</span>
                 </div>
              ) : (
                trendingMovies.slice(5, 20).map((movie, idx) => (
                  <div key={movie.id} className="group/card bg-[#08080a] border border-white/[0.05] rounded-[60px] p-10 flex flex-col gap-10 hover:border-blue-500/40 transition-all duration-1000 relative overflow-hidden glass-simple cursor-default">
                     
                     <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover/card:opacity-[0.05] transition-opacity">
                        <span className="text-9xl font-black italic">{(idx + 6).toString().padStart(2, '0')}</span>
                     </div>

                     <div className="flex gap-10 relative z-10">
                        <div className="w-44 aspect-[2/3] rounded-[40px] overflow-hidden bg-black shrink-0 relative group-hover/card:scale-110 transition-transform duration-[1.5s] shadow-2xl">
                           <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full h-full object-cover" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end justify-center pb-6">
                              <button 
                                onClick={() => handleWatchTrailer(movie)}
                                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                              >
                                 <Play className="w-6 h-6 fill-black" />
                              </button>
                           </div>
                        </div>
                        
                        <div className="flex flex-col justify-center gap-6 flex-1">
                           <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{movie.release_date.substring(0,4)}</span>
                              </div>
                              <h4 className="text-4xl font-outfit font-black text-white italic uppercase tracking-tighter group-hover/card:text-blue-400 transition-colors leading-[1.1]">{movie.title}</h4>
                           </div>
                           
                           <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                 <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
                                 <span className="text-2xl font-outfit font-black text-white italic">{movie.vote_average.toFixed(1)}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="relative z-10 space-y-8 pt-4">
                        <p className="text-[15px] text-white/30 italic line-clamp-2 leading-relaxed uppercase tracking-tight group-hover/card:text-white/60 transition-colors">{movie.overview}</p>
                        
                        <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                           <button 
                             onClick={() => handleQuickRoom(movie)}
                             className="flex-1 h-16 rounded-3xl bg-white/[0.04] hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.4em] text-[10px] italic transition-all active:scale-95 flex items-center justify-center gap-4 group/btn3"
                           >
                              Salon Başlat
                              <ArrowRight className="w-4 h-4 group-hover/btn3:translate-x-2 transition-transform" />
                           </button>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </section>

        {/* ── FOOTER NEXUS ── */}
        <footer className="py-40 px-10 lg:px-20 xl:px-32 border-t border-white/5 relative z-10 bg-black">
           <div className="flex flex-col xl:flex-row items-center justify-between gap-24">
              <div className="flex items-center gap-12">
                 <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <Film className="w-12 h-12 text-black" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-4xl font-black text-white italic tracking-[0.3em] uppercase">CineClub Nexus</p>
                    <p className="text-[11px] text-white/30 font-black uppercase tracking-[0.8em] italic">GELECEK SİNEMA SİSTEMİ // v2.1.0</p>
                 </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-10">
                 {['GÜVENLİK', 'ARŞİV', 'TERMİNAL', 'PROTOKOL'].map(link => (
                   <button key={link} className="text-[12px] font-black text-white/10 hover:text-rose-500 uppercase tracking-[1em] italic transition-colors">
                      {link}
                   </button>
                 ))}
              </div>

              <div className="flex gap-8">
                 {[Globe, Users, Layers, Activity].map((Icon, i) => (
                   <button key={i} className="w-20 h-20 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all hover:scale-110">
                      <Icon className="w-6 h-6" />
                   </button>
                 ))}
              </div>
           </div>
           
           <div className="mt-32 pt-16 border-t border-white/5 text-center">
              <p className="text-[10px] font-black text-white/5 uppercase tracking-[2em] italic">ALL SYSTEMS OPERATIONAL // TRANSMISSION SECURE</p>
           </div>
        </footer>

        <CreateRoomModal 
          isOpen={isNewRoomModalOpen} 
          onClose={() => { setIsNewRoomModalOpen(false); setSelectedMovieForRoom(null); }} 
          initialMovie={selectedMovieForRoom}
        />
      </div>
    </Layout>
  );
}
