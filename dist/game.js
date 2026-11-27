(function(){
"use strict";
const {missions,classes}=window.NQ;
const matrix=[[19,6,1,0],[3,20,1,0],[0,2,21,1],[1,0,2,23]];
const weights=[.18,.42,.23,.30,.61,.92,.08,.44,.53];
const splitColors=["#80f1ce","#c5a9ff","#ffd287"];
const seedIds=[4,1,7,3,5,2,6],seedScores=[.78,.80,.82,.84,.85,.87,.91];
const xpByStep=[30,30,40];
let run=null;
function initial(){return {pick:null,chosen:[],order:[],train:60,val:20,group:"internal",seen:["internal"],opacity:65,hint:false,correct:false,error:"",award:0}}
function stage(){return missions[run.id].stages[run.step]}
function start(id){const progress=window.UI.progress()[id];run={id,step:progress===3?0:progress,data:initial(),done:false};draw()}
function icon(key){return window.UI.icon(key)}
function action(code,val,cls,body,props=""){return `<button type="button" data-g="${code}" data-v="${val}" class="${cls}" ${props}>${body}</button>`}
function selectable(code,v,cls,content,sel){return action(code,v,cls+(sel?" selected":""),content,`aria-pressed="${sel}"${run.data.correct?" disabled":""}`)}
function board(label,content){return `<div class="board"><div class="board-label">${label}</div>${content}</div>`}
function choices(s){
return `<div class="choice-list">${s.options.map((o,i)=>selectable(s.kind==="controls"?"multi":"pick",i,"choice",`<span class="keycap">${String.fromCharCode(65+i)}</span><span>${o}</span>`,s.kind==="controls"?run.data.chosen.includes(i):run.data.pick===i)).join("")}</div>`;
}
function context(v){
switch(v){
case "patient":return board("Identitas pasien contoh",`<div class="pair-board"><div><strong>P-07/A</strong><small>Sudah di data latih</small></div><div><strong>P-07/B</strong><small>Belum dibagi</small></div></div>`);
case "models":return board("Pasangan arsitektur",`<div class="pair-board"><div><strong>EfficientNet-B0</strong><small>Pembanding standar</small></div><div><strong>B0 + CBAM</strong><small>Model modifikasi</small></div></div>`);
case "external":return board("Dua sumber MRI",`<div class="pair-board"><div><strong>Nickparvar v2</strong><small>Latih, validasi, uji internal</small></div><div><strong>BDNeuro-MRI v9</strong><small>Kandidat uji eksternal</small></div></div>`);
case "case":return board("Kasus latihan • citra ilustratif",`<div class="scan-view"><div class="scan-window"><img src="assets/slice-1.png" alt="Ilustrasi potongan MRI dengan sorotan contoh"><span class="heat-layer" style="opacity:.65"></span></div><div class="case-facts"><p>Label dataset<br><strong>Glioma</strong></p><p>Prediksi model<br><strong>Meningioma</strong></p></div></div>`);
case "limits":return board("Bahan interpretasi",`<div class="pair-board"><div><strong>Tersedia</strong><small>Label, prediksi, citra, dan heatmap</small></div><div><strong>Belum tersedia</strong><small>Anotasi batas tumor dari ahli</small></div></div>`);
default:return "";
}
}
function duplicates(){
const variants=[0,1,0,2],files=["A · MRI_014","B · MRI_022","C · MRI_067","D · MRI_103"];
return board("Arsip MRI • 4 citra sintetis",`<div class="gallery">${variants.map((v,i)=>selectable("multi",i,"scan-card item-option",`<img src="assets/slice-${v}.png" alt="Pola ${["lonjong dengan lipatan tengah","lebih sempit dengan lipatan bercabang","lonjong dengan lipatan tengah","lebih bulat dengan lipatan rendah"][i]}"><span>${files[i]}</span>`,run.data.chosen.includes(i))).join("")}</div><p class="table-note">${run.data.chosen.length}/2 berkas dipilih</p>`);
}
function splits(){
const d=run.data,nums=[d.train,d.val,100-d.train-d.val],keys=["train","val","test"];
return board("100 citra contoh • target pembagian",`<div class="split-band" aria-hidden="true">${nums.map((n,i)=>`<i style="background:${splitColors[i]};width:${n}%"></i>`).join("")}</div>${nums.map((n,i)=>`<div class="split-row" style="--color:${splitColors[i]}"><span class="dot"></span>${["Latih","Validasi","Uji"][i]}<strong>${n}%</strong>${i<2?[-5,5].map(delta=>action("split",`${keys[i]},${delta}`,"adjust",delta<0?"−":"+",`aria-label="${delta<0?"Kurangi":"Tambah"} ${i?"validasi":"latih"} lima persen" ${d.correct||(delta<0?n<10:nums[2]<10)?"disabled":""}`)).join(""):`<span style="width:74px;text-align:center;color:var(--faint);font-size:.8rem">otomatis</span>`}</div>`).join("")}`);
}
function order(s){
const current=run.data.order;
return board("Keluaran backbone B0",`<div class="slots" aria-label="Urutan yang dirakit">${Array.from({length:4},(_,i)=>{const part=current[i];return part===undefined?`<span class="slot">${i+1}. …</span>`:action("remove",i,"slot filled",`${i+1}. ${s.blocks[part]}`,`aria-label="Lepas ${s.blocks[part]}" ${run.data.correct?"disabled":""}`)}).join("")}</div><p class="hint-text">Pilih blok untuk memasang. Ketuk blok terpasang untuk melepasnya.</p><div class="pool">${s.blocks.map((label,i)=>action("add",i,"part",label,current.includes(i)||run.data.correct?"disabled":"")).join("")}</div>`);
}
function spatial(){
return board("Peta bobot spasial • contoh 3 × 3",`<div class="weight-grid">${weights.map((w,i)=>selectable("pick",i,"weight",`<span>${w.toFixed(2).replace(".",",")}</span>`,run.data.pick===i).replace('class="weight',`style="--tone:rgb(${40+w*50} ${49+w*49} ${68+w*60})" class="weight`)).join("")}</div>`);
}
function runs(){
return board("Rencana pelatihan",`<div class="pair-board"><div><strong>10</strong><small>konfigurasi</small></div><div><strong>7</strong><small>seed per konfigurasi</small></div></div>`)+`<div class="number-options">${[7,17,35,70].map(n=>selectable("pick",n,"item-option",n+" run",run.data.pick===n)).join("")}</div>`;
}
function median(){
return board("Macro-F1 validasi • angka simulasi",`<div class="seed-list">${seedIds.map((id,i)=>selectable("pick",i,"seed",`<small>Seed ${id}</small>${seedScores[i].toFixed(2).replace(".",",")}`,run.data.pick===i)).join("")}</div>`);
}
function matrixBoard(){
const short=["Glioma","Mening.","Pituitari","Tanpa T."];
return board("Confusion matrix • angka simulasi",`<div class="table-wrap"><table class="matrix"><caption class="sr-only">Baris adalah label dataset dan kolom adalah prediksi</caption><thead><tr><th scope="col">Label ∖ Pred.</th>${short.map((s,i)=>`<th scope="col" title="${classes[i]}">${s}</th>`).join("")}</tr></thead><tbody>${matrix.map((row,r)=>`<tr><th scope="row">${short[r]}</th>${row.map((n,c)=>`<td>${action("pick",r*4+c,(r===c?"diag ":"")+(run.data.pick===r*4+c?"selected":""),n,`aria-label="Label ${classes[r]}, prediksi ${classes[c]}, ${n} citra" aria-pressed="${run.data.pick===r*4+c}" ${run.data.correct?"disabled":""}`)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="table-note">Mening. = meningioma · Tanpa T. = tanpa tumor</p>`);
}
function gap(){
const d=run.data,internal=d.group==="internal",scores=internal?[80,84]:[74,72];
return board("Macro-F1 • skor contoh terpisah dari matriks latihan",`<div class="switcher">${["internal","eksternal"].map(k=>selectable("group",k,"",k==="internal"?"Internal":"Eksternal",d.group===k)).join("")}</div><div class="score-rows">${scores.map((n,i)=>`<div class="score-row"><span>${i?"B0 + CBAM":"B0 standar"}</span><span class="bar"><i style="width:${n}%;--bar:${i?"var(--mint)":"var(--violet)"}"></i></span><strong>${n}%</strong></div>`).join("")}</div>`)+`<div class="gain-options">${[-2,2,4,-4].map(n=>selectable("pick",n,"item-option",`${n>0?"+":"−"}${Math.abs(n)} poin`,d.pick===n)).join("")}</div>`;
}
function heat(s){
const n=run.data.opacity;
return board("Ilustrasi MRI dan heatmap sintetis",`<div class="scan-view"><div class="scan-window"><img src="assets/slice-0.png" alt="Ilustrasi kepala MRI di tengah kotak"><span class="heat-layer" id="heat-layer" style="opacity:${n/100}"></span></div><div class="scanner-control"><label for="heat-slider">Opasitas heatmap</label><input id="heat-slider" type="range" min="0" max="100" step="1" value="${n}"><output for="heat-slider" id="heat-value">${n}%</output><p class="hint-text">0% memperlihatkan citra saja. Pada heatmap, kuning menunjukkan sorotan terkuat.</p><details class="detail"><summary>Deskripsi visual</summary><p class="hint-text">Bercak kuning berada di sudut kanan atas kotak, di luar garis kepala. Bercak yang lebih redup menyentuh kepala.</p></details></div></div>`)+choices(s);
}
function widget(s){switch(s.kind){
case "duplicates":return duplicates();case "split":return splits();case "order":return order(s);case "spatial":return spatial();case "controls":return choices(s);case "runs":return runs();case "median":return median();case "matrix":return matrixBoard();case "gap":return gap();case "heat":return heat(s);default:return context(s.visual)+choices(s);
}}
function grade(s,d){
const same=(a,b)=>a.length===b.length&&a.every((n,i)=>n===b[i]);
switch(s.kind){
case "duplicates":return same([...d.chosen].sort(),[0,2]);
case "split":return d.train===70&&d.val===15;
case "order":return same(d.order,s.answer);
case "controls":return same([...d.chosen].sort(),s.answer);
case "spatial":return d.pick===5;
case "runs":return d.pick===70;
case "median":return d.pick===3;
case "matrix":return d.pick===1;
case "gap":return d.seen.includes("eksternal")&&d.pick===-2;
default:return d.pick===s.correct;
}}
function correction(s,d){
if(s.kind==="duplicates"&&d.chosen.length<2)return "Pilih dua berkas sebelum memeriksa pasangan.";
if(s.kind==="controls"&&d.chosen.length<3)return "Pilih tiga aturan untuk pasangan model.";
if(s.kind==="order"&&d.order.length<4)return "Masih ada slot kosong. Isi keempat slot sebelum memeriksa jalur fitur.";
if(s.kind==="gap"&&!d.seen.includes("eksternal"))return "Buka tab Eksternal untuk melihat skor yang perlu kamu kurangkan.";
if(!["duplicates","controls","order","split"].includes(s.kind)&&d.pick===null)return "Pilih satu jawaban, lalu periksa lagi.";
if(s.kind==="matrix"&&Math.floor(d.pick/4)===d.pick%4)return "Sel diagonal berisi prediksi benar. Cari kesalahan pada sel di luar diagonal.";
return s.hint;
}
function progressTicks(n,total){return window.UI.ticks(n,total)}
function draw(focusTarget){
if(!run)return;
const main=document.getElementById("main"),m=missions[run.id];
if(run.done){finish();return}
const s=stage(),d=run.data;
main.innerHTML=`<div class="${m.color}"><div class="page-back"><a href="#peta">Peta misi</a><span class="divider">/</span>Misi ${String(run.id+1).padStart(2,"0")}</div>
<header class="game-title"><div><div class="eyebrow">${icon("flag")} Misi ${String(run.id+1).padStart(2,"0")} · ${m.skill}</div><h1>${m.name}</h1><p>${m.desc}</p></div><div class="game-track">${progressTicks(run.step+(d.correct?1:0),3)}<span>Langkah ${run.step+1}/3</span></div></header>
<div class="game-layout"><article class="station panel"><div class="step-kicker">Tantangan ${run.step+1} · ${xpByStep[run.step]} XP</div><h2>${s.title}</h2><p class="prompt">${s.prompt}</p>${widget(s)}
${d.hint?`<p class="hint" id="clue">${s.hint}</p>`:""}
${d.correct?`<div class="feedback good" role="status" id="fb" tabindex="-1"><strong>${icon("check")} Tepat! ${d.award?`+${d.award} XP`:"Tantangan sudah tercatat"}</strong>${s.why}</div>`:d.error?`<div class="feedback bad" role="status" id="fb" tabindex="-1"><strong>Coba lagi</strong>${d.error}</div>`:""}
<div class="station-controls">${action("hint","","hint-button",`${icon("hint")}${d.hint?"Tutup petunjuk":"Petunjuk"}`,`aria-expanded="${d.hint}"`)}${d.correct?action("next","","btn primary",run.step===2?"Selesaikan misi":"Langkah berikutnya"):action("check","","btn primary","Periksa jawaban")}</div></article>
<aside class="panel side-box"><div class="side-art"><img src="assets/${m.icon}.png" alt=""></div><div class="side-content"><h3>Di proposal Natasya</h3><p>${m.note}</p><a class="text-btn" href="#jurnal/${run.id<2?"metode":"evaluasi"}">${icon("book")} Baca metode riset</a>${run.id===3?'<br><a class="text-btn" href="#simulasi">Coba meja uji macro-F1</a>':""}</div></aside></div></div>`;
if(focusTarget){const el=main.querySelector(focusTarget);if(el)el.focus({preventScroll:focusTarget!=="#fb"})}
}
function finish(){
const m=missions[run.id],progress=window.UI.progress(),n=progress.filter(x=>x===3).length,all=n===missions.length;
const next=missions.findIndex((_,i)=>i>run.id&&progress[i]<3);
const nextId=next>=0?next:progress.findIndex(p=>p<3);
document.getElementById("main").innerHTML=`<div class="page-back"><a href="#peta">Peta misi</a><span class="divider">/</span>Hasil misi</div><section class="${m.color} panel finish"><img class="completion-sprite" src="assets/${m.icon}.png" alt=""><span class="eyebrow">${icon("star")} Lencana ${m.reward}</span><h1>${all?"NeuroQuest selesai!":"Misi selesai!"}</h1><p><strong>${m.name}</strong> sudah tercatat. ${n} dari 5 misi tuntas · ${window.UI.xp()} XP terkumpul.</p><p>${all?"Kamu sudah mengaudit data, merakit CBAM, memasangkan pelatihan, membandingkan skor, dan menafsirkan heatmap. Buka jurnal untuk menghubungkan keputusanmu dengan tiga pertanyaan skripsi.":m.note}</p><div class="finish-actions">${all?`<a class="btn primary" href="#jurnal">${icon("book")} Buka jurnal riset</a>`:`<a class="btn primary" href="#misi/${nextId+1}">${icon("play")} Misi berikutnya</a>`}<a class="btn" href="#peta">Peta misi</a>${action("replay","","text-btn","Ulangi misi")}</div></section>`;
}
function handle(btn){
if(!run)return;
const type=btn.dataset.g,v=btn.dataset.v,d=run.data,s=stage();
if(type==="replay"){start(run.id);window.scrollTo(0,0);return}
if(type==="hint"){d.hint=!d.hint;draw('[data-g="hint"]');return}
if(type==="next"&&d.correct){if(run.step===2){run.done=true;finish();window.UI.chime("finish")}else{run.step++;run.data=initial();draw()}window.scrollTo(0,0);document.getElementById("main").focus({preventScroll:true});return}
if(d.correct)return;
if(type==="check"){
 if(grade(s,d)){d.correct=true;d.award=window.UI.record(run.id,run.step);d.error="";window.UI.chime("good")}else{d.error=correction(s,d);window.UI.chime("retry")}
 draw("#fb");return;
}
d.error="";
switch(type){
case "pick":d.pick=Number(v);break;
case "multi":{const num=Number(v),max=s.kind==="controls"?3:2;if(d.chosen.includes(num)){d.chosen=d.chosen.filter(n=>n!==num)}else if(d.chosen.length<max){d.chosen.push(num)}else{d.error=`Sudah ada ${max} pilihan. Ketuk satu pilihan untuk melepasnya sebelum mengganti.`}break}
case "split":{const [key,delta]=v.split(","),k=Number(delta);if((key==="val"||key==="train")&&d[key]+k>=5&&100-d.train-d.val-k>=5)d[key]+=k;break}
case "add":{const n=Number(v);if(!d.order.includes(n)&&d.order.length<4)d.order.push(n);break}
case "remove":d.order.splice(Number(v),1);break;
case "group":d.group=v;if(!d.seen.includes(v))d.seen.push(v);break;
default:return;
}
draw(`[data-g="${type}"][data-v="${v}"]:not(:disabled)`);
}
function changeHeat(input){if(!run||stage().kind!=="heat")return;run.data.opacity=Number(input.value);document.getElementById("heat-layer").style.opacity=input.value/100;document.getElementById("heat-value").textContent=input.value+"%"}
window.Game={start,handle,changeHeat,clear(){run=null}};
})();

