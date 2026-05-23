export default function HowItWorks({ onNavigateToForm }) {
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .hiw-root {
          background: #080810;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          padding-top: 80px;
          position: relative;
          overflow: hidden;
        }
        .hiw-ambient {
          position: fixed;
          right: -200px;
          top: 50%;
          transform: translateY(-50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(245,197,24,0.03) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }
        .hiw-inner {
          position: relative;
          z-index: 1;
          max-width: 760px;
          margin: 0 auto;
          padding: 80px 24px 120px;
        }
        .hiw-eyebrow {
          font-size: 10px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 16px;
        }
        .hiw-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2.4rem, 5vw, 4rem);
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin-bottom: 20px;
        }
        .hiw-intro {
          font-size: 16px;
          line-height: 1.75;
          color: rgba(255,255,255,0.32);
          font-weight: 300;
          margin-bottom: 72px;
          max-width: 580px;
        }
        /* Steps */
        .steps-list { position: relative; }
        .step-row {
          display: flex;
          gap: 32px;
          position: relative;
        }
        .step-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .step-badge {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(245,197,24,0.2);
          background: rgba(245,197,24,0.05);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: rgba(245,197,24,0.7);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }
        .step-row:hover .step-badge {
          border-color: rgba(245,197,24,0.45);
          background: rgba(245,197,24,0.1);
          color: #f5c518;
        }
        .step-line {
          width: 1px;
          flex: 1;
          margin-top: 8px;
          background: linear-gradient(to bottom, rgba(245,197,24,0.12), rgba(245,197,24,0.03));
          min-height: 40px;
        }
        .step-right {
          padding-bottom: 60px;
          flex: 1;
        }
        .step-title {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 18px;
          color: rgba(255,255,255,0.82);
          letter-spacing: -0.01em;
          margin-bottom: 12px;
          margin-top: 10px;
          transition: color 0.25s ease;
        }
        .step-row:hover .step-title { color: #fff; }
        .step-body {
          font-size: 14px;
          line-height: 1.78;
          color: rgba(255,255,255,0.3);
          font-weight: 300;
          margin-bottom: 16px;
        }
        .step-note {
          padding: 12px 18px;
          border-left: 2px solid rgba(245,197,24,0.22);
          background: rgba(245,197,24,0.03);
          border-radius: 0 10px 10px 0;
          font-size: 12px;
          color: rgba(255,255,255,0.28);
          font-style: italic;
          font-weight: 300;
          line-height: 1.65;
          transition: border-color 0.3s ease;
        }
        .step-row:hover .step-note {
          border-color: rgba(245,197,24,0.4);
          color: rgba(255,255,255,0.38);
        }
        /* CTA */
        .hiw-cta {
          border-radius: 24px;
          padding: 52px;
          text-align: center;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
          margin-top: 16px;
        }
        .hiw-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,197,24,0.3), transparent);
        }
        .hiw-cta-h {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .hiw-cta-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          margin-bottom: 28px;
          font-weight: 300;
        }
        .hiw-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border-radius: 100px;
          background: linear-gradient(135deg, #f5c518, #e8a820);
          color: #080810;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(245,197,24,0.2);
        }
        .hiw-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(245,197,24,0.3);
        }
        .hiw-cta-btn svg { transition: transform 0.25s ease; }
        .hiw-cta-btn:hover svg { transform: translateX(3px); }
      `}</style>

      <div className="hiw-root">
        <div className="hiw-ambient" />
        <div className="hiw-inner">

          <p className="hiw-eyebrow">The process</p>
          <h1 className="hiw-h1">How OptiChoice works</h1>
          <p className="hiw-intro">
            Most recommendation tools ask you to do the thinking. OptiChoice does it for you.
            Here is exactly what happens from the moment you type to the moment you decide.
          </p>

          <div className="steps-list">
            {steps.map((step, i) => (
              <div key={step.n} className="step-row">
                <div className="step-left">
                  <div className="step-badge">{step.n}</div>
                  {i < steps.length - 1 && <div className="step-line" />}
                </div>
                <div className="step-right">
                  <h2 className="step-title">{step.title}</h2>
                  <p className="step-body">{step.body}</p>
                  <div className="step-note">{step.note}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="hiw-cta">
            <p className="hiw-cta-h">Ready to try it?</p>
            <p className="hiw-cta-sub">One sentence is all it takes.</p>
            <button className="hiw-cta-btn" onClick={onNavigateToForm}>
              Find My Best Option
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
