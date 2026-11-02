/**
 * Light rain over the hero: thin slanted streaks on a 2D canvas, no libraries.
 * Pauses when the hero is off screen or the tab is hidden. With reduced motion it draws nothing.
 */
let stopRain;
function mountRain(hero) {
    stopRain?.();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return false;
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-rain';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return false;
    hero.prepend(canvas);
    let w = 0;
    let h = 0;
    let drops = [];
    const make = (initial) => ({
        x: Math.random() * (w + 80) - 40,
        y: initial ? Math.random() * h : -20 - Math.random() * 60,
        len: 10 + Math.random() * 16,
        v: 520 + Math.random() * 380,
        a: 0.1 + Math.random() * 0.22,
    });
    const resize = () => {
        w = canvas.width = hero.clientWidth;
        h = canvas.height = hero.clientHeight;
        const count = Math.round(Math.min(140, (w * h) / 9000));
        drops = Array.from({ length: count }, () => make(true));
    };
    resize();
    window.addEventListener('resize', resize);
    let visible = true;
    const io = new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? true; });
    io.observe(hero);
    const slant = 0.22;
    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
        if (!canvas.isConnected) {
            stop();
            return;
        }
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (visible && !document.hidden) {
            ctx.clearRect(0, 0, w, h);
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            for (const d of drops) {
                d.y += d.v * dt;
                d.x += d.v * slant * dt;
                if (d.y > h || d.x > w + 40)
                    Object.assign(d, make(false));
                ctx.strokeStyle = `rgba(190, 210, 235, ${d.a})`;
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x - d.len * slant, d.y - d.len);
                ctx.stroke();
            }
        }
        raf = requestAnimationFrame(frame);
    };
    function stop() {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        io.disconnect();
        stopRain = undefined;
    }
    stopRain = stop;
    raf = requestAnimationFrame(frame);
    return true;
}

export { mountRain };
