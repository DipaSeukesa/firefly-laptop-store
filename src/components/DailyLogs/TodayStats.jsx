import React, { useMemo } from 'react';
import { Target, Zap, Smartphone, Sparkles, Trophy, Flame, AlertCircle } from 'lucide-react';

const TodayStats = ({ log, activeSession, elapsed }) => {
  // --- BAGIAN LOGIKA PERHITUNGAN (MEMOIZED) ---
  const stats = useMemo(() => {
    let prod = log?.waktu_produktif_menit || 0;
    let hp = log?.waktu_hp_menit || 0;

    // 1. Tambahkan durasi dari timer aktif
    if (activeSession) {
      const elapsedMin = Math.floor(elapsed / 60000);
      activeSession.mode === 'hp' ? (hp += elapsedMin) : (prod += elapsedMin);
    }

    // 2. Ambil waktu sekarang
    const now = new Date();
    const passedMinutesToday = (now.getHours() * 60) + now.getMinutes();

    // 3. Hitung VOID (waktu yang sudah lewat tapi tidak produktif/hp)
    const voidMinutes = Math.max(0, passedMinutesToday - (prod + hp));

    // 4. Hitung REAL SISA WAKTU (24 jam - waktu yang sudah lewat)
    const realRemaining = 1440 - passedMinutesToday; // <--- SAMA DENGAN NAMA DI ATAS

    // 5. Hitung SKOR
    const score = (prod * 2) - (hp * 2) + (voidMinutes * 1);

    // 6. Persentase untuk lingkaran
    const prodPer = (prod / 1440) * 100;
    const hpPer = (hp / 1440) * 100;

    return { prod, hp, voidMinutes, realRemaining, score, prodPer, hpPer, passedMinutesToday };
  }, [log, activeSession, elapsed]);

  // --- BAGIAN AFIRMASI OTOMATIS ---
  const getAffirmation = () => {
    if (stats.score > 1650) return {
      text: "MODE DEWA: Produktivitas Tak Terhentikan!",
      color: "text-cyan-400",
      icon: <Trophy className="text-cyan-400" size={16} />,
      bg: "bg-cyan-500/10"
    };
    if (stats.score > 1440) return {
      text: "Kerja Bagus! Kamu menguasai hari ini.",
      color: "text-emerald-400",
      icon: <Flame className="text-emerald-400" size={16} />,
      bg: "bg-emerald-500/10"
    };
    if (stats.hp > stats.prod) return {
      text: "Distraksi Menang. Ambil kendali sekarang!",
      color: "text-rose-400",
      icon: <AlertCircle className="text-rose-400" size={16} />,
      bg: "bg-rose-500/10"
    };
    return {
      text: "Hari ini masih bisa kamu bentuk. Semangat!",
      color: "text-slate-400",
      icon: <Sparkles className="text-slate-400" size={16} />,
      bg: "bg-white/5"
    };
  };

  const affirmation = getAffirmation();

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-[3.5rem] p-8 mb-8 relative overflow-hidden backdrop-blur-xl">
      {/* Dekorasi Cahaya Latar */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 blur-[80px] rounded-full" />

      <div className="flex flex-col items-center relative z-10">

        {/* CONTAINER GRAFIK UTAMA */}
        <div className="relative w-full flex items-center justify-center py-10 mb-2">

          {/* SVG GRAFIK LINGKARAN */}
          <div className="relative flex items-center justify-center">
            <svg className="w-52 h-52 transform -rotate-90">
              {/* Background Circle */}
              <circle cx="104" cy="104" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800/30" />

              {/* Circle Fokus (Produktif) */}
              <circle
                cx="104" cy="104" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray={552.6}
                strokeDashoffset={552.6 - (552.6 * stats.prodPer) / 100}
                className="text-cyan-500 transition-all duration-1000"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.4))' }}
              />

              {/* Circle Layar (HP) */}
              <circle
                cx="104"
                cy="104"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={552.6} // Cukup tulis satu kali di sini
                strokeDashoffset={552.6 - (552.6 * stats.hpPer) / 100}
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${(stats.prodPer / 100) * 360}deg)`,
                  filter: 'drop-shadow(0 0 12px rgba(244, 63, 94, 0.3))'
                }}
                className="text-rose-500 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>

            {/* Skor di Tengah */}
            <div className="absolute flex flex-col items-center">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5">Live Score</p>
              <h2 className="text-5xl font-black italic tracking-tighter text-white">
                {stats.score}
              </h2>
              <Sparkles size={14} className="text-cyan-500/50 mt-1" />
            </div>
          </div>

          {/* 2. LABEL KIRI: FOKUS (Sekarang di bawah SVG dalam kode = tampil di depan) */}
          <div className="absolute left-0 top-1/2 -translate-y-full flex flex-col items-end group z-20">
            <div className="flex items-center gap-2 mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span className="text-[14px] font-black text-white font-mono">{Math.floor(stats.prod / 60)}j {stats.prod % 60}m</span>
              <Zap size={14} className="text-cyan-500" />
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest drop-shadow-sm">Waktu Fokus</p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-cyan-500/50 to-transparent mt-2" />
          </div>

          {/* 3. LABEL KANAN: LAYAR */}
          <div className="absolute right-0 top-1/2 -translate-y-full flex flex-col items-start group z-20">
            <div className="flex items-center gap-2 mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <Smartphone size={14} className="text-rose-500" />
              <span className="text-[14px] font-black text-white font-mono">{Math.floor(stats.hp / 60)}j {stats.hp % 60}m</span>
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest drop-shadow-sm">Waktu Layar</p>
            <div className="h-[1px] w-12 bg-gradient-to-r from-rose-500/50 to-transparent mt-2" />
          </div>

          {/* 4. LABEL BAWAH: SISA WAKTU */}
          <div className="absolute bottom-0 flex flex-col items-center z-20">
            <div className="h-8 w-[1px] bg-gradient-to-b from-slate-500/30 to-transparent mb-2" />
            <div className="flex items-center gap-2 drop-shadow-md">
              <Target size={12} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-300 font-mono">
                {Math.floor(stats.realRemaining / 60)}j {stats.realRemaining % 60}m Tersisa
              </span>
            </div>
          </div>


        </div>

        {/* BOX AFIRMASI */}
        <div className={`w-full ${affirmation.bg} border border-white/5 rounded-3xl p-4 mt-6 flex items-center justify-center gap-3 backdrop-blur-md`}>
          {affirmation.icon}
          <p className={`text-[11px] font-black uppercase tracking-tight italic ${affirmation.color}`}>
            {affirmation.text}
          </p>
        </div>

      </div>
    </div>
  );
};

export default TodayStats;