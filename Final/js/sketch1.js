let sound, fft;
let pianoKeys = [];
let numMaxBars = 5;  // 顯示音量最大前 5 頻率
let noteDuration = 1000;  // 顯示音符的持續時間
let fallingNotes = [];  // 儲存移動的音符

function preload() {
  sound = loadSound('TALES OF DOMINICA.mp3');  // 替換為你的音訊檔案
}

function setup() {
   // 創建畫布並指定父容器
   let canvas = createCanvas(windowWidth, windowHeight);
   canvas.parent('p5-container');
   
   sound.loop();
   fft = new p5.FFT(0.8, 512);
   colorMode(HSB, 360, 100, 100, 100);
   noStroke();
   
   pianoKeys = getPianoKeyFrequencies();
}

function draw() {
  background(0);  // 清除畫面
  
  let spectrum = fft.analyze();  // 取得頻譜數據
  
  // 濾波過低頻和過高頻的噪音
  spectrum = filterNoise(spectrum);

  // 取得最大音量的五個頻率
  let topBars = getTopFrequencyBars(spectrum);

  // 根據頻率強度映射音符
  let currentNotes = getCurrentNotes(topBars);

  // 顯示當前彈奏的音符圖形並讓它們向右移動
  updateAndDisplayMovingNotes(currentNotes);
}

// 計算鋼琴鍵對應的頻率
function getPianoKeyFrequencies() {
  const A0 = 27.5;  // 鋼琴最底音的頻率
  let keys = [];
  
  for (let i = 0; i < 88; i++) {
    let freq = A0 * pow(2, i / 12);  // 計算每個音符的頻率
    keys.push({freq: freq, note: getNoteName(i)});
  }
  
  return keys;
}

// 根據鋼琴鍵的索引返回音符名稱
function getNoteName(index) {
  const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  let octave = Math.floor(index / 12);
  let note = notes[index % 12];
  return note + octave;
}

// 取得音量最高的五個頻率
function getTopFrequencyBars(spectrum) {
  let bars = [];
  
  for (let i = 0; i < spectrum.length; i++) {
    let barHeight = spectrum[i];
    let x = map(i, 0, spectrum.length, 0, width);
    bars.push({x: x, height: barHeight, freq: map(i, 0, spectrum.length, 0, 22050)});
  }
  
  // 根據高度排序並選擇最大值的五個頻率
  bars.sort((a, b) => b.height - a.height);
  
  // 只取前五個
  return bars.slice(0, numMaxBars);
}

// 根據頻率範圍獲取當前音符
function getCurrentNotes(topBars) {
  let notes = [];
  
  for (let i = 0; i < topBars.length; i++) {
    let bar = topBars[i];
    let note = getClosestPianoKey(bar.freq);
    notes.push({note: note.note, frequency: bar.freq, intensity: bar.height});
  }
  
  return notes;
}

// 根據頻率返回最近的鋼琴音符
function getClosestPianoKey(freq) {
  let closestNote = pianoKeys[0];
  let minDiff = Math.abs(freq - pianoKeys[0].freq);
  
  for (let i = 1; i < pianoKeys.length; i++) {
    let diff = Math.abs(freq - pianoKeys[i].freq);
    if (diff < minDiff) {
      closestNote = pianoKeys[i];
      minDiff = diff;
    }
  }
  
  return closestNote;
}

// 濾波器，過濾掉低於 100 Hz 和高於 4000 Hz 的頻率
function filterNoise(spectrum) {
  return spectrum.map((val, index) => {
    let freq = map(index, 0, spectrum.length, 0, 22050);
    if (freq < 100 || freq > 4000) {
      return 0;  // 低於 100 Hz 或高於 4000 Hz 的頻率設為 0
    }
    return val;
  });
}

// 更新並繪製向右移動的音符
function updateAndDisplayMovingNotes(notes) {
  // 添加新音符到移動隊列
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let xPos = -10;  // 初始位置在畫布左邊外面
    let noteSize = 10;

    // 計算音符的 y 位置，頻率越高 y 位置越小
    let yPos = map(note.frequency, 20, 2000, height, 0);
    let ySpeed = 0;
    let gravity = 0.05;
    
    fallingNotes.push({
      x: xPos,
      y: yPos,
      size: noteSize,
      color: getColorFromIntensity(note.intensity),
      speed: map(note.intensity, 0, 255, 2, 10),
      ySpeed: ySpeed,
      gravity: gravity,
      lifespan: map(note.intensity, 0, 255, 200, 500)
    });
  }

  // 更新並繪製每個移動的音符
  for (let i = fallingNotes.length - 1; i >= 0; i--) {
    let note = fallingNotes[i];

    // 更新位置
    note.x += note.speed;
    note.ySpeed += note.gravity;
    note.y += note.ySpeed;

    // 碰撞檢測：音符之間的碰撞
    for (let j = i - 1; j >= 0; j--) {
      let otherNote = fallingNotes[j];
      let dx = note.x - otherNote.x;
      let dy = note.y - otherNote.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // 如果兩個音符距離小於音符直徑和，則發生碰撞
      if (distance < note.size) {
        // 交換速度，模擬碰撞效果
        let tempSpeedX = note.speed;
        let tempSpeedY = note.ySpeed;
        note.speed = otherNote.speed;
        note.ySpeed = otherNote.ySpeed;
        otherNote.speed = tempSpeedX;
        otherNote.ySpeed = tempSpeedY;
        
        // 輕微分離音符，避免重疊
        let overlap = note.size - distance;
        note.x += (dx / distance) * overlap * 0.5;
        note.y += (dy / distance) * overlap * 0.5;
        otherNote.x -= (dx / distance) * overlap * 0.5;
        otherNote.y -= (dy / distance) * overlap * 0.5;
      }
    }

    // 碰到畫布底部時反彈
    if (note.y > height - note.size) {
      note.y = height - note.size;
      note.ySpeed *= -0.6;
    }

    // 如果音符超出畫布或存活時間耗盡，從隊列中移除
    if (note.x > width || note.lifespan <= 0) {
      fallingNotes.splice(i, 1);
    } else {
      fill(note.color);
      ellipse(note.x, note.y, note.size, 10);
      note.lifespan -= 2;
    }
  }
}

// 根據音量強度設置顏色（從藍色到紅色）
function getColorFromIntensity(intensity) {
  // 使用 Hue 色相值來顯示顏色：低強度為藍色，高強度為紅色
  let hue = map(intensity, 0, 255, 180, 0);  // 轉換為顏色的色相值
  return color(hue, 100, 100);  // 設定顏色飽和度和亮度
}

// 根據音符名稱獲取鋼琴鍵的索引
function getPianoKeyIndex(noteName) {
  const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  let note = noteName.slice(0, -1);  // 去掉音符名稱中的數字部分
  let octave = parseInt(noteName.slice(-1));  // 取得八度音階的數字
  
  // 尋找對應的音符索引
  for (let i = 0; i < pianoKeys.length; i++) {
    if (pianoKeys[i].note === note + octave) {
      return i;
    }
  }
  return 0;  // 返回第 0 索引（避免出錯）
}

// 添加視窗大小改變時的處理函數
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
