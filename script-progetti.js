/* ============================
   TEMI
============================ */

const temi = [
    { id: "2023", nome: "2023" },
    { id: "2024", nome: "2024" },
    { id: "expo", nome: "esposizioni" },
    { id: "arredo", nome: "arredamento" },
    { id: "ricerca", nome: "ricerca" }
];

/* ============================
   PROGETTI
============================ */

const progetti = [
    {
        id: 1,
        titolo: "progetto 1",
        sottotitolo: "sottotitolo esempio",
        codice: "PJT-001",
        anno: "2023",
        status: "completato",

        temi: ["2023", "ricerca"],

        immagini: ["img/placeholder.jpg", "img/placeholder.jpg"],

        dettagli: {
            materiali: "legno, acciaio",
            tecnologia: "taglio laser",
            energia: "3.2 kWh",
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
            tecnologia: "CNC",
            energia: "1.8 kWh",
            quantità: "4 moduli"
        }
    }
];

/* ============================
   GENERA LISTA
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
            const linkP = document.createElement("a");
            linkP.textContent = p.titolo;
            linkP.onclick = () => apriProgetto(p.id);
            submenu.appendChild(linkP);
            submenu.appendChild(document.createElement("br"));
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
   POPUP
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
            <div class="meta">codice: ${p.codice} — anno: ${p.anno} — stato: ${p.status}</div>
        </div>

        <img class="popup-img" src="${p.immagini[0]}" onclick="nextImg(this, ${id})">

        <table class="dettagli-table">
            ${Object.entries(p.dettagli).map(
                ([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`
            ).join("")}
        </table>
    `;

    document.body.appendChild(scheda);

    renderDraggable(scheda);
}

/* ============================
   CAMBIO IMMAGINE
============================ */

function nextImg(img, id) {
    const p = progetti.find(x => x.id === id);
    let idx = Number(img.parentElement.dataset.imgIndex);

    idx = (idx + 1) % p.immagini.length;

    img.parentElement.dataset.imgIndex = idx;
    img.src = p.immagini[idx];
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
