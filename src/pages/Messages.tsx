 
import { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import {
  Send,
  Search,
  MessageSquare,
  Loader2,
  ChevronLeft,
  MoreHorizontal,
  Phone,
  Video,
  Smile,
  CheckCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useChatList, type ChatWithUser } from '../hooks/useChatList';
import { useMessages } from '../hooks/useMessages';
import type { UserProfile } from '../types';

type TimestampLike = { toDate: () => Date };

function coerceToDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as TimestampLike).toDate === 'function') {
    return (value as TimestampLike).toDate();
  }
  return null;
}

export default function Messages() {
  const { user } = useAuthStore();
  const { chats, loading } = useChatList();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = chats.filter(c =>
    c.otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChat: ChatWithUser | null = chats.find(c => c.id === activeChatId) || null;

  return (
    <Layout noPadding>
      <div className="flex h-full overflow-hidden" style={{ background: '#060912' }}>

        {/* Chat list sidebar */}
        <div
          className={`${activeChatId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-72 xl:w-80 shrink-0`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,9,18,0.85)' }}
        >
          {/* Header */}
          <div className="p-5 pb-3">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(249,115,22,0.15)' }}
              >
                <MessageSquare className="w-4 h-4" style={{ color: '#f97316' }} />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Mesajlar</h1>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {chats.length} konuşma
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Konuşma ara..."
                className="w-full pl-10 pr-4 py-2.5 text-sm text-white rounded-xl focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-xl shimmer shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded shimmer" />
                    <div className="h-2.5 w-36 rounded shimmer" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {searchQuery ? 'Konuşma bulunamadı' : 'Henüz mesaj yok'}
                </p>
              </div>
            ) : (
              filtered.map((chat) => {
                const unread = user ? (chat.unreadCount?.[user.uid] || 0) : 0;
                const isActive = chat.id === activeChatId;
                const lastMessageDate = chat.lastMessageTime ? coerceToDate(chat.lastMessageTime) : null;

                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group"
                    style={{
                      background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(59,130,246,0.15)' : '1px solid transparent',
                    }}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={chat.otherUser?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${chat.otherUser?.uid}`}
                        className="w-11 h-11 rounded-xl object-cover"
                        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                        alt=""
                      />
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{ background: '#10b981', borderColor: '#060912' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[12px] font-semibold text-white truncate">
                          {chat.otherUser?.displayName || 'Kullanıcı'}
                        </span>
                        {lastMessageDate && (
                          <span className="text-[10px] shrink-0 ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {lastMessageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] truncate" style={{ color: unread > 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>
                          {chat.lastMessage || 'Henüz mesaj yok'}
                        </span>
                        {unread > 0 && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ml-1 shrink-0"
                            style={{ background: '#f97316', color: '#fff' }}
                          >
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        {activeChatId && activeChat ? (
          <ChatWindow
            chatId={activeChatId}
            otherUser={activeChat.otherUser}
            onBack={() => setActiveChatId(null)}
          />
        ) : (
          <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(249,115,22,0.08)', border: '1px dashed rgba(249,115,22,0.15)' }}
            >
              <MessageSquare className="w-10 h-10" style={{ color: 'rgba(249,115,22,0.4)' }} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Bir konuşma seç</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Soldan bir sohbet seç veya arkadaşlarından birini mesajla
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function ChatWindow({
  chatId,
  otherUser,
  onBack
}: {
  chatId: string;
  otherUser: UserProfile | undefined | null;
  onBack: () => void;
}) {
  const { user } = useAuthStore();
  const { messages, loading, sendMessage } = useMessages(chatId);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !user) return;
    setText('');
    await sendMessage(t);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div
        className="flex items-center gap-4 pr-4 pl-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,9,18,0.7)', backdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={onBack}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative">
          <img
            src={otherUser?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${otherUser?.uid}`}
            className="w-10 h-10 rounded-xl object-cover"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            alt=""
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: '#10b981', borderColor: '#060912' }} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{otherUser?.displayName}</h3>
          <p className="text-[11px]" style={{ color: '#34d399' }}>Çevrimiçi</p>
        </div>

        <div className="flex items-center gap-1">
          {[Phone, Video, MoreHorizontal].map((Icon, i) => (
            <button
              key={i}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#3b82f6' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Henüz mesaj yok. İlk mesajı sen at!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.senderId === user?.uid;
            const showTime = i === 0 || (messages[i-1]?.senderId !== msg.senderId);

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isOwn && showTime && (
                    <img
                      src={otherUser?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${otherUser?.uid}`}
                      className="w-7 h-7 rounded-lg object-cover shrink-0 mb-1"
                      alt=""
                    />
                  )}
                  {!isOwn && !showTime && <div className="w-7 shrink-0" />}

                  <div>
                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm transition-all"
                      style={{
                        background: isOwn
                          ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                          : 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        borderRadius: isOwn
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                        boxShadow: isOwn ? '0 4px 16px rgba(59,130,246,0.2)' : 'none',
                      }}
                    >
                      {msg.text}
                    </div>
                    {isOwn && (
                      <div className="flex justify-end mt-1 pr-1">
                        <CheckCheck className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,9,18,0.6)', backdropFilter: 'blur(20px)' }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button type="button" className="shrink-0 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Bir şeyler yaz..."
            className="flex-1 bg-transparent text-sm text-white placeholder:select-none focus:outline-none"
            style={{ caretColor: '#3b82f6' }}
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 press ${text.trim() ? '' : 'opacity-30'}`}
            style={{
              background: text.trim() ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent',
              color: '#fff',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
