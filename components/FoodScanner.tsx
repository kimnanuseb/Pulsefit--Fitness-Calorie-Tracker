
import React, { useState } from 'react';
import { FoodLog } from '../types';
import { COMMON_FOODS } from '../services/nutritionDb';
import { Search, Plus, X, Check, Utensils, Hash, Info } from 'lucide-react';

interface FoodScannerProps {
  onComplete: (log: FoodLog) => void;
}

const FoodScanner: React.FC<FoodScannerProps> = ({ onComplete }) => {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'search' | 'manual'>('search');
  
  // Manual Entry State
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const filteredFoods = COMMON_FOODS.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20); // Limit results for speed

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCals) return;

    onComplete({
      id: Math.random().toString(36).substr(2, 9),
      name: customName || "Quick Entry",
      calories: parseInt(customCals) || 0,
      timestamp: Date.now(),
      macronutrients: {
        protein: parseInt(customProtein) || 0,
        carbs: parseInt(customCarbs) || 0,
        fat: parseInt(customFat) || 0,
      }
    });

    resetState();
  };

  const handleDatabaseSelect = (food: any) => {
    onComplete({
      id: Math.random().toString(36).substr(2, 9),
      name: food.name,
      calories: food.calories,
      timestamp: Date.now(),
      macronutrients: {
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      }
    });
    resetState();
  };

  const resetState = () => {
    setSearch('');
    setView('search');
    setCustomName('');
    setCustomCals('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-2 p-1 glass rounded-2xl mb-4">
        <button 
          onClick={() => setView('search')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'search' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500'}`}
        >
          Search DB
        </button>
        <button 
          onClick={() => setView('manual')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'manual' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500'}`}
        >
          Manual Label
        </button>
      </div>

      {view === 'search' ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Search food, drinks, or snacks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food, i) => (
                <button
                  key={i}
                  onClick={() => handleDatabaseSelect(food)}
                  className="w-full flex items-center justify-between p-4 glass hover:bg-emerald-500/10 rounded-2xl border border-white/5 transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                      <Utensils size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{food.name}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                        {food.protein}P • {food.carbs}C • {food.fat}F
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-500 text-lg">{food.calories}</p>
                    <p className="text-[10px] opacity-30 font-bold uppercase tracking-tighter">KCAL</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-10 text-center opacity-30">
                <p className="text-sm font-bold">No results for "{search}"</p>
                <button onClick={() => setView('manual')} className="text-emerald-500 text-[10px] uppercase font-black tracking-widest mt-2 underline">Switch to Manual</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="glass p-6 rounded-[2.5rem] space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-black tracking-tighter uppercase italic">Nutrition Label Entry</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Type details from product packaging</p>
            </div>
            <button type="button" onClick={resetState} className="p-2 hover:bg-white/10 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Product Name</label>
              <input 
                type="text"
                placeholder="e.g. Blue Monster Can, Doritos..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500 font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Calories (Kcal) *</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                  <input 
                    type="number"
                    required
                    placeholder="0"
                    value={customCals}
                    onChange={(e) => setCustomCals(e.target.value)}
                    className="w-full bg-zinc-900 border border-emerald-500/30 rounded-xl p-4 pl-10 outline-none focus:border-emerald-500 font-black text-xl text-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1 opacity-60">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Protein (g)</label>
                <input 
                  type="number"
                  placeholder="0"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 opacity-60">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Carbs (g)</label>
                <input 
                  type="number"
                  placeholder="0"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500 font-bold"
                />
              </div>
              <div className="space-y-1 opacity-60">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Fat (g)</label>
                <input 
                  type="number"
                  placeholder="0"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-zinc-500/5 rounded-2xl">
            <Info size={16} className="text-zinc-500 shrink-0" />
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter leading-tight">
              PRO TIP: Check the "Per Serving" vs "Per Container" values on your packet to ensure accuracy.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-emerald-500 text-black font-black rounded-full flex items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] active:scale-95 transition-all"
          >
            <Check size={20} /> LOG THIS ITEM
          </button>
        </form>
      )}
    </div>
  );
};

export default FoodScanner;
