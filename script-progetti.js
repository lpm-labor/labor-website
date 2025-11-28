/* ============================
   DATI: temi + progetti (mantieni / modifica come preferisci)
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
        temi: ["2023", "expo"],
        immagini: [
            "img/progetti/1/4.19_023-001_axo.jpg",
            "img/progetti/1/4.19_023-001_proiez.jpg"
        ],
        dettagli: {
            design: "LABOR",
            anno: "2023",
            status: "completato",
            materiali: "MDF, legno d'acero",
            dimensioni: "variabili",
            quantità: "12 pezzi"
        }
    },
    {
        id: 2,
        titolo: "progetto 2",
        sottotitolo: "installazione temporanea",
        codice: "EXP-014",
        temi: ["2023", "expo"],
        immagini: ["img/placeholder.jpg"],
        dettagli: {
            design: "LABOR",
            anno: "2023",
            status: "in corso",
            materiali: "plexiglass",
            dimensioni: "120 × 60 cm",
            quantità: "4 moduli"
        }
    }
];

/* ============================
   GENERA LISTA (temi e progetti)
============================ */

const lista = document.getElementById("listaTemi");
if (!lista) throw new Error("Elemento #listaTemi non trovato in pagina");

temi.forEach(t => {
    const voce = document.createElement("a");
    voce.textContent = t.nome;
    voce.href = "javascript:void(0)";
    voce.dataset.target = "sm_" + t.id;
    voce.className = "tema-link";

    const submenu = document.createElement("div");
    submenu.id = "sm_" + t.id;
    submenu.className = "submenu";

    progetti
        .filter(p => Array.isArray(p.temi) && p.temi.includes(t.id))
        .forEach(p => {
            const linkP = document.createElement("a");
            linkP.textContent = p.titolo;
            linkP.href = "javascript:void(0)";
            linkP.dataset.id = p.id;
            linkP.className = "progetto-link";
            submenu.appendChild(linkP);
            submenu.appendChild(document.createElement("br"));
        });

    lista.appendChild(voce);
    lista.appendChild(document.createElement("br"));
    lista.appendChild(submenu);
});

/* gestione click delegato su lista */
lista.addEventListener("click", (ev) => {
    const tema = ev.target.closest(".tema-link");
    const progetto = ev.target.closest(".progetto-link");

    if (tema) {
        const target = document.getElementById(tema.dataset.target);
        if (target) target.style.display = target.style.display === "block" ? "none" : "block";
    }

    if (progetto) {
        const id = Number(progetto.dataset.id);
        apriProgetto(id);
    }
});

/* reset "chiudi tutte" */
document.querySelector(".chiudi-tutte")?.addEventListener("click", () => {
    document.querySelectorAll(".scheda").forEach(s => s.remove());
});

/* ============================
   FUNZIONE APRI POPUP (crea scheda)
============================ */

let offset = 0;

function apriProgetto(id) {
    const p = progetti.find(x => x.id === id);
    if (!p) return;

    offset += 25;

    const scheda = document.createElement("div");
    scheda.className = "scheda";
    scheda.style.left = (280 + offset) + "px";
    scheda.style.top = (120 + offset) + "px";
    scheda.dataset.imgIndex = 0;

    // recupera valori tabella con fallback
    const getVal = (key) => {
        if (p.dettagli && p.dettagli[key] !== undefined) return p.dettagli[key];
        if (p[key] !== undefined) return p[key];
        return "—";
    };

    // costruzione markup (titolo + img + tabella ordinata)
    const imgSrc = (p.immagini && p.immagini.length) ? p.immagini[0] : "img/placeholder.jpg";

    scheda.innerHTML = `
        <div class="close-btn" role="button" aria-label="chiudi">×</div>

        <div class="drag-area">
            <h3>${escapeHtml(p.titolo)}</h3>
            <div class="sottotitolo">${escapeHtml(p.sottotitolo || "")}</div>
            <div class="codice">codice: ${escapeHtml(p.codice || "—")}</div>
        </div>

        <img class="popup-img" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.titolo)}">

        <table class="dettagli-table">
            <tr><td>design</td><td>${escapeHtml(getVal("design"))}</td></tr>
            <tr><td>anno</td><td>${escapeHtml(getVal("anno"))}</td></tr>
            <tr><td>status</td><td>${escapeHtml(getVal("status"))}</td></tr>
            <tr><td>materiali</td><td>${escapeHtml(getVal("materiali"))}</td></tr>
            <tr><td>dimensioni</td><td>${escapeHtml(getVal("dimensioni"))}</td></tr>
            <tr><td>quantità</td><td>${escapeHtml(getVal("quantità"))}</td></tr>
        </table>
    `;

    document.body.appendChild(scheda);

    // popola funzionalità: chiudi, cambio immagini, drag
    const closeBtn = scheda.querySelector(".close-btn");
    closeBtn.addEventListener("click", () => scheda.remove());

    const imgEl = scheda.querySelector(".popup-img");
    imgEl.addEventListener("click", () => cycleImage(imgEl, p));

    enableDrag(scheda);
}

/* ============================
   CICLO IMMAGINE
============================ */

function cycleImage(imgEl, progetto) {
    if (!progetto.immagini || progetto.immagini.length === 0) return;
    let idx = Number(imgEl.parentElement.dataset.imgIndex || 0);
    idx = (idx + 1) % progetto.immagini.length;
    imgEl.parentElement.dataset.imgIndex = idx;
    imgEl.src = progetto.immagini[idx];
}

/* ============================
   DRAG (semplice e robusto)
============================ */

function enableDrag(el) {
    const drag = el.querySelector(".drag-area");
    if (!drag) return;

    let startX = 0, startY = 0, origX = 0, origY = 0;

    const onMouseDown = (e) => {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        const rect = el.getBoundingClientRect();
        origX = rect.left;
        origY = rect.top;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        el.style.left = (origX + dx) + "px";
        el.style.top = (origY + dy) + "px";
    };

    const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    drag.addEventListener("mousedown", onMouseDown);
}

/* ============================
   ESCAPE HTML (sicurezza minima)
============================ */

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
