import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Terminal } from 'lucide-react';

interface NavbarProps {
  siteSettings: Record<string, string>;
}

export const Navbar: React.FC<NavbarProps> = ({ siteSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: 'home' },
    { name: 'About', href: 'about' },
    { name: 'Education', href: 'education' },
    { name: 'Skills', href: 'skills' },
    { name: 'Projects', href: 'projects' },
    { name: 'Experience', href: 'experience' },
    { name: 'Achievements', href: 'achievements' },
    { name: 'Certifications', href: 'certifications' },
    { name: 'Blog', href: 'blog' },
    { name: 'Contact', href: 'contact' },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (!isHome) {
      navigate('/', { state: { scrollTo: href } });
    } else {
      const element = document.getElementById(href);
      if (element) {
        const offset = 80; // height of sticky navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-navy-bg/90 backdrop-blur-md border-b border-navy-card/50 py-4 shadow-lg' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <Terminal className="w-6 h-6 text-accent-cyan group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-heading font-bold text-xl tracking-tight text-white">
            {siteSettings.name || 'Sravan Kumar'}
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="text-text-secondary hover:text-accent-cyan font-sans text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              {link.name}
            </button>
          ))}
          <Link 
            to="/admin" 
            className="px-4 py-2 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 rounded-md font-sans text-sm font-semibold transition-all duration-200"
          >
            Console
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-text-secondary hover:text-white focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-navy-card/95 backdrop-blur-lg border-b border-navy-card/50 py-4 px-6 absolute top-full left-0 w-full flex flex-col gap-4 shadow-xl">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="text-left text-text-secondary hover:text-accent-cyan font-sans py-2 text-base font-medium transition-colors duration-200"
            >
              {link.name}
            </button>
          ))}
          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 rounded-md font-sans text-sm font-semibold transition-all duration-200 text-center"
          >
            Console Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
};
