const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../../client/src/styles/layout.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Replace Hero text styles: decrease size and add animations
const heroTextOld = `.prod-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4F46E5;
  text-transform: uppercase;
  margin-bottom: 24px;
  width: fit-content;
}

.prod-eyebrow-sparkle {
  color: #6366F1;
}

.prod-hero-title {
  font-size: clamp(2.4rem, 4.2vw, 3.5rem);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.035em;
  color: #0F172A;
  margin-bottom: 20px;
}

.prod-title-gradient {
  background: linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.prod-hero-desc {
  font-size: 16.5px;
  line-height: 1.65;
  color: #475569;
  margin-bottom: 28px;
  max-width: 620px;
}

.prod-value-props-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.prod-value-prop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14.5px;
  font-weight: 600;
  color: #1E293B;
}`;

const heroTextNew = `.prod-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  border-radius: 9999px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4F46E5;
  text-transform: uppercase;
  margin-bottom: 20px;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
  animation: textFloatGlow 4s ease-in-out infinite;
}

.prod-eyebrow-sparkle {
  color: #6366F1;
  animation: sparklePulse 3s ease-in-out infinite;
}

.prod-hero-title {
  font-size: clamp(1.9rem, 3.2vw, 2.75rem);
  font-weight: 850;
  line-height: 1.16;
  letter-spacing: -0.03em;
  color: #0F172A;
  margin-bottom: 18px;
  animation: textFadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.prod-title-gradient {
  background: linear-gradient(135deg, #4F46E5 0%, #0EA5E9 35%, #818CF8 50%, #0EA5E9 65%, #4F46E5 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textGradientShimmer 6s linear infinite;
}

.prod-hero-desc {
  font-size: 14.5px;
  line-height: 1.62;
  color: #475569;
  margin-bottom: 24px;
  max-width: 580px;
}

.prod-value-props-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.prod-value-prop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1E293B;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
}

.prod-value-prop-item:hover {
  transform: translateX(4px);
  color: #4F46E5;
}`;

// Normalize line endings for replacement
const normalize = str => str.replace(/\r\n/g, '\n');

if (normalize(css).includes(normalize(heroTextOld))) {
  css = normalize(css).replace(normalize(heroTextOld), normalize(heroTextNew));
  console.log('Hero text successfully replaced.');
} else {
  console.log('Hero text replacement fallback regex needed.');
}

// 2. Feature Story Typography (eyebrows, headings, descriptions, highlights)
const featureTextOld = `.prod-feature-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4F46E5;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.prod-feature-heading {
  font-size: clamp(1.9rem, 3.2vw, 2.5rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: #0F172A;
  margin-bottom: 18px;
}

.prod-feature-desc {
  font-size: 15.5px;
  line-height: 1.65;
  color: #475569;
  margin-bottom: 24px;
}

.prod-feature-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.highlight-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
}`;

const featureTextNew = `.prod-feature-eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4F46E5;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: inline-block;
  animation: textFloatGlow 4s ease-in-out infinite;
}

.prod-feature-heading {
  font-size: clamp(1.45rem, 2.25vw, 1.85rem);
  font-weight: 800;
  line-height: 1.24;
  letter-spacing: -0.025em;
  color: #0F172A;
  margin-bottom: 14px;
  transition: color 0.3s ease;
}

.prod-feature-heading:hover {
  color: #1E1B4B;
}

.prod-feature-desc {
  font-size: 14px;
  line-height: 1.62;
  color: #475569;
  margin-bottom: 20px;
}

.prod-feature-highlights {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 26px;
}

.highlight-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.48;
  color: #334155;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
}

.highlight-row:hover {
  transform: translateX(4px);
  color: #0F172A;
}

.highlight-row:hover .highlight-bullet {
  background: #4F46E5;
  color: #FFFFFF;
  border-color: #4F46E5;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}`;

if (normalize(css).includes(normalize(featureTextOld))) {
  css = normalize(css).replace(normalize(featureTextOld), normalize(featureTextNew));
  console.log('Feature text successfully replaced.');
} else {
  console.log('Feature text replacement fallback needed.');
}

// 3. Storytelling Section typography
const storyTextOld = `.storytelling-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4F46E5;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: inline-block;
}

.storytelling-title {
  font-size: clamp(2.1rem, 3.5vw, 2.8rem);
  font-weight: 900;
  line-height: 1.18;
  letter-spacing: -0.03em;
  color: #0F172A;
  margin-bottom: 18px;
}

.storytelling-desc {
  font-size: 16px;
  line-height: 1.65;
  color: #475569;
}`;

const storyTextNew = `.storytelling-eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4F46E5;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: inline-block;
  animation: textFloatGlow 4s ease-in-out infinite;
}

.storytelling-title {
  font-size: clamp(1.5rem, 2.4vw, 2.05rem);
  font-weight: 850;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: #0F172A;
  margin-bottom: 14px;
}

.storytelling-desc {
  font-size: 14px;
  line-height: 1.62;
  color: #475569;
}`;

if (normalize(css).includes(normalize(storyTextOld))) {
  css = normalize(css).replace(normalize(storyTextOld), normalize(storyTextNew));
  console.log('Storytelling text successfully replaced.');
}

// 4. Autonomous Workflow section typography
const workflowTextOld = `.n8n-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38BDF8;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: inline-block;
}

.n8n-title {
  font-size: clamp(2.1rem, 3.5vw, 2.8rem);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: #FFFFFF;
  margin-bottom: 18px;
}

.n8n-desc {
  font-size: 16px;
  line-height: 1.65;
  color: #94A3B8;
}`;

const workflowTextNew = `.n8n-eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38BDF8;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: inline-block;
  animation: textFloatGlow 4s ease-in-out infinite;
}

.n8n-title {
  font-size: clamp(1.5rem, 2.4vw, 2.05rem);
  font-weight: 850;
  line-height: 1.22;
  letter-spacing: -0.025em;
  color: #FFFFFF;
  margin-bottom: 14px;
}

.n8n-desc {
  font-size: 14px;
  line-height: 1.62;
  color: #94A3B8;
}`;

if (normalize(css).includes(normalize(workflowTextOld))) {
  css = normalize(css).replace(normalize(workflowTextOld), normalize(workflowTextNew));
  console.log('Workflow text successfully replaced.');
}

// 5. Final CTA typography
const ctaTextOld = `.final-cta-title {
  font-size: clamp(2.2rem, 3.8vw, 3.2rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 18px;
}

.final-cta-desc {
  font-size: 16.5px;
  line-height: 1.65;
  color: #CBD5E1;
  max-width: 720px;
  margin: 0 auto 36px;
}`;

const ctaTextNew = `.final-cta-title {
  font-size: clamp(1.6rem, 2.6vw, 2.25rem);
  font-weight: 850;
  line-height: 1.18;
  letter-spacing: -0.025em;
  margin-bottom: 14px;
}

.final-cta-desc {
  font-size: 14px;
  line-height: 1.62;
  color: #CBD5E1;
  max-width: 680px;
  margin: 0 auto 30px;
}`;

if (normalize(css).includes(normalize(ctaTextOld))) {
  css = normalize(css).replace(normalize(ctaTextOld), normalize(ctaTextNew));
  console.log('Final CTA text successfully replaced.');
}

// 6. Add animation keyframes at the end of the file if not already present
const animationKeyframes = `
/* Keyframe Animations for Luxurious Product Typography */
@keyframes textGradientShimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes textFloatGlow {
  0%, 100% { filter: drop-shadow(0 0 0px rgba(79, 70, 229, 0)); }
  50% { filter: drop-shadow(0 0 6px rgba(79, 70, 229, 0.28)); }
}

@keyframes textFadeSlideUp {
  0% {
    opacity: 0.85;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sparklePulse {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; }
  50% { transform: scale(1.2) rotate(12deg); opacity: 1; }
}
`;

if (!css.includes('textGradientShimmer')) {
  css += animationKeyframes;
  console.log('Animation keyframes appended.');
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('layout.css typography & animations successfully updated.');
