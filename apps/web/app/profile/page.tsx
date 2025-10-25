'use client';

import { useState } from 'react';
import { User, Shield, Bell, Globe, Edit, Camera } from 'lucide-react';
import { api } from '../../lib/api';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.johnson@email.com',
    phone: '876-555-0123',
    address: 'Kingston, Jamaica',
    occupation: 'Teacher',
    bio: 'Experienced pardna member looking to build financial stability',
    profilePhoto: null as string | null
  });

  const [preferences, setPreferences] = useState({
    language: 'JM',
    notifications: {
      email: true,
      sms: true,
      push: true
    },
    privacy: {
      showProfile: true,
      showStats: false
    }
  });

  const handleSaveProfile = async () => {
    try {
      await api.updateProfile('user-123', profile);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, profilePhoto: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>My Profile</h1>

      {/* Profile Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative', marginRight: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: profile.profilePhoto ? 'transparent' : '#f8f9fa',
              backgroundImage: profile.profilePhoto ? `url(${profile.profilePhoto})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #e9ecef'
            }}>
              {!profile.profilePhoto && <User size={32} style={{ color: '#666' }} />}
            </div>
            <label style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid white'
            }}>
              <Camera size={12} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
              {profile.firstName} {profile.lastName}
            </h2>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>{profile.occupation}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Shield size={16} style={{ color: '#28a745' }} />
                <span style={{ fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>SILVER Verified</span>
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Trust Score: 750</div>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            style={{
              padding: '8px 16px',
              backgroundColor: editing ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Edit size={16} />
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>

        {editing && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <button
              onClick={handleSaveProfile}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
          <Bell size={24} style={{ marginRight: '10px', color: '#007bff' }} />
          Preferences
        </h3>

        <div style={{ display: 'grid', gap: '25px' }}>
          {/* Language */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
              <Globe size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '200px' }}
            >
              <option value="JM">Jamaican Patois</option>
              <option value="EN">English</option>
            </select>
          </div>

          {/* Notifications */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
              Notifications
            </label>
            <div style={{ display: 'grid', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={preferences.notifications.email}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: e.target.checked }
                  }))}
                />
                Email notifications
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={preferences.notifications.sms}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, sms: e.target.checked }
                  }))}
                />
                SMS notifications
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={preferences.notifications.push}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: e.target.checked }
                  }))}
                />
                Push notifications
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
              Privacy Settings
            </label>
            <div style={{ display: 'grid', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={preferences.privacy.showProfile}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, showProfile: e.target.checked }
                  }))}
                />
                Show my profile to other members
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={preferences.privacy.showStats}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, showStats: e.target.checked }
                  }))}
                />
                Show my payment statistics
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Account Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>3</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Circles</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>15</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Payment Streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>750</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Trust Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>2</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Referrals</div>
          </div>
        </div>
      </div>
    </div>
  );
}