import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import LogHeader from '../components/DailyLogs/LogHeader';
import TimerSwitches from '../components/DailyLogs/TimerSwitches';
import MonthlyTable from '../components/DailyLogs/MonthlyTable';
import TodayStats from '../components/DailyLogs/TodayStats';

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
  
      // --- LOGIKA WAKTU GMT+8 (WITA) ---
      const getWitaDate = (dateObj) => {
        // Menggeser waktu ke GMT+8 untuk kalkulasi tanggal yang akurat
        const witaOffset = 8 * 60 * 60 * 1000;
        return new Date(dateObj.getTime() + witaOffset);
      };
  
      const now = new Date();
      const startTime = new Date(activeSession.start_time);
      
      // String tanggal format YYYY-MM-DD sesuai WITA
      const startDateStr = startTime.toISOString().split('T')[0];
      const todayDateStr = now.toISOString().split('T')[0];
  
      const durationTotal = Math.max(1, Math.floor((now.getTime() - startTime.getTime()) / 60000));
  
      // --- LOGIKA CROSS MIDNIGHT (LINTAS HARI) ---
      // Jika hari ini berbeda dengan hari mulai, kita pecah durasinya
      const processSession = async (targetDate, addedDuration) => {
        // Ambil data yang sudah ada di database untuk tanggal tersebut
        const { data: current } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('tanggal', targetDate)
          .maybeSingle();
  
        let fProd = current?.waktu_produktif_menit || 0;
        let fHP = current?.waktu_hp_menit || 0;
        mode === 'hp' ? (fHP += addedDuration) : (fProd += addedDuration);
  
        // HitungpassedMinutes: Jika targetDate adalah hari ini, pakai waktu sekarang.
        // Jika targetDate adalah kemarin, berarti sudah full 1440 menit.
        const isTargetToday = targetDate === todayDateStr;
        const passedMinutes = isTargetToday 
          ? (now.getHours() * 60) + now.getMinutes() 
          : 1440;
  
        const currentVoid = Math.max(0, passedMinutes - fProd - fHP);
        const fScore = (fProd * 2) - (fHP * 2) + (currentVoid * 1);
  
        const payload = {
          tanggal: targetDate,
          waktu_hp_menit: fHP,
          waktu_produktif_menit: fProd,
          produktivitas_score: fScore,
          status_hari: fScore >= passedMinutes ? 'Optimal' : 'Distracted'
        };
  
        // Gunakan UPSERT untuk mencegah duplikasi
        await supabase.from('daily_logs').upsert(payload, { onConflict: 'tanggal' });
      };
  
      if (startDateStr !== todayDateStr) {
        // Skenario Lintas Hari:
        // 1. Hitung sisa menit di hari pertama (sampai 23:59)
        const endOfDay = new Date(startTime);
        endOfDay.setHours(23, 59, 59, 999);
        const durationDay1 = Math.floor((endOfDay.getTime() - startTime.getTime()) / 60000);
        
        // 2. Sisa menit masuk ke hari kedua
        const durationDay2 = durationTotal - durationDay1;
  
        await processSession(startDateStr, durationDay1);
        await processSession(todayDateStr, durationDay2);
      } else {
        // Skenario Normal (Satu hari yang sama)
        await processSession(todayDateStr, durationTotal);
      }
  
      // Bersihkan sesi
      await supabase.from('timer_states').delete().eq('id', activeSession.id);
      setActiveSession(null);
      setElapsed(0);
      fetchLogs();
      
    } else {
      // START TIMER: Simpan waktu mulai dalam UTC (ISO String)
      const { data, error } = await supabase
        .from('timer_states')
        .insert([{ mode, start_time: new Date().toISOString() }])
        .select()
        .single();
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