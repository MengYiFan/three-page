// 角度与滑滑梯安全性交互脚本

const slideAngleState = {
  currentDifficulty: null,
  currentAngle: null
};

const angleElements = {};

let slideCanvasContext = null;
let slideAnimationFrameId = null;
let slideAnimationProgress = 0;

function initSlideAnglePage() {
  angleElements.difficultyButtons = document.querySelectorAll(
    ".difficulty-btn"
  );
  angleElements.difficultySelect =
    document.getElementById("difficulty-select");
  angleElements.generateButton = document.getElementById("generate-angle");
  angleElements.slideCanvas = document.getElementById("slide-canvas");
  angleElements.currentAngleValue =
    document.getElementById("current-angle-value");
  angleElements.currentAngleLevel =
    document.getElementById("current-angle-level");
  angleElements.angleInput = document.getElementById("angle-input");
  angleElements.submitAngle = document.getElementById("submit-angle");
  angleElements.angleFeedback = document.getElementById("angle-feedback");
  angleElements.angleSafetyDetail = document.getElementById(
    "angle-safety-detail"
  );

  if (angleElements.slideCanvas) {
    slideCanvasContext = angleElements.slideCanvas.getContext("2d");
  }

  setupSlideAngleListeners();
  if (angleElements.generateButton) {
    angleElements.generateButton.disabled = true;
  }

  // 初始绘制一个默认角度的滑梯和小人
  drawSlideScene(25, 0);
}

function setupSlideAngleListeners() {
  if (angleElements.difficultyButtons) {
    angleElements.difficultyButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const level = btn.dataset.level;
        selectAngleDifficulty(level);
      });
    });
  }

  if (angleElements.difficultySelect) {
    angleElements.difficultySelect.addEventListener("change", (e) => {
      const value = e.target.value;
      if (!value) {
        slideAngleState.currentDifficulty = null;
        if (angleElements.generateButton) {
          angleElements.generateButton.disabled = true;
        }
        resetAngleDemo();
        return;
      }
      selectAngleDifficulty(value);
    });
  }

  if (angleElements.generateButton) {
    angleElements.generateButton.addEventListener("click", generateAngleDemo);
  }

  if (angleElements.submitAngle) {
    angleElements.submitAngle.addEventListener("click", handleAngleSubmit);
  }

  if (angleElements.angleInput) {
    angleElements.angleInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleAngleSubmit();
      }
    });
  }
}

function selectAngleDifficulty(level) {
  slideAngleState.currentDifficulty = level;

  if (angleElements.difficultyButtons) {
    angleElements.difficultyButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.level === level);
    });
  }

  if (angleElements.generateButton) {
    angleElements.generateButton.disabled = false;
  }

  resetAngleDemo();
}

function resetAngleDemo() {
  slideAngleState.currentAngle = null;

  if (angleElements.currentAngleValue) {
    angleElements.currentAngleValue.textContent = "--";
  }
  if (angleElements.currentAngleLevel) {
    angleElements.currentAngleLevel.textContent = "未生成";
    angleElements.currentAngleLevel.className = "safety-badge";
  }
  if (angleElements.angleFeedback) {
    angleElements.angleFeedback.textContent = "";
    angleElements.angleFeedback.className = "feedback";
  }
  if (angleElements.angleSafetyDetail) {
    angleElements.angleSafetyDetail.innerHTML = "";
  }
  if (angleElements.angleInput) {
    angleElements.angleInput.value = "";
  }

  // 恢复默认展示角度但不显示具体数值
  drawSlideScene(25, 0);
}

function generateAngleDemo() {
  if (!slideAngleState.currentDifficulty) return;

  const angle = createRandomAngle(slideAngleState.currentDifficulty);
  slideAngleState.currentAngle = angle;

  updateSlideVisual(angle);

  const safety = classifyAngle(angle);
  updateSafetyBadge(safety, angleElements.currentAngleLevel);
  triggerSlideAnimation();
}

function createRandomAngle(level) {
  switch (level) {
    case "easy":
      return randomInRange(18, 26); // 安全、偏缓
    case "medium":
      return randomInRange(25, 35); // 常见安全范围
    case "hard":
      return randomInRange(35, 50); // 较陡或偏危险
    default:
      return randomInRange(20, 30);
  }
}

function randomInRange(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function updateSlideVisual(angle) {
  drawSlideScene(angle, 0);
  if (angleElements.currentAngleValue) {
    angleElements.currentAngleValue.textContent = String(angle);
  }
}

const SAFETY_LEVELS = [
  {
    id: "too-soft",
    label: "过缓",
    className: "safety-soft",
    condition: (a) => a > 0 && a < 15,
    summary: "滑梯角度太小，孩子可能很难滑动或滑得很慢。",
    tip: "可以适当增加一点角度，让滑梯既能滑得动，又不过于陡峭。"
  },
  {
    id: "safe",
    label: "安全适中",
    className: "safety-safe",
    condition: (a) => a >= 15 && a <= 35,
    summary: "这是常见的儿童滑梯安全设计范围，滑行速度适中。",
    tip: "同时还需要配合扶手、防护栏等设施，才能更加安全。"
  },
  {
    id: "border",
    label: "偏陡",
    className: "safety-border",
    condition: (a) => a > 35 && a <= 40,
    summary: "滑梯已经比较陡，滑行速度明显变快，需要更多保护措施。",
    tip: "应特别注意滑梯的高度、护栏和缓冲区设计，适合更大年龄的儿童。"
  },
  {
    id: "danger",
    label: "过陡，存在安全风险",
    className: "safety-danger",
    condition: (a) => a > 40,
    summary: "滑梯过于陡峭，孩子滑下来的速度很快，容易发生危险。",
    tip: "应降低滑梯高度或减小角度，避免在校园和普通儿童游乐场中使用。"
  }
];

function classifyAngle(angle) {
  if (angle <= 0 || angle > 80 || Number.isNaN(angle)) {
    return {
      id: "invalid",
      label: "不合理角度",
      className: "safety-invalid",
      summary: "请输入 5° 到 60° 范围内的角度，便于讨论实际滑梯情况。",
      tip: "在现实生活中，滑梯不会完全水平（0°），也不会接近竖直（90°）。"
    };
  }

  for (const level of SAFETY_LEVELS) {
    if (level.condition(angle)) {
      return level;
    }
  }

  // 5°~15° 左右的过缓情况已在 too-soft 中覆盖，大于 40° 在 danger 中覆盖。
  return SAFETY_LEVELS[1]; // 默认视为安全适中
}

function updateSafetyBadge(safety, badgeElement) {
  if (!badgeElement || !safety) return;
  badgeElement.textContent = safety.label;
  badgeElement.className = `safety-badge ${safety.className}`;
}

function handleAngleSubmit() {
  if (!angleElements.angleInput) return;

  const value = parseFloat(angleElements.angleInput.value);
  const safety = classifyAngle(value);

  if (!angleElements.angleFeedback || !angleElements.angleSafetyDetail) {
    return;
  }

  if (safety.id === "invalid") {
    angleElements.angleFeedback.textContent = safety.label + "：请重新输入角度。";
    angleElements.angleFeedback.className = "feedback incorrect";
  } else {
    angleElements.angleFeedback.textContent = `你输入的角度为 ${value}°，系统判断为：${safety.label}`;
    angleElements.angleFeedback.className =
      safety.id === "danger" ? "feedback incorrect" : "feedback correct";

    slideAngleState.currentAngle = value;
    updateSlideVisual(value);
    triggerSlideAnimation();
  }

  angleElements.angleSafetyDetail.innerHTML = `
    <div class="safety-detail-inner">
      <p class="safety-summary">${safety.summary}</p>
      <p class="safety-tip">${safety.tip}</p>
    </div>
  `;

  updateSafetyBadge(safety, angleElements.currentAngleLevel);
}

function clearSlideCanvas() {
  if (!slideCanvasContext || !angleElements.slideCanvas) return;
  slideCanvasContext.clearRect(
    0,
    0,
    angleElements.slideCanvas.width,
    angleElements.slideCanvas.height
  );
}

// 使用 canvas 绘制滑梯、地面和小人
// childProgress 取值 0~1，表示小人在滑梯上的位置（0 在顶端，1 在底端）
function drawSlideScene(angle, childProgress) {
  if (!slideCanvasContext || !angleElements.slideCanvas) return;

  const ctx = slideCanvasContext;
  const canvas = angleElements.slideCanvas;
  const width = canvas.width;
  const height = canvas.height;

  clearSlideCanvas();

  // 背景天空和草地
  const groundHeight = 32;
  const skyHeight = height - groundHeight;

  const skyGradient = ctx.createLinearGradient(0, 0, 0, skyHeight);
  skyGradient.addColorStop(0, "#bbdefb");
  skyGradient.addColorStop(1, "#e3f2fd");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, skyHeight);

  const groundGradient = ctx.createLinearGradient(
    0,
    skyHeight,
    0,
    height
  );
  groundGradient.addColorStop(0, "#c8e6c9");
  groundGradient.addColorStop(1, "#a5d6a7");
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, skyHeight, width, height - skyHeight);

  // 地面阴影
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(0, height - groundHeight, width, groundHeight);

  // 滑梯参数（尽量像真实游乐场滑梯）
  const baseX = 190; // 滑梯落地位置（靠右）
  const baseY = height - groundHeight - 2;
  const slideLength = 130;
  const rad = (Math.max(5, Math.min(60, angle)) * Math.PI) / 180;

  // 滑梯顶部在左侧，高于地面
  const topX = baseX - slideLength * Math.cos(rad);
  const topY = baseY - slideLength * Math.sin(rad);

  // 滑梯方向与法线
  const dx = baseX - topX;
  const dy = baseY - topY;
  const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  // 平台和支撑柱（小塔）
  const platformWidth = 60;
  const platformHeight = 10;
  const platformX = topX - platformWidth * 0.4;
  const platformY = topY - platformHeight;
  ctx.fillStyle = "#546e7a";
  ctx.fillRect(platformX, platformY, platformWidth, platformHeight);

  // 塔身
  ctx.fillStyle = "#8d6e63";
  const towerWidth = 28;
  const towerHeight = 70;
  ctx.fillRect(
    platformX + platformWidth * 0.15,
    platformY,
    towerWidth,
    towerHeight
  );

  // 梯子（竖直加横档）
  const ladderX = platformX + platformWidth * 0.15 + towerWidth + 6;
  const ladderTopY = platformY + 4;
  const ladderBottomY = ladderTopY + towerHeight - 8;
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(ladderX, ladderTopY, 6, ladderBottomY - ladderTopY);

  ctx.strokeStyle = "#bcaaa4";
  ctx.lineWidth = 2;
  const rungCount = 4;
  for (let i = 0; i <= rungCount; i++) {
    const y =
      ladderTopY + ((ladderBottomY - ladderTopY) * i) / rungCount;
    ctx.beginPath();
    ctx.moveTo(ladderX - 8, y);
    ctx.lineTo(ladderX + 12, y);
    ctx.stroke();
  }

  // 滑梯板（有厚度和护栏）
  const boardHalfThickness = 6;
  const topLeftX = topX + nx * boardHalfThickness;
  const topLeftY = topY + ny * boardHalfThickness;
  const topRightX = topX - nx * boardHalfThickness;
  const topRightY = topY - ny * boardHalfThickness;
  const bottomLeftX = baseX + nx * boardHalfThickness;
  const bottomLeftY = baseY + ny * boardHalfThickness;
  const bottomRightX = baseX - nx * boardHalfThickness;
  const bottomRightY = baseY - ny * boardHalfThickness;

  const slideGradient = ctx.createLinearGradient(
    topLeftX,
    topLeftY,
    bottomRightX,
    bottomRightY
  );
  slideGradient.addColorStop(0, "#ffcc80");
  slideGradient.addColorStop(1, "#ffb74d");
  ctx.fillStyle = slideGradient;
  ctx.beginPath();
  ctx.moveTo(topLeftX, topLeftY);
  ctx.lineTo(bottomLeftX, bottomLeftY);
  ctx.lineTo(bottomRightX, bottomRightY);
  ctx.lineTo(topRightX, topRightY);
  ctx.closePath();
  ctx.fill();

  // 两侧护栏线
  ctx.strokeStyle = "#ffb74d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(topLeftX, topLeftY - 4);
  ctx.lineTo(bottomLeftX, bottomLeftY - 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(topRightX, topRightY - 4);
  ctx.lineTo(bottomRightX, bottomRightY - 2);
  ctx.stroke();

  // 角度指示圆圈和文字 θ
  const angleCenterX = baseX - 8;
  const angleCenterY = baseY - 14;
  ctx.beginPath();
  ctx.arc(angleCenterX, angleCenterY, 12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(33,150,243,0.8)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("θ", angleCenterX, angleCenterY);

  // 小人：沿滑梯线段移动
  const t = Math.max(0, Math.min(1, childProgress));
  const personX = topX + (baseX - topX) * t;
  const personY = topY + (baseY - topY) * t;

  // 头
  ctx.beginPath();
  ctx.arc(personX, personY - 10, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcc80";
  ctx.fill();
  ctx.strokeStyle = "#f57c00";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 身体
  ctx.strokeStyle = "#ff7043";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(personX, personY - 4);
  ctx.lineTo(personX, personY + 8);
  ctx.stroke();

  // 手臂
  const armOffset = 5;
  ctx.beginPath();
  ctx.moveTo(personX, personY);
  ctx.lineTo(personX - armOffset, personY + 4);
  ctx.moveTo(personX, personY);
  ctx.lineTo(personX + armOffset, personY + 4);
  ctx.stroke();

  // 腿
  ctx.beginPath();
  ctx.moveTo(personX, personY + 8);
  ctx.lineTo(personX - armOffset, personY + 16);
  ctx.moveTo(personX, personY + 8);
  ctx.lineTo(personX + armOffset, personY + 16);
  ctx.stroke();
}

function startSlideAnimation(angle) {
  if (!slideCanvasContext) return;

  if (slideAnimationFrameId !== null) {
    cancelAnimationFrame(slideAnimationFrameId);
    slideAnimationFrameId = null;
  }

  const duration = 900; // 毫秒
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(1, elapsed / duration);

    // 使用缓动函数让动画更自然
    const easeOut = 1 - Math.pow(1 - progress, 3);
    slideAnimationProgress = easeOut;

    drawSlideScene(angle, slideAnimationProgress);

    if (progress < 1) {
      slideAnimationFrameId = requestAnimationFrame(step);
    } else {
      slideAnimationFrameId = null;
    }
  }

  slideAnimationProgress = 0;
  slideAnimationFrameId = requestAnimationFrame(step);
}

function triggerSlideAnimation() {
  const angle =
    slideAngleState.currentAngle != null ? slideAngleState.currentAngle : 25;
  startSlideAnimation(angle);
}

document.addEventListener("DOMContentLoaded", initSlideAnglePage);
