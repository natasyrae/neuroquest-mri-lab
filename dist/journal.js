(function(){
"use strict";
const sections=[["ringkasan","Ringkasan"],["metode","Metode"],["evaluasi","Evaluasi"],["jadwal","Jadwal & luaran"],["glosarium","Glosarium"]];
function pills(words){return `<div class="pills">${words.map(w=>`<span class="pill">${w}</span>`).join("")}</div>`}
function row(a,b){return `<tr><th scope="row">${a}</th><td>${b}</td></tr>`}
function detail(label,body,open=false){return `<details class="detail"${open?" open":""}><summary>${label}</summary><p>${body}</p></details>`}
function linkM(i){return `<a class="btn small" href="#misi/${i+1}">${window.UI.icon("pad")} Mainkan ${window.NQ.missions[i].name}</a>`}
function structure(main,side){return `<div class="journal-layout"><article class="panel paper">${main}</article><aside class="panel side-paper">${side}</aside></div>`}
function overview(){
return structure(`<h2>Apa yang ingin Natasya ketahui?</h2>
<p>Kalau satu modul perhatian CBAM ditambahkan ke EfficientNet-B0, apakah model lebih mudah membedakan empat kelas MRI otak? Natasya akan menguji apakah skornya naik, turun, atau hampir sama, dan melihat kelas mana yang sering tertukar.</p>
<h3>Judul proposal</h3><p class="official-title" lang="en">Four-Class Brain Tumor Classification from MRI Using EfficientNet-B0 with CBAM</p>
<h3>Tiga pertanyaan penelitian</h3>
${detail("RQ1 · Apa pengaruh CBAM?", "Bandingkan macro-F1 dan kesalahan tiap kelas pada B0 standar dan B0 dengan satu CBAM. Lihat juga bagaimana B0 standar dibandingkan dengan model yang lebih besar.",true)}
${detail("RQ2 · Apakah perbedaannya bertahan di sumber lain?", "Uji pasangan checkpoint yang sama pada koleksi MRI kedua, lalu bandingkan selisih macro-F1 antara kedua model pada masing-masing dataset.")}
${detail("RQ3 · Di mana model mencari petunjuk?", "Periksa sorotan Grad-CAM pada prediksi benar dan salah, terutama ketika glioma dan meningioma tertukar. Catat bila sorotan sering muncul pada tepi atau latar.")}
`, `<h2>Empat label MRI</h2>${pills(window.NQ.classes)}<p>Setiap citra mendapat satu label. Dalam game, label sudah tersedia supaya kamu bisa memeriksa cara model dievaluasi.</p><h3>Mengapa per kelas?</h3><p>Akurasi keseluruhan bisa menyembunyikan kesalahan pada satu kelas. Macro-F1 merata-ratakan F1 dari keempat kelas dengan bobot sama.</p><div class="journal-actions">${linkM(3)}</div>`);
}
function method(){
return structure(`<h2>Dari dua koleksi ke satu eksperimen terkontrol</h2>
<div class="table-wrap"><table class="info-table"><thead><tr><th>Koleksi dalam proposal</th><th>Perannya</th></tr></thead><tbody>
${row("Nickparvar v2","7.200 citra, 1.800 per kelas sebelum audit. Koleksi utama untuk latih, validasi, dan uji internal.")}
${row("BDNeuro-MRI v9","Kandidat uji eksternal. Penerbit melaporkan 889 citra uji sebelum penyaringan overlap. Verifikasi asal data dan empat label terlebih dahulu.")}</tbody></table></div>
<h3>Audit sebelum membagi citra</h3><p>Periksa berkas identik, piksel identik, dan kandidat salinan yang dicerminkan atau dirotasi. Tinjau kandidat secara visual. Simpan satu citra per kelompok salinan terkonfirmasi, lalu keluarkan seluruh kelompok jika konflik label belum terpecahkan.</p>
<p>Simpan semua citra satu pasien dalam partisi yang sama jika ID tersedia. Catat jumlah dan alasan eksklusi, lalu bagi data sekitar 70% latih, 15% validasi, dan 15% uji. Setiap partisi memuat empat kelas.</p>
<h3>Pasangan utama</h3><p>Gunakan PyTorch, bobot awal ImageNet dan input 224 × 224 piksel. Kedua B0 mempertahankan blok SE asli. Pada model modifikasi, tambahkan satu CBAM tepat sebelum global average pooling. Tahap channel membobotkan jenis fitur, lalu tahap spatial membobotkan lokasinya.</p><p>Samakan split, seed, urutan citra, serta pengaturan pelatihan. Rotasi ringan hanya untuk citra latih di konfigurasi yang memakainya.</p>
`, `<h2>Sepuluh konfigurasi</h2><div class="stats-line"><div class="mini-stat"><strong>10</strong>konfigurasi</div><div class="mini-stat"><strong>7</strong>seed</div><div class="mini-stat"><strong>70</strong>run</div></div><ul><li>B0 dengan dan tanpa rotasi latih.</li><li>B0 + CBAM lengkap, channel-only, dan spatial-only.</li><li>EfficientNet-B1, B2, B3, B4, dan Swin-Tiny.</li></ul><p>DARE-FUSE dibahas dari hasil terbitan beserta protokol aslinya.</p><div class="journal-actions">${linkM(1)}</div>`);
}
function evaluate(){
return structure(`<h2>Bagaimana hasilnya akan dibaca?</h2><p>Di meja uji, kamu bisa mengubah satu prediksi untuk melihat cara menghitung selisih macro-F1 pada matriks contoh.</p><a class="btn small" href="#simulasi">Coba meja uji macro-F1</a>
${detail("1 · Skor internal untuk empat kelas","Pilih checkpoint dengan macro-F1 validasi tertinggi untuk tiap run. Laporkan macro-F1, akurasi, recall dan F1 per kelas, confusion matrix, jumlah parameter, serta waktu prediksi pada perangkat yang sama.",true)}
${detail("2 · Selisih yang berpasangan","Per seed, kurangi macro-F1 B0 standar dari macro-F1 B0 + CBAM. Hitung rerata tujuh selisih dalam poin persentase dan interval kepercayaan 95% Student’s t. Tampilkan juga rerata, simpangan baku sampel, dan interval rerata per konfigurasi. Variasi ini berasal dari tujuh run pada satu split tetap.")}
${detail("3 · Pilih pasangan sebelum melihat hasil uji","Urutkan tujuh run CBAM berdasarkan macro-F1 validasi dan pilih nilai median. Pasangkan dengan checkpoint B0 dari seed yang sama. Gunakan pasangan dan prapemrosesan yang sama pada uji internal dan eksternal.")}
${detail("4 · Periksa perpindahan sumber","Saring citra uji BDNeuro-MRI terhadap seluruh Nickparvar. Buang kecocokan terkonfirmasi dan dugaan yang belum terselesaikan. Catat sisa tiap kelas. Laporkan macro-F1, recall per kelas, dan perubahan selisih antar-model. Karena ID pasien eksternal tidak tersedia, skor eksternal dilaporkan per citra. Jika asal tak terverifikasi, catat dan cari koleksi pengganti.")}
${detail("5 · Ukur ketidakpastian pada data uji","Untuk pasangan checkpoint terpilih, bootstrap kelompok uji internal untuk interval 95% selisih macro-F1. Dalam uji permutasi dua sisi, tukar prediksi kedua model untuk satu kelompok sekaligus secara acak. Kelompok terdiri atas satu pasien yang diketahui, atau satu citra yang lolos audit jika ID tidak tersedia.")}
`, `<h2>Panel Grad-CAM</h2><p>Pada model CBAM terpilih, buat heatmap kelas prediksi dari peta fitur terakhir sebelum pooling.</p><p>Untuk tiap kelas pada tiap dataset, gunakan urutan berkas tetap. Ambil prediksi benar pertama dan prediksi salah pertama jika tersedia.</p><p>Setiap panel memperlihatkan MRI, heatmap, label dataset, dan kelas prediksi. Batas tumor dari ahli diperlukan untuk menilai kecocokan lokasi secara anatomis.</p><div class="journal-actions">${linkM(4)}</div>`);
}
function schedule(){
return structure(`<h2>Jadwal kerja di proposal</h2><div class="table-wrap"><table class="info-table"><thead><tr><th>Periode</th><th>Yang dikerjakan</th></tr></thead><tbody>
${row("November 2026","Persiapan pertanyaan, versi dataset, rencana perbandingan, inventaris data, dan lingkungan pelatihan.")}
${row("Minggu 1","Audit gambar dan label. Simpan split. Catat kriteria data eksternal dan ukur durasi satu pilot run di GPU untuk menyesuaikan jadwal.")}
${row("Minggu 2","Latih pasangan B0 dan B0 + CBAM dengan tujuh seed. Jalankan kontrol rotasi dan ablasi komponen perhatian.")}
${row("Minggu 3","Selesaikan sisa run. Pilih dua checkpoint berdasarkan skor validasi.")}
${row("Minggu 4","Uji internal dan eksternal, hitung interval ketidakpastian, periksa kesalahan, dan buat panel Grad-CAM.")}
${row("Hingga Mei 2027","Tulis dan revisi skripsi, tinjau gambar bersama pembimbing, dan siapkan presentasi bila diminta.")}
</tbody></table></div><p>Empat minggu eksperimen dihitung setelah tahap persiapan.</p>`,
`<h2>Luaran skripsi</h2><ul><li>Daftar citra per partisi dan catatan eksklusi atau overlap.</li><li>Skor tujuh run untuk setiap konfigurasi.</li><li>Tabel perbandingan internal dan eksternal.</li><li>Panel Grad-CAM untuk prediksi benar dan salah.</li><li>Pengaturan model dan skrip analisis.</li></ul><h3>Yang ditunjukkan game</h3><p>Citra sintetis, skor buatan, dan XP digunakan untuk latihan. Hasil penelitian baru diperoleh saat eksperimen proposal dijalankan.</p>`);
}
function termsList(q){
const list=window.NQ.terms.filter(pair=>pair.join(" ").toLocaleLowerCase("id").includes(q.toLocaleLowerCase("id").trim()));
return list.length?`<dl>${list.map(([name,definition])=>`<div class="term"><dt>${name}</dt><dd>${definition}</dd></div>`).join("")}</dl>`:`<p>Belum ada istilah yang cocok. Coba kata seperti “seed”, “fitur”, atau “macro-F1”.</p>`;
}
function glossary(){return `<article class="panel paper"><h2>Glosarium lab</h2><label class="search-label">Cari istilah atau artinya<input id="term-search" type="search" placeholder="Misalnya, macro-F1" autocomplete="off"></label><div id="terms">${termsList("")}</div></article>`}
function render(id){
const active=sections.some(([key])=>key===id)?id:"ringkasan";
return `<div class="page-back"><a href="#markas">Markas</a><span class="divider">/</span>Jurnal riset</div>
<header class="panel page-hero"><img class="journal-icon" src="assets/audit.png" alt=""><div><span class="eyebrow">${window.UI.icon("book")} Proposal Natasya Suryanto</span><h1>Jurnal Riset</h1><p>Rencana eksperimen klasifikasi empat kelas MRI otak dengan EfficientNet-B0 dan CBAM.</p></div></header>
<nav class="tab-row" aria-label="Bagian jurnal">${sections.map(([key,label])=>`<a href="#jurnal/${key}" class="${active===key?"selected":""}" ${active===key?'aria-current="page"':""}>${label}</a>`).join("")}</nav>
<div class="journal-content">${({ringkasan:overview,metode:method,evaluasi:evaluate,jadwal:schedule,glosarium:glossary})[active]()}</div>`;
}
window.Journal={render,termsList};
})();

