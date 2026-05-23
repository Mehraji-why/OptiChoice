import { useState } from 'react';

export default function MVPBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed top-2/3 left-1/2 z-50 w-[92%] max-w-xl"
      style={{ transform: 'translate(-50%, -50%)' }}>
      <div className="relative rounded-3xl px-7 py-5 shadow-2xl"
        style={{ background: 'rgba(20,18,12,0.96)', border: '1px solid rgba(245,200,66,0.25)', backdropFilter: 'blur(16px)' }}>
        
        {/* Close */}
        <button onClick={() => setVisible(false)}
          className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="mt-0.5 w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(245,200,66,0.12)' }}>
            <span style={{ fontSize: '14px' }}>🛠</span>
          </div>
          <div>
            <p className="text-white text-base font-semibold mb-2" style={{ fontFamily: "'DM Serif Display',serif" }}>
              You're looking at an early build.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans',sans-serif" }}>
              OptiChoice is a work in progress which can only be used now for laptop discovery: the core engine is live, but a lot more is coming. 
              Got a feature you'd want? A category we're missing? Something that felt off? 
              <a href="mailto:mehraprerna68@gmail.com"
                className="ml-1 underline underline-offset-2 transition-colors hover:opacity-100"
                style={{ color: '#f5c842', opacity: 0.8 }}>
                Tell us directly.
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
