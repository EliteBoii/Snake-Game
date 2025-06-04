let score = 0;
const scoreDisplay = document.getElementById("score");
const appleImg = document.getElementById("appleImage");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 27; // Box size for 11x11 grid (300/11 ≈ 27.27)
const rows = 11;
const cols = 11;

let snake, apple, dx, dy, gameLoop;
let direction = "RIGHT";

const moveSound = document.getElementById("moveSound");
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.1; // Set background music to 10% volume

function startGame() {
  bgMusic.play();
  score = 0;
  scoreDisplay.textContent = "Score: " + score;
  snake = [{ x: 5, y: 5 }];       // one segment to start
  direction = "RIGHT";
  dx = 1; dy = 0;
  placeApple();
  clearInterval(gameLoop);
  gameLoop = setInterval(update, 150);
}

function restartGame() {
  clearInterval(gameLoop);
  startGame();
}

function placeApple() {
  // Random apple position
  apple = {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
    img: "apple" + Math.floor(Math.random() * 3 + 1) + ".PNG"  // randomly pick apple1.PNG, apple2.PNG, or apple3.PNG
  };
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  playSound("move");
});

function changeDirection(dir) {
  if (dir === "up" && direction !== "DOWN") direction = "UP";
  if (dir === "down" && direction !== "UP") direction = "DOWN";
  if (dir === "left" && direction !== "RIGHT") direction = "LEFT";
  if (dir === "right" && direction !== "LEFT") direction = "RIGHT";
  playSound("move");
}

function playSound(name) {
  if (name === "move") moveSound.play();
  if (name === "eat") eatSound.play();
  if (name === "over") gameOverSound.play();
}

function update() {
  // compute new head
  const head = { x: snake[0].x + (direction === "RIGHT" ? 1 : direction === "LEFT" ? -1 : 0),
                 y: snake[0].y + (direction === "DOWN" ? 1 : direction === "UP"   ? -1 : 0) };
console.log("Snake:", snake);
  
  // collision?
  if (
    head.x < 0 || head.x >= cols ||
    head.y < 0 || head.y >= rows ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    clearInterval(gameLoop);
    playSound("over");
    bgMusic.pause();
    bgMusic.currentTime = 0;
    alert("Game Over!");
    return;
  }

  snake.unshift(head);

  // eat apple?
  if (head.x === apple.x && head.y === apple.y) {
    playSound("eat");
    score += 10;
    scoreDisplay.textContent = "Score: " + score;
    placeApple();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  // clear
  ctx.fillStyle = "#BDB76B";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw grid
  ctx.strokeStyle = "#ccc";
  for (let x = 0; x <= canvas.width; x += boxSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += boxSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // draw apple
  if (!apple.imgElement) {
    apple.imgElement = new Image();
    apple.imgElement.src = apple.img;
    apple.imgElement.onload = function() {
      ctx.drawImage(apple.imgElement, apple.x * boxSize, apple.y * boxSize, boxSize, boxSize);
    };
  } else {
    ctx.drawImage(apple.imgElement, apple.x * boxSize, apple.y * boxSize, boxSize, boxSize);
  }

  // draw snake segments
  snake.forEach((seg, i) => {
    const x = seg.x * boxSize + 1;
    const y = seg.y * boxSize + 1;
    const size = boxSize - 2;

    if (i === 0) {
      // head
      ctx.fillStyle = "#060";                // darker green
      ctx.fillRect(x, y, size, size);

      // eyes
      ctx.fillStyle = "#fff";
      let ex1 = x + size/4, ey1 = y + size/4;
      let ex2 = x + (size*3)/4 - 2, ey2 = ey1;
      if (direction === "UP")    { ey1 = y + 2; ey2 = y + 2; }
      if (direction === "DOWN")  { ey1 = y + size - 6; ey2 = y + size - 6; }
      if (direction === "LEFT")  { ex1 = x + 2; ex2 = x + 2; ey1 = y + size/3; ey2 = y + (size*2)/3 - 2; }
      if (direction === "RIGHT") { ex1 = x + size - 6; ex2 = x + size - 6; ey1 = y + size/3; ey2 = y + (size*2)/3 - 2; }
      ctx.fillRect(ex1, ey1, 4, 4);
      ctx.fillRect(ex2, ey2, 4, 4);

    } else {
      // body
      ctx.fillStyle = "#0a0";
      ctx.fillRect(x, y, size, size);
    }
  });
}
