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

  // IntersectionObserver to track current active section naturally as user scrolls
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: [0.1, 0.25, 0.5]
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id && SECTIONS.some((s) => s.id === id)) {
            setActiveSection(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
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
      <div id="product" className="modelled-island-container">
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
