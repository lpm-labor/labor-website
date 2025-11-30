/* ============================================================
   script-progetti.js — versione pulita e ottimizzata
   - popup posizionati a destra della colonna
   - random controllato
   - drag desktop + touch
   - slide viewer (table + immagini)
   - z-index management (click porta in primo piano)
   - tutti i campi opzionali
============================================================ */

/* ---------------------------
   DATI: TEMI + PROGETTI (esempi)
   Aggiungi qui i tuoi progetti reali seguendo il modello.
---------------------------- */
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
      design: "Innsbruck",
      anno: "2023",
      status: "completato",
      materiali: "MDF, acero",
      dimensioni: "—",
      quantità: "12 pezzi",
      tecnica_lavorazione: "—",
      energia_produzione: "—",
      link: "—"
    }
  }
];

/* ---------------------------
   SCHEMA TABELLA (1-2-1-2-1-1-1)
   Cambia ordine o aggiungi campi solo qui (tutti opzionali)
---------------------------- */
const schemaTabella = [
  { colonne: ["design"] },
  { colonne: ["anno", "status"] },
  { colonne: ["materiali"] },
  { colonne: ["dimensioni", "quantità"] },
  { colonne: ["tecnica_lavorazione"] },
  { colonne: ["energia_produzione"] },
  { colonne: ["link"] }
];

/* ============================================================
   UTILI: label leggibili da chiavi (es. tecnica_lavorazione -> tecnica lavorazione)
============================================================ */
function labelFromKey(key) {
  if (!key) return "";
  return key.replace(/_/g, " ");
}

/* ============================================================
   GENERA HTML DELLA TABELLA TECNICA
============================================================ */
function generaTabella(dettagli = {}) {
  let html = `<div class="table-grid">`;

  schemaTabella.forEach((riga) => {
    const count = riga.colonne.length;
    html += `<div class="table-row cols-${count}">`;

    riga.colonne.forEach((key) => {
      let value = (dettagli[key] !== undefined && dettagli[key] !== null && dettagli[key] !== "") ? dettagli[key] : "—";

      if (key === "link" && value !== "—") {
        // assicuriamoci che sia un href valido (semplice fallback)
        const href = value.startsWith("http") ? value : `http://${value}`;
        value = `<a href="${href}" target="_blank" rel="noopener noreferrer">${value}</a>`;
      }

      html += `
        <div class="info-cell" data-key="${key}">
          <span class="info-label">${labelFromKey(key)}</span>
          <span class="info-value">${value}</span>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

/* ============================================================
   RENDER LISTA TEMI E PROGETTI (sidebar)
============================================================ */
function renderListaTemi() {
  const lista = document.getElementById("listaTemi");
  if (!lista) return;

  lista.innerHTML = "";

  temi.forEach((t) => {
    const voce = document.createElement("a");
    voce.textContent = t.nome;
    voce.href = "javascript:void(0)";
    voce.onclick = () => toggleSubmenu("sm_" + t.id);
    lista.appendChild(voce);
    lista.appendChild(document.createElement("br"));

    const submenu = document.createElement("div");
    submenu.id = "sm_" + t.id;
    submenu.className = "submenu";

    progetti
      .filter((p) => Array.isArray(p.temi) && p.temi.includes(t.id))
      .forEach((p) => {
        const link = document.createElement("div");
        link.className = "submenu-item";
        link.textContent = p.titolo;
        link.onclick = () => apriProgetto(p.id);
        submenu.appendChild(link);
      });

    lista.appendChild(submenu);
  });
}

/* toggle submenu */
function toggleSubmenu(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === "block" ? "none" : "block";
}

/* chiudi tutte le schede */
function chiudiTutte() {
  document.querySelectorAll(".scheda").forEach((s) => s.remove());
}

/* ============================================================
   POSIZIONAMENTO CASUALE MA CONTROLLATO DEI POPUP
   - garantisce che i popup partano a destra della colonna
   - cerca di evitare di uscire dallo schermo
============================================================ */
function computeRandomPosition(popupWidth = 720) {
  // coordinate base (la linea è stata posizionata a 240px, consideriamo un piccolo margine)
  const columnLeft = 240; // coordinate sincronizzate con CSS
  const minLeft = columnLeft + 20; // margine iniziale a destra della linea
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  // calcola left massimo che permette al popup di stare interamente in viewport
  const maxLeftIfFixedWidth = Math.max(minLeft, viewportW - popupWidth - 20);
  // scegli un left compreso tra minLeft e (minLeft + 260) ma non oltre maxLeftIfFixedWidth
  const candidateMax = Math.min(minLeft + 260, maxLeftIfFixedWidth);
  let left;
  if (candidateMax <= minLeft) {
    left = minLeft;
  } else {
    left = minLeft + Math.floor(Math.random() * (candidateMax - minLeft + 1));
    // piccolo jitter +/- 40 px
    left += Math.floor(Math.random() * 81) - 40;
    // vincola all'intervallo consentito
    left = Math.max(minLeft, Math.min(left, candidateMax));
  }

  // top: scegli tra 120 e viewportH - 180, con jitter
  const minTop = 120;
  const maxTop = Math.max(minTop, viewportH - 180);
  let top = minTop + Math.floor(Math.random() * Math.max(1, Math.min(200, maxTop - minTop + 1)));
  top += Math.floor(Math.random() * 121) - 60; // ±60 jitter
  top = Math.max(60, Math.min(top, maxTop));

  return { left, top };
}

/* ============================================================
   APERTURA DEL POPUP (crea DOM, posiziona, attiva eventi)
============================================================ */
let globalZ = 60; // gestione z-index incrementale

function apriProgetto(id) {
  const p = progetti.find((x) => x.id === id);
  if (!p) return;

  const popupWidth = 720; // dimensione di riferimento (css 720px)
  const pos = computeRandomPosition(popupWidth);

  // elemento scheda
  const scheda = document.createElement("div");
  scheda.className = "scheda";
  scheda.style.left = pos.left + "px";
  scheda.style.top = pos.top + "px";
  scheda.style.zIndex = ++globalZ;
  scheda.dataset.slideIndex = 0;

  const tabellaHTML = generaTabella(p.dettagli || {});

  scheda.innerHTML = `
    <div class="close-btn" title="chiudi">×</div>

    <div class="drag-area">
        <div class="drag-handle">✥</div>
        <h3>${escapeHtml(p.titolo)}</h3>
        <div class="sottotitolo">${escapeHtml(p.sottotitolo || "")}</div>
        <div class="meta">${escapeHtml(p.codice || "")}</div>
    </div>

    <div class="viewer">
        <div class="slide table-slide">
            ${tabellaHTML}
        </div>

        ${Array.isArray(p.immagini) ? p.immagini.map(src => `<img class="slide popup-img" src="${escapeAttr(src)}">`).join("") : ""}
    </div>

    <div class="contatore"></div>
  `;

  // append e inizializzazioni
  document.body.appendChild(scheda);

  // eventi: close
  scheda.querySelector(".close-btn").addEventListener("click", () => scheda.remove());

  // mostra la slide iniziale e aggiorna contatore
  mostraSlide(scheda, 0);
  aggiornaContatore(scheda, (p.immagini || []).length);

  // click sul viewer -> nextSlide
  const viewer = scheda.querySelector(".viewer");
  if (viewer) {
    viewer.addEventListener("click", (ev) => {
      // se il click avviene su un link interno non avanzare
      if (ev.target.tagName.toLowerCase() === "a") return;
      nextSlide(scheda, p.id);
    });
  }

  // rendi la scheda draggable (mouse + touch)
  makeDraggable(scheda);

  // al click porta la scheda in primo piano
  scheda.addEventListener("mousedown", bringToFront);
  scheda.addEventListener("touchstart", bringToFront, { passive: true });

  return scheda;
}

/* ============================================================
   ESCAPE utilities (semplici, per sicurezza nel DOM)
============================================================ */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function escapeAttr(str) {
  if (str === null || str === undefined) return "";
  return String(str).replaceAll('"', "%22");
}

/* ============================================================
   SLIDE MANAGEMENT
   - index 0 = tabella
   - index 1..n = immagini (1-based display)
============================================================ */
function nextSlide(scheda, projectId) {
  const p = progetti.find((x) => x.id === projectId);
  if (!p) return;
  const total = (p.immagini || []).length + 1;
  let index = Number(scheda.dataset.slideIndex) || 0;
  index = (index + 1) % total;
  scheda.dataset.slideIndex = index;
  mostraSlide(scheda, index);
  aggiornaContatore(scheda, (p.immagini || []).length);
}

function mostraSlide(scheda, index) {
  const slides = scheda.querySelectorAll(".viewer .slide");
  slides.forEach((s, i) => {
    s.style.display = i === index ? "block" : "none";
  });
}

function aggiornaContatore(scheda, nImages) {
  const i = Number(scheda.dataset.slideIndex) || 0;
  const cont = scheda.querySelector(".contatore");
  if (!cont) return;
  cont.textContent = i === 0 ? `0 di ${nImages}` : `${i} di ${nImages}`;
}

/* ============================================================
   DRAG: supporto mouse + touch
   - drag solo partendo dalla .drag-area (header)
   - evita conflitti con lo slide viewer
============================================================ */
function makeDraggable(scheda) {
  const handle = scheda.querySelector(".drag-area");
  if (!handle) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;

  // mouse
  handle.addEventListener("mousedown", (e) => {
    // solo bottone sinistro
    if (e.button !== 0) return;
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = scheda.getBoundingClientRect();
    origLeft = rect.left;
    origTop = rect.top;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    scheda.style.left = Math.max(0, origLeft + dx) + "px";
    scheda.style.top = Math.max(10, origTop + dy) + "px";
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  // touch
  handle.addEventListener("touchstart", (e) => {
    // non bloccare lo scrolling se pinch/zoom: se più di un touch -> ignora
    if (!e.touches || e.touches.length > 1) return;
    e.preventDefault();
    const t = e.touches[0];
    isDragging = true;
    startX = t.clientX;
    startY = t.clientY;
    const rect = scheda.getBoundingClientRect();
    origLeft = rect.left;
    origTop = rect.top;

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("touchcancel", onTouchEnd);
  }, { passive: false });

  function onTouchMove(e) {
    if (!isDragging || !e.touches || e.touches.length > 1) return;
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    scheda.style.left = Math.max(0, origLeft + dx) + "px";
    scheda.style.top = Math.max(10, origTop + dy) + "px";
  }

  function onTouchEnd() {
    isDragging = false;
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", onTouchEnd);
    document.removeEventListener("touchcancel", onTouchEnd);
  }
}

/* ============================================================
   PORTA IN PRIMO PIANO LA SCHEDA CLICCATA
============================================================ */
function bringToFront(ev) {
  const target = ev.currentTarget || ev.target;
  const scheda = target.closest && target.closest(".scheda");
  if (!scheda) return;
  globalZ++;
  scheda.style.zIndex = globalZ;
}

/* ============================================================
   INIT
   - render lista
   - set listener globali (es. click su scheda per portare in front)
============================================================ */
function init() {
  renderListaTemi();

  // Porta in primo piano allo stroke su click/touch (anche se non sul body della scheda)
  document.addEventListener("click", (ev) => {
    const s = ev.target.closest && ev.target.closest(".scheda");
    if (s) {
      globalZ++;
      s.style.zIndex = globalZ;
    }
  });

  // window resize: nessuna azione invasiva, ma potremmo riequilibrare posizioni
  window.addEventListener("resize", () => {
    // opzionale: potremmo limitare popups che escono dallo schermo
    document.querySelectorAll(".scheda").forEach(s => {
      const rect = s.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let changed = false;
      if (rect.right > vw - 10) {
        s.style.left = Math.max(10, vw - rect.width - 20) + "px"; changed = true;
      }
      if (rect.bottom > vh - 10) {
        s.style.top = Math.max(10, vh - rect.height - 20) + "px"; changed = true;
      }
      if (changed) { /* no-op, mantenuto per future hooks */ }
    });
  });
}

// avvia init al caricamento DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* ============================================================
   FINE FILE
============================================================ */
