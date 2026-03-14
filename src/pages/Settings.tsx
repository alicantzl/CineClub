import { useState } from 'react';
import Layout from '../components/layout/Layout';
import {
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Info,
  Camera,
  Save,
  LogOut,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Trash2,
  Volume2,
  Mail,
  Lock,
  Monitor,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
  updateUserProfileData,
  changeEmail,
  changePassword
} from '../services/userService';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

type Section = 'profile' | 'security' | 'notifications' | 'appearance' | 'data' | 'about';

const SECTIONS: { id: Section; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'profile',       label: 'Profil',         icon: User,     color: '#3b82f6' },
  { id: 'security',      label: 'Güvenlik',        icon: Shield,   color: '#10b981' },
  { id: 'notifications', label: 'Bildirimler',     icon: Bell,     color: '#f59e0b' },
  { id: 'appearance',    label: 'Görünüm',         icon: Palette,  color: '#8b5cf6' },
  { id: 'data',          label: 'Veri & Gizlilik', icon: Database, color: '#f97316' },
  { id: 'about',         label: 'Hakkında',        icon: Info,     color: '#6b7280' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();

  const [activeSection, setActiveSection] = useState<Section>('profile');

  // Profile state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security state
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Notifications state
  const [notifFriends, setNotifFriends] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifRooms, setNotifRooms] = useState(true);

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      await updateUserProfileData(user.uid, { displayName, bio });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (e) { console.error(e); }
    finally { setProfileLoading(false); }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleUpdateEmail = async () => {
    setSecurityLoading(true);
    setSecurityError('');
    try {
      await changeEmail(newEmail);
      setSecuritySuccess('E-posta güncellendi');
      setNewEmail('');
    } catch {
      setSecurityError('Şifre hatalı veya e-posta geçersiz');
    } finally {
      setSecurityLoading(false);
      setTimeout(() => setSecuritySuccess(''), 2500);
    }
  };

  const handleUpdatePassword = async () => {
    setSecurityLoading(true);
    setSecurityError('');
    try {
      await changePassword(newPassword);
      setSecuritySuccess('Şifre güncellendi');
      setCurrentPassword(''); setNewPassword('');
    } catch {
      setSecurityError('Mevcut şifre yanlış');
    } finally {
      setSecurityLoading(false);
      setTimeout(() => setSecuritySuccess(''), 2500);
    }
  };

  return (
    <Layout noPadding>
      <div className="flex h-full overflow-hidden" style={{ background: '#060912' }}>

        {/* Sidebar */}
        <div
          className="w-64 flex flex-col shrink-0 h-full"
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,9,18,0.85)' }}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <h1 className="text-base font-bold text-white mb-0.5">Ayarlar</h1>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Hesabını özelleştir
            </p>
          </div>

          {/* Profile preview */}
          <div className="px-4 pb-4">
            <div
              className="p-4 rounded-2xl flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <img
                src={user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.uid}`}
                className="w-11 h-11 rounded-xl object-cover shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                alt=""
              />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-white truncate">{userProfile?.displayName || 'Kullanıcı'}</p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  @{userProfile?.username || 'user'}
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                style={{
                  background: activeSection === s.id ? `${s.color}12` : 'transparent',
                  color: activeSection === s.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                  border: activeSection === s.id ? `1px solid ${s.color}25` : '1px solid transparent',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: activeSection === s.id ? `${s.color}20` : 'transparent' }}
                >
                  <s.icon className="w-3.5 h-3.5" style={{ color: activeSection === s.id ? s.color : undefined }} />
                </div>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>

          {/* Sign out */}
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 press"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)', color: '#fca5a5' }}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-10">

          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="max-w-xl animate-fade-in">
              <SectionTitle icon={User} color="#3b82f6" title="Profil Bilgileri" desc="Adını ve profil detaylarını düzenle" />

              {/* Avatar */}
              <div className="mb-8">
                <div
                  className="group relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: '2px solid rgba(59,130,246,0.3)' }}
                >
                  <img
                    src={user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.uid}`}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200" style={{ background: 'rgba(6,9,18,0.7)' }}>
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Profil fotoğrafını değiştirmek için tıkla
                </p>
              </div>

              <div className="space-y-5">
                <Field label="Ad Soyad" value={displayName} onChange={setDisplayName} placeholder="Adın Soyadın" />
                <Field label="E-posta" value={user?.email || ''} disabled={true} hint="E-postayı değiştirmek için Güvenlik sekmesine git" />
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Kendinden kısaca bahset..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm text-white rounded-xl focus:outline-none resize-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white press transition-all"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                >
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : profileSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {profileSuccess ? 'Kaydedildi!' : 'Kaydet'}
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="max-w-xl animate-fade-in">
              <SectionTitle icon={Shield} color="#10b981" title="Güvenlik" desc="E-posta ve şifreni yönet" />

              {securitySuccess && (
                <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                  <Check className="w-4 h-4" /> {securitySuccess}
                </div>
              )}
              {securityError && (
                <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  {securityError}
                </div>
              )}

              {/* E-posta */}
              <SettingCard title="E-posta Güncelle" icon={Mail} color="#10b981">
                <div className="space-y-3">
                  <Field label="Yeni E-posta" value={newEmail} onChange={setNewEmail} placeholder="yeni@mail.com" />
                  <button
                    onClick={handleUpdateEmail}
                    disabled={securityLoading || !newEmail}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold press transition-all"
                    style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
                  >
                    {securityLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'E-postayı Güncelle'}
                  </button>
                </div>
              </SettingCard>

              {/* Şifre */}
              <SettingCard title="Şifre Değiştir" icon={Lock} color="#10b981" className="mt-4">
                <div className="space-y-3">
                  <Field label="Mevcut Şifre" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" type={showPasswords ? 'text' : 'password'} />
                  <Field label="Yeni Şifre" value={newPassword} onChange={setNewPassword} placeholder="En az 6 karakter" type={showPasswords ? 'text' : 'password'} />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={securityLoading || !currentPassword || !newPassword}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold press transition-all"
                      style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
                    >
                      Şifreyi Güncelle
                    </button>
                    <button onClick={() => setShowPasswords(s => !s)} className="p-2.5 rounded-xl transition-colors" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </SettingCard>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="max-w-xl animate-fade-in">
              <SectionTitle icon={Bell} color="#f59e0b" title="Bildirimler" desc="Hangi bildirimleri almak istediğini seç" />
              <div className="space-y-3">
                <ToggleRow icon={Volume2} color="#f59e0b" label="Arkadaşlık İstekleri" desc="Yeni istek geldiğinde bildir" value={notifFriends} onChange={setNotifFriends} />
                <ToggleRow icon={Mail} color="#f59e0b" label="Yeni Mesajlar" desc="Mesaj geldiğinde bildir" value={notifMessages} onChange={setNotifMessages} />
                <ToggleRow icon={Monitor} color="#f59e0b" label="Oda Davetiyeleri" desc="Oda daveti geldiğinde bildir" value={notifRooms} onChange={setNotifRooms} />
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="max-w-xl animate-fade-in">
              <SectionTitle icon={Palette} color="#8b5cf6" title="Görünüm" desc="Uygulamanın görünümünü özelleştir" />
              <div className="space-y-6">
                <div
                  className="p-6 rounded-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden"
                  style={{ background: 'rgba(139,92,246,0.06)', border: '1px dashed rgba(139,92,246,0.2)' }}
                >
                  <div className="w-24 h-24 rounded-3xl bg-violet-500/10 flex items-center justify-center relative group-hover:rotate-12 transition-transform duration-700">
                    <Palette className="w-10 h-10 text-violet-500" />
                    <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full animate-pulse-slow" />
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Tema Renkleri Yakında</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Özel tema ve renk seçenekleri hazırlanıyor
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ec4899'].map(c => (
                      <div key={c} className="w-8 h-8 rounded-full" style={{ background: c, border: c === '#3b82f6' ? '2px solid #fff' : 'none' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data */}
          {activeSection === 'data' && (
            <div className="max-w-xl animate-fade-in">
              <SectionTitle icon={Database} color="#f97316" title="Veri & Gizlilik" desc="Hesap verilerini yönet" />
              <div
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Hesabı Sil</p>
                    <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Bu işlem geri alınamaz. Tüm verilerin kalıcı olarak silinir.
                    </p>
                  </div>
                </div>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold press"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                >
                  <Trash2 className="w-4 h-4" /> Hesabı Sil
                </button>
              </div>
            </div>
          )}

          {/* About */}
          {activeSection === 'about' && (
            <div className="max-w-xl animate-fade-in">
              <SectionTitle icon={Info} color="#6b7280" title="Hakkında" desc="Uygulama bilgileri" />
              <div
                className="p-8 rounded-2xl text-center mb-6"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}
                >
                  <span className="text-2xl">🎬</span>
                </div>
                <h2 className="text-xl font-extrabold text-white mb-1">CineClub</h2>
                <p className="text-[11px] mb-4 font-semibold tracking-widest uppercase" style={{ color: '#60a5fa' }}>
                  NEXUS Edition
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Arkadaşlarınla birlikte film izleme deneyimi için tasarlandı.
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Versiyon', value: '2.0.0 (NEXUS)' },
                  { label: 'Geliştirici', value: 'CineClub Team' },
                  { label: 'Platform', value: 'Electron + React' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                    <span className="text-sm font-semibold text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function SectionTitle({ icon: Icon, color, title, desc }: { icon: React.ElementType; color: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled = false, hint }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 text-sm text-white rounded-xl focus:outline-none transition-all"
        style={{
          background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : undefined,
        }}
      />
      {hint && <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{hint}</p>}
    </div>
  );
}

function SettingCard({ title, icon: Icon, color, children, className = '' }: {
  title: string; icon: React.ElementType; color: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`p-5 rounded-2xl ${className}`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ icon: Icon, color, label, desc, value, onChange }: {
  icon: React.ElementType; color: string; label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0"
        style={{ background: value ? color : 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
          style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}
