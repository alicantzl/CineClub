import React, { useState } from 'react';
import { Globe, X, Link as LinkIcon, Music, ArrowRight } from 'lucide-react';

interface WebVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string, audioUrl?: string, subtitleUrl?: string) => void;
}

export const WebVideoModal: React.FC<WebVideoModalProps> = ({
  isOpen,
  onClose,
  onSelectUrl,
}) => {
  const [url, setUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [subtitleUrl, setSubtitleUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSelectUrl(url.trim(), audioUrl.trim() || undefined, subtitleUrl.trim() || undefined);
      setUrl('');
      setAudioUrl('');
      setSubtitleUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-500">
      {/* Premium Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-[#030712]/90 backdrop-blur-3xl transition-all duration-700"
        onClick={onClose}
      />
      
      {/* Modal - Premium Native Container */}
      <div className="relative w-full max-w-2xl bg-[#0c111c]/80 backdrop-blur-[100px] border border-white/10 rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-700 cubic-bezier(0.23, 1, 0.32, 1)">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-indigo-500/10 blur-[80px] rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Header - Native Style */}
        <div className="flex items-center justify-between p-10 md:p-14 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-green-600 to-green-800 rounded-[28px] shadow-2xl shadow-green-500/20 rotate-3">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
               <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">WEB İÇERİĞİ</h2>
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-3 italic">DOĞRUDAN BAĞLANTI İLE BAŞLAT</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            type="button"
            className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10 relative z-10">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest italic leading-relaxed">
            Doğrudan bir video bağlantısı dosyası <span className="text-white">(.mp4, .m3u8 vb.)</span> girerek odayla senkronize edin. Ayrı bir ses veya altyazı dosyası ekleyebilirsiniz.
          </p>

          <div className="grid grid-cols-1 gap-8">
            {/* URL Input */}
            <div className="space-y-4">
               <div className="flex justify-between px-2">
                  <label htmlFor="url" className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                    MEDYA BAĞLANTISI <span className="text-green-500">*</span>
                  </label>
                  <LinkIcon className="w-3.5 h-3.5 text-gray-700" />
               </div>
               <input
                 type="text"
                 name="url"
                 id="url"
                 required
                 placeholder="HTTPS://ORNEK.COM/VIDEO.MP4 VEYA .M3U8..."
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 className="w-full bg-black/40 border border-white/5 rounded-[28px] py-6 px-8 text-white italic font-black uppercase text-sm focus:border-green-500/40 outline-none transition-all placeholder:text-gray-700 shadow-xl"
               />
            </div>

            {/* Audio URL Input */}
            <div className="space-y-4">
               <div className="flex justify-between px-2">
                  <label htmlFor="audioUrl" className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                    SES BAĞLANTISI <span className="opacity-50">(OPSİYONEL)</span>
                  </label>
                  <Music className="w-3.5 h-3.5 text-gray-700" />
               </div>
               <input
                 type="text"
                 name="audioUrl"
                 id="audioUrl"
                 placeholder="FARKLI BİR DİL/SES KAYNAĞI İÇİN .M3U8 VEYA .MP3..."
                 value={audioUrl}
                 onChange={(e) => setAudioUrl(e.target.value)}
                 className="w-full bg-black/40 border border-white/5 rounded-[28px] py-6 px-8 text-white italic font-black uppercase text-sm focus:border-green-500/40 outline-none transition-all placeholder:text-gray-700 shadow-xl"
               />
            </div>

            {/* Subtitle URL Input */}
            <div className="space-y-4">
               <div className="flex justify-between px-2">
                  <label htmlFor="subtitleUrl" className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                    ALTYAZI BAĞLANTISI <span className="opacity-50">(OPSİYONEL)</span>
                  </label>
                  <Globe className="w-3.5 h-3.5 text-gray-700" />
               </div>
               <input
                 type="text"
                 name="subtitleUrl"
                 id="subtitleUrl"
                 placeholder="ALTYAZI İÇİN .VTT DOSYASI BAĞLANTISI..."
                 value={subtitleUrl}
                 onChange={(e) => setSubtitleUrl(e.target.value)}
                 className="w-full bg-black/40 border border-white/5 rounded-[28px] py-6 px-8 text-white italic font-black uppercase text-sm focus:border-green-500/40 outline-none transition-all placeholder:text-gray-700 shadow-xl"
               />
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex items-center justify-between gap-8">
             <div className="hidden sm:block">
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic">CINECLUB NATIVE ENGINE</p>
             </div>
             
             <div className="flex gap-4 w-full sm:w-auto">
               <button
                 type="button"
                 onClick={onClose}
                 className="px-8 h-20 bg-white/5 border border-white/5 text-white font-black rounded-[28px] text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-white/10 relative overflow-hidden group/btn hover:border-white/20"
               >
                 <span className="relative z-10 italic">İPTAL</span>
               </button>

               <button
                 type="submit"
                 disabled={!url.trim()}
                 className="flex-1 sm:min-w-[240px] h-20 bg-white text-black font-black rounded-[28px] text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-green-500 hover:text-white hover:scale-[1.03] active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] flex items-center justify-center space-x-4 group/submit disabled:opacity-30 disabled:pointer-events-none"
               >
                 <span className="italic">EKLE VE OYNAT</span>
                 <ArrowRight className="w-4 h-4 group-hover/submit:translate-x-2 transition-transform" />
               </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};
