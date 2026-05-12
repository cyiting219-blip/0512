let video;
let facemesh;
let predictions = [];
let isDetecting = false; // 紀錄是否已經開始收到辨識結果
let earringImg; // 宣告耳環圖片變數

function preload() {
  // 載入耳環圖片檔案
  earringImg = loadImage('pic/acc/acc1_ring.png');
  // 新版 ml5.js (v1.0+) 的寫法：模型名稱改為 faceMesh (大寫 M) 並建議在 preload() 載入
  facemesh = ml5.faceMesh({ maxFaces: 1 });
}

function setup() {
  // 第一步：產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 取得攝影機影像並隱藏原本預設的 HTML 影片元素
  // 若發生 NotFoundError，表示找不到攝影機或是瀏覽器權限/連線安全 (https 或 localhost) 的問題
  video = createCapture(VIDEO, () => {
    // 當攝影機準備好後，開始進行臉部辨識
    facemesh.detectStart(video, results => {
      isDetecting = true; // 成功收到回呼，表示模型已經開始運作
      predictions = results;
    });
  });
  video.hide();
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');
  
  push();
  translate(width / 2, height / 2); // 將座標原點移到畫布中央
  scale(-1, 1); // X 軸縮放 -1，達成左右顛倒效果
  imageMode(CENTER); // 設定圖片繪製模式為置中
  image(video, 0, 0, width * 0.5, height * 0.5); // 畫出影像，寬高為畫布的 50%

  // 繪製耳環
  if (predictions.length > 0 && video.width > 0) {
    // 新版 ml5.js 資料結構中，臉部特徵點陣列名稱變更為 keypoints
    let keypoints = predictions[0].keypoints;
    
    // MediaPipe Facemesh 中，177 與 401 大約是左右耳垂的位置
    let rightEarlobe = keypoints[177];
    let leftEarlobe = keypoints[401];
    
    drawEarring(rightEarlobe);
    drawEarring(leftEarlobe);
  }
  pop();

  // 在視窗上方加上文字 (放在 pop() 之後避免文字被左右鏡像翻轉)
  fill(0); // 設定文字顏色為黑色
  textSize(32); // 設定文字大小
  textAlign(CENTER, TOP); // 對齊畫布中央上方
  text("414730373", width / 2, 20); // 畫出文字，Y 座標為 20

  // 在畫面下方顯示載入進度條或提示文字
  if (!isDetecting) {
    // 如果還沒收到辨識結果，顯示等待進度條
    fill(0);
    textSize(20);
    textAlign(CENTER, BOTTOM);
    text("正在初始化攝影機與模型...", width / 2, height - 50);
    
    // 繪製動態進度條 (來回跑動的效果)
    let barWidth = width * 0.5;
    let barHeight = 15;
    let barX = width / 2 - barWidth / 2;
    let barY = height - 40;
    
    stroke(50);
    noFill();
    rect(barX, barY, barWidth, barHeight, 10); // 畫進度條外框
    
    noStroke();
    fill(100, 200, 255);
    // 利用 sin 函數加上 frameCount 製造進度條動畫
    let progress = map(sin(frameCount * 0.05), -1, 1, 0, 1);
    rect(barX, barY, barWidth * progress, barHeight, 10); // 畫會動的進度條
  } else if (predictions.length === 0) {
    // 模型已啟動，但沒有偵測到臉部
    fill(255, 0, 0); // 紅色警告文字
    textSize(20);
    textAlign(CENTER, BOTTOM);
    text("未偵測到臉部，請確保您的臉部在鏡頭範圍內", width / 2, height - 30);
  }
}

// 繪製耳環的輔助函數
function drawEarring(earlobePoint) {
  // 將影像上的座標映射到縮放後的影片尺寸範圍內
  // 新版 ml5.js 中，座標變成物件的 .x 與 .y 屬性
  let x = map(earlobePoint.x, 0, video.width, -width * 0.25, width * 0.25);
  let y = map(earlobePoint.y, 0, video.height, -height * 0.25, height * 0.25);
  
  // 使用圖片取代原本的黃色圓圈，並將 Y 軸稍微往下加一點偏移，產生掛在耳垂上的效果
  let imgSize = 40; // 可自行調整耳環的顯示大小
  image(earringImg, x, y + 15, imgSize, imgSize);
}
