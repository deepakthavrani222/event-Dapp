'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageCircle, X, Send, Loader2, HelpCircle, Key, Wallet, 
  AlertTriangle, ChevronDown, Bot, User, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'agent';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

// Common support topics with auto-responses
const SUPPORT_TOPICS = [
  {
    id: 'wallet-recovery',
    label: '🔑 Lost wallet access',
    icon: Key,
    response: `I can help you recover your wallet access!\n\n**Recovery Options:**\n1. **Email Recovery**: We'll send a secure link to your registered email\n2. **Phone Verification**: Verify via OTP to your registered phone\n3. **Identity Verification**: Upload ID for manual recovery (24-48 hours)\n\nWhich option would you prefer?`,
    quickReplies: ['Email Recovery', 'Phone Verification', 'Identity Verification', 'Talk to Agent'],
  },
  {
    id: 'refund',
    label: '💰 Refund request',
    icon: Wallet,
    response: `I understand you need help with a refund.\n\n**Refund Policy:**\n• Event cancelled by organizer: 97% automatic refund\n• Event postponed: Full refund or transfer to new date\n• Buyer request: Subject to organizer's policy\n\nPlease provide your ticket ID or order number, and I'll check the status.`,
    quickReplies: ['Check refund status', 'Request refund', 'Talk to Agent'],
  },
  {
    id: 'ticket-issue',
    label: '🎫 Ticket not showing',
    icon: AlertTriangle,
    response: `Let me help you find your ticket!\n\n**Quick Fixes:**\n1. Check your email (including spam) for confirmation\n2. Make sure you're logged in with the same account\n3. Try refreshing the "My Tickets" page\n\nIf still not visible, I can look up your purchase. What's your email or order ID?`,
    quickReplies: ['Check by email', 'Check by order ID', 'Talk to Agent'],
  },
  {
    id: 'security',
    label: '🔒 Security concern',
    icon: AlertTriangle,
    response: `Your security is our top priority!\n\n**Immediate Actions:**\n• If you suspect unauthorized access, we can lock your account immediately\n• Enable 2FA for extra protection\n• Review recent activity in Settings\n\nWhat specific concern do you have?`,
    quickReplies: ['Lock my account', 'Enable 2FA', 'Review activity', 'Report suspicious activity'],
  },
  {
    id: 'other',
    label: '❓ Other question',
    icon: HelpCircle,
    response: `I'm here to help! Please describe your issue and I'll do my best to assist.\n\nOr you can:\n• Browse our Help Center\n• Email us at support@ticketchain.com\n• Request a callback from our team`,
    quickReplies: ['Help Center', 'Email Support', 'Request Callback'],
  },
];

export function SupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        content: `Hi${user?.name ? ` ${user.name}` : ''}! 👋 I'm your TicketChain assistant, available 24/7.\n\nHow can I help you today?`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, user]);

  const handleTopicSelect = (topic: typeof SUPPORT_TOPICS[0]) => {
    setShowTopics(false);
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: topic.label,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: topic.response,
        timestamp: new Date(),
        quickReplies: topic.quickReplies,
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: reply,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let response = '';
      
      if (reply === 'Talk to Agent' || reply === 'Request Callback') {
        response = `I'm connecting you with a live agent. Average wait time: ~2 minutes.\n\nIn the meantime, you can also:\n• Email: support@ticketchain.com\n• Call: 1800-XXX-XXXX (toll-free)`;
      } else if (reply === 'Email Recovery') {
        response = `Great! I'll send a recovery link to your registered email.\n\n✅ Recovery email sent!\n\nPlease check your inbox (and spam folder) for a link from noreply@ticketchain.com. The link expires in 30 minutes.`;
      } else if (reply === 'Enable 2FA') {
        response = `To enable Two-Factor Authentication:\n\n1. Go to Settings → Security\n2. Click "Enable 2FA"\n3. Scan QR code with Google Authenticator or Authy\n4. Enter the 6-digit code to confirm\n\nWould you like me to guide you through it?`;
      } else if (reply === 'Lock my account') {
        response = `⚠️ Account Lock Request\n\nI can lock your account immediately. This will:\n• Log out all sessions\n• Block all transactions\n• Require identity verification to unlock\n\nAre you sure you want to proceed?`;
      } else {
        response = `Thanks for that information! Let me look into this for you.\n\nA support agent will review your case and respond within 24 hours. You'll receive updates via email.\n\nIs there anything else I can help with?`;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        quickReplies: reply === 'Lock my account' ? ['Yes, lock my account', 'No, cancel'] : ['Yes, another question', 'No, thanks!'],
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setShowTopics(false);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `Thanks for your message! I've noted your concern.\n\nA support agent will review this and respond within 24 hours. For urgent issues, please call our 24/7 helpline: 1800-XXX-XXXX`,
        timestamp: new Date(),
        quickReplies: ['Talk to Agent', 'I can wait'],
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all ${
          isOpen ? 'scale-0' : 'scale-100'
        } bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-purple-500/30`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="border-white/20 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <CardHeader className="p-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-sm">TicketChain Support</CardTitle>
                      <p className="text-xs text-green-400">Online • 24/7</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0">
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-2' : ''}`}>
                        {msg.type !== 'user' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="h-4 w-4 text-purple-400" />
                            <span className="text-xs text-gray-400">Support Bot</span>
                          </div>
                        )}
                        <div className={`p-3 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/10 text-gray-200'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{msg.content}</p>
                        </div>
                        {msg.quickReplies && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.quickReplies.map((reply, i) => (
                              <button
                                key={i}
                                onClick={() => handleQuickReply(reply)}
                                className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Topic Selection */}
                  {showTopics && messages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400">Select a topic:</p>
                      {SUPPORT_TOPICS.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicSelect(topic)}
                          className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm text-white transition-colors flex items-center gap-3"
                        >
                          <topic.icon className="h-4 w-4 text-purple-400" />
                          {topic.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-purple-400" />
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Button onClick={handleSendMessage} className="gradient-purple-cyan border-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    24/7 Support • <a href="mailto:support@ticketchain.com" className="text-purple-400 hover:underline">support@ticketchain.com</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
