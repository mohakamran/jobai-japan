import React from 'react';
import { 
  FileText, 
  Download, 
  Wand2, 
  Save,
  CheckCircle,
  FileSearch,
  Languages,
  Loader2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { userProfileService, UserProfile } from '../services/dataService';
import { aiService } from '../services/aiService';
import { cn } from '../lib/utils';

export default function DocumentHub() {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'resume' | 'rirekisho' | 'shokumu'>('resume');
  const [editContent, setEditContent] = React.useState('');

  const getContentForTab = React.useCallback((p: UserProfile | null, tab: string) => {
    if (!p) return '';
    if (tab === 'resume') return p.masterResume || '';
    if (tab === 'rirekisho') return p.rirekisho || '';
    if (tab === 'shokumu') return p.shokumu || '';
    return '';
  }, []);

  React.useEffect(() => {
    if (!user) return;
    return userProfileService.subscribeToProfile(user.uid, (p) => {
      setProfile(p);
      // Only update content if it's currently empty (first load)
      // or if we want to force sync from DB
      setEditContent(prev => prev === '' ? getContentForTab(p, activeTab) : prev);
    });
  }, [user, activeTab, getContentForTab]);

  const handleTabChange = (tab: 'resume' | 'rirekisho' | 'shokumu') => {
    setActiveTab(tab);
    setEditContent(getContentForTab(profile, tab));
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      const updates = { [activeTab === 'resume' ? 'masterResume' : activeTab]: editContent };
      await userProfileService.updateProfile(user.uid, updates);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!user || !profile || !profile.masterResume) {
      alert('Please provide an English CV first.');
      return;
    }
    setIsGenerating(true);
    try {
      if (activeTab === 'rirekisho' || activeTab === 'shokumu') {
        const result = await aiService.translateToJapanese(profile.masterResume, activeTab);
        if (result) {
          setEditContent(result);
          await userProfileService.updateProfile(user.uid, { [activeTab]: result });
        }
      } else {
        alert('AI Generation is primarily used for Japanese document translation/formatting.');
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-indigo-600/10 border border-indigo-500/20 p-10 rounded-3xl shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 mb-3">
            <Wand2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Document Engine</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Generate Application Docs</h2>
          <p className="text-slate-400 mt-2 max-w-lg font-medium">
            Our AI converts your English CV into professional Japanese 履歴書 & 職務経歴書 automatically.
          </p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shrink-0 shadow-lg shadow-indigo-600/20 relative z-10 active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>AI Auto-Translate</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Document Selection / List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-white font-display font-bold text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <FileSearch className="w-4 h-4 text-indigo-500" />
            Document Status
          </h3>
          
          <DocStatusItem 
            active={activeTab === 'resume'} 
            label="English Resume" 
            completed={!!profile?.masterResume} 
            onClick={() => handleTabChange('resume')}
          />
          <DocStatusItem 
            active={activeTab === 'rirekisho'} 
            label="履歴書 (Rirekisho)" 
            completed={!!profile?.rirekisho} 
            onClick={() => handleTabChange('rirekisho')}
          />
          <DocStatusItem 
            active={activeTab === 'shokumu'} 
            label="職務経歴書 (Shokumu)" 
            completed={!!profile?.shokumu} 
            onClick={() => handleTabChange('shokumu')}
          />

          <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Master Source</h4>
             <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <FileText className="w-6 h-6 text-indigo-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate uppercase tracking-tighter">
                    {profile?.name ? `${profile.name}_CV.txt` : 'No CV Uploaded'}
                  </p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase">
                    {profile?.masterResume ? 'Last updated recently' : 'Manual entry required'}
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="lg:col-span-8 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col min-h-[700px]">
          <div className="bg-slate-900/60 border-b border-slate-700 p-5 flex items-center justify-between">
            <div className="flex gap-2">
              {[
                { id: 'resume', label: 'English CV', icon: Languages },
                { id: 'rirekisho', label: '履歴書', icon: FileText },
                { id: 'shokumu', label: '職務経歴書', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as 'resume' | 'rirekisho' | 'shokumu')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black flex items-center gap-2 transition-all",
                    activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
              <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all border border-slate-700/50">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-0 overflow-hidden flex flex-col">
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder={activeTab === 'resume' ? "Paste your English CV here..." : "Japanese content will appear here after AI generation or manual entry..."}
              className="flex-1 w-full bg-slate-900/30 p-10 text-slate-300 font-mono text-sm leading-relaxed outline-none resize-none no-scrollbar focus:bg-slate-900/50 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocStatusItem({ active, label, completed, onClick }: { active: boolean, label: string, completed: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl border transition-all cursor-pointer group",
        active ? "bg-slate-800 border-indigo-500 shadow-xl shadow-indigo-600/10" : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-xl transition-colors", active ? "bg-indigo-600 shadow-lg shadow-indigo-600/20" : "bg-slate-800")}>
            <FileText className={cn("w-4 h-4", active ? "text-white" : "text-slate-500")} />
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{label}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-bold tracking-widest">{completed ? 'Ready' : 'Incomplete'}</p>
          </div>
        </div>
        {completed && <CheckCircle className="w-4 h-4 text-emerald-500" />}
      </div>
    </div>
  );
}
