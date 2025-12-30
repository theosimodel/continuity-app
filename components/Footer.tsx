import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#1E232B]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center space-y-2">
          <p className="text-[#7C828D] text-sm font-space">Continuity</p>
          <p className="text-[#4A4F57] text-xs">© 2025</p>
          <div className="flex items-center justify-center gap-3 text-[#4A4F57] text-xs pt-2">
            <span className="hover:text-[#7C828D] cursor-pointer transition-colors">Privacy</span>
            <span>·</span>
            <span className="hover:text-[#7C828D] cursor-pointer transition-colors">Terms</span>
            <span>·</span>
            <span className="hover:text-[#7C828D] cursor-pointer transition-colors">About</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
