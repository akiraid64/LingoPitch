import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Globe2, Loader2, BookOpen, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sendChatMessage, ChatMessage } from '../services/api';
import { useLanguageStore } from '../store/languageStore';
import { useTranslation } from '../contexts/TranslationContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AdvisorPage() {
    const { profile, session } = useAuth();
    const { targetLocale } = useLanguageStore();
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !session?.access_token || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            console.log('💬 Sending chat with targetLocale:', targetLocale || 'none (English)');
            const response = await sendChatMessage(
                session.access_token,
                input,
                messages,
                targetLocale || undefined // Pass selected language for translation
            );

            // The backend returns the updated history, but let's just append the new response to be safe/smooth
            // actually, let's use the backend response history if it matches our structure
            setMessages(prev => [
                ...prev,
                { role: 'model', parts: [{ text: response.response }] }
            ]);

        } catch (error) {
            console.error('Chat error:', error);
            // Add error message as a system/bot message
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: t('errors.somethingWentWrong') }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Role-specific suggested questions
    const isManager = profile?.role === 'manager' || profile?.role === 'admin' || profile?.role === 'sales_manager';

    const suggestedQuestions = isManager
        ? [
            { icon: <TrendingUp size={16} />, text: t('advisor.managerPlaceholder') }, // Using placeholder text as a generic question for now or keys if available
            { icon: <BarChart3 size={16} />, text: "Who needs the most coaching right now?" }, // These specific questions might need to be added to uiStrings if strict translation is needed, for now I'll keep them or map closely if possible. Let's assume specific questions might stay English or need new keys. I will convert the main UI shell first.
            { icon: <BookOpen size={16} />, text: "Are they following the 'Discovery' playbook?" },
            { icon: <Sparkles size={16} />, text: "Summarize the last 5 calls from the team" }
        ]
        : [
            { icon: <TrendingUp size={16} />, text: "How can I improve my closing rate?" },
            { icon: <BarChart3 size={16} />, text: "Analyze my last call for weaknesses" },
            { icon: <BookOpen size={16} />, text: "What does the playbook say about handling price objections?" },
            { icon: <Sparkles size={16} />, text: "Give me a negotiation tip for my next call" }
        ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <header className="flex-shrink-0">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
                    {isManager ? t('advisor.teamCopilot') : t('advisor.myCopilot')} <span className="text-orange-500">{t('advisor.title')}</span>
                </h1>
                <p className="text-gray-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                    {t('advisor.subtitle')} • {isManager ? t('advisor.fullOrgView') : t('advisor.personalView')}
                </p>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                {/* Chat Area */}
                <div className="lg:col-span-3 flex flex-col bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] min-h-0">

                    {/* Messages */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                                <Bot className="w-16 h-16 text-gray-400" />
                                <p className="text-lg font-black uppercase text-gray-400">{t('advisor.askAnything')}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                    {suggestedQuestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setInput(q.text)}
                                            className="text-left p-3 border-2 border-gray-200 hover:border-black hover:bg-orange-50 transition-all rounded-lg flex items-center gap-3 group"
                                        >
                                            <span className="text-gray-400 group-hover:text-orange-500">{q.icon}</span>
                                            <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-black">{q.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] flex items-start gap-4 p-4 border-4 border-black font-medium ${msg.role === 'user'
                                    ? 'bg-orange-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]'
                                    }`}>
                                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center border-2 border-black ${msg.role === 'user' ? 'bg-black text-white' : 'bg-orange-500 text-white'}`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-black prose-a:text-orange-600">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.parts[0].text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                                    <span className="text-xs font-black uppercase tracking-widest">{t('advisor.analyzingData')}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t-8 border-black bg-gray-50 flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isManager ? t('advisor.managerPlaceholder') : t('advisor.placeholder')}
                            className="flex-1 h-14 px-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="w-14 h-14 bg-black text-white flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Info - Simplified for Layout */}
                <div className="flex flex-col gap-6">
                    <div className="p-6 bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                        <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                            {t('advisor.activeContext')}
                        </h3>
                        <div className="space-y-4 text-xs font-bold text-gray-300">
                            <div className="flex items-center gap-2">
                                <Globe2 className="w-4 h-4" />
                                <span>{isManager ? t('advisor.fullOrgView') : t('advisor.personalView')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{t('advisor.queryPlaybook')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                <span>{t('advisor.analyzeTrends')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-1">
                        <h3 className="font-black uppercase text-sm mb-4">{t('advisor.capabilities')}</h3>
                        <ul className="space-y-3 text-xs font-medium text-gray-600">
                            <li className="flex gap-2">
                                <span className="text-orange-500 font-black">•</span>
                                {t('advisor.analyzeTrends')}
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-500 font-black">•</span>
                                {t('advisor.reviewCalls')}
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-500 font-black">•</span>
                                {t('advisor.queryPlaybook')}
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-500 font-black">•</span>
                                {t('advisor.getCoaching')}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
