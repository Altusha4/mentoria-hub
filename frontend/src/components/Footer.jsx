import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();

  const linkClass = `transition-colors duration-200 ${
    theme === 'dark'
      ? 'text-gray-400 hover:text-[#3cc5e0]'
      : 'text-gray-500 hover:text-[#2195c4]'
  }`;

  return (
    <footer className={`py-12 mt-16 transition-colors duration-300 border-t
      ${theme === 'dark'
        ? 'bg-[#060d18] border-white/[0.06]'
        : 'bg-white border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Mentoria" className="w-8 h-8 object-contain" />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Mentoria<span className="text-[#3cc5e0]"> Hub</span>
              </h3>
            </div>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Discover opportunities and learn asynchronously with our comprehensive platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className={linkClass}>Home</Link>
              </li>
              <li>
                <Link to="/opportunities" className={linkClass}>Opportunities</Link>
              </li>
              <li>
                <Link to="/courses" className={linkClass}>Courses</Link>
              </li>
              <li>
                <Link to="/updates" className={linkClass}>Updates</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Contact
            </h4>
            <a
              href="mailto:mentoriaorganization@gmail.com"
              className={linkClass}
            >
              mentoriaorganization@gmail.com
            </a>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className={`border-t pt-8 ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            © {new Date().getFullYear()} Mentoria Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
