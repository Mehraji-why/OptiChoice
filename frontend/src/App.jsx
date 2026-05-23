import { useState, useEffect } from 'react';
import Home from './pages/Home';
import DecisionForm from './pages/DecisionForm';
import Results from './pages/Results';
import About from './pages/About';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Navbar from './components/Navbar';
import { t } from './i18n';
import './styles/globals.css';
import MVPBanner from './components/MVPBanner';

export default function App() {
  const [page, setPage] = useState('home');
  const [results, setResults] = useState(null);
  const [lang, setLang] = useState('en');
  const text = t[lang] || t.en;
  const nav = (p) => { setPage(p); window.scrollTo(0, 0); };

  return (
    <div style={{ background: '#0a0a0f' }}>
      <MVPBanner />
      <Navbar page={page} setPage={nav} lang={lang} setLang={setLang} text={text} />
      <div style={{ paddingTop: '56px' }}>
        {page === 'home' && <Home onNavigateToForm={() => nav('form')} text={text} />}
        {page === 'form' && <DecisionForm onResultsReady={d => { setResults(d); nav('results'); }} onBackHome={() => nav('home')} />}
        {page === 'results' && <Results results={results} onNewDecision={() => nav('form')} />}
        {page === 'about' && <About text={text} />}
        {page === 'contact' && <Contact text={text} />}
        {page === 'how' && <HowItWorks />}
      </div>
    </div>
  );
}