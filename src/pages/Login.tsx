import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Film,
  Star,
  ArrowRight,
  Loader2,
  Chrome,
  Monitor
} from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: displayName || username || 'Üye' });
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: displayName || username || 'Üye',
          username: username || cred.user.email?.split('@')[0] || 'user',
          photoURL: cred.user.photoURL || '',
          createdAt: new Date().toISOString(),
          bio: '',
          status: 'online'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(getMsg((err as { code: string }).code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || 'Üye',
        username: result.user.email?.split('@')[0] || 'user',
        photoURL: result.user.photoURL || '',
        createdAt: new Date().toISOString(),
        bio: '',
        status: 'online'
      }, { merge: true });
    } catch (err) {
      setError(getMsg((err as { code: string }).code));
    } finally {
      setLoading(false);
    }
  };

  const getMsg = (code: string) => ({
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/user-not-found': 'Kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'auth/invalid-credential': 'E-posta veya şifre yanlış.',
    'auth/popup-closed-by-user': 'Google girişi iptal edildi.',
  }[code] || 'Bir hata oluştu, tekrar dene.');

  const features = [
    { icon: Film, label: 'Film Odaları', desc: 'Arkadaşlarla birlikte film izle' },
    { icon: Monitor, label: 'Canlı Sync', desc: 'Sıfır gecikme ile eşzamanlı' },
    { icon: Star, label: 'Film Keşfi', desc: 'Binlerce film ve dizi keşfet' },
  ];

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: '#060912' }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 55%), radial-gradient(ellipse at 60% 80%, rgba(249,115,22,0.08) 0%, transparent 45%)',
          }}
        />
        {/* Animated orbs */}
        <div
          className="absolute w-80 h-80 rounded-full blur-[100px] animate-blob"
          style={{ top: '10%', left: '15%', background: 'rgba(59,130,246,0.12)' }}
        />
        <div
          className="absolute w-64 h-64 rounded-full blur-[80px] animate-blob animation-delay-2000"
          style={{ bottom: '15%', right: '20%', background: 'rgba(139,92,246,0.1)' }}
        />
        {/* Film strip decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-5 overflow-hidden pointer-events-none select-none">
          <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg"
                style={{
                  background: `hsl(${210 + i * 12},60%,${20 + (i % 4) * 8}%)`,
                  aspectRatio: '2/3',
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main container */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div
          className="flex overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(13,18,32,0.85)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)'
          }}
        >
          {/* Left: Brand panel */}
          <div
            className="hidden lg:flex flex-col w-5/12 p-10 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))',
              borderRight: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: 'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent)' }}
            />

            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.4)'
                }}
              >
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">CineClub</h1>
                <p className="text-[10px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: '#3b82f6' }}>
                  Birlikte İzle
                </p>
              </div>
            </div>

            {/* Hero text */}
            <div className="space-y-4 mb-12">
              <h2 className="text-4xl font-extrabold text-white leading-tight">
                Sinemanın<br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Sosyal Hali
                </span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Arkadaşlarınla aynı filmle gül, ağla, tartış — gerçek zamanlı senkronizasyonla.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 flex-1">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl animate-float-up"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    animationDelay: `${i * 120}ms`
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                  >
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom stat */}
            <div
              className="mt-8 pt-8 flex items-center gap-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/40?u=${i + 200}`}
                    className="w-8 h-8 rounded-full border-2 object-cover"
                    style={{ borderColor: '#060912' }}
                    alt=""
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  <span style={{ color: '#60a5fa' }}>5.000+</span> üye
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>birlikte izleme deneyiminde</p>
              </div>
            </div>
          </div>

          {/* Right: Auth form */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
            {/* Form header */}
            <div className="mb-8">
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2 mb-6">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  <Film className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-white">CineClub</span>
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-1">
                {isSignUp ? 'Hesap Oluştur' : 'Tekrar Hoş Geldin'}
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {isSignUp ? 'Birlikte izleme deneyimine katıl' : 'Film oturumuna devam et'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-6 px-4 py-3 rounded-xl text-sm font-medium animate-shake"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#fca5a5'
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Display name */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: activeField === 'name' ? '#60a5fa' : 'rgba(255,255,255,0.25)' }} />
                      <input
                        type="text"
                        value={displayName}
                        onFocus={() => setActiveField('name')}
                        onBlur={() => setActiveField(null)}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="Adın"
                        required={isSignUp}
                        className="w-full pl-10 pr-4 py-3 text-sm text-white rounded-xl transition-all duration-200 placeholder:select-none focus:outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${activeField === 'name' ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                          boxShadow: activeField === 'name' ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none'
                        }}
                      />
                    </div>
                  </div>
                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Kullanıcı Adı
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: activeField === 'user' ? '#60a5fa' : 'rgba(255,255,255,0.25)' }}>@</span>
                      <input
                        type="text"
                        value={username}
                        onFocus={() => setActiveField('user')}
                        onBlur={() => setActiveField(null)}
                        onChange={e => setUsername(e.target.value.toLowerCase())}
                        placeholder="kullanici_adi"
                        required={isSignUp}
                        className="w-full pl-8 pr-4 py-3 text-sm text-white rounded-xl transition-all duration-200 focus:outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${activeField === 'user' ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                          boxShadow: activeField === 'user' ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: activeField === 'email' ? '#60a5fa' : 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="email"
                    value={email}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm text-white rounded-xl transition-all duration-200 focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeField === 'email' ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: activeField === 'email' ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Şifre
                  </label>
                  {!isSignUp && (
                    <button type="button" className="text-[11px] font-medium transition-colors" style={{ color: '#60a5fa' }}>
                      Şifremi unuttum
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: activeField === 'pass' ? '#60a5fa' : 'rgba(255,255,255,0.25)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onFocus={() => setActiveField('pass')}
                    onBlur={() => setActiveField(null)}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 text-sm text-white rounded-xl transition-all duration-200 focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeField === 'pass' ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: activeField === 'pass' ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 mt-2 press"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-[11px] font-medium" style={{ background: '#0d1220', color: 'rgba(255,255,255,0.3)' }}>
                  ya da
                </span>
              </div>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200 press"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)'
              }}
            >
              <Chrome className="w-4 h-4" />
              Google ile devam et
            </button>

            {/* Switch mode */}
            <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {isSignUp ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="ml-2 font-semibold transition-colors"
                style={{ color: '#60a5fa' }}
              >
                {isSignUp ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
