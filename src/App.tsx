/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import JobExplorer from './components/JobExplorer';
import DocumentHub from './components/DocumentHub';
import Applications from './components/Applications';
import Settings from './components/Settings';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { userProfileService, UserProfile } from './services/dataService';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = React.useState('/');
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [checkingProfile, setCheckingProfile] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setCheckingProfile(false), 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = userProfileService.subscribeToProfile(user.uid, (p) => {
      setProfile(p);
      setCheckingProfile(false);
    });

    return unsubscribe;
  }, [user]);

  React.useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Dashboard | JobAI Japan',
      '/jobs': 'Job Explorer | JobAI Japan',
      '/documents': 'Document Hub | JobAI Japan',
      '/applications': 'Track Applications | JobAI Japan',
      '/settings': 'Account Settings | JobAI Japan'
    };
    document.title = titles[currentView] || 'JobAI Japan';
  }, [currentView]);

  if (loading || (user && checkingProfile)) {
    return (
      <div className="h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Profile completeness check
  const isProfileIncomplete = !profile?.title || (profile.skills?.length || 0) === 0;

  if (isProfileIncomplete) {
    return <Onboarding onComplete={() => setCurrentView('/')} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case '/':
        return <Dashboard />;
      case '/jobs':
        return <JobExplorer />;
      case '/documents':
        return <DocumentHub />;
      case '/applications':
        return <Applications />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activePath={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

