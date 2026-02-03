import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import { Header } from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { ArenaPage } from '@/pages/ArenaPage';
import { AnalyzePage } from '@/pages/AnalyzePage';
import { DashboardPage } from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

function App() {
    const { loadAvailableLanguages } = useLanguageStore();

    useEffect(() => {
        // Load available languages on app start
        loadAvailableLanguages();
    }, []);

    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-dark-50">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* Protected routes */}
                        <Route
                            path="/arena"
                            element={
                                <ProtectedRoute>
                                    <Header />
                                    <ArenaPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/analyze"
                            element={
                                <ProtectedRoute>
                                    <Header />
                                    <AnalyzePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Header />
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;

