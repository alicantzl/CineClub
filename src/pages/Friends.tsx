import { useState } from 'react';
import Layout from '../components/layout/Layout';
import {
  Users,
  UserPlus,
  Search,
  MessageSquare,
  UserMinus,
  Check,
  X,
  Clock,
  UserCheck,
  Send,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFriends } from '../hooks/useFriends';
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend
} from '../services/friendService';
import { createOrGetChat } from '../services/messageService';
import { useNavigate } from 'react-router-dom';
import type { UserProfile, FriendUser } from '../types';

type Tab = 'friends' | 'requests' | 'find';

export default function Friends() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { friendsList, pendingRequests, sentRequests, loading } = useFriends();
  const [tab, setTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    setSearchLoading(true);
    try {
      if (user) {
        const r = await searchUsers(searchQuery.trim(), user.uid);
        setSearchResults(r);
      }
    } catch (e) { console.error(e); }
    finally { setSearchLoading(false); }
  };

  const filteredFriends = friendsList.filter(f =>
    f.displayName?.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.username?.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'friends',  label: 'Arkadaşlar',  icon: Users,    count: friendsList.length },
    { id: 'requests', label: 'İstekler',     icon: Clock,    count: pendingRequests.length },
    { id: 'find',     label: 'Bul & Ekle',   icon: UserPlus, count: 0 },
  ];

  if (loading) {
    return (
      <Layout noPadding>
        <div className="flex-1 flex items-center justify-center" style={{ background: '#060912' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#3b82f6' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout noPadding>
      <div className="flex h-full overflow-hidden" style={{ background: '#060912' }}>

        {/* Left sidebar */}
        <div
          className="w-72 flex flex-col shrink-0 h-full"
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,9,18,0.8)' }}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <Users className="w-4.5 h-4.5" style={{ color: '#10b981' }} />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Sosyal</h1>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Topluluğun</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-3 space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                style={{
                  background: tab === t.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: tab === t.id ? '#93c5fd' : 'rgba(255,255,255,0.5)',
                  border: tab === t.id ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                }}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: t.id === 'requests' ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)',
                      color: t.id === 'requests' ? '#fb923c' : '#60a5fa',
                    }}
                  >
                    {t.count < 10 ? t.count : '9+'}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Online friends preview */}
          {friendsList.filter(f => f.status === 'online').length > 0 && (
            <div className="mt-6 px-3 flex-1 overflow-y-auto custom-scrollbar">
              <p className="px-4 text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Çevrimiçi — {friendsList.filter(f => f.status === 'online').length}
              </p>
              {friendsList.filter(f => f.status === 'online').slice(0, 8).map(f => (
                <div key={f.uid} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/[0.03] transition-all duration-200 cursor-default group">
                  <div className="relative shrink-0">
                    <img
                      src={f.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${f.uid}`}
                      className="w-8 h-8 rounded-lg object-cover"
                      alt=""
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: '#10b981', borderColor: '#060912' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white truncate">{f.displayName}</p>
                    <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>@{f.username}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (user) {
                        const id = await createOrGetChat(user.uid, f.uid);
                        navigate(`/messages/${id}`);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200"
                    style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Friends tab */}
          {tab === 'friends' && (
            <div className="p-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Arkadaş Listem</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    type="text"
                    value={friendSearch}
                    onChange={e => setFriendSearch(e.target.value)}
                    placeholder="Arkadaş ara..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-white rounded-xl focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  />
                </div>
              </div>

              {filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Users className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <p className="font-semibold text-white mb-1">
                    {friendSearch ? 'Eşleşen arkadaş yok' : 'Henüz arkadaşın yok'}
                  </p>
                  <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {friendSearch ? 'Farklı bir kelime dene' : 'Bul & Ekle sekmesinden arkadaş ara'}
                  </p>
                  {!friendSearch && (
                    <button
                      onClick={() => setTab('find')}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white press"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                    >
                      Arkadaş Bul
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends.map((f, i) => (
                    <FriendCard
                      key={f.uid}
                      friend={f}
                      i={i}
                      onMessage={async () => {
                        if (user) {
                          const id = await createOrGetChat(user.uid, f.uid);
                          navigate(`/messages/${id}`);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests tab */}
          {tab === 'requests' && (
            <div className="p-8 animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-6">Arkadaşlık İstekleri</h2>

              {pendingRequests.length === 0 && sentRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <UserCheck className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <p className="font-semibold text-white mb-1">Bekleyen istek yok</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Tüm istekler işlendi</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {pendingRequests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f97316' }} />
                        <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Gelen İstekler ({pendingRequests.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingRequests.map((r, i) => (
                          <PendingCard key={r.uid} request={r} type="incoming" i={i} />
                        ))}
                      </div>
                    </div>
                  )}
                  {sentRequests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
                        <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Gönderilen İstekler ({sentRequests.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sentRequests.map((r, i) => (
                          <PendingCard key={r.uid} request={r} type="outgoing" i={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Find tab */}
          {tab === 'find' && (
            <div className="p-8 animate-fade-in max-w-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Arkadaş Bul</h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Kullanıcı adı veya isimle ara, arkadaş ol
              </p>

              <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Kullanıcı adı veya isim..."
                    className="w-full pl-11 pr-4 py-3 text-sm text-white rounded-xl focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all press"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ara'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((result, i) => {
                    const isFriend = friendsList.some(f => f.uid === result.uid);
                    const isPending = pendingRequests.some(r => r.uid === result.uid) || sentRequests.some(r => r.uid === result.uid);

                    return (
                      <div
                        key={result.uid}
                        className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 animate-float-up"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          animationDelay: `${i * 60}ms`
                        }}
                      >
                        <img
                          src={result.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${result.uid}`}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                          alt=""
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{result.displayName}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>@{result.username}</p>
                        </div>
                        {isFriend ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                            <Check className="w-3.5 h-3.5" /> Arkadaş
                          </div>
                        ) : isPending ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                            <Clock className="w-3.5 h-3.5" /> Beklemede
                          </div>
                        ) : (
                          <button
                            onClick={() => user && sendFriendRequest(user.uid, result.uid)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold text-white press transition-all"
                            style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Ekle
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !searchLoading && (
                <div className="text-center py-12">
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    "{searchQuery}" için kullanıcı bulunamadı
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function FriendCard({ friend, i, onMessage }: { friend: FriendUser; i: number; onMessage: () => void }) {
  const isOnline = friend.status === 'online';

  return (
    <div
      className="group p-5 rounded-2xl transition-all duration-300 animate-float-up hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        animationDelay: `${i * 60}ms`,
      }}
    >
      {/* Avatar */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <img
            src={friend.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${friend.uid}`}
            className="w-14 h-14 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            alt=""
          />
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
            style={{ background: isOnline ? '#10b981' : '#4b5563', borderColor: '#060912' }}
          />
        </div>
        <button
          onClick={async () => { try { await removeFriend(friend.friendshipId); } catch(e) { console.error(e); } }}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <UserMinus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info */}
      <div className="mb-4">
        <h3 className="font-bold text-white text-sm mb-0.5 truncate group-hover:text-blue-300 transition-colors">
          {friend.displayName}
        </h3>
        <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>@{friend.username}</p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isOnline ? '#10b981' : '#4b5563' }} />
        <span className="text-[10px]" style={{ color: isOnline ? '#34d399' : 'rgba(255,255,255,0.3)' }}>
          {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
        </span>
      </div>

      {/* Action */}
      <button
        onClick={onMessage}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 press"
        style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}
      >
        <MessageSquare className="w-4 h-4" />
        Mesaj At
      </button>
    </div>
  );
}

function PendingCard({ request, type, i }: { request: FriendUser; type: 'incoming' | 'outgoing'; i: number }) {
  return (
    <div
      className="p-5 rounded-2xl transition-all duration-300 animate-float-up"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${type === 'incoming' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)'}`,
        animationDelay: `${i * 60}ms`
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={request.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${request.uid}`}
          className="w-12 h-12 rounded-2xl object-cover shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          alt=""
        />
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">{request.displayName}</p>
          <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>@{request.username}</p>
        </div>
      </div>

      {type === 'incoming' ? (
        <div className="flex gap-2">
          <button
            onClick={() => acceptFriendRequest(request.friendshipId)}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white press"
            style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
          >
            <span className="flex items-center justify-center gap-1.5"><Check className="w-3.5 h-3.5" /> Kabul</span>
          </button>
          <button
            onClick={() => rejectFriendRequest(request.friendshipId)}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold press"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
          >
            <span className="flex items-center justify-center gap-1.5"><X className="w-3.5 h-3.5" /> Reddet</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => rejectFriendRequest(request.friendshipId)}
          className="w-full py-2.5 rounded-xl text-[12px] font-semibold press"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
        >
          İptal Et
        </button>
      )}
    </div>
  );
}
