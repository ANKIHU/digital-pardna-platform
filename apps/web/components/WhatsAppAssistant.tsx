'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Phone, X } from 'lucide-react';
import { api } from '../lib/api';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function WhatsAppAssistant({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([{
        id: '1',
        text: 'Wah gwaan! Mi name Keisha, yuh PardnaLink assistant. How mi can help yuh today? 😊',
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.sendWhatsAppMessage(userId, inputText);
      
      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      // Add AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: getAIResponse(inputText),
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
      setIsTyping(false);
    }
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('payment') || input.includes('pay')) {
      return 'Mi see yuh asking bout payments! Yuh can pay through di app using mobile money, bank transfer, or cash deposit. Want mi show yuh how fi set up auto-pay? Dat way yuh never miss a payment! 💰';
    }
    
    if (input.includes('circle') || input.includes('join')) {
      return 'Looking fi join a circle? Great choice! Mi recommend start with a smaller amount fi build yuh trust score first. Check out di "Join Circle" section - mi can help yuh find one dat match yuh budget and timeline! 🤝';
    }
    
    if (input.includes('help') || input.includes('problem')) {
      return 'No worries, mi here fi help! Tell mi exactly what happening and mi will guide yuh through it step by step. Whether it\'s payments, circles, or account issues - mi got yuh back! 💪';
    }
    
    if (input.includes('trust score') || input.includes('score')) {
      return 'Yuh trust score important fi get better circle access! Right now yuh can improve it by: completing yuh profile, making on-time payments, and referring friends. Check di Rewards section fi see all di ways fi boost it! 📈';
    }
    
    return 'Mi understand yuh concern! Let mi connect yuh with di right information. Yuh can also call our support line at 1-876-XXX-XXXX if yuh need immediate help. Mi always here fi chat though! 😊';
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
          zIndex: 1000
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
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Keisha Assistant</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {isTyping ? 'typing...' : 'Online'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Phone size={20} style={{ cursor: 'pointer' }} />
          <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#f0f0f0',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23e0e0e0" fill-opacity="0.1"%3E%3Cpath d="M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
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
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '14px', lineHeight: '1.4', color: '#2c3e50' }}>
                {message.text}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                marginTop: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {message.isUser && message.status && (
                  <span style={{ marginLeft: '5px' }}>
                    {message.status === 'sending' && '🕐'}
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'read' && '💙'}
                  </span>
                )}
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
          onClick={sendMessage}
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