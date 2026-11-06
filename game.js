(()=>{'use strict';
const canvas=document.querySelector('#game'),view=canvas.getContext('2d'),art=document.createElement('canvas');
art.width=500;art.height=313;const ctx=art.getContext('2d');ctx.scale(0.5,0.5);ctx.imageSmoothingEnabled=false;
const W=1000,H=625,ui={overlay:document.querySelector('#overlay'),start:document.querySelector('#startBtn'),wave:document.querySelector('#wave'),score:document.querySelector('#score'),health:document.querySelector('#health'),healthNum:document.querySelector('#healthNum'),pause:document.querySelector('#pauseBtn'),sound:document.querySelector('#soundBtn'),toast:document.querySelector('#toast')};
let keys=new Set(),actors=[],particles=[],floating=[],running=false,paused=false,gameOver=false,sound=true,score=0,round=1,spawnLeft=0,spawnTimer=0,cam=0,last=0,shake=0,toastTimer=0,audio;
const player={x:500,z:.62,hp:100,max:100,face:1,attack:0,attackType:'punch',attackCd:0,dash:0,dashCd:0,invuln:0,stun:0,combo:0,comboTimer:0,step:0};
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function beep(freq=170,dur=.07,type='square',vol=.035){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+dur)}catch{}}
function resize(){const dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);view.imageSmoothingEnabled=false}addEventListener('resize',resize);resize();
function poly(points,fill,stroke=null,lw=1){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function ellipse(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
function rr(x,y,w,h,r,fill,stroke=null){ctx.beginPath();ctx.rect(x,y,w,h);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function background(){
 const sky=ctx.createLinearGradient(0,0,0,260);sky.addColorStop(0,'#556be4');sky.addColorStop(.58,'#b66b83');sky.addColorStop(1,'#e79b63');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // Kyiv twilight above the Dnipro ravine
 ellipse(835,112,39,30,'#ffd77b');ellipse(835,112,26,22,'#fff0ae');
 // far skyline and golden dome silhouettes
 for(let i=0;i<13;i++){let x=i*84-20,h=65+(i*37%55);ctx.fillStyle=['#55505b','#62525b','#685a60'][i%3];ctx.fillRect(x,182-h,76,h+55);ctx.fillStyle='#efa67555';for(let j=0;j<3;j++)for(let k=0;k<3;k++)ctx.fillRect(x+10+j*19,194-h+k*17,7,5)}
 // distant green tree canopy and rocky gorge
 poly([[0,258],[61,213],[127,252],[201,188],[263,230],[338,147],[423,199],[489,118],[559,179],[646,106],[712,180],[783,137],[856,198],[918,147],[1000,212],[1000,379],[0,379]],'#332b36');
 for(let i=0;i<28;i++){const x=i*39-12,top=153+(i*47%95);poly([[x,top+42],[x+10,top+18],[x+17,top+21],[x+24,top],[x+35,top+30],[x+44,top+35],[x+39,top+55]],i%3?'#74452f':'#8c5135');poly([[x+14,top+24],[x+24,top],[x+35,top+29],[x+26,top+34]],'#d18b53');}
 // lush leafy canopy patches
 for(let i=0;i<80;i++){const x=(i*127+13)%1000,y=245+(i*67%114);ctx.fillStyle=['#174b24','#23612b','#2d702e','#17451f'][i%4];ctx.fillRect(x,y,rand(10,23),rand(4,8));ctx.fillStyle='#a1a044';ctx.fillRect(x+3,y+1,3,2)}
 // ravine floor, earthen path and green pixel grass
 poly([[0,363],[1000,363],[1000,625],[0,625]],'#18351d');
 for(let i=0;i<750;i++){const x=(i*83+11)%1000,y=374+(i*137%247);ctx.fillStyle=['#24562a','#2e692d','#356e32','#173c22','#3c732e'][i%5];ctx.fillRect(x,y,rand(4,15),rand(2,5));if(i%4===0){ctx.fillStyle='#9b913f';ctx.fillRect(x+2,y,2,2)}}
 // cobbled trail stripes and mossy pavement
 poly([[300,366],[700,366],[1000,625],[0,625]],'#343b29');poly([[370,367],[630,367],[857,625],[145,625]],'#42432c');
 for(let i=0;i<110;i++){let t=(i%11)/11,y=375+Math.floor(i/11)*25,x=320+t*360+(Math.floor(i/11)%2)*15;ctx.fillStyle=i%3?'#5c5633':'#777047';ctx.fillRect(x,y,10+Math.random()*18,3)}
 // foreground ledge, rock clusters frame the screen
 for(let side of [0,1]){for(let i=0;i<45;i++){let x=side?1000-(i*29%190):i*29%190,y=287+(i*41%280),r=8+(i*13%19);poly([[x-r,y+r*.25],[x-r*.6,y-r*.55],[x-r*.08,y-r],[x+r*.55,y-r*.75],[x+r,y+r*.1],[x+r*.5,y+r*.7],[x-r*.6,y+r*.75]],i%3?'#733e2d':'#925238');poly([[x-r*.08,y-r],[x+r*.55,y-r*.75],[x+r,y+r*.1],[x+r*.12,y-r*.08]],'#c17a48');}}
 // plants and wrecked Kyiv street sign
 for(let x of [214,791]){ctx.fillStyle='#806342';ctx.fillRect(x,316,5,50);ellipse(x,307,21,15,'#2d632f');ellipse(x-12,314,13,9,'#34753b');}
 ctx.fillStyle='#273b40';ctx.fillRect(78,297,4,54);rr(82,295,75,18,0,'#d7cba0');ctx.fillStyle='#34412e';ctx.font='bold 11px monospace';ctx.fillText('ПОДІЛ',87,308);
 // broad shadows
 const vg=ctx.createRadialGradient(500,340,220,500,340,640);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#070d1088');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}
function screenX(x){return x-cam}
function groundY(z){return 330+z*290}
function drawShadow(x,y,s){ellipse(x,y-2,24*s,8*s,'#10161290')}
function drawToad(x,y,scale,face,frame,kind='player',attack=0,invuln=0){
 const green=kind==='player'?'#23df42':kind==='heavy'?'#dc496f':'#d74375',dark=kind==='player'?'#14722b':'#842b50',belly=kind==='player'?'#a2ef55':'#f09aab';
 if(invuln>0&&Math.floor(performance.now()/75)%2===0)return;ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);const bob=Math.sin(frame*10)*1.6,stride=Math.sin(frame*10)*4;
 // muscular frog legs and chunky boots
 ellipse(-10+stride,0,13,7,'#10261a');ellipse(12-stride,-1,13,7,'#10261a');ctx.fillStyle=green;ctx.beginPath();ctx.ellipse(-9+stride,-10,8,14,-.25,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(9-stride,-11,8,14,.25,0,Math.PI*2);ctx.fill();
 // broad body and pale plated chest
 ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(0,-29+bob,25,28,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=green;ctx.beginPath();ctx.ellipse(-2,-33+bob,23,26,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=belly;ctx.beginPath();ctx.ellipse(0,-22+bob,14,16,0,0,Math.PI*2);ctx.fill();
 // arm pose, oversized fighting gloves
 const wind=attack>0?Math.sin((1-attack)*Math.PI)*22:0,glove=kind==='player'?'#4b647c':'#5c3241';ctx.strokeStyle=green;ctx.lineWidth=11;ctx.lineCap='square';ctx.beginPath();ctx.moveTo(-16,-39+bob);ctx.lineTo(-25,-22+bob+stride*.3);ctx.moveTo(15,-39+bob);ctx.lineTo(24+wind*face,-26+bob);ctx.stroke();rr(-33,-24+bob+stride*.3,17,12,2,glove);rr(18+wind*face,-30+bob,20,13,2,glove);
 // big round frog head, eyes, smirk
 ellipse(0,-59+bob,25,18,green);ellipse(-11,-68+bob,10,9,'#68f04d');ellipse(11,-68+bob,10,9,'#68f04d');for(const ex of [-11,11]){ellipse(ex,-68+bob,7,7,'#fff2b0');ellipse(ex+face*2,-68+bob,3,4,'#101c22')}
 ctx.strokeStyle=dark;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-20,-76+bob);ctx.lineTo(-5,-73+bob);ctx.moveTo(5,-73+bob);ctx.lineTo(20,-76+bob);ctx.stroke();ctx.strokeStyle='#102c24';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-51+bob);ctx.quadraticCurveTo(0,-46+bob,11,-52+bob);ctx.stroke();
 if(kind==='player'){rr(-11,-44+bob,22,6,0,'#273b3c');ctx.fillStyle='#e7e98a';ctx.font='bold 6px monospace';ctx.fillText('KYIV',-8,-39+bob)}else{ctx.fillStyle='#b9a2c3';ctx.beginPath();ctx.moveTo(-6,-82+bob);ctx.lineTo(0,-93+bob);ctx.lineTo(5,-81+bob);ctx.fill()}
 if(attack>0){ctx.strokeStyle=kind==='player'?'#f5e548':'#f5b0d1';ctx.globalAlpha=Math.min(.85,attack*3);ctx.lineWidth=5;ctx.beginPath();ctx.arc(face*22,-36+bob,27,-.8,.85);ctx.stroke();ctx.globalAlpha=1}ctx.restore();
}
function drawCar(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ellipse(0,0,53,13,'#151b18');poly([[-50,-12],[-40,-29],[-20,-39],[22,-37],[43,-24],[54,-12],[49,0],[-46,0]],'#8f4e3e','#d7ae7b',1.2);poly([[-29,-29],[-17,-36],[18,-34],[34,-24],[-31,-24]],'#7d9a94');rr(-45,-15,89,6,0,'#d7c78c');ellipse(-31,-1,8,5,'#20231f');ellipse(34,-1,8,5,'#20231f');ctx.restore()}
function drawScene(){ctx.save();if(shake>0)ctx.translate(rand(-shake,shake),rand(-shake,shake));background();drawCar(screenX(255),groundY(.22),.55);drawCar(screenX(862),groundY(.28),.66);const ordered=[...actors,{...player,isPlayer:true}].sort((a,b)=>a.z-b.z);
 for(const a of ordered){const x=screenX(a.x),y=groundY(a.z);if(x<-100||x>1100)continue;const s=.53+a.z*.7;drawShadow(x,y,s);if(a.isPlayer)drawToad(x,y,s,a.face,a.step,'player',a.attack,a.invuln);else{drawToad(x,y,s,a.face,a.step,a.kind,a.attack,0);if(a.hp<a.max){ctx.fillStyle='#111';ctx.fillRect(x-17*s,y-101*s,34*s,4);ctx.fillStyle='#ff755f';ctx.fillRect(x-17*s,y-101*s,34*s*clamp(a.hp/a.max,0,1),4)}}}
 for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);if(p.type==='spark'){ctx.fillStyle=p.color;ctx.fillRect(p.x-cam+p.vx*p.age,p.y+p.vy*p.age,5,5)}else{ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x-cam,p.y,p.rad*(1-p.life/p.max),0,Math.PI*2);ctx.stroke()}}ctx.globalAlpha=1;
 for(const f of floating){ctx.globalAlpha=clamp(f.life,0,1);ctx.textAlign='center';ctx.font=`900 ${f.size}px sans-serif`;ctx.fillStyle=f.color;ctx.shadowColor='#17201a';ctx.shadowBlur=8;ctx.fillText(f.text,f.x-cam,f.y);ctx.shadowBlur=0}ctx.globalAlpha=1;ctx.textAlign='left';if(player.hp<32){ctx.fillStyle=`rgba(184,40,34,${.12+Math.sin(performance.now()/170)*.06})`;ctx.fillRect(0,0,W,H)}ctx.restore();view.clearRect(0,0,canvas.width,canvas.height);view.drawImage(art,0,0,canvas.width,canvas.height);
}
function burst(x,y,color,n=8){for(let i=0;i<n;i++)particles.push({type:'spark',x,y,vx:rand(-2.5,2.5),vy:rand(-3,1),age:0,life:rand(.22,.55),max:.55,color})}
function pop(text,x,y,color='#e8f3d9',size=22){floating.push({text,x,y,color,size,life:1,vy:rand(22,36)})}
function spawnEnemy(){const side=Math.random()<.5?-1:1;const x=clamp(player.x+side*rand(300,430),55,1545),z=rand(.3,.88),heavy=round>1&&Math.random()<Math.min(.4,.13*round);actors.push({x,z,hp:heavy?70:42,max:heavy?70:42,face:x<player.x?1:-1,step:rand(0,5),attack:0,attackCd:rand(.5,1.4),stun:0,kind:heavy?'heavy':'goon',speed:heavy?45:62,wind:0});}
function nextWave(){round++;spawnLeft=Math.min(3+round,10);spawnTimer=.45;player.hp=Math.min(player.max,player.hp+14);ui.wave.textContent=String(round).padStart(2,'0');pop('+14 HP',player.x,groundY(player.z)-72,'#c8f366',21);ui.toast.textContent=`ROUND ${round}`;ui.toast.classList.add('show');toastTimer=1.6;beep(540,.15,'triangle')}
function attack(type){if(!running||paused||gameOver||player.attackCd>0)return;player.attackType=type;player.attack=type==='kick'?.42:.31;player.attackCd=type==='kick'?.48:.35;player.combo++;player.comboTimer=1.25;beep(type==='kick'?110:180,type==='kick'?.14:.06,type==='kick'?'sawtooth':'square',.045);
 let hits=0;for(const e of actors){const dx=e.x-player.x,dz=Math.abs(e.z-player.z);const range=type==='kick'?126:93;if(Math.abs(dx)<range&&dz<.2&&(Math.sign(dx)===player.face||Math.abs(dx)<32)){const dmg=type==='kick'?32:22;e.hp-=dmg;e.stun=type==='kick'?.72:.48;e.x+=player.face*(type==='kick'?27:15);e.attack=type==='kick'?.32:.22;hits++;burst(e.x,groundY(e.z)-45,Math.random()<.5?'#e4f97e':'#ffb070',type==='kick'?13:8);pop(type==='kick'?'KRAK!':'WHAP!',e.x,groundY(e.z)-78,type==='kick'?'#ffcb71':'#dbf686',type==='kick'?23:19);shake=type==='kick'?5:2.5;if(e.hp<=0){score+=e.kind==='heavy'?250:100;ui.score.textContent=String(score).padStart(4,'0');pop(e.kind==='heavy'?'BUSTED!':'+100',e.x,groundY(e.z)-107,'#c8f366',23);burst(e.x,groundY(e.z)-38,'#a9da55',15)}}}if(hits===0&&Math.random()<.55){ctx;}actors=actors.filter(e=>e.hp>0)}
function damagePlayer(amount,enemy){if(player.invuln>0||gameOver)return;player.hp=Math.max(0,player.hp-amount);player.invuln=.7;player.stun=.16;player.x+=Math.sign(player.x-enemy.x)*20;shake=7;burst(player.x,groundY(player.z)-45,'#ff7460',10);pop('+'+amount+'!',player.x,groundY(player.z)-85,'#ff7b69',24);beep(75,.19,'sawtooth',.05);if(player.hp<=0){gameOver=true;running=false;showCard('GAME OVER','THE STREETS ARE STILL OUT THERE.','You cleared '+score.toLocaleString()+' points worth of trouble across '+round+' round'+(round===1?'':'s')+'. Take a breath, then get back in the fight.','RUN IT BACK ↻')}}
function showCard(title,kicker,description,button){ui.overlay.innerHTML=`<section class="card"><span class="eyebrow">${kicker}</span><h1>${title.includes(' ')?title.replace(' ','<span>')+'</span>':title}</h1><p>${description}</p><div class="keys"><span class="key"><b>WASD</b> MOVE</span><span class="key"><b>J</b> PUNCH</span><span class="key"><b>K</b> KICK</span><span class="key"><b>SHIFT</b> DASH</span></div><button class="startbtn" id="restartBtn">${button}</button><div class="note">ONE TOAD. ONE CITY. ABSOLUTELY NO CHILL.</div></section>`;ui.overlay.classList.remove('hidden');document.querySelector('#restartBtn').onclick=resetGame}
function resetGame(){player.x=500;player.z=.62;player.hp=100;player.face=1;player.attack=player.attackCd=player.dash=player.dashCd=player.invuln=player.stun=player.combo=0;actors=[];particles=[];floating=[];score=0;round=1;spawnLeft=4;spawnTimer=.2;gameOver=false;paused=false;running=true;cam=0;ui.score.textContent='0000';ui.wave.textContent='01';ui.overlay.classList.add('hidden');ui.pause.textContent='Ⅱ  PAUSE';toast('ROUND 1');}
function toast(msg){ui.toast.textContent=msg;ui.toast.classList.add('show');toastTimer=1.6}
function update(dt){if(!running||paused)return;dt=Math.min(dt,.035);player.step+=dt;player.attack=Math.max(0,player.attack-dt);player.attackCd=Math.max(0,player.attackCd-dt);player.dashCd=Math.max(0,player.dashCd-dt);player.invuln=Math.max(0,player.invuln-dt);player.stun=Math.max(0,player.stun-dt);player.comboTimer-=dt;if(player.comboTimer<=0)player.combo=0;
 let dx=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0),dz=(keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0);const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;
 if(keys.has('Shift')&&player.dashCd<=0&&(dx||dz)&&player.stun<=0){player.dash=.18;player.dashCd=.8;player.invuln=.23;beep(290,.08,'triangle')};if(player.dash>0)player.dash=Math.max(0,player.dash-dt);
 const speed=player.dash>0?570:player.attack>0?115:215;if(player.stun<=0){player.x=clamp(player.x+dx*speed*dt,55,1545);player.z=clamp(player.z+dz*speed*dt,.12,.94);if(dx)player.face=Math.sign(dx);if(dx||dz)player.step+=dt*5}
 if((keys.has('j')||keys.has(' '))&&player.attackCd<=0)attack('punch');if(keys.has('k')&&player.attackCd<=0)attack('kick');
 cam+=(clamp(player.x-500,0,545)-cam)*Math.min(1,dt*4);
 if(spawnLeft>0){spawnTimer-=dt;if(spawnTimer<=0){spawnEnemy();spawnLeft--;spawnTimer=rand(.65,1.15)}}
 for(const e of actors){e.step+=dt;e.attack=Math.max(0,e.attack-dt);e.attackCd-=dt;e.stun=Math.max(0,e.stun-dt);const vx=player.x-e.x,vz=player.z-e.z,dist=Math.hypot(vx,vz*560);e.face=vx<0?-1:1;if(e.stun<=0){if(Math.abs(vx)>57||Math.abs(vz)>.075){const l=Math.hypot(vx,vz*560)||1;e.x+=vx/l*e.speed*dt;e.z+=vz/l*e.speed/560*dt}else if(e.attackCd<=0){e.attackCd=rand(1.05,1.7);e.attack=.35;e.wind=.19;setTimeout(()=>{if(!paused&&running&&Math.abs(e.x-player.x)<93&&Math.abs(e.z-player.z)<.17)damagePlayer(e.kind==='heavy'?14:9,e)},160);}}
 }
 actors=actors.filter(e=>e.hp>0);if(spawnLeft===0&&actors.length===0)nextWave();
 for(const p of particles){p.age+=dt;p.life-=dt;p.x+=p.vx;p.y+=p.vy;p.vy+=6*dt}particles=particles.filter(p=>p.life>0);for(const f of floating){f.life-=dt;f.y-=f.vy*dt}floating=floating.filter(f=>f.life>0);shake=Math.max(0,shake-dt*18);toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show');
 ui.health.style.width=`${player.hp}%`;ui.health.style.background=player.hp<30?'#ff715f':'#c8f366';ui.healthNum.textContent=player.hp;
}
function frame(t){const dt=(t-last)/1000||0;last=t;update(dt);drawScene();requestAnimationFrame(frame)}requestAnimationFrame(frame);
function start(){if(gameOver){resetGame();return}if(!running){running=true;paused=false;ui.overlay.classList.add('hidden');player.x=500;player.hp=100;spawnLeft=4;spawnTimer=.3} }
ui.start.addEventListener('click',start);ui.pause.addEventListener('click',()=>{if(!running||gameOver)return;paused=!paused;ui.pause.textContent=paused?'▶  RESUME':'Ⅱ  PAUSE';if(paused)toast('PAUSED');else ui.toast.classList.remove('show')});ui.sound.addEventListener('click',()=>{sound=!sound;ui.sound.textContent=sound?'♫  SOUND ON':'♫  SOUND OFF';if(sound)beep(440,.08,'sine')});
addEventListener('keydown',e=>{const k=e.key===' '?' ':e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k))e.preventDefault();if(k==='Escape'){if(running){paused=!paused;ui.pause.textContent=paused?'▶  RESUME':'Ⅱ  PAUSE'}return}keys.add(k);if(k==='Enter'&&!running)start()});addEventListener('keyup',e=>{const k=e.key===' '?' ':e.key.length===1?e.key.toLowerCase():e.key;keys.delete(k)});addEventListener('blur',()=>keys.clear());
document.querySelectorAll('.touchbtn').forEach(b=>{const k=b.dataset.key;const on=e=>{e.preventDefault();keys.add(k);b.classList.add('pressed');try{b.setPointerCapture(e.pointerId)}catch{}};const off=e=>{e.preventDefault();keys.delete(k);b.classList.remove('pressed')};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off)});
})();
