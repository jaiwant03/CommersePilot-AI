import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'How does CommercePilot AI evaluate COD order risk?',
      answer:
        'CommercePilot AI cross-references multiple non-intrusive operational markers: historical delivery completion records for the recipient, pin code deliverability indices, missing address metadata (such as street or landmark names), and abnormal order values. Suspect orders are routed into an automated email verification link flow rather than immediately cancelled.'
    },
    {
      question: 'Will this require changing my current shipping aggregator or courier?',
      answer:
        'Not at all. CommercePilot AI connects directly to your existing courier accounts and shipping aggregators (including Shiprocket, Delhivery, NimbusPost, Blue Dart, and Shadowfax) via webhooks. It works as an intelligent orchestration layer on top of your current setup.'
    },
    {
      question: 'How quickly does the setup take for a Shopify or WooCommerce store?',
      answer:
        'Standard onboarding takes under 5 minutes. You install the webhook connector, connect your courier API credentials, and configure your preferred risk thresholds. Our models immediately begin evaluating incoming orders.'
    },
    {
      question: 'Does CommercePilot AI send emails from our brand name?',
      answer:
        'Yes. All customer-facing messages for order confirmations, address verifications, and NDR re-attempt scheduling are sent through verified SMTP email under your store profile name and logo.'
    },
    {
      question: 'How does Predictive Inventory handle multi-channel sales?',
      answer:
        'If you sell on both your website and social storefronts, CommercePilot AI centralizes stock reservations in real time. When stock of an item drops below safety thresholds, it alerts you before an unfulfillable sale occurs.'
    },
    {
      question: 'Are there long-term contracts or cancellation fees?',
      answer:
        'No long-term commitments are required. You can choose monthly or annual billing and cancel or upgrade your plan at any time directly from the settings console.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div className="section-header" style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 20px', background: 'rgba(186, 230, 253, 0.45)', border: '1.5px solid rgba(14, 165, 233, 0.4)', borderRadius: '9999px', fontSize: '13px', fontWeight: 700, color: '#0284C7', marginBottom: '16px', boxShadow: '0 2px 10px rgba(14, 165, 233, 0.12)' }}>
          <HelpCircle size={14} />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="section-title" style={{ fontSize: 'clamp(2.3rem, 4vw, 3.4rem)', fontWeight: 800, color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Everything You Need <br />
          <span className="text-gradient">To Know</span>
        </h2>
        <p className="section-subtitle" style={{ fontSize: '16px', color: '#475569', maxWidth: '720px', margin: '0 auto', lineHeight: 1.65 }}>
          Clear answers about integrations, COD verification algorithms, and automated fulfillment workflows.
        </p>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              style={{
                background: isOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                border: isOpen ? '1.5px solid #0284C7' : '1.5px solid rgba(186, 230, 253, 0.85)',
                borderRadius: '20px',
                padding: '20px 24px',
                boxShadow: isOpen ? '0 12px 30px -6px rgba(2, 132, 199, 0.15)' : '0 4px 12px rgba(14, 165, 233, 0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '16.5px',
                  fontWeight: 700,
                  color: '#0F172A'
                }}
              >
                <span>{faq.question}</span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isOpen ? 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' : '#F1F5F9',
                  color: isOpen ? '#0284C7' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}>
                  <ChevronDown size={18} />
                </div>
              </button>

              {isOpen && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', fontSize: '14.5px', color: '#475569', lineHeight: 1.65 }}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FaqSection;
