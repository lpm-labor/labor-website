/* ============================================================
   TEMI
============================================================ */

const temi = [
    { id:"2023", nome:"2023" },
    { id:"2024", nome:"2024" },
    { id:"2025", nome:"2025" },
    { id:"expo", nome:"esposizione" },
   { id:"riuso", nome:"ri-uso" },
    { id:"arredo", nome:"arredamento" },
    { id:"arch", nome:"architettura" },   
    { id:"ricerca", nome:"ricerca" }
];

/* ============================================================
   PROGETTI — caricati da JSON
============================================================ */

let progetti = [];

fetch("progetti.json")
  .then(r => r.json())
  .then(data => {
      progetti = data.progetti || [];
      generaListaTemi();
  });

/* ============================================================
   LABEL PERSONALIZZATE
============================================================ */

const labelMap = {
    design: "design",
    anno: "anno",
    status: "status",
    materiali: "materiali",
    dimensioni: "dimensioni",
    quantità: "quantità",
    tecnica_lavorazione: "lavorazioni",     // ⭐ aggiornato
    energia_produzione: "energia utilizzata",
    link: "link"
};

/* ============================================================
   SCHEMA TABELLA
============================================================ */

const schemaTabella = [
    { colonne:["design"] },
    { colonne:["anno","status"] },
    { colonne:["materiali"] },
    { colonne:["dimensioni","quantità"] },
    { colonne:["tecnica_lavorazione"] },
    { colonne:["energia_produzione"] },
    { colonne:["link"] }
];

/* ============================================================
   GENERA TABELLA
============================================================ */

function generaTabella(dettagli){
    let html = `<div class="table-grid">`;

    schemaTabella.forEach(riga=>{
        const count = riga.colonne.length;
        html += `<div class="table-row cols-${count}">`;

        riga.colonne.forEach(key=>{
            let value = dettagli[key] || "—";

            if(key==="link" && value!=="—"){
                value = `<a href="${value}" target="_blank">${value}</a>`;
            }

            const label = labelMap[key] || key;

            html += `
            <div class="info-cell">
                <span class="info-label">${label}</span>
                <span class="info-value">${value}</span>
            </div>`;
        });

        html += `</div>`;
    });

    html += `</div>`;
    return html;
}

/* ============================================================
   LISTA TEMI
============================================================ */

function generaListaTemi(){
    const lista = document.getElementById("listaTemi");
    lista.innerHTML = "";

    temi.forEach(t=>{
        const voce = document.createElement("a");
        voce.textContent = t.nome;
        voce.onclick = ()=>toggleSubmenu("sm_"+t.id);

        const br = document.createElement("br");
        const submenu = document.createElement("div");
        submenu.id = "sm_"+t.id;
        submenu.className = "submenu";

        progetti
            .filter(p=>p.temi.includes(t.id))
            .forEach(p=>{
                const link = document.createElement("div");
                link.className="submenu-item";
                link.textContent=p.titolo;
                link.onclick=()=>apriProgetto(p.id);
                submenu.appendChild(link);
            });

        lista.appendChild(voce);
        lista.appendChild(br);
        lista.appendChild(submenu);
    });
}

function toggleSubmenu(id){
    const el = document.getElementById(id);
    el.style.display = (el.style.display==="block" ? "none" : "block");
}

function chiudiTutte(){
    document.querySelectorAll(".scheda").forEach(x=>x.remove());
}

/* ============================================================
   UTILS RANDOM
============================================================ */

function randomBetween(min,max){
    return Math.floor(Math.random()*(max-min+1)) + min;
}

/* ============================================================
   APRI POPUP
============================================================ */

function apriProgetto(id){
    const p = progetti.find(x=>x.id===id);
    if(!p) return;

    const scheda = document.createElement("div");
    scheda.className="scheda";

    scheda.style.left = randomBetween(180,260)+"px";
    scheda.style.top  = randomBetween(100,180)+"px";

    window.topZ = (window.topZ || 100);
    window.topZ++;
    scheda.style.zIndex = window.topZ;

    scheda.dataset.slideIndex = 0;
    scheda.dataset.zoom = 1;

    const tabella = generaTabella(p.dettagli);

    scheda.innerHTML = `
        <div class="close-btn" onclick="this.parentElement.remove()">×</div>
        <div class="zoom-btn" onclick="zoomPopup(this)">zoom</div>

        <div class="drag-area">
            <h3>${p.titolo}</h3>
            <div class="sottotitolo">${p.sottotitolo || ""}</div>
            <div class="meta">${p.codice || ""}</div>
        </div>

        <div class="viewer">

            <div class="slide table-slide">${tabella}</div>

            ${p.immagini.map(img=>`
                <div class="slide img-container">
                    <img class="popup-img" src="${img.src}">
                    ${img.autore ? `<div class="autore-img">${img.autore}</div>` : ""}
                </div>
            `).join("")}

        </div>

        <div class="contatore"></div>
    `;

    document.body.appendChild(scheda);

    /* PORTA DAVANTI SE IN SECONDO PIANO */
    scheda.addEventListener("mousedown", e => {
        const z = parseInt(scheda.style.zIndex);
        if(z !== window.topZ){
            e.stopPropagation();
            e.preventDefault();
            window.topZ++;
            scheda.style.zIndex = window.topZ;
            return;
        }
    });

    mostraSlide(scheda,0);
    aggiornaContatore(scheda,p.immagini.length);

    const viewer = scheda.querySelector(".viewer");
    viewer.onclick = ()=> nextSlide(scheda,p.id);

    renderDraggable(scheda);
}

/* ============================================================
   SLIDES
============================================================ */

function nextSlide(scheda,id){
    const p = progetti.find(x=>x.id===id);
    const total = p.immagini.length + 1;

    let index = Number(scheda.dataset.slideIndex);
    index = (index+1)%total;

    scheda.dataset.slideIndex=index;
    scheda.dataset.zoom = 1;

    mostraSlide(scheda,index);
    aggiornaContatore(scheda,p.immagini.length);
}

function mostraSlide(scheda,index){
    const slides = scheda.querySelectorAll(".viewer .slide");
    slides.forEach((s,i)=>{
        s.style.display = (i===index ? "block" : "none");
    });

    const viewer = scheda.querySelector(".viewer");
    viewer.scrollTop = 0;
    viewer.scrollLeft = 0;

    const img = viewer.querySelector(".slide:nth-child("+(index+1)+") img");
    if(img) img.style.transform = "none";
}

/* ============================================================
   CONTATORE
============================================================ */

function aggiornaContatore(scheda,nImgs){
    const index = Number(scheda.dataset.slideIndex);
    scheda.querySelector(".contatore").textContent = `${index+1} / ${nImgs+1}`;
}

/* ============================================================
   ZOOM
============================================================ */

function zoomPopup(btn){
    if(window.innerWidth < 520) return;

    const scheda = btn.closest(".scheda");
    const index = Number(scheda.dataset.slideIndex);
    if(index===0) return;

    let z = Number(scheda.dataset.zoom);

    if(z===1) z=2;
    else if(z===2) z=4;
    else z=1;

    scheda.dataset.zoom = z;

    const viewer = scheda.querySelector(".viewer");
    const slide = viewer.querySelectorAll(".slide")[index];
    const img = slide.querySelector("img");

    if(z > 1){
        viewer.style.overflow = "scroll";
        img.style.transform = `scale(${z})`;
    } else {
        viewer.style.overflow = "auto";
        img.style.transform = "none";
    }
}

/* ============================================================
   DRAG
============================================================ */

function renderDraggable(el){
    const drag = el.querySelector(".drag-area");
    let down=false, sx=0, sy=0;

    drag.addEventListener("mousedown", e=>{
        down=true;

        window.topZ++;
        el.style.zIndex=window.topZ;

        sx = e.clientX - el.offsetLeft;
        sy = e.clientY - el.offsetTop;
    });

    document.addEventListener("mousemove", e=>{
        if(!down) return;
        el.style.left = (e.clientX - sx)+"px";
        el.style.top  = (e.clientY - sy)+"px";
    });

    document.addEventListener("mouseup", ()=> down=false);
}
