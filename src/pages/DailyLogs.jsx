import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import LogHeader from '../components/logs/LogHeader';
import TimerSwitches from '../components/logs/TimerSwitches';
import MonthlyTable from '../components/logs/MonthlyTable';
import TodayStats from '../components/logs/TodayStats';

const DailyLogs = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [expandedMonths, setExpandedMonths] = useState({});
  const todayLog = logs.find(l => l.tanggal === todayStr);

  useEffect(() => {
    fetchLogs();
    fetchActiveTimer();
  }, []);

  // Ganti interval dari 10000 (10 detik) ke 1000 (1 detik)
  useEffect(() => {
    let interval;
    if (activeSession) {
      interval = setInterval(() => {
        const start = new Date(activeSession.start_time).getTime();
        setElapsed(Date.now() - start); // Simpan dalam milidetik
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchActiveTimer = async () => {
    const { data } = await supabase.from('timer_states').select('*').maybeSingle();
    if (data) {
      setActiveSession(data);
      setElapsed(Date.now() - new Date(data.start_time).getTime()); // Simpan dalam milidetik
    }
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

  const handleToggleTimer = async (mode) => {
    if (activeSession) {
      if (activeSession.mode !== mode) return alert(`Hentikan sesi ${activeSession.mode} dulu!`);
  
      const duration = Math.max(1, Math.floor((Date.now() - new Date(activeSession.start_time).getTime()) / 60000));
      const { data: current } = await supabase.from('daily_logs').select('*').eq('tanggal', todayStr).maybeSingle();
  
      let fProd = current?.waktu_produktif_menit || 0;
      let fHP = current?.waktu_hp_menit || 0;
      mode === 'hp' ? fHP += duration : fProd += duration;
  
      // --- LOGIKA SKOR DINAMIS ---
      // 1. Hitung berapa menit yang sudah terlewati dari jam 00:00 sampai detik ini
      const now = new Date();
      const passedMinutesToday = (now.getHours() * 60) + now.getMinutes();
  
      // 2. Hitung waktu "Sisa/Void" hanya dari waktu yang sudah berjalan (bukan 1440)
      const currentVoid = Math.max(0, passedMinutesToday - fProd - fHP);
  
      // 3. Kalkulasi Skor: Produktif (+2), HP (-2), Void (+1)
      const fScore = (fProd * 2) - (fHP * 2) + (currentVoid * 1);
      
      // Tentukan status berdasarkan rata-rata skor positif (1.0 adalah netral/void)
      const payload = { 
        waktu_hp_menit: fHP, 
        waktu_produktif_menit: fProd, 
        produktivitas_score: fScore, 
        status_hari: fScore >= passedMinutesToday ? 'Optimal' : 'Distracted' 
      };
      // ----------------------------
  
      if (current) await supabase.from('daily_logs').update(payload).eq('id', current.id);
      else await supabase.from('daily_logs').insert([{ tanggal: todayStr, ...payload }]);
  
      await supabase.from('timer_states').delete().eq('id', activeSession.id);
      setActiveSession(null);
      setElapsed(0);
      fetchLogs();
    } else {
      const { data, error } = await supabase.from('timer_states').insert([{ mode }]).select().single();
      if (!error) setActiveSession(data);
    }
  };

  const deleteLog = async (id) => {
    if (window.confirm("Hapus data audit?")) {
      await supabase.from('daily_logs').delete().eq('id', id);
      fetchLogs();
    }
  };

  const groupedLogs = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const month = new Date(log.tanggal).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[month]) groups[month] = [];
      groups[month].push(log);
    });
    return groups;
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-32">
      <LogHeader />

      <TodayStats
        log={todayLog}
        activeSession={activeSession}
        elapsed={elapsed}
      />

      <TimerSwitches
        activeSession={activeSession}
        elapsed={elapsed}
        onToggle={handleToggleTimer}
      />

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-slate-700 font-black uppercase text-xs">Accessing Logs...</div>
        ) : (
          Object.keys(groupedLogs).map(month => (
            <MonthlyTable
              key={month}
              month={month}
              logs={groupedLogs[month]}
              todayStr={todayStr}
              activeSession={activeSession}
              elapsed={elapsed}
              isExpanded={expandedMonths[month] || groupedLogs[month].some(l => l.tanggal === todayStr)}
              onToggle={() => setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }))}
              onDelete={deleteLog}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DailyLogs;