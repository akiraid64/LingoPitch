import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguageStore } from '../store/languageStore';
import { Globe, Check, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { targetLocale } = useLanguageStore();
    const location = useLocation();

    return (
        <div className="min-h-screen flex bg-white">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
                {/* 
                    KEY FIX: key={location.pathname} 
                    This force-remounts the ENTIRE content wrapper when the route changes.
                    This ensures React destroys the old "Dashboard" DOM (even if we hijacked it with innerHTML)
                    and creates a fresh, clean DOM for the new page (e.g. "Analyze") BEFORE we try to translate it.
                */}
                <TranslatableContentWrapper key={location.pathname} targetLocale={targetLocale} path={location.pathname}>
                    {children}
                </TranslatableContentWrapper>

                <footer className="relative z-10 px-8 py-4 border-t-2 border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>© {new Date().getFullYear()} LingoPitch Command</span>
                    <div className="flex gap-4">
                        <span className="hover:text-black cursor-pointer transition-colors">Internal Ops</span>
                        <span className="hover:text-black cursor-pointer transition-colors">Support Channel</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}

// Inner component to handle strict lifecycle for a SINGLE route
function TranslatableContentWrapper({ children, targetLocale, path }: { children: React.ReactNode, targetLocale: string | null, path: string }) {
    const [isTranslating, setIsTranslating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showComplete, setShowComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Removed unused isTranslated state
    const contentRef = useRef<HTMLDivElement>(null);
    const originalHtmlRef = useRef<string>('');

    // Global cache (outside component to persist across nav)
    // We use a composite key: "locale:path"
    const cacheKey = `${targetLocale || 'en'}:${path}`;

    useEffect(() => {
        const runTranslation = async () => {
            console.log(`[AppLayout] 🏁 RunTranslation triggered. TargetLocale: "${targetLocale}" Path: "${path}"`);

            // HELPER: Wait for Loading
            // We must wait for React to finish rendering spinners/skeletons before capturing.
            const waitForContent = async (): Promise<boolean> => {
                return new Promise((resolve) => {
                    let attempts = 0;
                    const maxAttempts = 20; // 10 seconds

                    const check = setInterval(() => {
                        attempts++;
                        if (!contentRef.current) {
                            clearInterval(check);
                            resolve(false);
                            return;
                        }

                        // Check indicators
                        const hasSpinner = contentRef.current.querySelector('.animate-spin');
                        const isTooShort = contentRef.current.innerText.length < 50;
                        const isAnalyze = path.includes('analyze');
                        const hasAnalyzeContent = isAnalyze ? contentRef.current.querySelector('textarea') : true;

                        if (!hasSpinner && !isTooShort && hasAnalyzeContent) {
                            clearInterval(check);
                            resolve(true);
                        } else if (attempts >= maxAttempts) {
                            console.warn('[AppLayout] Timed out waiting for content load');
                            clearInterval(check);
                            resolve(true);
                        }
                    }, 500);
                });
            };

            // SKIPPED ROUTES (INTERACTIVE PAGES)
            // Some pages are highly recursive or interactive (Chat, Arena). 
            // innerHTML replacement kills React listeners (onClick, onSubmit), 
            // so we skip full-page translation for them completely.
            // They should rely on UI-String translation (nav/sidebar) or internal translation logic.
            const skippedRoutes = ['/advisor', '/arena', '/team', '/progress', '/settings', '/analyze'];
            if (skippedRoutes.some(route => path.includes(route))) {
                console.log(`[AppLayout] ⚠️ Skipping translation for interactive route: ${path}`);
                return;
            }

            // 1. ENSURE SOURCE IS CAPTURED
            // If we don't have the original English HTML yet, we must capture it now.
            // This usually happens on first mount.
            if (!originalHtmlRef.current) {
                console.log(`[AppLayout] 📸 No original source. Waiting to capture...`);
                await waitForContent();

                if (!contentRef.current) return;
                let freshHtml = contentRef.current.innerHTML;

                // Sanitize (Framer Motion opacity fix)
                freshHtml = freshHtml
                    .replace(/opacity:\s*0;?/g, '')
                    .replace(/transform:\s*[^;"]+;?/g, '')
                    .replace(/style="[^"]*opacity:\s*0[^"]*"/g, '');

                originalHtmlRef.current = freshHtml;
                console.log(`[AppLayout] 📸 Captured Original HTML (${freshHtml.length} chars)`);
            }

            // 2. ALWAYS RESTORE ENGLISH FIRST
            // Before applying any new translation (or reverting to English), reset the DOM.
            // This prevents "Double Translation" (e.g. French -> Spanish) and ensures clean state.
            if (contentRef.current && originalHtmlRef.current) {
                contentRef.current.innerHTML = originalHtmlRef.current;
            }

            // 3. IF TARGET IS ENGLISH -> STOP HERE
            // We just restored the original HTML, so our job is done.
            if (!targetLocale || targetLocale.startsWith('en')) {
                console.log('[AppLayout] 🛑 Target is English. Restored original. Done.');
                return;
            }

            // 4. CHECK CACHE (Persistent)
            try {
                const storageKey = `lingo_cache_${cacheKey}`;
                const cachedHtml = localStorage.getItem(storageKey);

                if (cachedHtml && cachedHtml.length > 100) {
                    console.log(`[AppLayout] ✅ Local Cache HIT! Applying...`);
                    if (contentRef.current) {
                        contentRef.current.innerHTML = cachedHtml;
                        return; // Done
                    }
                }
            } catch (e) {
                console.warn('[AppLayout] Failed to read local storage', e);
            }

            // 5. START API CALL
            setIsTranslating(true);
            setProgress(10);
            const interval = setInterval(() => setProgress(p => p < 90 ? p + 10 : p), 500);

            try {
                console.log(`[AppLayout] 📡 Fetching translation for ${path}...`);
                const response = await fetch(`${API_URL}/api/translation/html`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        html: originalHtmlRef.current, // Always send Original English
                        targetLocale: targetLocale,
                    }),
                });

                const data = await response.json();

                if (data.success && data.html) {
                    // Update DOM
                    if (contentRef.current) {
                        contentRef.current.innerHTML = data.html;
                    }

                    // Save to local storage
                    try {
                        const storageKey = `lingo_cache_${cacheKey}`;
                        localStorage.setItem(storageKey, data.html);
                        console.log(`[AppLayout] 💾 Saved to Local Storage: ${storageKey}`);
                    } catch (e) {
                        console.warn('[AppLayout] Failed to save to local storage', e);
                    }

                    setShowComplete(true);
                    setTimeout(() => setShowComplete(false), 2000);
                } else {
                    throw new Error(data.error?.message || 'Failed');
                }
            } catch (err: any) {
                console.error('[AppLayout] Translation failed:', err);
                setError(err.message);
                // Revert to original on error
                if (contentRef.current) contentRef.current.innerHTML = originalHtmlRef.current;
            } finally {
                clearInterval(interval);
                setIsTranslating(false);
                setProgress(100);
            }
        };

        runTranslation();
    }, [targetLocale, path]); // dependency on path is technically redundant due to key remount, but good for safety

    return (
        <>
            <header className="sticky top-0 z-20 bg-white border-b-2 border-gray-100 px-8 py-3 flex justify-end items-center gap-4">
                {isTranslating && (
                    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 border-2 border-blue-200 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-xs font-bold text-blue-700">Translating... {progress}%</span>
                    </div>
                )}
                {showComplete && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 border-2 border-green-200">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-bold">Translated!</span>
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 border-2 border-red-200">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-bold">Error</span>
                    </div>
                )}
                <LanguageSwitcher />
            </header>

            {isTranslating && (
                <div className="absolute inset-0 z-30 bg-white/95 flex flex-col items-center justify-center top-[64px]">
                    <Globe className="w-16 h-16 text-blue-500 animate-pulse mb-6" />
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
                        Translating {path.replace('/', '') || 'Home'}...
                    </h2>
                    <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            <div
                ref={contentRef}
                className="flex-1 relative z-10 p-8 overflow-y-auto max-h-[calc(100vh-64px)]"
            // If not translated yet, we let React render children normally
            // If translated, innerHTML takes over (React children still exist in VDOM but are detached from DOM)
            >
                {children}
            </div>
        </>
    );
}
