import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { chatService } from '../../services/chatService';

export function CopilotChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your research assistant. Ask me about molecules or tasks.", sender: 'agent' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await chatService.sendMessage(userMsg.text);
            const agentMsg = {
                id: Date.now() + 1,
                text: response.message,
                sender: 'agent',
                sources: response.sources
            };
            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I encountered an error.", sender: 'agent' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {isOpen && (
                <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-80 sm:w-96 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200" style={{ height: '500px' }}>
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot className="text-blue-400" size={20} />
                            <h3 className="font-semibold text-white">Research Copilot</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-slate-100">
                                            <p className="text-xs font-semibold text-slate-400 mb-1">Sources:</p>
                                            <ul className="space-y-1">
                                                {msg.sources.map((s, idx) => (
                                                    <li key={idx} className="text-xs text-blue-500 truncate">• {s.title}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask a question..."
                                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
