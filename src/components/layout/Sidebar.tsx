import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  Users,
  MessageSquare,
  Settings,
  Film,
  PanelLeftClose,
  Zap
} from 'lucide-react';
import { useFriends } from '../../hooks/useFriends';
import { useChatList } from '../../hooks/useChatList';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

const navItems = [
  { icon: Home,         label: 'DOKU',       path: '/dashboard',  color: '#f43f5e' },
  { icon: Search,       label: 'KEŞİF',      path: '/discover',   color: '#3b82f6' },
  { icon: Users,        label: 'AĞ',         path: '/friends',    color: '#8b5cf6' },
  { icon: MessageSquare,label: 'AKKIŞ',      path: '/messages',   color: '#10b981' },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const { pendingRequests } = useFriends();
  const { chats } = useChatList();
  const { sidebarOpen, toggleSidebar } = useUiStore();

  const totalUnread = chats.reduce(
    (acc, chat) => acc + (user ? (chat.unreadCount?.[user.uid] || 0) : 0),
    0
  );

  return (
    <aside className={`
      relative h-full z-[100] shrink-0
      transition-all duration-[1.2s] ease-[cubic-bezier(0.2,0.8,0.2,1)]
      ${sidebarOpen ? 'w-[110px] lg:w-[130px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}
    `}>
      {/* ── THE OBSIDIAN BLADE ── */}
      <div className="h-full w-full bg-[#030305] border-r border-white/[0.03] flex flex-col items-center py-16 relative overflow-hidden group/blade">
        
        {/* Deep Atmosphere Shadows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-rose-500/[0.03] to-transparent" />
           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/[0.03] to-transparent" />
        </div>

        {/* ── CORE REACTOR (Logo) ── */}
        <div className="relative z-10 mb-24 group cursor-pointer" onClick={toggleSidebar}>
           <div className="w-14 h-14 rounded-[20px] bg-white flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-[360deg] shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <Film className="w-7 h-7 text-black" />
           </div>
           {/* Pulsing Aura */}
           <div className="absolute -inset-4 border border-white/[0.05] rounded-[28px] animate-[ping_4s_infinite]" />
        </div>

        {/* ── NEURAL NAVIGATION ── */}
        <nav className="relative z-10 flex-1 flex flex-col items-center gap-14">
           {navItems.map((item) => (
             <NavLink
               key={item.path}
               to={item.path}
               className={({ isActive }) => `
                 relative group/nav flex flex-col items-center no-drag transition-all duration-700
                 ${isActive ? 'text-white' : 'text-white/10 hover:text-white/40'}
               `}
             >
                {({ isActive }) => (
                  <>
                    <div className={`
                      w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-1000 relative
                      ${isActive ? 'bg-white shadow-[0_0_40px_rgba(255,255,255,0.2)]' : 'bg-transparent border border-white/[0.03] group-hover/nav:bg-white/[0.05] group-hover/nav:border-white/10'}
                    `}>
                       <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-current'} transition-all duration-700 group-hover/nav:scale-125`} />
                       
                       {/* Alert Pulse */}
                       {((item.path === '/friends' && pendingRequests.length > 0) || (item.path === '/messages' && totalUnread > 0)) && (
                         <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-[#030305] animate-pulse" />
                       )}

                       {/* Hover Glow */}
                       {!isActive && <div className="absolute -inset-4 bg-white/5 blur-2xl opacity-0 group-hover/nav:opacity-100 transition-opacity" />}
                    </div>
                    
                    {/* Vertical Technical Label */}
                    <span className={`text-[10px] font-black uppercase tracking-[0.5em] rotate-180 [writing-mode:vertical-lr] transition-all duration-1000 mt-4 ${isActive ? 'text-white opacity-100 italic translate-y-2' : 'opacity-0 -translate-y-4 group-hover/nav:opacity-20 group-hover/nav:translate-y-0'}`}>
                      {item.label}
                    </span>

                    {/* Active Laser Line */}
                    {isActive && (
                       <div className="absolute left-[-40px] top-6 w-12 h-[1px] bg-white group-hover:w-20 transition-all duration-1000 shadow-[0_0_10px_white]" />
                    )}
                  </>
                )}
             </NavLink>
           ))}
        </nav>

        {/* ── SYSTEM OPERATIONS (Footer) ── */}
        <div className="relative z-10 flex flex-col items-center gap-10 mt-auto">
           <div className="flex flex-col items-center gap-4 py-8 px-2 bg-white/[0.02] border border-white/[0.03] rounded-[24px]">
              <NavLink 
                to="/settings"
                className={({ isActive }) => `
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  ${isActive ? 'bg-white text-black' : 'text-white/20 hover:text-white/80'}
                `}
              >
                 <Settings className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
              </NavLink>
              <div className="w-4 h-px bg-white/5" />
              <button 
                onClick={toggleSidebar}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/20 hover:text-rose-500 transition-all active:scale-75"
              >
                 <PanelLeftClose className="w-4 h-4" />
              </button>
           </div>

           {/* Core Status Indicator */}
           <div className="group flex flex-col items-center gap-2 cursor-help">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_emerald]" />
              <Zap className="w-3 h-3 text-white/5 group-hover:text-emerald-500/40 transition-colors" />
           </div>
        </div>

        {/* Background Vertical Text Decoration */}
        <div className="absolute left-[2px] bottom-20 opacity-[0.02] pointer-events-none">
           <span className="text-[12px] font-black uppercase tracking-[2em] [writing-mode:vertical-lr] text-white">
             S Y S T E M
           </span>
        </div>
      </div>
    </aside>
  );
}
