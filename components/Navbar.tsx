
import React from 'react';
import { Search, User, List, BookOpen, LayoutGrid, PlusCircle, Bookmark } from 'lucide-react';

interface NavbarProps {
  onNavigate: (path: string) => void;
  activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage }) => {
  const navItems = [
    { id: 'home', label: 'HQ', icon: LayoutGrid, path: '/' },
    { id: 'long-boxes', label: 'LONG BOXES', icon: Bookmark, path: '/long-boxes' },
    { id: 'continuity', label: 'CONTINUITY', icon: BookOpen, path: '/continuity' },
    { id: 'identity', label: 'IDENTITY', icon: User, path: '/identity' },
  ];

  return (
    <nav className="bg-[#161A21] border-b border-[#1E232B] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-white w-8 h-8 rounded flex items-center justify-center">
            <span className="text-[#0E1116] text-xl font-bold font-space">C</span>
          </div>
          <h1 className="text-white text-2xl font-space font-semibold group-hover:text-[#4FD1C5] transition-colors">Continuity</h1>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-[10px] font-bold flex items-center gap-2 tracking-[0.2em] transition-colors ${
                activePage === item.id ? 'text-[#4FD1C5]' : 'text-[#B3B8C2] hover:text-white'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="p-2 text-[#B3B8C2] hover:text-[#4FD1C5] transition-colors"
            onClick={() => onNavigate('search')}
          >
            <Search size={22} />
          </button>
          <button
            className="bg-[#4FD1C5] hover:bg-[#38B2AC] text-black text-[10px] font-bold px-4 py-2 rounded flex items-center gap-2 transition-all transform active:scale-95 tracking-widest"
            onClick={() => onNavigate('search')}
          >
            <PlusCircle size={16} />
            ADD TO CONTINUITY
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
