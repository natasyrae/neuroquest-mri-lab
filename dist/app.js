(function(){
"use strict";
const {missions}=window.NQ;
const main=document.getElementById("main"),overlay=document.getElementById("overlay");
const STORE="neuroquest-lab-v1";
const blank=()=>({steps:[0,0,0,0,0],last:null,sound:false});
function clean(value){return {steps:missions.map((_,i)=>Number.isInteger(value?.steps?.[i])?Math.max(0,Math.min(3,value.steps[i])):0),last:Number.isInteger(value?.last)&&value.last>=0&&value.last<missions.length?value.last:null,sound:value?.sound===true}}
function stored(){try{const raw=localStorage.getItem(STORE);return raw?clean(JSON.parse(raw)):null}catch{return null}}
let player=stored()||blank(),audioContext=null,routeKind="",returnFocus=null,storageOk=true;
function save(){try{localStorage.setItem(STORE,JSON.stringify(player));storageOk=true}catch{storageOk=false}}
const points=[0,30,60,100];
const xp=()=>player.steps.reduce((sum,n)=>sum+points[n],0);
function icon(k){return `<span class="ico" aria-hidden="true" style="--icon:url(assets/i-${k}.png)"></span>`}
function ticks(n,total){return `<span class="ticks" aria-hidden="true">${Array.from({length:total},(_,i)=>`<i${i<n?' class="on"':""}></i>`).join("")}</span>`}
function hud(){
const x=document.getElementById("hud-xp");x.textContent=xp()+" XP";
document.getElementById("xp-indicator").setAttribute("aria-label",`Progres pemain, ${xp()} XP`);
const sound=document.getElementById("sound-btn"),label=player.sound?"Matikan efek suara":"Aktifkan efek suara";
sound.innerHTML=icon(player.sound?"sound":"mute");sound.title=label;sound.setAttribute("aria-label",label);sound.setAttribute("aria-pressed",String(player.sound));
}
function chime(type){
if(!player.sound)return;try{const Constructor=window.AudioContext||window.webkitAudioContext;if(!Constructor)return;audioContext=audioContext||new Constructor();if(audioContext.state==="suspended")audioContext.resume().catch(()=>{});
const frequencies=type==="finish"?[523.25,659.25,783.99,1046.50]:type==="retry"?[294,246.94]:[523.25,659.25];
frequencies.forEach((freq,i)=>{const start=audioContext.currentTime+.02+i*.095,osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type="triangle";osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.055,start+.01);gain.gain.exponentialRampToValueAtTime(.0001,start+.14);osc.connect(gain);gain.connect(audioContext.destination);osc.start(start);osc.stop(start+.15)});
}catch{}}
function record(id,step){
const saved=stored();if(saved){player.steps=player.steps.map((n,i)=>Math.max(n,saved.steps[i]));player.sound=saved.sound}
const n=player.steps[id];if(n>=step+1){hud();return 0}player.steps[id]=step+1;save();hud();return points[step+1]-points[n];
}
window.UI={icon,ticks,xp,chime,progress:()=>[...player.steps],record};
function nextId(){return player.last!==null&&player.steps[player.last]<3?player.last:player.steps.findIndex(n=>n<3)}
function cards(){return missions.map((m,i)=>{const n=player.steps[i];return `<a href="#misi/${i+1}" class="mission-card ${m.color}${i===nextId()?" next":""}" aria-label="Misi ${i+1}, ${m.name}, ${n===3?"selesai, main ulang":n?"lanjutkan":"mulai"}"><div class="mission-art"><span class="art-index">MISI ${String(i+1).padStart(2,"0")}</span><img src="assets/${m.icon}.png" alt="" width="80" height="58"></div><div class="card-body"><h3>${m.name}</h3><p>${m.desc}</p><div class="card-meta"><span class="play-label">${icon(n===3?"check":"play")}${n===3?"Main ulang":n?"Lanjutkan":"Mainkan"}</span><span>${n===3?"100 XP":n?points[n]+"/100 XP":"100 XP"}</span></div></div></a>`}).join("")}
function home(){
const done=player.steps.filter(n=>n===3).length,p=nextId(),resume=player.last!==null||player.steps.some(n=>n>0);
return `<section class="hero" aria-labelledby="hero-title"><img class="hero-art" src="assets/neuro-lab.webp" width="2041" height="770" fetchpriority="high" alt="Laboratorium pixel dengan peneliti di konsol dan pemindai MRI bercahaya hijau"><div class="hero-shade"></div><i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i><div class="hero-copy"><span class="eyebrow">${icon("pad")} Simulator skripsi</span><h1 id="hero-title">NeuroQuest<span>MRI Brain Lab</span></h1><p>Masuki lab Natasya dan selidiki apakah satu modul CBAM membantu AI membedakan empat kelas MRI otak.</p><div class="hero-actions"><a class="btn primary" href="#misi/${p<0?1:p+1}">${icon("play")} ${p<0?"Main lagi":resume?"Lanjut bermain":"Mulai bermain"}</a><a class="btn ghost" href="#jurnal">${icon("book")} Tentang riset</a></div></div><button class="hero-lens" data-action="lab">${icon("expand")} Lihat lab</button></section>
<section class="map-section" id="map-section" aria-labelledby="map-title"><div class="section-line"><div class="section-copy"><div class="section-heading">${icon("flag")}<h2 id="map-title">Peta Misi</h2></div><p>Lima stasiun lab, dari audit data sampai membaca prediksi.</p></div><button data-action="profile" class="map-progress" aria-label="Buka progres, ${done} dari 5 misi selesai">${ticks(done,5)}<span>${done}/5 misi selesai</span></button></div><div class="mission-grid">${cards()}</div></section>
<aside class="research-strip"><div class="book-square">${icon("chart")}</div><div><h3>Meja Uji Macro-F1</h3><p>Ubah satu prediksi pada matriks latihan dan lihat bagaimana skor tiap kelas ikut berubah.</p></div><a class="btn small" href="#simulasi">Coba simulasi bebas</a></aside>`;
}
function curr(){return location.hash.slice(1).split("/")}
function route(first=false){
const [key,a]=curr();let active="markas",page="Markas";
if(overlay.open)overlay.close();
if(key==="misi"&&/^[1-5]$/.test(a||"")){active="peta";page=missions[Number(a)-1].name;routeKind="game";const latest=stored();if(latest)player=latest;player.last=Number(a)-1;save();window.Game.start(player.last)}
else if(key==="lab"){window.Game.clear();active="peta";routeKind="lab";page="Laboratorium Eksperimen";window.Lab.start()}
else if(key==="simulasi"){window.Game.clear();active="peta";routeKind="bench";page="Meja Uji Macro-F1";window.Bench.start()}
else if(key==="jurnal"){window.Game.clear();active="jurnal";routeKind="journal";page="Jurnal Riset";main.innerHTML=window.Journal.render(a)}
else{window.Game.clear();routeKind="home";active=key==="peta"?"peta":"markas";page=active==="peta"?"Peta Misi":"MRI Brain Lab";main.innerHTML=home();const startLink=main.querySelector(".hero-actions .btn.primary");if(startLink)startLink.href="#lab"}
document.title=`${page} • NeuroQuest`;
document.querySelectorAll("[data-nav]").forEach(el=>{const on=el.dataset.nav===active;el.classList.toggle("active",on);if(on)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current")});
if(!first)main.focus({preventScroll:true});
if(key==="peta"){requestAnimationFrame(()=>document.getElementById("map-section")?.scrollIntoView({block:"start",behavior:"instant"}))}
else if(!first)window.scrollTo({top:0,behavior:"instant"});
hud();
}
function modal(title,body,wide=false){
if(!overlay.open)returnFocus=document.activeElement;
overlay.className=wide?"wide":"";
overlay.innerHTML=`<div class="dialog-body"><button class="square-btn dialog-close" data-action="close" aria-label="Tutup">${icon("close")}</button><h2 id="dialog-title">${title}</h2>${body}</div>`;
if(!overlay.open)overlay.showModal();
overlay.querySelector(".dialog-close").focus({preventScroll:true});
}
function profile(){const completed=player.steps.filter(n=>n===3).length;
modal("Progres peneliti",`<div class="profile-row"><img src="assets/researcher.png" class="profile-sprite" alt="Avatar peneliti pixel"><div><strong>${completed===5?"Peneliti NeuroQuest":completed?"Penjelajah lab":"Peneliti pemula"}</strong><p>${xp()} / 500 XP · ${completed}/5 misi selesai</p>${ticks(completed,5)}</div></div><h3 style="margin-top:18px;font-size:1rem">Lencana misi</h3><ul class="achievement-list">${missions.map((m,i)=>`<li class="${player.steps[i]===3?"won":""}"><img src="assets/${m.icon}.png" alt="">${m.reward}<span style="margin-left:auto">${player.steps[i]===3?`${icon("check")} Tuntas`:`${player.steps[i]}/3`}</span></li>`).join("")}</ul><p>${storageOk?"Progres tersimpan di browser dan perangkat ini.":"Penyimpanan browser tidak tersedia. Progres berlaku selama halaman ini terbuka."}</p><div class="dialog-actions"><a class="btn primary" href="#peta" data-action="close-link">Peta misi</a>${xp()?`<button class="btn danger" data-action="reset-prompt">Atur ulang progres</button>`:""}</div>`)}
function help(){modal("Cara bermain",`<ol><li>Pilih <b>Mulai bermain</b> untuk mengikuti urutan proposal, atau pilih langsung stasiun di Peta Misi.</li><li>Setiap misi punya tiga tantangan. Gunakan <b>Petunjuk</b>, lalu periksa jawabanmu untuk membaca penjelasannya. Kamu bisa mencoba lagi.</li><li>Kumpulkan hingga 100 XP per misi. Buka pencatat XP di bagian atas untuk melihat lima lencana dan progresmu.</li></ol><p>Gambar, heatmap, dan skor di tantangan adalah ilustrasi pembelajaran. Jurnal berisi rencana riset aslinya.</p><div class="dialog-actions"><button class="btn primary" data-action="close">Mengerti</button></div>`)}
function handleAction(action){
switch(action){
case "help":help();break;
case "profile":profile();break;
case "lab":modal("Ruang MRI",`<img class="dialog-lab" src="assets/neuro-lab.webp" alt="Ilustrasi ruang MRI dengan peneliti di konsol dan pemindai di kanan"><p>Di NeuroQuest, kamu berperan sebagai peneliti yang bekerja dengan koleksi citra MRI. Mulailah dari arsip untuk mencari salinan, lalu bawa data yang sudah diaudit ke stasiun model.</p><div class="dialog-actions"><a class="btn primary" href="#misi/1" data-action="close-link">${icon("pad")} Ke arsip MRI</a></div>`,true);break;
case "sound":{const latest=stored();if(latest)player.steps=latest.steps;player.sound=!player.sound;save();hud();if(player.sound)chime("good");document.getElementById("announcer").textContent=player.sound?"Efek suara aktif.":"Efek suara mati.";break}
case "close":case "close-link":overlay.close();break;
case "reset-prompt":modal("Atur ulang NeuroQuest?",`<p>Seluruh XP, lencana, dan progres lima misi akan dihapus dari browser ini. Kamu akan kembali ke Markas.</p><div class="dialog-actions"><button class="btn primary" data-action="profile">Simpan progres</button><button class="btn danger" data-action="reset">Ya, mulai dari awal</button></div>`);break;
case "reset":player={steps:[0,0,0,0,0],last:null,sound:player.sound};save();overlay.close();if(location.hash==="#markas")route();else location.hash="markas";hud();break;
}}
document.addEventListener("click",e=>{
const b=e.target.closest("[data-b]");if(b){window.Bench.handle(b);return}
const g=e.target.closest("[data-g]");if(g){window.Game.handle(g);return}
const a=e.target.closest("[data-action]");if(a)handleAction(a.dataset.action);
const link=e.target.closest("a[href]");if(link?.getAttribute("href")==="#peta"&&location.hash==="#peta")document.getElementById("map-section")?.scrollIntoView({block:"start"});
if(e.target===overlay){const rect=overlay.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)overlay.close()}
});
document.querySelector(".skip").addEventListener("click",e=>{e.preventDefault();main.focus()});
document.addEventListener("change",e=>{if(e.target.id==="bench-destination")window.Bench.change(e.target.value)});
document.addEventListener("input",e=>{if(e.target.id==="heat-slider")window.Game.changeHeat(e.target);if(e.target.id==="term-search")document.getElementById("terms").innerHTML=window.Journal.termsList(e.target.value)});
overlay.addEventListener("close",()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null});
window.addEventListener("hashchange",()=>route());
window.addEventListener("storage",e=>{if(e.key===STORE){player=stored()||blank();hud();if(routeKind==="home")main.innerHTML=home();if(overlay.open&&overlay.querySelector("#dialog-title")?.textContent==="Progres peneliti")profile()}});
route(true);
})();

