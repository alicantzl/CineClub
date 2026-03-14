import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  LogOut, 
  ChevronDown, 
  UserPlus, 
  MessageSquare,
  PanelLeft,
  Settings,
  ShieldCheck,
  Cpu,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import GlobalSearchModal from '../GlobalSearchModal';

export default function Header() {
  const { user, userProfile, setUser } = useAuthStore();
  const navigate = useNavigate();
  const { notifications, totalUnread } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { sidebarOpen, toggleSidebar } = useUiStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
       console.error(error);
    }
  };

  return (
    <>
    <header className="h-[100px] bg-transparent flex items-center justify-between px-12 lg:px-24 sticky top-0 z-50 no-drag pointer-events-none">
      
      {/* ── LEFT: INTELLIGENCE SCANNER (Pointer enabled) ── */}
      <div className="flex items-center gap-10 pointer-events-auto">
         {/* Sidebar Trigger (Clean) */}
         <div className={`transition-all duration-1000 flex items-center ${sidebarOpen ? 'w-0 opacity-0 -ml-12 overflow-hidden' : 'w-16 opacity-100'}`}>
            <button 
              onClick={toggleSidebar}
              className="w-14 h-14 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <PanelLeft className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
            </button>
         </div>

         {/* Advanced Tactical Search */}
         <button
           onClick={() => setIsSearchModalOpen(true)}
           className="h-[60px] w-full min-w-[340px] lg:min-w-[460px] group flex items-center bg-white/[0.01] hover:bg-white/[0.04] border border-white/[0.03] hover:border-white/10 rounded-[30px] px-8 transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group/search"
         >
           {/* Terminal Aesthetics */}
           <div className="flex items-center gap-4 mr-6">
              <Cpu className="w-4 h-4 text-rose-500/60 group-hover/search:text-rose-400 group-hover/search:rotate-90 transition-all duration-700" />
              <div className="w-[1.5px] h-4 bg-white/10" />
           </div>

           <span className="text-white/20 text-[11px] font-black uppercase tracking-[0.4em] italic group-hover/search:text-white/50 transition-colors flex-1 text-left">
             SİSTEM TARAMASI...
           </span>

           {/* Shortcut Aesthetic */}
           <div className="flex items-center gap-3">
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500/40 animate-pulse" />
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500/20" />
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500/10" />
              </div>
              <span className="text-[10px] font-black text-rose-500/40 px-3 py-1.5 bg-rose-500/5 rounded-xl border border-rose-500/20 group-hover/search:border-rose-500/40 group-hover/search:text-rose-500 transition-all italic">CMD + K</span>
           </div>

           {/* Hover Scanning Line */}
           <div className="absolute top-0 bottom-0 left-[-100%] w-[100%] bg-gradient-to-r from-transparent via-rose-500/[0.05] to-transparent group-hover/search:left-[100%] transition-all duration-[1.5s] ease-in-out pointer-events-none" />
         </button>
      </div>

      {/* ── RIGHT: NEURAL COMMANDER (Pointer enabled) ── */}
      <div className="flex items-center gap-6 pointer-events-auto">
        
        {/* Status Radar */}
        <div className="hidden xl:flex items-center gap-4 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md">
           <Activity className="w-3.5 h-3.5 text-blue-400/80 animate-pulse" />
           <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic">Bağlantı: Optimal</span>
        </div>

        {/* Notifications Hub */}
        <div className="relative" ref={dropdownRef}>
           <button 
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
             className={`w-[60px] h-[60px] flex items-center justify-center rounded-[30px] transition-all duration-700 relative overflow-hidden group/bell ${isDropdownOpen ? 'bg-white text-black' : 'bg-white/[0.02] text-white/30 border border-white/5 hover:bg-white/[0.06] hover:text-white/80'}`}
           >
             <Bell className={`w-5 h-5 relative z-10 ${totalUnread > 0 ? 'animate-[bounce_2s_infinite]' : ''}`} />
             {totalUnread > 0 && (
               <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-black z-20" />
             )}
             <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-0 group-hover/bell:opacity-100 transition-opacity" />
           </button>

           {/* Dropdown Menu */}
           {isDropdownOpen && (
             <div className="absolute right-0 mt-8 w-[400px] bg-[#08080a] border border-white/[0.08] rounded-[48px] shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-6 duration-700">
               <div className="p-12 border-b border-white/5 bg-gradient-to-r from-rose-500/[0.03] to-transparent">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h3 className="text-[14px] font-black text-white uppercase tracking-[0.5em] italic leading-none">İstihbarat</h3>
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest italic">Nexus Sosyal Ağı</p>
                     </div>
                     {totalUnread > 0 && <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{totalUnread} YENİ MESAJ</span>}
                  </div>
               </div>
               <div className="max-h-[500px] overflow-y-auto no-scrollbar py-6">
                  {notifications.length === 0 ? (
                    <div className="py-24 text-center">
                       <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                          <Bell className="w-6 h-6 text-white" />
                       </div>
                       <p className="opacity-20 italic text-[11px] font-black uppercase tracking-[0.5em]">Sinyal Yok</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <button key={notif.id} className="w-full text-left p-10 hover:bg-white/[0.03] border-b border-white/[0.03] last:border-0 transition-all flex gap-8 group/notif">
                         <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover/notif:scale-110 group-hover/notif:rotate-12 transition-all">
                            {notif.type === 'message' ? <MessageSquare className="w-5 h-5 text-blue-400" /> : <UserPlus className="w-5 h-5 text-rose-400" />}
                         </div>
                         <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                               <p className="text-[13px] font-black text-white/80 italic truncate">{notif.title}</p>
                               <span className="text-[9px] text-white/10 font-black uppercase tracking-widest whitespace-nowrap">
                                 {formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: tr })}
                               </span>
                            </div>
                            <p className="text-[11px] text-white/30 font-medium line-clamp-2 leading-relaxed">{notif.body}</p>
                         </div>
                      </button>
                    ))
                  )}
               </div>
             </div>
           )}
        </div>

        {/* ── THE COMMANDER CAPSULE ── */}
        <div className="relative" ref={userMenuRef}>
           <div 
             onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
             className={`h-[60px] pl-2 pr-8 rounded-[30px] flex items-center gap-5 transition-all duration-700 cursor-pointer border shadow-2xl ${isUserMenuOpen ? 'bg-white text-black border-white' : 'bg-[#0a0a0c] border-white/5 hover:border-white/20'}`}
           >
              <div className="relative shrink-0">
                 <div className={`absolute -inset-1 opacity-20 blur-xl rounded-full transition-all ${isUserMenuOpen ? 'bg-black' : 'bg-rose-500'}`} />
                 <img 
                   src={userProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                   className={`w-11 h-11 rounded-full object-cover border-2 transition-all ${isUserMenuOpen ? 'border-black' : 'border-white/10'}`}
                   alt="Commander"
                 />
                 <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
              </div>
              <div className="flex flex-col text-left">
                 <span className={`text-[13px] font-black uppercase tracking-[-0.03em] truncate max-w-[120px] italic leading-none`}>
                   {userProfile?.displayName || user?.displayName?.split(' ')?.[0] || 'SİNEFİL'}
                 </span>
                 <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5 opacity-40 italic`}>
                   {userProfile?.username ? `@${userProfile.username}` : 'ELITE COMMANDER'}
                 </span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-700 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
           </div>

           {/* Commander Control Panel */}
           {isUserMenuOpen && (
             <div className="absolute right-0 mt-8 w-[320px] bg-[#08080a] border border-white/[0.08] rounded-[48px] shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] overflow-hidden z-[110] animate-in fade-in slide-in-from-top-6 duration-700 p-6">
                <div className="space-y-3">
                   <button 
                     onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }}
                     className="w-full h-16 flex items-center gap-6 px-8 rounded-[32px] hover:bg-white/5 transition-all group/item text-white/40 hover:text-white"
                   >
                      <Settings className="w-5 h-5 group-hover/item:rotate-90 transition-transform" />
                      <span className="text-[12px] font-black uppercase tracking-[0.3em] italic">Arayüz Ayarları</span>
                   </button>
                   <button 
                     className="w-full h-16 flex items-center gap-6 px-8 rounded-[32px] hover:bg-white/5 transition-all group/item text-white/40 hover:text-white"
                   >
                      <ShieldCheck className="w-5 h-5 text-rose-500/80" />
                      <span className="text-[12px] font-black uppercase tracking-[0.3em] italic text-rose-500/80">Güvenlik Paneli</span>
                   </button>
                   <div className="h-px bg-white/5 mx-8 my-4" />
                   <button 
                     onClick={handleLogout}
                     className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-[40px] bg-rose-500/5 hover:bg-rose-500 transition-all text-rose-500 hover:text-white group/exit shadow-inner"
                   >
                      <LogOut className="w-6 h-6 group-hover/exit:-translate-x-2 transition-transform" />
                      <span className="text-[13px] font-black uppercase tracking-[0.4em] italic mt-1">SİSTEMİ KAPAT</span>
                   </button>
                </div>
             </div>
           )}
        </div>

      </div>
    </header>
    
    <GlobalSearchModal 
       isOpen={isSearchModalOpen} 
       onClose={() => setIsSearchModalOpen(false)} 
    />
    </>
  );
}
