/* ============================================================
   TEMI
============================================================ */

const temi = [
    { id:"2023", nome:"2023" },
    { id:"2024", nome:"2024" },
    { id:"2025", nome:"2025" },
    { id:"expo", nome:"esposizione" },
    { id:"arredo", nome:"arredamento" },
    { id:"ricerca", nome:"ricerca" }
];

/* ============================================================
   PROGETTI (esempio)
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

let offset = 0;

/* ============================================================
   APRI POPUP
============================================================ */

function apriProgetto(id){
    const p = progetti.find(x=>x.id===id);
    if(!p) return;

    offset += 25;

    const scheda = document.createElement("div");
    scheda.className="scheda";
    scheda.style.left = (220+offset)+"px";
    scheda.style.top = (140+offset)+"px";
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

    scheda.querySelector(".viewer").onclick=()=>{
        nextSlide(scheda,p.id);
    };

    renderDraggable(scheda);
    enableImageDrag(scheda);
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
    mostraSlide(scheda,index);
    aggiornaContatore(scheda,p.immagini.length);
}

function mostraSlide(scheda,index){
    const slides = scheda.querySelectorAll(".viewer .slide");
    slides.forEach((s,i)=>{
        s.style.display = (i===index ? "block" : "none");
    });
}

function aggiornaContatore(scheda,imgCount){
    const cont = scheda.querySelector(".contatore");
    const index = Number(scheda.dataset.slideIndex);

    if(index===0){
        cont.textContent = `0 / ${imgCount}`;
    } else {
        cont.textContent = `${index} / ${imgCount}`;
    }
}

/* ============================================================
   DRAG SCHEDE
============================================================ */

function renderDraggable(el){
    const dragArea = el.querySelector(".drag-area");
    let offsetX, offsetY, dragging=false;

    dragArea.addEventListener("mousedown", e=>{
        dragging=true;
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
    });

    document.addEventListener("mousemove", e=>{
        if(!dragging) return;
        el.style.left = (e.clientX - offsetX)+"px";
        el.style.top = (e.clientY - offsetY)+"px";
    });

    document.addEventListener("mouseup", ()=> dragging=false);
}

/* ============================================================
   PORTA IN PRIMO PIANO
============================================================ */

document.addEventListener("click", e=>{
    const scheda = e.target.closest(".scheda");
    if(!scheda) return;

    window.topZ = (window.topZ || 100);
    window.topZ++;
    scheda.style.zIndex = window.topZ;
});

/* ============================================================
   ZOOM (desktop)
============================================================ */

function zoomPopup(btn){

    if(window.innerWidth <= 520) return;

    const scheda = btn.closest(".scheda");
    let z = Number(scheda.dataset.zoom || 1);

    /* 1 → 2 → 4 → 1 */
    if(z === 1) z = 2;
    else if(z === 2) z = 4;
    else z = 1;

    scheda.dataset.zoom = z;
    scheda.style.transform = `scale(${z})`;
}

/* ============================================================
   DRAG IMMAGINI ZOOMATE
============================================================ */

function enableImageDrag(scheda){
    const viewer = scheda.querySelector(".viewer");

    let down = false;
    let startX, startY, scrollX, scrollY;

    viewer.addEventListener("mousedown", e=>{
        const zoom = Number(scheda.dataset.zoom);
        if(zoom <= 1) return;

        down = true;
        viewer.classList.add("dragging");

        startX = e.clientX;
        startY = e.clientY;

        scrollX = viewer.scrollLeft;
        scrollY = viewer.scrollTop;
    });

    viewer.addEventListener("mouseup", ()=>{
        down = false;
        viewer.classList.remove("dragging");
    });

    viewer.addEventListener("mouseleave", ()=>{
        down = false;
        viewer.classList.remove("dragging");
    });

    viewer.addEventListener("mousemove", e=>{
        if(!down) return;

        e.preventDefault();

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        viewer.scrollLeft = scrollX - dx;
        viewer.scrollTop = scrollY - dy;
    });
}
