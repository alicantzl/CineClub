/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Calendar, Play, Clock } from 'lucide-react';
import { getSharedWatchHistory } from '../services/historyService';
import type { WatchHistoryEntry } from '../services/historyService';
import { useAuthStore } from '../store/authStore';
import type { FriendUser } from '../types';

interface FriendProfileModalProps {
  friend: FriendUser;
  onClose: () => void;
  onMessageClick?: () => void;
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ friend, onClose, onMessageClick }) => {
  const { user } = useAuthStore();
  const [sharedHistory, setSharedHistory] = useState<WatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user && friend.uid) {
        setLoading(true);
        try {
          const history = await getSharedWatchHistory(user.uid, friend.uid);
          setSharedHistory(history);
        } catch(e) {
          console.error("Geçmiş getirilemedi", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchHistory();
  }, [user, friend.uid]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#0a0d16]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in custom-scrollbar flex flex-col max-h-[90vh]">
        
        {/* Header / Banner Area */}
        <div className="h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 relative">
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
           >
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-6 relative -mt-16 border-b border-white/5 flex-shrink-0">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <img 
                  src={friend.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.uid}`}
                  alt={friend.displayName || 'User'}
                  className="w-32 h-32 rounded-3xl border-4 border-[#0a0d16] object-cover bg-gray-800 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0a0d16]"></div>
              </div>
              
              {/* Name & Basic details */}
              <div className="pb-2 max-w-sm">
                <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">{friend.displayName}</h1>
                <p className="text-indigo-400 font-medium tracking-wide mb-3">@{friend.username || friend.email?.split('@')[0] || 'kullanici'}</p>
                {friend.bio && (
                  <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {friend.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {onMessageClick && (
              <div className="pb-2">
                <button 
                  onClick={() => {
                    onClose();
                    onMessageClick();
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Mesaj Gönder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Watch History Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            Bizim Sinema Geçmişimiz
          </h2>

          {loading ? (
             <div className="flex items-center justify-center py-12">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : sharedHistory.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
               <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-gray-300 mb-2">Henüz ortak bir hatıra yok</h3>
               <p className="text-gray-500">Birlikte bir oda kurup film izlediğinizde geçmişiniz burada görünecek.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {sharedHistory.map((item, index) => (
                <div key={item.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Node */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0d16] bg-indigo-500 text-white shadow shadow-indigo-500/50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-transform group-hover:scale-110">
                    <Play className="w-4 h-4 fill-white" />
                  </div>
                  
                  {/* Card (minimal data version) */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white/5 border border-white/5 shadow-xl transition-all hover:bg-white/10 hover:border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-400 capitalize flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.watchedAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">
                       {item.mediaTitle}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FriendProfileModal;
