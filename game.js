import * as THREE from 'three';

const canvas = document.querySelector('#view');
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || innerWidth < 900;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12191a);
scene.fog = new THREE.FogExp2(0x12191a, isMobile ? 0.014 : 0.012);

const camera = new THREE.PerspectiveCamera(76, innerWidth / innerHeight, 0.08, 150);
camera.position.set(0, 1.68, 13);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  alpha: false,
  powerPreference: 'low-power',
});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.25 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = false;

const hemi = new THREE.HemisphereLight(0xc8d7ce, 0x2a2b28, isMobile ? 0.7 : 1.0);
scene.add(hemi);

const sun = new THREE.PointLight(0xffd5a0, isMobile ? 0.8 : 1.2, 28, 2);
sun.position.set(-4, 9, 6);
scene.add(sun);

const lampFront = new THREE.PointLight(0xffb76a, isMobile ? 1.1 : 2.0, 18, 2);
lampFront.position.set(0, 2.8, 7);
scene.add(lampFront);

function tex(base, grid = false) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = base;
  x.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 1200; i++) {
    x.fillStyle = `rgba(${Math.random() > 0.5 ? '225,215,193' : '12,17,16'},${Math.random() * 0.12})`;
    x.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }

  if (grid) {
    x.strokeStyle = '#151a1980';
    x.lineWidth = 3;
    for (let i = 0; i <= 256; i += 64) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i, 256);
      x.stroke();
      x.beginPath();
      x.moveTo(0, i);
      x.lineTo(256, i);
      x.stroke();
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const mats = {
  wall: new THREE.MeshBasicMaterial({ map: tex('#77766e'), color: 0xbab5a8 }),
  floor: new THREE.MeshBasicMaterial({ map: tex('#414644', true), color: 0xbcb9ae }),
  dark: new THREE.MeshBasicMaterial({ color: 0x252c2b }),
  steel: new THREE.MeshBasicMaterial({ color: 0x59615e }),
  orange: new THREE.MeshBasicMaterial({ color: 0xd66a20 }),
  yellow: new THREE.MeshBasicMaterial({ color: 0xe3aa38 }),
  light: new THREE.MeshBasicMaterial({ color: 0xffe6af }),
  cyan: new THREE.MeshBasicMaterial({ color: 0x74c9bc }),
};

const cube = new THREE.BoxGeometry(1, 1, 1);

function box(p, m, x, y, z, sx, sy, sz) {
  const o = new THREE.Mesh(cube, m);
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  p.add(o);
  return o;
}

function pipe(p, m, x, y, z, r, len, axis = 'z') {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), m);
  o.position.set(x, y, z);
  if (axis === 'z') o.rotation.x = Math.PI / 2;
  if (axis === 'x') o.rotation.z = Math.PI / 2;
  p.add(o);
  return o;
}

function warning(p, x, y, z, h = 1) {
  box(p, mats.dark, x, y, z, 0.12, h, 0.045);
  for (let j = 0; j < h / 0.32; j++) {
    const s = box(p, mats.yellow, x, y - h / 2 + j * 0.32, z - 0.03, 0.17, 0.16, 0.035);
    s.rotation.z = -0.55;
  }
}

function wallSign(x, y, z, text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#111918';
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = '#ed8a38';
  g.lineWidth = 5;
  g.strokeRect(4, 4, 504, 120);
  g.fillStyle = '#ff9b43';
  g.font = 'bold 48px monospace';
  g.fillText(text, 22, 77);
  g.fillStyle = '#ddd';
  g.font = '18px monospace';
  g.fillText('RESEARCH • SUBLEVEL 04', 23, 108);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const o = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.43), new THREE.MeshBasicMaterial({ map: t }));
  o.position.set(x, y, z);
  o.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
  scene.add(o);
}

box(scene, mats.floor, 0, -0.18, -36, 10.6, 0.36, 108);
box(scene, mats.dark, 0, 6.12, -36, 10.6, 0.5, 108);
box(scene, mats.wall, -5.15, 2.95, -36, 0.48, 6.2, 108);
box(scene, mats.wall, 5.15, 2.95, -36, 0.48, 6.2, 108);
box(scene, mats.dark, 0, 2.95, -90, 10.6, 6.2, 0.5);
box(scene, mats.dark, 0, 2.95, 18, 10.6, 6.2, 0.5);

const lights = [];
const lightCount = isMobile ? 10 : 16;
for (let i = 0; i < lightCount; i++) {
  const z = 13 - i * 7.1;
  box(scene, mats.dark, -4.88, 2.98, z, 0.1, 5.65, 0.18);
  box(scene, mats.dark, 4.88, 2.98, z, 0.1, 5.65, 0.18);
  box(scene, mats.steel, 0, 5.94, z, 10.25, 0.17, 0.22);
  box(scene, mats.dark, -2.5, 5.78, z - 3.45, 0.2, 0.13, 5.15);
  box(scene, mats.dark, 2.5, 5.78, z - 3.45, 0.2, 0.13, 5.15);
  box(scene, mats.light, 0, 5.75, z - 3.45, 1.48, 0.08, 2.05);

  const l = new THREE.PointLight(i % 3 === 1 ? 0x9ccbc1 : 0xffc478, i % 3 === 1 ? 8 : 12, 15, 2);
  l.position.set(0, 5.2, z - 3.45);
  scene.add(l);
  lights.push(l);

  box(scene, mats.dark, -4.87, 4.92, z - 3.45, 0.12, 0.17, 6.7);
  box(scene, mats.dark, 4.87, 4.92, z - 3.45, 0.12, 0.17, 6.7);
  box(scene, mats.orange, -4.86, 1.02, z - 3.45, 0.09, 0.16, 6.7);
  box(scene, mats.orange, 4.86, 1.02, z - 3.45, 0.09, 0.16, 6.7);

  if (i % 2 === 0) {
    warning(scene, -4.88, 1.55, z - 6.92, 1.05);
    warning(scene, 4.88, 1.55, z - 6.92, 1.05);
  }
}

for (const side of [-1, 1]) {
  for (let p = 0; p < 4; p++) {
    pipe(scene, p === 0 ? mats.orange : mats.steel, side * (4.48 - p * 0.26), 4.28, -35, p === 0 ? 0.12 : 0.07, 94);
  }
  for (let i = 0; i < 9; i++) {
    const z = 8 - i * 11;
    box(scene, mats.dark, side * 4.86, 2.82, z, 0.13, 1.4, 1.5);
    box(scene, mats.steel, side * 4.77, 2.82, z - 0.02, 0.13, 1.12, 1.2);
    box(scene, mats.orange, side * 4.68, 3.15, z - 0.64, 0.035, 0.15, 0.035);
    box(scene, mats.cyan, side * 4.68, 3.15, z - 0.5, 0.035, 0.08, 0.08);
    wallSign(side * 4.88, 4.28, z - 1.6, i % 2 ? 'CAUTION' : 'SECTOR C');
  }
}

box(scene, mats.dark, 0, 2.6, -89.6, 3.2, 4.8, 0.22);
box(scene, mats.steel, 0, 2.6, -89.42, 2.85, 4.45, 0.12);

const core = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 3.7, 10), mats.orange);
core.position.set(0, 2.5, -89.15);
scene.add(core);
const coreLight = new THREE.PointLight(0xff7b26, 42, 19, 2);
coreLight.position.set(0, 3, -86);
scene.add(coreLight);

for (let y = 1; y < 5; y++) box(scene, mats.orange, 0, y, -89.32, 2.7, 0.045, 0.045);

const gun = new THREE.Group();
camera.add(gun);
scene.add(camera);
gun.position.set(0.32, -0.3, -0.56);

box(gun, mats.dark, 0, 0, 0, 0.19, 0.18, 0.52);
box(gun, mats.steel, 0, 0.045, -0.11, 0.22, 0.11, 0.25);
box(gun, mats.orange, 0, -0.09, 0.04, 0.13, 0.1, 0.17);
pipe(gun, mats.steel, 0, 0.025, -0.34, 0.045, 0.33);
pipe(gun, mats.orange, 0, 0.025, -0.515, 0.075, 0.05);
box(gun, mats.cyan, 0, 0.1, -0.12, 0.08, 0.024, 0.1);

const muzzle = new THREE.PointLight(0xff822c, 0, 5, 2);
muzzle.position.set(0, 0.02, -0.58);
gun.add(muzzle);

const raycaster = new THREE.Raycaster();
raycaster.far = 52;
const enemies = [];
let kills = 0,
  health = 100,
  armor = 50,
  started = false,
  ended = false,
  fireHeld = false,
  fireClock = 0,
  damageClock = 0,
  elapsed = 0,
  spawnClock = 0,
  jumpVelocity = 0;

const healthNum = document.querySelector('#healthNum');
const armorNum = document.querySelector('#armorNum');
const healthBar = document.querySelector('#healthBar');
const armorBar = document.querySelector('#armorBar');

function updateVitals() {
  healthNum.textContent = health;
  armorNum.textContent = armor;
  healthBar.style.width = `${health}%`;
  armorBar.style.width = `${armor * 2}%`;
}

function makeEnemy(z, x = THREE.MathUtils.randFloat(-2.8, 2.8)) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  scene.add(g);

  const bodyMat = new THREE.MeshBasicMaterial({ color: 0x394443 });
  const shell = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), bodyMat);
  shell.position.y = 1.48;
  g.add(shell);

  const armorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.24, 0.68), mats.dark);
  armorPlate.position.set(0, 1.47, 0.05);
  armorPlate.rotation.z = 0.2;
  g.add(armorPlate);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff4c1e }));
  eye.position.set(0, 1.55, -0.57);
  g.add(eye);

  const eyeLight = new THREE.PointLight(0xff421d, 1.3, 4);
  eyeLight.position.set(0, 1.55, -0.68);
  g.add(eyeLight);

  const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.38, 6), mats.orange);
  horn1.position.set(-0.43, 1.94, 0.04);
  horn1.rotation.z = 0.25;
  g.add(horn1);

  const horn2 = horn1.clone();
  horn2.position.x = 0.43;
  horn2.rotation.z = -0.25;
  g.add(horn2);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.04, 4, 16), mats.orange);
  ring.position.y = 1.45;
  ring.rotation.x = Math.PI / 2;
  g.add(ring);

  const e = {
    group: g,
    hp: 3,
    attack: THREE.MathUtils.randFloat(1.7, 3),
    phase: Math.random() * 8,
    speed: THREE.MathUtils.randFloat(0.3, 0.55),
    alive: true,
  };

  g.traverse((o) => {
    if (o.isMesh) o.userData.enemy = e;
  });

  enemies.push(e);
  return e;
}

for (let i = 0; i < 3; i++) makeEnemy(-11 - i * 7, (i - 1) * 1.8);

function fire() {
  if (!started || ended) return;
  muzzle.intensity = 8;
  setTimeout(() => {
    muzzle.intensity = 0;
  }, 65);

  gun.position.x = 0.32 + THREE.MathUtils.randFloat(-0.012, 0.012);
  gun.position.y = -0.3 + THREE.MathUtils.randFloat(-0.012, 0.012);

  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const targets = enemies.filter((e) => e.alive).map((e) => e.group);
  const hit = raycaster.intersectObjects(targets, true)[0];

  if (!hit) return;

  let object = hit.object;
  while (object && !object.userData.enemy) object = object.parent;

  const enemy = object?.userData.enemy;
  if (!enemy?.alive) return;

  enemy.hp--;
  enemy.group.scale.setScalar(0.94);
  setTimeout(() => {
    if (enemy.alive) enemy.group.scale.setScalar(1);
  }, 80);

  const marker = document.querySelector('#hitmarker');
  marker.classList.add('show');
  setTimeout(() => marker.classList.remove('show'), 125);

  if (enemy.hp <= 0) {
    enemy.alive = false;
    scene.remove(enemy.group);
    kills++;
    document.querySelector('#threat').textContent = String(Math.max(0, 12 - kills)).padStart(2, '0');
    if (kills >= 12) finish(true);
  }
}

function finish(win) {
  if (ended) return;
  ended = true;
  fireHeld = false;
  document.querySelector('#endTitle').innerHTML = win ? 'MISSION<br><em>COMPLETE</em>' : 'SIGNAL<br><em>LOST</em>';
  document.querySelector('#endText').textContent = win
    ? 'The corridor is secure. Facility 09 is still standing.'
    : 'Your vitals are critical. The facility has gone dark.';
  document.querySelector('#finalKills').textContent = String(kills).padStart(2, '0');
  document.querySelector('#endScreen').classList.remove('hidden');
}

let moveX = 0,
  moveY = 0,
  lookId = null,
  lastLookX = 0,
  lastLookY = 0,
  stickId = null,
  stickOrigin = { x: 0, y: 0 };

const stick = document.querySelector('#stick');
const knob = document.querySelector('#knob');

function setStick(t) {
  const dx = t.clientX - stickOrigin.x;
  const dy = t.clientY - stickOrigin.y;
  const r = 35;
  const len = Math.hypot(dx, dy);
  const scale = len > r ? r / len : 1;
  moveX = (dx * scale) / r;
  moveY = (dy * scale) / r;
  knob.style.transform = `translate(${dx * scale}px,${dy * scale}px)`;
}

function startGame() {
  if (started && !ended) return;
  if (ended) {
    location.reload();
    return;
  }
  started = true;
  document.querySelector('#startScreen').classList.add('hidden');
  try {
    const lock = screen.orientation?.lock;
    if (lock) lock.call(screen.orientation, 'landscape').catch(() => {});
  } catch {}
  lampFront.intensity = 2.2;
}

document.querySelector('#startButton').addEventListener('touchstart', (e) => {
  e.preventDefault();
  startGame();
}, { passive: false });

document.querySelector('#restartButton').addEventListener('touchstart', (e) => {
  e.preventDefault();
  location.reload();
}, { passive: false });

document.querySelector('#jump').addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (started && !ended && camera.position.y <= 1.69) jumpVelocity = 5.1;
  e.currentTarget.classList.add('pressed');
}, { passive: false });

document.querySelector('#jump').addEventListener('touchend', (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove('pressed');
}, { passive: false });

document.querySelector('#fire').addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (!started) return;
  fireHeld = true;
  fire();
  e.currentTarget.classList.add('pressed');
}, { passive: false });

for (const type of ['touchend', 'touchcancel']) {
  document.querySelector('#fire').addEventListener(type, (e) => {
    e.preventDefault();
    fireHeld = false;
    e.currentTarget.classList.remove('pressed');
  }, { passive: false });
}

document.addEventListener('touchstart', (e) => {
  for (const t of e.changedTouches) {
    const target = document.elementFromPoint(t.clientX, t.clientY);
    if (target?.closest('.modal')) continue;
    if (target?.closest('#stick')) {
      stickId = t.identifier;
      const r = stick.getBoundingClientRect();
      stickOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      setStick(t);
    } else if (t.clientX > innerWidth * 0.48 && !target?.closest('.action')) {
      lookId = t.identifier;
      lastLookX = t.clientX;
      lastLookY = t.clientY;
    }
  }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier === stickId) setStick(t);
    if (t.identifier === lookId && started && !ended) {
      const dx = t.clientX - lastLookX;
      const dy = t.clientY - lastLookY;
      camera.rotation.order = 'YXZ';
      camera.rotation.y -= dx * 0.0046;
      camera.rotation.x -= dy * 0.0037;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -1.22, 1.22);
      lastLookX = t.clientX;
      lastLookY = t.clientY;
    }
  }
}, { passive: false });

function endTouch(e) {
  for (const t of e.changedTouches) {
    if (t.identifier === stickId) {
      stickId = null;
      moveX = moveY = 0;
      knob.style.transform = 'translate(0,0)';
    }
    if (t.identifier === lookId) lookId = null;
  }
}

document.addEventListener('touchend', endTouch, { passive: false });
document.addEventListener('touchcancel', endTouch, { passive: false });

const clock = new THREE.Clock();

function update(dt) {
  elapsed += dt;
  if (started && !ended) {
    const speed = 4.7;
    const yaw = camera.rotation.y;
    const forward = -moveY * speed * dt;
    const side = moveX * speed * dt;
    camera.position.x += Math.cos(yaw) * side + Math.sin(yaw) * forward;
    camera.position.z += -Math.sin(yaw) * side - Math.cos(yaw) * forward;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -4.05, 4.05);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -85.5, 15.5);

    jumpVelocity -= 13 * dt;
    camera.position.y += jumpVelocity * dt;
    if (camera.position.y < 1.68) {
      camera.position.y = 1.68;
      jumpVelocity = 0;
    }

    if (fireHeld) {
      fireClock -= dt;
      if (fireClock <= 0) {
        fire();
        fireClock = 0.28;
      }
    }

    damageClock -= dt;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.phase += dt * 2.7;
      enemy.group.position.y = Math.sin(enemy.phase) * 0.12;

      const dx = camera.position.x - enemy.group.position.x;
      const dz = camera.position.z - enemy.group.position.z;
      const d = Math.hypot(dx, dz);

      if (d > 2.3) {
        enemy.group.position.x += (dx / d) * enemy.speed * dt * 0.3;
        enemy.group.position.z += enemy.speed * dt;
        enemy.group.rotation.y = Math.atan2(dx, -dz);
      }

      if (d < 8.5 && damageClock <= 0) {
        damageClock = 1.05;
        const hitDamage = THREE.MathUtils.randInt(5, 9);
        const absorbed = Math.min(armor, hitDamage);
        armor -= absorbed;
        health = Math.max(0, health - (hitDamage - absorbed));
        updateVitals();
        const flash = document.querySelector('#damageflash');
        flash.classList.add('show');
        setTimeout(() => flash.classList.remove('show'), 180);
        if (health <= 0) finish(false);
      }
    }

    if (kills < 12) {
      spawnClock -= dt;
      const maxEnemies = isMobile ? 2 : 3;
      if (spawnClock <= 0 && enemies.filter((e) => e.alive).length < maxEnemies) {
        const z = Math.max(-74, camera.position.z - THREE.MathUtils.randFloat(35, 58));
        makeEnemy(z);
        spawnClock = 2.3;
      }
    }
  }

  if (!fireHeld) {
    gun.position.x = THREE.MathUtils.lerp(gun.position.x, 0.32, dt * 9);
    gun.position.y = THREE.MathUtils.lerp(gun.position.y, -0.3, dt * 9);
  }

  core.rotation.y = elapsed * 0.25;
  coreLight.intensity = 42 + Math.sin(elapsed * 2) * 4;
}

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  update(dt);
  renderer.render(scene, camera);
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.25 : 1.5));
  renderer.setSize(innerWidth, innerHeight);
}

addEventListener('resize', resize);
addEventListener('orientationchange', resize);

frame();
