// UrbanSafe AI - Celebratory Paper Confetti / Paper Blast Engine
// Lightweight, high-performance, zero-dependency HTML5 Canvas particle explosion

export function triggerConfettiBlast(options = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve();
  }

  const {
    originX = 0.5, // Center of viewport horizontally (0.0 to 1.0)
    originY = 0.5, // Center of viewport vertically
    particleCount = 110,
    durationMs = 1800,
    colors = [
      '#00f2fe', // Neon Cyan
      '#38bdf8', // Sky Blue
      '#3b82f6', // Electric Blue
      '#818cf8', // Indigo
      '#a855f7', // Purple
      '#ec4899', // Pink
      '#10b981', // Emerald
      '#f59e0b', // Amber Gold
      '#ffffff'  // Pure White shimmer
    ]
  } = options;

  return new Promise((resolve) => {
    // Create or reuse overlay canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'urbansafe-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '100000';
    if (!canvas || typeof canvas.getContext !== 'function') {
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      resolve();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      resolve();
      return;
    }

    let width = (canvas.width = window.innerWidth * (window.devicePixelRatio || 1));
    let height = (canvas.height = window.innerHeight * (window.devicePixelRatio || 1));

    const handleResize = () => {
      width = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      height = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    };
    window.addEventListener('resize', handleResize);

    const dpr = window.devicePixelRatio || 1;
    const startX = width * originX;
    const startY = height * originY;

    // Particle types: paper rectangles, ribbons, stars, circles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 12 + 6) * dpr;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const type = Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'ribbon' : 'circle';

      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 6 + 4) * dpr, // Upward initial thrust
        size: (Math.random() * 8 + 6) * dpr,
        width: (Math.random() * 10 + 8) * dpr,
        height: (Math.random() * 6 + 4) * dpr,
        color: color,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.15 + 0.05,
        opacity: 1,
        type: type,
        drag: 0.94 + Math.random() * 0.03, // Air resistance
        gravity: 0.28 * dpr // Realistic paper falling gravity
      });
    }

    const startTime = performance.now();
    let animationFrameId;

    function render(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        // Fade out during the last 35% of the animation
        if (progress > 0.65) {
          p.opacity = Math.max(0, 1 - (progress - 0.65) / 0.35);
        }

        if (p.opacity > 0 && p.y < height + 50) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(Math.cos(p.wobble), 1); // 3D paper fluttering effect

          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          if (p.type === 'rect') {
            ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
          } else if (p.type === 'ribbon') {
            ctx.beginPath();
            ctx.roundRect
              ? ctx.roundRect(-p.width * 0.7, -p.height * 0.4, p.width * 1.4, p.height * 0.8, 3)
              : ctx.rect(-p.width * 0.7, -p.height * 0.4, p.width * 1.4, p.height * 0.8);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      if (progress < 1 && aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cleanup();
      }
    }

    function cleanup() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      resolve();
    }

    animationFrameId = requestAnimationFrame(render);
  });
}
