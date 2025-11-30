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
   PROGETTI
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
   APRI POPUP CON POSIZIONE RANDOM A DESTRA DELLA LINEA
============================================================ */

function apriProgetto(id){
    const p = progetti.find(x=>x.id===id);
    if(!p) return;

    const limite = 260; // linea + margine
const randomLeft = limite + Math.floor(Math.random()*260) - 40;
const randomTop  = 160  + Math.floor(Math.random()*180) - 60;


    const scheda = document.createElement("div");
    scheda.className="scheda";
    scheda.style.left = randomLeft+"px";
    scheda.style.top = randomTop+"px";
    scheda.dataset.slideIndex = 0;

    const tabella = generaTabella(p.dettagli);

    scheda.innerHTML = `
        <div class="close-btn" onclick="this.parentElement.remove()">×</div>

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
                <img class="slide popup-img" src="${src}">
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

function aggiornaContatore(scheda,n){
    const i = Number(scheda.dataset.slideIndex);
    scheda.querySelector(".contatore").textContent =
        (i===0 ? `0 di ${n}` : `${i} di ${n}`);
}

/* ============================================================
   DRAG
============================================================ */

function renderDraggable(el){
    const drag = el.querySelector(".drag-area");
    let shiftX, shiftY;

    drag.onmousedown = e=>{
        e.preventDefault();
        shiftX = e.clientX - el.getBoundingClientRect().left;
        shiftY = e.clientY - el.getBoundingClientRect().top;

        document.onmousemove = ev=>{
            el.style.left = (ev.clientX - shiftX)+"px";
            el.style.top  = (ev.clientY - shiftY)+"px";
        };
        document.onmouseup = ()=>{
            document.onmousemove=null;
            document.onmouseup=null;
        };
    };
}
