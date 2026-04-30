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
import { AuthProvider, useAuth } from './lib/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = React.useState('/');

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

  if (loading) {
    return (
      <div className="h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
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

