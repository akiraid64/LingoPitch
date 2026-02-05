import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { getLanguageGroups, getLanguageByCode, DEFAULT_LANGUAGE, LanguageVariant } from '../config/languages';
import { useLanguageStore } from '../store/languageStore';

interface LanguageSwitcherProps {
    onLanguageChange?: (language: LanguageVariant) => void;
}

export default function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
    const { targetLocale, currentLanguage, setTargetLocale } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);

    // Sync local state with store on mount
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageVariant>(() => {
        const activeCode = targetLocale || currentLanguage;
        return getLanguageByCode(activeCode) || DEFAULT_LANGUAGE;
    });

    // Effect to update when store changes (e.g. from other components/refresh)
    useEffect(() => {
        const activeCode = targetLocale || currentLanguage;
        const variant = getLanguageByCode(activeCode) || DEFAULT_LANGUAGE;
        setSelectedLanguage(variant);
    }, [targetLocale, currentLanguage]);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Removed manual localStorage reading to prevent persistence issues
    // State is managed by Zustand store which we configured to NOT persist targetLocale

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (lang: LanguageVariant) => {
        console.log('🌐 Language changed to:', lang.description, `(${lang.code})`);
        console.log('🌐 Lingo.dev code:', lang.lingoDotDevCode);
        setSelectedLanguage(lang);
        setTargetLocale(lang.code); // Update Zustand store
        setIsOpen(false);
        onLanguageChange?.(lang);
    };

    const languageGroups = getLanguageGroups();

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-colors font-bold text-sm"
            >
                <span className="text-lg">{selectedLanguage.flag}</span>
                <span className="hidden sm:inline">{selectedLanguage.description}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="px-4 py-3 border-b-2 border-black bg-gray-50 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="font-black uppercase text-xs">Select Language</span>
                    </div>

                    {/* Language Groups */}
                    {Object.entries(languageGroups).map(([groupName, variants]) => (
                        <div key={groupName} className="border-b border-gray-200 last:border-b-0">
                            {/* Group Header */}
                            <div className="px-4 py-2 bg-gray-100 font-bold text-xs uppercase text-gray-600">
                                {groupName}
                            </div>

                            {/* Variants */}
                            {variants.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleSelect(lang)}
                                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left ${selectedLanguage.code === lang.code ? 'bg-blue-100' : ''
                                        }`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{lang.accent}</div>
                                        <div className="text-xs text-gray-500">{lang.nativeName}</div>
                                    </div>
                                    {selectedLanguage.code === lang.code && (
                                        <span className="text-blue-600 font-black">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
