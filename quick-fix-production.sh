#!/bin/bash

# Direct SSH commands to fix production server
ssh -o StrictHostKeyChecking=no ec2-user@pardnalink.com << 'EOF'
cd /home/ec2-user/digital-pardna-platform

# Update main page with comprehensive platform
cat > app/page.tsx << 'PAGEOF'
'use client';
import Navigation from '../components/Navigation';
import CustomerDashboard from '../components/CustomerDashboard';
import KeishaAssistant from '../components/KeishaAssistant';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <CustomerDashboard userId="user123" />
      <KeishaAssistant />
    </div>
  );
}
PAGEOF

# Restart the application
pm2 restart all || (pkill -f "next" && nohup npm run dev > /dev/null 2>&1 &)

echo "✅ Production server updated with comprehensive platform"
EOF