export default function About({ text }) {
  return (
    <div style={{ background:'#0a0a0f', fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', paddingTop:'80px' }}>
      <div className="max-w-3xl mx-auto px-4 py-20">

        <p className="text-[10px] tracking-[0.35em] uppercase text-[#444460] mb-4">Our story</p>
        <h1 className="text-4xl sm:text-5xl text-white mb-8" style={{ fontFamily:"'DM Serif Display',serif", letterSpacing:'-0.02em' }}>
          Built for the age of too many options.
        </h1>
        <div className="h-px w-16 mb-10" style={{ background:'#f5c842' }}/>

        <div className="space-y-6 text-[#8a8a9a] text-lg leading-relaxed mb-16">
          <p>
            We live in an era where choosing a laptop means opening 24 browser tabs, watching three YouTube reviews, asking three friends, and still feeling unsure. The information exists — but clarity doesn't. That gap is what OptiChoice was built to close.
          </p>
          <p>
            The idea came from a simple frustration: why does making a well-informed decision feel so exhausting? Every comparison site buries you in specs. Every review has a different opinion. Every recommendation feels like it was written for someone else.
          </p>
          <p>
            OptiChoice is different. You describe what you need in plain language — the way you'd explain it to a knowledgeable friend — and we do the rest. We read between the lines, infer what actually matters to you, weigh the factors that fit your life, and surface one clear answer with full reasoning. No spreadsheets. No tab overload. No second-guessing.
          </p>
          <p style={{ color:'rgba(255,255,255,0.6)' }}>
            We believe that good decisions shouldn't require expertise. They should require honesty about what you need — and a system smart enough to listen.
          </p>
        </div>

        {/* Founder */}
        <div className="rounded-2xl p-8 mb-16 border" style={{ background:'rgba(245,200,66,0.04)', borderColor:'rgba(245,200,66,0.15)' }}>
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#444460] mb-4">Founder</p>
          <h2 className="text-2xl text-white mb-2" style={{ fontFamily:"'DM Serif Display',serif" }}>Prerna Mehra</h2>
          <p className="text-[#666680] text-sm leading-relaxed mb-4">
            Prerna built OptiChoice in 2026 out of a personal conviction: that the real problem with buying decisions isn't lack of information — it's too much of it, poorly organized. She set out to build a tool that thinks the way a smart, unbiased advisor would — one that listens first, then recommends.
          </p>
          <a href="mailto:mehraprerna68@gmail.com" className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" style={{ color:'#f5c842' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
            mehraprerna68@gmail.com
          </a>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6">
          {[['2026','Founded'],['17','Languages'],['6','Categories']].map(([v,l])=>(
            <div key={l} className="rounded-2xl p-6 border" style={{ background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.06)' }}>
              <div className="text-3xl font-bold mb-1" style={{ color:'#f5c842', fontFamily:"'DM Serif Display',serif" }}>{v}</div>
              <div className="text-[#555570] text-sm">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
