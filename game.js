import * as THREE from 'three';
const canvas=document.querySelector('#view'),scene=new THREE.Scene();
scene.background=new THREE.Color(0x171d1d);scene.fog=new THREE.FogExp2(0x171d1d,.012);
const camera=new THREE.PerspectiveCamera(76,innerWidth/innerHeight,.08,150);camera.position.set(0,1.68,13);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
scene.add(new THREE.HemisphereLight(0xc8d7ce,0x38302a,1.35));const sun=new THREE.DirectionalLight(0xffd5a0,1.15);sun.position.set(-4,9,6);scene.add(sun);
const lampFront=new THREE.PointLight(0xffb76a,2.1,17,2);lampFront.position.set(0,2.8,7);scene.add(lampFront);
function tex(base,grid=false){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,256,256);for(let i=0;i<3200;i++){x.fillStyle=`rgba(${Math.random()>.5?'225,215,193':'12,17,16'},${Math.random()*.14})`;x.fillRect(Math.random()*256,Math.random()*256,Math.random()*3+1,Math.random()*3+1)}if(grid){x.strokeStyle='#151a1980';x.lineWidth=3;for(let i=0;i<=256;i+=64){x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(256,i);x.stroke()}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);t.colorSpace=THREE.SRGBColorSpace;return t}
const mats={wall:new THREE.MeshStandardMaterial({map:tex('#77766e'),color:0xbab5a8,roughness:.92}),floor:new THREE.MeshStandardMaterial({map:tex('#414644',true),color:0xbcb9ae,roughness:.92}),dark:new THREE.MeshStandardMaterial({color:0x252c2b,roughness:.76,metalness:.35}),steel:new THREE.MeshStandardMaterial({color:0x59615e,roughness:.42,metalness:.72}),orange:new THREE.MeshStandardMaterial({color:0xd66a20,roughness:.65}),yellow:new THREE.MeshStandardMaterial({color:0xe3aa38,roughness:.77}),light:new THREE.MeshStandardMaterial({color:0xffe6af,emissive:0xffb34f,emissiveIntensity:2.8}),cyan:new THREE.MeshStandardMaterial({color:0x74c9bc,emissive:0x267d71,emissiveIntensity:1.6})};
const cube=new THREE.BoxGeometry(1,1,1);
function box(p,m,x,y,z,sx,sy,sz){const o=new THREE.Mesh(cube,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o}
function pipe(p,m,x,y,z,r,len,axis='z'){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12),m);o.position.set(x,y,z);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;p.add(o);return o}
function warning(p,x,y,z,h=1){box(p,mats.dark,x,y,z,.12,h,.045);for(let j=0;j<h/.32;j++){const s=box(p,mats.yellow,x,y-h/2+j*.32,z-.03,.17,.16,.035);s.rotation.z=-.55}}
function wallSign(x,y,z,text){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='#111918';g.fillRect(0,0,512,128);g.strokeStyle='#ed8a38';g.lineWidth=5;g.strokeRect(4,4,504,120);g.fillStyle='#ff9b43';g.font='bold 48px monospace';g.fillText(text,22,77);g.fillStyle='#ddd';g.font='18px monospace';g.fillText('RESEARCH • SUBLEVEL 04',23,108);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.43),new THREE.MeshBasicMaterial({map:t}));o.position.set(x,y,z);o.rotation.y=x<0?Math.PI/2:-Math.PI/2;scene.add(o)}
// Reinforced concrete service corridor, repeating bays, cable channels, hazard stripes.
box(scene,mats.floor,0,-.18,-36,10.6,.36,108);box(scene,mats.dark,0,6.12,-36,10.6,.5,108);
box(scene,mats.wall,-5.15,2.95,-36,.48,6.2,108);box(scene,mats.wall,5.15,2.95,-36,.48,6.2,108);
box(scene,mats.dark,0,2.95,-90,10.6,6.2,.5);box(scene,mats.dark,0,2.95,18,10.6,6.2,.5);
const lights=[];
for(let i=0;i<16;i++){const z=13-i*7.1;box(scene,mats.dark,-4.88,2.98,z,.1,5.65,.18);box(scene,mats.dark,4.88,2.98,z,.1,5.65,.18);box(scene,mats.steel,0,5.94,z,10.25,.17,.22);
  box(scene,mats.dark,-2.5,5.78,z-3.45,.2,.13,5.15);box(scene,mats.dark,2.5,5.78,z-3.45,.2,.13,5.15);box(scene,mats.light,0,5.75,z-3.45,1.48,.08,2.05);
  const l=new THREE.PointLight(i%3===1?0x9ccbc1:0xffc478,i%3===1?10:15,15,2);l.position.set(0,5.2,z-3.45);scene.add(l);lights.push(l);
  box(scene,mats.dark,-4.87,4.92,z-3.45,.12,.17,6.7);box(scene,mats.dark,4.87,4.92,z-3.45,.12,.17,6.7);box(scene,mats.orange,-4.86,1.02,z-3.45,.09,.16,6.7);box(scene,mats.orange,4.86,1.02,z-3.45,.09,.16,6.7);
  if(i%2===0){warning(scene,-4.88,1.55,z-6.92,1.05);warning(scene,4.88,1.55,z-6.92,1.05)}
}
for(const side of [-1,1]){for(let p=0;p<4;p++)pipe(scene,p===0?mats.orange:mats.steel,side*(4.48-p*.26),4.28,-35,p===0?.12:.07,94);for(let i=0;i<9;i++){const z=8-i*11;box(scene,mats.dark,side*4.86,2.82,z,.13,1.4,1.5);box(scene,mats.steel,side*4.77,2.82,z-.02,.13,1.12,1.2);box(scene,mats.orange,side*4.68,3.15,z-.64,.035,.15,.035);box(scene,mats.cyan,side*4.68,3.15,z-.5,.035,.08,.08);wallSign(side*4.88,4.28,z-1.6,i%2?'CAUTION':'SECTOR C')}}
// Reinforced containment bulkhead and glowing reactor.
box(scene,mats.dark,0,2.6,-89.6,3.2,4.8,.22);box(scene,mats.steel,0,2.6,-89.42,2.85,4.45,.12);
const core=new THREE.Mesh(new THREE.CylinderGeometry(.56,.56,3.7,16),new THREE.MeshStandardMaterial({color:0x986837,emissive:0xe47724,emissiveIntensity:1.2,metalness:.7,roughness:.3}));core.position.set(0,2.5,-89.15);scene.add(core);const coreLight=new THREE.PointLight(0xff7b26,42,19,2);coreLight.position.set(0,3,-86);scene.add(coreLight);
for(let y=1;y<5;y++)box(scene,mats.orange,0,y,-89.32,2.7,.045,.045);
// Weapon view model mounted to camera.
const gun=new THREE.Group();camera.add(gun);scene.add(camera);gun.position.set(.32,-.3,-.56);
box(gun,mats.dark,0,0,0,.19,.18,.52);box(gun,mats.steel,0,.045,-.11,.22,.11,.25);box(gun,mats.orange,0,-.09,.04,.13,.1,.17);pipe(gun,mats.steel,0,.025,-.34,.045,.33);pipe(gun,mats.orange,0,.025,-.515,.075,.05);box(gun,mats.cyan,0,.1,-.12,.08,.024,.1);
const muzzle=new THREE.PointLight(0xff822c,0,5,2);muzzle.position.set(0,.02,-.58);gun.add(muzzle);

const raycaster=new THREE.Raycaster();raycaster.far=52;
const enemies=[];
let kills=0,health=100,armor=50,started=false,ended=false,fireHeld=false,fireClock=0,damageClock=0,elapsed=0,spawnClock=0,jumpVelocity=0;
const healthNum=document.querySelector('#healthNum'),armorNum=document.querySelector('#armorNum'),healthBar=document.querySelector('#healthBar'),armorBar=document.querySelector('#armorBar');
function updateVitals(){healthNum.textContent=health;armorNum.textContent=armor;healthBar.style.width=`${health}%`;armorBar.style.width=`${armor*2}%`}
function makeEnemy(z,x=THREE.MathUtils.randFloat(-2.8,2.8)){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  const bodyMat=new THREE.MeshStandardMaterial({color:0x394443,roughness:.42,metalness:.52});
  const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(.63,1),bodyMat);shell.position.y=1.48;g.add(shell);
  const armorPlate=new THREE.Mesh(new THREE.BoxGeometry(.92,.24,.68),mats.dark);armorPlate.position.set(0,1.47,.05);armorPlate.rotation.z=.2;g.add(armorPlate);
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),new THREE.MeshBasicMaterial({color:0xff4c1e}));eye.position.set(0,1.55,-.57);g.add(eye);
  const eyeLight=new THREE.PointLight(0xff421d,1.3,4);eyeLight.position.set(0,1.55,-.68);g.add(eyeLight);
  const horn1=new THREE.Mesh(new THREE.ConeGeometry(.12,.45,8),mats.orange);horn1.position.set(-.43,1.94,.04);horn1.rotation.z=.25;g.add(horn1);
  const horn2=horn1.clone();horn2.position.x=.43;horn2.rotation.z=-.25;g.add(horn2);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.78,.045,7,24),mats.orange);ring.position.y=1.45;ring.rotation.x=Math.PI/2;g.add(ring);
  const e={group:g,hp:3,attack:THREE.MathUtils.randFloat(1.7,3),phase:Math.random()*8,speed:THREE.MathUtils.randFloat(.3,.55),alive:true};
  g.traverse(o=>{if(o.isMesh)o.userData.enemy=e});enemies.push(e);return e;
}
for(let i=0;i<3;i++)makeEnemy(-11-i*7,(i-1)*1.8);
function fire(){
  if(!started||ended)return;
  muzzle.intensity=8;setTimeout(()=>{muzzle.intensity=0},65);
  gun.position.x=.32+THREE.MathUtils.randFloat(-.012,.012);gun.position.y=-.3+THREE.MathUtils.randFloat(-.012,.012);
  raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
  const targets=enemies.filter(e=>e.alive).map(e=>e.group);
  const hit=raycaster.intersectObjects(targets,true)[0];
  if(!hit)return;
  let object=hit.object;while(object&&!object.userData.enemy)object=object.parent;
  const enemy=object?.userData.enemy;if(!enemy?.alive)return;
  enemy.hp--;enemy.group.scale.setScalar(.94);setTimeout(()=>{if(enemy.alive)enemy.group.scale.setScalar(1)},80);
  const marker=document.querySelector('#hitmarker');marker.classList.add('show');setTimeout(()=>marker.classList.remove('show'),125);
  if(enemy.hp<=0){enemy.alive=false;scene.remove(enemy.group);kills++;document.querySelector('#threat').textContent=String(Math.max(0,12-kills)).padStart(2,'0');if(kills>=12)finish(true)}
}
function finish(win){
  if(ended)return;ended=true;fireHeld=false;
  document.querySelector('#endTitle').innerHTML=win?'MISSION<br><em>COMPLETE</em>':'SIGNAL<br><em>LOST</em>';
  document.querySelector('#endText').textContent=win?'The corridor is secure. Facility 09 is still standing.':'Your vitals are critical. The facility has gone dark.';
  document.querySelector('#finalKills').textContent=String(kills).padStart(2,'0');document.querySelector('#endScreen').classList.remove('hidden');
}

let moveX=0,moveY=0,lookId=null,lastLookX=0,lastLookY=0,stickId=null,stickOrigin={x:0,y:0};
const stick=document.querySelector('#stick'),knob=document.querySelector('#knob');
function setStick(t){const dx=t.clientX-stickOrigin.x,dy=t.clientY-stickOrigin.y,r=35,len=Math.hypot(dx,dy),scale=len>r?r/len:1;moveX=dx*scale/r;moveY=dy*scale/r;knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`}
function startGame(){
  if(started&&!ended)return;if(ended){location.reload();return}
  started=true;document.querySelector('#startScreen').classList.add('hidden');
  try{const lock=screen.orientation?.lock;if(lock)lock.call(screen.orientation,'landscape').catch(()=>{})}catch{}
  lampFront.intensity=2.2;
}
document.querySelector('#startButton').addEventListener('touchstart',e=>{e.preventDefault();startGame()},{passive:false});
document.querySelector('#restartButton').addEventListener('touchstart',e=>{e.preventDefault();location.reload()},{passive:false});
document.querySelector('#jump').addEventListener('touchstart',e=>{e.preventDefault();if(started&&!ended&&camera.position.y<=1.69)jumpVelocity=5.1;e.currentTarget.classList.add('pressed')},{passive:false});
document.querySelector('#jump').addEventListener('touchend',e=>{e.preventDefault();e.currentTarget.classList.remove('pressed')},{passive:false});
document.querySelector('#fire').addEventListener('touchstart',e=>{e.preventDefault();if(!started)return;fireHeld=true;fire();e.currentTarget.classList.add('pressed')},{passive:false});
for(const type of ['touchend','touchcancel'])document.querySelector('#fire').addEventListener(type,e=>{e.preventDefault();fireHeld=false;e.currentTarget.classList.remove('pressed')},{passive:false});
document.addEventListener('touchstart',e=>{
  for(const t of e.changedTouches){const target=document.elementFromPoint(t.clientX,t.clientY);if(target?.closest('.modal'))continue;
    if(target?.closest('#stick')){stickId=t.identifier;const r=stick.getBoundingClientRect();stickOrigin={x:r.left+r.width/2,y:r.top+r.height/2};setStick(t)}
    else if(t.clientX>innerWidth*.48&&!target?.closest('.action')){lookId=t.identifier;lastLookX=t.clientX;lastLookY=t.clientY}
  }
},{passive:false});
document.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){
  if(t.identifier===stickId)setStick(t);
  if(t.identifier===lookId&&started&&!ended){const dx=t.clientX-lastLookX,dy=t.clientY-lastLookY;camera.rotation.order='YXZ';camera.rotation.y-=dx*.0046;camera.rotation.x-=dy*.0037;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x,-1.22,1.22);lastLookX=t.clientX;lastLookY=t.clientY}
}},{passive:false});
function endTouch(e){for(const t of e.changedTouches){if(t.identifier===stickId){stickId=null;moveX=moveY=0;knob.style.transform='translate(0,0)'}if(t.identifier===lookId)lookId=null}}
document.addEventListener('touchend',endTouch,{passive:false});document.addEventListener('touchcancel',endTouch,{passive:false});

const clock=new THREE.Clock();
function update(dt){
  elapsed+=dt;
  if(started&&!ended){
    const speed=4.7,yaw=camera.rotation.y,forward=-moveY*speed*dt,side=moveX*speed*dt;
    camera.position.x+=Math.cos(yaw)*side+Math.sin(yaw)*forward;
    camera.position.z+=-Math.sin(yaw)*side-Math.cos(yaw)*forward;
    camera.position.x=THREE.MathUtils.clamp(camera.position.x,-4.05,4.05);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-85.5,15.5);
    jumpVelocity-=13*dt;camera.position.y+=jumpVelocity*dt;if(camera.position.y<1.68){camera.position.y=1.68;jumpVelocity=0}
    if(fireHeld){fireClock-=dt;if(fireClock<=0){fire();fireClock=.28}}
    damageClock-=dt;
    for(const enemy of enemies){if(!enemy.alive)continue;enemy.phase+=dt*2.7;enemy.group.position.y=Math.sin(enemy.phase)*.12;
      const dx=camera.position.x-enemy.group.position.x,dz=camera.position.z-enemy.group.position.z,d=Math.hypot(dx,dz);
      if(d>2.3){enemy.group.position.x+=dx/d*enemy.speed*dt*.3;enemy.group.position.z+=enemy.speed*dt;enemy.group.rotation.y=Math.atan2(dx,-dz)}
      if(d<8.5&&damageClock<=0){damageClock=1.05;const hitDamage=THREE.MathUtils.randInt(5,9),absorbed=Math.min(armor,hitDamage);armor-=absorbed;health=Math.max(0,health-(hitDamage-absorbed));updateVitals();const flash=document.querySelector('#damageflash');flash.classList.add('show');setTimeout(()=>flash.classList.remove('show'),180);if(health<=0)finish(false)}
    }
    if(kills<12){spawnClock-=dt;if(spawnClock<=0&&enemies.filter(e=>e.alive).length<3){const z=Math.max(-74,camera.position.z-THREE.MathUtils.randFloat(35,58));makeEnemy(z);spawnClock=2.3}}
  }
  if(!fireHeld){gun.position.x=THREE.MathUtils.lerp(gun.position.x,.32,dt*9);gun.position.y=THREE.MathUtils.lerp(gun.position.y,-.3,dt*9)}
  core.rotation.y=elapsed*.25;coreLight.intensity=42+Math.sin(elapsed*2)*4;
}
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);update(dt);renderer.render(scene,camera)}frame();
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight)}
addEventListener('resize',resize);addEventListener('orientationchange',resize);
