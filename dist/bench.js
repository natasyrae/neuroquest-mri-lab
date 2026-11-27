(function(){
"use strict";
const labels=window.NQ.classes;
const original=[[19,6,1,0],[3,20,1,0],[0,2,21,1],[1,0,2,23]];
let cells,source,to,history;
function reset(){cells=original.map(row=>[...row]);source=[0,1];to=0;history=[]}
reset();
function metrics(m){const classes=m.map((row,i)=>{const denominator=row.reduce((a,b)=>a+b,0)+m.reduce((sum,r)=>sum+r[i],0);return denominator?2*row[i]/denominator:0});return {classes,macro:classes.reduce((a,b)=>a+b,0)/classes.length}}
const base=metrics(original);
function percentage(n,digits=2){return (100*n).toLocaleString("id-ID",{minimumFractionDigits:digits,maximumFractionDigits:digits})}
function delta(n){return (Math.abs(n)<1e-9?"":n>0?"+":"−")+percentage(Math.abs(n))}
function render(){
const result=metrics(cells),[r,c]=source,short=["Glioma","Mening.","Pituitari","Tanpa T."],n=cells[r][c];
return `<div class="blue"><div class="page-back"><a href="#markas">Markas</a><span class="divider">/</span>Meja eksperimen</div><header class="game-title"><div><span class="eyebrow">${window.UI.icon("chart")} Eksperimen bebas</span><h1>Meja Uji Macro-F1</h1><p>Ubah satu prediksi pada 100 citra buatan dan lihat dampaknya pada perbandingan dua model.</p></div></header>
<div class="bench-scores"><div class="mini-stat"><span>B0 standar · tetap</span><strong>${percentage(base.macro)}%</strong></div><div class="mini-stat"><span>B0 + CBAM · skenario</span><strong>${percentage(result.macro)}%</strong></div><div class="mini-stat gain"><span>Selisih macro-F1</span><strong>${delta(result.macro-base.macro)} poin</strong></div></div>
<div class="game-layout"><article class="station panel"><div class="step-kicker">Matriks model skenario</div><h2>Pindahkan satu prediksi</h2><p class="prompt">Pilih sel yang berisi citra. Lalu pilih kelas prediksi baru untuk satu citra di sel itu. Label datasetnya tetap.</p><div class="board"><div class="board-label">Baris = label dataset · kolom = prediksi</div><div class="table-wrap"><table class="matrix"><caption class="sr-only">Matriks prediksi skenario B0 + CBAM</caption><thead><tr><th>Label ∖ Pred.</th>${short.map(s=>`<th scope="col">${s}</th>`).join("")}</tr></thead><tbody>${cells.map((row,ri)=>`<tr><th scope="row">${short[ri]}</th>${row.map((v,ci)=>`<td><button type="button" data-b="source" data-v="${ri},${ci}" class="${ri===ci?"diag ":""}${ri===r&&ci===c?"selected":""}" aria-pressed="${ri===r&&ci===c}" aria-label="Label ${labels[ri]}, prediksi ${labels[ci]}, ${v} citra" ${v===0?"disabled":""}>${v}</button></td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="table-note">Mening. = meningioma · Tanpa T. = tanpa tumor</p></div>
<div class="bench-change"><div><p><strong>Sel terpilih</strong></p><p>${n} citra berlabel <b>${labels[r].toLocaleLowerCase("id")}</b> diprediksi sebagai <b>${labels[c].toLocaleLowerCase("id")}</b>.</p></div><label>Prediksi baru<select id="bench-destination">${labels.map((l,i)=>`<option value="${i}"${i===to?" selected":""}${i===c?" disabled":""}>${l}</option>`).join("")}</select></label></div>
<p class="bench-message" aria-live="polite">${history.length?`Perubahan terakhir memindahkan satu citra dari prediksi ${labels[history.at(-1).from]} ke ${labels[history.at(-1).to]}.`:"Kedua model memulai dari matriks yang sama."}</p>
<div class="bench-actions"><button class="btn primary" data-b="move" ${n===0?"disabled":""}>Pindahkan 1 citra</button><button class="btn" data-b="undo" ${history.length?"":"disabled"}>Urungkan</button></div></article>
<aside class="panel side-content bench-side"><h3>F1 setiap kelas</h3><div class="bench-classes">${labels.map((l,i)=>`<div><span>${l}</span><strong>${percentage(result.classes[i],1)}%</strong></div>`).join("")}</div><p>Macro-F1 adalah rata-rata keempat nilai ini. Coba perbaiki satu kesalahan glioma, lalu buat skenario yang menurunkan skor.</p><p>Skor dihitung langsung dari matriks latihan. Hasil eksperimen skripsi akan berasal dari prediksi model terlatih.</p><a class="text-btn" href="#jurnal/evaluasi">${window.UI.icon("book")} Baca rencana evaluasi</a></aside></div></div>`;
}
function start(){reset();document.getElementById("main").innerHTML=render()}
function handle(el){const act=el.dataset.b;let key=act,v=el.dataset.v;
 if(act==="source"){const [r,c]=v.split(",").map(Number);if(!cells[r][c])return;source=[r,c];to=c===r?(c+1)%4:r}
 else if(act==="move"){const [r,c]=source;if(!cells[r][c]||to===c)return;cells[r][c]--;cells[r][to]++;history.push({r,from:c,to});window.UI.chime("good");}
 else if(act==="undo"){const last=history.pop();if(!last)return;cells[last.r][last.to]--;cells[last.r][last.from]++;source=[last.r,last.from];to=last.to}
 else return;
 const main=document.getElementById("main");main.innerHTML=render();
 const control=main.querySelector(`[data-b="${key}"]${v===undefined?"":`[data-v="${v}"]`}:not(:disabled)`)||main.querySelector('[data-b="move"]:not(:disabled)')||main.querySelector('[data-b="undo"]:not(:disabled)');
 if(control)control.focus({preventScroll:true});
 const scores=metrics(cells);document.getElementById("announcer").textContent=`Macro-F1 skenario ${percentage(scores.macro)} persen. Selisih ${delta(scores.macro-base.macro)} poin.`;
}
function change(value){const idx=Number(value);if(Number.isInteger(idx)&&idx>=0&&idx<4&&idx!==source[1])to=idx}
window.Bench={start,handle,change};
})();

