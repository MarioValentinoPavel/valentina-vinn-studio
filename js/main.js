// Valentina Vinn · «Camerino»: las bombillas del espejo se encienden una a una al cargar y el retrato se ilumina;
// las que quedan cerca del cursor brillan más. «Otro look» (o cada pocos segundos) parpadea la luz y cambia el retrato.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const has = () => typeof gsap !== 'undefined' && !reduce;

  function mirror() {
    const hero = document.getElementById('looks'), mir = document.getElementById('mirror'), box = document.getElementById('bulbs');
    const looks = [...mir.querySelectorAll('.lk')], num = document.getElementById('lkN'), glass = mir.querySelector('.glass');
    let bulbs = [], pts = [], cur = 0, hover = false, vis = true, timer;

    // bombillas a lo largo de los lados y de arriba, en el margen del marco
    const build = () => {
      const w = mir.offsetWidth, h = mir.offsetHeight, p = parseFloat(getComputedStyle(mir).getPropertyValue('--p')) || 30, gap = w < 360 ? 34 : 44;
      const top = Math.max(2, Math.round((w - p) / gap)), side = Math.max(2, Math.round((h - p * 1.6) / gap));
      pts = [];
      for (let i = side; i >= 1; i--) pts.push([p / 2, p / 2 + (h - p * 1.6) * i / side]); // izquierda, de abajo arriba
      for (let i = 0; i <= top; i++) pts.push([p / 2 + (w - p) * i / top, p / 2]); // arriba
      for (let i = 1; i <= side; i++) pts.push([w - p / 2, p / 2 + (h - p * 1.6) * i / side]); // derecha, de arriba abajo
      box.innerHTML = pts.map(([x, y]) => `<span class="bulb" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px"></span>`).join('');
      bulbs = [...box.children]; bulbs.forEach((b) => (b._g = .5));
    };
    build();
    let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 120); }).observe(mir);

    // encendido al cargar
    if (has()) {
      mir.style.setProperty('--lit', 0); bulbs.forEach((b) => b.style.setProperty('--on', 0));
      const tl = gsap.timeline({ scrollTrigger: { trigger: mir, start: 'top 75%' } });
      bulbs.forEach((b, i) => tl.to(b, { keyframes: [{ '--on': 1, duration: .05 }, { '--on': .25, duration: .06 }, { '--on': 1, duration: .1 }] }, i * .03));
      tl.to(mir, { '--lit': 1, duration: 1.1, ease: 'power2.out' }, .35);
      gsap.fromTo('.name span', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: .035, delay: .1 });
      gsap.fromTo('#campImg img', { scale: 1.18 }, { scale: 1, duration: 2.8, ease: 'expo.out' });
      gsap.to('#campImg img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo(mir, { y: 60, rotate: 1.5 }, { y: 0, rotate: 0, duration: 1.6, ease: 'expo.out' });
      gsap.to('.name', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    // las bombillas cercanas al cursor brillan más; el reflejo del cristal se desliza
    if (fine && !reduce) {
      hero.addEventListener('pointermove', (e) => {
        const r = mir.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        bulbs.forEach((b, i) => { const d = Math.hypot(pts[i][0] - x, pts[i][1] - y), g = .45 + .55 * Math.exp(-(d * d) / 18000); if (Math.abs(g - b._g) > .02) { b._g = g; b.style.setProperty('--g', g.toFixed(2)); } });
        glass.style.setProperty('--rx', `${((e.clientX / innerWidth) - .5) * 60}px`);
      });
      mir.addEventListener('pointerenter', () => (hover = true));
      mir.addEventListener('pointerleave', () => (hover = false));
    }

    // cambio de look con un parpadeo de luz
    const show = (i) => {
      cur = (i + looks.length) % looks.length; num.textContent = String(cur + 1).padStart(2, '0');
      const swap = () => looks.forEach((l, k) => { l.classList.toggle('on', k === cur); l.setAttribute('aria-hidden', k !== cur); });
      if (!has()) { swap(); return; }
      const tl = gsap.timeline();
      tl.to(mir, { '--lit': .45, duration: .14, ease: 'power1.in' }).add(swap).to(mir, { '--lit': 1, duration: .7, ease: 'power2.out' });
      gsap.utils.shuffle(bulbs.slice()).slice(0, 6).forEach((b) => gsap.to(b, { keyframes: [{ '--on': .2, duration: .05 }, { '--on': 1, duration: .08 }, { '--on': .4, duration: .05 }, { '--on': 1, duration: .12 }], delay: Math.random() * .2 }));
    };
    looks.forEach((l, k) => k && l.setAttribute('aria-hidden', true));
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => { if (vis && !hover && !document.hidden) show(cur + 1); }, 5200); };
    document.getElementById('next').addEventListener('click', () => { show(cur + 1); restart(); });
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(hero);
    restart();
  }

  function motion() {
    if (!has()) return;
    gsap.fromTo('#lashImg img', { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#lashImg', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.big span', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.big', start: 'top 85%' } });
  }

  function init() { mirror(); motion(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
