import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/arena', label: 'Practice Arena' },
        { path: '/analyze', label: 'Analyze Calls' },
        { path: '/dashboard', label: 'Dashboard' },
    ];

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b-4 border-black">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-primary-400 border-4 border-black shadow-brutal-sm
                            group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none
                            transition-all duration-200 flex items-center justify-center">
                            <Globe2 className="w-6 h-6" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-display font-bold text-2xl uppercase tracking-tight">
                                LingoPitch
                            </div>
                            <div className="text-xs font-mono text-dark-600">
                                Train to sell anywhere
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`font-display font-bold text-sm uppercase tracking-wide
                            transition-colors duration-200 pb-1 border-b-3
                            ${location.pathname === item.path
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent hover:border-dark-300'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <LanguageSelector />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 border-3 border-black bg-white shadow-brutal-sm
                         hover:shadow-none hover:translate-x-1 hover:translate-y-1
                         transition-all duration-200"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden py-4 border-t-4 border-black"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block py-3 px-4 font-display font-bold uppercase text-sm
                            border-l-4 mb-2
                            ${location.pathname === item.path
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-transparent hover:border-dark-300 hover:bg-dark-50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </nav>
        </header>
    );
}
