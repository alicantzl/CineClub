/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Lock, 
  Globe, 
  ChevronRight,
  Shield,
  Tag as TagIcon,
  Cpu,
  Fingerprint,
  Terminal,
  Activity,
  Layers,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { createRoom } from '../services/roomService';
import { useNavigate } from 'react-router-dom';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const roomId = await createRoom({
        name,
        description,
        isPrivate,
        hostId: user.uid,
        hostName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        tags: ['NEURAL', 'CINEMA'],
        backdropUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200' 
      });
      
      onClose();
      navigate(`/room/${roomId}`);
    } catch (err: any) {
      setError('SİSTEM HATASI: ' + err.message.toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
      {/* ── DEEP NEURAL OVERLAY ── */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-[40px] transition-all duration-1000"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-intelligence-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 via-transparent to-transparent pointer-events-none" />
      </div>
      
      {/* ── THE COMMAND MODULE ── */}
      <div className="relative w-full max-w-5xl bg-[#08080a] border border-white/[0.05] rounded-[60px] shadow-[0_60px_150px_-20px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-700">
        
        {/* Top Scanline */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent animate-pulse" />
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-12 md:p-16 border-b border-white/[0.03] bg-white/[0.01] relative overflow-hidden">
           <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
              <div className="w-full h-[2px] bg-white/5 absolute animate-[scanline_10s_linear_infinite]" />
           </div>

           <div className="relative z-10 flex items-center gap-10">
              <div className="w-20 h-20 rounded-[28px] bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] rotate-3">
                 <Cpu className="w-10 h-10 text-black animate-pulse" />
              </div>
              <div>
                 <div className="flex items-center gap-4 mb-2">
                    <Activity className="w-3 h-3 text-rose-500 animate-pulse" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] italic">ALLOCATING_VIRTUAL_SECTOR</span>
                 </div>
                 <h2 className="text-6xl font-outfit font-black text-white italic uppercase tracking-tighter leading-none">Salon Başlat</h2>
              </div>
           </div>

           <button 
             onClick={onClose}
             className="relative z-10 w-16 h-16 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-rose-500 transition-all active:scale-75 mt-8 md:mt-0"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Neural Interface Form */}
        <form onSubmit={handleSubmit} className="p-12 md:p-16 space-y-16">
           {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[30px] flex items-center gap-6 animate-shake">
                 <Terminal className="w-6 h-6 text-rose-500" />
                 <p className="text-sm font-black text-rose-500 uppercase tracking-widest italic">{error}</p>
              </div>
           )}

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Identity & Protocol */}
              <div className="lg:col-span-7 space-y-12">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                       <Fingerprint className="w-4 h-4 text-white/20" />
                       <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">ODAK KİMLİĞİ (SALON ADI)</label>
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="PROTOKOL ADINI GİRİNİZ..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black border border-white/[0.05] rounded-[30px] p-8 text-white italic font-black uppercase text-2xl focus:border-rose-500/40 outline-none transition-all placeholder:text-white/5 shadow-2xl"
                    />
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                       <TagIcon className="w-4 h-4 text-white/20" />
                       <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">MİSYON DETAYLARI (AÇIKLAMA)</label>
                    </div>
                    <textarea
                      placeholder="VERİ SETİ ÖZETİ..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-black border border-white/[0.05] rounded-[40px] p-8 text-white italic font-black uppercase text-lg focus:border-rose-500/40 outline-none transition-all placeholder:text-white/5 shadow-2xl resize-none custom-scrollbar"
                    />
                 </div>
              </div>

              {/* Security Protocols */}
              <div className="lg:col-span-5 space-y-12">
                 <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">GÜVENLİK KATMAMI</label>
                       <Shield className="w-4 h-4 text-white/10" />
                    </div>
                    <div className="flex flex-col gap-6">
                       <SecurityButton 
                         active={!isPrivate} 
                         onClick={() => setIsPrivate(false)} 
                         icon={<Globe className="w-6 h-6" />}
                         title="GLO SYSTEM"
                         sub="HERKESE AÇIK"
                         desc="TÜM KULLANICILAR ERİŞEBİLİR"
                         color="emerald"
                       />
                       <SecurityButton 
                         active={isPrivate} 
                         onClick={() => setIsPrivate(true)} 
                         icon={<Lock className="w-6 h-6" />}
                         title="PRIV SEC"
                         sub="ÖZEL PROTOKOL"
                         desc="YALNIZCA YETKİLİ PERSONEL"
                         color="rose"
                       />
                    </div>
                 </div>

                 {/* System Health Info */}
                 <div className="p-8 bg-white/[0.01] border border-white/[0.03] rounded-[30px] flex items-start gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Zap className="w-6 h-6 text-white/10 shrink-0 mt-1" />
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic leading-relaxed">UYARI: SALON OLUŞTURULDUĞUNDA SİSTEM KAYNAKLARI SENKRONİZE EDİLECEKTİR. TÜM MODERASYON ARAÇLARI OTOMATİK OLARAK YÜKLENECEKTİR.</p>
                 </div>
              </div>
           </div>

           {/* Command Footer */}
           <div className="pt-16 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex items-center gap-10">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.8em]">MODÜL KİMLİĞİ</span>
                    <span className="text-sm font-black text-white/40 italic uppercase italic">CRT RM v4.0</span>
                 </div>
                 <div className="w-[1px] h-10 bg-white/5" />
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.8em]">DURUM</span>
                    <span className="text-sm font-black text-emerald-500/40 italic uppercase italic animate-pulse">OPTIMAL</span>
                 </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full md:w-auto md:min-w-[400px] h-24 bg-white text-black font-black italic rounded-[30px] text-xl uppercase tracking-[0.5em] transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(255,255,255,0.1)] flex items-center justify-center gap-6 group/submit disabled:opacity-20 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="flex gap-2">
                     <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                  </div>
                ) : (
                  <>
                    PROTOKOLÜ BAŞLAT
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                  </>
                )}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}

function SecurityButton({ active, onClick, icon, title, sub, desc, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, sub: string, desc: string, color: 'emerald' | 'rose' }) {
   const activeBg = color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500';
   const activeText = color === 'emerald' ? 'text-emerald-500' : 'text-rose-500';
   const activeBorder = color === 'emerald' ? 'border-emerald-500/40' : 'border-rose-500/40';

   return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-8 p-8 rounded-[35px] border transition-all duration-700 text-left relative overflow-hidden group ${active ? `${activeBorder} bg-white/[0.02] shadow-[0_20px_40px_rgba(0,0,0,0.5)]` : 'bg-transparent border-white/[0.03] hover:border-white/10 hover:bg-white/[0.01]'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 relative z-10 ${active ? `${activeBg} text-black` : 'bg-white/5 text-white/20'}`}>
           {icon}
        </div>
        
        <div className="flex-1 relative z-10">
           <div className="flex items-center gap-3 mb-1">
              <span className={`text-[10px] font-black tracking-[0.4em] uppercase italic ${active ? activeText : 'text-white/20'}`}>{title}</span>
              {active && <div className={`w-2 h-2 rounded-full ${activeBg} animate-ping`} />}
           </div>
           <p className={`text-xl font-black italic uppercase tracking-tighter ${active ? 'text-white' : 'text-white/40'}`}>{sub}</p>
           <p className="text-[9px] font-bold uppercase tracking-widest text-white/10 mt-1">{desc}</p>
        </div>

        {active && (
           <div className={`absolute right-[-40px] top-[-40px] w-32 h-32 ${activeBg} opacity-[0.03] blur-[40px] rounded-full`} />
        )}

        <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-700 ${active ? activeBg : 'bg-transparent'}`} />
        {!active && <CheckCircle2 className="absolute top-8 right-8 w-4 h-4 opacity-0 group-hover:opacity-10 transition-opacity" />}
      </button>
   );
}
