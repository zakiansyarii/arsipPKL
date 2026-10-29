const API_URL = "https://script.google.com/macros/s/AKfycbzeFZ9DZD5tQDyh-cdp29MVZlT8-juA65PBifseEl13A529mEUGIn9-sjftXSaUO-pGSg/exec"; // Isi dengan URL Web App Google Apps Script setelah deploy.
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const DEFAULTS = {
  reports: [
    {title:"Laporan Praktik Kerja Lapangan", description:"Laporan kegiatan PKL di LZ Computer dan DISDUKCAPIL Kabupaten Hulu Sungai Utara.", image:"", url:"", category:"DOKUMEN UTAMA"},
    {title:"Lampiran & Dokumen Pendukung", description:"Lampiran laporan, lembar pengesahan, atau dokumen pendukung lainnya.", image:"", url:"", category:"DOKUMEN PENDUKUNG"}
  ],
  gallery: [
    {title:"Dokumentasi kegiatan PKL", description:"Foto kegiatan 01", image:"", url:""},
    {title:"Lingkungan kerja", description:"Foto kegiatan 02", image:"", url:""},
    {title:"Proses pengerjaan", description:"Foto kegiatan 03", image:"", url:""},
    {title:"Belajar dan observasi", description:"Foto kegiatan 04", image:"", url:""},
    {title:"Aktivitas bersama", description:"Foto kegiatan 05", image:"", url:""}
  ],
  notes: [
    {title:"Catatan Kegiatan PKL", description:"Ringkasan aktivitas dan pekerjaan harian selama PKL.", image:"", url:"", category:"CATATAN KEGIATAN"},
    {title:"Lembar Observasi PKL", description:"Catatan pengamatan pekerjaan dan prosedur teknis.", image:"", url:"", category:"LEMBAR OBSERVASI"},
    {title:"Catatan & Lampiran Lainnya", description:"Arsip kegiatan pendukung.", image:"", url:"", category:"DOKUMENTASI"}
  ],
  ppts: [
    {title:"Instalasi Windows 10", description:"Dokumentasi presentasi kegiatan teknis.", image:"", url:"", category:"PPT MAGANG 01"},
    {title:"Perawatan Printer", description:"Proses kerja dan pemeliharaan perangkat.", image:"", url:"", category:"PPT MAGANG 02"},
    {title:"Konfigurasi Kabel LAN", description:"Langkah pembuatan kabel jaringan straight.", image:"", url:"", category:"PPT MAGANG 03"},
    {title:"Penggunaan Aplikasi SIAK", description:"Pengelolaan administrasi kependudukan.", image:"", url:"", category:"PPT MAGANG 04"},
    {title:"Perekaman KTP Biometrik", description:"Alur perekaman dan pengenalan perangkat.", image:"", url:"", category:"PPT MAGANG 05"},
    {title:"Dokumentasi Kegiatan PKL", description:"Ringkasan kegiatan dan pengalaman magang.", image:"", url:"", category:"PPT MAGANG 06"}
  ]
};
let content = structuredClone(DEFAULTS);
let activeType = "reports";
let sessionToken = "";
let localMode = !API_URL;
let toastTimer;

function toast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2800)}
function safeUrl(url){try{const u=new URL(url);return ["https:","http:"].includes(u.protocol)?u.href:"#"}catch{return "#"}}
function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openModal(id){$("#"+id).classList.add("open");$("#"+id).setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeModal(id){$("#"+id).classList.remove("open");$("#"+id).setAttribute("aria-hidden","true");document.body.style.overflow=""}
function makeCardLink(url,label="Buka dokumen"){return url?`<a class="card-link" href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener">${label} <span>↗</span></a>`:`<a class="card-link" href="#admin" data-empty-link>Tambahkan tautan dokumen <span>↗</span></a>`}
function renderReports(){
 const grid=$("#reportGrid");
 grid.innerHTML=content.reports.map((x,i)=>`<article class="report-card ${i===0?'featured-report':'secondary-report'}">
 <div class="report-cover ${i===0?'cover-gold':'cover-dark'}" ${x.image?`style="background-image:linear-gradient(#10182788,#10182788),url('${escapeHtml(safeUrl(x.image))}');background-size:cover;background-position:center"`:""}>
 ${x.image?"":`<span class="${i===0?'cover-topline':'cover-small'}">${escapeHtml(x.category||"ARSIP PKL")}</span><div class="cover-monogram">${i===0?"ZA":"ZA."}</div><div class="${i===0?'cover-title':'cover-side-title'}">${escapeHtml(x.title).toUpperCase()}</div><div class="cover-rule"></div><b>ZAKI ANSYARI</b><small>SMK NEGERI 1 AMUNTAI · 2025/2026</small>`}
 </div><div class="report-info"><div class="card-label">${escapeHtml(x.category||"DOKUMEN PKL")}</div><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.description)}</p>${makeCardLink(x.url)}</div></article>`).join("");
}
function renderGallery(){
 $("#galleryGrid").innerHTML=content.gallery.map((x,i)=>`<button class="gallery-tile ${i===0?'gallery-large':''} ${x.image?'has-image':''}" data-gallery-index="${i}" style="${x.image?`background-image:linear-gradient(0deg,#070b13d9,transparent 75%),url('${escapeHtml(safeUrl(x.image))}');background-size:cover;background-position:center`:''}">
 <span class="photo-number">${String(i+1).padStart(2,"0")} / FIELDWORK</span><span class="photo-caption">${escapeHtml(x.title)}</span><span class="photo-open">↗</span></button>`).join("");
 $$("#galleryGrid [data-gallery-index]").forEach(btn=>btn.addEventListener("click",()=>{const item=content.gallery[Number(btn.dataset.galleryIndex)];if(item.image){$("#lightboxImage").src=safeUrl(item.image);$("#lightboxCaption").textContent=item.title;$("#lightbox").classList.add("open")}else if(item.url){window.open(safeUrl(item.url),"_blank","noopener")}else{toast("Tambahkan URL gambar pada menu Admin terlebih dahulu.")}}));
}
function thumbStyle(image){return image?`style="background-image:linear-gradient(0deg,#0b0f19b8,transparent),url('${escapeHtml(safeUrl(image))}');background-size:cover;background-position:center"`:""}
function renderDocGrid(type,selector){
 const isPpt=type==="ppts";const arr=content[type];
 $(selector).innerHTML=arr.map((x,i)=>`<a class="document-card" href="${x.url?escapeHtml(safeUrl(x.url)):'#admin'}" ${x.url?'target="_blank" rel="noopener"':'data-empty-link'}><div class="document-thumb ${isPpt?`ppt-thumb ppt-${["one","two","three","four","five","six"][i%6]}`:`thumb-${["notes","observe","appendix"][i%3]}`}" ${thumbStyle(x.image)}>
 ${isPpt?`<span class="ppt-tag">${escapeHtml(x.category||`PRESENTATION ${String(i+1).padStart(2,"0")}`)}</span><b>${escapeHtml(x.title).toUpperCase()}</b><span class="ppt-decoration">${String(i+1).padStart(2,"0")}</span>`:`<span class="thumb-stamp">${escapeHtml(x.category||"ARSIP")}</span><div class="thumb-paper"><i></i><i></i><i></i><i></i></div><span class="thumb-number">${String(i+1).padStart(2,"0")}</span>`}
 </div><div class="document-card-info"><span class="card-label">${escapeHtml(x.category|| (isPpt?`PPT MAGANG ${String(i+1).padStart(2,"0")}`:"DOKUMEN PKL"))}</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.description)}</p><span class="card-link">${x.url?(isPpt?"Buka presentasi":"Buka dokumen"):"Tambahkan tautan"} ↗</span></div></a>`).join("");
}
function renderAll(){renderReports();renderGallery();renderDocGrid("notes","#notesGrid");renderDocGrid("ppts","#pptGrid");}
async function api(action,payload={}){
 if(localMode) throw new Error("API belum dikonfigurasi. Isi API_URL pada public/main.js dan deploy Google Apps Script.");
 const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,token:sessionToken,...payload})});
 const data=await res.json();if(!res.ok||!data.ok)throw new Error(data.message||"Permintaan gagal.");return data;
}
async function loadContent(){
 if(localMode){renderAll();return}
 try{const res=await fetch(`${API_URL}?action=content`);const data=await res.json();if(data.ok&&data.content){content={...structuredClone(DEFAULTS),...data.content};renderAll()}}catch(e){console.warn("Menggunakan konten awal:",e)}
}
function openAdmin(){openModal("adminModal");$("#loginMessage").textContent="";$("#username").focus()}
async function login(e){
 e.preventDefault();const username=$("#username").value.trim(),password=$("#password").value;
 const msg=$("#loginMessage");msg.textContent="Memeriksa akun…";
 if(localMode){msg.textContent="Backend belum terhubung. Deploy Apps Script dan isi API_URL terlebih dahulu.";return}
 try{const result=await api("login",{username,password});sessionToken=result.token;closeModal("adminModal");openModal("dashboardModal");await loadContent();renderAdminItems();toast("Berhasil masuk ke dashboard.")}catch(err){msg.textContent=err.message||"Username atau password tidak sesuai."}
}
function renderAdminItems(){
 const list=content[activeType]||[];
 $("#adminItems").innerHTML=list.map((x,i)=>`<div class="admin-item" data-index="${i}"><div class="admin-item-head"><b>${String(i+1).padStart(2,"0")} · ${escapeHtml(x.title||"Item baru")}</b><button class="remove-item" data-remove="${i}">Hapus item ×</button></div>
 <label>Judul<input data-field="title" value="${escapeHtml(x.title||"")}" placeholder="Judul item"></label>
 <label>Deskripsi<textarea data-field="description" placeholder="Deskripsi singkat">${escapeHtml(x.description||"")}</textarea></label>
 <label>URL file / tautan tujuan<input data-field="url" value="${escapeHtml(x.url||"")}" placeholder="https://drive.google.com/..."></label>
 <label>URL gambar / cover<input data-field="image" value="${escapeHtml(x.image||"")}" placeholder="https://... atau URL gambar Drive"></label>
 <label>Kategori / label<input data-field="category" value="${escapeHtml(x.category||"")}" placeholder="Label kecil di kartu"></label></div>`).join("")||`<p class="dashboard-intro">Belum ada item pada kategori ini. Tekan “Tambah item” untuk mulai.</p>`;
 $$("#adminItems [data-field]").forEach(el=>el.addEventListener("input",()=>{const card=el.closest(".admin-item");const idx=Number(card.dataset.index);content[activeType][idx][el.dataset.field]=el.value;card.querySelector(".admin-item-head b").textContent=`${String(idx+1).padStart(2,"0")} · ${content[activeType][idx].title||"Item baru"}`}));
 $$("#adminItems [data-remove]").forEach(btn=>btn.addEventListener("click",()=>{content[activeType].splice(Number(btn.dataset.remove),1);renderAdminItems()}));
}
async function saveItems(){
 const status=$("#saveStatus");status.textContent="Menyimpan…";
 if(localMode){status.textContent="Belum tersimpan: backend Google Sheets belum dikonfigurasi.";toast("Hubungkan Apps Script terlebih dahulu.");return}
 try{await api("saveContent",{content});status.textContent="Berhasil disimpan ke Google Sheets.";renderAll();toast("Arsip berhasil diperbarui.")}catch(e){status.textContent=e.message;toast("Gagal menyimpan perubahan.")}
}
function bind(){
 $("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
 $$("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));
 $$('a[href="#admin"]').forEach(a=>a.addEventListener("click",e=>{e.preventDefault();openAdmin()}));
 $("#closeAdmin").addEventListener("click",()=>closeModal("adminModal"));
 $("#loginForm").addEventListener("submit",login);
 $("#logoutBtn").addEventListener("click",()=>{sessionToken="";closeModal("dashboardModal");toast("Anda telah keluar.")});
 $("#dashboardTabs").addEventListener("click",e=>{const btn=e.target.closest("[data-type]");if(!btn)return;activeType=btn.dataset.type;$$(".dash-tab").forEach(b=>b.classList.toggle("active",b===btn));renderAdminItems()});
 $("#addItemBtn").addEventListener("click",()=>{content[activeType].push({title:"Item baru",description:"",image:"",url:"",category:activeType==="ppts"?"PPT MAGANG":activeType==="gallery"?"GALERI":"ARSIP"});renderAdminItems()});
 $("#saveItemsBtn").addEventListener("click",saveItems);
 $("#lightboxClose").addEventListener("click",()=>$("#lightbox").classList.remove("open"));
 $("#lightbox").addEventListener("click",e=>{if(e.target.id==="lightbox")$("#lightbox").classList.remove("open")});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal("adminModal");closeModal("dashboardModal");$("#lightbox").classList.remove("open")}});
 document.addEventListener("click",e=>{const a=e.target.closest("[data-empty-link]");if(a){e.preventDefault();toast("Masuk ke Admin untuk menambahkan tautan file.")}});
 const sections=$$("main section[id]");const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){$$(".nav-link").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+entry.target.id))}}),{rootMargin:"-35% 0px -55% 0px"});sections.forEach(s=>observer.observe(s));
}
bind();renderAll();loadContent();
