
import React from 'react';
import { Search, User, BookOpen, LayoutGrid, Bookmark, Archive, Eye, PenTool, Book } from 'lucide-react';

interface NavbarProps {
  onNavigate: (path: string) => void;
  activePage: string;
  userSigil?: string;
}

// Sigil mapping for signed-in state
const sigilIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  'sigil:book': Book,
  'sigil:bookmark': Bookmark,
  'sigil:archive': Archive,
  'sigil:page': BookOpen,
  'sigil:eye': Eye,
  'sigil:pen': PenTool,
};

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage, userSigil }) => {
  // Get the sigil icon component if user is signed in
  const UserSigilIcon = userSigil ? sigilIcons[userSigil] || User : User;

  const navItems = [
    { id: 'home', label: 'HQ', icon: LayoutGrid, path: '/' },
    { id: 'long-boxes', label: 'LONG BOXES', icon: Bookmark, path: '/long-boxes' },
    { id: 'continuity', label: 'CONTINUITY', icon: BookOpen, path: '/continuity' },
    { id: 'identity', label: null, icon: UserSigilIcon, path: '/identity' },
  ];

  return (
    <nav className="bg-[#161A21] border-b border-[#1E232B] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-[#0b0d10] w-8 h-8 rounded-md flex items-center justify-center border border-[#1E232B]">
            <span className="text-[#7ee0d6] text-xl font-bold font-space">C</span>
          </div>
          <h1 className="text-white text-2xl font-space font-semibold group-hover:text-[#4FD1C5] transition-colors">Continuity</h1>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            // Identity icon is always teal when signed in
            const isSignedInIdentity = item.id === 'identity' && userSigil;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-[10px] font-bold flex items-center gap-2 tracking-[0.2em] transition-colors ${
                  isSignedInIdentity
                    ? 'text-[#4FD1C5]'
                    : activePage === item.id
                    ? 'text-[#4FD1C5]'
                    : 'text-[#B3B8C2] hover:text-white'
                }`}
              >
                <item.icon size={16} />
                {item.label && item.label}
              </button>
            );
          })}
          <button
            onClick={() => onNavigate('search')}
            className={`text-[10px] font-bold flex items-center gap-2 tracking-[0.2em] transition-colors ${
              activePage === 'search' ? 'text-[#4FD1C5]' : 'text-[#B3B8C2] hover:text-white'
            }`}
          >
            <Search size={16} />
          </button>
        </div>

        {/* Mobile search - only visible on small screens */}
        <div className="flex md:hidden items-center">
          <button
            className="p-2 text-[#B3B8C2] hover:text-[#4FD1C5] transition-colors"
            onClick={() => onNavigate('search')}
          >
            <Search size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
