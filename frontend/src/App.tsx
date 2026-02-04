import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { ArenaPage } from '@/pages/ArenaPage';
import { AnalyzePage } from '@/pages/AnalyzePage';
import { DashboardPage } from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AdvisorPage from '@/pages/AdvisorPage';
import TeamPage from '@/pages/TeamPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { MemberDetailPage } from '@/pages/MemberDetailPage';
import CallHistoryPage from '@/pages/CallHistoryPage';
import MyProgressPage from '@/pages/MyProgressPage';
import PlaybooksPage from '@/pages/PlaybooksPage';
import TeamAnalyticsPage from '@/pages/TeamAnalyticsPage';

function App() {
    const { loadAvailableLanguages } = useLanguageStore();

    useEffect(() => {
        // Load available languages on app start
        loadAvailableLanguages();
    }, []);

    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected routes wrapped in AppLayout */}
                    <Route
                        path="/arena"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <ArenaPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/analyze"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <AnalyzePage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <DashboardPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/advisor"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <AdvisorPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/team"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <TeamPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <SettingsPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/team/:memberId"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <MemberDetailPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/call-history"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <CallHistoryPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/progress"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <MyProgressPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/playbooks"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <PlaybooksPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <TeamAnalyticsPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

