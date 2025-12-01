/* ============================================================
   TEMI
============================================================ */

const temi = [
    { id:"2023", nome:"2023" },
    { id:"2024", nome:"2024" },
    { id:"2025", nome:"2022025" },
    { id:"expo", nome:"esposizione" },
    { id:"arredo", nome:"arredamento" },
    { id:"ricerca", nome:"ricerca" }
];

/* ============================================================
   PROGETTI (ESEMPIO)
============================================================ */

const progetti = [
    {
        id:1,
        titolo:"Innsbruck",
        sottotitolo:"Espositori per immagini",
        codice:"4.19_023-001",

        temi:["2023","expo"],

        immagini:[
            "img/progetti/1/4.19_023-001_axo.jpg",
            "img/progetti/1/4.19_023-001_proiez.jpg"
        ],

        dettagli:{
            design:"Innsbruck",
            anno:"2023",
            status:"completato",
            materiali:"MDF, acero",
            dimensioni:"—",
            quantità:"12 pezzi",
            tecnica_lavorazione:"—",
            energia_produzione:"—",
            link:"—"
        }
    }
];

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

            html += `
            <div class="info-cell">
                <span class="info-label">${key}</span>
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

const lista = document.getElementById("listaTemi");

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

function toggleSubmenu(id){
    const el = document.getElementById(id);
    el.style.display = (el.style.display==="block" ? "none" : "block");
}

function chiudiTutte(){
    document.querySelectorAll(".scheda").forEach(x=>x.remove());
}

/* ============================================================
   UTILITY RANDOM PER POPUP
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

    /* posizione random controllata */
    scheda.style.left = randomBetween(180,260)+"px";
    scheda.style.top  = randomBetween(100,180)+"px";

    /* nuovo popup SEMPRE davanti */
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
            <div class="slide table-slide">
                ${tabella}
            </div>

            ${p.immagini.map(src=>`
                <div class="slide">
                    <img class="popup-img" src="${src}">
                </div>
            `).join("")}
        </div>

        <div class="contatore"></div>
    `;

    document.body.appendChild(scheda);

    mostraSlide(scheda,0);
    aggiornaContatore(scheda,p.immagini.length);

    const viewer = scheda.querySelector(".viewer");

    viewer.onclick = ()=>{
        if(scheda.dataset.panning==="true") return;
        nextSlide(scheda,p.id);
    };

    renderDraggable(scheda);
    enableImageDrag(scheda);
}

/* ============================================================
   SLIDE
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
}

/* ============================================================
   CONTATORE
============================================================ */

function aggiornaContatore(scheda,nImgs){
    const index = Number(scheda.dataset.slideIndex);
    const cont = scheda.querySelector(".contatore");

    if(index===0) cont.textContent = `1 / ${nImgs+1}`;
    else cont.textContent = `${index+1} / ${nImgs+1}`;
}

/* ============================================================
   ZOOM IMMAGINI (1→2→4→1)
============================================================ */

function zoomPopup(btn){
    if(window.innerWidth < 520) return;

    const scheda = btn.closest(".scheda");
    const index = Number(scheda.dataset.slideIndex);

    if(index === 0) return;

    let z = Number(scheda.dataset.zoom || 1);

    if(z===1) z=2;
    else if(z===2) z=4;
    else z=1;

    scheda.dataset.zoom = z;

    const viewer = scheda.querySelector(".viewer");
    const img = viewer.querySelector(".slide:nth-child("+(index+1)+") img");

    viewer.scrollTop = 0;
    viewer.scrollLeft = 0;

    img.style.transform = (z>1 ? `scale(${z})` : "none");
    img.style.transformOrigin = "top left";

    if(z>1){
        scheda.dataset.panning="true";
        viewer.style.overflow="scroll";
    } else {
        scheda.dataset.panning="false";
        viewer.style.overflow="auto";
    }
}

/* ============================================================
   DRAG DELLA SCHEDA
============================================================ */

function renderDraggable(el){
    const drag = el.querySelector(".drag-area");
    let isDown = false, startX, startY;

    drag.addEventListener("mousedown", e=>{
        isDown=true;

        window.topZ++;
        el.style.zIndex=window.topZ;

        startX=e.clientX-el.offsetLeft;
        startY=e.clientY-el.offsetTop;
    });

    document.addEventListener("mousemove", e=>{
        if(!isDown) return;
        el.style.left = (e.clientX-startX)+"px";
        el.style.top  = (e.clientY-startY)+"px";
    });

    document.addEventListener("mouseup", ()=> isDown=false);
}

/* ============================================================
   DRAG IMMAGINE ZOOMATA
============================================================ */

function enableImageDrag(scheda){
    const viewer = scheda.querySelector(".viewer");

    let isDown=false, startX, startY, scrollLeft, scrollTop;

    viewer.addEventListener("mousedown", e=>{
        const zoom = Number(scheda.dataset.zoom||1);
        if(zoom<=1) return;

        isDown=true;
        viewer.classList.add("dragging");
        scheda.dataset.panning="true";

        startX=e.clientX;
        startY=e.clientY;

        scrollLeft=viewer.scrollLeft;
        scrollTop=viewer.scrollTop;
    });

    viewer.addEventListener("mouseleave", ()=>{
        isDown=false;
        viewer.classList.remove("dragging");
    });

    viewer.addEventListener("mouseup", ()=>{
        isDown=false;
        viewer.classList.remove("dragging");
    });

    viewer.addEventListener("mousemove", e=>{
        if(!isDown) return;

        e.preventDefault();

        const x=e.clientX;
        const y=e.clientY;

        viewer.scrollLeft = scrollLeft - (x-startX);
        viewer.scrollTop  = scrollTop  - (y-startY);
    });
}
