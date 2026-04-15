import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Zap, Smartphone, 
  Activity, Clock, Trash2, Target, Coffee, ChevronDown, ChevronUp 
} from 'lucide-react';

const DailyLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  
  // State untuk Show/Hide bulan
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    fetchLogs();
    fetchActiveTimer();
  }, []);

  // Update elapsed setiap detik agar score real-time terasa "hidup"
  useEffect(() => {
    let interval;
    if (activeSession) {
      interval = setInterval(() => {
        const start = new Date(activeSession.start_time).getTime();
        setElapsed(Math.floor((Date.now() - start) / 60000));
      }, 1000); 
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchActiveTimer = async () => {
    const { data } = await supabase.from('timer_states').select('*').maybeSingle();
    if (data) setActiveSession(data);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('daily_logs').select('*').order('tanggal', { ascending: false });
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Hitung Skor Real-time
  const calculateLiveScore = (prodMin, hpMin) => {
    const restMin = 1440 - prodMin - hpMin;
    return (prodMin * 2) - (hpMin * 2) + (restMin * 1);
  };

  const handleToggleTimer = async (mode) => {
    if (activeSession) {
      if (activeSession.mode !== mode) return alert(`Hentikan sesi ${activeSession.mode} dulu!`);

      const durationMinutes = Math.max(1, Math.floor((Date.now() - new Date(activeSession.start_time).getTime()) / 60000));
      const today = new Date().toISOString().split('T')[0];

      const { data: currentLog } = await supabase.from('daily_logs').select('*').eq('tanggal', today).maybeSingle();

      let finalProd = currentLog?.waktu_produktif_menit || 0;
      let finalHP = currentLog?.waktu_hp_menit || 0;

      if (mode === 'hp') finalHP += durationMinutes;
      else finalProd += durationMinutes;

      const finalScore = calculateLiveScore(finalProd, finalHP);

      const updateData = {
        waktu_hp_menit: finalHP,
        waktu_produktif_menit: finalProd,
        produktivitas_score: finalScore,
        status_hari: finalScore > 1440 ? 'Legendary' : finalScore > 1000 ? 'Optimal' : 'Sub-par'
      };

      if (currentLog) {
        await supabase.from('daily_logs').update(updateData).eq('id', currentLog.id);
      } else {
        await supabase.from('daily_logs').insert([{ tanggal: today, ...updateData }]);
      }

      await supabase.from('timer_states').delete().eq('id', activeSession.id);
      setActiveSession(null);
      setElapsed(0);
      fetchLogs();
    } else {
      const { data, error } = await supabase.from('timer_states').insert([{ mode }]).select().single();
      if (!error) setActiveSession(data);
    }
  };

  // Grouping Logs per Bulan
  const groupedLogs = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const month = new Date(log.tanggal).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[month]) groups[month] = [];
      groups[month].push(log);
    });
    return groups;
  }, [logs]);

  const toggleMonth = (month) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full text-slate-400"><ChevronLeft size={20} /></button>
        <div className="text-center">
          <h1 className="text-lg font-black italic text-cyan-500 uppercase tracking-tighter flex items-center gap-2">
            <Activity size={18} /> Performance Lab
          </h1>
        </div>
        <div className="w-10"></div>
      </div>

      {/* TACTICAL SWITCHES */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <button onClick={() => handleToggleTimer('hp')} className={`p-8 rounded-[3rem] border-2 transition-all ${activeSession?.mode === 'hp' ? 'bg-rose-500/20 border-rose-500 animate-pulse' : 'bg-slate-900 border-white/5 opacity-40'}`}>
          <Smartphone className={activeSession?.mode === 'hp' ? 'text-rose-500' : 'text-slate-500'} />
          <p className="text-[10px] font-black uppercase mt-2">Distraction</p>
          {activeSession?.mode === 'hp' && <p className="text-xl font-black mt-1">-{elapsed * 2} pts</p>}
        </button>

        <button onClick={() => handleToggleTimer('produktif')} className={`p-8 rounded-[3rem] border-2 transition-all ${activeSession?.mode === 'produktif' ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-900 border-white/5 opacity-40'}`}>
          <Zap className={activeSession?.mode === 'produktif' ? 'text-cyan-500' : 'text-slate-500'} />
          <p className="text-[10px] font-black uppercase mt-2">Deep Work</p>
          {activeSession?.mode === 'produktif' && <p className="text-xl font-black mt-1">+{elapsed * 2} pts</p>}
        </button>
      </div>

      {/* LOGS TABLE VIEW WITH SHOW/HIDE */}
      <div className="space-y-6">
        {Object.keys(groupedLogs).map(month => {
          const isTodayMonth = groupedLogs[month].some(l => l.tanggal === todayStr);
          const isExpanded = expandedMonths[month] || isTodayMonth;

          return (
            <div key={month} className="space-y-2">
              <button 
                onClick={() => !isTodayMonth && toggleMonth(month)}
                className="w-full flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{month}</span>
                {!isTodayMonth && (isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>

              {isExpanded && (
                <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40">
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead className="bg-white/5 font-black uppercase tracking-tighter text-slate-500">
                      <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-center">Focus</th>
                        <th className="p-4 text-center">Screen</th>
                        <th className="p-4 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {groupedLogs[month].map(log => {
                        const isToday = log.tanggal === todayStr;
                        // Real-time calculation for today's row
                        let liveProd = log.waktu_produktif_menit;
                        let liveHP = log.waktu_hp_menit;
                        if (isToday && activeSession) {
                          if (activeSession.mode === 'hp') liveHP += elapsed;
                          else liveProd += elapsed;
                        }
                        const currentScore = calculateLiveScore(liveProd, liveHP);

                        return (
                          <tr key={log.id} className={`${isToday ? 'bg-cyan-500/5' : ''}`}>
                            <td className="p-4 font-mono text-slate-400">{isToday ? 'TODAY' : log.tanggal.split('-')[2]}</td>
                            <td className="p-4 text-center font-bold text-cyan-500">{Math.floor(liveProd/60)}h {liveProd%60}m</td>
                            <td className="p-4 text-center font-bold text-rose-500">{Math.floor(liveHP/60)}h {liveHP%60}m</td>
                            <td className="p-4 text-right">
                              <span className={`px-2 py-1 rounded font-black ${currentScore > 1440 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {currentScore}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyLogs;