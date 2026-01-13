
import React from 'react';
import { ActivityLog, FoodLog } from '../types';
import { Activity, Utensils, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HistoryViewProps {
  activities: ActivityLog[];
  foodLogs: FoodLog[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ activities, foodLogs }) => {
  // Combine all logs and group by date
  const combinedLogs = [
    ...activities.map(a => ({ ...a, logType: 'activity' as const })),
    ...foodLogs.map(f => ({ ...f, logType: 'food' as const }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const groupedByDate = combinedLogs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof combinedLogs>);

  const dates = Object.keys(groupedByDate);

  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
        <Calendar size={48} className="mb-4" />
        <p className="font-bold uppercase tracking-widest text-xs">No logs found yet</p>
        <p className="text-sm mt-2">Start tracking to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {dates.map((date) => {
        const logs = groupedByDate[date];
        const totalEaten = logs.reduce((sum, l) => l.logType === 'food' ? sum + (l as any).calories : sum, 0);
        const totalBurned = logs.reduce((sum, l) => l.logType === 'activity' ? sum + (l as any).caloriesBurned : sum, 0);
        
        return (
          <div key={date} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{date}</h3>
              <div className="flex gap-3">
                 <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                    <ArrowDownRight size={10} className="text-emerald-500" />
                    <span>{totalEaten} IN</span>
                 </div>
                 <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                    <ArrowUpRight size={10} className="text-orange-500" />
                    <span>{totalBurned} OUT</span>
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="glass p-5 rounded-[1.5rem] flex items-center justify-between border-l-4 transition-all hover:translate-x-1" 
                  style={{ borderLeftColor: log.logType === 'food' ? '#10b981' : '#f97316' }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.logType === 'food' ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
                      {log.logType === 'food' ? <Utensils size={18} className="text-emerald-500" /> : <Activity size={18} className="text-orange-500" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{(log as any).name || (log as any).type}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {log.logType === 'activity' && ` • ${((log as any).duration / 60).toFixed(0)} MIN`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${log.logType === 'food' ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {log.logType === 'food' ? `+${(log as any).calories}` : `-${(log as any).caloriesBurned}`}
                    </p>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">KCAL</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryView;
