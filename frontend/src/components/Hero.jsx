import { useEffect, useRef } from 'react';

export default function Hero({ onTryNow, text }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, w = canvas.width = canvas.offsetWidth, h = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.4+0.3,
      dx: (Math.random()-0.5)*0.25, dy: (Math.random()-0.5)*0.25, alpha: Math.random()*0.45+0.08,
    }));
    function draw() {
      ctx.clearRect(0,0,w,h);
      particles.forEach(p => {
        p.x+=p.dx; p.y+=p.dy;
        if(p.x<0)p.x=w; if(p.x>w)p.x=0; if(p.y<0)p.y=h; if(p.y>h)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(245,200,66,${p.alpha})`; ctx.fill();
      });
      animId=requestAnimationFrame(draw);
    }
    draw();
    const onResize=()=>{w=canvas.width=canvas.offsetWidth;h=canvas.height=canvas.offsetHeight;};
    window.addEventListener('resize',onResize);
    return()=>{cancelAnimationFrame(animId);window.removeEventListener('resize',onResize);};
  }, []);
  const lines = (text?.hero_title||'').split('\n');
  return (
    <section className="relative overflow-hidden min-h-[88vh] flex flex-col items-center justify-center px-4"
      style={{ fontFamily:"'DM Serif Display',Georgia,serif" }}>
      <div className="absolute inset-0 bg-[#0a0a0f]"/>
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'64px 64px' }}/>
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background:'radial-gradient(circle,rgba(245,200,66,0.09) 0%,transparent 70%)',filter:'blur(40px)' }}/>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"/>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p className="text-[#f5c842] text-xs tracking-[0.35em] uppercase mb-6 font-mono opacity-80">{text?.tagline}</p>
        <h1 className="text-white mb-6" style={{ fontSize:'clamp(2.8rem,7vw,5.5rem)',lineHeight:1.06,letterSpacing:'-0.025em' }}>
          {lines[0]}<br/><span style={{ color:'#f5c842' }}>{lines[1]}</span>
        </h1>
        <p className="text-[#888899] mb-10 max-w-lg mx-auto leading-relaxed" style={{ fontFamily:"'DM Sans',sans-serif",fontSize:'clamp(1rem,2vw,1.15rem)' }}>
          {text?.hero_sub}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['Best laptop for coding under ₹70k','Phone with great camera & battery','Tablet for note-taking & drawing'].map(p=>(
            <span key={p} className="text-sm px-4 py-2 rounded-full border border-white/10 text-white/40"
              style={{ background:'rgba(255,255,255,0.03)',fontFamily:"'DM Sans',sans-serif" }}>"{p}"</span>
          ))}
        </div>
        <button onClick={onTryNow}
          className="inline-flex items-center gap-3 px-9 py-4 rounded-full font-semibold text-[#0a0a0f] text-lg transition-all duration-300 hover:scale-105"
          style={{ background:'linear-gradient(135deg,#f5c842,#e8a020)',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 0 40px rgba(245,200,66,0.22)' }}>
          {text?.cta}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <div className="mt-16 flex justify-center gap-12 border-t pt-10" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
          {[['10+','Factors Weighed'],['100%','Transparent'],['₹','Budget Smart']].map(([v,l])=>(
            <div key={l} className="text-center">
              <div className="text-2xl font-bold" style={{ color:'#f5c842',fontFamily:"'DM Serif Display',serif" }}>{v}</div>
              <div className="text-[10px] text-[#44445a] mt-1 tracking-widest uppercase" style={{ fontFamily:"'DM Sans',sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
