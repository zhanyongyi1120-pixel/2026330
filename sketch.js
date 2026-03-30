let topPoints = [];
let bottomPoints = [];
let trees = [];
let isGameOver = false;
let isStarted = false;
let isGameWin = false;
let currentLevel = 1;
const maxLevels = 3;
let pointCount = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGame();
}

function initGame() {
  topPoints = [];
  bottomPoints = [];
  trees = [];
  // 初始化五個點的位置
  let spacing = width / (pointCount - 1);
  for (let i = 0; i < pointCount; i++) {
    let x = i * spacing;
    // 隨機產生上方點的 Y 座標
    let yTop = random(height * 0.3, height * 0.6);
    // 下方點與上方點距離 30 到 60
    let gap = random(30, 60);
    
    topPoints.push({x: x, y: yTop});
    bottomPoints.push({x: x, y: yTop + gap});
  }

  // 在背景產生幾棵樹，分佈在路徑上方與下方
  for (let i = 0; i < 15; i++) {
    let tx = random(width);
    // 避開中間路徑區域 (0.3 ~ 0.7 height)
    let ty = random() > 0.5 ? random(0, height * 0.2) : random(height * 0.75, height);
    let ts = random(0.8, 1.5); // 隨機大小
    trees.push({ x: tx, y: ty, s: ts });
  }
}

function draw() {
  background('#90a955'); // 森林背景色

  if (isGameWin) {
    displayGameWin();
    return;
  }

  if (isGameOver) {
    displayGameOver();
    return;
  }

  // 繪製背景樹木
  for (let t of trees) {
    drawTree(t.x, t.y, t.s);
  }

  // 繪製路徑填滿區域
  fill('#669bbc');
  noStroke();
  beginShape();
  // 繪製上方曲線
  curveVertex(topPoints[0].x, topPoints[0].y); // 起點控制點
  for (let p of topPoints) curveVertex(p.x, p.y);
  curveVertex(topPoints[topPoints.length - 1].x, topPoints[topPoints.length - 1].y); // 終點控制點

  // 繪製下方曲線 (逆向回去以封閉形狀)
  curveVertex(bottomPoints[bottomPoints.length - 1].x, bottomPoints[bottomPoints.length - 1].y); // 控制點
  for (let i = bottomPoints.length - 1; i >= 0; i--) {
    curveVertex(bottomPoints[i].x, bottomPoints[i].y);
  }
  curveVertex(bottomPoints[0].x, bottomPoints[0].y); // 控制點
  endShape(CLOSE);

  let playerX, playerY;

  if (!isStarted) {
    // 遊戲未開始：圓形停在起點中間
    playerX = topPoints[0].x + 10;
    playerY = (topPoints[0].y + bottomPoints[0].y) / 2;
    
    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    textSize(20);
    text("點擊滑鼠開始挑戰", width / 2, height - 50);
  } else {
    // 遊戲進行中：圓形跟隨滑鼠
    playerX = mouseX;
    playerY = mouseY;
    checkCollision(playerX, playerY);

    // 檢查是否抵達終點 (畫面右側)
    if (playerX >= width - 10) {
      if (currentLevel < maxLevels) {
        currentLevel++;
        isStarted = false; // 回到起點準備下一關
        initGame();
      } else {
        isGameWin = true;
      }
    }
  }

  // 繪製玩家控制的小圓形
  fill(255, 200, 0);
  noStroke();
  ellipse(playerX, playerY, 15, 15);

  // 顯示目前關卡
  textAlign(LEFT, TOP);
  fill(255);
  textSize(18);
  text(`關卡: ${currentLevel} / ${maxLevels}`, 20, 20);
}

function drawTree(x, y, s) {
  push();
  translate(x, y);
  // 樹幹
  fill('#6c584c');
  noStroke();
  rectMode(CENTER);
  rect(0, 0, 10 * s, 20 * s);
  // 樹葉 (兩層三角形組成)
  fill('#4f772d');
  triangle(-15 * s, -5 * s, 0, -35 * s, 15 * s, -5 * s);
  triangle(-12 * s, -15 * s, 0, -45 * s, 12 * s, -15 * s);
  pop();
}

function checkCollision(px, py) {
  let spacing = width / (pointCount - 1);
  let i = floor(px / spacing); // 判斷位於哪一個線段區間

  if (i >= 0 && i < topPoints.length - 1) {
    // 取得當前區段與其前後點（用於 Catmull-Rom 曲線計算）
    let p1 = topPoints[i], p2 = topPoints[i+1];
    let p0 = i > 0 ? topPoints[i-1] : p1;
    let p3 = i < topPoints.length - 2 ? topPoints[i+2] : p2;
    
    let b1 = bottomPoints[i], b2 = bottomPoints[i+1];
    let b0 = i > 0 ? bottomPoints[i-1] : b1;
    let b3 = i < bottomPoints.length - 2 ? bottomPoints[i+2] : b2;

    let t = (px - p1.x) / (p2.x - p1.x);
    
    // 使用 curvePoint 計算精確的曲線 Y 座標
    let currentTopY = curvePoint(p0.y, p1.y, p2.y, p3.y, t);
    let currentBottomY = curvePoint(b0.y, b1.y, b2.y, b3.y, t);

    if (py < currentTopY || py > currentBottomY) {
      isGameOver = true;
    }
  }

  // 若超出左右邊界也算失敗
  if (px < 0 || px > width) isGameOver = true;
}

function displayGameOver() {
  textAlign(CENTER, CENTER);
  fill(255, 0, 0);
  textSize(28);
  text("⚡️你被電到了！⚡️\n再按一次滑鼠開始遊戲！👾", width / 2, height / 2);
}

function displayGameWin() {
  textAlign(CENTER, CENTER);
  fill(255, 215, 0); // 金色
  textSize(40);
  text("🎠恭喜你成功過關🎠", width / 2, height / 2);
  textSize(16);
  text("點擊滑鼠重新挑戰全部關卡", width / 2, height / 2 + 80);
}

function mousePressed() {
  if (isGameOver || isGameWin) {
    // 失敗或全破後點擊：從第一關重新開始
    isGameOver = false;
    isStarted = false;
    isGameWin = false;
    currentLevel = 1;
    initGame();
  } else if (!isStarted) {
    // 未開始點擊：開始遊戲
    isStarted = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGame();
}
