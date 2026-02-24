import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Send, Paperclip, Sparkles, StopCircle, Bot } from 'lucide-react';
import { ChatMessage } from '../components/chat/ChatMessage';
import { chatService } from '../services/chatService';

export function ChatPage() {
    const { moleculeId } = useParams();
    const [searchParams] = useSearchParams();
    const docId = searchParams.get('doc_id');
    const docTitle = searchParams.get('title');

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        loadHistory();
    }, [moleculeId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const loadHistory = async () => {
        const history = await chatService.getHistory(moleculeId || 'general');
        setMessages(history);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const context = {
                molecule_id: moleculeId,
                document_id: docId
            };
            const response = await chatService.sendMessage(userMsg.content, context);
            const fullContent = response.content;

            // Placeholder for "Start streaming"
            const assistantMsgId = Date.now() + 1;
            setMessages(prev => [...prev, { ...response, id: assistantMsgId, content: '' }]);

            let currentText = '';
            const words = fullContent.split(' ');

            // quick and dirty stream simulation
            for (let i = 0; i < words.length; i++) {
                currentText += (i === 0 ? '' : ' ') + words[i];
                // Update the last message
                setMessages(prev => {
                    const newArr = [...prev];
                    const last = newArr[newArr.length - 1];
                    if (last.id === assistantMsgId) {
                        last.content = currentText;
                    }
                    return newArr;
                });
                await new Promise(r => setTimeout(r, 50)); // Typing speed
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsTyping(false);
        }
    };

    const suggestions = [
        "Summarize safety signals",
        "Find similar competitor trials",
        "Draft a patent claim"
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 -m-8 md:-m-0 rounded-xl overflow-hidden shadow-sm border border-slate-200">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center">
                        <Sparkles className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            Collective Knowledge Base
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-medium text-slate-500 border border-slate-200 uppercase tracking-wide">Beta</span>
                        </h2>
                        <p className="text-xs text-slate-500">
                            {docTitle ? (
                                <span>Active Context: <strong>{docTitle}</strong></span>
                            ) : moleculeId ? (
                                <span>Active Context: <strong>{moleculeId}</strong></span>
                            ) : (
                                "Retrieving insights from all ingested documents and databases"
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-100 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-[pulse_3s_ease-in-out_infinite]"></span>
                    System Active
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-4 mb-6">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce inline-block mr-1"></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce inline-block mr-1 delay-75"></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce inline-block delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-slate-200">
                {/* Suggestions */}
                {messages.length < 3 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(s)}
                                className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-sm rounded-full border border-slate-200 transition-colors flex items-center gap-1.5"
                            >
                                <Sparkles size={14} />
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSend} className="relative">
                    <button type="button" className="absolute left-3 top-3 text-slate-400 hover:text-slate-600">
                        <Paperclip size={20} />
                    </button>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        placeholder="Ask anything about the molecules, tasks, or evidence..."
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-[50px] min-h-[50px] max-h-[150px]"
                        style={{ height: '50px' }} // TODO: auto-grow logic
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="text-center mt-2 text-[10px] text-slate-400">
                    AI can make mistakes. Review generated insights.
                </div>
            </div>
        </div>
    );
}
