const loader = document.querySelector("#loader");
const loaderStart = performance.now();
const MIN_LOADER_TIME = 1400;
let loaderDone = false;

document.body.classList.add("is-loading");

function startReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

function hideLoader() {
  if (loaderDone) return;
  loaderDone = true;

  const wait = Math.max(0, MIN_LOADER_TIME - (performance.now() - loaderStart));

  setTimeout(() => {
    loader?.classList.add("is-hidden");
    document.body.classList.remove("is-loading");
    startReveal();
    setTimeout(() => loader?.remove(), 900);
  }, wait);
}

if (document.readyState === "complete") {
  hideLoader();
} else {
  window.addEventListener("load", hideLoader);
}

setTimeout(hideLoader, 6000);
const CONFIG = { whatsapp: "" };
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
function closeMenu(){nav.classList.remove("open");menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","Abrir menu");}
menuButton.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));menuButton.setAttribute("aria-label",open?"Fechar menu":"Abrir menu");});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu();});
document.querySelectorAll("img.asset").forEach(img=>{const fail=()=>img.classList.add("missing");img.addEventListener("error",fail);if(img.complete&&!img.naturalWidth)fail();});
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const gallery=document.querySelector("#results-track");
document.querySelectorAll("[data-gallery]").forEach(btn=>btn.addEventListener("click",()=>{gallery.scrollBy({left:Number(btn.dataset.gallery)*(gallery.querySelector(".result-card").getBoundingClientRect().width+14),behavior:reduced.matches?"instant":"smooth"});}));
const testimonialTrack=document.querySelector("#testimonial-track");
const dots=[...document.querySelectorAll("[data-slide]")];
function setDot(index){dots.forEach((dot,i)=>{dot.classList.toggle("selected",i===index);dot.setAttribute("aria-pressed",String(i===index));});}
dots.forEach(dot=>dot.addEventListener("click",()=>{if(!window.matchMedia("(max-width:620px)").matches)return;const index=Number(dot.dataset.slide);const card=testimonialTrack.children[index];testimonialTrack.scrollTo({left:card.offsetLeft-testimonialTrack.children[0].offsetLeft,behavior:reduced.matches?"instant":"smooth"});setDot(index);}));
function updateDots(){const mobile=window.matchMedia("(max-width:620px)").matches;document.querySelector(".slider-dots").hidden=!mobile;}
updateDots();window.addEventListener("resize",updateDots);
testimonialTrack.addEventListener("scroll",()=>{const width=testimonialTrack.children[0].getBoundingClientRect().width+12;setDot(Math.min(2,Math.round(testimonialTrack.scrollLeft/width)));},{passive:true});
const topButton=document.querySelector("#back-to-top");
function updateTop(){topButton.classList.toggle("visible",window.scrollY>500);}
updateTop();window.addEventListener("scroll",updateTop,{passive:true});
topButton.addEventListener("click",()=>window.scrollTo({top:0,behavior:reduced.matches?"instant":"smooth"}));
document.querySelector("#year").textContent=new Date().getFullYear();
document.querySelector("#consultation-form").addEventListener("submit",e=>{e.preventDefault();const status=document.querySelector("#form-status");if(!/^\d{10,15}$/.test(CONFIG.whatsapp)){status.textContent="Demonstração: configure o contato autorizado em CONFIG.whatsapp, no script.js. Nenhuma informação foi enviada.";return;}const data=new FormData(e.currentTarget);const text=["Olá! Gostaria de agendar uma consulta.",`Nome: ${data.get("nome")}`,`Telefone: ${data.get("telefone")}`,`E-mail: ${data.get("email")||"Não informado"}`,`Data preferida: ${data.get("data")||"A combinar"}`,`Interesse: ${data.get("interesse")||"Avaliação inicial"}`,`Mensagem: ${data.get("mensagem")||"Não informada"}`].join("\n");window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer");status.textContent="Solicitação preparada para envio no WhatsApp. O agendamento depende de confirmação.";});
document.addEventListener("click", (event) => {
  if (
    nav.classList.contains("open") &&
    !nav.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    closeMenu();
  }
});