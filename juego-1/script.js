const letters = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T","U"
];

const correctConnections = {
  A: "D", D: "H", H: "J", J: "L", L: "A",
  C: "M", M: "N", N: "O", O: "P", P: "T", T: "C",
  B: "E", E: "F", F: "K", K: "Q", Q: "B",
  G: "R", R: "I", I: "S", S: "G",
  U: "U"
};

const playArea = document.getElementById("play-area");
const svg = document.getElementById("connections-layer");
const statusText = document.getElementById("status");
const connectBtn = document.getElementById("connect-btn");
const selfBtn = document.getElementById("self-btn");
const clearBtn = document.getElementById("clear-btn");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const currentClue = document.getElementById("current-clue");
const cluesList = document.getElementById("clues-list");
const clues = {
  // Ciclo A
  "A->D": "https://youtube.com/pista_AD",
  "D->H": "https://youtube.com/pista_DH",
  "H->J": "https://youtube.com/pista_HJ",
  "J->L": "https://youtube.com/pista_JL",
  "L->A": "https://youtube.com/pista_LA",

  // Ciclo C
  "C->M": "https://youtube.com/pista_CM",
  "M->N": "https://youtube.com/pista_MN",
  "N->O": "https://youtube.com/pista_NO",
  "O->P": "https://youtube.com/pista_OP",
  "P->T": "https://youtube.com/pista_PT",
  "T->C": "https://youtube.com/pista_TC",

  // Ciclo B
  "B->E": "https://youtube.com/pista_BE",
  "E->F": "https://youtube.com/pista_EF",
  "F->K": "https://youtube.com/pista_FK",
  "K->Q": "https://youtube.com/pista_KQ",
  "Q->B": "https://youtube.com/pista_QB",

  // Ciclo G
  "G->R": "https://youtube.com/pista_GR",
  "R->I": "https://youtube.com/pista_RI",
  "I->S": "https://youtube.com/pista_IS",
  "S->G": "https://youtube.com/pista_SG",

  // Auto conexión
  "U->U": "https://youtube.com/pista_UU"
};


let selected = [];
let solved = new Map(); // "A->B" -> line SVG
const points = {};

// ===== SVG defs (flecha) =====
svg.innerHTML = `
<defs>
  <marker id="arrowhead" markerWidth="10" markerHeight="7"
    refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" class="arrow"/>
  </marker>
</defs>
`;

// ===== Crear puntos =====
letters.forEach(letter => {
  const p = document.createElement("div");
  p.className = "point";
  p.textContent = letter;
  p.dataset.letter = letter;


  p.style.left = Math.random() * 90 + "%";
  p.style.top = Math.random() * 70 + "%";

  enableDrag(p);
  p.addEventListener("click", () => selectPoint(p));

  playArea.appendChild(p);
  points[letter] = p;
});

// ===== Selección =====
function selectPoint(p) {
  if (p.wasDragged) {
    p.wasDragged = false; // reset
    return;
  }

  if (selected.includes(p)) return;
  if (selected.length === 2) clearSelection();

  selected.push(p);
  p.classList.add("selected");

  statusText.textContent = selected.map(x => x.textContent).join(" → ");
  connectBtn.disabled = selected.length !== 2;
  selfBtn.disabled = selected.length !== 1;
}


function clearSelection() {
  selected.forEach(p => p.classList.remove("selected"));
  selected = [];

  statusText.textContent = "Seleccioná una letra";
  connectBtn.disabled = true;
  selfBtn.disabled = true;
}

// ===== Botones =====
connectBtn.addEventListener("click", () => {
  if (selected.length !== 2) return;

  const [p1, p2] = selected;
  const a = p1.textContent;
  const b = p2.textContent;
  const key = `${a}->${b}`;

  if (correctConnections[a] === b && !solved.has(key)) {
    const obj = createArrow(p1, p2);
    solved.set(key, obj);

    const link = clues[key] || "https://youtube.com/pista";
    showClue(key, link);

    statusText.textContent = `✔ ${a} → ${b}`;
  } else {
    statusText.textContent = `✖ ${a} → ${b}`;
  }

  clearSelection();
  checkEnd();
});
selfBtn.addEventListener("click", () => {
  if (selected.length !== 1) return;

  const p = selected[0];
  const a = p.textContent;
  const key = `${a}->${a}`;

  if (correctConnections[a] === a && !solved.has(key)) {
    const obj = createSelfArrow(p);
    solved.set(key, obj);

    const link = clues[key] || "https://youtube.com/pista";
    showClue(key, link);

    statusText.textContent = `✔ ${a} → ${a}`;
  } else {
    statusText.textContent = `✖ Incorrecto`;
  }

  clearSelection();
  checkEnd();
});
function showClue(key, link) {
  // 👉 AGREGAR DIRECTO AL PANEL
  const li = document.createElement('li');
  li.innerHTML = `<strong>${key}</strong>: <a href="${link}" target="_blank">ver</a>`;
  cluesList.appendChild(li);

  // Aviso abajo
  currentClue.innerHTML = `
    🎯 Pista nueva descubierta: <strong>${key}</strong>
    <a href="${link}" target="_blank">ver</a>
  `;

  setTimeout(() => {
    currentClue.textContent = '';
  }, 5000);
}
clearBtn.addEventListener("click", clearSelection);



// ===== Flechas =====
function createArrow(p1, p2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("marker-end", "url(#arrowhead)");
  svg.appendChild(line);

  const obj = { line, p1, p2 };
  updateArrow(obj);
  return obj;
}

function updateArrow(obj) {
  const { line, p1, p2 } = obj;
  const r1 = p1.getBoundingClientRect();
  const r2 = p2.getBoundingClientRect();
  const pr = playArea.getBoundingClientRect();

  line.setAttribute("x1", r1.left + r1.width / 2 - pr.left);
  line.setAttribute("y1", r1.top + r1.height / 2 - pr.top);
  line.setAttribute("x2", r2.left + r2.width / 2 - pr.left);
  line.setAttribute("y2", r2.top + r2.height / 2 - pr.top);
}

// ===== Drag & Drop =====
function enableDrag(p) {
  let startX, startY;
  let offsetX, offsetY;
  let moved = false;

  p.addEventListener("mousedown", e => {
    startX = e.clientX;
    startY = e.clientY;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    moved = false;

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });

  function move(e) {
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);

    // umbral para considerar drag
    if (dx > 4 || dy > 4) {
      moved = true;
      p.classList.add("dragging");

      const rect = playArea.getBoundingClientRect();
      p.style.left = (e.clientX - rect.left - offsetX) + "px";
      p.style.top = (e.clientY - rect.top - offsetY) + "px";

      solved.forEach(obj => {
        if (!obj) return;

        if (obj.line) {
          if (obj.p1 === p || obj.p2 === p) {
            updateArrow(obj);
          }
        }

        if (obj.circle && obj.p === p) {
          updateSelfArrow(obj.circle, p);
        }
      });
    }
  }

  function stop() {
  p.classList.remove("dragging");
  document.removeEventListener("mousemove", move);
  document.removeEventListener("mouseup", stop);

  // 👇 marcar que fue drag
  if (moved) {
    p.wasDragged = true;
  }
}
}

function createSelfArrow(p) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "path");

  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", "#1a73e8");
  circle.setAttribute("stroke-width", "3");
  circle.setAttribute("marker-end", "url(#arrowhead)");

  svg.appendChild(circle);

  updateSelfArrow(circle, p);
  return { circle, p };
}

function updateSelfArrow(circle, p) {
  const r = p.getBoundingClientRect();
  const pr = playArea.getBoundingClientRect();

  const cx = r.left + r.width / 2 - pr.left;
  const cy = r.top + r.height / 2 - pr.top;

  const radiusX = 48;   // ancho del arco
  const radiusY = 38;   // altura del arco (más separado por arriba)

  const startX = cx - radiusX;
  const startY = cy + 2;

  const endX = cx + radiusX;
  const endY = cy + 2;

  const d = `
    M ${startX} ${startY}
    A ${radiusX} ${radiusY} 0 0 1 ${endX} ${endY}
  `;

  circle.setAttribute("d", d);
}

// ===== Final =====
function checkEnd() {
  if (solved.size === Object.keys(correctConnections).length) {
    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
  }
}

// Inicio
document.getElementById("start-game").addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
});
