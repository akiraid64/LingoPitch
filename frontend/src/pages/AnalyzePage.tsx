import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyzeCall, CallAnalysisResponse } from '../services/api';

export function AnalyzePage() {
    const { session, profile } = useAuth();
    const [transcript, setTranscript] = useState('');
    const [language, setLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CallAnalysisResponse | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log('📂 [handleFileUpload] File input changed. Selected file:', file?.name, file?.type, file?.size);

        if (!file) {
            console.log('⚠️ [handleFileUpload] No file selected or selection cancelled');
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                console.log(`⏳ [handleFileUpload] Reading file: ${Math.round((event.loaded / event.total) * 100)}%`);
            }
        };

        reader.onload = (event) => {
            console.log('✅ [handleFileUpload] File read successfully');
            const text = event.target?.result as string;
            console.log('📄 [handleFileUpload] Transcript snippet (first 100 chars):', text.substring(0, 100));
            setTranscript(text);
        };

        reader.onerror = (err) => {
            console.error('❌ [handleFileUpload] FileReader error:', err);
        };

        console.log('🚀 [handleFileUpload] Starting file read as text...');
        reader.readAsText(file);
    };

    const handleAnalyze = async () => {
        if (!transcript.trim()) {
            setError('Please enter or upload a transcript first.');
            return;
        }

        if (!session?.access_token) {
            setError('You must be logged in to analyze calls.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('🔍 AnalyzePage: Session state:', session);
            console.log('🔍 AnalyzePage: User object:', session?.user);

            if (!session?.user?.id) {
                console.error('❌ AnalyzePage: NO USER ID FOUND IN SESSION!');
                setError('User session error. Please refresh or relogin.');
                setIsLoading(false);
                return;
            }

            console.log('🚀 AnalyzePage: Starting analysis for user ID:', session.user.id);
            console.log('🔍 AnalyzePage: Using Profile Org ID:', profile?.org_id);

            const data = await analyzeCall(session.access_token, transcript, language, {
                userId: session.user.id,
                orgId: profile?.org_id // Fixed: Get from profile
            });
            console.log('✅ AnalyzePage: Analysis successful, result:', data);
            setResult(data);
        } catch (err: any) {
            console.error('❌ AnalyzePage: Analysis failed:', err);
            setError(err.message || 'Failed to analyze call');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-50 to-primary-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="font-display font-bold text-5xl md:text-6xl uppercase mb-4">
                        Analyze Calls
                    </h1>
                    <p className="text-xl text-dark-700 font-medium">
                        Upload a real call transcript and get scored on 10 sales parameters
                        + 4 cultural intelligence metrics.
                    </p>
                </motion.div>

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 brutal-card bg-white p-8"
                    >
                        <h2 className="font-display font-bold text-2xl uppercase mb-6 flex items-center gap-2">
                            <Upload className="w-6 h-6" />
                            Input Transcript
                        </h2>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".txt,.vtt,.srt"
                            style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}
                        />

                        {/* File Upload Button */}
                        <div
                            onClick={() => {
                                console.log('🖱️ [AnalyzePage] Upload button clicked');
                                fileInputRef.current?.click();
                            }}
                            className="border-3 border-dashed border-dark-200 hover:border-primary-500 hover:bg-primary-50 
                                     rounded-xl p-8 mb-6 cursor-pointer transition-colors text-center group relative"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-dark-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                {fileName ? (
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                ) : (
                                    <FileText className="w-8 h-8 text-dark-500 group-hover:text-primary-700" />
                                )}
                            </div>
                            <p className="font-bold text-dark-700">
                                {fileName ? `Selected: ${fileName}` : 'Click to upload .txt or .vtt'}
                            </p>
                            <p className="text-sm text-dark-500">
                                {fileName ? 'Click again to change' : 'or paste text below'}
                            </p>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Paste call transcript here..."
                            className="w-full h-64 px-4 py-3 border-3 border-dark-200 rounded-lg font-mono text-sm
                                     resize-none focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 mb-6"
                        />

                        {/* Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="px-4 py-3 border-3 border-dark-900 rounded-lg font-bold bg-white"
                            >
                                <option value="en">English (Default)</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="it">Italian</option>
                                <option value="pt">Portuguese</option>
                                <option value="nl">Dutch</option>
                                <option value="ru">Russian</option>
                                <option value="ja">Japanese</option>
                                <option value="zh">Chinese</option>
                            </select>

                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !transcript.trim()}
                                className="btn-brutal flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <BarChart2 className="w-5 h-5" />
                                        Analyze Now
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border-2 border-red-500 text-red-700 rounded-lg flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column: Results Placeholder or Guide */}
                    <div className="lg:col-span-1 space-y-6">
                        {!result && (
                            <>
                                <div className="glass-card">
                                    <h3 className="font-display font-bold text-lg uppercase mb-3">
                                        📊 What we analyze
                                    </h3>
                                    <ul className="text-sm text-dark-700 space-y-2 font-mono">
                                        <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Needs Discovery</li>
                                        <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Value Proposition</li>
                                        <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Objection Handling</li>
                                        <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Closing Techniques</li>
                                        <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Cultural Fit</li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 space-y-8"
                        >
                            {/* Overall Score Card */}
                            <div className="brutal-card bg-dark-900 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div>
                                    <h2 className="font-display font-bold text-3xl uppercase mb-2 text-primary-400">Analysis Complete</h2>
                                    <p className="text-dark-300">Call ID: {result.call.id}</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-7xl font-black text-white p-4 border-4 border-white inline-block shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]">
                                        {result.analysis.score}
                                    </div>
                                    <p className="mt-2 text-sm font-mono uppercase tracking-widest">Overall Score</p>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="glass-card bg-white">
                                <h3 className="font-display font-bold text-2xl uppercase mb-4">Executive Summary</h3>
                                <p className="text-lg leading-relaxed text-dark-800">{result.analysis.executiveSummary || result.analysis.summary}</p>
                            </div>

                            {/* Scores Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="brutal-card bg-white">
                                    <h3 className="font-display font-bold text-xl uppercase mb-6 border-b-4 border-dark-100 pb-2">Sales Parameters</h3>
                                    <div className="space-y-4">
                                        <ScoreRow label="Needs Discovery" score={result.analysis.scoreNeedsDiscovery} />
                                        <ScoreRow label="Value Proposition" score={result.analysis.scoreValueProposition} />
                                        <ScoreRow label="Objection Handling" score={result.analysis.scoreObjectionHandling} />
                                        <ScoreRow label="Decision Process" score={result.analysis.scoreDecisionProcess} />
                                        <ScoreRow label="Closing" score={result.analysis.scoreNextSteps} />
                                    </div>
                                </div>

                                <div className="brutal-card bg-accent-50">
                                    <h3 className="font-display font-bold text-xl uppercase mb-6 border-b-4 border-dark-900 pb-2">Cultural Intel</h3>
                                    <div className="space-y-4">
                                        {/* Fallback to raw_response if cultural properties aren't top level yet */}
                                        <ScoreRow label="Cultural Appropriateness" score={result.analysis.scoreCulturalAppropriateness || result.analysis.raw_response?.cultural_scores?.scoreCulturalAppropriateness} />
                                        <ScoreRow label="Formality Match" score={result.analysis.scoreLanguageFormality || result.analysis.raw_response?.cultural_scores?.scoreLanguageFormality} />
                                        <ScoreRow label="Protocol Adherence" score={result.analysis.scoreProtocolAdherence || result.analysis.raw_response?.cultural_scores?.scoreProtocolAdherence} />
                                        <ScoreRow label="Relationship Building" score={result.analysis.scoreRelationshipSensitivity || result.analysis.raw_response?.cultural_scores?.scoreRelationshipSensitivity} />
                                    </div>
                                </div>
                            </div>

                            {/* Coaching Tips */}
                            <div className="bg-primary-100 border-l-8 border-primary-500 p-8 rounded-r-xl">
                                <h3 className="font-display font-bold text-2xl uppercase mb-6 text-primary-900">Coaching Tips</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {result.analysis.coachingTips?.map((tip: string, i: number) => (
                                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm flex gap-3">
                                            <span className="font-bold text-primary-500 text-xl">{i + 1}.</span>
                                            <p className="text-dark-800">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Helper component for score rows
function ScoreRow({ label, score }: { label: string; score?: number }) {
    if (score === undefined) return null;

    // Color logic
    let colorClass = 'bg-red-500';
    if (score >= 80) colorClass = 'bg-green-500';
    else if (score >= 60) colorClass = 'bg-yellow-400';

    return (
        <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-dark-700">{label}</span>
            <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="w-32 h-3 bg-dark-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${colorClass}`}
                        style={{ width: `${score}%` }}
                    />
                </div>
                <span className="font-bold font-mono w-8 text-right">{score}</span>
            </div>
        </div>
    );
}
