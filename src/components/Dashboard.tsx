import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Zap 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { applicationService, Application, userProfileService, UserProfile } from '../services/dataService';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, change }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl group transition-all"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 rounded-xl bg-slate-900/50 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
        <Icon className="w-5 h-5" />
      </div>
      {change && (
        <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
          {change}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
    <p className="text-3xl font-display font-bold text-white mt-1">{value}</p>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [apps, setApps] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    // Profile subscription
    const unsubProfile = userProfileService.subscribeToProfile(user.uid, (p) => {
      if (p) {
        setProfile(p);
      }
    });

    // Applications subscription
    const unsubApps = applicationService.subscribeToApplications(user.uid, (data) => {
      setApps(data);
      setLoading(false);
    });

    return () => {
      unsubProfile();
      unsubApps();
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

  const completion = calculateCompletion();

  const stats = {
    applied: apps.length,
    interviews: apps.filter(a => a.status === 'Interview').length,
    offers: apps.filter(a => a.status === 'Offer').length,
    rejected: apps.filter(a => a.status === 'Rejected').length,
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const MOCK_JOBS_RAW = [
    { id: '1', title: 'Senior Frontend Engineer', company: 'Rakuten Group', location: 'Tokyo', skills: ['React', 'TypeScript', 'Node.js'], jlptRequirement: 'N2', logo: 'R', logoBg: 'bg-[#E11F26]' },
    { id: '2', title: 'AI Solutions Architect', company: 'Mercari Inc.', location: 'Tokyo', skills: ['Python', 'LLMs'], jlptRequirement: 'None', logo: 'M', logoBg: 'bg-slate-700' },
    { id: '3', title: 'Fullstack Developer', company: 'LINE Corp.', location: 'Tokyo', skills: ['Next.js', 'AWS'], jlptRequirement: 'N3', logo: 'L', logoBg: 'bg-[#00A1E9]' },
  ];

  const calculateJobMatch = (job: typeof MOCK_JOBS_RAW[0]) => {
    if (!profile) return 50;
    let score = 30;
    const userSkills = profile.skills || [];
    const matchingSkills = job.skills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    score += (matchingSkills.length / job.skills.length) * 40;
    const levels = ['None', 'N5', 'N4', 'N3', 'N2', 'N1'];
    const userLv = levels.indexOf(profile.jlptLevel || 'None');
    const jobLv = levels.indexOf(job.jlptRequirement || 'None');
    if (userLv >= jobLv && jobLv > 0) score += 20;
    else if (jobLv === 0) score += 10;
    return Math.min(Math.round(score), 100);
  };

  const topMatches = MOCK_JOBS_RAW.map(job => ({
    ...job,
    score: calculateJobMatch(job)
  })).sort((a, b) => b.score - a.score);

  const chartData = [
    { name: 'Applied', value: stats.applied, color: '#6366F1' },
    { name: 'Interviews', value: stats.interviews, color: '#22C55E' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
    { name: 'Offers', value: stats.offers, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Kon’nichiwa, {profile?.name?.split(' ')[0] || 'User'}</h2>
          <p className="text-slate-400 mt-2 font-medium">Your AI-powered job search is at <span className="text-indigo-400 font-bold">{completion}%</span> efficiency today.</p>
        </div>
        
        {completion < 100 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-indigo-600/10 border border-indigo-500/30 p-4 rounded-2xl"
          >
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Profile Incomplete</p>
              <button 
                onClick={() => window.location.hash = '#/settings'}
                className="text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors mt-1 underline underline-offset-4"
              >
                Reach 100% for Elite matching
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Applications" value={stats.applied.toString()} icon={Briefcase} change="+0%" color="slate" />
        <StatCard title="Response Rate" value={stats.applied > 0 ? `${Math.round((stats.interviews/stats.applied)*100)}%` : '0%'} icon={TrendingUp} change="v. Avg 8%" color="slate" />
        <StatCard title="Interviews" value={stats.interviews.toString()} icon={Calendar} change="Active" color="slate" />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg group hover:border-indigo-500 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-indigo-500/20">
            <Zap className="w-8 h-8" />
          </div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Efficiency Rating</div>
          <div className="text-4xl font-display font-bold flex items-baseline gap-2 text-white">
            {completion} <span className="text-slate-600 text-sm font-normal">/ 100</span>
          </div>
          <div className={cn(
            "mt-2 text-[10px] px-2 py-0.5 rounded w-fit font-black uppercase tracking-widest",
            completion === 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-300"
          )}>
            {completion === 100 ? 'Elite Access' : 'Standard Tier'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-xs">Top Matches for Your Profile</h3>
              <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                View All
              </button>
            </div>
            <div className="p-6 space-y-4">
              {topMatches.map((job, i) => (
                <div key={i} className="p-5 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-between group cursor-pointer hover:border-indigo-500 hover:bg-slate-900 transition-all shadow-sm">
                  <div className="flex gap-5 items-center">
                    <div className={`w-12 h-12 ${job.logoBg} rounded-xl flex items-center justify-center p-2 text-white font-black text-xl shadow-inner`}>
                      {job.logo}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{job.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{job.company} • {job.location}</p>
                      <div className="flex gap-2 mt-3">
                        {job.skills.slice(0, 2).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-bold text-indigo-400 leading-none">{job.score}%</div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mt-1">Match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
             <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-xs">Application Pipeline</h3>
              <select className="bg-slate-900 border-none text-[10px] uppercase font-bold tracking-widest rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 text-slate-400 outline-none">
                <option>Last 30 days</option>
                <option>Last 6 months</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#F1F5F9',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
            <h3 className="font-display font-bold text-white text-sm mb-1 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Skill Gap Analyzer
            </h3>
            <p className="text-[10px] text-slate-500 mb-8 font-medium uppercase tracking-tight">Based on 12 target roles in Roppongi</p>
            
            <div className="space-y-6">
              {[
                { label: 'Business Japanese (Keigo)', value: 45, color: '#10B981' },
                { label: 'System Design', value: 80, color: '#6366F1' },
                { label: 'Cloud Architecture', value: 65, color: '#F59E0B' },
              ].map((skill, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                    <span className="text-slate-300">{skill.label}</span>
                    <span className="text-slate-500">{skill.value}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      style={{ backgroundColor: skill.color }}
                      className="h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-700/50">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl text-[11px] leading-relaxed relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-8 -mt-8" />
                <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-widest text-[9px]">AI Growth Strategy:</span>
                <p className="text-slate-300 font-medium">
                  Focus on <strong className="text-white">Business Japanese</strong> prep. Current market trends suggest a 40% higher response rate for candidates with Keigo certification.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
            <h3 className="font-display font-bold text-white text-sm mb-6 uppercase tracking-widest">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { company: 'Rakuten', action: 'Applied', time: '2 hours ago', icon: Clock, color: 'indigo' },
                { company: 'Mercari', action: 'Interview', time: '5 hours ago', icon: Calendar, color: 'emerald' },
                { company: 'Sony', action: 'Offer Received', time: '1 day ago', icon: CheckCircle2, color: 'amber' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className={`p-2.5 rounded-xl bg-${item.color}-500/10 h-fit shrink-0`}>
                    <item.icon className={`w-3.5 h-3.5 text-${item.color}-400`} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                      {item.company}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{item.action} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
