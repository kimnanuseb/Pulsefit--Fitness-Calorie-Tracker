
import React from 'react';
import { UserProfile, ActivityLog, FoodLog } from '../types';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, calculateGoalCalories } from '../utils/fitnessMath';
import { Flame, Target, TrendingUp, Activity, AlertCircle, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  activities: ActivityLog[];
  foodLogs: FoodLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, activities, foodLogs }) => {
  const bmi = calculateBMI(user.weight, user.height);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(user);
  const tdee = calculateTDEE(bmr, user.activityLevel);
  const target = calculateGoalCalories(user, tdee);

  const todayStr = new Date().toDateString();
  const todayFood = foodLogs.filter(f => new Date(f.timestamp).toDateString() === todayStr);
  const todayActivities = activities.filter(a => new Date(a.timestamp).toDateString() === todayStr);

  const eaten = todayFood.reduce((s, f) => s + f.calories, 0);
  const burned = todayActivities.reduce((s, a) => s + a.caloriesBurned, 0);
  const remaining = Math.max(Math.round(target - eaten + burned), 0);
  const progress = Math.min((eaten / target) * 100, 100);

  // Goal Countdown Logic
  const startDate = user.startDate || Date.now();
  const targetEndDate = startDate + (user.timeframeWeeks * 7 * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.max(0, Math.ceil((targetEndDate - Date.now()) / (1000 * 60 * 60 * 24)));

  // Activity Streak / Days Trained logic (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  const activityByDay = last7Days.map(day => ({
    day: day.split(' ')[0], // Get short day name (e.g., 'Mon')
    hasActivity: activities.some(a => new Date(a.timestamp).toDateString() === day)
  }));

  // Insight message generator
  const getInsight = () => {
    if (eaten === 0) return "Starting fresh today! Log your first meal to stay on track.";
    if (remaining < 200 && remaining > 0) return "Almost at your daily limit! Consider a light walk.";
    if (remaining === 0) return "Daily calorie target reached! Hydrate and rest.";
    if (burned > 500) return "Impressive workout! You've earned some extra recovery fuel.";
    return `You have ${remaining} kcal left to reach your daily goal of ${Math.round(target)}.`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Primary Calorie Card */}
      <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden emerald-glow border-emerald-500/10">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Net Calorie Budget</p>
            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
              <Clock size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase">{daysRemaining} Days to Goal</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-6xl font-black tracking-tighter">{remaining}</h2>
            <span className="text-emerald-500 font-black text-xl">LEFT</span>
          </div>
          
          <p className="text-xs text-zinc-500 font-medium mb-8 leading-relaxed max-w-[80%]">
            {getInsight()}
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-500/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Eaten</p>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                   <p className="text-2xl font-black">{eaten}</p>
                </div>
              </div>
              <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                <p className="text-[10px] font-bold uppercase text-emerald-500 opacity-70 mb-1">Burned</p>
                <div className="flex items-center gap-2">
                   <Flame size={14} className="text-emerald-500" />
                   <p className="text-2xl font-black text-emerald-500">-{burned}</p>
                </div>
              </div>
            </div>

            <div className="w-full h-4 bg-zinc-500/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Training Consistency / Days Trained Grid */}
      <div className="glass p-6 rounded-[2rem]">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Weekly Activity Tracker</h3>
        <div className="flex justify-between items-center px-1">
          {activityByDay.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${day.hasActivity ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 text-zinc-600 border border-white/5'}`}>
                {day.hasActivity ? <CheckCircle2 size={16} /> : <div className="w-1 h-1 rounded-full bg-current opacity-20" />}
              </div>
              <span className={`text-[9px] font-black uppercase ${day.hasActivity ? 'text-emerald-500' : 'text-zinc-500 opacity-40'}`}>{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-6 rounded-[2rem]">
          <p className="text-zinc-500 text-[10px] font-bold uppercase mb-2">Maintenance Goal</p>
          <p className="text-2xl font-black tracking-tighter">{Math.round(tdee)}</p>
          <p className="text-[10px] opacity-40 uppercase mt-1 font-bold">Daily TDEE Target</p>
        </div>
        <div className="glass p-6 rounded-[2rem]">
          <p className="text-zinc-500 text-[10px] font-bold uppercase mb-2">Weight Status</p>
          <p className="text-2xl font-black tracking-tighter">{bmi.toFixed(1)}</p>
          <p className={`text-[10px] font-bold uppercase mt-1 ${bmiCategory === 'Normal Weight' ? 'text-emerald-500' : 'text-orange-500'}`}>{bmiCategory}</p>
        </div>
      </div>

      {todayActivities.length > 0 && (
        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Recent Session Details</h3>
           <div className="space-y-2">
             {todayActivities.map(a => (
               <div key={a.id} className="glass p-4 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                      <Zap size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">{a.type}</p>
                      <p className="text-[10px] opacity-40 font-bold uppercase">{Math.floor(a.duration / 60)} MIN • {a.distance.toFixed(1)} KM</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="font-black text-emerald-500">-{a.caloriesBurned}</p>
                    <p className="text-[9px] opacity-30 font-bold uppercase">KCAL</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
