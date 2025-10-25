'use client';

import { useState } from 'react';
import { MessageCircle, X, Zap, Target, Trophy } from 'lucide-react';

interface KeishaAssistantProps {
  context?: 'rewards' | 'dashboard' | 'join' | 'create' | 'general';
  userStats?: {
    trustScore: number;
    currentTier: string;
    nextTierScore: number;
  };
}

export default function KeishaAssistant({ context = 'general', userStats }: KeishaAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);

  const getContextualMessage = () => {
    switch (context) {
      case 'rewards':
        if (userStats) {
          const pointsNeeded = userStats.nextTierScore - userStats.trustScore;
          return `Wah gwaan! Mi see yuh trust score at ${userStats.trustScore}. Yuh need ${pointsNeeded} more points fi reach ${userStats.currentTier === 'SILVER' ? 'GOLD' : 'PLATINUM'} tier! Complete yuh profile first - dat's a quick 25 points right deh so! 🚀`;
        }
        return "Hey there! Ready fi boost yuh trust score? Mi can guide yuh through di best actions fi take. Start with di easy ones dem first! 💪";
      
      case 'join':
        return "Joining a pardna circle? Dat's a smart move! Mi here fi help yuh through di process. Make sure yuh KYC verification ready - dat's crucial fi SILVER level access! 🤝";
      
      case 'create':
        return "Creating yuh own circle? Respect! Dat's some serious leadership ting. Mi can help yuh set it up properly fi attract di right members. 👑";
      
      default:
        return "Wah gwaan! Mi name Keisha, yuh personal PardnaLink assistant. How mi can help yuh today with yuh financial journey? 😊";
    }
  };

  const getQuickActions = () => {
    switch (context) {
      case 'rewards':
        return [
          { text: "Show me quick wins", action: "quick-wins" },
          { text: "How to reach next tier?", action: "next-tier" },
          { text: "Explain trust score", action: "trust-score" }
        ];
      
      case 'join':
        return [
          { text: "KYC requirements", action: "kyc-help" },
          { text: "Circle selection tips", action: "circle-tips" },
          { text: "Payment schedule help", action: "payment-help" }
        ];
      
      default:
        return [
          { text: "Check my progress", action: "progress" },
          { text: "Find circles to join", action: "find-circles" },
          { text: "Improve trust score", action: "improve-score" }
        ];
    }
  };

  const handleQuickAction = (action: string) => {
    const responses = {
      "quick-wins": "Perfect! Here's di easiest ways fi boost yuh score: 1) Complete yuh profile (+25 points), 2) Verify phone (+15 points), 3) Set up auto-payments (+50 points). Start with profile - only take 10 minutes! 🎯",
      "next-tier": "Fi reach GOLD tier, yuh need 750 trust score, 3 completed circles, 30-day payment streak, and 3 referrals. Focus on completing actions first, den work on yuh payment streak! 📈",
      "trust-score": "Yuh trust score show how reliable yuh are as a pardna member. Higher score = better circle access and lower interest rates. It based on payments, KYC level, and community participation! 💯",
      "kyc-help": "Fi SILVER level KYC, yuh need valid TRN and National ID. Make sure di info match exactly with yuh bank details. Process usually take 24-48 hours fi approve! 🛡️",
      "circle-tips": "Look fi circles with: good admin ratings, clear payment schedules, members with similar trust scores, and reasonable amounts fi yuh budget. Don't rush - choose wisely! 🎯",
      "payment-help": "Set up auto-payments fi never miss a date! Pay 1-2 days early fi bonus points. If yuh ever have trouble, contact admin immediately - communication is key! ⏰"
    };
    
    const response = responses[action as keyof typeof responses] || "Mi here fi help with whatever yuh need! Ask mi anything about PardnaLink! 😊";
    setMessages(prev => [...prev, { text: response, isUser: false }]);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '15px',
            backgroundColor: '#007bff',
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
                👩🏾‍💼
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Keisha</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Your PardnaLink Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
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
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {getContextualMessage()}
            </div>

            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: message.isUser ? '#007bff' : 'white',
                  color: message.isUser ? 'white' : '#2c3e50',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  alignSelf: message.isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {message.text}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #e9ecef',
            backgroundColor: 'white'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Quick Actions:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getQuickActions().map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}