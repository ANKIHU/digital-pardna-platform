'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Target, Clock, Users, Shield, Zap, Award } from 'lucide-react';
import { api } from '../lib/api';
import KeishaAssistant from './KeishaAssistant';

interface UserStats {
  trustScore: number;
  currentTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  circlesCompleted: number;
  paymentStreak: number;
  referrals: number;
  nextTierScore: number;
}

interface ScoreImprovementAction {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: string;
  category: 'Verification' | 'Participation' | 'Reliability' | 'Community' | 'Financial';
  completed: boolean;
  available: boolean;
}

interface TierRequirement {
  tier: string;
  trustScore: number;
  circlesCompleted: number;
  paymentStreak: number;
  referrals: number;
  benefits: string[];
}

export default function EnhancedRewardsDashboard() {
  const [userStats, setUserStats] = useState<UserStats>({
    trustScore: 650,
    currentTier: 'SILVER',
    circlesCompleted: 2,
    paymentStreak: 15,
    referrals: 1,
    nextTierScore: 750
  });

  const [actions, setActions] = useState<ScoreImprovementAction[]>([
    {
      id: 'complete-profile',
      title: 'Complete Profile',
      description: 'Add photo, bio, employment details',
      points: 25,
      difficulty: 'Easy',
      timeEstimate: '10 minutes',
      category: 'Verification',
      completed: false,
      available: true
    },
    {
      id: 'verify-phone',
      title: 'Verify Phone Number',
      description: 'SMS verification for security',
      points: 15,
      difficulty: 'Easy',
      timeEstimate: '5 minutes',
      category: 'Verification',
      completed: true,
      available: true
    },
    {
      id: 'financial-literacy',
      title: 'Financial Literacy Course',
      description: 'Complete educational content',
      points: 100,
      difficulty: 'Medium',
      timeEstimate: '2 hours',
      category: 'Financial',
      completed: false,
      available: true
    },
    {
      id: 'auto-payments',
      title: 'Set Up Auto-Payments',
      description: 'Enable payment automation',
      points: 50,
      difficulty: 'Easy',
      timeEstimate: '15 minutes',
      category: 'Reliability',
      completed: false,
      available: true
    },
    {
      id: 'create-circle',
      title: 'Create Own Circle',
      description: 'Become a circle admin',
      points: 200,
      difficulty: 'Hard',
      timeEstimate: '1 hour setup',
      category: 'Community',
      completed: false,
      available: userStats.currentTier === 'GOLD' || userStats.currentTier === 'PLATINUM'
    }
  ]);

  const nextTier: TierRequirement = {
    tier: 'GOLD',
    trustScore: 750,
    circlesCompleted: 3,
    paymentStreak: 30,
    referrals: 3,
    benefits: ['Higher circle limits (JMD $50,000)', 'Priority positions', 'Exclusive rewards', 'Instant KYC']
  };

  const handleCompleteAction = async (actionId: string) => {
    try {
      await api.completeAction('user-123', actionId);
      setActions(prev => prev.map(action => 
        action.id === actionId ? { ...action, completed: true } : action
      ));
      setUserStats(prev => ({
        ...prev,
        trustScore: prev.trustScore + (actions.find(a => a.id === actionId)?.points || 0)
      }));
    } catch (error) {
      console.error('Failed to complete action:', error);
    }
  };

  const getProgressPercentage = () => {
    const currentTierScore = userStats.currentTier === 'BRONZE' ? 500 : 
                            userStats.currentTier === 'SILVER' ? 650 : 750;
    return ((userStats.trustScore - currentTierScore) / (nextTier.trustScore - currentTierScore)) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#28a745';
      case 'Medium': return '#ffc107';
      case 'Hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Verification': return <Shield size={16} />;
      case 'Participation': return <Users size={16} />;
      case 'Reliability': return <Clock size={16} />;
      case 'Community': return <Users size={16} />;
      case 'Financial': return <Target size={16} />;
      default: return <Star size={16} />;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <Trophy size={32} style={{ color: '#007bff', marginRight: '15px' }} />
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>Enhanced Rewards Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Active Score Improvement System</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* Current Status */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
            <Award size={24} style={{ marginRight: '10px', color: '#007bff' }} />
            Current Status
          </h3>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>
              {userStats.trustScore}
            </div>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              {userStats.currentTier} TIER
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
              <div>
                <div style={{ color: '#666' }}>Circles</div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{userStats.circlesCompleted}</div>
              </div>
              <div>
                <div style={{ color: '#666' }}>Streak</div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{userStats.paymentStreak} days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Tier Progress */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
            <Target size={24} style={{ marginRight: '10px', color: '#28a745' }} />
            Next Tier: {nextTier.tier}
          </h3>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Progress</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' }}>
                {userStats.trustScore}/{nextTier.trustScore}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.min(getProgressPercentage(), 100)}%`, 
                  height: '100%', 
                  backgroundColor: '#28a745',
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <div>✓ Trust Score: {userStats.trustScore}/{nextTier.trustScore}</div>
            <div>✓ Circles: {userStats.circlesCompleted}/{nextTier.circlesCompleted}</div>
            <div>• Payment Streak: {userStats.paymentStreak}/{nextTier.paymentStreak} days</div>
            <div>• Referrals: {userStats.referrals}/{nextTier.referrals}</div>
          </div>
        </div>
      </div>

      {/* Improvement Actions */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
          <Zap size={24} style={{ marginRight: '10px', color: '#ffc107' }} />
          Score Improvement Actions
        </h3>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          {actions.map((action) => (
            <div
              key={action.id}
              style={{
                padding: '20px',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: action.completed ? '#f8f9fa' : 'white',
                opacity: action.available ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    {getCategoryIcon(action.category)}
                    <h4 style={{ margin: '0 0 0 8px', color: '#2c3e50' }}>{action.title}</h4>
                    {action.completed && <Star size={16} style={{ marginLeft: '8px', color: '#ffc107' }} />}
                  </div>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{action.description}</p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
                    <span style={{ color: '#007bff', fontWeight: 'bold' }}>+{action.points} points</span>
                    <span style={{ color: getDifficultyColor(action.difficulty) }}>{action.difficulty}</span>
                    <span style={{ color: '#666' }}>{action.timeEstimate}</span>
                  </div>
                </div>
                <div>
                  {action.completed ? (
                    <div style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#d4edda', 
                      color: '#155724', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓ COMPLETED
                    </div>
                  ) : action.available ? (
                    <button
                      onClick={() => handleCompleteAction(action.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      START
                    </button>
                  ) : (
                    <div style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#f8f9fa', 
                      color: '#6c757d', 
                      borderRadius: '20px', 
                      fontSize: '12px'
                    }}>
                      LOCKED
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Benefits */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>🏆 {nextTier.tier} Tier Benefits</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {nextTier.benefits.map((benefit, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <Star size={16} style={{ color: '#ffc107', marginRight: '10px' }} />
              <span style={{ color: '#2c3e50' }}>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
      
      <KeishaAssistant 
        context="rewards" 
        userStats={{
          trustScore: userStats.trustScore,
          currentTier: userStats.currentTier,
          nextTierScore: userStats.nextTierScore
        }} 
      />
    </div>
  );
}