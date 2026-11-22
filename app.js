const seedServices=[
["Жіноча стрижка","Миття, стрижка та укладання",400,60],
["Чоловіча стрижка","Класична або модельна",350,40],
["Дитяча стрижка","Для дітей до 10 років",300,40],
["Стрижка кінчиків","Оновлення довжини",250,30],
["Стрижка чубчика","Корекція форми",120,15],
["Фарбування коренів","Вартість може залежати від матеріалу",700,120],
["Фарбування в один тон","Залежить від довжини та густоти волосся",1100,150],
["Мелірування / складне фарбування","Остаточна ціна після консультації",1800,210],
["Тонування волосся","Підбір відтінку",800,90],
["Укладання / зачіска","Повсякденна або святкова",500,60],
["Догляд та відновлення волосся","Підбір процедури після консультації",900,90]
];
const get=(k,d)=>JSON.parse(localStorage.getItem(k)||"null")??d;
let services=get("v_services",seedServices), bookings=get("v_bookings",[]), reviews=get("v_reviews",[{name:"Олена",rating:5,text:"Дуже приємна атмосфера та уважний майстер!"},{name:"Марія",rating:5,text:"Залишилася задоволена результатом."}]);
const save=()=>{localStorage.setItem("v_services",JSON.stringify(services));localStorage.setItem("v_bookings",JSON.stringify(bookings));localStorage.setItem("v_reviews",JSON.stringify(reviews))};
const $=id=>document.getElementById(id);
$("year").textContent=new Date().getFullYear();
function renderServices(){ $("services").innerHTML=services.map((s,i)=>`<div class="service"><div><b>${s[0]}</b><small>${s[1]}</small></div><div class="price">${s[2]} ₴</div></div>`).join("");$("serviceSelect").innerHTML=services.map((s,i)=>`<option value="${i}">${s[0]} — ${s[2]} ₴</option>`).join("")}
function renderReviews(){$("reviews").innerHTML=reviews.filter(r=>r.approved!==false).map(r=>`<div class="review"><div class="stars">${"★".repeat(+r.rating||5)}</div><b>${esc(r.name)}</b><p>${esc(r.text)}</p></div>`).join("")||'<p class="muted">Поки що відгуків немає.</p>'}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function show(id){$(id).classList.add("show")}function hide(el){el.closest(".modal").classList.remove("show")}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>hide(b));
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("show")}));
$("bookNow").onclick=()=>show("bookingModal");$("adminOpen").onclick=()=>{show("adminModal");$("adminLogin").hidden=false;$("adminPanel").hidden=true};
$("reviewOpen").onclick=()=>show("reviewModal");
const today=new Date();$("date").min=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
function fillTimes(){let opts=[];for(let h=9;h<=18;h++)for(let m of [0,30]){if(h===18&&m>0)continue;opts.push(`<option>${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}</option>`)}$("time").innerHTML=opts.join("")}fillTimes();
$("bookingForm").onsubmit=e=>{e.preventDefault();let s=services[+$("serviceSelect").value];bookings.push({id:Date.now(),service:s[0],price:s[2],date:$("date").value,time:$("time").value,name:$("clientName").value,phone:$("phone").value,comment:$("comment").value,status:"Очікує підтвердження"});save();e.target.reset();$("bookingModal").classList.remove("show");toast("Заявку збережено в демонстрації. Майстер має її підтвердити.")};
$("reviewForm").onsubmit=e=>{e.preventDefault();reviews.unshift({name:$("reviewName").value,rating:$("rating").value,text:$("reviewText").value,approved:false});save();e.target.reset();$("reviewModal").classList.remove("show");toast("Дякуємо! Відгук передано на модерацію.")};
$("loginBtn").onclick=()=>{if($("adminPassword").value==="Віка226"){$("adminLogin").hidden=true;$("adminPanel").hidden=false;adminTab("requests")}else toast("Неправильний пароль")};
$("logoutBtn").onclick=()=>{$("adminPanel").hidden=true;$("adminLogin").hidden=false;$("adminPassword").value=""};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>adminTab(b.dataset.tab));
function adminTab(tab){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));let c=$("adminContent");if(tab==="requests"){c.innerHTML=bookings.length?bookings.slice().reverse().map(b=>`<div class="admin-item"><b>${esc(b.name)} · ${esc(b.service)}</b><p>${esc(b.date)} о ${esc(b.time)} · ${esc(b.phone)}</p><small>${esc(b.status)} · ${b.price} ₴</small>${b.comment?`<p>${esc(b.comment)}</p>`:""}<div class="actions"><button onclick="setStatus(${b.id},'Підтверджено')">Підтвердити</button><button onclick="setStatus(${b.id},'Потрібно уточнити')">Уточнити</button><button onclick="setStatus(${b.id},'Відхилено')">Відхилити</button></div></div>`).join(""):'<p class="muted">Заявок поки немає.</p>'}else if(tab==="servicesTab"){c.innerHTML=services.map((s,i)=>`<div class="admin-item"><b>${esc(s[0])}</b> · ${s[2]} ₴ <button onclick="editService(${i})">Змінити</button></div>`).join("")+'<button class="outline" onclick="addService()">Додати послугу</button>'}else{c.innerHTML=reviews.map((r,i)=>`<div class="admin-item"><b>${esc(r.name)}</b> · ${"★".repeat(+r.rating)}<p>${esc(r.text)}</p><small>${r.approved===false?"Очікує модерації":"Опубліковано"}</small><div class="actions"><button onclick="approveReview(${i})">Опублікувати</button><button onclick="deleteReview(${i})">Видалити</button></div></div>`).join("")||"Відгуків немає."}}
window.setStatus=(id,s)=>{bookings=bookings.map(b=>b.id===id?{...b,status:s}:b);save();adminTab("requests")};
window.editService=i=>{let s=services[i],name=prompt("Назва послуги",s[0]);if(name===null)return;let price=Number(prompt("Ціна, грн",s[2]));if(!Number.isFinite(price)||price<0)return;services[i]=[name,s[1],price,s[3]];save();renderServices();adminTab("servicesTab")};
window.addService=()=>{let name=prompt("Назва послуги");if(!name)return;let price=Number(prompt("Ціна, грн","300"));if(!Number.isFinite(price)||price<0)return;services.push([name,"Опис послуги",price,60]);save();renderServices();adminTab("servicesTab")};
window.approveReview=i=>{reviews[i].approved=true;save();renderReviews();adminTab("reviewsTab")};window.deleteReview=i=>{reviews.splice(i,1);save();renderReviews();adminTab("reviewsTab")};
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2800)}
renderServices();renderReviews();
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});

// Навігація між окремими розділами
function openPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active-page",p.id===id));
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>openPage(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>openPage(b.dataset.go)));
$("enterSite").addEventListener("click",()=>{$("welcome").classList.add("welcome-hide");openPage("homePage")});
$("welcomeBook").addEventListener("click",()=>{$("welcome").classList.add("welcome-hide");openPage("bookingPage");show("bookingModal")});
$("installBtn").addEventListener("click",async()=>{
 if(window.__deferredInstall){window.__deferredInstall.prompt();await window.__deferredInstall.userChoice;window.__deferredInstall=null;}
 else {$("installHelp").hidden=!$("installHelp").hidden;}
});
let installPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;window.__deferredInstall=e;$("installBtn").textContent="＋ Встановити програму";});
