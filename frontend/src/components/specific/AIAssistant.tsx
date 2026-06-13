import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import clsx from 'clsx';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';
import MikuCanvas from './MikuCanvas';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    actionResult?: any;
}

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "SYSTEM ONLINE. I am your Attendance AI. How can I assist you today?", timestamp: new Date() }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);
    
    // Add useAuth hook
    const { logout, setSession, token } = useAuth();
    const { refreshSubjects } = useAttendance();
    const isAuthenticated = !!token;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');

        // Optimistically add user message
        const newMessages = [...messages, { role: 'user', content: userMsg, timestamp: new Date() } as Message];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Prepare history for API
            const apiHistory = newMessages.map(m => ({
                role: m.role,
                content: m.actionResult 
                    ? `${m.content}\n[SYSTEM TOOL RESULT: ${m.actionResult.message || m.actionResult.error || "Done"}]` 
                    : m.content
            }));

            const res = await api.post('/agent/chat', { messages: apiHistory });

            if (res.data.actionResult?.success) {
                // Only refresh if we are authenticated to avoid errors
                if (isAuthenticated) await refreshSubjects();
            }

            // Handle Client Actions
            if (res.data.actionResult?.clientAction === 'logout') {
                setTimeout(() => {
                    logout();
                    setIsOpen(false);
                     setMessages([{ role: 'assistant', content: "Disconnected. I am now in Visitor Mode.", timestamp: new Date() }]);
                }, 1500); 
            } else if (res.data.actionResult?.clientAction === 'login') {
                 // PERFORM LOGIN
                 const { token, user } = res.data.actionResult.payload;
                 setSession(token, user);
                 
                 // Notify user without reloading (AuthContext handles state)
                 setTimeout(() => {
                     setMessages(prev => [...prev, { role: 'assistant', content: "ACCESS GRANTED. NEURAL LINK ESTABLISHED.", timestamp: new Date() }]);
                 }, 500);
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.reply,
                actionResult: res.data.actionResult,
                timestamp: new Date()
            }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "ERROR: CONNECTION INTERRUPTED.", timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-mono">
            {/* 3D AVATAR CANVAS */}
            <MikuCanvas />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            height: isMinimized ? 'auto' : '500px',
                            width: isMinimized ? '300px' : '380px'
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-black/80 backdrop-blur-xl border border-primary/50 rounded-2xl shadow-[0_0_30px_rgba(0,243,255,0.15)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className={`p-4 border-b border-white/10 flex justify-between items-center ${isAuthenticated ? 'bg-primary/5' : 'bg-yellow-500/5'}`}>
                            <div className="flex items-center gap-2">
                                <Bot className={`w-5 h-5 ${isAuthenticated ? 'text-primary' : 'text-yellow-500'}`} />
                                <span className={`font-bold tracking-wider text-sm ${isAuthenticated ? 'text-primary' : 'text-yellow-500'}`}>
                                    {isAuthenticated ? 'AI COMPANION' : 'GATEKEEPER AI'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="text-gray-400 hover:text-white transition-colors">
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-danger transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-grid-pattern bg-[length:20px_20px]">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={clsx("flex flex-col max-w-[85%]", msg.role === 'user' ? "self-end items-end" : "self-start items-start")}>
                                            <div className={clsx(
                                                "p-3 rounded-lg text-sm leading-relaxed border whitespace-pre-wrap",
                                                msg.role === 'user'
                                                    ? "bg-primary/10 border-primary/30 text-white rounded-br-none"
                                                    : "bg-surface border-white/10 text-gray-300 rounded-bl-none shadow-lg"
                                            )}>
                                                {msg.content}
                                            </div>
                                            {msg.actionResult && (
                                                <div className={clsx(
                                                    "mt-2 text-xs p-2 rounded border w-full font-mono flex items-center gap-2",
                                                    msg.actionResult.error ? "bg-danger/10 border-danger/30 text-danger" : 
                                                    msg.actionResult.success ? "bg-green-500/10 border-green-500/30 text-green-400" :
                                                    "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                                                )}>
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>{msg.actionResult.message || msg.actionResult.error || "COMMAND_EXECUTED"}</span>
                                                </div>
                                            )}
                                            <span className="text-[10px] text-gray-600 mt-1 uppercase">
                                                {msg.role === 'user' ? 'YOU' : 'SYSTEM'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="self-start text-xs text-primary animate-pulse flex items-center gap-2">
                                            <Bot className="w-3 h-3" />
                                            PROCESSING REQUEST...
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter command..."
                                        className="flex-1 bg-surface/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 rounded-full p-4 shadow-[0_0_20px_rgba(0,243,255,0.3)] backdrop-blur-sm group transition-all"
                >
                    <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                </motion.button>
            )}
        </div>
    );
};

export default AIAssistant;
