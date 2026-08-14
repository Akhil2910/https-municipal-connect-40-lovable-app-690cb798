import { useEffect, useRef } from "react";

type Props = {
  /** Show fireworks bursts */
  fireworks?: boolean;
  /** Show falling flower petals */
  flowers?: boolean;
  /** Milliseconds the celebration runs (0 = forever) */
  duration?: number;
};

type Particle = {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
  kind: "spark" | "petal"; rot: number; vr: number;
};

const SPARK_COLORS = ["#ff9933", "#ffffff", "#138808", "#ffd700", "#ff4d4d", "#66d9ff"];
const PETAL_COLORS = ["#ff8fa3", "#ffc6d0", "#ffd166", "#fff1a8", "#ff9933", "#f7f7f7"];

/** Fireworks + flower shower overlay. Purely decorative, non-interactive. */
export function Celebration({ fireworks = true, flowers = true, duration = 9000 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const parts: Particle[] = [];
    const start = performance.now();
    let raf = 0;

    const burst = (bx: number, by: number) => {
      const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]!;
      const n = 46 + Math.floor(Math.random() * 30);
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
        const sp = 2 + Math.random() * 4.5;
        parts.push({
          x: bx, y: by, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 0, maxLife: 55 + Math.random() * 35,
          color: Math.random() < 0.25
            ? SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]!
            : color,
          size: 1.5 + Math.random() * 2, kind: "spark", rot: 0, vr: 0,
        });
      }
    };

    const petal = () => {
      parts.push({
        x: Math.random() * w, y: -20,
        vx: -0.6 + Math.random() * 1.2, vy: 1 + Math.random() * 1.8,
        life: 0, maxLife: 600,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]!,
        size: 5 + Math.random() * 6, kind: "petal",
        rot: Math.random() * Math.PI, vr: -0.05 + Math.random() * 0.1,
      });
    };

    let fireTimer: number | undefined;
    let petalTimer: number | undefined;
    if (fireworks) {
      burst(w * 0.3, h * 0.35);
      burst(w * 0.7, h * 0.28);
      fireTimer = window.setInterval(() => {
        burst(w * (0.15 + Math.random() * 0.7), h * (0.15 + Math.random() * 0.4));
      }, 650);
    }
    if (flowers) {
      for (let i = 0; i < 30; i++) petal();
      petalTimer = window.setInterval(() => { for (let i = 0; i < 3; i++) petal(); }, 180);
    }

    const stop = () => {
      if (fireTimer) window.clearInterval(fireTimer);
      if (petalTimer) window.clearInterval(petalTimer);
      fireTimer = petalTimer = undefined;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (duration && performance.now() - start > duration) stop();
      ctx.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]!;
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        if (p.kind === "spark") {
          p.vy += 0.045;
          p.vx *= 0.985;
          p.vy *= 0.985;
        } else {
          p.vx += Math.sin((p.life + p.size) / 25) * 0.02;
          p.rot += p.vr;
          if (p.y > h + 30) { parts.splice(i, 1); continue; }
        }
        if (p.life > p.maxLife) { parts.splice(i, 1); continue; }
        const alpha = p.kind === "spark" ? Math.max(0, 1 - p.life / p.maxLife) : 0.9;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        if (p.kind === "spark") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      stop();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [fireworks, flowers, duration]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[120]"
    />
  );
}
