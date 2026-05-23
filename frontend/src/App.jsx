import { useState, useEffect } from 'react';
import Home from './pages/Home';
import DecisionForm from './pages/DecisionForm';
import Results from './pages/Results';
import About from './pages/About';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Navbar from './components/Navbar';
import { healthCheck } from './api/client';
import { t } from './i18n';
import './styles/globals.css';
import MVPBanner from './components/MVPBanner';
export default function App() {
const [page, setPage] = useState('home');
const [results, setResults] = useState(null);
const [apiHealthy, setApiHealthy] = useState(true);
const [lang, setLang] = useState('en');
useEffect(() => { healthCheck().then(setApiHealthy); }, []);
const text = t[lang] || t.en;
const nav = (p) => { setPage(p); window.scrollTo(0,0); };
return (
<div style={{ background:'#0a0a0f' }}>
<MVPBanner/>
<Navbar page={page} setPage={nav} lang={lang} setLang={setLang} text={text}/>
{!apiHealthy && (
<div className="fixed top-14 left-0 right-0 z-40 px-4 py-2 text-center" style={{ background:'rgba(120,80,0,0.85)' }}>
<p className="text-xs text-yellow-300">⚠ Service warming up, please wait a moment...</p>
</div>
)}
<div style={{ paddingTop:'56px' }}>
{page==='home' && <Home onNavigateToForm={()=>nav('form')} text={text}/>}
{page==='form' && <DecisionForm onResultsReady={d=>{setResults(d);nav('results');}} onBackHome={()=>nav('home')}/>}
{page==='results' && <Results results={results} onNewDecision={()=>nav('form')}/>}
{page==='about' && <About text={text}/>}
{page==='contact' && <Contact text={text}/>}
{page==='how' && <HowItWorks/>}
</div>
</div>
);
}