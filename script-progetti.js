/* ============================
   TEMI
============================ */

const temi = [
    { id: "2023", nome: "2023" },
    { id: "2024", nome: "2024" },
    { id: "2025", nome: "2025" },
    { id: "expo", nome: "esposizione" },
    { id: "arredo", nome: "arredamento" },
    { id: "ricerca", nome: "ricerca" }
];

/* ============================
   PROGETTI
============================ */

const progetti = [
    {
        id: 1,
        titolo: "Innsbruck",
        sottotitolo: "Espositori per immagini",
        codice: "4.19_023-001",
        anno: "2023",
        status: "completato",

        temi: ["2023", "expo"],

        immagini: [
            "img/progetti/1/4.19_023-001_axo.jpg",
            "img/progetti/1/4.19_023-001_proiez.jpg"
        ],

        dettagli: {
            materiali: "MDF, legno d'acero",
            dimensioni: "—",
            quantità: "12 pezzi"
        }
    },

    {
        id: 2,
        titolo: "progetto 2",
        sottotitolo: "installazione temporanea",
        codice: "EXP-014",
        anno: "2023",
        status: "in corso",

        temi: ["2023", "expo"],

        immagini: ["img/placeholder.jpg"],

        dettagli: {
            materiali: "plexiglass",
            dimensioni: "—",
            quantità: "4 moduli"
        }
    }
];

/* ============================
   GENERA LISTA TEMI + PROGETTI
============================ */

const lista = document.getElementById("listaTemi");

temi.forEach(t => {

    const voce = document.createElement("a");
    voce.textContent = t.nome;
    voce.onclick = () => toggleSubmenu("sm_" + t.id);

    const br = document.createElement("br");

    const submenu = document.createElement("div");
    submenu.id = "sm_" + t.id;
    submenu.className = "submenu";

    progetti
        .filter(p => p.temi.includes(t.id))
        .forEach(p => {
            const linkP = document.createElement("div");
            linkP.className = "submenu-item";
            linkP.textContent = p.titolo;
            linkP.onclick = () => apriProgetto(p.id);
            submenu.appendChild(linkP);
        });

    lista.appendChild(voce);
    lista.appendChild(br);
    lista.appendChild(submenu);
});

function toggleSubmenu(id) {
    const sm = document.getElementById(id);
    sm.style.display = sm.style.display === "block" ? "none" : "block";
}

function chiudiTutte() {
    document.querySelectorAll(".scheda").forEach(s => s.remove());
}

let offset = 0;

/* ============================
   POPUP PROGETTO
============================ */

function apriProgetto(id) {
    const p = progetti.find(x => x.id === id);
    if (!p) return;

    offset += 25;

    const scheda = document.createElement("div");
    scheda.className = "scheda";
    scheda.style.left = (300 + offset) + "px";
    scheda.style.top = (150 + offset) + "px";

    scheda.dataset.imgIndex = 0;

    scheda.innerHTML = `
        <div class="close-btn" onclick="this.parentElement.remove()">×</div>

        <div class="drag-area">
            <h3>${p.titolo}</h3>
            <div class="sottotitolo">${p.sottotitolo || ""}</div>
            <div class="meta">
            ${p.codice}
            </div>

        </div>

       <div class="viewer" onclick="nextImg(this, ${id})">

    <div class="slide table-slide">
        <table class="dettagli-table">
            <tr><td>design</td><td>${p.titolo}</td></tr>
            <tr><td>anno</td><td>${p.anno}</td></tr>
            <tr><td>status</td><td>${p.status}</td></tr>
            <tr><td>materiali</td><td>${p.dettagli.materiali || "-"}</td></tr>
            <tr><td>dimensioni</td><td>${p.dettagli.dimensioni || "-"}</td></tr>
            <tr><td>quantità</td><td>${p.dettagli.quantità || "-"}</td></tr>
        </table>
    </div>

    ${p.immagini
        .map(src => `<img class="slide popup-img" src="${src}">`)
        .join("")}

</div>

<div class="contatore"></div>

    `;
scheda.dataset.slideIndex = 0;

aggiornaContatore(scheda, p.immagini.length);
mostraSlide(scheda, 0);

    document.body.appendChild(scheda);

    renderDraggable(scheda);
}

/* ============================
   CAMBIO IMMAGINE
============================ */

function nextImg(viewerContainer, id) {
    const scheda = viewerContainer.closest(".scheda");
    const p = progetti.find(x => x.id === id);

    let idx = Number(scheda.dataset.slideIndex);
    const totalSlides = p.immagini.length + 1; // tabella + immagini

    idx = (idx + 1) % totalSlides; // ciclo infinito

    scheda.dataset.slideIndex = idx;

    mostraSlide(scheda, idx);
    aggiornaContatore(scheda, p.immagini.length);
}
function mostraSlide(scheda, index) {
    const slides = scheda.querySelectorAll(".viewer .slide");
    slides.forEach((s, i) => {
        s.style.display = (i === index) ? "block" : "none";
    });
}

function aggiornaContatore(scheda, imgCount) {
    const idx = Number(scheda.dataset.slideIndex);
    const cont = scheda.querySelector(".contatore");

    if (idx === 0) {
        cont.textContent = `0 di ${imgCount}`;
    } else {
        cont.textContent = `${idx} di ${imgCount}`;
    }
}

/* ============================
   DRAG
============================ */

function renderDraggable(el) {
    const drag = el.querySelector(".drag-area");
    let shiftX, shiftY;

    drag.onmousedown = e => {
        shiftX = e.clientX - el.getBoundingClientRect().left;
        shiftY = e.clientY - el.getBoundingClientRect().top;

        document.onmousemove = ev => {
            el.style.left = (ev.clientX - shiftX) + "px";
            el.style.top = (ev.clientY - shiftY) + "px";
        };

        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}
