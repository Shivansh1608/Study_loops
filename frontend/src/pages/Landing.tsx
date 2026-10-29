import { useEffect, useState } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorks } from '../components/landing/HowItWorks';
import { LiveDemo } from '../components/landing/LiveDemo';
import { FeaturesBento } from '../components/landing/FeaturesBento';
import { DashboardPreview } from '../components/landing/DashboardPreview';
import { SocialMarquee } from '../components/landing/SocialMarquee';
import { FinalCTA } from '../components/landing/FinalCTA';
import { MinimalFooter } from '../components/landing/MinimalFooter';

export default function Landing() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDf8] text-[#1C1917] selection:bg-[#FFE4E6] selection:text-[#DC2626] relative overflow-x-hidden">
      {/* Thin Red Scroll Progress Line at top */}
      <div 
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-[#DC2626] to-[#EF4444] z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 1. Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Social proof marquee */}
      <SocialMarquee />

      {/* 4. How It Works */}
      <HowItWorks />

      {/* 5. Live Demo (Most Important) */}
      <LiveDemo />

      {/* 6. Features Bento 2x2 */}
      <FeaturesBento />

      {/* 7. Dashboard Preview */}
      <DashboardPreview />

      {/* 8. Final CTA */}
      <FinalCTA />

      {/* 9. Minimal Footer */}
      <MinimalFooter />
    </div>
  );
}
