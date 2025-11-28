/* ============================
   TEMI (liberi)
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
   PROGETTI (nuova struttura)
============================ */

const progetti = [
    {
        id: 1,
        titolo: "progetto 1",
        sottotitolo: "sottotitolo esempio",
        codice: "P001",
        anno: "2023",
        status: "completato",
        temi: ["2023", "ricerca"],
        immagini: ["img/placeholder.jpg"],
        tecnica: {
            materiali: "—",
            tecnologia: "—",
            energia: "—",
            quantita: "—"
        }
    },
    {
        id: 2,
        titolo: "progetto 2",
        sottotitolo: "installazione sperimentale",
        codice: "P002",
        anno: "2023",
        status: "in corso",
        temi: ["2023", "expo"],
        immagini: ["img/placeholder.jpg"],
        tecnica: {
            materiali: "—",
            tecnologia: "—",
            energia: "—",
            quantita: "—"
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

function toggleSubmenu(id) {
    const sm = document.getElementById(id);
    sm.style.display = sm.style.display === "block" ? "none" : "block";
}

function chiudiTutte() {
    document.querySelectorAll(".scheda").forEach(s => s.remove());
}

let offset = 0;

/* ============================
   APERTURA SCHEDA
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

        <div class="drag-area">
            <h1>${p.titolo}</h1>
            <h2>${p.sottotitolo || ""}</h2>

            <div class="info-tech">
                codice: <strong>${p.codice}</strong><br>
                anno: ${p.anno} — stato: ${p.status}
            </div>
        </div>

        <img class="popup-img" 
            src="${p.immagini[0] || 'img/placeholder.jpg'}"
            onclick="nextImg(this, ${id})">

        <table class="tab-tecnica">
            <tr><td>materiali</td><td>${p.tecnica.materiali}</td></tr>
            <tr><td>tecnologia</td><td>${p.tecnica.tecnologia}</td></tr>
            <tr><td>energia impiegata</td><td>${p.tecnica.energia}</td></tr>
            <tr><td>quantità prodotte</td><td>${p.tecnica.quantita}</td></tr>
        </table>
    `;

    document.body.appendChild(scheda);

    scheda.dataset.imgIndex = 0;

    renderDraggable(scheda);
}

/* cambio immagine */
function nextImg(img, id) {
    const p = progetti.find(x => x.id === id);
    if (!p) return;

    let i = Number(img.parentElement.dataset.imgIndex || 0);
    i = (i + 1) % p.immagini.length;
    img.parentElement.dataset.imgIndex = i;

    img.src = p.immagini[i];
}

/* Drag */
function renderDraggable(el) {
    const drag = el.querySelector(".drag-area");
    if (!drag) return;

    let sx = 0, sy = 0;

    drag.onmousedown = e => {
        sx = e.clientX - el.getBoundingClientRect().left;
        sy = e.clientY - el.getBoundingClientRect().top;

        document.onmousemove = ev => {
            el.style.left = (ev.clientX - sx) + "px";
            el.style.top = (ev.clientY - sy) + "px";
        };

        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}
