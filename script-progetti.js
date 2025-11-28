/* ============================
   TEMI (modificabili liberamente)
============================ */

const temi = [
    { id: "2023", nome: "2023", eng: "2023" },
    { id: "2024", nome: "2024", eng: "2024" },
    { id: "2025", nome: "2025", eng: "2025" },
    { id: "expo", nome: "esposizioni", eng: "exhibition" },
    { id: "arredo", nome: "arredamento", eng: "interior design" },
    { id: "riuso", nome: "ri-uso", eng: "re-use" },
    { id: "archi", nome: "architettura", eng: "architecture" },
    { id: "ricerca", nome: "ricerca", eng: "research" }
];

/* ============================
   PROGETTI (modificabili liberamente)
   -- qui aggiungi/modifichi i progetti --
============================ */

const progetti = [
    {
        id: 1,
        titolo: "progetto 1",
        temi: ["2023", "ricerca"],
        descrizione: "descrizione breve del progetto 1.",
        immagini: ["img/placeholder.jpg"],
        dettagli: {
            oggetto: "—",
            materiali: "—",
            tecnica: "—",
            tempo: "—",
            numero: "—",
            cliente: "—",
            stato: "—",
            prestazioni: "—"
        }
    },
    {
        id: 2,
        titolo: "progetto 2",
        temi: ["2023", "expo"],
        descrizione: "descrizione breve del progetto 2.",
        immagini: ["img/placeholder.jpg"],
        dettagli: {
            oggetto: "—",
            materiali: "—",
            tecnica: "—",
            tempo: "—",
            numero: "—",
            cliente: "—",
            stato: "—",
            prestazioni: "—"
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
    voce.title = t.eng;
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

/* Mostra/nasconde */
function toggleSubmenu(id) {
    const sm = document.getElementById(id);
    sm.style.display = sm.style.display === "block" ? "none" : "block";
}

/* Reset */
function chiudiTutte() {
    document.querySelectorAll(".scheda").forEach(s => s.remove());
}

let offset = 0;

/* ============================
   APERTURA POPUP DINAMICO
============================ */

function apriProgetto(id) {
    const p = progetti.find(x => x.id === id);
    if (!p) return;

    offset += 25;

    const scheda = document.createElement("div");
    scheda.className = "scheda";
    scheda.style.left = (300 + offset) + "px";
    scheda.style.top = (140 + offset) + "px";

    scheda.innerHTML = `
        <div class="close-btn" onclick="this.parentElement.remove()">x</div>
        <div class="drag-area"><h3>${p.titolo}</h3></div>

        <img class="popup-img" src="${p.immagini[0] || 'img/placeholder.jpg'}" onclick="nextImg(this, ${id})">

        <p>${p.descrizione}</p>

        <table class="dettagli-table">
            ${Object.entries(p.dettagli).map(
                ([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`
            ).join("")}
        </table>
    `;

    document.body.appendChild(scheda);

    scheda.dataset.imgIndex = 0;

    renderDraggable(scheda);
}

/* CAMBIO IMMAGINE */
function nextImg(imgElement, id) {
    const p = progetti.find(x => x.id === id);
    if (!p || !p.immagini || p.immagini.length === 0) return;

    const parent = imgElement.parentElement;
    let index = Number(parent.dataset.imgIndex || 0);

    index = (index + 1) % p.immagini.length;

    parent.dataset.imgIndex = index;
    imgElement.src = p.immagini[index];
}

/* DRAG */
function renderDraggable(element) {
    const dragArea = element.querySelector(".drag-area");
    if (!dragArea) return;

    let shiftX = 0, shiftY = 0;

    dragArea.onmousedown = function(event) {
        shiftX = event.clientX - element.getBoundingClientRect().left;
        shiftY = event.clientY - element.getBoundingClientRect().top;

        document.onmousemove = function(e) {
            element.style.left = (e.clientX - shiftX) + "px";
            element.style.top = (e.clientY - shiftY) + "px";
        };

        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}
