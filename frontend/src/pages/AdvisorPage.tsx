import { useState } from 'react';
import { Send, Bot, User, Zap, Globe2 } from 'lucide-react';

export default function AdvisorPage() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello Agent! I am your Cultural Intelligence Advisor. How can I help you master your next global sales mission today?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "That's a great question about cultural nuances! When dealing with high-context cultures like Japan, remember that 'yes' often means 'I understand' rather than 'I agree'. Focus on building long-term trust (Giri) before pushing for a hard close."
            }]);
        }, 1000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
                    Cultural <span className="text-orange-500">Advisor</span>
                </h1>
                <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
                    AI-Powered Intelligence for Global Sales Mastery
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
                {/* Chat Area */}
                <div className="lg:col-span-3 flex flex-col bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] flex items-start gap-4 p-4 border-4 border-black font-bold ${msg.role === 'user'
                                        ? 'bg-orange-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                        : 'bg-white shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]'
                                    }`}>
                                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center border-2 border-black ${msg.role === 'user' ? 'bg-black text-white' : 'bg-orange-500 text-white'}`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t-8 border-black bg-gray-50 flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about cultural norms, etiquette, or specific regions..."
                            className="flex-1 h-14 px-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none"
                        />
                        <button
                            onClick={handleSend}
                            className="w-14 h-14 bg-black text-white flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="p-6 bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                        <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                            Quick Context
                        </h3>
                        <p className="text-xs font-bold text-gray-400 mb-4 italic">
                            Currently optimized for:
                        </p>
                        <ul className="space-y-3">
                            {['DACH Region', 'Nordics', 'Southeast Asia', 'Middle East'].map(region => (
                                <li key={region} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                                    <Globe2 className="w-3 h-3 text-orange-500" />
                                    {region}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-black uppercase text-sm mb-2">Pro Tip</h3>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed">
                            Upload your sales playbooks in settings to get advice tailored specifically to your company's product and cultural strategy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
