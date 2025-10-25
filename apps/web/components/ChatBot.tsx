'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Mic, MicOff } from 'lucide-react';
import { api } from '../lib/api';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'suggestion';
}

interface QuickReply {
  text: string;
  action: string;
}

export default function ChatBot({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: 'Wah gwaan! Mi name Keisha, yuh PardnaLink assistant. Mi can help yuh with payments, circles, and any questions yuh have! 😊',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickReplies: QuickReply[] = [
    { text: 'Check my payments', action: 'payments' },
    { text: 'Find circles to join', action: 'circles' },
    { text: 'Help with payment', action: 'payment_help' },
    { text: 'Trust score info', action: 'trust_score' }
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.sendWhatsAppMessage(userId, messageText);
      
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: getAIResponse(messageText),
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('payment') || input.includes('pay')) {
      return 'Mi can help yuh with payments! Yuh can pay through mobile money (Digicel/Flow), bank transfer, or card. Want mi show yuh how fi set up auto-pay so yuh never miss a payment? 💰';
    }
    
    if (input.includes('circle') || input.includes('join')) {
      return 'Looking fi join a circle? Perfect! Mi recommend start with smaller amounts fi build yuh trust score. Check yuh current circles in "My Dashboard" or browse new ones in "Join Circle". What amount yuh comfortable with? 🤝';
    }
    
    if (input.includes('trust score') || input.includes('score')) {
      return 'Yuh trust score is super important! Right now yuh can boost it by: completing yuh profile (+25 points), making on-time payments (+20 each), and referring friends (+50 each). Check di Rewards section fi see all ways fi improve! 📈';
    }
    
    if (input.includes('help') || input.includes('problem')) {
      return 'No worries, mi here fi help! Tell mi exactly what happening and mi will guide yuh step by step. Whether it\'s payments, circles, or account issues - mi got yuh covered! 💪';
    }
    
    if (input.includes('dispute') || input.includes('issue')) {
      return 'If yuh having issues with a circle member or admin, mi can help resolve it fairly. Go to Support section fi report di issue, and our AI will analyze and suggest fair solutions. Most disputes get resolved in 24-48 hours! ⚖️';
    }
    
    return 'Mi understand! Let mi know if yuh need help with payments, joining circles, improving yuh trust score, or anything else. Mi always here fi chat and help yuh succeed with PardnaLink! 😊';
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-JM';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognition.start();
    } else {
      alert('Voice recognition not supported in this browser');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'pulse 2s infinite'
        }}
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        backgroundColor: '#25D366',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px'
          }}>
            👩🏾💼
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Keisha</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {isTyping ? 'typing...' : 'Online • PardnaLink Assistant'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#f0f0f0'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              marginBottom: '10px'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 12px',
                borderRadius: '18px',
                backgroundColor: message.isUser ? '#DCF8C6' : 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontSize: '14px', lineHeight: '1.4', color: '#2c3e50' }}>
                {message.text}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
            <div style={{
              padding: '10px 12px',
              borderRadius: '18px',
              backgroundColor: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ccc', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ccc', animation: 'pulse 1.5s infinite 0.5s' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ccc', animation: 'pulse 1.5s infinite 1s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {!isTyping && messages.length <= 2 && (
        <div style={{ padding: '10px 15px', backgroundColor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Quick actions:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => sendMessage(reply.text)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#2c3e50'
                }}
              >
                {reply.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '15px',
        backgroundColor: 'white',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            outline: 'none',
            fontSize: '14px'
          }}
        />
        <button
          onClick={startVoiceRecognition}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: isListening ? '#dc3545' : '#f8f9fa',
            color: isListening ? 'white' : '#666',
            border: '1px solid #ddd',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        <button
          onClick={() => sendMessage()}
          disabled={!inputText.trim() || isTyping}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: inputText.trim() ? '#25D366' : '#ccc',
            color: 'white',
            border: 'none',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}