let video;
let facemesh;
let predictions = [];

function setup() {
  // 第一步：產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 取得攝影機影像並隱藏原本預設的 HTML 影片元素
  video = createCapture(VIDEO);
  video.hide();

  // 初始化 ml5.js 的 Facemesh 模型
  facemesh = ml5.facemesh(video, () => {
    console.log("Facemesh 模型載入完成！");
  });

  // 監聽並儲存辨識結果
  facemesh.on("predict", results => {
    predictions = results;
  });
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
    let keypoints = predictions[0].scaledMesh;
    
    // MediaPipe Facemesh 中，177 與 401 大約是左右耳垂的位置
    let rightEarlobe = keypoints[177];
    let leftEarlobe = keypoints[401];
    
    drawEarring(rightEarlobe);
    drawEarring(leftEarlobe);
  }
  pop();
}

// 繪製耳環的輔助函數
function drawEarring(earlobePoint) {
  // 將影像上的座標映射到縮放後的影片尺寸範圍內
  let x = map(earlobePoint[0], 0, video.width, -width * 0.25, width * 0.25);
  let y = map(earlobePoint[1], 0, video.height, -height * 0.25, height * 0.25);
  
  fill(255, 255, 0); // 黃色
  noStroke();
  // 從耳垂位置往下畫出三個圓圈
  for (let i = 1; i <= 3; i++) {
    circle(x, y + (i * 15), 10);
  }
}
