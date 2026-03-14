import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  /** Remove inner padding from <main> — for pages with their own layout */
  noPadding?: boolean;
}

/**
 * Root shell layout - Chic Pastel Edition
 */
export default function Layout({ children, noPadding = false }: LayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden bg-[#05060b] relative selection:bg-violet-500/30 selection:text-white">
      
      {/* Cinematic Ambient Atmosphere - Pastel Edition */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Right Violet Glow */}
        <div className="absolute top-[-15%] right-[-5%] w-[70vw] h-[70vw] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent_75%)] animate-pulse-slow opacity-60" />
        
        {/* Bottom Left Blue Glow */}
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.04),transparent_75%)] opacity-50" />
        
        {/* Moving Blobs for Depth - Pastel Colors */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-violet-500/5 blur-[150px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-rose-500/5 blur-[100px] rounded-full animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      {/* Noise Texture Overlay for Premium Feel */}
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.012] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Content column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* Header */}
        <Header />

        {/* Page content */}
        <main className={`
          flex-1 flex flex-col relative min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar
          ${noPadding ? '' : 'p-[var(--spacing-container)]'}
        `}>
          {children}
        </main>

      </div>
    </div>
  );
}
