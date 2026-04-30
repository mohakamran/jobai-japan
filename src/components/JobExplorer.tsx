import React from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  Zap, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { applicationService, notificationService } from '../services/dataService';

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Rakuten Group',
    location: 'Tokyo (Remote Friendly)',
    salary: '¥8M - ¥12M',
    matchScore: 98,
    description: 'Lead the frontend development of our global rewards platform using React and TypeScript. Focus on high-performance rendering and seamless localisations.',
    skills: ['React', 'TypeScript', 'Node.js', 'Japanese N2']
  },
  {
    id: '2',
    title: 'AI Solutions Architect',
    company: 'Mercari Inc.',
    location: 'Roppongi, Tokyo',
    salary: '¥10M - ¥15M',
    matchScore: 85,
    description: 'Design and implement LLM-based solutions for Japan\'s largest marketplace. Work on RAG systems and multi-modal search optimization.',
    skills: ['Python', 'PyTorch', 'LLMs', 'MLOps']
  },
  {
    id: '3',
    title: 'Fullstack Developer',
    company: 'LINE Corp.',
    location: 'Shinjuku, Tokyo',
    salary: '¥7M - ¥10M',
    matchScore: 79,
    description: 'Build robust messaging features and financial services. High emphasis on system scalability and clean architecture.',
    skills: ['Next.js', 'Go', 'AWS', 'MySQL']
  }
];

export default function JobExplorer() {
  const { user } = useAuth();
  const [applyingId, setApplyingId] = React.useState<string | null>(null);
  const [appliedIds, setAppliedIds] = React.useState<string[]>([]);

  const handleApply = async (job: typeof MOCK_JOBS[0]) => {
    if (!user) return;
    setApplyingId(job.id);
    
    try {
      await applicationService.applyToJob({
        userId: user.uid,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company,
        status: 'Applied',
        location: job.location,
        salary: job.salary,
        matchScore: job.matchScore
      });

      await notificationService.createNotification({
        userId: user.uid,
        title: 'Application Successful',
        message: `You've successfully applied to ${job.company} for the ${job.title} position.`,
        type: 'application'
      });

      setAppliedIds(prev => [...prev, job.id]);
    } catch (error) {
      console.error('Failed to apply:', error);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search roles, skills, or companies..." 
            className="w-full bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-between gap-3 px-6 py-4 bg-slate-900 rounded-2xl border border-slate-700 text-sm font-bold text-slate-400 min-w-[140px] hover:text-white transition-colors">
            Location
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-between gap-3 px-6 py-4 bg-slate-900 rounded-2xl border border-slate-700 text-sm font-bold text-slate-400 min-w-[140px] hover:text-white transition-colors">
            Salary
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Found 42 Recommended Jobs</p>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          AI Matches Updated Just Now
        </div>
      </div>

      {/* Job List */}
      <div className="grid grid-cols-1 gap-6">
        {MOCK_JOBS.map((job) => (
          <motion.div 
            key={job.id}
            whileHover={{ x: 4 }}
            className="group bg-slate-800/80 border border-slate-700/50 p-6 rounded-2xl hover:border-indigo-500 hover:bg-slate-800 transition-all shadow-lg"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ring-indigo-500/20 shadow-inner">
                      <Zap className="w-3.5 h-3.5" />
                      {job.matchScore}% Match
                    </div>
                    <span className="text-xs font-black text-emerald-400 tracking-wider font-display uppercase">{job.salary}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mt-5 leading-relaxed font-medium">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-8">
                  {job.skills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/50 text-slate-500 text-[9px] font-black uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-3 shrink-0 pt-4 lg:pt-0">
                <button 
                  onClick={() => handleApply(job)}
                  disabled={applyingId === job.id || appliedIds.includes(job.id)}
                  className="flex-1 lg:flex-none py-3 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl text-xs rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-center"
                >
                  {applyingId === job.id ? 'Applying...' : appliedIds.includes(job.id) ? 'Applied' : 'Apply with AI'}
                </button>
                <button className="flex-1 lg:flex-none py-3 px-8 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                  Details
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
