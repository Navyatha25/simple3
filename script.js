let isDragging = false;
let selectedLetters = [];
let currentWord = "";


let levels = [];
let currentLevel = 0;
let foundWords = [];

const grid = document.querySelector(".cross-grid")
const nextLevelBtn = document.getElementById("nextLevelBtn");
const displayWord = document.getElementById("displayWord");
 const svg = document.getElementById("lineSvg");

fetch("levels.json")
  .then(res => res.json())
  .then(data => {
    levels = data;
    loadLevel();
    });

        
function loadLevel() {
  const level = levels[currentLevel];

  buildGrid(level.gridLayout);
  buildWordWheel(level.wordWheel);

  foundWords = [];
  
  clearSelection();
  nextLevelBtn.classList.remove("show");

}

function buildGrid(gridLayout) {
  grid.innerHTML = "";
  let cellIndex = 0;

  gridLayout.forEach(row => {
    row.forEach(cell => {
      const div = document.createElement("div");

      if (cell === 0) {
        div.classList.add("empty-cell");
      } else {
        div.classList.add("grid-cell");
        div.dataset.index = cellIndex;
      }

      grid.appendChild(div);
      cellIndex++;
    });
  });
}

 //  Build Word Wheel
  function buildWordWheel(letters) {
  const wordWheel = document.querySelector(".wordwheel");
  wordWheel.innerHTML = "";
  
  const svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svg.setAttribute("id", "lineSvg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  wordWheel.appendChild(svg);

  letters.forEach(l => {
    const div = document.createElement("div");
    div.className = "letter";
    div.innerText = l;
    wordWheel.appendChild(div);
  });

  positionLettersInCircle();   // 🔥 REQUIRED
  attachLetterEvents();
}


  function positionLettersInCircle() {
  const letters = document.querySelectorAll(".letter");
  const radius = 80;
  const center = 110; // half of wheel size

  letters.forEach((letter, index) => {
    const angle = (2 * Math.PI / letters.length) * index;
    const x = center + radius * Math.cos(angle) - 22;
    const y = center + radius * Math.sin(angle) - 22;

    letter.style.left = `${x}px`;
    letter.style.top = `${y}px`;
  });
}

function getLetterCenter(letter) {
  if (!letter) return null;

  const rect = letter.getBoundingClientRect();
  const parentRect = document
    .querySelector(".wordwheel")
    .getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2 - parentRect.left,
    y: rect.top + rect.height / 2 - parentRect.top
  };
}

function drawLine(from, to) {
  const svg = document.getElementById("lineSvg");
  if (!svg || !from || !to) return;

  const line = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );

  line.setAttribute("x1", from.x);
  line.setAttribute("y1", from.y);
  line.setAttribute("x2", to.x);
  line.setAttribute("y2", to.y);
  line.setAttribute("stroke", "#4caf50");
  line.setAttribute("stroke-width", "4");
  line.setAttribute("stroke-linecap", "round");

  svg.appendChild(line);
}


function startDrag(e) {
  e.preventDefault();
  e.target.setPointerCapture(e.pointerId)
  isDragging = true;
  selectedLetters = [];
  currentWord = "";

  const svg = document.getElementById("lineSvg");
  if (svg) svg.innerHTML = "";

  const letter = e.target;
  selectedLetters.push(letter);
  currentWord += letter.innerText;

  letter.classList.add("active");
  displayWord.innerText= currentWord;
}

function handlePointerMove(e) {
  if (!isDragging) return;

  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || !el.classList.contains("letter")) return;

  dragOver({ target: el });
}


function dragOver(e) {
  if (!isDragging) return;
  if (!e.target.classList.contains("letter")) return; 
  
  const letter = e.target;

  if (!selectedLetters.includes(letter)) {
    const lastLetter = selectedLetters[selectedLetters.length - 1];
    if (!lastLetter) return;

    const from = getLetterCenter(lastLetter);
    const to = getLetterCenter(letter);

    drawLine(from, to);

    selectedLetters.push(letter);
    currentWord += letter.innerText;
    letter.classList.add("active");
    displayWord.innerText = currentWord; 
  }
}

function clearSelection() {
  selectedLetters.forEach(l => l.classList.remove("active"));
  selectedLetters = [];
  currentWord = "";

  const svg = document.getElementById("lineSvg");
  if (svg) svg.innerHTML = ""; 

}

document.addEventListener("pointerup", () => {
  if (!isDragging) return;

  isDragging = false;

  // normalize word (IMPORTANT)
  insertWordIntoGrid(currentWord.toUpperCase());

  displayWord.innerText = "";

  console.log("currentWord:",currentWord)
  clearSelection();
});


function attachLetterEvents() {
  const letters = document.querySelectorAll(".letter");

  letters.forEach(letter => {
    letter.addEventListener("pointerdown", startDrag);
    letter.addEventListener("pointermove", handlePointerMove);
  });
}

  
function insertWordIntoGrid(word) {
  const levelWords = levels[currentLevel].wordPositions;
  
  if (!levelWords[word] || foundWords.includes(word)) return;

  levelWords[word].forEach((pos, i) => {
    const cell = document.querySelector(`.grid-cell[data-index='${pos}']`);
    cell.textContent = word[i];
    cell.classList.add("filled");
  });

  foundWords.push(word);
  console.log("foundwords:",foundWords)
  checkLevelComplete();
}

// function addFoundWordToUI(word) {
//   const span = document.createElement("span");
//   span.textContent = word;
//   foundWordsContainer.appendChild(span);
// }

nextLevelBtn.addEventListener("click", () => {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    // nextLevelBtn.classList.remove("show");
    loadLevel();
  } else {
    alert("🎉 Game Completed!");
  }
});


        function checkLevelComplete() {
          const totalWords = Object.keys(
            levels[currentLevel].wordPositions
          ).length;

          if (foundWords.length === totalWords) {
            nextLevelBtn.classList.add("show");
          }
          console.log("Found:", foundWords.length, "Total:", totalWords);

        }
        

      