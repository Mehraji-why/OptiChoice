import Hero from '../components/Hero';

const CATEGORIES = [
  { label: 'Electronics',    sub: 'Laptops, phones, tablets, TVs',    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80' },
  { label: 'Home & Living',  sub: 'Appliances, furniture, decor',      img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
  { label: 'Study & Work',   sub: 'Stationery, tools, software',       img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80' },
  { label: 'Health & Fitness',sub: 'Gear, supplements, wearables',     img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' },
  { label: 'Travel',         sub: 'Luggage, accessories, cameras',     img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80' },
  { label: 'Finance',        sub: 'Cards, investments, plans',         img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80' },
];

const STEPS = [
  { n: '01', titleKey: 'step1_title', bodyKey: 'step1_body' },
  { n: '02', titleKey: 'step2_title', bodyKey: 'step2_body' },
  { n: '03', titleKey: 'step3_title', bodyKey: 'step3_body' },
];

export default function Home({ onNavigateToForm, text }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .home-root {
          background: #080810;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Section label ── */
        .section-label {
          font-size: 10px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin-bottom: 12px;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          letter-spacing: -0.025em;
          color: #fff;
          text-align: center;
          margin-bottom: 56px;
        }

        /* ── Category cards ── */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .cat-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          aspect-ratio: 4/3;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.04);
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1),
                      border-color 0.3s ease,
                      box-shadow 0.4s ease;
        }
        .cat-card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: rgba(245,197,24,0.18);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,197,24,0.08);
        }
        .cat-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease;
          filter: saturate(0.7) brightness(0.7);
        }
        .cat-card:hover img {
          transform: scale(1.08);
          filter: saturate(0.9) brightness(0.65);
        }
        .cat-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(8,8,16,0.95) 0%, rgba(8,8,16,0.4) 55%, transparent 100%);
          transition: opacity 0.3s ease;
        }
        .cat-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          transform: translateY(4px);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .cat-card:hover .cat-content { transform: translateY(0); }
        .cat-name {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: #fff;
          letter-spacing: -0.01em;
          margin-bottom: 3px;
        }
        .cat-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.38);
          letter-spacing: 0.02em;
        }
        .cat-arrow {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5c518;
          opacity: 0;
          transform: scale(0.7) rotate(-45deg);
          transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .cat-card:hover .cat-arrow {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }

        /* ── Process section ── */
        .process-section {
          position: relative;
          border-radius: 28px;
          padding: 64px 48px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
          background: #0c0c18;
        }
        @media (max-width: 640px) {
          .process-section { padding: 40px 24px; }
        }
        .process-glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(245,197,24,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .process-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 640px) {
          .process-grid { grid-template-columns: 1fr; gap: 32px; }
        }
        .process-step { text-align: center; }
        .step-number {
          font-family: 'Syne', sans-serif;
          font-size: 52px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: rgba(245,197,24,0.09);
          line-height: 1;
          margin-bottom: 16px;
          transition: color 0.3s ease;
        }
        .process-step:hover .step-number { color: rgba(245,197,24,0.18); }
        .step-title {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: rgba(255,255,255,0.85);
          letter-spacing: -0.01em;
          margin-bottom: 10px;
        }
        .step-body {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.3);
        }
        .step-divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent);
          position: absolute;
          top: 0;
          bottom: 0;
        }
      `}</style>

      <div className="home-root">
        <Hero onTryNow={onNavigateToForm} text={text} />

        {/* Categories */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px' }}>
          <p className="section-label">Explore</p>
          <h2 className="section-title">{text?.categories_title || 'Browse by category'}</h2>
          <div className="cat-grid">
            {CATEGORIES.map(cat => (
              <button key={cat.label} className="cat-card" onClick={onNavigateToForm} style={{ background: 'none', padding: 0, textAlign: 'left' }}>
                <img src={cat.img} alt={cat.label} />
                <div className="cat-overlay" />
                <div className="cat-content">
                  <p className="cat-name">{cat.label}</p>
                  <p className="cat-sub">{cat.sub}</p>
                </div>
                <div className="cat-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#080810" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 100px' }}>
          <div className="process-section">
            <div className="process-glow" />
            <p className="section-label" style={{ marginBottom: '12px' }}>Process</p>
            <h2 className="section-title" style={{ marginBottom: '56px' }}>{text?.how_title || 'How it works'}</h2>

            <div className="process-grid">
              {STEPS.map(({ n, titleKey, bodyKey }, i) => (
                <div key={n} style={{ position: 'relative' }}>
                  {i < STEPS.length - 1 && (
                    <div className="step-divider" style={{ right: '-20px' }} />
                  )}
                  <div className="process-step">
                    <div className="step-number">{n}</div>
                    <h3 className="step-title">{text?.[titleKey]}</h3>
                    <p className="step-body">{text?.[bodyKey]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
