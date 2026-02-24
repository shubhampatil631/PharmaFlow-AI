import React from 'react';
import { clsx } from 'clsx';
import { Bot, User, FileText, Link as LinkIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming standard markdown usage or simple text

export function ChatMessage({ message, isTyping }) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{message.content}</span>
            </div>
        );
    }

    return (
        <div className={clsx("flex gap-4 mb-6", isUser ? "flex-row-reverse" : "flex-row")}>
            <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                isUser ? "bg-slate-900 text-white" : "bg-blue-100 text-blue-600"
            )}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={clsx(
                "max-w-[80%] rounded-2xl p-4 shadow-sm",
                isUser
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
            )}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    {/* Basic text rendering for now, can be upgraded to Markdown */}
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    {isTyping && <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1 align-middle" />}
                </div>

                {/* Citations / Attachments */}
                {!isUser && message.citations && message.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">References</p>
                        <div className="flex flex-wrap gap-2">
                            {message.citations.map(cit => (
                                <a
                                    key={cit.id}
                                    href={cit.url}
                                    className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs text-blue-600 transition-colors"
                                >
                                    <LinkIcon size={12} />
                                    {cit.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
