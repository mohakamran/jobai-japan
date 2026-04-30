import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Send, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NAVIGATION_ITEMS } from '../constants';
import { useAuth } from '../lib/AuthContext';
import { notificationService, Notification, userProfileService, UserProfile } from '../services/dataService';

interface LayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
}

export default function Layout({ children, activePath, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (!user) return;
    
    const unsubNotifs = notificationService.subscribeToNotifications(user.uid, setNotifications);
    const unsubProfile = userProfileService.subscribeToProfile(user.uid, setProfile);

    return () => {
      unsubNotifs();
      unsubProfile();
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden antialiased">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-[#0F172A] border-r border-slate-800 flex flex-col z-20 shrink-0"
      >
        <div className="p-6 flex items-center gap-3 text-indigo-500 font-bold text-xl overflow-hidden">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
            <Briefcase className="w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold tracking-tight truncate"
            >
              JobAI Japan
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto no-scrollbar">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = {
              LayoutDashboard,
              Briefcase,
              FileText,
              Send,
              Settings
            }[item.icon] || Briefcase;

            const isActive = activePath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-indigo-400" : "text-slate-400")} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && !isSidebarOpen && (
                  <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 transition-colors group"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {isSidebarOpen && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-[#0F172A] relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors shrink-0"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search jobs, docs, or settings..." 
                className="w-full bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs font-medium">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={cn(
                              "p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group",
                              !n.read && "bg-indigo-500/5"
                            )}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-bold text-white mb-1">{n.title}</h4>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!n.read && (
                                  <button onClick={() => notificationService.markAsRead(n.id)} className="p-1 hover:text-green-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                  </button>
                                )}
                                <button onClick={() => notificationService.deleteNotification(n.id)} className="p-1 hover:text-rose-400">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white">{profile?.name || user?.displayName || 'User'}</p>
                <p className="text-[10px] text-slate-500 font-medium">JLPT: {profile?.jlptLevel || 'None'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-black text-[10px] border border-indigo-500/50 text-white shrink-0 shadow-lg shadow-indigo-600/20 overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  (profile?.name || user?.displayName || 'U').substring(0, 1).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePath}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-w-[1200px] mx-auto">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
