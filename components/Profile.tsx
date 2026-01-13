
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, User, Scale, Ruler, Calendar, Activity as ActivityIcon, Target, Clock } from 'lucide-react';

interface ProfileProps {
  user: UserProfile | null;
  onSave: (user: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(user || {
    name: '', age: 25, height: 175, weight: 70, goalWeight: 65, gender: 'male', activityLevel: 1.375, timeframeWeeks: 12
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
      <div className="glass p-8 rounded-[2.5rem] space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><User size={12}/> Name</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-500/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500"/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Age</label>
            <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: +e.target.value})} className="w-full bg-zinc-500/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500"/>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Target size={12}/> Goal Weight (kg)</label>
            <input type="number" value={formData.goalWeight} onChange={e => setFormData({...formData, goalWeight: +e.target.value})} className="w-full bg-zinc-500/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500"/>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Goal Timeframe (Weeks)</label>
          <div className="flex gap-2">
            {[4, 8, 12, 16, 24].map(w => (
              <button key={w} type="button" onClick={() => setFormData({...formData, timeframeWeeks: w})}
                className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${formData.timeframeWeeks === w ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent border-white/10'}`}>
                {w}w
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Scale size={12}/> Weight (kg)</label>
            <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: +e.target.value})} className="w-full bg-zinc-500/5 border border-white/10 rounded-2xl p-4 outline-none"/>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Ruler size={12}/> Height (cm)</label>
            <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: +e.target.value})} className="w-full bg-zinc-500/5 border border-white/10 rounded-2xl p-4 outline-none"/>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full py-5 bg-emerald-500 text-black font-black rounded-full flex items-center justify-center gap-3 emerald-glow active:scale-95 transition-all">
        <Save size={20} /> SYNC PROFILE
      </button>
    </form>
  );
};

export default Profile;
