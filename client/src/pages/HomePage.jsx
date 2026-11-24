import React, { useState, useEffect, useRef, useCallback } from 'react';
import HeroSection from '../components/HeroSection';
import ProductShowcase from '../components/ProductShowcase';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';
import FinalCtaSection from '../components/FinalCtaSection';

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'product', label: 'Product' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'next', label: 'Next' }
];

const HomePage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const activeSectionRef = useRef('home');

  // Keep ref synchronized and notify Navbar
  useEffect(() => {
    activeSectionRef.current = activeSection;
    window.dispatchEvent(
      new CustomEvent('sectionchange', { detail: { sectionId: activeSection } })
    );
  }, [activeSection]);

  // Smooth scroll helper
  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  }, []);

  // Scroll listener to track current active section naturally and reliably as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const navHeight = 90;
      let current = 'home';

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        current = 'pricing';
      } else {
        for (const sec of SECTIONS) {
          const el = document.getElementById(sec.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= navHeight + 80 && rect.bottom > navHeight) {
              current = sec.id;
            }
          }
        }
      }

      if (current !== activeSectionRef.current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle URL hash on initial load (e.g. /#product)
  useEffect(() => {
    if (window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      const el = document.getElementById(hashId);
      if (el) {
        setTimeout(() => {
          const yOffset = -70;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          setActiveSection(hashId);
        }, 120);
      }
    }
  }, []);

  // Keyboard navigation support (PageDown, PageUp, ArrowDown, ArrowUp)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (['ArrowDown', 'PageDown'].includes(e.key)) {
        const currentIdx = SECTIONS.findIndex((s) => s.id === activeSectionRef.current);
        if (currentIdx < SECTIONS.length - 1) {
          e.preventDefault();
          const targetId = SECTIONS[currentIdx + 1].id;
          scrollToSection(targetId);
        }
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        const currentIdx = SECTIONS.findIndex((s) => s.id === activeSectionRef.current);
        if (currentIdx > 0) {
          e.preventDefault();
          const targetId = SECTIONS[currentIdx - 1].id;
          scrollToSection(targetId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToSection]);

  return (
    <div className="home-page">
      {/* Floating Side Dot Navigator */}
      <nav className="side-dot-nav" aria-label="Quick section navigation">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            className={`side-dot-item ${activeSection === sec.id ? 'active' : ''}`}
            onClick={() => scrollToSection(sec.id)}
            aria-label={`Jump to ${sec.label} section`}
          >
            <span className="side-dot-tooltip">{sec.label}</span>
          </button>
        ))}
      </nav>

      {/* Section 0: Home (Modelled Hero Island & Bento Grid) */}
      <div id="home">
        <HeroSection onExplore={() => scrollToSection('product')} />
      </div>

      {/* Section 1: Product (Vector SVG Showcases & Interactive Application Tabs) */}
      <div id="product" className="product-page-section-wrapper">
        <ProductShowcase />
      </div>

      {/* Section 2: Features (Capabilities & Bottleneck Solutions) */}
      <div id="features" className="modelled-island-container" style={{ padding: '48px 40px' }}>
        <FeaturesSection />
      </div>

      {/* Section 3: How It Works (6-Stage Autonomous Operational Pipeline) */}
      <div id="how-it-works" className="modelled-island-container">
        <HowItWorksSection />
      </div>

      {/* Section 4: Pricing (Plans & Transparent Investment) */}
      <div id="pricing" className="modelled-island-container" style={{ padding: '48px 40px' }}>
        <PricingSection />
      </div>

      {/* Section 5: Next (FAQ & Final Call To Action Banner) */}
      <div id="next" className="modelled-island-container" style={{ padding: '48px 40px' }}>
        <FaqSection />
        <div style={{ height: '48px', width: '100%' }} />
        <FinalCtaSection />
      </div>
    </div>
  );
};

export default HomePage;
