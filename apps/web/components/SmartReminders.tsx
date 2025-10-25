'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, Settings, Check } from 'lucide-react';
import { api } from '../lib/api';

interface Reminder {
  id: string;
  message: string;
  scheduledFor: string;
  type: 'PAYMENT' | 'CIRCLE_UPDATE' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  read: boolean;
}

interface ReminderPreferences {
  enableSMS: boolean;
  enableEmail: boolean;
  enablePush: boolean;
  reminderTime: string;
  language: 'EN' | 'JM';
}

export default function SmartReminders({ userId }: { userId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    enableSMS: true,
    enableEmail: false,
    enablePush: true,
    reminderTime: '15:00',
    language: 'JM'
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    try {
      const data = await api.getSmartReminders(userId);
      setReminders(data.reminders || []);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const markAsRead = (reminderId: string) => {
    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, read: true } : r
    ));
  };

  const updatePreferences = async () => {
    try {
      await api.updateReminderPreferences(userId, preferences);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#dc3545';
      case 'MEDIUM': return '#ffc107';
      default: return '#28a745';
    }
  };

  const mockReminders: Reminder[] = [
    {
      id: '1',
      message: 'Mi remind yuh fi pay yuh $5,000 tomorrow at 3pm fi di Kingston Circle',
      scheduledFor: '2024-01-15T15:00:00Z',
      type: 'PAYMENT',
      priority: 'HIGH',
      read: false
    },
    {
      id: '2', 
      message: 'Yuh circle draw coming up next week! Make sure yuh payments up to date',
      scheduledFor: '2024-01-16T10:00:00Z',
      type: 'CIRCLE_UPDATE',
      priority: 'MEDIUM',
      read: false
    },
    {
      id: '3',
      message: 'Great job! Yuh payment streak now at 15 days. Keep it up!',
      scheduledFor: '2024-01-14T12:00:00Z',
      type: 'GENERAL',
      priority: 'LOW',
      read: true
    }
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
          <Bell size={24} style={{ marginRight: '10px', color: '#007bff' }} />
          Smart Reminders
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      {showSettings && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Reminder Preferences</h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notification Methods:</label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={preferences.enableSMS}
                    onChange={(e) => setPreferences(prev => ({ ...prev, enableSMS: e.target.checked }))}
                  />
                  SMS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={preferences.enableEmail}
                    onChange={(e) => setPreferences(prev => ({ ...prev, enableEmail: e.target.checked }))}
                  />
                  Email
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={preferences.enablePush}
                    onChange={(e) => setPreferences(prev => ({ ...prev, enablePush: e.target.checked }))}
                  />
                  Push
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Preferred Time:</label>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={(e) => setPreferences(prev => ({ ...prev, reminderTime: e.target.value }))}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Language:</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as 'EN' | 'JM' }))}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="JM">Jamaican Patois</option>
                <option value="EN">English</option>
              </select>
            </div>

            <button
              onClick={updatePreferences}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {mockReminders.map((reminder) => (
          <div
            key={reminder.id}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: `3px solid ${reminder.read ? '#e9ecef' : getPriorityColor(reminder.priority)}`,
              opacity: reminder.read ? 0.7 : 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <Clock size={16} style={{ marginRight: '8px', color: '#666' }} />
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {new Date(reminder.scheduledFor).toLocaleString()}
                  </span>
                  <span
                    style={{
                      marginLeft: '10px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: getPriorityColor(reminder.priority),
                      color: 'white'
                    }}
                  >
                    {reminder.priority}
                  </span>
                </div>
                <p style={{ margin: '0 0 10px 0', color: '#2c3e50', lineHeight: '1.5' }}>
                  {reminder.message}
                </p>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Type: {reminder.type.replace('_', ' ')}
                </div>
              </div>
              
              {!reminder.read && (
                <button
                  onClick={() => markAsRead(reminder.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Check size={14} />
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {mockReminders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <Bell size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
          <p>No reminders at this time. We'll notify you when something needs your attention!</p>
        </div>
      )}
    </div>
  );
}