import { X, ShieldCheck, Scale, Check } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className={`absolute top-1/4 left-1/4 w-[50%] h-[50%] blur-[120px] rounded-full opacity-10 ${isTerms ? 'bg-indigo-500' : 'bg-pink-500'}`} />
      </div>

      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-[#0c111c]/90 backdrop-blur-[40px] border border-white/10 rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col relative animate-in zoom-in-95 duration-500 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 shrink-0 bg-white/[0.02]">
          <div className="flex items-center space-x-6">
            <div className={`p-4 rounded-2xl bg-[#030712] border border-white/10 shadow-xl ${isTerms ? 'text-indigo-400' : 'text-pink-400'}`}>
              {isTerms ? <Scale className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-[14px] font-black text-white italic uppercase tracking-widest leading-tight">
                {isTerms ? 'HIZMET SÖZLEŞMESİ' : 'VERI POLİTİKASI'}
              </h2>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1 italic">YASAL BİLGİLENDİRME</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-10 py-8 overflow-y-auto custom-scrollbar flex-1 text-gray-400 text-[11px] font-bold uppercase tracking-[0.05em] leading-relaxed space-y-10 italic">
          
          {isTerms ? (
            <>
              <p className="text-white leading-loose underline decoration-indigo-500/30 underline-offset-8">Sayın Kullanıcı, <strong>CineClub</strong> uygulamasına hoş geldiniz. Bu platformu kullanarak aşağıdaki yasal sözleşmeyi, kullanım prensiplerini ve kuralları tümüyle okumuş, anlamış ve kabul etmiş sayılırsınız.</p>
              
              <Section title="1. Hizmetin Kapsamı ve Telif Hakları">
                CineClub, kullanıcıların kendi sahip oldukları veya yasal olarak erişim hakkına sahip oldukları medya içeriklerini senkronize bir şekilde arkadaşlarıyla izlemesini sağlayan bir altyapı sunar. CineClub sunucularında <strong>hiçbir telif hakkı ihlali içeren materyal barındırılmaz.</strong> Tüm hukuki ve cezai sorumluluk, Host kullanıcıya aittir.
              </Section>

              <Section title="2. Kullanıcı Sorumlulukları">
                Uygulama üzerinden gerçekleştirilen tüm sohbetler, paylaşılan medya bağlantıları ve kullanıcı hareketleri kullanıcının kendi sorumluluğundadır. Yasa dışı faaliyetlerin tespiti durumunda, kullanıcının hesabı uyarılmaksızın silinecek ve gerekli durumlarda yasal mercilerle paylaşılacaktır.
              </Section>

              <Section title="3. Geliştirici Hakları">
                Sunulan hizmetin kesintisiz veya hatasız olacağı garanti edilmez. Sistemsel sorunlar, veri kayıpları veya üçüncü parti servislerin çökmesi durumunda hiçbir maddi veya manevi sorumluluk kabul edilmez. Geliştirici, platformun özelliklerini dilediği zaman değiştirme hakkını saklı tutar.
              </Section>

              <Section title="4. Kabul Beyanı">
                Bu uygulamada hesap açtığınız an itibarıyla, hem ulusal hem de uluslararası siber suçlar ve telif hakkı yasalarına uyacağınızı, CineClub geliştiricilerini herhangi bir yasal yaptırımdan beri kılacağınızı taahhüt edersiniz.
              </Section>
            </>
          ) : (
            <>
              <p className="text-white leading-loose underline decoration-pink-500/30 underline-offset-8">Bizim için gizliliğiniz çok önemlidir. <strong>CineClub</strong> uygulamasını kullanırken sizin hakkınızda hangi verileri topladığımızı ve koruduğumuzu açıklamak isteriz.</p>
              
              <Section title="1. Toplanan Veriler">
                Kayıt olduğunuzda veya Google ile giriş yaptığınızda; e-posta adresiniz, sistem tarafından size atanan eşsiz kullanıcı kimliğiniz (UID), belirlediğiniz kullanıcı adınız ve profil fotoğrafı bağlantınız veritabanımıza kaydedilir.
              </Section>

              <Section title="2. Verilerin Kullanımı">
                Topladığımız veriler, platformu size özel hale getirmek ve odaya katılan kişilere kim olduğunuzu gösterebilmek amacıyla kullanılır. Verileriniz asla 3. şahıslara veya kurumlara satılmaz.
              </Section>

              <Section title="3. Sohbetler ve Odalar">
                Odalarınızda yaptığınız yazışmalar geçici olarak saklanabilir. İlerleyen güncellemelerde odalar kapandığında bu sohbetler sunuculardan kalıcı olarak temizlenecektir. Lütfen özel şifre veya kart bilgilerinizi paylaşmayınız.
              </Section>

              <Section title="4. Veri Güvenliği">
                Sistem altyapımız Google'ın Firebase platformu üzerinde çalışmaktadır. Bir veri ihlali durumunda dahi şifreleriniz hashlenmiş olarak tutulduğundan kimse tarafından açıktan okunamaz.
              </Section>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-white/5 shrink-0 flex justify-end bg-black/40">
          <button 
            onClick={onClose}
            className="flex items-center gap-3 px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest italic rounded-2xl hover:bg-pink-500 hover:text-white transition-all shadow-2xl active:scale-95"
          >
            <Check className="w-4 h-4" />
            OKUDUM VE ONAYLIYORUM
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
   return (
      <div className="space-y-3">
         <h3 className="text-[12px] font-black text-white italic uppercase tracking-widest">{title}</h3>
         <p className="leading-loose">{children}</p>
      </div>
   );
}
