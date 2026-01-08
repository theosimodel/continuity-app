import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1E232B]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center space-y-2 text-sm text-white/45">
          <div className="font-medium text-white/55">Continuity</div>
          <div className="text-white/35">© 2025</div>

          <div className="pt-2">
            <Link to="/privacy" className="text-white/35 hover:text-white/65 transition">Privacy</Link>
            <span className="mx-2 text-white/20">·</span>
            <Link to="/terms" className="text-white/35 hover:text-white/65 transition">Terms</Link>
            <span className="mx-2 text-white/20">·</span>
            <Link to="/about" className="text-white/35 hover:text-white/65 transition">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
