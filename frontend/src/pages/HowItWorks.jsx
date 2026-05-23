export default function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'You describe your need',
      body: 'No forms, no dropdowns, no checkboxes. Just type what you want the way you would say it out loud. "Best laptop for college under ₹60k" is enough. So is "a phone with a great camera that lasts all day." Natural language is the interface.',
      note: 'The more honest you are about your use case, the sharper the recommendation.',
    },
    {
      n: '02',
      title: 'We extract what matters',
      body: 'Our optimization engine reads your words and infers your real priorities. It picks up on signals — budget cues, use-case hints, lifestyle context — and maps them to measurable factors like battery life, performance, portability, and build quality.',
      note: 'You never have to rank or weight anything manually unless you want to.',
    },
    {
      n: '03',
      title: 'Every option is scored',
      body: 'Each product in our catalog is evaluated against your inferred priorities. Factors are weighted based on what you actually care about — not generic defaults. A student asking for battery life gets a very different scoring than a gamer asking for GPU power.',
      note: 'The same product can rank differently for different people. That is the point.',
    },
    {
      n: '04',
      title: 'One clear answer surfaces',
      body: 'You receive a ranked recommendation with a confidence score, key strengths, honest tradeoffs, and strong alternatives. No hedging. No "it depends." One best option for your situation, explained plainly.',
      note: 'If the top pick has a meaningful weakness for your use case, we say so.',
    },
  ];

  return (
    <div style={{ background:'#0a0a0f', fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', paddingTop:'80px' }}>
      <div className="max-w-3xl mx-auto px-4 py-20">

        <p className="text-[10px] tracking-[0.35em] uppercase text-[#444460] mb-4">The process</p>
        <h1 className="text-4xl sm:text-5xl text-white mb-6" style={{ fontFamily:"'DM Serif Display',serif", letterSpacing:'-0.02em' }}>
          How OptiChoice works
        </h1>
        <p className="text-[#666680] text-lg mb-16 leading-relaxed">
          Most recommendation tools ask you to do the thinking. OptiChoice does it for you.
          Here is exactly what happens from the moment you type to the moment you decide.
        </p>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.n} className="relative flex gap-8">
              {/* Left: number + line */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border"
                  style={{ background:'rgba(245,200,66,0.08)', borderColor:'rgba(245,200,66,0.25)', color:'#f5c842', fontFamily:"'DM Serif Display',serif", fontSize:'14px', fontWeight:'bold' }}>
                  {step.n}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 mt-3" style={{ background:'rgba(245,200,66,0.1)', minHeight:'60px' }}/>
                )}
              </div>

              {/* Right: content */}
              <div className="pb-14">
                <h2 className="text-xl text-white mb-3" style={{ fontFamily:"'DM Serif Display',serif" }}>{step.title}</h2>
                <p className="text-[#8a8a9a] leading-relaxed mb-4">{step.body}</p>
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background:'rgba(245,200,66,0.05)', borderLeft:'2px solid rgba(245,200,66,0.3)', color:'rgba(255,255,255,0.4)' }}>
                  {step.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl p-8 text-center border mt-4" style={{ background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.06)' }}>
          <p className="text-white text-xl mb-2" style={{ fontFamily:"'DM Serif Display',serif" }}>Ready to try it?</p>
          <p className="text-[#555570] text-sm mb-6">One sentence is all it takes.</p>
          <a href="#" onClick={e=>{e.preventDefault();window.scrollTo(0,0);}}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-[#0a0a0f] transition-all hover:scale-105"
            style={{ background:'linear-gradient(135deg,#f5c842,#e8a020)', fontFamily:"'DM Sans',sans-serif" }}>
            Find My Best Option
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
