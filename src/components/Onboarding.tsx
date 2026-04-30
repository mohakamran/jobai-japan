import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Code, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Rocket, 
  Plus, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { userProfileService, UserProfile, Education, Experience } from '../services/dataService';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [profile, setProfile] = React.useState<Partial<UserProfile>>({
    title: '',
    introduction: '',
    location: '',
    jlptLevel: 'None',
    skills: [],
    education: [],
    experience: []
  });

  const [newSkill, setNewSkill] = React.useState('');
  
  // Local states for complex inputs
  const [tempEdu, setTempEdu] = React.useState<Education>({ school: '', degree: '', field: '', startYear: '', endYear: '' });
  const [tempExp, setTempExp] = React.useState<Experience>({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleFinish();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await userProfileService.updateProfile(user.uid, profile);
      onComplete();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !(profile.skills || []).includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...(profile.skills || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: (profile.skills || []).filter(s => s !== skill) });
  };

  const addEducation = () => {
    if (tempEdu.school && tempEdu.degree) {
      setProfile({ ...profile, education: [...(profile.education || []), tempEdu] });
      setTempEdu({ school: '', degree: '', field: '', startYear: '', endYear: '' });
    }
  };

  const addExperience = () => {
    if (tempExp.company && tempExp.position) {
      setProfile({ ...profile, experience: [...(profile.experience || []), tempExp] });
      setTempExp({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Professional Identity</h2>
              <p className="text-slate-500 text-sm">Tell us who you are and where you want to work.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="e.g. Tokyo, Japan"
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">JLPT Level</label>
                  <select 
                    value={profile.jlptLevel}
                    onChange={(e) => setProfile({ ...profile, jlptLevel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="None">No JLPT</option>
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Introduction</label>
                <textarea 
                  value={profile.introduction}
                  onChange={(e) => setProfile({ ...profile, introduction: e.target.value })}
                  placeholder="Tell Japanese recruiters about your journey and why you want to work in Japan..."
                  className="w-full h-32 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none placeholder:text-slate-700"
                />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Technical Skills</h2>
              <p className="text-slate-500 text-sm">Add skills that define your technical arsenal.</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="e.g. React, Docker, Python..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={addSkill}
                  className="px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-indigo-500 hover:bg-slate-800 transition-all font-bold"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.skills?.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all hover:bg-indigo-500/20">
                    {skill}
                    <button onClick={() => removeSkill(skill)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {profile.skills?.length === 0 && (
                  <p className="text-slate-600 text-xs italic">No skills added yet...</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Academic History</h2>
              <p className="text-slate-500 text-sm">Your education is highly valued in Japan.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="School Name"
                  value={tempEdu.school}
                  onChange={(e) => setTempEdu({ ...tempEdu, school: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input 
                  type="text" 
                  placeholder="Degree"
                  value={tempEdu.degree}
                  onChange={(e) => setTempEdu({ ...tempEdu, degree: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button 
                onClick={addEducation}
                className="w-full py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase text-indigo-500 hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>

              <div className="space-y-3 pt-4">
                {profile.education?.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{edu.school}</h4>
                      <p className="text-xs text-slate-500">{edu.degree} in {edu.field}</p>
                    </div>
                    <button 
                      onClick={() => setProfile({ ...profile, education: profile.education?.filter((_, i) => i !== idx) })}
                      className="text-slate-600 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Work Experience</h2>
              <p className="text-slate-500 text-sm">Tell us about your professional journey.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Company"
                  value={tempExp.company}
                  onChange={(e) => setTempExp({ ...tempExp, company: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input 
                  type="text" 
                  placeholder="Position"
                  value={tempExp.position}
                  onChange={(e) => setTempExp({ ...tempExp, position: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button 
                onClick={addExperience}
                className="w-full py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase text-indigo-500 hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>

              <div className="space-y-3 pt-4">
                {profile.experience?.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{exp.company}</h4>
                      <p className="text-xs text-slate-500">{exp.position}</p>
                    </div>
                    <button 
                      onClick={() => setProfile({ ...profile, experience: profile.experience?.filter((_, i) => i !== idx) })}
                      className="text-slate-600 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-800">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <div className="p-10 md:p-12">
            <div className="mb-10 flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <Rocket className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step {step} of {totalSteps}</p>
                <p className="text-xs font-bold text-indigo-400">Profile Onboarding</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between border-t border-slate-800/50 pt-8">
              <button 
                onClick={handlePrev}
                disabled={step === 1}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors disabled:opacity-0"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button 
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Finalizing...' : step === totalSteps ? 'Complete Profile' : 'Next Step'}
                {!loading && step !== totalSteps && <ChevronRight className="w-4 h-4" />}
                {!loading && step === totalSteps && <CheckCircle2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          <AlertCircle className="w-3 h-3" />
          Higher profile completion boosts AI match scores
        </div>
      </div>
    </div>
  );
}
