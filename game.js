import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#171b2b');
scene.fog = new THREE.FogExp2('#171b2b', 0.023);
const camera = new THREE.PerspectiveCamera(innerWidth < 700 ? 58 : 48, 1, 0.1, 150);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight('#a9c5ff','#20142a',2.2));
const moonLight = new THREE.DirectionalLight('#b8c5ff',2.1); moonLight.position.set(-5,12,7); moonLight.castShadow=true; moonLight.shadow.mapSize.set(1024,1024); scene.add(moonLight);
function pointLight(color,intensity,x,y,z,distance=18){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);scene.add(l);return l}
pointLight('#ff46a8',44,-5,4,-7);pointLight('#8c73ff',38,5,4,-5);pointLight('#c9ff55',25,0,3,2);

const mat=(color,rough=.7,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const floorMat=mat('#25283a',.87);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(90,90),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.03;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(80,40,'#48405c','#343247');grid.position.y=-.015;grid.material.transparent=true;grid.material.opacity=.28;scene.add(grid);
// Rooftop dance floor and luminous concentric rings
const stage=new THREE.Mesh(new THREE.CylinderGeometry(11,11,.22,80),mat('#302b42',.58,.15));stage.position.set(0,.05,0);stage.receiveShadow=true;stage.castShadow=true;scene.add(stage);
for(let r=3.1;r<=10;r+=2.2){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.018,8,100),new THREE.MeshBasicMaterial({color:r===5.3?'#df64ad':'#7c739d',transparent:true,opacity:r===5.3?.5:.23}));ring.rotation.x=Math.PI/2;ring.position.y=.17;scene.add(ring)}
const centerDisc=new THREE.Mesh(new THREE.CircleGeometry(1.7,48),new THREE.MeshBasicMaterial({color:'#b34d91',transparent:true,opacity:.18}));centerDisc.rotation.x=-Math.PI/2;centerDisc.position.y=.18;scene.add(centerDisc);
// skyline blocks give the rooftop a clear sense of place
const skylineMat=[mat('#22283c'),mat('#29263e'),mat('#1d2738')];
for(let i=0;i<32;i++){const a=i/32*Math.PI*2;const r=24+(i%3)*3;const w=2.2+(i%4)*.5,h=5+(i*7%11);const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,2.4),skylineMat[i%3]);b.position.set(Math.sin(a)*r,h/2-1,Math.cos(a)*r);b.rotation.y=-a;b.castShadow=true;scene.add(b);for(let wy=1;wy<h-1;wy+=1.3){for(let wx=-w/2+.4;wx<w/2-.2;wx+=.8){if((i*3+wy*2+wx*5)%3>1.3)continue;const win=new THREE.Mesh(new THREE.PlaneGeometry(.18,.28),new THREE.MeshBasicMaterial({color:(i+wy|0)%3?'#d87aab':'#b9da84',transparent:true,opacity:.45}));win.position.set(b.position.x+wx,wy,b.position.z+1.23);win.rotation.y=-a;scene.add(win)}}}
// perimeter rail
for(let i=0;i<28;i++){const a=i/28*Math.PI*2;const post=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.86,8),mat('#697085',.4,.65));post.position.set(Math.sin(a)*13,.44,Math.cos(a)*13);scene.add(post)}
const rail=new THREE.Mesh(new THREE.TorusGeometry(13,.055,8,100),mat('#758097',.35,.7));rail.rotation.x=Math.PI/2;rail.position.y=.85;scene.add(rail);
// abstract rooftop light towers
function lightTower(x,z,color){const base=new THREE.Mesh(new THREE.CylinderGeometry(.16,.3,2.8,8),mat('#34394c',.4,.7));base.position.set(x,1.4,z);base.castShadow=true;scene.add(base);const orb=new THREE.Mesh(new THREE.SphereGeometry(.23,16,12),new THREE.MeshBasicMaterial({color}));orb.position.set(x,2.92,z);scene.add(orb);pointLight(color,18,x,2.9,z,10)}
lightTower(-10,-5,'#ff57ad');lightTower(9,-7,'#8e78ff');lightTower(-8,8,'#baff62');lightTower(8,7,'#53d9e8');

const skinMats=['#f2ba98','#ad735c','#e7b994','#c88e77'];
const danceData={bounce:{name:'BOUNCE',fav:'bounce'},wave:{name:'WAVE',fav:'wave'},spin:{name:'SPIN',fav:'spin'}};
function makeDancer({name,x,z,shirt,skin,hair,accent,fav,player=false}){
 const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);
 const body=new THREE.Group();body.position.y=0;root.add(body);
 const shirtMat=mat(shirt,.5),skinMat=mat(skin,.65),pantsMat=mat(player?'#252a3b':'#303044',.65),hairMat=mat(hair,.8);
 function ball(parent,r,sx,sy,sz,m,pos){const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m);o.scale.set(sx,sy,sz);o.position.set(...pos);o.castShadow=true;parent.add(o);return o}
 const torso=ball(body,.4,1,1.2,.65,shirtMat,[0,1.35,0]);
 const hips=new THREE.Mesh(new THREE.BoxGeometry(.52,.3,.34),pantsMat);hips.position.y=.73;hips.castShadow=true;body.add(hips);
 const head=new THREE.Group();head.position.set(0,2.12,0);body.add(head);ball(head,.25,1,1.03,.92,skinMat,[0,0,0]);
 ball(head,.26,1.04,.5,.98,hairMat,[0,.15,-.025]);
 const fringe=ball(head,.14,1.15,.42,.55,hairMat,[0,.23,.17]);
 // bright ear studs / simplified face details
 const eyeMat=new THREE.MeshBasicMaterial({color:'#242332'});for(const ex of [-.085,.085]){const e=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),eyeMat);e.position.set(ex,.02,.22);head.add(e)}
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.39,1.63,0);body.add(arm);ball(arm,.13,.86,1,.9,shirtMat,[side*.02,-.27,0]);ball(arm,.105,.76,.83,.8,skinMat,[side*.04,-.56,.01]);arms.push({node:arm,side});
  const leg=new THREE.Group();leg.position.set(side*.17,.7,0);body.add(leg);ball(leg,.18,.72,1.24,.9,pantsMat,[0,-.32,0]);ball(leg,.13,.78,.62,1.35,mat('#ddd8cb'),[0,-.69,.06]);legs.push({node:leg,side});
 }
 // graphic clothing accent
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(.065,.55,.018),new THREE.MeshBasicMaterial({color:accent}));stripe.position.set(.13,1.37,.263);body.add(stripe);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.48,24),new THREE.MeshBasicMaterial({color:'#090a11',transparent:true,opacity:.38}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.035;root.add(shadow);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.61,.025,6,36),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.75}));ring.rotation.x=Math.PI/2;ring.position.y=.12;root.add(ring);
 return {name,root,body,head,arms,legs,shirtMat,skinMat,ring,fav,player,baseX:x,baseZ:z,phase:Math.random()*5,mood:Math.random()*6};
}
const player=makeDancer({name:'You',x:0,z:7.2,shirt:'#d4ff64',skin:'#e0a882',hair:'#39283b',accent:'#ff67b0',player:true});
player.root.rotation.y=0;
const dancers=[
 makeDancer({name:'Mika',x:-4.6,z:-1.3,shirt:'#e75799',skin:skinMats[0],hair:'#291d2d',accent:'#d5ff65',fav:'wave'}),
 makeDancer({name:'Jules',x:4.1,z:-2.2,shirt:'#6775df',skin:skinMats[1],hair:'#202638',accent:'#ffcc69',fav:'spin'}),
 makeDancer({name:'Sol',x:1.3,z:5.1,shirt:'#ff994f',skin:skinMats[2],hair:'#513229',accent:'#74eddf',fav:'bounce'}),
 makeDancer({name:'Ari',x:-7.1,z:3.3,shirt:'#55bda7',skin:skinMats[3],hair:'#302631',accent:'#bd8bff',fav:'bounce'})
];
// Small crowd along the back of the rooftop
const crowd=[];for(let i=0;i<5;i++){crowd.push(makeDancer({name:'Guest',x:-8+i*3.5,z:-8-(i%2),shirt:['#4b536b','#72506a','#58757b','#786048','#56517f'][i],skin:skinMats[i%4],hair:'#252334',accent:'#7e7995',fav:'bounce'}))}

const keys={};let yaw=0, cameraDistance=10.4, cameraHeight=5.8, moving=false, started=false, selected='bounce', activePartner=null,duetMoves=0, score=0, completed=0, toastTimer, lastTime=0, elapsed=0, audioCtx=null,soundOn=true,beatTimer=null;
const pos=player.root.position;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize);resize();
function showToast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1900)}
function nearestDancer(){let nearest=null,dist=Infinity;for(const d of dancers){const n=pos.distanceTo(d.root.position);if(n<dist){dist=n;nearest=d}}return {dancer:nearest,distance:dist}}
function refreshSocial(){const {dancer,distance}=nearestDancer();if(activePartner){document.querySelector('#npc-name').textContent=activePartner.name;document.querySelector('#npc-mood').textContent='dancing with you · keep the groove';document.querySelector('#social-title').textContent='DUET IN PROGRESS';document.querySelector('#social-hint').textContent=`${duetMoves} of 5 moves · try their favourite style`;document.querySelector('#invite-text').textContent='END DANCE-OFF';document.querySelector('#invite-button').disabled=false;document.querySelector('#social-card').classList.add('ready');return}
 document.querySelector('#npc-name').textContent=dancer.name;document.querySelector('#npc-mood').textContent=`feeling the beat · ${Math.max(1,Math.round(distance))}m away`;document.querySelector('#social-title').textContent=distance<2.8?'READY TO CONNECT':'THE FLOOR IS YOURS';document.querySelector('#social-hint').textContent=distance<2.8?`Their move is ${dancer.fav.toUpperCase()} · say hello!`:'Get closer to meet someone';document.querySelector('#invite-text').textContent=distance<2.8?'START A DANCE-OFF':'APPROACH A DANCER';document.querySelector('#invite-button').disabled=distance>=2.8;document.querySelector('#social-card').classList.toggle('ready',distance<2.8)}
function connect(){if(activePartner){activePartner=null;duetMoves=0;refreshSocial();showToast('DANCE-OFF COMPLETE · BACK TO THE FLOOR');return}const {dancer,distance}=nearestDancer();if(distance>=2.8){showToast('GET CLOSER TO SOMEONE ON THE FLOOR');return}activePartner=dancer;duetMoves=0;refreshSocial();showToast(`YOU AND ${dancer.name.toUpperCase()} — LET'S GROOVE!`)}
function dance(){if(!started)return;player.mood=0;player.danceUntil=elapsed+1.2;player.currentDance=selected;
 if(activePartner){const matched=selected===activePartner.fav;duetMoves++;const gained=matched?90:45;score+=gained;document.querySelector('#score').textContent=String(score).padStart(4,'0');activePartner.danceUntil=elapsed+1.3;activePartner.currentDance=selected;showToast(matched?`CLEAN SYNC! +${gained} GROOVE`:`NICE MOVE! +${gained} GROOVE`);if(duetMoves>=5){completed++;document.querySelector('#progress-count').textContent=`${Math.min(completed,3)} / 3`;document.querySelector('#progress-fill').style.width=`${Math.min(completed,3)*33.33}%`;score+=150;document.querySelector('#score').textContent=String(score).padStart(4,'0');const n=activePartner.name;activePartner=null;duetMoves=0;refreshSocial();if(completed>=3){document.querySelector('#mission-copy').textContent='You brought the whole rooftop together. Own that moment.';showToast(`SET COMPLETE · +150 BONUS · YOU'RE A STAR ✦`)}else{document.querySelector('#mission-copy').textContent=`${n} is on your side. Find another dancer and keep it going.`;showToast(`${n.toUpperCase()} IS IN YOUR CREW! +150 BONUS`)}}else refreshSocial()}else{score+=5;document.querySelector('#score').textContent=String(score).padStart(4,'0')}}
function interact(){connect()}
window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys[e.code.toLowerCase()]=true;if(e.repeat)return;if(e.code==='Space')dance();if(e.code==='KeyE')interact();if(e.code==='Digit1')setDance('bounce');if(e.code==='Digit2')setDance('wave');if(e.code==='Digit3')setDance('spin')});window.addEventListener('keyup',e=>keys[e.code.toLowerCase()]=false);
function setDance(name){selected=name;document.querySelectorAll('.dance-button').forEach(b=>b.classList.toggle('active',b.dataset.dance===name))}
document.querySelectorAll('.dance-button').forEach(b=>b.addEventListener('click',()=>setDance(b.dataset.dance)));
document.querySelector('#invite-button').addEventListener('click',interact);
document.querySelector('#mobile-dance').addEventListener('pointerdown',e=>{e.preventDefault();dance()});
const stick=document.querySelector('#mobile-stick'),stickKnob=document.querySelector('#stick-knob');let stickPointer=null;
function moveStick(e){if(e.pointerId!==stickPointer)return;const rect=stick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+39;let dx=e.clientX-cx,dy=e.clientY-cy;const max=24,len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max}stickKnob.style.transform=`translate(${dx}px,${dy}px)`;keys.a=dx<-7;keys.d=dx>7;keys.w=dy<-7;keys.s=dy>7}
stick.addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e)});
stick.addEventListener('pointermove',moveStick);
function releaseStick(e){if(e.pointerId!==stickPointer)return;stickPointer=null;keys.a=keys.d=keys.w=keys.s=false;stickKnob.style.transform='translate(0,0)'}
stick.addEventListener('pointerup',releaseStick);stick.addEventListener('pointercancel',releaseStick);
let dragging=false,lastX=0;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw-= (e.clientX-lastX)*.006;lastX=e.clientX});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('wheel',e=>{cameraDistance=clamp(cameraDistance+Math.sign(e.deltaY)*.45,7,15);},{passive:true});
// Mobile-friendly virtual stick: tap/drag left side to walk, right side to orbit
let touchStart=null;canvas.addEventListener('touchstart',e=>{if(e.touches.length&&e.touches[0].clientX<innerWidth*.48){touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};}},{passive:true});canvas.addEventListener('touchmove',e=>{if(!touchStart||!e.touches.length)return;const t=e.touches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;keys.w=dy<-15;keys.s=dy>15;keys.a=dx<-15;keys.d=dx>15},{passive:true});canvas.addEventListener('touchend',()=>{touchStart=null;keys.w=keys.a=keys.s=keys.d=false},{passive:true});
function startAudio(){if(!soundOn)return;try{audioCtx??=new AudioContext();audioCtx.resume();if(beatTimer)return;let beat=0;beatTimer=setInterval(()=>{if(!audioCtx||audioCtx.state!=='running')return;const t=audioCtx.currentTime;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.setValueAtTime(beat%2===0?90:180,t);osc.frequency.exponentialRampToValueAtTime(beat%2===0?42:120,t+.12);gain.gain.setValueAtTime(beat%2===0?.12:.035,t);gain.gain.exponentialRampToValueAtTime(.001,t+.16);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+.17);beat++},535)}catch{}}
document.querySelector('#sound-toggle').addEventListener('click',()=>{soundOn=!soundOn;document.querySelector('#sound-icon').textContent=soundOn?'♫':'♪';document.querySelector('.sound-label').textContent=soundOn?'SOUND ON':'SOUND OFF';if(soundOn)startAudio();else if(audioCtx)audioCtx.suspend()});
document.querySelector('#start-button').addEventListener('click',()=>{started=true;document.querySelector('#intro-overlay').classList.add('hidden');startAudio();showToast('MOVE WITH THE STICK · DANCE ANYTIME · GET CLOSE TO CONNECT')});

function animateFigure(d,t,dt){const active=d===player?keys.w||keys.a||keys.s||keys.d:false;const isDancing=elapsed<(d.danceUntil||0);const phase=t*6+d.phase;
 if(active){d.body.position.y=.08+Math.abs(Math.sin(phase*1.6))*.06;d.body.rotation.z=Math.sin(phase)*.07;d.legs.forEach(l=>l.node.rotation.x=Math.sin(phase)*.62*l.side);d.arms.forEach(a=>a.node.rotation.x=-Math.sin(phase)*.55);}
 else if(isDancing){const style=d.currentDance||'bounce';d.body.position.y=.07+Math.abs(Math.sin(phase*1.6))*.15;d.body.rotation.y=style==='spin'?Math.sin(phase*.55)*.17:Math.sin(phase)*.1;d.body.rotation.z=style==='wave'?Math.sin(phase*.7)*.17:Math.sin(phase)*.08;d.arms.forEach((a,i)=>{a.node.rotation.z=(i===0?-1:1)*(style==='wave'?.8:.45)+Math.sin(phase*1.4+i)*.3;a.node.rotation.x=Math.sin(phase+i)*.48});d.legs.forEach(l=>l.node.rotation.x=Math.sin(phase*1.3+l.side)*.42);}
 else {d.body.position.y=.025+Math.sin(phase)*.035;d.body.rotation.y=Math.sin(phase*.45)*.045;d.body.rotation.z=Math.sin(phase*.8)*.025;d.arms.forEach(a=>{a.node.rotation.z=a.side*.08+Math.sin(phase+a.side)*.08;a.node.rotation.x=Math.sin(phase+a.side)*.1});d.legs.forEach(l=>l.node.rotation.x=0)}
 d.head.rotation.z=Math.sin(phase*.8)*.055;d.ring.material.opacity=d===activePartner?.98:.56;
}
function update(dt){elapsed+=dt;const speed=5.2*dt;let forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);moving=Math.abs(forward)+Math.abs(side)>0;
 if(moving&&started){const len=Math.hypot(forward,side)||1;forward/=len;side/=len;const sin=Math.sin(yaw),cos=Math.cos(yaw);const dx=(side*cos-forward*sin)*speed,dz=(-forward*cos-side*sin)*speed;pos.x=clamp(pos.x+dx,-11.8,11.8);pos.z=clamp(pos.z+dz,-11.8,11.8);player.root.rotation.y=Math.atan2(dx,-dz);}
 player.arms.forEach(a=>{});
 dancers.forEach((d,i)=>{if(!activePartner||d!==activePartner){if(dancers.includes(d)&&d!==player){d.root.position.x=d.baseX+Math.sin(elapsed*.28+d.phase)*.22;d.root.position.z=d.baseZ+Math.cos(elapsed*.3+d.phase)*.16}}animateFigure(d,elapsed,dt)});
 // cinematic follow camera, oriented behind player's facing direction with gentle easing
 const target=new THREE.Vector3(pos.x,1.3,pos.z);const cx=pos.x+Math.sin(yaw)*cameraDistance,cz=pos.z+Math.cos(yaw)*cameraDistance;const desired=new THREE.Vector3(cx,cameraHeight,cz);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(target);
 if(Math.floor(elapsed*3)!==Math.floor((elapsed-dt)*3))refreshSocial();
 const clock=Math.floor(elapsed);document.querySelector('#clock').textContent=`${String(Math.floor(clock/60)).padStart(2,'0')}:${String(clock%60).padStart(2,'0')}`;
}
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-lastTime)/1000||.016);lastTime=now;update(dt);renderer.render(scene,camera)}requestAnimationFrame(frame);
refreshSocial();
