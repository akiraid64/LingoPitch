import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { Header } from '@/components/Header';
import { HomePage } from '@/pages/HomePage';
import { ArenaPage } from '@/pages/ArenaPage';
import { AnalyzePage } from '@/pages/AnalyzePage';
import { DashboardPage } from '@/pages/DashboardPage';

function App() {
    const { loadAvailableLanguages } = useLanguageStore();

    useEffect(() => {
        // Load available languages on app start
        loadAvailableLanguages();
    }, []);

    return (
        <Router>
            <div className="min-h-screen bg-dark-50">
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/arena" element={<ArenaPage />} />
                    <Route path="/analyze" element={<AnalyzePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
