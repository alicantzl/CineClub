import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Maximize, Volume2, VolumeX, MessageSquare, ArrowLeft, Settings, Info, Send, LogOut, Trash2, Search, ChevronRight, ChevronLeft, BarChart2, X, Plus, Check, Youtube, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { subscribeToRoom, deleteRoom, setRoomMovie, updatePlayback, startPoll, votePoll, endPoll } from '../services/roomService';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import { joinRoomPresence, leaveRoomPresence, subscribeToRoomUsers } from '../services/presenceService';
import { sendReaction, subscribeToReactions } from '../services/reactionService';
import { logWatchHistory } from '../services/historyService';
import type { ChatMessage } from '../services/chatService';
import type { Room as RoomType, OnlineUser } from '../types';
import MovieSearchModal from '../components/MovieSearchModal';
import YoutubeSearchModal from '../components/YoutubeSearchModal';
import { WebVideoModal } from '../components/WebVideoModal';
import YouTube from 'react-youtube';
import Hls from 'hls.js';
import type { YouTubeProps } from 'react-youtube';
import type { TMDBMovie } from '../services/tmdbService';
import type { YouTubeVideo } from '../services/youtubeService';

interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  setPlaybackQuality: (quality: string) => void;
}

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();

  const [room, setRoom] = useState<RoomType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isYoutubeSearchOpen, setIsYoutubeSearchOpen] = useState(false);
  const [isWebVideoModalOpen, setIsWebVideoModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');

  // Custom Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEmojiOpen, setIsEmojiOpen] = useState(true);

  // Floating Reactions State
  const [activeReactions, setActiveReactions] = useState<{ id: string, emoji: string, leftPos: number }[]>([]);

  // Poll State
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Advanced Media Tracking States
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(80);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null); // To control YouTube Iframe

  const videoRef = useRef<HTMLVideoElement>(null); // Native video element for web streams
  const audioElRef = useRef<HTMLAudioElement>(null); // Native audio element for optional audio
  const hlsRef = useRef<Hls | null>(null);           // HLS.js instance for video
  const hlsAudioRef = useRef<Hls | null>(null);     // HLS.js instance for audio

  // Auto-scroll to bottom of chat
  // Helper to detect if a URL is an HLS stream
  const isHls = (url: string) => url?.includes('.m3u8') || url?.includes('chunklist') || url?.includes('playlist');

  // Helper to build local proxy URL (Vite dev server proxies /hls-proxy/* -> stream server)
  // NOTE: In Electron production, CORS is handled by main process session hook - no proxy needed

  // HLS.js setup for video
  useEffect(() => {
    const url = room?.webUrl;
    if (!url || !videoRef.current) return;

    const videoEl = videoRef.current;
    // eslint-disable-next-line
    setPlaybackError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls(url) && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsRef.current = hls;

      // Wrap with our native proxy to bypass CORS/403
      const srcUrl = url.replace('https://', 'proxy://');
      console.log('Setting proxied movie URL:', srcUrl);

      hls.loadSource(srcUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.ERROR, (_e: unknown, data: { type: string; details: string; fatal: boolean }) => {
        console.warn('HLS error:', data.type, data.details, 'fatal:', data.fatal);
        if (data.fatal) {
          setPlaybackError('Yayın yüklenemedi. Lütfen linki kontrol edin veya tekrar deneyin.');
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = url.replace('https://', 'proxy://');
    } else {
      videoEl.src = url.replace('https://', 'proxy://');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      videoEl.src = '';
    };
  }, [room?.webUrl]);

  // HLS.js setup for audio track
  useEffect(() => {
    const url = room?.webAudioUrl;
    if (!url || !audioElRef.current) {
      if (hlsAudioRef.current) { hlsAudioRef.current.destroy(); hlsAudioRef.current = null; }
      return;
    }

    const audioEl = audioElRef.current;
    const srcUrl = url.replace('https://', 'proxy://');

    if (hlsAudioRef.current) { hlsAudioRef.current.destroy(); hlsAudioRef.current = null; }

    if (isHls(url) && Hls.isSupported()) {
      const hls = new Hls();
      hlsAudioRef.current = hls;
      hls.loadSource(srcUrl);
      hls.attachMedia(audioEl);
    } else {
      audioEl.src = srcUrl;
    }

    return () => {
      if (hlsAudioRef.current) { hlsAudioRef.current.destroy(); hlsAudioRef.current = null; }
      audioEl.src = '';
    };
  }, [room?.webAudioUrl]);

  // Sync play/pause for native elements
  useEffect(() => {
    if (!room?.webUrl) return;
    const videoEl = videoRef.current;
    const audioEl = audioElRef.current;
    if (!videoEl) return;
    if (isPlaying) {
      videoEl.play().catch(() => { });
      if (audioEl) audioEl.play().catch(() => { });
    } else {
      videoEl.pause();
      if (audioEl) audioEl.pause();
    }
  }, [isPlaying, room?.webUrl]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }
  }, [messages]);

  // ─── Playback Polling & Sync Effect ───
  useEffect(() => {
    if (!id || !room) return;
    const isHost = room.hostId === user?.uid;

    const interval = setInterval(() => {
      let currentPos = 0;
      let totalDuration = 0;

      if (room.youtubeVideoId && playerRef.current) {
        currentPos = playerRef.current.getCurrentTime() || 0;
        totalDuration = playerRef.current.getDuration() || 0;
      } else if (room.webUrl && videoRef.current) {
        currentPos = videoRef.current.currentTime || 0;
        totalDuration = videoRef.current.duration || 0;
      }

      if (!isSeeking) {
        setCurrentTime(currentPos);
        setDuration(totalDuration);
      }

      // Host: Periodic sync to Firestore (every 3 seconds to be more responsive)
      const now = Date.now();
      if (isHost && isPlaying && !isSeeking && (now - lastUpdateRef.current > 3000)) {
        updatePlayback(id, true, currentPos);
        lastUpdateRef.current = now;
      }
    }, 500);

    return () => clearInterval(interval);
  }, [id, room, isPlaying, isSeeking, user?.uid]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    if (room?.youtubeVideoId && playerRef.current) {
      playerRef.current.seekTo(newTime);
    } else if (room?.webUrl && videoRef.current) {
      videoRef.current.currentTime = newTime;
      if (audioElRef.current) audioElRef.current.currentTime = newTime;
    }

    if (id && room?.hostId === user?.uid) {
      await updatePlayback(id, isPlaying, newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    if (newVol > 0) {
      setIsMuted(false);
    }

    if (room?.youtubeVideoId && playerRef.current) {
      playerRef.current.setVolume(newVol);
    } else if (videoRef.current) {
      videoRef.current.volume = newVol / 100;
      if (audioElRef.current) audioElRef.current.volume = newVol / 100;
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const targetVol = previousVolume || 80;
      setVolume(targetVol);
      if (room?.youtubeVideoId && playerRef.current) {
        playerRef.current.setVolume(targetVol);
      } else if (videoRef.current) {
        videoRef.current.volume = targetVol / 100;
        if (audioElRef.current) audioElRef.current.volume = targetVol / 100;
      }
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      setVolume(0);
      if (room?.youtubeVideoId && playerRef.current) {
        playerRef.current.setVolume(0);
      } else if (videoRef.current) {
        videoRef.current.volume = 0;
        if (audioElRef.current) audioElRef.current.volume = 0;
      }
    }
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribeRoom = subscribeToRoom(id, (fetchedRoom) => {
      setRoom(fetchedRoom);
      setLoading(false);

      if (!fetchedRoom && !loading && !isDeleting) {
        navigate('/dashboard');
        return;
      }

      // Video Playback Sync Logic
      if (fetchedRoom) {
        setIsPlaying(fetchedRoom.status === 'playing');

        const isYoutube = !!fetchedRoom.youtubeVideoId;

        if (isYoutube && playerRef.current) {
          const playerState = playerRef.current.getPlayerState ? playerRef.current.getPlayerState() : null;
          // 1 = playing, 2 = paused
          if (fetchedRoom.status === 'playing' && playerState !== 1) {
            if (playerRef.current.playVideo) playerRef.current.playVideo();
            const currentTime = playerRef.current.getCurrentTime();
            if (fetchedRoom.currentTimestamp && Math.abs(currentTime - fetchedRoom.currentTimestamp) > 3) {
              if (playerRef.current.seekTo) playerRef.current.seekTo(fetchedRoom.currentTimestamp);
            }
          } else if (fetchedRoom.status === 'paused' && playerState !== 2) {
            if (playerRef.current.pauseVideo) playerRef.current.pauseVideo();
            if (fetchedRoom.currentTimestamp) {
              if (playerRef.current.seekTo) playerRef.current.seekTo(fetchedRoom.currentTimestamp);
            }
          }
        } else if (fetchedRoom.webUrl) {
          // For native video element sync
          const videoEl = videoRef.current;
          const audioEl = audioElRef.current;
          if (videoEl) {
            if (fetchedRoom.status === 'playing') {
              if (fetchedRoom.currentTimestamp && Math.abs(videoEl.currentTime - fetchedRoom.currentTimestamp) > 3) {
                videoEl.currentTime = fetchedRoom.currentTimestamp;
                if (audioEl) audioEl.currentTime = fetchedRoom.currentTimestamp;
              }
            } else if (fetchedRoom.status === 'paused') {
              if (fetchedRoom.currentTimestamp && Math.abs(videoEl.currentTime - fetchedRoom.currentTimestamp) > 3) {
                videoEl.currentTime = fetchedRoom.currentTimestamp;
                if (audioEl) audioEl.currentTime = fetchedRoom.currentTimestamp;
              }
            }
          }
        }
      }
    });

    const unsubscribeChat = subscribeToMessages(id, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    // RTDB Presence
    const unsubscribeUsers = subscribeToRoomUsers(id, (users) => {
      setOnlineUsers(users);
    });

    // RTDB Reactions
    const unsubscribeReactions = subscribeToReactions(id, (reaction) => {
      const newReaction = {
        id: reaction.id,
        emoji: reaction.emoji,
        leftPos: Math.random() * 80 + 10 // Rastgele X ekseni (10% - 90% arası)
      };
      setActiveReactions(prev => [...prev, newReaction]);

      // Animasyon bittikten sonra state'ten de temizle (yaklaşık 2.5 sn - 3 sn css ile senkron)
      setTimeout(() => {
        setActiveReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    if (user) {
      joinRoomPresence(id, {
        uid: user.uid,
        displayName: userProfile?.displayName || userProfile?.username || user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        photoURL: userProfile?.avatarUrl || user.photoURL
      });
    }

    return () => {
      unsubscribeRoom();
      unsubscribeChat();
      unsubscribeUsers();
      unsubscribeReactions();
      if (user) {
        leaveRoomPresence(id, user.uid);
      }
    };
  }, [id, navigate, loading, isDeleting, user, userProfile?.displayName, userProfile?.username, userProfile?.avatarUrl]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !user || !id) return;

    const text = chatMessage.trim();
    setChatMessage(''); // Clear input optimistically

    try {
      await sendMessage(id, {
        text,
        userId: user.uid,
        userName: userProfile?.displayName || userProfile?.username || user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        userPhotoUrl: userProfile?.avatarUrl || user.photoURL
      });
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
    }
  };

  const handleReaction = (emoji: string) => {
    if (!user || !id) return;
    sendReaction(id, {
      emoji,
      userId: user.uid,
      userName: userProfile?.displayName || userProfile?.username || user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
    });
  };

  const handleCloseRoom = async () => {
    if (!id || !user) return;
    if (window.confirm('Bu odayı kapatmak istediğinize emin misiniz? Tüm katılımcılar odadan çıkarılacaktır.')) {
      setIsDeleting(true);
      try {
        await deleteRoom(id);
        navigate('/dashboard');
      } catch (error) {
        console.error("Oda silinirken hata oldu:", error);
        setIsDeleting(false);
      }
    }
  };

  const handleLeaveRoom = () => {
    if (id && user) {
      leaveRoomPresence(id, user.uid);
    }
    navigate('/dashboard');
  };

  const handleMovieSelect = async (movie: TMDBMovie, trailerId: string) => {
    if (!id) return;
    setIsSearchOpen(false);
    await setRoomMovie(id, {
      movieTitle: movie.title,
      backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '',
      moviePoster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
      youtubeVideoId: trailerId
    });

    // İzleme geçmişine kaydet (Database'i yormamak için sadece host/video seçen kişi tetikler)
    const participantIds = onlineUsers.map(u => u.uid);
    if (participantIds.length > 0) {
      await logWatchHistory(id, movie.title, participantIds);
    }
  };

  const handleYoutubeSelect = async (video: YouTubeVideo) => {
    if (!id) return;
    setIsYoutubeSearchOpen(false);
    await setRoomMovie(id, {
      movieTitle: video.title,
      backdropUrl: video.thumbnail,
      moviePoster: video.thumbnail,
      youtubeVideoId: video.id
    });

    const participantIds = onlineUsers.map(u => u.uid);
    if (participantIds.length > 0) {
      await logWatchHistory(id, video.title, participantIds);
    }
  };

  const handleWebUrlSelect = async (url: string, audioUrl?: string) => {
    if (!id) return;
    try {
      console.log("Setting web movie URL:", url, "audioUrl:", audioUrl);
      // Pass null (not undefined) so Firestore clears old webAudioUrl field
      await setRoomMovie(id, {
        movieTitle: 'Web Yayını',
        backdropUrl: '',
        moviePoster: '',
        youtubeVideoId: '',
        webUrl: url,
        webAudioUrl: audioUrl || null
      });

      setIsWebVideoModalOpen(false);
      setPlaybackError(null);

      const participantIds = onlineUsers.map(u => u.uid);
      if (participantIds.length > 0) {
        await logWatchHistory(id, 'Web Yayını', participantIds);
      }
    } catch (error) {
      console.error("Web linki eklenirken hata oluştu:", error);
      setPlaybackError("Link eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;

    // Force highest quality available
    if (event.target.setPlaybackQuality) {
      event.target.setPlaybackQuality('highres');
    }

    // Initial sync
    if (room?.status === 'playing') {
      event.target.playVideo();
      if (room.currentTimestamp) event.target.seekTo(room.currentTimestamp);
    } else if (room?.currentTimestamp) {
      event.target.seekTo(room.currentTimestamp);
    }
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = PLAYING, 3 = BUFFERING
    if (event.data === 1 || event.data === 3) {
      if (event.target.setPlaybackQuality) {
        event.target.setPlaybackQuality('highres');
      }
    }
  };

  const handleTogglePlay = async () => {
    if (!id) return;
    const newIsPlaying = !isPlaying;
    let currentTime = 0;

    if (room?.youtubeVideoId && playerRef.current) {
      currentTime = playerRef.current.getCurrentTime() || 0;
    } else if (room?.webUrl && videoRef.current) {
      currentTime = videoRef.current.currentTime || 0;
    }

    await updatePlayback(id, newIsPlaying, currentTime);
  };

  // Listeners for Youtube player internal state changes to push to Firebase
  const handleYTPlay = async (event: { target: YTPlayer }) => {
    if (!id || isPlaying) return;
    const time = event.target.getCurrentTime();
    await updatePlayback(id, true, time);
  };

  const handleYTPause = async (event: { target: YTPlayer }) => {
    if (!id || !isPlaying) return;
    const time = event.target.getCurrentTime();
    await updatePlayback(id, false, time);
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#030712] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Sinema salonuna bağlanılıyor...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen bg-[#030712] flex items-center justify-center text-white flex-col space-y-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
          <Info className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Oda Bulunamadı veya Kapandı</h2>
          <p className="text-gray-400 max-w-sm">Bu oda yayıncısı tarafından kapatılmış olabilir veya geçerli bir bağlantıya sahip değilsiniz.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium border border-white/10">Ana Sayfaya Dön</button>
      </div>
    );
  }

  const isHost = user?.uid === room.hostId;

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !user || !id) return;
    const validOptions = pollOptions.filter(o => o.trim());
    if (validOptions.length < 2) return;

    try {
      await startPoll(id, pollQuestion.trim(), validOptions, user.uid);
      setIsPollModalOpen(false);
      setPollQuestion('');
      setPollOptions(['', '']);
    } catch (error) {
      console.error("Anket eklenemedi:", error);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!room?.activePoll || !user || !id) return;
    await votePoll(id, optionId, user.uid, room.activePoll);
  };

  const handleEndPoll = async () => {
    if (!id) return;
    await endPoll(id);
  };

  return (
    <div className="fixed inset-0 w-full h-full flex bg-[#03050a] text-white overflow-hidden selection:bg-pink-500/30">

      {/* Background Ambience (Deep Cinema Feel) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] blur-[150px] opacity-20 transition-all duration-1000"
          style={{ backgroundImage: `url(${room.backdropUrl})`, backgroundSize: 'cover', filter: 'saturate(1.5) blur(100px)' }}
        />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.1),transparent_70%)] opacity-50 transition-all duration-1000" />
      </div>

      {/* Main Content (Video Area - Cinematic) */}
      <div className="flex-1 flex flex-col relative z-20">

        {/* Top Header - Sadece oynatılırken gizlenir, fare üstüne gelindiğinde tekrar açılır */}
        <header className={`absolute top-0 left-0 right-0 h-[var(--header-height)] px-[var(--spacing-container)] flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent z-40 transition-all duration-500 ease-out ${isPlaying ? 'opacity-0 -translate-y-4 hover:opacity-100 hover:translate-y-0' : 'opacity-100 translate-y-0'}`}>
          <div className="flex items-center space-x-[var(--spacing-unit)]">
            <button
              onClick={handleLeaveRoom}
              className="p-2.5 rounded-full bg-black/40 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/5 text-gray-300 hover:text-white group"
              title="Dashboard'a Dön"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[var(--h3-size)] font-black tracking-tighter line-clamp-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-white">{room.name}</h1>
              <div className="flex items-center space-x-3 mt-1 drop-shadow-md">
                <span className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-widest ${room.status === 'playing' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'playing' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                  <span>{room.status === 'playing' ? 'Yayında' : 'Bekleniyor'}</span>
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wide">
                  <span className="text-white font-bold">{room.activeUsersCount}</span> Kişi İzliyor
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isHost ? (
              <button
                onClick={handleCloseRoom}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-[12px] bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white transition-all backdrop-blur-md border border-red-500/20 text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-95"
                title="Odayı Kapat ve Herkesi Çıkar"
              >
                <Trash2 className="w-4 h-4" />
                <span>Odayı Kapat</span>
              </button>
            ) : (
              <button
                onClick={handleLeaveRoom}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-[12px] bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white transition-all backdrop-blur-md border border-white/5 text-sm font-bold active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Odadan Çık</span>
              </button>
            )}
          </div>
        </header>

        {/* Video Player Area (Edge-to-Edge) */}
        <div className="flex-1 bg-black relative group/player flex items-center justify-center overflow-hidden">

          {!room.youtubeVideoId && !room.webUrl ? (
            <div className="flex flex-col items-center justify-center z-10 text-center animate-fade-in relative w-full h-full bg-[#03050a]/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15),transparent_60%)] pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center max-w-lg px-6">
                <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.03)] transform rotate-3 hover:rotate-0 transition-transform">
                  <Play className="w-10 h-10 text-white/40 ml-2" />
                </div>

                {isHost ? (
                  <>
                    <h2 className="text-3xl font-black mb-4 tracking-tight drop-shadow-lg text-white">Medya Seçin</h2>
                    <p className="text-gray-400 mb-10 text-[15px] leading-relaxed">
                      Oda yöneticisi sizsiniz. Herkes hazır olduğunda izlemek istediğiniz içeriği bularak ortak yayını başlatabilirsiniz.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        className="px-10 py-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(236,72,153,0.3)] flex items-center space-x-3"
                      >
                        <Search className="w-5 h-5" />
                        <span>TMDB'de Ara</span>
                      </button>
                      <button
                        onClick={() => setIsYoutubeSearchOpen(true)}
                        className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.3)] flex items-center space-x-3"
                      >
                        <Youtube className="w-5 h-5" />
                        <span>YouTube'da Ara</span>
                      </button>
                    </div>
                    <div className="flex justify-center mt-4 w-full">
                      <button
                        onClick={() => setIsWebVideoModalOpen(true)}
                        className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-3 w-full"
                      >
                        <Globe className="w-5 h-5" />
                        <span>Web'den Link Ekle (.mp4 / .m3u8)</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-black mb-4 tracking-tight drop-shadow-lg text-white animate-pulse">Popcornları Hazırlayın</h2>
                    <p className="text-gray-400 text-[15px] leading-relaxed">
                      Oda sahibinin ({room.hostId === user?.uid ? 'Sen' : 'Yönetici'}) bir içerik seçmesi ve oynatmayı başlatması bekleniyor...
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* YouTube Video Frame */}
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                {room.youtubeVideoId ? (
                  <YouTube
                    videoId={room.youtubeVideoId}
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 1,
                        controls: 0, // Hide YouTube controls so we can use our custom ones
                        rel: 0,
                        showinfo: 0,
                        modestbranding: 1,
                        disablekb: 1, // Disable keyboard so it doesn't conflict with ours
                        fs: 0
                      }
                    }}
                    className="w-[100vw] h-[100vw] md:w-full md:h-[120%] lg:h-[140%] object-cover scale-150 origin-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                    onPlay={handleYTPlay}
                    onPause={handleYTPause}
                  />
                ) : room.webUrl ? (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                    {playbackError && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                          <X className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Video Yüklenemedi</h3>
                        <p className="text-gray-400 max-w-xs mb-6 text-sm">{playbackError}</p>
                        <button
                          onClick={() => setPlaybackError(null)}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all text-sm font-medium"
                        >
                          Tekrar Dene
                        </button>
                      </div>
                    )}
                    {/* Native video element - managed by HLS.js useEffect above */}
                    <video
                      ref={videoRef}
                      autoPlay={false}
                      crossOrigin="anonymous"
                      muted={!!(room.webAudioUrl && room.webAudioUrl.trim() !== '')}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={() => setPlaybackError('Video kaynağına erişilemiyor.')}
                      onPlay={() => {
                        setPlaybackError(null);
                        if (!id || isPlaying) return;
                        updatePlayback(id, true, videoRef.current?.currentTime || 0);
                      }}
                      onPause={() => {
                        if (!id || !isPlaying) return;
                        updatePlayback(id, false, videoRef.current?.currentTime || 0);
                      }}
                    >
                      {room.webSubtitleUrl && (
                        <track
                          label="Türkçe"
                          kind="subtitles"
                          srcLang="tr"
                          src={room.webSubtitleUrl.replace('https://', 'proxy://')}
                          default
                        />
                      )}
                    </video>
                    {/* Optional audio element */}
                    {room.webAudioUrl && (
                      <audio
                        ref={audioElRef}
                        autoPlay={false}
                        style={{ display: 'none' }}
                      />
                    )}
                  </div>
                ) : null}
                {/* Dark overlay for cinema contrast */}
                <div className={`absolute inset-0 transition-opacity duration-700 ease-out bg-black ${isPlaying ? 'opacity-0' : 'opacity-60 backdrop-blur-sm'}`}></div>
              </div>

              {/* Center Play Button (Visible only when paused) */}
              {!isPlaying && (
                <button onClick={handleTogglePlay} className="relative z-10 w-28 h-28 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:scale-110 hover:bg-white/20 transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] group/play pointer-events-auto">
                  <Play className="w-12 h-12 ml-2 drop-shadow-xl fill-current group-hover/play:text-pink-400 transition-colors" />
                </button>
              )}

              {/* Bottom Video Controls (Mac/Netflix Style Floating Bar) */}
              <div className={`absolute bottom-8 left-8 right-8 transition-all duration-500 transform ${isPlaying ? 'opacity-0 translate-y-4 group-hover/player:opacity-100 group-hover/player:translate-y-0' : 'opacity-100 translate-y-0'}`}>

                <div className="bg-[#0c111c]/80 backdrop-blur-[40px] border border-white/10 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                  {/* Advanced Progress Bar */}
                  <div className="w-full h-1.5 mb-4 group/bar relative flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      onMouseDown={() => setIsSeeking(true)}
                      onMouseUp={() => setIsSeeking(false)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full relative shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-150"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] opacity-0 group-hover/bar:opacity-100 transition-opacity transform scale-50 group-hover/bar:scale-100"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pointer-events-auto">
                    {/* Left Controls */}
                    <div className="flex items-center space-x-6">
                      <button onClick={handleTogglePlay} className="text-white hover:text-pink-400 transition-transform transform active:scale-90">
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                      </button>

                      {/* Volume Control */}
                      <div
                        className="relative flex items-center group/vol"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <button
                          onClick={handleToggleMute}
                          className="text-gray-300 hover:text-indigo-400 transition-colors p-1"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        <div className={`
                       absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-[#131b2c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 z-50
                       ${showVolumeSlider ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'}
                     `}>
                          <div className="flex flex-col items-center space-y-3">
                            <span className="text-[10px] font-black text-gray-500 font-mono">{volume}%</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="h-32 appearance-none rounded-lg bg-white/10 accent-indigo-500 cursor-pointer"
                              style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical' } as React.CSSProperties}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-[13px] font-bold text-gray-400 tracking-wider font-mono flex items-center space-x-2">
                        <span className="text-white">{formatTime(currentTime)}</span>
                        <span className="opacity-30">/</span>
                        <span>{duration > 0 ? formatTime(duration) : 'Canlı'}</span>
                      </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center space-x-5">
                      {room?.youtubeVideoId && (
                        <button className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-white/10">
                          <Settings className="w-5 h-5" />
                          <span className="text-xs font-bold hidden md:block">Yüksek Kalite</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else {
                            document.documentElement.requestFullscreen();
                          }
                        }}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emoji Reaction Bar (Floating on right side) */}
              <div
                className={`absolute bottom-[108px] right-0 z-[60] flex items-center bg-[#0c111c]/80 backdrop-blur-md rounded-l-2xl border border-white/10 border-r-0 pointer-events-auto transition-all duration-500 shadow-[-10px_15px_30px_rgba(0,0,0,0.6)] ${isPlaying ? 'opacity-0 group-hover/player:opacity-100' : 'opacity-100'}`}
                style={{ transform: isEmojiOpen ? 'translateX(0)' : 'translateX(100%)' }}
              >
                {/* Toggle Button for Emoji Bar */}
                <button
                  onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                  className="absolute top-1/2 -left-[22px] -translate-y-1/2 w-[22px] h-12 bg-white/10 backdrop-blur-md border border-white/10 border-r-0 rounded-l-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer shadow-[-5px_0_15px_rgba(0,0,0,0.3)] hover:bg-white/20"
                  title={isEmojiOpen ? 'Emojileri Gizle' : 'Emojileri Göster'}
                >
                  {isEmojiOpen ? <ChevronRight className="w-4 h-4 ml-1" /> : <ChevronLeft className="w-4 h-4 ml-0.5" />}
                </button>

                <div className="flex items-center space-x-2 px-4 py-3">
                  {['👍', '❤️', '😂', '😮', '😢', '👏'].map(emj => (
                    <button
                      key={emj}
                      onClick={() => handleReaction(emj)}
                      className="text-2xl hover:scale-[1.3] hover:-translate-y-2 transition-transform duration-200 focus:outline-none px-1"
                      title="Tepki Gönder"
                    >
                      {emj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating Animated Emojis Layer */}
              <div className="absolute inset-0 z-[50] pointer-events-none overflow-hidden rounded-[24px]">
                {activeReactions.map(reaction => (
                  <div
                    key={reaction.id}
                    className="absolute bottom-10 text-[40px] animate-float-up drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                    style={{
                      left: `${reaction.leftPos}%`,
                    }}
                  >
                    {reaction.emoji}
                  </div>
                ))}
              </div>

            </>
          )}
        </div>
      </div>

      {/* Sidebar (Chat & Users) - Mica / Acrylic Feel */}
      <div className={`relative z-40 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-[var(--sidebar-width-expanded)]' : 'w-0'}`}>
        {/* Toggle Button for Sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/2 -left-6 -translate-y-1/2 w-6 h-16 bg-white/5 backdrop-blur-md border border-white/10 border-r-0 rounded-l-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer z-50 hover:bg-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          title={isSidebarOpen ? 'Yan Menüyü Gizle' : 'Yan Menüyü Göster'}
        >
          {isSidebarOpen ? <ChevronRight className="w-5 h-5 ml-1" /> : <ChevronLeft className="w-5 h-5 ml-0.5" />}
        </button>

        <div className={`absolute top-0 right-0 w-[var(--sidebar-width-expanded)] h-full flex flex-col bg-[#060910]/80 backdrop-blur-[40px] border-l border-white/[0.03] shadow-[-10px_0_30px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Chat Tabs - Premium Segmented Control */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl relative shadow-inner">
              {/* Indicator Pill for active tab */}
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/10 transition-transform duration-300 ease-out ${activeTab === 'users' ? 'translate-x-full left-1' : 'left-1'}`}></div>

              <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-[13px] font-bold relative z-10 transition-colors ${activeTab === 'chat' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                Canlı Sohbet
              </button>
              <button onClick={() => setActiveTab('users')} className={`flex-1 py-2 text-[13px] font-bold relative z-10 transition-colors flex items-center justify-center space-x-1.5 ${activeTab === 'users' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                <span>Üyeler</span>
                <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded-md">{onlineUsers.length}</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' ? (
            <>
              {room.activePoll && (
                <div className="mx-6 mt-2 mb-4 p-4 bg-[#131b2c] border border-indigo-500/30 rounded-2xl shadow-lg relative shrink-0">
                  <h4 className="font-bold text-white text-[15px] mb-3 pr-8 leading-tight">{room.activePoll.question}</h4>

                  {room.activePoll.createdBy === user?.uid && room.activePoll.isActive && (
                    <button onClick={handleEndPoll} className="absolute top-3 right-3 px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors font-bold tracking-wider">
                      Bitir
                    </button>
                  )}
                  {!room.activePoll.isActive && (
                    <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest text-pink-400 bg-pink-500/10 px-2 py-1 rounded-md">Bitti</span>
                  )}

                  <div className="space-y-2">
                    {room.activePoll.options.map((opt) => {
                      const totalVotes = room.activePoll!.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                      const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                      const hasVoted = opt.votes.includes(user?.uid || '');

                      return (
                        <button
                          key={opt.id}
                          disabled={!room.activePoll!.isActive}
                          onClick={() => handleVote(opt.id)}
                          className={`w-full relative overflow-hidden text-left p-2.5 rounded-xl border transition-all ${hasVoted ? 'border-indigo-500 bg-indigo-500/10 selection' : 'border-white/10 hover:border-white/20 bg-white/5'} ${!room.activePoll!.isActive ? 'opacity-80 cursor-default' : 'active:scale-[0.98]'}`}
                        >
                          <div className="absolute top-0 bottom-0 left-0 bg-indigo-500/20 transition-all duration-700 ease-in-out" style={{ width: `${percentage}%` }}></div>
                          <div className="relative z-10 flex justify-between items-center px-1">
                            <div className="flex items-center space-x-2">
                              {hasVoted && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                              <span className={`text-[13px] ${hasVoted ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>{opt.text}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400">{percentage}%</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <div className="text-[10px] items-center justify-between flex text-gray-500 mt-3 font-medium px-1">
                    <span>Toplam Oy: {room.activePoll.options.reduce((acc, curr) => acc + curr.votes.length, 0)}</span>
                    {room.activePoll.isActive && <span className="text-indigo-400/80 animate-pulse">Oylama devam ediyor...</span>}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-6 custom-scrollbar flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center flex-col text-gray-500 space-y-3 opacity-60">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium tracking-wide">Sohbeti başlatın!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.userId === user?.uid;
                    const timeString = msg.createdAt ? new Date(msg.createdAt.toMillis()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Şimdi';
                    const isConsecutive = index > 0 && messages[index - 1].userId === msg.userId;

                    return (
                      <div key={msg.id} className={`flex items-end space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : ''} ${isConsecutive ? 'mt-2' : 'mt-6'}`}>
                        {!isMe && (
                          <div className="w-8 h-8 shrink-0 relative">
                            {!isConsecutive ? (
                              <img
                                src={msg.userPhotoUrl || `https://ui-avatars.com/api/?name=${msg.userName.charAt(0)}&background=3b82f6&color=fff`}
                                className="w-8 h-8 rounded-full border border-white/10 shadow-md object-cover"
                                alt={msg.userName}
                              />
                            ) : <div className="w-8 h-8"></div>}
                          </div>
                        )}
                        <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && !isConsecutive && (
                            <div className="flex items-baseline space-x-2 mb-1.5 ml-1">
                              <span className="font-bold text-[13px] text-gray-200">{msg.userName}</span>
                              <span className="text-[10px] font-medium text-gray-500">{timeString}</span>
                            </div>
                          )}

                          <div className={`
                            px-4 py-2.5 text-[14px] leading-relaxed relative group/msg
                            ${isMe
                              ? 'bg-gradient-to-tr from-pink-600 to-indigo-600 text-white rounded-[20px] rounded-br-[4px] shadow-[0_5px_15px_rgba(236,72,153,0.2)]'
                              : 'bg-white/[0.06] text-gray-100 rounded-[20px] rounded-bl-[4px] border border-white/[0.05] hover:border-white/10 transition-colors'
                            }
                         `}>
                            {msg.text}
                            {isMe && <span className="absolute -left-10 bottom-1 opacity-0 group-hover/msg:opacity-100 transition-opacity text-[10px] text-gray-500 font-medium whitespace-nowrap">{timeString}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 pt-2 bg-gradient-to-t from-[#060910] to-transparent shrink-0">
                <form className="relative flex items-center group/form" onSubmit={handleSendMessage}>
                  {/* İsteyen herkes (veya sadece host) açabilsin diye şu an herkese açık */}
                  <button
                    type="button"
                    onClick={() => setIsPollModalOpen(true)}
                    className="absolute left-1.5 p-2 text-gray-400 hover:text-white transition-colors z-10 hover:bg-white/10 rounded-full"
                    title="Anket Başlat"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Odaya mesaj gönder..."
                    className="w-full bg-white/[0.04] border border-white/10 group-hover/form:border-white/20 rounded-full py-3.5 pl-[46px] pr-14 text-[14px] text-white focus:outline-none focus:border-indigo-500/50 focus:bg-[#0c111c]/80 transition-all placeholder-gray-500 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="absolute right-2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-white/10 active:scale-90 shadow-sm"
                  >
                    <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 mt-2">Çevrimiçi ({onlineUsers.length})</h3>
              <div className="space-y-3">
                {onlineUsers.map(u => (
                  <div key={u.uid} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img src={u.photoURL} alt={u.displayName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#060910] rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-gray-200">{u.displayName}</span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {u.uid === room.hostId ? 'Kurucu' : 'Üye'} {u.uid === user?.uid && '(Sen)'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <MovieSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleMovieSelect}
      />

      {/* Poll Creation Modal */}
      {isPollModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0f1423] border border-white/10 w-full max-w-sm rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 relative">
            <button
              onClick={() => setIsPollModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
                <BarChart2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Anket Başlat</h3>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Soru</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Örn: Hangi filmi izleyelim?"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Seçenekler</label>
                {pollOptions.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions];
                      newOpts[i] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    placeholder={`${i + 1}. Seçenek`}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                  />
                ))}
              </div>

              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="w-full flex items-center justify-center space-x-2 py-2 text-[12px] font-bold text-gray-400 hover:text-white border border-dashed border-white/10 hover:border-white/30 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Seçenek Ekle</span>
                </button>
              )}

              <button
                type="submit"
                disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                className="w-full mt-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                Anketi Yayınla
              </button>
            </form>
          </div>
        </div>
      )}

      <YoutubeSearchModal
        isOpen={isYoutubeSearchOpen}
        onClose={() => setIsYoutubeSearchOpen(false)}
        onSelect={handleYoutubeSelect}
      />

      <WebVideoModal
        isOpen={isWebVideoModalOpen}
        onClose={() => setIsWebVideoModalOpen(false)}
        onSelectUrl={handleWebUrlSelect}
      />

    </div>
  );
}
