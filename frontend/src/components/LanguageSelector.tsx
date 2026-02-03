import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
    const { i18n } = useTranslation();
    const {
        currentLanguageInfo,
        availableLanguages,
        isLoadingProfile,
        setLanguage,
        loadAvailableLanguages,
    } = useLanguageStore();

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadAvailableLanguages();
    }, []);

    const filteredLanguages = availableLanguages.filter(
        (lang) =>
            lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLanguageSelect = async (langCode: string) => {
        await setLanguage(langCode);
        i18n.changeLanguage(langCode);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-5 py-3 bg-white border-4 border-black
                   shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px]
                   transition-all duration-200 font-display font-bold uppercase text-sm"
                disabled={isLoadingProfile}
            >
                <Globe className="w-5 h-5" />
                <span className="text-2xl">{currentLanguageInfo?.flag}</span>
                <span className="hidden sm:inline">{currentLanguageInfo?.name}</span>
                <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
                {isLoadingProfile && (
                    <div className="w-4 h-4 border-3 border-black border-t-transparent rounded-full animate-spin" />
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full mt-2 right-0 w-[400px] max-h-[500px]
                         bg-white border-4 border-black shadow-brutal-lg z-50
                         flex flex-col"
                        >
                            {/* Search Box */}
                            <div className="p-4 border-b-4 border-black">
                                <input
                                    type="text"
                                    placeholder="Search languages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 border-3 border-black font-mono text-sm
                             focus:outline-none focus:ring-4 focus:ring-accent-300"
                                    autoFocus
                                />
                            </div>

                            {/* Language List */}
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                {filteredLanguages.length === 0 ? (
                                    <div className="p-8 text-center text-dark-500">
                                        No languages found
                                    </div>
                                ) : (
                                    filteredLanguages.map((lang) => (
                                        <motion.button
                                            key={lang.code}
                                            onClick={() => handleLanguageSelect(lang.code)}
                                            className={`w-full px-6 py-4 flex items-center justify-between gap-4
                                  border-b-2 border-dark-200 hover:bg-accent-100
                                  transition-colors duration-150 text-left group
                                  ${lang.code === currentLanguageInfo?.code
                                                    ? 'bg-primary-100'
                                                    : ''
                                                }`}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <span className="text-3xl">{lang.flag}</span>
                                                <div className="flex-1">
                                                    <div className="font-display font-bold text-base">
                                                        {lang.name}
                                                    </div>
                                                    <div className="text-sm text-dark-600">
                                                        {lang.nativeName}
                                                    </div>
                                                </div>
                                            </div>

                                            {lang.code === currentLanguageInfo?.code && (
                                                <Check className="w-5 h-5 text-primary-600" />
                                            )}
                                        </motion.button>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t-4 border-black bg-dark-50">
                                <div className="text-xs text-dark-600 font-mono text-center">
                                    {availableLanguages.length}+ languages powered by Lingo.dev
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
