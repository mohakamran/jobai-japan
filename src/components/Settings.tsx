import React from 'react';
import { 
  User, 
  Upload, 
  Languages, 
  Shield, 
  Bell, 
  LogOut, 
  Trash2, 
  CheckCircle, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Plus, 
  X, 
  ChevronRight,
  Sparkles,
  Code
} from 'lucide-react';
import { JLPT_LEVELS } from '../constants';
import { useAuth } from '../lib/AuthContext';
import { userProfileService, UserProfile, notificationService, Notification, Education, Experience } from '../services/dataService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { user, logout, resetPassword } = useAuth();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Professional');

  const handleResetPassword = async () => {
    if (!user || !user.email) return;
    setIsResetting(true);
    try {
      await resetPassword(user.email);
      alert('Security reset link sent to your email.');
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Security request failed. Please try again later.');
    } finally {
      setIsResetting(false);
    }
  };

  const [eduSearch, setEduSearch] = React.useState('');
  const [expSearch, setExpSearch] = React.useState('');
  const [eduPage, setEduPage] = React.useState(1);
  const [expPage, setExpPage] = React.useState(1);
  const [notifPage, setNotifPage] = React.useState(1);
  const settingsItemsPerPage = 3;

  const filteredEducation = (profile?.education || []).filter(edu => 
    edu.school.toLowerCase().includes(eduSearch.toLowerCase()) || 
    edu.field.toLowerCase().includes(eduSearch.toLowerCase())
  );

  const filteredExperience = (profile?.experience || []).filter(exp => 
    exp.company.toLowerCase().includes(expSearch.toLowerCase()) || 
    exp.position.toLowerCase().includes(expSearch.toLowerCase()) ||
    exp.description.toLowerCase().includes(expSearch.toLowerCase())
  );

  const pagedEdu = filteredEducation.slice((eduPage - 1) * settingsItemsPerPage, eduPage * settingsItemsPerPage);
  const pagedExp = filteredExperience.slice((expPage - 1) * settingsItemsPerPage, expPage * settingsItemsPerPage);
  const pagedNotifs = notifications.slice((notifPage - 1) * settingsItemsPerPage, notifPage * settingsItemsPerPage);

  const totalEduPages = Math.ceil(filteredEducation.length / settingsItemsPerPage);
  const totalExpPages = Math.ceil(filteredExperience.length / settingsItemsPerPage);
  const totalNotifPages = Math.ceil(notifications.length / settingsItemsPerPage);

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

  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.name) score += 5;
    if (profile.email) score += 5;
    if (profile.title) score += 10;
    if (profile.introduction) score += 15;
    if (profile.jlptLevel && profile.jlptLevel !== 'None') score += 5;
    if (profile.location) score += 5;
    if (profile.skills && profile.skills.length > 0) score += 15;
    if (profile.education && profile.education.length > 0) score += 15;
    if (profile.experience && profile.experience.length > 0) score += 25;
    return score;
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      await userProfileService.updateProfile(user.uid, profile);

      await notificationService.createNotification({
        userId: user.uid,
        title: 'Profile Synchronized',
        message: 'Your professional data and career metrics have been updated.',
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

  const addSkill = () => {
    if (newSkill.trim() && profile && !(profile.skills || []).includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...(profile.skills || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    if (profile) {
      setProfile({ ...profile, skills: (profile.skills || []).filter(s => s !== skill) });
    }
  };

  const [newSkill, setNewSkill] = React.useState('');
  const [tempEdu, setTempEdu] = React.useState<Education>({ school: '', degree: '', field: '', startYear: '', endYear: '' });
  const [tempExp, setTempExp] = React.useState<Experience>({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' });

  const addEducation = () => {
    if (tempEdu.school && tempEdu.degree && profile) {
      setProfile({ ...profile, education: [...(profile.education || []), tempEdu] });
      setTempEdu({ school: '', degree: '', field: '', startYear: '', endYear: '' });
      setEduPage(1);
    }
  };

  const addExperience = () => {
    if (tempExp.company && tempExp.position && profile) {
      setProfile({ ...profile, experience: [...(profile.experience || []), tempExp] });
      setTempExp({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' });
      setExpPage(1);
    }
  };

  const completion = calculateCompletion();

  if (loading) {
    return (
      <div className="h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Progress Indicator */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">Career Profile</h2>
            </div>
            <p className="text-slate-500 font-medium max-w-lg leading-relaxed text-sm">
              Your profile is the core of JobAI. Complete it to unlock higher accuracy in AI matching and resume generation.
            </p>
          </div>
          
          <div className="w-full md:w-72 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Profiling Mastery
              </span>
              <span className="text-sm font-black text-white">{completion}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-[9px] text-indigo-400/60 font-black uppercase tracking-widest text-right">
              {completion < 100 ? `${100 - completion}% to reach 100% mastery` : 'Career Profile Mastered'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl">
            <div className="space-y-1">
              {[
                { label: 'Professional', icon: Briefcase },
                { label: 'Skills & JLPT', icon: Code },
                { label: 'Education', icon: GraduationCap },
                { label: 'Experience', icon: User },
                { label: 'Notifications', icon: Bell },
                { label: 'Security', icon: Shield },
              ].map(item => (
                <button 
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group",
                    activeTab === item.label ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  <ChevronRight className={cn("w-3 h-3 transition-transform", activeTab === item.label ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
             <div className="relative inline-block mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-2xl text-indigo-500 shadow-2xl overflow-hidden">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    profile?.name?.split(' ').map(n => n[0]).join('') || 'U'
                  )}
                </div>
                <button 
                  onClick={handlePhotoUpload}
                  className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xl border border-indigo-400/20 transition-all active:scale-90"
                >
                  <Upload className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">{profile?.name}</h4>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1 text-ellipsis overflow-hidden whitespace-nowrap">{profile?.title || 'No Title Set'}</p>
              </div>
              <div className="pt-4 space-y-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  {isSaving ? 'Syncing...' : 'Save Profile'}
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'Professional' && (
              <motion.div 
                key="prof"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
                  <div className="flex items-center gap-3 pb-6 border-b border-slate-800/50">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Base Identity</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Your core professional profile data</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Title</label>
                      <input 
                        type="text"
                        value={profile?.title || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, title: e.target.value} : null)}
                        placeholder="e.g. Full Stack Developer"
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                          type="text"
                          value={profile?.location || ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, location: e.target.value} : null)}
                          placeholder="e.g. Minato-ku, Tokyo"
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                        Introduction & Bio
                        <span className="text-[8px] opacity-40 italic">Markdown Supported</span>
                      </label>
                      <textarea 
                        value={profile?.introduction || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, introduction: e.target.value} : null)}
                        placeholder="Highlight your key achievements and your mission for working in Japan..."
                        className="w-full h-48 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Skills & JLPT' && (
              <motion.div 
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <Languages className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Linguistic Intelligence</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">JLPT certification levels</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {JLPT_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setProfile(prev => prev ? {...prev, jlptLevel: level} : null)}
                        className={cn(
                          "px-4 py-4 rounded-2xl border text-xs font-black transition-all uppercase tracking-widest",
                          profile?.jlptLevel === level 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                            : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-indigo-500"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-8 border-t border-slate-800/50">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Stack Inventory</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Technical skills for AI matching</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-2">
                       <input 
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="e.g. React, Docker, Python..."
                        className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <button 
                        onClick={addSkill}
                        className="px-6 bg-slate-800 border border-slate-700 rounded-2xl text-indigo-400 hover:bg-slate-700 transition-all font-bold"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map(skill => (
                        <div key={skill} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)}
                            className="p-1 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Education' && (
              <motion.div 
                key="edu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
                  <div className="flex items-center gap-3 border-b border-slate-800/50 pb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Academic History</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Degrees and certifications</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="School/University"
                      value={tempEdu.school} onChange={(e) => setTempEdu({...tempEdu, school: e.target.value})}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <input 
                      type="text" placeholder="Degree/Level"
                      value={tempEdu.degree} onChange={(e) => setTempEdu({...tempEdu, degree: e.target.value})}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <input 
                      type="text" placeholder="Major/Field of Study"
                      value={tempEdu.field} onChange={(e) => setTempEdu({...tempEdu, field: e.target.value})}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                       <input 
                        type="text" placeholder="Start Year"
                        value={tempEdu.startYear} onChange={(e) => setTempEdu({...tempEdu, startYear: e.target.value})}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                       <input 
                        type="text" placeholder="End Year"
                        value={tempEdu.endYear} onChange={(e) => setTempEdu({...tempEdu, endYear: e.target.value})}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={addEducation}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Add Academic Entry
                  </button>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                    <div className="relative flex-1">
                      <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search academic history..."
                        value={eduSearch}
                        onChange={(e) => { setEduSearch(e.target.value); setEduPage(1); }}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {pagedEdu.length === 0 ? (
                      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">No matching academic records</p>
                      </div>
                    ) : pagedEdu.map((edu, idx) => (
                      <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-800 rounded-xl text-slate-500">
                             <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{edu.school}</h4>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{edu.degree} in {edu.field}</p>
                            <p className="text-[9px] text-indigo-400 font-bold mt-1">{edu.startYear} - {edu.endYear}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setProfile(prev => prev ? {...prev, education: prev.education?.filter((_, i) => i !== ((eduPage - 1) * settingsItemsPerPage + idx))} : null)}
                          className="p-3 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {totalEduPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      {Array.from({ length: totalEduPages }, (_, i) => i+1).map(page => (
                        <button 
                          key={page}
                          onClick={() => setEduPage(page)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                            eduPage === page ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'Experience' && (
              <motion.div 
                key="exp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
                  <div className="flex items-center gap-3 border-b border-slate-800/50 pb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Professional Journey</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Your work history and roles</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" placeholder="Company Name"
                        value={tempExp.company} onChange={(e) => setTempExp({...tempExp, company: e.target.value})}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        type="text" placeholder="Position / Job Title"
                        value={tempExp.position} onChange={(e) => setTempExp({...tempExp, position: e.target.value})}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <textarea 
                      placeholder="Role description and key achievements..."
                      value={tempExp.description} onChange={(e) => setTempExp({...tempExp, description: e.target.value})}
                      className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>
                  <button 
                    onClick={addExperience}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Add Role Entry
                  </button>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                    <div className="relative flex-1">
                      <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search work experience..."
                        value={expSearch}
                        onChange={(e) => { setExpSearch(e.target.value); setExpPage(1); }}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {pagedExp.length === 0 ? (
                      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">No matching professional records</p>
                      </div>
                    ) : pagedExp.map((exp, idx) => (
                      <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-start justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex gap-4">
                           <div className="mt-1 p-3 bg-slate-800 rounded-xl text-slate-500">
                             <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{exp.company}</h4>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{exp.position}</p>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-xl mt-2">{exp.description}</p>
                            <p className="text-[9px] text-slate-600 font-black uppercase mt-3 tracking-widest">{exp.startDate} - {exp.current ? 'PRESENT' : exp.endDate}</p>
                          </div>
                        </div>
                         <button 
                          onClick={() => setProfile(prev => prev ? {...prev, experience: prev.experience?.filter((_, i) => i !== ((expPage - 1) * settingsItemsPerPage + idx))} : null)}
                          className="p-3 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {totalExpPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      {Array.from({ length: totalExpPages }, (_, i) => i+1).map(page => (
                        <button 
                          key={page}
                          onClick={() => setExpPage(page)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                            expPage === page ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'Notifications' && (
              <motion.div 
                key="notif"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <Bell className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">No notifications found</p>
                    </div>
                  ) : (
                    <>
                      {pagedNotifs.map(notif => (
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
                                {new Date(notif.createdAt || 0).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {totalNotifPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                          {Array.from({ length: totalNotifPages }, (_, i) => i+1).map(page => (
                            <button 
                              key={page}
                              onClick={() => setNotifPage(page)}
                              className={cn(
                                "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                                notifPage === page ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                              )}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'Security' && (
              <motion.div 
                key="sec"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
                  <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Internal Vault</h4>
                    <p className="text-[10px] text-slate-500 mb-8 leading-relaxed font-bold uppercase">
                      Authorized email: <strong>{user?.email}</strong>
                    </p>
                    <button 
                      onClick={handleResetPassword}
                      disabled={isResetting}
                      className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {isResetting ? (
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Request Security Reset Token
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
