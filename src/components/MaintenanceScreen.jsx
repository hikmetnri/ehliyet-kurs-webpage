import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, Home, LogIn, LogOut, RefreshCw, ShieldCheck, Wrench } from 'lucide-react';

const PARTICLE_COLORS = [
  '255,255,255',
  '34,211,238',
  '251,191,36',
  '52,211,153',
];

const MaintenanceCanvas = () => {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const particles = [];
    const bursts = [];
    let width = 0;
    let height = 0;
    let frameId = 0;

    const createParticle = (x = Math.random() * width, y = Math.random() * height) => {
      const speed = 0.18 + Math.random() * 0.42;
      const angle = Math.random() * Math.PI * 2;
      return {
        x,
        y,
        baseVx: Math.cos(angle) * speed,
        baseVy: Math.sin(angle) * speed,
        vx: Math.cos(angle) * speed * 0.4,
        vy: Math.sin(angle) * speed * 0.4,
        radius: 0.9 + Math.random() * 2.5,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        alpha: 0.42 + Math.random() * 0.5,
      };
    };

    const rebuildParticles = () => {
      particles.length = 0;
      const count = Math.min(240, Math.max(130, Math.floor((width * height) / 8200)));
      for (let i = 0; i < count; i += 1) {
        particles.push(createParticle());
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildParticles();
    };

    const setPointer = (x, y, active = true) => {
      pointerRef.current = { x, y, active };
    };

    const handleMouseMove = (event) => setPointer(event.clientX, event.clientY);
    const handleMouseLeave = () => setPointer(-9999, -9999, false);
    const handleTouchMove = (event) => {
      const touch = event.touches?.[0];
      if (touch) setPointer(touch.clientX, touch.clientY);
    };
    const handleClick = (event) => {
      for (let i = 0; i < 18; i += 1) {
        const angle = (Math.PI * 2 * i) / 18;
        const speed = 2 + Math.random() * 3.5;
        bursts.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        });
      }
    };

    const drawLinks = () => {
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 128) continue;

          const opacity = (1 - distance / 128) * 0.28;
          ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    };

    const updateParticles = () => {
      const pointer = pointerRef.current;

      particles.forEach((particle) => {
        if (pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 220 && distance > 0.01) {
            const force = (1 - distance / 220) * 4.4;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        }

        particle.vx *= 0.94;
        particle.vy *= 0.94;
        particle.x += particle.baseVx + particle.vx;
        particle.y += particle.baseVy + particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        ctx.fillStyle = `rgba(${particle.color},${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawPointerHalo = () => {
      const pointer = pointerRef.current;
      if (!pointer.active) return;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180);
      halo.addColorStop(0, 'rgba(34,211,238,0.16)');
      halo.addColorStop(0.45, 'rgba(251,191,36,0.06)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawBursts = () => {
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const spark = bursts[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.96;
        spark.vy *= 0.96;
        spark.life -= 0.024;

        if (spark.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(${spark.color},${spark.life})`;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 2.2 + spark.life * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.72);
      vignette.addColorStop(0, 'rgba(255,255,255,0.03)');
      vignette.addColorStop(0.58, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      drawLinks();
      updateParticles();
      drawPointerHalo();
      drawBursts();

      frameId = requestAnimationFrame(draw);
    };

    resize();
    frameId = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
};

const MaintenanceScreen = ({ onLogout, onAdminAccess }) => {
  const statusItems = [
    { icon: Clock3, label: 'Kısa Süreli', value: 'Bakım devam ediyor', tone: 'text-amber-300 border-amber-400/20 bg-amber-400/10' },
    { icon: ShieldCheck, label: 'Veriler Güvende', value: 'Hesabınız korunuyor', tone: 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10' },
    { icon: RefreshCw, label: 'Yenileniyor', value: 'Daha stabil deneyim', tone: 'text-cyan-300 border-cyan-400/20 bg-cyan-400/10' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-8 text-white sm:px-6 lg:px-10">
      <MaintenanceCanvas />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_50%_78%,rgba(251,191,36,0.10),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent" />

      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl border border-white/15 bg-white shadow-2xl shadow-cyan-400/20 [animation:maintenanceSpin_8s_linear_infinite]">
          <img src="/logo_v2.png" alt="Ehliyet Yolu" className="h-24 w-24 object-contain" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-100 shadow-lg shadow-cyan-400/10">
          <Wrench className="h-4 w-4" />
          Bakım modu aktif
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-[0.12em] text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.45)] sm:text-6xl lg:text-7xl">
          SISTEM BAKIMDA
        </h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/68 sm:text-lg">
          Ehliyet Yolu kısa bir bakım sürecinde. Öğrenci paneli geçici olarak kapalı, verileriniz güvende.
        </p>

        <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-white/10 bg-black/45 p-4 shadow-xl shadow-black/30 backdrop-blur">
                <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-black">{item.label}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/48">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-cyan-100"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          )}
          {onAdminAccess && (
            <button
              type="button"
              onClick={onAdminAccess}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-cyan-100"
            >
              <LogIn className="h-4 w-4" />
              Yönetici Girişi
            </button>
          )}
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.12]"
          >
            <Home className="h-4 w-4" />
            Ana Sayfa
          </Link>
        </div>

        <style>{`
          @keyframes maintenanceSpin {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
          }
        `}</style>
      </main>
    </div>
  );
};

export default MaintenanceScreen;
