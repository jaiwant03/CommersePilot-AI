import React from 'react';
import { AlertOctagon, PackageX, Clock, FileSpreadsheet } from 'lucide-react';

const ProblemSection = () => {
  const problems = [
    {
      icon: <PackageX />,
      title: 'Failed COD Orders (High RTO)',
      description:
        'Cash-on-Delivery return rates consume 25% to 40% of margins for Indian D2C brands due to impulse buyers, unreachable phone numbers, and bogus addresses.',
      stat: 'Burns ₹80 - ₹150 in shipping per return'
    },
    {
      icon: <AlertOctagon />,
      title: 'Unexpected Stockouts',
      description:
        'Flash sales, influencer shoutouts, and multi-channel listings on Instagram, social channels, and Shopify trigger sudden stock depletion, causing late fulfillments and angry buyers.',
      stat: 'Causes up to 20% order cancellations'
    },
    {
      icon: <Clock />,
      title: 'Delayed Delivery Recovery',
      description:
        'When couriers report failed delivery (NDR) with vague reasons, manual merchant follow-ups take 24–48 hours—often too late before the package is marked Return to Origin.',
      stat: 'Over 60% of unmanaged NDRs turn into RTO'
    },
    {
      icon: <FileSpreadsheet />,
      title: 'Manual Business Reporting',
      description:
        'Founders and operations managers waste hours juggling fragmented CSV exports from Shopify, courier dashboards, customer inquiries, and inventory registers.',
      stat: '10+ hours wasted every week in spreadsheets'
    }
  ];

  return (
    <section id="problem" className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <AlertOctagon size={14} />
            <span>The Ecommerce Bottleneck</span>
          </div>
          <h2 className="section-title">
            Silent Profit Leaks Crippling <br />
            <span className="text-gradient">Fast-Growing Online Stores</span>
          </h2>
          <p className="section-subtitle">
            Scaling an online store shouldn't mean drowning in courier disputes, cancelled COD packages, and unexpected stock shortages.
          </p>
        </div>

        <div className="problem-grid">
          {problems.map((problem, index) => (
            <div key={index} className="problem-card">
              <div className="problem-icon">{problem.icon}</div>
              <h3 className="problem-title">{problem.title}</h3>
              <p className="problem-text">{problem.description}</p>
              <div className="problem-stat">
                <span>⚠️ {problem.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
