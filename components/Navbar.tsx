
import React from 'react';
import { Search, User, BookOpen, LayoutGrid, Bookmark, Archive, Eye, PenTool, Book, Sparkles } from 'lucide-react';

interface NavbarProps {
  onNavigate: (path: string) => void;
  activePage: string;
  userSigil?: string;
  hideBottomNav?: boolean;
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

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage, userSigil, hideBottomNav }) => {
  // Get the sigil icon component if user is signed in
  const UserSigilIcon = userSigil ? sigilIcons[userSigil] || User : User;

  const navItems = [
    { id: 'home', label: 'HQ', icon: LayoutGrid, path: '/' },
    { id: 'long-boxes', label: 'LONG BOXES', icon: Bookmark, path: '/long-boxes' },
    { id: 'continuity', label: 'CONTINUITY', icon: BookOpen, path: '/continuity' },
    { id: 'archivist', label: 'ARCHIVIST', icon: Sparkles, path: '/archivist' },
    { id: 'identity', label: null, icon: UserSigilIcon, path: '/identity' },
  ];

  // Mobile nav items (simplified labels)
  const mobileNavItems = [
    { id: 'home', label: 'HQ', icon: LayoutGrid },
    { id: 'long-boxes', label: 'Boxes', icon: Bookmark },
    { id: 'continuity', label: 'Log', icon: BookOpen },
    { id: 'archivist', label: 'AI', icon: Sparkles },
    { id: 'identity', label: userSigil ? 'You' : 'Sign In', icon: UserSigilIcon },
  ];

  return (
    <>
      {/* Desktop/Tablet Top Navbar */}
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

          {/* Mobile: just show search in top bar */}
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

      {/* Mobile Bottom Navigation - hide when keyboard is open */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#161A21] border-t border-[#1E232B] z-50 pb-safe transition-transform duration-200 ${hideBottomNav ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            // Identity icon is always teal when signed in
            const isSignedInIdentity = item.id === 'identity' && userSigil;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                  isSignedInIdentity
                    ? 'text-[#4FD1C5]'
                    : activePage === item.id
                    ? 'text-[#4FD1C5]'
                    : 'text-[#7C828D] active:text-[#4FD1C5]'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
