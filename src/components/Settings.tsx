import React from 'react';
import { User, Mail, Upload, Languages, Shield, Bell, LogOut, Trash2, CheckCircle } from 'lucide-react';
import { JLPT_LEVELS } from '../constants';
import { useAuth } from '../lib/AuthContext';
import { userProfileService, UserProfile, notificationService, Notification } from '../services/dataService';
import { cn } from '../lib/utils';

export default function Settings() {
  const { user, logout, resetPassword } = useAuth();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Personal Info');

  React.useEffect(() => {
    if (!user) return;
    
    // Subscribe to profile
    const unsubProfile = userProfileService.subscribeToProfile(user.uid, (p) => {
      if (p) {
        setProfile(p);
        setLoading(false);
      }
    });

    // Subscribe to notifications
    const unsubNotifs = notificationService.subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });

    return () => {
      unsubProfile();
      unsubNotifs();
    };
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      await userProfileService.updateProfile(user.uid, {
        name: profile.name,
        jlptLevel: profile.jlptLevel || 'None',
        skills: profile.skills || [],
        photoURL: profile.photoURL || ''
      });

      await notificationService.createNotification({
        userId: user.uid,
        title: 'Profile Updated',
        message: 'Your career profile and JLPT metrics have been synchronized.',
        type: 'system'
      });

      alert('Profile successfully updated.');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = () => {
    const url = prompt('Please enter an image URL for your profile picture:', profile?.photoURL || '');
    if (url !== null && profile) {
      setProfile({ ...profile, photoURL: url });
    }
  };

  const markNotifRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  const deleteNotif = async (id: string) => {
    await notificationService.deleteNotification(id);
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      await resetPassword(user.email);
      alert(`A password reset email has been sent to ${user.email}`);
    } catch (error) {
      alert(`Failed to send reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Account Settings</h2>
          <p className="text-slate-500 mt-2 font-medium">Manage your profile, preferences, and AI training data.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Navigation Rail */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 shadow-xl">
             <div className="space-y-1">
              {[
                { label: 'Personal Info', icon: User },
                { label: 'JLPT & Skills', icon: Languages },
                { label: 'Notifications', icon: Bell },
                { label: 'Security', icon: Shield },
              ].map(item => (
                <button 
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === item.label ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-600 to-indigo-800" />
            <div className="relative pt-12">
              <div className="relative inline-block group mx-auto">
                <div className="w-24 h-24 rounded-3xl bg-slate-900 border-4 border-slate-800 flex items-center justify-center font-black text-3xl text-indigo-500 shadow-2xl overflow-hidden">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    profile?.name?.split(' ').map(n => n[0]).join('') || 'U'
                  )}
                </div>
                <button 
                  onClick={handlePhotoUpload}
                  className="absolute bottom-[-4px] right-[-4px] p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xl transition-all border border-indigo-400/20 active:scale-90"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="text-lg font-display font-bold text-white mt-6 tracking-tight uppercase">{profile?.name}</h3>
              <p className="text-indigo-400 font-bold text-[9px] uppercase tracking-widest mt-1">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Settings */}
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'Personal Info' && (
            <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-700 flex items-center gap-4 bg-slate-900/10">
                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm uppercase tracking-widest">Personal Information</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Used for AI resume generation context</p>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    value={profile?.name || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 px-5 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'JLPT & Skills' && (
            <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
               <div className="p-8 border-b border-slate-700 flex items-center gap-4 bg-slate-900/10">
                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                  <Languages className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm uppercase tracking-widest">Japanese Proficiency</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Configure your skill metrics</p>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center gap-2">
                    Target JLPT Level
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {JLPT_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setProfile(prev => prev ? {...prev, jlptLevel: level} : null)}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-[10px] font-black transition-all uppercase tracking-widest",
                          profile?.jlptLevel === level 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-indigo-500"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-700 flex items-center gap-4 bg-slate-900/10">
                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm uppercase tracking-widest">Security Settings</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Manage your account access</p>
                </div>
              </div>
              <div className="p-8">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Reset Password</h4>
                  <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
                    We'll send a secure password reset link to your registered email address <strong>{user?.email}</strong>.
                  </p>
                  <button 
                    onClick={handleResetPassword}
                    disabled={isResetting}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-2"
                  >
                    {isResetting ? (
                      <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Shield className="w-3 h-3" />
                    )}
                    Send Password Reset Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-700 flex items-center gap-4 bg-slate-900/10">
                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm uppercase tracking-widest">Notification History</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Updates on your Japanese career journey</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {notifications.length === 0 ? (
                   <div className="p-12 text-center">
                    <Bell className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">No notifications found</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={cn(
                        "p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all hover:bg-slate-700/30",
                        notif.read ? "bg-slate-900/50 border-slate-800" : "bg-slate-800 border-indigo-500/30"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "mt-1 p-2 rounded-lg",
                          notif.type === 'match' ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
                        )}>
                          {notif.type === 'match' ? <CheckCircle className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className={cn("text-xs font-bold uppercase tracking-tight mb-1", notif.read ? "text-slate-400" : "text-white")}>
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-2">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!notif.read && (
                          <button 
                            onClick={() => markNotifRead(notif.id)}
                            className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotif(notif.id)}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
