// STONES TO STARS — Makwana Official Franchise Experience
// Three.js Atmospheric Rig, GSAP Scroll Engine & Interactive Multi-Page Systems

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Speed Insights (production Core Web Vitals telemetry)
injectSpeedInsights();

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════════════════════
     1. LENIS SMOOTH SCROLL & IN-PAGE ANCHOR HANDLING
     ══════════════════════════════════════════════════════════════ */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.2,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth scroll on anchor clicks
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: -70, duration: 1.3 });
      }
    });
  });

  /* ══════════════════════════════════════════════════════════════
     2. THREE.JS LIVING BACKGROUND & PARTICLE ATMOSPHERE
     ══════════════════════════════════════════════════════════════ */
  const canvas = document.getElementById('living-world-canvas');
  if (canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffd79e, 1.4);
    sunLight.position.set(5, 8, 10);
    scene.add(sunLight);

    // Texture Loader & Crossfade Setup
    const textureLoader = new THREE.TextureLoader();
    const texCache = {};

    const planeGroup = new THREE.Group();
    scene.add(planeGroup);

    const aspect = 16 / 9;
    const height = 18;
    const width = height * aspect;
    const bgGeo = new THREE.PlaneGeometry(width, height);

    const matA = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 });
    const bgMeshA = new THREE.Mesh(bgGeo, matA);
    bgMeshA.position.set(0, 0, -8);
    planeGroup.add(bgMeshA);

    const matB = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const bgMeshB = new THREE.Mesh(bgGeo, matB);
    bgMeshB.position.set(0, 0, -7.99);
    planeGroup.add(bgMeshB);

    let activeBg = 'A';
    let currentBgKey = 'hero';

    const loadTexture = (path, key) => {
      textureLoader.load(path, (tex) => {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        texCache[key] = tex;
        if (key === 'hero' && activeBg === 'A') {
          bgMeshA.material.map = tex;
          bgMeshA.material.needsUpdate = true;
        }
      });
    };

    loadTexture('public/assets/hero_bg.jpg', 'hero');
    loadTexture('public/assets/biome_forest.jpg', 'forest');
    loadTexture('public/assets/biome_plains.jpg', 'plains');
    loadTexture('public/assets/biome_desert.jpg', 'desert');
    loadTexture('public/assets/biome_snow.jpg', 'snow');
    loadTexture('public/assets/cinder_threat.jpg', 'cinder');
    loadTexture('public/assets/world_galaxies.jpg', 'stars');

    const envOverlay = document.getElementById('env-lighting-overlay');

    window.crossfadeBg = function(key, duration = 0.9, targetOpacity = 0.95) {
      if (currentBgKey === key && ((activeBg === 'A' && bgMeshA.material.opacity > 0.5) || (activeBg === 'B' && bgMeshB.material.opacity > 0.5))) return;
      const tex = texCache[key];
      if (!tex) return;

      currentBgKey = key;
      if (activeBg === 'A') {
        bgMeshB.material.map = tex;
        bgMeshB.material.needsUpdate = true;
        gsap.to(bgMeshA.material, { opacity: 0, duration, ease: 'power2.out' });
        gsap.to(bgMeshB.material, { opacity: targetOpacity, duration, ease: 'power2.out' });
        activeBg = 'B';
      } else {
        bgMeshA.material.map = tex;
        bgMeshA.material.needsUpdate = true;
        gsap.to(bgMeshB.material, { opacity: 0, duration, ease: 'power2.out' });
        gsap.to(bgMeshA.material, { opacity: targetOpacity, duration, ease: 'power2.out' });
        activeBg = 'A';
      }
    };

    // Particle System with Environmental Palette Shifting
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const particleTheme = { r: 0.95, g: 0.65, b: 0.25 };
    window.setParticleTheme = function(r, g, b, duration = 0.8) {
      gsap.to(particleTheme, { r, g, b, duration, ease: 'power2.out' });
    };

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      colors[i * 3] = 0.95;
      colors[i * 3 + 1] = 0.65;
      colors[i * 3 + 2] = 0.25;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Render Loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Parallax damping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      planeGroup.rotation.y = mouse.x * 0.03;
      planeGroup.rotation.x = -mouse.y * 0.02;
      planeGroup.position.x = mouse.x * 0.35;
      planeGroup.position.y = mouse.y * 0.25;

      // Particle drift & color morph
      const posAttr = particleGeo.attributes.position;
      const colAttr = particleGeo.attributes.color;

      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i);
        y += 0.02 + Math.sin(time + i) * 0.004;
        if (y > 11) y = -11;
        posAttr.setY(i, y);

        let x = posAttr.getX(i);
        x += Math.sin(time * 0.4 + i) * 0.006;
        posAttr.setX(i, x);

        const curR = colAttr.getX(i);
        const curG = colAttr.getY(i);
        const curB = colAttr.getZ(i);
        colAttr.setXYZ(
          i,
          curR + (particleTheme.r - curR) * 0.05,
          curG + (particleTheme.g - curG) * 0.05,
          curB + (particleTheme.b - curB) * 0.05
        );
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Homepage ScrollTriggers if on index.html
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top 50%',
        onEnter: () => {
          if (window.crossfadeBg) window.crossfadeBg('hero', 1.0, 0.95);
          if (window.setParticleTheme) window.setParticleTheme(0.95, 0.65, 0.25);
        },
        onEnterBack: () => {
          if (window.crossfadeBg) window.crossfadeBg('hero', 1.0, 0.95);
          if (window.setParticleTheme) window.setParticleTheme(0.95, 0.65, 0.25);
        }
      });

      const season01Sec = document.getElementById('season-01');
      if (season01Sec) {
        ScrollTrigger.create({
          trigger: '#season-01',
          start: 'top 60%',
          onEnter: () => {
            if (window.crossfadeBg) window.crossfadeBg('cinder', 0.9, 0.85);
            if (window.setParticleTheme) window.setParticleTheme(0.95, 0.4, 0.15);
          },
          onLeaveBack: () => {
            if (window.crossfadeBg) window.crossfadeBg('hero', 0.9, 0.95);
            if (window.setParticleTheme) window.setParticleTheme(0.95, 0.65, 0.25);
          }
        });
      }

      const whatsNextSec = document.getElementById('whats-next');
      if (whatsNextSec) {
        ScrollTrigger.create({
          trigger: '#whats-next',
          start: 'top 60%',
          onEnter: () => {
            if (window.crossfadeBg) window.crossfadeBg('stars', 1.2, 0.65);
            if (window.setParticleTheme) window.setParticleTheme(0.5, 0.8, 1.0, 1.2);
          },
          onLeaveBack: () => {
            if (window.crossfadeBg) window.crossfadeBg('hero', 1.0, 0.95);
            if (window.setParticleTheme) window.setParticleTheme(0.95, 0.65, 0.25);
          }
        });
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════
     3. WORLD & BIOME INTERACTIVE ENGINE (world.html)
     ══════════════════════════════════════════════════════════════ */
  const biomePanels = document.querySelectorAll('.biome-card-panel');
  const mapActiveStatus = document.getElementById('map-active-status');

  const biomeThemes = {
    forest: {
      key: 'forest',
      status: 'Active Sector: <strong>Forest Canopy</strong> · Dense Pine Woods & Riverbeds',
      color: [0.45, 0.85, 0.35]
    },
    plains: {
      key: 'plains',
      status: 'Active Sector: <strong>Golden Plains</strong> · Steppe Grasslands & Mammoth Migration',
      color: [0.95, 0.82, 0.35]
    },
    desert: {
      key: 'desert',
      status: 'Active Sector: <strong>Sandstone Desert</strong> · Arid Canyon Gorges & Obsidian Crags',
      color: [0.95, 0.45, 0.2]
    },
    snow: {
      key: 'snow',
      status: 'Active Sector: <strong>Frozen Peaks</strong> · Glacial Summit & Sub-Zero Blizzards',
      color: [0.65, 0.88, 1.0]
    }
  };

  biomePanels.forEach((panel) => {
    panel.addEventListener('click', () => {
      biomePanels.forEach(p => p.classList.remove('active'));
      panel.classList.add('active');

      const biomeKey = panel.getAttribute('data-biome');
      const cfg = biomeThemes[biomeKey];
      if (cfg) {
        if (mapActiveStatus) mapActiveStatus.innerHTML = cfg.status;
        if (window.crossfadeBg) window.crossfadeBg(cfg.key, 0.8, 0.95);
        if (window.setParticleTheme) window.setParticleTheme(cfg.color[0], cfg.color[1], cfg.color[2]);
      }
    });
  });

  // Season Scrubber
  const seasonSlider = document.getElementById('season-slider');
  const seasonTitle = document.getElementById('season-title');
  const seasonDesc = document.getElementById('season-desc');
  const saTemp = document.getElementById('sa-temp');
  const saFood = document.getElementById('sa-food');
  const saThreat = document.getElementById('sa-threat');
  const seasonLabels = document.querySelectorAll('.s-label');

  const seasonsData = [
    { name: 'Spring · The Thaw', desc: 'Snowmelt fills the river gorges. Fresh green buds bloom, animal herds give birth, and predators awaken hungry from hibernation.', temp: 'Temperature: Mild (16°C)', food: 'Forage: Abundant', threat: 'Activity: Rising', rgb: [0.55, 0.85, 0.35] },
    { name: 'Summer · The Sun Peak', desc: 'Long daylight hours across Golden Plains. Rapid game migrations; rivers dry out in desert canyons. Heat exhaustion is constant.', temp: 'Temperature: Scorching (34°C)', food: 'Forage: Moderate', threat: 'Activity: High', rgb: [0.98, 0.85, 0.35] },
    { name: 'Autumn · The Harvest Migration', desc: 'Amber leaves blanket the forest floor. Mammoths gather for southward trek. Last opportunity to prepare meat stocks before frost.', temp: 'Temperature: Cooling (10°C)', food: 'Forage: Scarce', threat: 'Activity: Fierce', rgb: [0.95, 0.45, 0.15] },
    { name: 'Winter · The Bitter Freeze', desc: 'Sub-zero blizzards blanket the mountains. Hypothermia drains stamina; food vanishes under ice. Shelter by campfire is mandatory.', temp: 'Temperature: Freezing (-12°C)', food: 'Forage: Critical', threat: 'Activity: Desperate', rgb: [0.75, 0.92, 1.0] }
  ];

  if (seasonSlider) {
    seasonSlider.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value, 10);
      const s = seasonsData[idx];

      seasonLabels.forEach((lbl, i) => lbl.classList.toggle('active', i === idx));
      if (seasonTitle) seasonTitle.textContent = s.name;
      if (seasonDesc) seasonDesc.textContent = s.desc;
      if (saTemp) saTemp.textContent = s.temp;
      if (saFood) saFood.textContent = s.food;
      if (saThreat) saThreat.textContent = s.threat;

      if (window.setParticleTheme) {
        window.setParticleTheme(s.rgb[0], s.rgb[1], s.rgb[2], 0.4);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     4. PEOPLE & HU STANCES (people.html)
     ══════════════════════════════════════════════════════════════ */
  const stanceBtns = document.querySelectorAll('.btn-stance');
  const huSpriteImg = document.getElementById('hu-sprite-img');
  const huStanceIndicator = document.getElementById('hu-stance-indicator');

  const stanceData = {
    idle:    { label: 'STANCE: IDLE (RESTING & OBSERVING)', scale: 1 },
    crouch:  { label: 'STANCE: LOW CROUCH (MASKING SCENT & SILENT STEPS)', scale: 0.95 },
    walk:    { label: 'STANCE: PROWLING (CONSERVING STAMINA & READING TRACKS)', scale: 1.02 },
    run:     { label: 'STANCE: FULL SPRINT (BURNING ENERGY & EVADING)', scale: 1.08 },
    attack:  { label: 'STANCE: SPEAR THRUST (OFFENSIVE READY)', scale: 1.1 },
    survive: { label: 'STANCE: HEIGHTENED SENSES (PERCEPTION PEAK)', scale: 1.04 }
  };

  stanceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stanceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const action = btn.getAttribute('data-action');
      const data = stanceData[action] || stanceData.idle;

      if (huStanceIndicator) huStanceIndicator.textContent = data.label;
      if (huSpriteImg) {
        gsap.to(huSpriteImg, { scale: data.scale, duration: 0.25, ease: 'power2.out' });
      }
    });
  });

  /* ══════════════════════════════════════════════════════════════
     5. EQUIPMENT & FLINTCRAFT BENCH (equipment.html)
     ══════════════════════════════════════════════════════════════ */
  const wbTabs = document.querySelectorAll('.wb-tab');
  const btnMats = document.querySelectorAll('.btn-mat');
  const wImg = document.getElementById('w-img');
  const wName = document.getElementById('w-name');
  const wDesc = document.getElementById('w-desc');
  const sbDmgVal = document.getElementById('sb-dmg-val');
  const sbDmgFill = document.getElementById('sb-dmg-fill');
  const sbRngVal = document.getElementById('sb-rng-val');
  const sbRngFill = document.getElementById('sb-rng-fill');
  const sbDurVal = document.getElementById('sb-dur-val');
  const sbDurFill = document.getElementById('sb-dur-fill');

  const weaponsCatalog = {
    spear: {
      img: 'public/assets/weapon_spear.jpg',
      name: 'Hunting Spear',
      desc: 'Versatile prehistoric weapon. Knapped point bound with rawhide to a hardened ash wood shaft. Ideal for medium-range thrusts and overhand throws.',
      baseDmg: 45, baseRng: 65, baseDur: 50
    },
    axe: {
      img: 'public/assets/weapon_axe.jpg',
      name: 'War Axe',
      desc: 'Heavy primitive bludgeon and cleaver. Chipped stone head lashed to curved wood with animal sinew. Crushes beast carapace and splits wood.',
      baseDmg: 80, baseRng: 25, baseDur: 75
    },
    dagger: {
      img: 'public/assets/weapon_dagger.jpg',
      name: 'Hunting Dagger',
      desc: 'Carved mammoth bone blade with sharp serrations and leather grip wrap. Lightning-fast strikes and vital point carcass field-dressing.',
      baseDmg: 60, baseRng: 15, baseDur: 60
    },
    bow: {
      img: 'public/assets/weapon_bow.jpg',
      name: 'Sinew Bow',
      desc: 'Curved yew bow strung with twisted gut and animal sinew. Fires tipped reed arrows with lethal silence from high clifftops.',
      baseDmg: 40, baseRng: 90, baseDur: 45
    }
  };

  let curWeapon = 'spear';
  let curMat = 'stone';

  function updateWorkbench() {
    const w = weaponsCatalog[curWeapon] || weaponsCatalog.spear;
    const mult = curMat === 'stone' ? 1.0 : curMat === 'bone' ? 1.25 : 1.55;

    const dmg = Math.min(100, Math.round(w.baseDmg * mult));
    const rng = Math.min(100, Math.round(w.baseRng * (curMat === 'obsidian' ? 1.1 : 1.0)));
    const dur = Math.min(100, Math.round(w.baseDur * mult));
    const matName = curMat === 'stone' ? 'Bound Flint' : curMat === 'bone' ? 'Carved Bone' : 'Volcanic Obsidian';

    if (wImg && w.img) {
      gsap.to(wImg, {
        opacity: 0.3, duration: 0.15, onComplete: () => {
          wImg.src = w.img;
          gsap.to(wImg, { opacity: 1, duration: 0.25 });
        }
      });
    }
    if (wName) wName.textContent = `${matName} ${w.name}`;
    if (wDesc) wDesc.textContent = w.desc;
    if (sbDmgVal) sbDmgVal.textContent = `${dmg} / 100`;
    if (sbDmgFill) sbDmgFill.style.width = `${dmg}%`;
    if (sbRngVal) sbRngVal.textContent = `${rng} / 100`;
    if (sbRngFill) sbRngFill.style.width = `${rng}%`;
    if (sbDurVal) sbDurVal.textContent = `${dur} / 100`;
    if (sbDurFill) sbDurFill.style.width = `${dur}%`;
  }

  wbTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      wbTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      curWeapon = tab.getAttribute('data-w');
      updateWorkbench();
    });
  });

  btnMats.forEach((btn) => {
    btn.addEventListener('click', () => {
      btnMats.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      curMat = btn.getAttribute('data-mat');
      updateWorkbench();
    });
  });

  /* ══════════════════════════════════════════════════════════════
     6. NEWS CATEGORY FILTERS (news.html)
     ══════════════════════════════════════════════════════════════ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const devlogCards = document.querySelectorAll('.devlog-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      devlogCards.forEach((card) => {
        if (filter === 'all' || card.getAttribute('data-cat') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ══════════════════════════════════════════════════════════════
     7. FORM HANDLERS (join-us.html & play.html)
     ══════════════════════════════════════════════════════════════ */
  const interestForm = document.getElementById('interest-form');
  const interestSuccess = document.getElementById('interest-success');
  if (interestForm) {
    interestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      interestForm.style.display = 'none';
      if (interestSuccess) interestSuccess.hidden = false;
    });
  }

  const alphaForm = document.getElementById('alpha-form');
  const alphaSuccess = document.getElementById('alpha-success');
  if (alphaForm) {
    alphaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alphaForm.style.display = 'none';
      if (alphaSuccess) alphaSuccess.hidden = false;
    });
  }

  /* ══════════════════════════════════════════════════════════════
     8. HIGH-TECH CINEMA TRAILER ENGINE
     ══════════════════════════════════════════════════════════════ */
  const cinemaVideo = document.getElementById('cinema-video');
  const cinemaFrame = document.getElementById('cinema-theater-frame');
  const centerTrigger = document.getElementById('cinema-center-trigger');
  const btnCenterPlay = document.getElementById('btn-cinema-center-play');
  const btnToggle = document.getElementById('btn-cinema-toggle');
  const toggleIcon = document.getElementById('cinema-toggle-icon');
  const curTimeEl = document.getElementById('cinema-current-time');
  const durEl = document.getElementById('cinema-duration');
  const progressFill = document.getElementById('cinema-progress-fill');
  const scrubHandle = document.getElementById('cinema-scrub-handle');
  const scrubWrap = document.getElementById('cinema-scrub-wrap');
  const btnVolume = document.getElementById('btn-cinema-volume');
  const volumeIcon = document.getElementById('cinema-volume-icon');
  const btnFullscreen = document.getElementById('btn-cinema-fullscreen');
  const btnHeroTrailer = document.getElementById('btn-hero-trailer');

  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function playCinemaVideo() {
    if (!cinemaVideo) return;
    cinemaVideo.play().then(() => {
      if (cinemaFrame) cinemaFrame.classList.add('is-playing');
      if (toggleIcon) toggleIcon.textContent = '❚❚';
    }).catch((err) => {
      console.log('Video play interrupted:', err);
    });
  }

  function pauseCinemaVideo() {
    if (!cinemaVideo) return;
    cinemaVideo.pause();
    if (cinemaFrame) cinemaFrame.classList.remove('is-playing');
    if (toggleIcon) toggleIcon.textContent = '▶';
  }

  function toggleCinemaPlay() {
    if (!cinemaVideo) return;
    if (cinemaVideo.paused) {
      playCinemaVideo();
    } else {
      pauseCinemaVideo();
    }
  }

  if (cinemaVideo) {
    // Loaded metadata
    cinemaVideo.addEventListener('loadedmetadata', () => {
      if (durEl) durEl.textContent = formatTime(cinemaVideo.duration);
    });

    // Time update
    cinemaVideo.addEventListener('timeupdate', () => {
      if (curTimeEl) curTimeEl.textContent = formatTime(cinemaVideo.currentTime);
      if (cinemaVideo.duration) {
        const pct = (cinemaVideo.currentTime / cinemaVideo.duration) * 100;
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (scrubHandle) scrubHandle.style.left = `${pct}%`;
      }
    });

    // On ended
    cinemaVideo.addEventListener('ended', () => {
      pauseCinemaVideo();
      if (cinemaVideo) cinemaVideo.currentTime = 0;
    });

    // Triggers
    if (centerTrigger) centerTrigger.addEventListener('click', playCinemaVideo);
    if (btnCenterPlay) btnCenterPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      playCinemaVideo();
    });
    if (btnToggle) btnToggle.addEventListener('click', toggleCinemaPlay);
    cinemaVideo.addEventListener('click', toggleCinemaPlay);

    // Scrubbing (Click + Touch)
    if (scrubWrap) {
      const handleScrub = (clientX) => {
        const rect = scrubWrap.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        if (cinemaVideo.duration) {
          cinemaVideo.currentTime = pos * cinemaVideo.duration;
        }
      };

      scrubWrap.addEventListener('click', (e) => {
        handleScrub(e.clientX);
      });

      scrubWrap.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          handleScrub(e.touches[0].clientX);
        }
      }, { passive: true });

      scrubWrap.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
          handleScrub(e.touches[0].clientX);
        }
      }, { passive: true });
    }

    // Volume Toggle
    if (btnVolume) {
      btnVolume.addEventListener('click', () => {
        cinemaVideo.muted = !cinemaVideo.muted;
        if (volumeIcon) {
          volumeIcon.textContent = cinemaVideo.muted ? '🔇' : '🔊';
        }
      });
    }

    // Fullscreen Toggle
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          const wrapper = cinemaFrame || cinemaVideo;
          if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
          } else if (wrapper.webkitRequestFullscreen) {
            wrapper.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      });
    }

    // Hero CTA button smoothly scrolls down to theater and triggers play with sound
    if (btnHeroTrailer) {
      btnHeroTrailer.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('trailer-theater');
        if (target) {
          lenis.scrollTo(target, {
            offset: -40,
            duration: 1.2,
            onComplete: () => {
              cinemaVideo.muted = false;
              if (volumeIcon) volumeIcon.textContent = '🔊';
              playCinemaVideo();
            }
          });
        }
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     RESPONSIVE MOBILE NAVIGATION DRAWER
     ───────────────────────────────────────────────────────────── */
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close drawer when clicking regular navigation links
    navLinks.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Toggle dropdown accordions in mobile view
    document.querySelectorAll('.nav-dropdown-group').forEach(group => {
      const toggle = group.querySelector('.dropdown-toggle');
      if (toggle) {
        toggle.addEventListener('click', (e) => {
          if (window.innerWidth <= 860) {
            e.preventDefault();
            e.stopPropagation();
            group.classList.toggle('mobile-expanded');
          }
        });
      }
    });

    // Close mobile drawer on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

});


