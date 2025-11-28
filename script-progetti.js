/* ============================
   DATI
============================ */

const temi = [
    { id: "2023", nome: "2023" },
    { id: "2024", nome: "2024" },
    { id: "2025", nome: "2025" },
    { id: "expo", nome: "esposizione" },
    { id: "arredo", nome: "arredamento" },
    { id: "ricerca", nome: "ricerca" }
];

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
   GENERA LISTA TEMI
============================ */

const lista = document.getElementById("listaTemi");

temi.forEach(t => {
    // voce principale
    const voce = document.createElement("a");
    voce.textContent = t.nome;
    voce.dataset.target = "sm_" + t.id;
    voce.className = "tema-link";

    // submenu container
    const submenu = document.createElement("div");
    submenu.id = "sm_" + t.id;
    submenu.className = "submenu";

    const correlati = progetti.filter(p => p.temi.includes(t.id));

    correlati.forEach(p => {
        const linkP = document.createElement("a");
        linkP.textContent = p.titolo;
        linkP.className = "progetto-link";
        linkP.dataset.id = p.id;
        submenu.appendChild(linkP);
    });

    lista.appendChild(voce);
    lista.appendChild(document.createElement("br"));
    lista.appendChild(submenu);
});

/* ============================
   EVENTI LISTA
============================ */

lista.addEventListener("click", e => {
    const tema = e.target.closest(".tema-link");
    const progetto = e.target.closest(".progetto-link");

    if (tema) toggleSubmenu(tema.dataset.target);
    if (progetto) apriProgetto(Number(progetto.dataset.id));
});

/* ============================
   SUBMENU
============================ */

function toggleSubmenu(id) {
    const sm = document.getElementById(id);
    sm.style.display = sm.style.display === "block" ? "none" : "block";
}

/* ============================
   CHIUDI TUTTE
============================ */

document.querySelector(".chiudi-tutte")?.addEventListener("click", () => {
    document.querySelectorAll(".scheda").forEach(s => s.remove());
});

/* ============================
   POPUP
============================ */

let popupOffset = 0;

function apriProgetto(id) {
    const p = progetti.find(x => x.id === id);
    if (!p) return;

    popupOffset += 25;

    const scheda = document.createElement("div");
    scheda.className = "scheda";
    scheda.style.left = `${300 + popupOffset}px`;
    scheda.style.top = `${150 + popupOffset}px`;

    const header = document.createElement("div");
    header.className = "drag-area";
    header.innerHTML = `
        <h3>${p.titolo}</h3>
        <div class="sottotitolo">${p.sottotitolo || ""}</div>
        <div class="meta">codice: ${p.codice} — anno: ${p.anno} — stato: ${p.status}</div>
    `;

    const closeBtn = document.createElement("div");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => scheda.remove());

    const img = document.createElement("img");
    img.className = "popup-img";
    img.src = p.immagini[0];
    img.dataset.index = 0;

    img.addEventListener("click", () => nextImg(img, p));

    const table = document.createElement("table");
    table.className = "dettagli-table";
    table.innerHTML = Object.entries(p.dettagli)
        .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
        .join("");

    scheda.appendChild(closeBtn);
    scheda.appendChild(header);
    scheda.appendChild(img);
    scheda.appendChild(table);

    document.body.appendChild(scheda);

    enableDrag(scheda);
}

/* ============================
   IMMAGINI
============================ */

function nextImg(img, progetto) {
    let i = Number(img.dataset.index);
    i = (i + 1) % progetto.immagini.length;
    img.dataset.index = i;
    img.src = progetto.immagini[i];
}

/* ============================
   DRAG POPUP
============================ */

function enableDrag(el) {
    const drag = el.querySelector(".drag-area");
    let shiftX, shiftY;

    drag.addEventListener("mousedown", e => {
        shiftX = e.clientX - el.getBoundingClientRect().left;
        shiftY = e.clientY - el.getBoundingClientRect().top;

        function move(ev) {
            el.style.left = `${ev.clientX - shiftX}px`;
            el.style.top = `${ev.clientY - shiftY}px`;
        }

        function stop() {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", stop);
        }

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
    });
}
