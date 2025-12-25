const letters = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T","U"
];

/* 🔢 NÚMEROS CORRECTOS, CAMBIAR */
const correctNumbers = {
  A:1, B:2, C:3, D:4, E:5, F:6, G:7,
  H:8, I:9, J:10, K:11, L:12, M:13,
  N:14, O:15, P:16, Q:17, R:18,
  S:19, T:20, U:21
};

/* 🔍 PISTAS  CAMBIAR PISTAS */
const numberClues = {
  A: "https://youtube.com/pista_A1",
  B: "https://youtube.com/pista_B2",
  C: "https://youtube.com/pista_C3",
  D: "https://youtube.com/pista_D4",
  E: "https://youtube.com/pista_E5",
  F: "https://youtube.com/pista_F6",
  G: "https://youtube.com/pista_G7",
  H: "https://youtube.com/pista_H8",
  I: "https://youtube.com/pista_I9",
  J: "https://youtube.com/pista_J10",
  K: "https://youtube.com/pista_K11",
  L: "https://youtube.com/pista_L12",
  M: "https://youtube.com/pista_M13",
  N: "https://youtube.com/pista_N14",
  O: "https://youtube.com/pista_O15",
  P: "https://youtube.com/pista_P16",
  Q: "https://youtube.com/pista_Q17",
  R: "https://youtube.com/pista_R18",
  S: "https://youtube.com/pista_S19",
  T: "https://youtube.com/pista_T20",
  U: "https://youtube.com/pista_U21"
};

const playArea = document.getElementById("play-area");
const svg = document.getElementById("connections-layer");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const assignBtn = document.getElementById("assign-btn");
const clearBtn = document.getElementById("clear-btn");
const input = document.getElementById("number-input");
const cluesList = document.getElementById("clues-list");
const currentClue = document.getElementById("current-clue");
const points = {};
const positions = {
  // 🔵 Ciclo A (arriba izquierda)
  A: { x: 15, y: 15 },
  D: { x: 30, y: 10 },
  H: { x: 45, y: 15 },
  J: { x: 45, y: 30 },
  L: { x: 30, y: 35 },

  // 🟢 Ciclo C (arriba derecha)
  C: { x: 60, y: 15 },
  M: { x: 70, y: 10 },
  N: { x: 80, y: 15 },
  O: { x: 80, y: 30 },
  P: { x: 70, y: 35 },
  T: { x: 60, y: 30 },

  // 🟣 Ciclo B (abajo izquierda)
  B: { x: 15, y: 65 },
  E: { x: 30, y: 60 },
  F: { x: 45, y: 65 },
  K: { x: 45, y: 80 },
  Q: { x: 30, y: 85 },

  // 🟠 Ciclo G (abajo derecha)
  G: { x: 65, y: 65 },
  R: { x: 75, y: 60 },
  I: { x: 85, y: 65 },
  S: { x: 75, y: 80 },

  // ⚫ U (centro abajo)
  U: { x: 50, y: 55 }
};
const correctConnections = {
  A: "D", D: "H", H: "J", J: "L", L: "A",
  C: "M", M: "N", N: "O", O: "P", P: "T", T: "C",
  B: "E", E: "F", F: "K", K: "Q", Q: "B",
  G: "R", R: "I", I: "S", S: "G",
  U: "U"
};



let selected = null;
let solvedCount = 0;

/* SVG arrow */
svg.innerHTML = `
<defs>
  <marker id="arrowhead" markerWidth="10" markerHeight="7"
    refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" class="arrow"/>
  </marker>
</defs>
`;

/* Crear puntos */
letters.forEach(letter => {
  const p = document.createElement("div");
  p.className = "point";
  p.textContent = letter;
  p.dataset.letter = letter;

  const pos = positions[letter];
  p.style.left = pos.x + "%";
  p.style.top = pos.y + "%";

  p.addEventListener("click", () => selectPoint(p));
  playArea.appendChild(p);

  points[letter] = p;
});

/* Flechas */
function createArrow(p1, p2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("marker-end", "url(#arrowhead)");
  svg.appendChild(line);

  updateArrow({ line, p1, p2 });
}

function updateArrow({ line, p1, p2 }) {
  const r1 = p1.getBoundingClientRect();
  const r2 = p2.getBoundingClientRect();
  const pr = playArea.getBoundingClientRect();

  const x1c = r1.left + r1.width / 2 - pr.left;
  const y1c = r1.top + r1.height / 2 - pr.top;
  const x2c = r2.left + r2.width / 2 - pr.left;
  const y2c = r2.top + r2.height / 2 - pr.top;

  const dx = x2c - x1c;
  const dy = y2c - y1c;
  const dist = Math.hypot(dx, dy);

  const radius = r1.width / 2; // 24px

  const offsetX = (dx / dist) * radius;
  const offsetY = (dy / dist) * radius;

  line.setAttribute("x1", x1c + offsetX);
  line.setAttribute("y1", y1c + offsetY);
  line.setAttribute("x2", x2c - offsetX);
  line.setAttribute("y2", y2c - offsetY);
}


function drawAllArrows() {
  Object.entries(correctConnections).forEach(([from, to]) => {
    if (from === to) return;

    const p1 = points[from];
    const p2 = points[to];
    createArrow(p1, p2);
  });
}


/* Selección */
function selectPoint(p) {
  clearSelection();
  selected = p;
  p.classList.add("selected");
  assignBtn.disabled = false;
}

function clearSelection() {
  document.querySelectorAll(".point").forEach(p => p.classList.remove("selected"));
  selected = null;
  assignBtn.disabled = true;
}

/* Asignar número */
assignBtn.addEventListener("click", () => {
  if (!selected) return;

  const guess = Number(input.value);
  const letter = selected.dataset.letter;

  if (guess === correctNumbers[letter]) {
    selected.textContent = guess;
    selected.style.background = "#d4edda";
    assignBtn.disabled = true;
    solvedCount++;

    showClue(letter);
    checkEnd();
  } else {
    currentClue.textContent = "❌ Número incorrecto";
    setTimeout(() => currentClue.textContent = "", 2000);
  }

  input.value = "";
  clearSelection();
});

clearBtn.addEventListener("click", clearSelection);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !assignBtn.disabled) {
    assignBtn.click();
  }
});

/* Mostrar pista */
function showClue(letter) {
  const link = numberClues[letter];

  const li = document.createElement("li");
  li.innerHTML = `<strong>${letter}</strong>: <a href="${link}" target="_blank">ver</a>`;
  cluesList.appendChild(li);

  currentClue.innerHTML = `🎯 Nueva pista de <strong>${letter}</strong>`;
}

/* Final */
function checkEnd() {
  if (solvedCount === letters.length) {
    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
  }
}

/* Inicio */
document.getElementById("start-game").addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  setTimeout(drawAllArrows, 0);
});
