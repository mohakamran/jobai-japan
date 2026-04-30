import React from 'react';
import { Clock, CheckCircle2, XCircle, Building2, MapPin, Zap, Edit, Save, FileText, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { applicationService, Application } from '../services/dataService';
import { cn } from '../lib/utils';

export default function Applications() {
  const { user } = useAuth();
  const [apps, setApps] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [editSource, setEditSource] = React.useState<Partial<Application>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = applicationService.subscribeToApplications(user.uid, (data) => {
      setApps(data.sort((a, b) => Number(b.appliedAt || 0) - Number(a.appliedAt || 0)));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'Applied': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'Interview': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Offer': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Rejected': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'Saved': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'Applied': return <Clock className="w-3 h-3" />;
      case 'Interview': return <CheckCircle2 className="w-3 h-3" />;
      case 'Offer': return <Zap className="w-3 h-3" />;
      case 'Rejected': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const updateStatus = async (appId: string, status: Application['status']) => {
    try {
      await applicationService.updateStatus(appId, status);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const startEdit = (app: Application) => {
    setExpandedId(expandedId === app.id ? null : app.id);
    setEditSource({
      location: app.location || '',
      salary: app.salary || '',
      notes: app.notes || ''
    });
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      await applicationService.updateApplication(id, editSource);
      setExpandedId(null);
    } catch (error) {
      console.error('Failed to update application:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteApp = async (appId: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await applicationService.deleteApplication(appId);
      } catch (error) {
        console.error('Failed to delete application:', error);
      }
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Application Pipeline</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Real-time status tracking</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/40">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Company & Role</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Date Applied</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Salary Range</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {apps.length === 0 ? (
                <motion.tr 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                        <Clock className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No applications found. Start applying in Job Explorer!</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                apps.map((app) => [
                  <motion.tr 
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "group transition-colors",
                      expandedId === app.id ? "bg-slate-700/50" : "hover:bg-slate-700/30"
                    )}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-indigo-500 shadow-inner">
                          {app.companyName[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{app.jobTitle}</h4>
                          <div className="flex items-center gap-3 mt-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {app.companyName}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.location || 'Remote'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-400">{new Date(app.appliedAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 tracking-wider">
                        {app.salary || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <select 
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value as Application['status'])}
                          className="bg-slate-900 border border-slate-700 text-[10px] font-black uppercase text-slate-400 rounded-lg py-1 px-2 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-800 transition-all"
                        >
                          {['Applied', 'Interview', 'Rejected', 'Offer', 'Saved'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => startEdit(app)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            expandedId === app.id ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-indigo-400 hover:bg-slate-700"
                          )}
                        >
                          {expandedId === app.id ? <ChevronUp className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => deleteApp(app.id)}
                          className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>,
                  expandedId === app.id && (
                    <motion.tr
                      key={`${app.id}-details`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan={5} className="px-8 py-8 bg-slate-900/50 border-t border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Location</label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                                  <input 
                                    type="text"
                                    value={editSource.location}
                                    onChange={(e) => setEditSource({...editSource, location: e.target.value})}
                                    placeholder="e.g. Minato-ku, Tokyo"
                                    className="w-full bg-slate-800 border border-slate-700/50 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Salary Range</label>
                                <div className="relative">
                                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                                  <input 
                                    type="text"
                                    value={editSource.salary}
                                    onChange={(e) => setEditSource({...editSource, salary: e.target.value})}
                                    placeholder="e.g. 8M - 12M JPY"
                                    className="w-full bg-slate-800 border border-slate-700/50 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                  <FileText className="w-3 h-3" /> Interview Notes & Details
                                </label>
                                <button 
                                  onClick={() => handleSave(app.id)}
                                  disabled={isSaving}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                  Save Updates
                                </button>
                              </div>
                              <textarea 
                                value={editSource.notes}
                                onChange={(e) => setEditSource({...editSource, notes: e.target.value})}
                                placeholder="Add specific details about interview stages, tech stack requirements, or referral info..."
                                className="w-full h-32 bg-slate-800 border border-slate-700/50 rounded-2xl p-4 text-xs font-medium text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                              />
                            </div>
                          </div>
                          
                          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Quick Insights</h5>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                  <Zap className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-white uppercase tracking-tight">AI Match Score</p>
                                  <p className="text-xs font-bold text-slate-400">{app.matchScore || 0}% Compatibility</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                                  <Clock className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-white uppercase tracking-tight">Last Status Change</p>
                                  <p className="text-xs font-bold text-slate-400">{new Date(app.updatedAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )
                ]).flat().filter(Boolean)
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
