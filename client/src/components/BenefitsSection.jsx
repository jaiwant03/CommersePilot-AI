import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Coins, 
  HeartHandshake, 
  Zap 
} from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Coins />,
      title: 'Protect Net Profit Margins',
      description:
        'Stop paying two-way courier shipping fees on bogus COD orders by filtering out habitual returners and unverified buyers before packages leave your warehouse.'
    },
    {
      icon: <Clock />,
      title: 'Eliminate Repetitive Operational Overhead',
      description:
        'Free up hours previously wasted manually texting buyers for address clarification, copying NDR details between courier panels, and recalculating stock levels.'
    },
    {
      icon: <Zap />,
      title: 'Never Miss a Reorder Window',
      description:
        'Maintain continuous stock availability during seasonal shopping rushes with autonomous supplier reorder triggers based on real-time consumption velocity.'
    },
    {
      icon: <ShieldCheck />,
      title: 'Proactive Courier Accountability',
      description:
        'Identify fake doorstep delivery attempts with timestamped customer email confirmations, equipping your team with indisputable proof for courier dispute resolution.'
    },
    {
      icon: <HeartHandshake />,
      title: 'Elevate Buyer Trust & Loyalty',
      description:
        'Deliver prompt, transparent email delivery updates and address assistance that make small independent stores feel as reliable and polished as enterprise marketplaces.'
    },
    {
      icon: <TrendingUp />,
      title: 'Scale GMV with Predictable Cashflow',
      description:
        'Grow marketing spend on Meta, Google, and influencer campaigns with confidence, knowing your fulfillment pipeline and inventory reserves are systematically protected.'
    }
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <TrendingUp size={14} />
            <span>Business Outcomes</span>
          </div>
          <h2 className="section-title">
            Tangible Impact on <br />
            <span className="text-gradient">Everyday Operations</span>
          </h2>
          <p className="section-subtitle">
            Sustainable improvements to fulfillment accuracy, working capital efficiency, and customer satisfaction.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((b, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-header">
                <div className="benefit-icon">{b.icon}</div>
                <h3 className="benefit-title">{b.title}</h3>
              </div>
              <p className="benefit-text">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
