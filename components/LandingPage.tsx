import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [hideIntro, setHideIntro] = useState(false);
  const [showLine3, setShowLine3] = useState(false);
  const [showFeature1, setShowFeature1] = useState(false);
  const [showFeature2, setShowFeature2] = useState(false);
  const [showFeature3, setShowFeature3] = useState(false);
  const [showFeature4, setShowFeature4] = useState(false);
  const [showFeature5, setShowFeature5] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const start = 1000;
    const gap1 = 2500;
    const gap2 = 2200;
    const gap3 = 1800;
    const featureGap = 1000;
    const finalGap = 1500;

    let time = start;
    const t1 = setTimeout(() => setShowLine1(true), time);

    time += gap1;
    const t2 = setTimeout(() => setShowLine2(true), time);

    time += gap2;
    const t3 = setTimeout(() => setShowSupport(true), time);

    time += gap3;
    const t4 = setTimeout(() => setShowLine3(true), time);
    const tHide = setTimeout(() => setHideIntro(true), time + 500);

    time += featureGap;
    const t5 = setTimeout(() => setShowFeature1(true), time);

    time += featureGap;
    const t6 = setTimeout(() => setShowFeature2(true), time);

    time += featureGap;
    const t7 = setTimeout(() => setShowFeature3(true), time);

    time += featureGap;
    const t8 = setTimeout(() => setShowFeature4(true), time);

    time += featureGap;
    const t9 = setTimeout(() => setShowFeature5(true), time);

    time += finalGap;
    const t10 = setTimeout(() => setShowCta(true), time);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tHide);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(t9);
      clearTimeout(t10);
    };
  }, []);

  // Blur + fade for intro elements
  const introRevealClass = (show: boolean, hide: boolean) =>
    `transition-all duration-[1500ms] ease-out ${
      hide
        ? 'opacity-0 blur-md scale-95 max-h-0 my-0 overflow-hidden'
        : show
        ? 'opacity-100 max-h-[200px] my-3 translate-y-0 blur-0 scale-100'
        : 'opacity-0 max-h-0 my-0 translate-y-[15px] overflow-hidden'
    }`;

  // Standard reveal for features
  const revealClass = (show: boolean) =>
    `transition-all duration-[1500ms] ease-out ${
      show
        ? 'opacity-100 max-h-[200px] my-1 sm:my-3 translate-y-0'
        : 'opacity-0 max-h-0 my-0 translate-y-[15px] overflow-hidden'
    }`;

  return (
    <div className="min-h-screen bg-[#0b0d10] flex flex-col items-center justify-center py-4 sm:py-16 px-5 relative">
      {/* Ambient dot texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="text-center max-w-[800px] flex flex-col items-center relative z-10">
        {/* Line 1 */}
        <div className={introRevealClass(showLine1, hideIntro)}>
          <h1
            className="font-semibold tracking-[-0.01em] leading-[1.15] text-white"
            style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 'clamp(2.4rem, 6vw, 3.8rem)'
            }}
          >
            Reading comics is easy.
          </h1>
        </div>

        {/* Line 2 */}
        <div className={introRevealClass(showLine2, hideIntro)}>
          <h2
            className="font-semibold tracking-[-0.01em] leading-[1.15] text-[#7ee0d6]"
            style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 'clamp(2.4rem, 6vw, 3.8rem)'
            }}
          >
            Remembering them isn't.
          </h2>
        </div>

        {/* Support text */}
        <div className={introRevealClass(showSupport, hideIntro)}>
          <p className="text-[1.1rem] text-[#b8bcc6] max-w-[520px] leading-[1.6]">
            Continuity helps you track your journey through every universe and build your personal canon.
          </p>
        </div>

        {/* Line 3 - Features intro */}
        <div className={`${revealClass(showLine3)} mt-4 sm:mt-8`}>
          <h3
            className="font-semibold tracking-[-0.01em] text-white"
            style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.2rem)'
            }}
          >
            Continuity lets you…
          </h3>
        </div>

        {/* Feature 1 */}
        <div className={revealClass(showFeature1)}>
          <p className="text-[0.95rem] sm:text-[1.1rem] text-[#b8bcc6] leading-[1.4] sm:leading-[1.6]">
            <span className="text-[1.1rem] sm:text-[1.25rem] text-white font-medium block">
              📖 Remember every comic you've read
            </span>
            <span className="text-[#b8bcc6]">— from your first issue to now</span>
          </p>
        </div>

        {/* Feature 2 */}
        <div className={revealClass(showFeature2)}>
          <p className="text-[0.95rem] sm:text-[1.1rem] text-[#b8bcc6] leading-[1.4] sm:leading-[1.6]">
            <span className="text-[1.1rem] sm:text-[1.25rem] text-white font-medium block">
              ⭐ Mark what you want to read, own, or return to
            </span>
          </p>
        </div>

        {/* Feature 3 */}
        <div className={revealClass(showFeature3)}>
          <p className="text-[0.95rem] sm:text-[1.1rem] text-[#b8bcc6] leading-[1.4] sm:leading-[1.6]">
            <span className="text-[1.1rem] sm:text-[1.25rem] text-white font-medium block">
              ✍️ Write notes for yourself
            </span>
            <span className="text-[#b8bcc6]">— not ratings for engagement</span>
          </p>
        </div>

        {/* Feature 4 */}
        <div className={revealClass(showFeature4)}>
          <p className="text-[0.95rem] sm:text-[1.1rem] text-[#b8bcc6] leading-[1.4] sm:leading-[1.6]">
            <span className="text-[1.1rem] sm:text-[1.25rem] text-white font-medium block">
              🗂 Curate and share reading paths
            </span>
            <span className="text-[#b8bcc6]">by creator, theme, era, or mood</span>
          </p>
        </div>

        {/* Feature 5 */}
        <div className={revealClass(showFeature5)}>
          <p className="text-[0.95rem] sm:text-[1.1rem] text-[#b8bcc6] leading-[1.4] sm:leading-[1.6]">
            <span className="text-[1.1rem] sm:text-[1.25rem] text-white font-medium block">
              🧠 Treat your reading history as canon
            </span>
            <span className="text-[#b8bcc6]">— not content, not competition</span>
          </p>
        </div>

        {/* CTA Button */}
        <div className={`${revealClass(showCta)} mt-2 sm:mt-4`}>
          <button
            onClick={onStart}
            disabled={!showCta}
            className="px-[2.8rem] py-[1.1rem] text-[1rem] bg-[#7ee0d6] text-[#0b0d10] rounded-full border-none cursor-pointer font-bold uppercase tracking-[0.1em] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_25px_rgba(126,224,214,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start your Continuity
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
