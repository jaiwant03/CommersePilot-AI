import React from 'react';
import { Sparkles } from 'lucide-react';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';
import FinalCtaSection from '../components/FinalCtaSection';

const PricingPage = () => {
  return (
    <div className="pricing-page" style={{ paddingTop: 'calc(var(--navbar-height) + 40px)' }}>
      {/* Header Banner */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="section-tag">
          <Sparkles size={14} />
          <span>Flexible Plans & Transparent Pricing</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '16px' }}>
          Invest in Operations that <br />
          <span className="text-gradient">Pay for Themselves</span>
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.125rem' }}>
          Stop letting high RTO rates, stockouts, and manual errors eat your margins.
          Choose your plan and launch in under 10 minutes.
        </p>
      </div>

      {/* Pricing Cards & In-Page Comparison Section */}
      <div className="container">
        <PricingSection />
      </div>

      <div style={{ height: '64px', width: '100%' }} />

      <FaqSection />
      <FinalCtaSection />
    </div>
  );
};

export default PricingPage;

      <FaqSection />
      <FinalCtaSection />
    </div>
  );
};

export default PricingPage;
