import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    electron?: {
      windowControl:      (action: string) => void;
      onWindowStateChange:(cb: (state: string) => void) => void;
      isMaximized?:       () => Promise<boolean>;
    };
  }
}

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Sync initial state
    window.electron?.isMaximized?.().then((v) => setIsMaximized(!!v));

    window.electron?.onWindowStateChange((state) => {
      setIsMaximized(state === 'maximized');
    });
  }, []);

  const ctrl = (action: string) => window.electron?.windowControl(action);

  return (
    <div
      className="title-bar w-full bg-[#020610]/95 backdrop-blur-2xl flex items-center justify-between select-none z-[9999] border-b border-white/[0.04] shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* App identity */}
      <div className="flex items-center gap-2.5 pl-4 pointer-events-none">
        <div className="relative w-3.5 h-3.5">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-[4px] rotate-45 shadow-lg" />
        </div>
        <span className="text-[9px] font-black text-white/50 italic uppercase tracking-[0.35em] leading-none">
          CineClub
        </span>
        <span className="text-[7px] font-black text-white/20 uppercase tracking-wider leading-none">
          v2.0.4
        </span>
      </div>

      {/* Window controls — no-drag zone */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={() => ctrl('minimize')}
          className="h-full w-11 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200 group"
          title="Küçült"
        >
          <Minus className="w-3 h-3" />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={() => ctrl('maximize')}
          className="h-full w-11 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
          title={isMaximized ? 'Normal Boyut' : 'Ekranı Kapla'}
        >
          {isMaximized ? (
            <Maximize2 className="w-2.5 h-2.5" />
          ) : (
            <Square className="w-2.5 h-2.5" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={() => ctrl('close')}
          className="h-full w-11 flex items-center justify-center text-white/30 hover:text-white hover:bg-red-500 transition-all duration-200"
          title="Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
