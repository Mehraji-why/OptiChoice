import { useState } from 'react';
export default function Contact({ text }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  return (
    <div style={{ background:'#0a0a0f',fontFamily:"'DM Sans',sans-serif",minHeight:'100vh',paddingTop:'80px' }}>
      <div className="max-w-2xl mx-auto px-4 py-20">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#444460] mb-4">Reach out</p>
        <h1 className="text-4xl sm:text-5xl text-white mb-4" style={{ fontFamily:"'DM Serif Display',serif" }}>{text?.contact_title}</h1>
        <p className="text-[#666680] mb-4">{text?.contact_body}</p>
        <a href="mailto:mehraprerna68@gmail.com" className="inline-flex items-center gap-2 text-sm mb-10 hover:opacity-80 transition-opacity" style={{ color:'#f5c842' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
          mehraprerna68@gmail.com
        </a>
        {sent ? (
          <div className="rounded-2xl p-8 text-center border" style={{ background:'rgba(245,200,66,0.05)',borderColor:'rgba(245,200,66,0.2)' }}>
            <div className="text-3xl mb-3">✓</div>
            <p className="text-white font-semibold">Message received!</p>
            <p className="text-[#666680] text-sm mt-1">We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={e=>{e.preventDefault();setSent(true);}} className="space-y-4">
            {[{id:'name',label:'Name',type:'text',ph:'Your name'},{id:'email',label:'Email',type:'email',ph:'your@email.com'}].map(f=>(
              <div key={f.id}>
                <label className="block text-sm text-[#666680] mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.id]} onChange={e=>setForm(p=>({...p,[f.id]:e.target.value}))} required
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)' }}/>
              </div>
            ))}
            <div>
              <label className="block text-sm text-[#666680] mb-1">Message</label>
              <textarea rows={5} placeholder="Tell us what's on your mind..." value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none"
                style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)' }}/>
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl font-semibold text-[#0a0a0f] transition-all hover:scale-[1.02]"
              style={{ background:'linear-gradient(135deg,#f5c842,#e8a020)' }}>Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}
