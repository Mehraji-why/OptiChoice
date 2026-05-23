import Hero from '../components/Hero';
const CATEGORIES = [
  { label:'Electronics', sub:'Laptops, phones, tablets, TVs', img:'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80' },
  { label:'Home & Living', sub:'Appliances, furniture, decor', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
  { label:'Study & Work', sub:'Stationery, tools, software', img:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80' },
  { label:'Health & Fitness', sub:'Gear, supplements, wearables', img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' },
  { label:'Travel', sub:'Luggage, accessories, cameras', img:'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80' },
  { label:'Finance', sub:'Cards, investments, plans', img:'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80' },
];
export default function Home({ onNavigateToForm, text }) {
  return (
    <div style={{ background:'#0a0a0f',fontFamily:"'DM Sans',sans-serif" }} className="min-h-screen">
      <Hero onTryNow={onNavigateToForm} text={text}/>
      <section className="max-w-6xl mx-auto px-4 py-24">
        <p className="text-center text-[10px] tracking-[0.35em] uppercase text-[#444460] mb-3">Explore</p>
        <h2 className="text-center text-3xl text-white mb-14" style={{ fontFamily:"'DM Serif Display',serif" }}>{text?.categories_title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CATEGORIES.map(cat=>(
            <button key={cat.label} onClick={onNavigateToForm}
              className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-300 hover:scale-[1.02]"
              style={{ aspectRatio:'4/3' }}>
              <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
              <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(10,10,15,0.92) 0%,rgba(10,10,15,0.3) 60%,transparent 100%)' }}/>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold text-base" style={{ fontFamily:"'DM Serif Display',serif" }}>{cat.label}</p>
                <p className="text-[#666680] text-xs mt-0.5">{cat.sub}</p>
              </div>
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:'#f5c842' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="rounded-3xl p-12 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#10100f,#0f0f1a)',border:'1px solid rgba(245,200,66,0.1)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%,rgba(245,200,66,0.06) 0%,transparent 60%)' }}/>
          <div className="relative z-10">
            <p className="text-center text-[10px] tracking-[0.35em] uppercase text-[#444460] mb-3">Process</p>
            <h2 className="text-center text-3xl text-white mb-12" style={{ fontFamily:"'DM Serif Display',serif" }}>{text?.how_title}</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[['01',text?.step1_title,text?.step1_body],['02',text?.step2_title,text?.step2_body],['03',text?.step3_title,text?.step3_body]].map(([n,title,body])=>(
                <div key={n} className="text-center">
                  <div className="text-4xl font-bold mb-4" style={{ color:'rgba(245,200,66,0.15)',fontFamily:"'DM Serif Display',serif" }}>{n}</div>
                  <h3 className="text-white font-semibold mb-2" style={{ fontFamily:"'DM Serif Display',serif" }}>{title}</h3>
                  <p className="text-[#555570] text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
