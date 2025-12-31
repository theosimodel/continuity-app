import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const start = 1000;
    const gap1 = 2200;
    const gap2 = 2000;
    const gap3 = 1500;

    const t1 = setTimeout(() => setShowLine1(true), start);
    const t2 = setTimeout(() => setShowLine2(true), start + gap1);
    const t3 = setTimeout(() => setShowSupport(true), start + gap1 + gap2);
    const t4 = setTimeout(() => setShowCta(true), start + gap1 + gap2 + gap3);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const revealClass = (show: boolean) =>
    `transition-all duration-[1500ms] ease-out ${
      show
        ? 'opacity-100 max-h-[200px] my-[10px] translate-y-0'
        : 'opacity-0 max-h-0 my-0 translate-y-[10px] overflow-hidden'
    }`;

  return (
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,#12161c_0%,#0b0d10_70%)] flex items-center justify-center overflow-hidden">
      <div className="text-center max-w-[720px] px-6 flex flex-col items-center">
        <div className={revealClass(showLine1)}>
          <h1 className="font-semibold tracking-[0.02em] leading-[1.15] text-white text-[clamp(2.6rem,5vw,3.4rem)]">
            Reading comics is easy.
          </h1>
        </div>

        <div className={revealClass(showLine2)}>
          <h1 className="font-semibold tracking-[0.02em] leading-[1.15] text-[#7ee0d6] text-[clamp(2.6rem,5vw,3.4rem)]">
            Remembering them isn't.
          </h1>
        </div>

        <div className={revealClass(showSupport)}>
          <p className="text-[1.1rem] text-[#b8bcc6] max-w-[540px] leading-[1.6]">
            Continuity helps you track what you've read and build a personal canon.
          </p>
        </div>

        <div className={revealClass(showCta)}>
          <button
            onClick={onStart}
            disabled={!showCta}
            className="mt-[15px] px-[2.2rem] py-[0.9rem] text-[1rem] bg-[#7ee0d6] text-[#0b0d10] rounded-full border-none cursor-pointer font-semibold transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start your Continuity
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
