import { useState, useEffect } from 'react';
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
  ChevronUp
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import CreateRoomModal from '../components/CreateRoomModal';
import { subscribeToRooms } from '../services/roomService';
import { getTrendingMovies } from '../services/tmdbService';
import { useAuthStore } from '../store/authStore';
import type { Room } from '../types';
import type { TMDBMovie } from '../services/tmdbService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [trendScope, setTrendScope] = useState<'TR' | 'GLOBAL'>('GLOBAL');

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

  // Otomatik Carousel Geçişi
  useEffect(() => {
    const timer = setInterval(() => {
      if (trendingMovies.length > 0) {
        setHeroIdx(prev => (prev + 1) % Math.min(trendingMovies.length, 5));
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [trendingMovies]);

  const heroMovie = trendingMovies[heroIdx];

  const greetMsg = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'GÜNAYDIN';
    if (hr < 18) return 'TÜNAYDIN';
    return 'İYİ AKŞAMLER';
  };

  const nextHero = () => setHeroIdx(prev => (prev + 1) % Math.min(trendingMovies.length, 5));
  const prevHero = () => setHeroIdx(prev => (prev - 1 + Math.min(trendingMovies.length, 5)) % Math.min(trendingMovies.length, 5));

  return (
    <Layout noPadding>
      <div className="flex flex-col min-h-screen bg-[#000000] overflow-x-hidden relative selection:bg-rose-500/30">
        
        {/* ── ARKA PLAN KATMANI ── */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute inset-0 noise-texture mix-blend-overlay opacity-10 pointer-events-none" />
           <div className="absolute inset-0 bg-intelligence-grid opacity-[0.03]" />
           <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-rose-500/[0.04] blur-[180px] rounded-full animate-blob" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-500/[0.04] blur-[150px] rounded-full animate-blob animation-delay-2000" />
        </div>

        {/* ── HERO CAROUSEL ── */}
        <section className="relative h-[90vh] min-h-[850px] flex items-center px-10 lg:px-20 xl:px-32 overflow-hidden border-b border-white/[0.02]">
           
           {/* Dinamik Arka Plan */}
           <div className="absolute inset-0 z-0">
              {trendingMovies.slice(0, 5).map((movie, idx) => (
                <div 
                  key={movie.id}
                  className={`absolute inset-0 transition-opacity duration-[2s] ease-in-out ${heroIdx === idx ? 'opacity-60' : 'opacity-0'}`}
                >
                   <img 
                     src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                     className="w-full h-full object-cover mix-blend-screen scale-105"
                     alt=""
                   />
                   <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                   <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent" />
                </div>
              ))}
              <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none opacity-5">
                 <div className="w-full h-[1px] bg-white absolute animate-[scanline_15s_linear_infinite]" />
              </div>
           </div>

           {/* Hero İçerik */}
           <div className="relative z-10 w-full max-w-7xl pt-20">
              <div className="space-y-12">
                 
                 <div className="flex items-center gap-6 animate-fade-in-up">
                    <div className="h-[1px] w-16 bg-rose-500" />
                    <div className="flex items-center gap-3 py-1.5 px-5 rounded-full border border-rose-500/20 bg-rose-500/5 backdrop-blur-3xl">
                       <Zap className="w-4 h-4 text-rose-500" />
                       <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic">Özel Erişim // Sektör 0</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <span className="text-white/30 text-xl font-black uppercase tracking-[0.5em] block italic animate-fade-in-up delay-100">
                      {greetMsg()}, KOMUTAN {userProfile?.displayName?.split(' ')?.[0]?.toUpperCase() || 'SİNEFİL'}
                    </span>
                    <div className="relative">
                       <h1 
                         key={heroMovie?.id}
                         className="font-outfit font-black text-white italic tracking-tighter leading-[0.85] animate-float-up text-glow-rose drop-shadow-2xl" 
                         style={{ fontSize: 'clamp(3.5rem, 7vw, 9rem)' }}
                       >
                         {heroMovie?.title.toUpperCase() || 'CINECLUB'}
                       </h1>
                    </div>
                 </div>

                 <div className="max-w-3xl space-y-4 animate-fade-in-up delay-300">
                    <p className={`text-white/50 text-2xl font-medium leading-relaxed italic transition-all duration-700 ${synopsisExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
                       {heroMovie?.overview || 'Sinema verileri analiz ediliyor. Keyifli seyirler dileriz.'}
                    </p>
                    <button 
                      onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                      className="flex items-center gap-2 text-rose-500/60 hover:text-rose-500 text-sm font-black uppercase tracking-widest transition-colors italic"
                    >
                       {synopsisExpanded ? <><ChevronUp className="w-4 h-4" /> DAHA AZ GÖSTER</> : <><ChevronDown className="w-4 h-4" /> DEVAMINI OKU</>}
                    </button>
                 </div>

                 <div className="flex flex-wrap items-center gap-8 pt-6 animate-fade-in-up delay-500">
                    <button className="h-24 px-14 rounded-full bg-white text-black font-black uppercase tracking-[0.3em] flex items-center gap-5 hover:scale-105 transition-all shadow-xl group/btn">
                       <Play className="w-6 h-6 fill-black" />
                       Hemen İzle
                    </button>
                    <button className="h-24 px-12 rounded-full border border-white/20 bg-white/[0.02] hover:bg-white/[0.08] text-white font-black uppercase tracking-[0.3em] flex items-center gap-5 transition-all backdrop-blur-3xl group/btn2">
                       <MonitorPlay className="w-6 h-6 opacity-40 group-hover/btn2:opacity-100 transition-all" />
                       Salon Keşfet
                    </button>
                    
                    <div className="flex items-center gap-10 px-10 border-l border-white/10 h-16 ml-4 hidden xl:flex bg-white/[0.01] rounded-3xl">
                       <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-rose-500/50 uppercase tracking-[0.3em] italic flex items-center gap-2">
                            <Star className="w-3 h-3 fill-rose-500" /> PUAN
                          </span>
                          <span className="text-2xl font-outfit font-black italic text-white">{heroMovie?.vote_average?.toFixed(1) || '0.0'}</span>
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-[0.3em] italic flex items-center gap-2">
                            <History className="w-3 h-3" /> YIL
                          </span>
                          <span className="text-2xl font-outfit font-black italic text-white">{heroMovie?.release_date?.substring(0,4) || '2026'}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Navigasyon Okları */}
           <div className="absolute right-12 bottom-20 flex flex-col items-center gap-10 z-20">
              <div className="flex flex-col gap-4">
                 <button onClick={prevHero} className="w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white hover:text-black transition-all group">
                    <ChevronLeft className="w-5 h-5 group-hover:scale-110" />
                 </button>
                 <button onClick={nextHero} className="w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white hover:text-black transition-all group">
                    <ChevronRight className="w-5 h-5 group-hover:scale-110" />
                 </button>
              </div>
              <div className="flex flex-col gap-5">
                 {[0, 1, 2, 3, 4].map((idx) => (
                   <button 
                     key={idx}
                     onClick={() => setHeroIdx(idx)}
                     className={`w-1 transition-all duration-700 rounded-full ${heroIdx === idx ? 'bg-rose-500 h-16' : 'bg-white/10 h-8 hover:bg-white/20'}`}
                   />
                 ))}
              </div>
           </div>
        </section>

        {/* ── İSTATİSTİKLER ── */}
        <section className="py-20 px-10 lg:px-20 xl:px-32 relative z-20">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'AKTİF ODALAR', value: rooms.length.toString().padStart(2, '0'), icon: Zap, detail: 'CANLI OTURUMLAR' },
                { label: 'TOPLULUK', value: '1.4K', icon: Users, detail: 'AKTİF ÜYELER' },
                { label: 'ARŞİV HACMİ', value: '12.8TB', icon: Database, detail: 'SİNEMA VERİSİ' }
              ].map((stat, i) => (
                <div key={i} className="group p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-700 relative overflow-hidden glass-simple">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                         <stat.icon className="w-5 h-5 text-white/50 group-hover:text-white transition-colors animate-pulse-slow" />
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-1">{stat.label}</span>
                         <span className="text-[9px] font-black text-white/10 uppercase tracking-widest italic group-hover:text-white/30 transition-colors">{stat.detail}</span>
                      </div>
                   </div>
                   <h4 className="text-7xl font-outfit font-black italic tracking-tighter text-white uppercase group-hover:translate-x-2 transition-transform duration-700">{stat.value}</h4>
                </div>
              ))}
           </div>
        </section>

        {/* ── AKTİF ODALAR ── */}
        <section className="py-24 px-10 lg:px-20 xl:px-32 relative">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 animate-fade-in">
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.6em] italic">CANLI AKIŞ TAKİBİ</span>
                 </div>
                 <h2 className="text-8xl font-outfit font-black italic tracking-tighter text-white leading-none uppercase">Aktif Odalar</h2>
              </div>
              <button 
                onClick={() => setIsNewRoomModalOpen(true)}
                className="group h-20 px-10 rounded-[25px] bg-emerald-500 text-black flex items-center gap-6 shadow-2xl hover:scale-105 transition-all font-black uppercase tracking-widest italic"
              >
                 <PlusCircle className="w-6 h-6" />
                 Yeni Oda Oluştur
              </button>
           </div>

           <div className="flex gap-10 overflow-x-auto no-scrollbar py-4 -mx-10 px-10 mask-linear-edge-x">
              {rooms.length === 0 ? (
                <div onClick={() => setIsNewRoomModalOpen(true)} className="w-full h-[400px] flex flex-col items-center justify-center bg-white/[0.01] rounded-[60px] border border-dashed border-white/5 hover:bg-white/[0.02] hover:border-emerald-500/20 transition-all cursor-pointer group">
                   <MonitorPlay className="w-12 h-12 text-white/10 mb-6 group-hover:scale-110 group-hover:text-emerald-500/30 transition-all duration-700" />
                   <p className="text-xl font-black uppercase tracking-[0.5em] italic text-white/20 group-hover:text-white/40 transition-colors">Aktif oda aranıyor...</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <div key={room.id} onClick={() => navigate(`/room/${room.id}`)} className="min-w-[550px] aspect-[16/9] rounded-[60px] bg-[#0c0c0e] border border-white/5 overflow-hidden group/room cursor-pointer transition-all duration-700 hover:border-emerald-500/30 relative">
                     <img 
                       src={room.backdropUrl || room.moviePoster || `https://image.tmdb.org/t/p/w500${heroMovie?.backdrop_path}`} 
                       className="w-full h-full object-cover opacity-30 group-hover/room:opacity-70 transition-all duration-[1.5s]" 
                       alt="" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                     <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start gap-4">
                        <div className="flex items-center gap-3 py-1.5 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">AKTİF YAYIN</span>
                        </div>
                        <h3 className="text-5xl font-outfit font-black text-white italic uppercase tracking-tighter group-hover/room:text-emerald-400 transition-colors">{room.name}</h3>
                        <div className="flex justify-between w-full pt-4 border-t border-white/5">
                           <div className="flex items-center gap-3 text-white/30">
                              <Users className="w-4 h-4" />
                              <span className="text-lg font-bold uppercase italic">{room.activeUsersCount || 0} İzleyici</span>
                           </div>
                           <span className="text-[11px] font-black text-white/10 uppercase tracking-widest italic">{room.hostName.toUpperCase()}</span>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </section>

        {/* ── TREND ARŞİVİ ── */}
        <section className="py-32 px-10 lg:px-20 xl:px-32 relative bg-[#050507]">
           <div className="absolute inset-0 bg-intelligence-grid opacity-[0.01] pointer-events-none" />
           
           <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-24 gap-12 relative z-10 animate-fade-in">
              <div className="space-y-6">
                 <div className="flex items-center gap-5">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.8em] italic">KÜRESEL VE YEREL VERİLER</span>
                 </div>
                 <h2 className="text-[8.5rem] font-outfit font-black italic tracking-tighter text-white leading-none uppercase">Haftalık Trendler</h2>
              </div>
              
              {/* Trend Scope Toggles */}
              <div className="flex p-2 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-3xl shrink-0">
                 <button 
                   onClick={() => setTrendScope('TR')}
                   className={`px-8 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${trendScope === 'TR' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
                 >
                    Türkiye Trendleri
                 </button>
                 <button 
                   onClick={() => setTrendScope('GLOBAL')}
                   className={`px-8 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${trendScope === 'GLOBAL' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
                 >
                    Global Trendler
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
              {isLoading ? (
                 <div className="col-span-full py-40 flex flex-col items-center justify-center gap-6 animate-pulse">
                    <div className="w-20 h-20 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em]">Veri Tabanı Senkronize Ediliyor...</span>
                 </div>
              ) : (
                trendingMovies.slice(5, 17).map((movie) => (
                  <div key={movie.id} onClick={() => navigate('/discover')} className="flex flex-col sm:flex-row gap-8 p-8 rounded-[40px] bg-white/[0.01] border border-white/[0.05] hover:bg-white/[0.03] hover:border-blue-500/20 transition-all duration-700 cursor-pointer group/card relative overflow-hidden glass-simple">
                     
                     <div className="w-48 aspect-[2/3] rounded-[32px] overflow-hidden bg-black shrink-0 relative z-10 shadow-xl group-hover/card:scale-105 transition-transform duration-700">
                        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full h-full object-cover" alt="" />
                     </div>
                     
                     <div className="flex flex-col justify-center gap-6 relative z-10">
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 italic">ARŞİV KAYDI</span>
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{movie.release_date.substring(0,4)}</span>
                           </div>
                           <h4 className="text-4xl font-outfit font-black text-white italic uppercase tracking-tighter group-hover/card:text-blue-400 transition-colors leading-tight">{movie.title}</h4>
                        </div>
                        
                        <p className="text-[15px] text-white/30 italic line-clamp-2 leading-relaxed uppercase tracking-tight group-hover/card:text-white/50 transition-colors">{movie.overview}</p>
                        
                        <div className="flex items-center gap-8 pt-2">
                           <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                              <span className="text-xl font-outfit font-black text-white italic">{movie.vote_average.toFixed(1)}</span>
                           </div>
                           <button className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3 hover:text-white transition-colors">
                              VERİLER <ArrowRight className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-32 px-10 lg:px-20 xl:px-32 border-t border-white/5 relative z-10 bg-black">
           <div className="flex flex-col xl:flex-row items-center justify-between gap-16">
              <div className="flex items-center gap-10">
                 <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center">
                    <Film className="w-10 h-10 text-black" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-3xl font-black text-white italic tracking-[0.2em] uppercase">CineClub Nexus</p>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em] italic">Gelişmiş Sinema Arayüzü // v2.0.4</p>
                 </div>
              </div>
              <div className="flex gap-6">
                 {[Globe, Users, Layers, Activity].map((Icon, i) => (
                   <div key={i} className="w-14 h-14 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all">
                      <Icon className="w-5 h-5" />
                   </div>
                 ))}
              </div>
           </div>
        </footer>

        <CreateRoomModal isOpen={isNewRoomModalOpen} onClose={() => setIsNewRoomModalOpen(false)} />
      </div>
    </Layout>
  );
}
