import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

/* Theme toggle icons */
const SunIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MenuIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function Header({ studentId, setStudentId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('studentId');
      sessionStorage.removeItem('studentName');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('studentInterests');
      setStudentId(null);
      navigate('/login');
    }
  };

  const navLinks = [
    { to: '/opportunities', label: 'Opportunities' },
    { to: '/courses', label: 'Courses' },
    { to: '/guardian', label: 'Guardian' },
    { to: '/updates', label: 'Updates' },
    { to: '/profile', label: 'Profile' },
  ];

  const getDesktopLinkClass = (path) => {
    const isActive = location.pathname.startsWith(path);
    const textClass = isActive
      ? (theme === 'dark' ? 'text-white font-bold' : 'text-gray-900 font-bold')
      : (theme === 'dark' ? 'text-gray-400 hover:text-white font-medium' : 'text-gray-500 hover:text-gray-900 font-medium');
      
    const indicatorClass = isActive
      ? 'after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-[#3cc5e0] after:to-[#20c0a0] after:scale-x-100'
      : 'after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-[#3cc5e0] after:to-[#20c0a0] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center';
      
    return `relative transition-colors duration-200 py-1 ${textClass} ${indicatorClass}`;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl border-b
      ${theme === 'dark'
        ? 'bg-[#060d18]/80 border-white/[0.06]'
        : 'bg-white/80 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="py-3.5 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <img
              src="/logo.png"
              alt="Mentoria Logo"
              className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <span className={`text-lg font-bold hidden sm:inline transition-colors duration-200
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Mentoria
              <span className="text-[#3cc5e0] ml-0.5">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 flex-1 mx-10">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={getDesktopLinkClass(to)}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-4 max-w-xs">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all duration-200 outline-none
                  ${theme === 'dark'
                    ? 'bg-white/[0.06] border border-white/[0.1] text-white placeholder-gray-500 focus:bg-white/[0.1] focus:border-[#3cc5e0]/40'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#3cc5e0]/50 focus:shadow-sm'
                  }`}
              />
              <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
              />
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105
                ${theme === 'dark'
                  ? 'text-gray-400 hover:text-[#ffd700] hover:bg-white/[0.06]'
                  : 'text-gray-500 hover:text-[#3cc5e0] hover:bg-gray-100'
                }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark'
                ? <SunIcon className="w-5 h-5" />
                : <MoonIcon className="w-5 h-5" />
              }
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                ${theme === 'dark'
                  ? 'text-gray-300 border border-white/[0.1] hover:bg-white/[0.06] hover:border-white/[0.2]'
                  : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              Logout
            </button>
          </div>

          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors
                ${theme === 'dark' ? 'text-gray-400 hover:text-[#ffd700]' : 'text-gray-500 hover:text-[#3cc5e0]'}`}
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors
                ${theme === 'dark' ? 'text-gray-300 hover:bg-white/[0.06]' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {mobileMenuOpen
                ? <CloseIcon className="w-5 h-5" />
                : <MenuIcon className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`pb-4 border-t ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            {/* Search Bar - Mobile */}
            <form onSubmit={handleSearch} className="px-2 py-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities & courses..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none
                    ${theme === 'dark'
                      ? 'bg-white/[0.06] border border-white/[0.1] text-white placeholder-gray-500 focus:border-[#3cc5e0]/40'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#3cc5e0]/50'
                    }`}
                />
                <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                  ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-1 px-2">
              {navLinks.map(({ to, label }) => {
                const isActive = location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`block px-4 py-2.5 rounded-xl font-medium text-sm transition-colors
                      ${isActive
                        ? (theme === 'dark' ? 'bg-[#3cc5e0]/10 text-[#3cc5e0]' : 'bg-[#3cc5e0]/10 text-[#2195c4]')
                        : (theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-colors mt-2
                  ${theme === 'dark'
                    ? 'text-red-400 hover:bg-red-500/[0.1]'
                    : 'text-red-600 hover:bg-red-50'
                  }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
