import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function Home({ onNavigateToForm }) {
  return (
    <div>
      <Hero onTryNow={onNavigateToForm} />
      <HowItWorks />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
}
