// 角度与滑滑梯安全性交互脚本（Canvas 版）

const slideAngleState = {
  currentDifficulty: null,
  currentAngle: null
};

const angleElements = {};

// Canvas 及动画相关
let slideCanvas = null;
let slideCtx = null;
let canvasWidth = 0;
let canvasHeight = 0;

let slideAnimationFrameId = null;
let lastFrameTime = 0;
let childProgress = 0; // 0~1，表示小人在滑梯上的位置
let isLoopingSlide = false;
let currentVisualAngle = 25; // 当前用于渲染滑梯的角度
const SLIDE_ANIMATION_MIN_DURATION = 900; // 毫秒，角度大时更快
const SLIDE_ANIMATION_MAX_DURATION = 2400; // 毫秒，角度小时更慢
let slideAnimationDuration = SLIDE_ANIMATION_MAX_DURATION;

function initSlideAnglePage() {
  angleElements.difficultyButtons = document.querySelectorAll(
    ".difficulty-btn"
  );
  angleElements.difficultySelect =
    document.getElementById("difficulty-select");
  angleElements.generateButton = document.getElementById("generate-angle");
  angleElements.slideContainer = document.getElementById("slide-canvas");
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

  slideCanvas = document.getElementById("slide-canvas");
  if (slideCanvas && slideCanvas.getContext) {
    slideCtx = slideCanvas.getContext("2d");
    setupSlideCanvasSize();
    window.addEventListener("resize", () => {
      setupSlideCanvasSize();
      // 尺寸变化后重新绘制当前状态
      drawSlideScene(currentVisualAngle, isLoopingSlide ? childProgress : 0);
    });
  }

  setupSlideAngleListeners();
  if (angleElements.generateButton) {
    angleElements.generateButton.disabled = true;
  }

  // 初始静态展示一个适中角度的滑梯
  drawSlideScene(25, 0);
}

function setupSlideCanvasSize() {
  if (!slideCanvas || !slideCtx) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = slideCanvas.getBoundingClientRect();
  canvasWidth = rect.width || 320;
  canvasHeight = rect.height || 240;

  slideCanvas.width = canvasWidth * dpr;
  slideCanvas.height = canvasHeight * dpr;
  slideCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  stopSlideAnimationLoop();
  currentVisualAngle = 25;
  childProgress = 0;
  drawSlideScene(25, 0);
}

function generateAngleDemo() {
  if (!slideAngleState.currentDifficulty) return;

  const angle = createRandomAngle(slideAngleState.currentDifficulty);
  slideAngleState.currentAngle = angle;

  updateSlideVisual(angle);

  const safety = classifyAngle(angle);
  updateSafetyBadge(safety, angleElements.currentAngleLevel);

  // 点击“生成滑滑梯角度演示”时，自动开始并循环小人滑下的动画
  startSlideAnimationLoop(angle);
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
  currentVisualAngle = angle;
  drawSlideScene(angle, isLoopingSlide ? childProgress : 0);
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
      summary:
        "请输入 5° 到 60° 范围内的角度，便于讨论实际滑梯情况。",
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
    stopSlideAnimationLoop();
    drawSlideScene(currentVisualAngle, 0);
  } else {
    angleElements.angleFeedback.textContent = `你输入的角度为 ${value}°，系统判断为：${safety.label}`;
    angleElements.angleFeedback.className =
      safety.id === "danger" ? "feedback incorrect" : "feedback correct";

    slideAngleState.currentAngle = value;
    updateSlideVisual(value);
    // 输入角度后也播放并循环滑动动画
    startSlideAnimationLoop(value);
  }

  angleElements.angleSafetyDetail.innerHTML = `
    <div class="safety-detail-inner">
      <p class="safety-summary">${safety.summary}</p>
      <p class="safety-tip">${safety.tip}</p>
    </div>
  `;

  updateSafetyBadge(safety, angleElements.currentAngleLevel);
}

// ===== Canvas 动画：小人沿滑梯从上滑到底，并循环 =====

function startSlideAnimationLoop(angle) {
  if (!slideCtx) return;
  currentVisualAngle = angle;
  childProgress = 0;
  isLoopingSlide = true;
  slideAnimationDuration = calculateSlideDuration(angle);
  lastFrameTime = performance.now();
  if (!slideAnimationFrameId) {
    slideAnimationFrameId = requestAnimationFrame(handleSlideAnimationFrame);
  }
}

function stopSlideAnimationLoop() {
  isLoopingSlide = false;
}

function handleSlideAnimationFrame(timestamp) {
  if (!slideCtx) return;

  const dt = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (isLoopingSlide) {
    const delta = dt / slideAnimationDuration;
    childProgress += delta;
    if (childProgress >= 1) {
      // 到达底部后，从顶部重新开始
      childProgress -= 1;
    }
  }

  drawSlideScene(currentVisualAngle, childProgress);

  slideAnimationFrameId = requestAnimationFrame(handleSlideAnimationFrame);
}

function calculateSlideDuration(angle) {
  const clamped = Math.max(5, Math.min(60, angle || 0));
  const normalized = (clamped - 5) / 55; // 0 表示最缓，1 表示最陡
  return (
    SLIDE_ANIMATION_MAX_DURATION -
    normalized * (SLIDE_ANIMATION_MAX_DURATION - SLIDE_ANIMATION_MIN_DURATION)
  );
}

// 根据当前角度和进度绘制滑梯和人物
function drawSlideScene(angle, childT) {
  if (!slideCtx) return;

  const ctx = slideCtx;
  const w = canvasWidth || slideCanvas.width;
  const h = canvasHeight || slideCanvas.height;

  ctx.clearRect(0, 0, w, h);

  // 背景：天空 + 草地
  const skyGradient = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  skyGradient.addColorStop(0, "#bbdefb");
  skyGradient.addColorStop(1, "#e3f2fd");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, w, h * 0.7);

  const groundGradient = ctx.createLinearGradient(0, h * 0.7, 0, h);
  groundGradient.addColorStop(0, "#c8e6c9");
  groundGradient.addColorStop(1, "#a5d6a7");
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);

  drawAngleIndicator(ctx, angle, w, h);

  // 计算滑梯几何信息
  const geom = computeSlideGeometry(angle, w, h);

  // 先画滑梯所在的塔、梯子、平台
  drawSlideTower(ctx, geom);

  // 再画滑梯本体
  drawSlideBody(ctx, geom);

  // 最后画小人
  drawSlideChild(ctx, geom, childT);
}

function drawAngleIndicator(ctx, angleDeg, width, height) {
  const padding = 18;
  const size = Math.min(width, height) * 0.28;
  const originX = width - padding - size;
  const originY = padding + size * 0.1;
  const axisLength = size;

  ctx.save();

  // 坐标轴：x 轴向右，y 轴向下（与 Canvas 坐标一致）
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + axisLength, originY);
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX, originY + axisLength);
  ctx.stroke();

  ctx.fillStyle = "#555";
  ctx.font = "11px Sans-Serif";
  ctx.fillText("x", originX + axisLength + 6, originY + 4);
  ctx.fillText("y", originX - 10, originY + axisLength + 14);

  // 角度线与弧
  const rad = (Math.max(0, Math.min(60, angleDeg)) * Math.PI) / 180;
  const radius = size * 0.85;
  const endX = originX + Math.cos(rad) * radius;
  const endY = originY + Math.sin(rad) * radius;

  ctx.strokeStyle = "#0277BD";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(2, 119, 189, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(originX, originY, radius * 0.9, 0, rad, false);
  ctx.stroke();

  ctx.fillStyle = "#01579B";
  ctx.font = "12px Sans-Serif";
  const label = `${Math.round(angleDeg)}°`;
  ctx.fillText(
    label,
    originX + Math.cos(rad / 2) * radius * 0.75 - 10,
    originY + Math.sin(rad / 2) * radius * 0.75 - 6
  );

  ctx.fillStyle = "#777";
  ctx.font = "11px Sans-Serif";
  ctx.textAlign = "center";
  ctx.fillText("角度示意", originX + axisLength * 0.25, originY - 10);
  ctx.restore();
}

// 计算滑梯的起点、终点及宽度等参数
function computeSlideGeometry(angle, w, h) {
  const width = w || canvasWidth || 320;
  const height = h || canvasHeight || 240;

  const clamped = Math.max(5, Math.min(60, angle || 0));
  const rad = (clamped * Math.PI) / 180;
  const normalized = Math.max(0, Math.min(1, (clamped - 5) / 55));

  const groundY = height * 0.68;

  // 塔在画面的左侧，滑梯向右下延伸
  const topX = width * 0.32;
  const topY = height * 0.28;

  // 底部始终落在地面附近，随着角度变化调整水平位置，角度越小越向右
  const bottomX = Math.max(
    topX + width * 0.2,
    width * (0.65 + (1 - normalized) * 0.2)
  );
  const bottomY = groundY;

  const outerWidth = Math.min(width, height) * 0.16;
  const innerWidth = outerWidth * 0.65;

  // 控制点：第一段服从角度方向，第二段在落地前略微抬起形成优雅曲线
  const cp1Distance = width * (0.22 + (1 - normalized) * 0.08);
  const cp1 = {
    x: topX + Math.cos(rad) * cp1Distance,
    y: topY + Math.sin(rad) * cp1Distance + height * 0.02
  };
  const cp2 = {
    x: bottomX - width * (0.2 - 0.08 * normalized),
    y: bottomY - height * (0.08 + 0.12 * normalized)
  };

  return {
    angleDeg: clamped,
    topX,
    topY,
    cp1,
    cp2,
    bottomX,
    bottomY,
    outerWidth,
    innerWidth,
    slideLength: Math.hypot(bottomX - topX, bottomY - topY),
    canvasWidth: width,
    canvasHeight: height
  };
}

function drawSlideTower(ctx, geom) {
  const { topX, topY, slideLength, canvasWidth, canvasHeight } = geom;
  const w = canvasWidth || 320;
  const h = canvasHeight || 240;

  const towerWidth = Math.min(w, h) * 0.18;
  const towerHeight = h * 0.45;
  const towerX = topX - towerWidth * 0.35;
  const towerTopY = topY - towerHeight * 0.2;
  const towerBottomY = towerTopY + towerHeight;

  const postWidth = towerWidth * 0.18;
  const postColor = "#2B1B17";
  const highlightColor = "#4A342C";

  // 左右立柱
  ctx.fillStyle = postColor;
  ctx.fillRect(
    towerX - towerWidth / 2,
    towerTopY,
    postWidth,
    towerBottomY - towerTopY
  );
  ctx.fillRect(
    towerX + towerWidth / 2 - postWidth,
    towerTopY,
    postWidth,
    towerBottomY - towerTopY
  );

  // 中间支撑
  ctx.fillRect(
    towerX - postWidth / 2,
    towerTopY + towerHeight * 0.3,
    postWidth,
    towerHeight * 0.7
  );

  // 顶部平台
  ctx.fillStyle = highlightColor;
  ctx.fillRect(
    towerX - towerWidth * 0.55,
    towerTopY - towerHeight * 0.08,
    towerWidth * 1.1,
    towerHeight * 0.25
  );

  // 平台前缘（给出入口效果）
  ctx.fillStyle = "#1F120E";
  ctx.fillRect(
    towerX - towerWidth * 0.55,
    towerTopY - towerHeight * 0.08,
    towerWidth * 0.3,
    towerHeight * 0.25
  );

  // 梯子横档
  ctx.fillStyle = highlightColor;
  const rungCount = 5;
  const rungGap = (towerBottomY - (towerTopY + towerHeight * 0.2)) / (rungCount + 1);
  const rungWidth = towerWidth * 0.9;
  const rungHeight = postWidth * 0.35;
  for (let i = 1; i <= rungCount; i++) {
    const y = towerTopY + towerHeight * 0.2 + rungGap * i;
    ctx.fillRect(towerX - rungWidth / 2, y - rungHeight / 2, rungWidth, rungHeight);
  }

  // 阴影支撑
  ctx.strokeStyle = "#1A0E0B";
  ctx.lineWidth = postWidth * 0.8;
  ctx.beginPath();
  ctx.moveTo(towerX + towerWidth * 0.4, towerTopY + towerHeight * 0.2);
  ctx.lineTo(
    towerX + towerWidth * 0.25,
    towerBottomY + slideLength * 0.05
  );
  ctx.stroke();
}

function drawSlideBody(ctx, geom) {
  const {
    topX,
    topY,
    cp1,
    cp2,
    bottomX,
    bottomY,
    outerWidth,
    innerWidth
  } = geom;

  // 支撑弧
  ctx.strokeStyle = "rgba(34, 34, 34, 0.2)";
  ctx.lineWidth = outerWidth * 0.32;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(topX - outerWidth * 0.2, topY + outerWidth * 0.7);
  ctx.quadraticCurveTo(
    (topX + bottomX) / 2,
    (topY + bottomY) / 2 + outerWidth * 1.25,
    bottomX + outerWidth * 0.35,
    bottomY + outerWidth * 0.5
  );
  ctx.stroke();

  // 滑梯主体（外层）
  const gradient = ctx.createLinearGradient(topX, topY, bottomX, bottomY);
  gradient.addColorStop(0, "#8EC5FF");
  gradient.addColorStop(0.4, "#4FA5F9");
  gradient.addColorStop(1, "#1565C0");
  ctx.strokeStyle = gradient;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = outerWidth;
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, bottomX, bottomY);
  ctx.stroke();

  // 入口的圆形衔接，让滑梯看起来更柔和
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(topX, topY, outerWidth * 0.55, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();

  // 内部滑面
  const innerGradient = ctx.createLinearGradient(topX, topY, bottomX, bottomY);
  innerGradient.addColorStop(0, "#C5E6FF");
  innerGradient.addColorStop(1, "#1E88E5");
  ctx.strokeStyle = innerGradient;
  ctx.lineWidth = innerWidth;
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, bottomX, bottomY);
  ctx.stroke();

  // 边缘高光
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = outerWidth * 0.13;
  ctx.beginPath();
  ctx.moveTo(topX, topY - outerWidth * 0.2);
  ctx.bezierCurveTo(
    cp1.x,
    cp1.y - outerWidth * 0.22,
    cp2.x,
    cp2.y - outerWidth * 0.12,
    bottomX,
    bottomY - outerWidth * 0.08
  );
  ctx.stroke();
}

function drawSlideChild(ctx, geom, t) {
  const slidePoint = evaluateSlidePath(geom, Math.max(0, Math.min(1, t || 0)));
  if (!slidePoint) return;

  const { x: px, y: py, angle } = slidePoint;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle);

  // 身体
  ctx.fillStyle = "#FF7043";
  ctx.fillRect(-10, -6, 20, 16);

  // 头
  ctx.beginPath();
  ctx.arc(0, -14, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#FFCC80";
  ctx.fill();

  // 手臂
  ctx.strokeStyle = "#FFCC80";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(-14, 4);
  ctx.moveTo(8, -4);
  ctx.lineTo(14, 4);
  ctx.stroke();

  // 腿
  ctx.strokeStyle = "#5C6BC0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, 10);
  ctx.lineTo(-8, 18);
  ctx.moveTo(4, 10);
  ctx.lineTo(8, 18);
  ctx.stroke();

  ctx.restore();
}

function evaluateSlidePath(geom, t) {
  const { topX, topY, cp1, cp2, bottomX, bottomY } = geom;
  const progress = Math.max(0, Math.min(1, t || 0));

  const x = cubicAt(topX, cp1.x, cp2.x, bottomX, progress);
  const y = cubicAt(topY, cp1.y, cp2.y, bottomY, progress);
  const dx = cubicDerivativeAt(topX, cp1.x, cp2.x, bottomX, progress);
  const dy = cubicDerivativeAt(topY, cp1.y, cp2.y, bottomY, progress);

  return {
    x,
    y,
    angle: Math.atan2(dy, dx)
  };
}

function cubicAt(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

function cubicDerivativeAt(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return (
    3 * mt * mt * (p1 - p0) +
    6 * mt * t * (p2 - p1) +
    3 * t * t * (p3 - p2)
  );
}

document.addEventListener("DOMContentLoaded", initSlideAnglePage);
