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
   PROGETTI — ESEMPIO
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

function generaTabella(dett){
    let html = `<div class="table-grid">`;

    schemaTabella.forEach(riga=>{
        const n = riga.colonne.length;
        html += `<div class="table-row cols-${n}">`;

        riga.colonne.forEach(key=>{
            let value = dett[key] || "—";

            if(key==="link" && value !== "—"){
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

    lista.appendChild(voce);
    lista.appendChild(document.createElement("br"));

    const submenu = document.createElement("div");
    submenu.id = "sm_"+t.id;
    submenu.className = "submenu";

    progetti
        .filter(p=>p.temi.includes(t.id))
        .forEach(p=>{
            const link = document.createElement("div");
            link.className = "submenu-item";
            link.textContent = p.titolo;
            link.onclick = ()=>apriProgetto(p.id);
            submenu.appendChild(link);
        });

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
   APRI POPUP
============================================================ */

function apriProgetto(id){
    const p = progetti.find(x=>x.id===id);
    if(!p) return;

    const scheda = document.createElement("div");
    scheda.className="scheda";

    /* LIMITE INVISIBILE */
    const limite = 280;

    /* POSIZIONE RANDOM CONTROLLATA */
    const randomX = limite + 40 + Math.random()*120;
    const randomY = 120 + Math.random()*50;

    scheda.style.left = randomX + "px";
    scheda.style.top  = randomY + "px";

    scheda.dataset.slideIndex = 0;

    const tab = generaTabella(p.dettagli);

    scheda.innerHTML = `
        <div class="close-btn" onclick="this.parentElement.remove()">×</div>

        <div class="drag-area">
            <h3>${p.titolo}</h3>
            <div class="sottotitolo">${p.sottotitolo || ""}</div>
            <div class="meta">${p.codice || ""}</div>
        </div>

        <div class="viewer">
            <div class="slide table-slide">${tab}</div>
            ${p.immagini.map(src=>`<img class="slide popup-img" src="${src}">`).join("")}
        </div>

        <div class="contatore"></div>
    `;

    document.body.appendChild(scheda);

    mostraSlide(scheda,0);
    aggiornaContatore(scheda,p.immagini.length);

    scheda.querySelector(".viewer").onclick = ()=>{
        nextSlide(scheda,p.id);
    };

    /* DRAG SOLO DESKTOP */
    if(window.innerWidth > 520){
        renderDraggable(scheda);
    }
}

/* ============================================================
   SLIDES
============================================================ */

function nextSlide(scheda,id){
    const p = progetti.find(x=>x.id===id);
    const tot = p.immagini.length + 1;

    let index = Number(scheda.dataset.slideIndex);
    index = (index+1)%tot;

    scheda.dataset.slideIndex = index;
    mostraSlide(scheda,index);
    aggiornaContatore(scheda,p.immagini.length);
}

function mostraSlide(scheda,index){
    const slides = scheda.querySelectorAll(".viewer .slide");
    slides.forEach((s,i)=>{
        s.style.display = (i===index ? "block" : "none");
    });
}

function aggiornaContatore(scheda,totImg){
    let i = Number(scheda.dataset.slideIndex);
    scheda.querySelector(".contatore").textContent =
        (i===0 ? "tabella" : `${i} / ${totImg}`);
}

/* ============================================================
   DRAG DESKTOP
============================================================ */

function renderDraggable(el){
    let offX = 0, offY = 0;
    let down = false;

    el.querySelector(".drag-area").addEventListener("mousedown",e=>{
        down = true;
        offX = e.clientX - el.offsetLeft;
        offY = e.clientY - el.offsetTop;
    });

    document.addEventListener("mouseup", ()=>down=false);

    document.addEventListener("mousemove", e=>{
        if(!down) return;
        el.style.left = (e.clientX - offX) + "px";
        el.style.top  = (e.clientY - offY) + "px";
    });
}
