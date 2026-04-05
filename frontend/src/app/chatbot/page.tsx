"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Send, Bot, User, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hi there! I'm your AI Career Assistant. How can I help you today? You can ask me about resume tips, interview prep, or salary negotiation.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: getMockResponse(newUserMsg.text),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const getMockResponse = (input: string) => {
    const lower = input.toLowerCase();
    if (lower.includes("resume")) return "A great resume is concise and impactful. Make sure to use bullet points, start with strong action verbs (like 'Developed', 'Managed'), and quantify your achievements (e.g., 'increased sales by 15%'). Should we review yours?";
    if (lower.includes("interview")) return "For interviews, I highly recommend the STAR method (Situation, Task, Action, Result) for behavioral questions. Let me know if you want to do a mock interview simulation!";
    if (lower.includes("salary")) return "When negotiating salary, always research the market rate for your role and location first. Never give the first number if you can avoid it. Instead say: 'I'm open to discussing compensation once we determine if I'm the right fit.'";
    return "That's an interesting question. While I'm just a demo AI right now, a real version of me would connect to the backend to provide a fully tailored answer based on your specific career profile!";
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Career Assistant</h1>
        <p className="text-sm text-slate-500">Powered by AI</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-md">
        {/* Chat Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.sender === "user" ? "bg-slate-200 dark:bg-slate-700 ml-2" : "bg-blue-100 dark:bg-blue-900 mr-2"
                  }`}>
                    {msg.sender === "user" ? <User className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="flex items-end">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 mr-2 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700 w-16">
                  <div className="flex space-x-1 items-center h-5">
                    <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="relative flex items-center">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything..." 
              className="pr-12 py-6 rounded-full border-slate-300 dark:border-slate-700 focus-visible:ring-blue-500 shadow-sm"
            />
            <Button 
              size="icon" 
              className="absolute right-1.5 h-10 w-10 rounded-full"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400 flex items-center justify-center">
              Press Enter <CornerDownLeft className="w-3 h-3 mx-1" /> to send
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
