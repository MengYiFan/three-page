// 角度与滑滑梯安全性交互脚本（Canvas 版）

const slideAngleState = {
  currentDifficulty: null,
  currentAngle: null
};

const PRESET_ANGLES = {
  easy: 10,
  medium: 40,
  hard: 70
};

const SLIDE_MIN_ANGLE = 5;
const SLIDE_MAX_ANGLE = 75;

const angleElements = {};

// Canvas 及动画相关
let slideCanvas = null;
let slideCtx = null;
let canvasWidth = 0;
let canvasHeight = 0;

let slideAnimationFrameId = null;
let lastFrameTime = 0;
let isLoopingSlide = false;
let currentVisualAngle = PRESET_ANGLES.medium; // 当前用于渲染滑梯的角度
const SAFETY_BADGE_BASE =
  "safety-badge inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white shadow";

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
      drawSlideScene(currentVisualAngle, isLoopingSlide ? physicsState.t : 0, isLoopingSlide ? physicsState.velocity : 0);
    });
  }

  setupSlideAngleListeners();
  if (angleElements.generateButton) {
    angleElements.generateButton.disabled = true;
  }

  // 初始静态展示一个适中角度的滑梯
  drawSlideScene(currentVisualAngle, 0);
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
    angleElements.currentAngleLevel.className = `${SAFETY_BADGE_BASE} bg-slate-400`;
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
  currentVisualAngle = PRESET_ANGLES.medium;
  physicsState.t = 0;
  physicsState.velocity = 0;
  drawSlideScene(currentVisualAngle, 0);
}

function generateAngleDemo() {
  if (!slideAngleState.currentDifficulty) return;

  const angle = createPresetAngle(slideAngleState.currentDifficulty);
  slideAngleState.currentAngle = angle;

  updateSlideVisual(angle);

  const safety = classifyAngle(angle);
  updateSafetyBadge(safety, angleElements.currentAngleLevel);

  // 点击“生成滑滑梯角度演示”时，自动开始并循环小人滑下的动画
  startSlideAnimationLoop(angle);
}

function createPresetAngle(level) {
  switch (level) {
    case "easy":
      return PRESET_ANGLES.easy;
    case "medium":
      return PRESET_ANGLES.medium;
    case "hard":
      return PRESET_ANGLES.hard;
    default:
      return PRESET_ANGLES.medium;
  }
}

function updateSlideVisual(angle) {
  const clamped = clampAngle(angle);
  currentVisualAngle = clamped;
  drawSlideScene(clamped, isLoopingSlide ? physicsState.t : 0, isLoopingSlide ? physicsState.velocity : 0);
  if (angleElements.currentAngleValue) {
    angleElements.currentAngleValue.textContent = String(clamped);
  }
}

function clampAngle(angle) {
  return Math.max(SLIDE_MIN_ANGLE, Math.min(SLIDE_MAX_ANGLE, angle || 0));
}

const SAFETY_LEVELS = [
  {
    id: "too-soft",
    label: "过缓",
    className: "bg-sky-500",
    condition: (a) => a > 0 && a < 15,
    summary: "滑梯角度太小，孩子可能很难滑动或滑得很慢。",
    tip: "可以适当增加一点角度，让滑梯既能滑得动，又不过于陡峭。"
  },
  {
    id: "safe",
    label: "安全适中",
    className: "bg-emerald-500",
    condition: (a) => a >= 15 && a <= 35,
    summary: "这是常见的儿童滑梯安全设计范围，滑行速度适中。",
    tip: "同时还需要配合扶手、防护栏等设施，才能更加安全。"
  },
  {
    id: "border",
    label: "偏陡",
    className: "bg-amber-500",
    condition: (a) => a > 35 && a <= 40,
    summary: "滑梯已经比较陡，滑行速度明显变快，需要更多保护措施。",
    tip: "应特别注意滑梯的高度、护栏和缓冲区设计，适合更大年龄的儿童。"
  },
  {
    id: "danger",
    label: "过陡，存在安全风险",
    className: "bg-rose-500",
    condition: (a) => a > 40,
    summary: "滑梯过于陡峭，孩子滑下来的速度很快，容易发生危险。",
    tip: "应降低滑梯高度或减小角度，避免在校园和普通儿童游乐场中使用。"
  }
];

function classifyAngle(angle) {
  if (angle <= 0 || angle > SLIDE_MAX_ANGLE || Number.isNaN(angle)) {
    return {
      id: "invalid",
      label: "不合理角度",
      className: "bg-slate-400",
      summary:
        "请输入 5° 到 75° 范围内的角度，便于讨论实际滑梯情况。",
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
  badgeElement.className = `${SAFETY_BADGE_BASE} ${safety.className}`;
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
    <div class="safety-detail-inner rounded-xl bg-white shadow-md border-l-4 border-sky-400 px-4 py-3 space-y-2">
      <p class="safety-summary font-bold text-slate-800">${safety.summary}</p>
      <p class="safety-tip text-sm text-slate-600 leading-relaxed">${safety.tip}</p>
    </div>
  `;

  updateSafetyBadge(safety, angleElements.currentAngleLevel);
}

// ===== Canvas 动画：小人沿滑梯从上滑到底，并循环 =====

// Physics constants
// Physics constants
const GRAVITY_PIXELS = 2500; // px/s^2, roughly tuned for canvas scale
const FRICTION_COEF = 0.12; // Lower friction to allow sliding at low angles
const DRAG_COEF = 0.0015; // Air resistance to limit max speed at high angles
const TIME_STEP_MAX = 0.05; // Cap dt to avoid explosion on lag

let physicsState = {
  t: 0,
  velocity: 0, // px/s
  isSliding: false
};

function startSlideAnimationLoop(angle) {
  if (!slideCtx) return;
  const clamped = clampAngle(angle);
  currentVisualAngle = clamped;

  // Reset physics
  physicsState.t = 0;
  physicsState.velocity = 0;
  physicsState.isSliding = true;
  isLoopingSlide = true;

  lastFrameTime = performance.now();
  if (!slideAnimationFrameId) {
    slideAnimationFrameId = requestAnimationFrame(handleSlideAnimationFrame);
  }
}

function stopSlideAnimationLoop() {
  isLoopingSlide = false;
  physicsState.isSliding = false;
}

function handleSlideAnimationFrame(timestamp) {
  if (!slideCtx) return;

  let dt = (timestamp - lastFrameTime) / 1000; // seconds
  lastFrameTime = timestamp;

  // Cap dt for safety
  if (dt > TIME_STEP_MAX) dt = TIME_STEP_MAX;

  if (isLoopingSlide && physicsState.isSliding) {
    updatePhysics(dt);
  }

  drawSlideScene(currentVisualAngle, physicsState.t, physicsState.velocity);

  slideAnimationFrameId = requestAnimationFrame(handleSlideAnimationFrame);
}

function updatePhysics(dt) {
  const geom = computeSlideGeometry(currentVisualAngle, canvasWidth, canvasHeight);

  // 1. Get current slope angle and derivative magnitude at t
  // We need the actual slope angle relative to horizontal to calculate gravity component.
  // evaluateSlidePath returns 'angle' which is the tangent angle (0 is horizontal right, positive is down).
  const { angle: slopeAngle, dx, dy } = evaluateSlidePath(geom, physicsState.t);

  // ds_dt (pixels per unit t) = sqrt(dx^2 + dy^2)
  // This tells us how many pixels we move for a small change in t.
  const ds_dt = Math.hypot(dx, dy);

  // 2. Calculate Forces
  // Gravity component along the slide: g * sin(theta)
  // Friction component: mu * g * cos(theta)
  // Note: slopeAngle is in radians. 
  // For a slide going down-right, angle is positive (0 to PI/2).
  // Gravity accelerates down the slope.

  const gravityAccel = GRAVITY_PIXELS * Math.sin(slopeAngle);
  const normalForce = GRAVITY_PIXELS * Math.cos(slopeAngle);
  const frictionAccel = FRICTION_COEF * normalForce;
  const dragAccel = DRAG_COEF * physicsState.velocity * Math.abs(physicsState.velocity); // Drag opposes velocity

  // Net acceleration
  // If velocity is 0 and gravity < friction, it won't start (static friction), 
  // but here we simplify to dynamic friction.
  // We only apply friction opposing motion.
  let netAccel = gravityAccel - frictionAccel - dragAccel;

  // If slope is too shallow, netAccel might be negative. 
  // If we are moving, friction opposes velocity. 
  // If we are stopped, we only start if gravity > static friction.
  // Simplified:
  if (physicsState.velocity > 0) {
    // Standard case
  } else if (physicsState.velocity === 0) {
    // Static case: if gravity < friction, stay at 0
    if (gravityAccel <= frictionAccel) {
      netAccel = 0;
    }
  }

  // 3. Update Velocity
  physicsState.velocity += netAccel * dt;

  // Prevent negative velocity (sliding back up) for this simple demo
  if (physicsState.velocity < 0) physicsState.velocity = 0;

  // 4. Update Position (t)
  // v = ds/time = (ds/dt) * (dt/time) -> wait, v = ds/time.
  // we want change in t: delta_t = (v * delta_time) / (ds/dt)
  if (ds_dt > 0.001) {
    const delta_t = (physicsState.velocity * dt) / ds_dt;
    physicsState.t += delta_t;
  }

  // 5. Loop Check
  if (physicsState.t >= 1) {
    // Reset to top
    physicsState.t = 0;
    physicsState.velocity = 0;
    // Optional: Add a small pause at top? 
    // For now, instant loop.
  }
}

// 根据当前角度和进度绘制滑梯和人物
function drawSlideScene(angle, childT, velocity = 0) {
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

  // 半透明角度示意叠加在滑梯起点
  drawAngleOverlayOnSlide(ctx, geom);

  // 画速度线
  drawSpeedLines(ctx, geom, childT, velocity);

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
  ctx.globalAlpha = 0.72;

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
  const clampedAngle = clampAngle(angleDeg);
  const rad = (clampedAngle * Math.PI) / 180;
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
  const label = `${Math.round(clampedAngle)}°`;
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

function drawAngleOverlayOnSlide(ctx, geom) {
  if (!geom) return;

  const clamped = clampAngle(geom.angleDeg);
  const rad = (clamped * Math.PI) / 180;
  const { topX, topY, canvasWidth, canvasHeight } = geom;
  const sizeBase = Math.min(canvasWidth || 320, canvasHeight || 240);
  const radius =
    sizeBase * (0.11 + ((clamped - SLIDE_MIN_ANGLE) / (SLIDE_MAX_ANGLE - SLIDE_MIN_ANGLE)) * 0.04);

  ctx.save();
  ctx.translate(topX, topY);
  ctx.globalAlpha = 0.42;

  ctx.strokeStyle = "#0B5AA9";
  ctx.lineWidth = Math.max(1.2, radius * 0.025);
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(radius, 0);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(rad) * radius, Math.sin(rad) * radius);
  ctx.stroke();

  ctx.strokeStyle = "rgba(2, 86, 174, 0.65)";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.92, 0, rad, false);
  ctx.stroke();

  ctx.fillStyle = "#0A3D73";
  ctx.font = "bold 13px Sans-Serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${Math.round(clamped)}°`,
    Math.cos(rad * 0.5) * radius * 0.95 - 12,
    Math.sin(rad * 0.5) * radius * 0.95 - 6
  );

  ctx.restore();
}

// 计算滑梯的起点、终点及宽度等参数
function computeSlideGeometry(angle, w, h) {
  const width = w || canvasWidth || 320;
  const height = h || canvasHeight || 240;

  const clamped = clampAngle(angle);
  const rad = (clamped * Math.PI) / 180;
  const normalized = Math.max(
    0,
    Math.min(1, (clamped - SLIDE_MIN_ANGLE) / (SLIDE_MAX_ANGLE - SLIDE_MIN_ANGLE))
  );

  const groundY = height * 0.76;

  // 塔在画面的左侧，滑梯向右下延伸，角度越大塔越高且略往前
  const topX = width * (0.22 + normalized * 0.06);
  const topY = height * (0.24 - normalized * 0.1);

  // 底部始终落在地面附近，随着角度变化调整水平位置，角度越小越向右
  const bottomX = Math.max(
    topX + width * 0.24,
    width * (0.6 + (1 - normalized) * 0.26)
  );
  const bottomY = groundY;

  const outerWidth = Math.min(width, height) * 0.18;
  const innerWidth = outerWidth * 0.65;

  // 控制点：第一段服从角度方向，第二段在落地前略微抬起形成优雅曲线
  const cp1Distance = width * (0.3 + (1 - normalized) * 0.12);
  const cp1 = {
    x: topX + Math.cos(rad) * cp1Distance,
    y: topY + Math.sin(rad) * cp1Distance + height * 0.035
  };
  const cp2 = {
    x: bottomX - width * (0.26 - 0.1 * normalized),
    y: bottomY - height * (0.12 + 0.18 * normalized)
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
  const { topX, topY, canvasWidth, canvasHeight, outerWidth } = geom;
  const w = canvasWidth || 320;
  const h = canvasHeight || 240;
  const groundY = geom.bottomY || h * 0.76;

  const columnRadius = Math.min(w, h) * 0.09;
  const columnWidth = columnRadius * 1.45;
  const columnCenterX = topX - columnRadius * 0.65;
  const columnTopY = topY - columnRadius * 0.35;
  const columnBottomY = groundY + columnRadius * 0.35;

  // 圆柱主体
  const columnGradient = ctx.createLinearGradient(
    columnCenterX - columnWidth / 2,
    columnTopY,
    columnCenterX + columnWidth / 2,
    columnBottomY
  );
  columnGradient.addColorStop(0, "#85C6FF");
  columnGradient.addColorStop(0.5, "#5BA6F9");
  columnGradient.addColorStop(1, "#1E6EC5");
  ctx.fillStyle = columnGradient;
  ctx.fillRect(
    columnCenterX - columnWidth / 2,
    columnTopY,
    columnWidth,
    columnBottomY - columnTopY
  );

  // 圆柱顶部与底部
  ctx.fillStyle = "#B5DBFF";
  ctx.beginPath();
  ctx.ellipse(
    columnCenterX,
    columnTopY,
    columnWidth / 2,
    columnWidth * 0.28,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(
    columnCenterX,
    columnBottomY,
    columnWidth * 0.7,
    columnWidth * 0.3,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 顶部平台
  const platformHeight = outerWidth * 0.45;
  const platformLength = Math.max(outerWidth * 2, topX - columnCenterX + outerWidth * 1.1);
  const platformX = columnCenterX - columnWidth * 0.5;
  const platformY = columnTopY - platformHeight * 0.25;
  const platformGradient = ctx.createLinearGradient(
    platformX,
    platformY,
    platformX + platformLength,
    platformY + platformHeight
  );
  platformGradient.addColorStop(0, "#A6DBFF");
  platformGradient.addColorStop(0.6, "#5FAAF6");
  platformGradient.addColorStop(1, "#347FDF");

  ctx.fillStyle = platformGradient;
  ctx.beginPath();
  ctx.moveTo(platformX, platformY);
  ctx.lineTo(platformX + platformLength, platformY + platformHeight * 0.15);
  ctx.lineTo(platformX + platformLength, platformY + platformHeight * 1.1);
  ctx.quadraticCurveTo(
    platformX + platformLength * 0.25,
    platformY + platformHeight * 1.4,
    platformX,
    platformY + platformHeight * 1.1
  );
  ctx.closePath();
  ctx.fill();

  // 平台高光
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = platformHeight * 0.18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(platformX + platformLength * 0.1, platformY + platformHeight * 0.2);
  ctx.lineTo(platformX + platformLength * 0.9, platformY + platformHeight * 0.35);
  ctx.stroke();

  // 梯子扶手
  const ladderOuterTop = {
    x: columnCenterX - columnWidth * 0.85,
    y: platformY + platformHeight * 0.35
  };
  const ladderOuterBottom = {
    x: ladderOuterTop.x - columnWidth * 0.15,
    y: columnBottomY - columnWidth * 0.2
  };
  const ladderInnerTop = {
    x: ladderOuterTop.x + columnWidth * 0.35,
    y: ladderOuterTop.y - platformHeight * 0.05
  };
  const ladderInnerBottom = {
    x: ladderInnerTop.x - columnWidth * 0.1,
    y: ladderOuterBottom.y
  };

  const railColor = "#56A9FF";
  ctx.strokeStyle = railColor;
  ctx.lineWidth = columnWidth * 0.14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ladderOuterTop.x, ladderOuterTop.y);
  ctx.quadraticCurveTo(
    ladderOuterTop.x - columnWidth * 0.4,
    (ladderOuterTop.y + ladderOuterBottom.y) / 2,
    ladderOuterBottom.x,
    ladderOuterBottom.y
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(ladderInnerTop.x, ladderInnerTop.y);
  ctx.quadraticCurveTo(
    ladderInnerTop.x - columnWidth * 0.3,
    (ladderInnerTop.y + ladderInnerBottom.y) / 2,
    ladderInnerBottom.x,
    ladderInnerBottom.y
  );
  ctx.stroke();

  // 梯子横档
  ctx.strokeStyle = "#8CC6FF";
  ctx.lineWidth = columnWidth * 0.08;
  ctx.lineCap = "round";
  const rungCount = 5;
  for (let i = 1; i <= rungCount; i++) {
    const t = i / (rungCount + 1);
    const outerX =
      ladderOuterTop.x + (ladderOuterBottom.x - ladderOuterTop.x) * t;
    const innerX =
      ladderInnerTop.x + (ladderInnerBottom.x - ladderInnerTop.x) * t;
    const y =
      ladderOuterTop.y + (ladderOuterBottom.y - ladderOuterTop.y) * t;
    ctx.beginPath();
    ctx.moveTo(outerX, y);
    ctx.lineTo(innerX, y);
    ctx.stroke();
  }

  // 平台护栏与滑梯连接
  ctx.strokeStyle = "#7DB9FF";
  ctx.lineWidth = columnWidth * 0.08;
  ctx.beginPath();
  ctx.moveTo(columnCenterX - columnWidth * 0.2, platformY - platformHeight * 0.35);
  ctx.quadraticCurveTo(
    columnCenterX - columnWidth * 0.9,
    platformY - platformHeight * 1.2,
    ladderOuterTop.x,
    ladderOuterTop.y
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(columnCenterX + columnWidth * 0.3, platformY - platformHeight * 0.2);
  ctx.lineTo(topX + outerWidth * 0.5, platformY);
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

  // 支撑阴影
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = outerWidth * 0.35;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(topX - outerWidth * 0.15, topY + outerWidth * 0.65);
  ctx.quadraticCurveTo(
    (topX + bottomX) / 2,
    (topY + bottomY) / 2 + outerWidth * 1.3,
    bottomX + outerWidth * 0.4,
    bottomY + outerWidth * 0.55
  );
  ctx.stroke();

  const sampleCount = 28;
  const samples = [];
  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const { x, y, angle } = evaluateSlidePath(geom, t);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    samples.push({ x, y, nx, ny });
  }

  const offsetPoints = (distance) =>
    samples.map((p) => ({
      x: p.x + p.nx * distance,
      y: p.y + p.ny * distance
    }));

  const drawRibbon = (leftPoints, rightPoints, fill) => {
    if (!leftPoints.length || !rightPoints.length) return;
    ctx.beginPath();
    ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
    for (let i = 1; i < leftPoints.length; i++) {
      ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
    }
    for (let i = rightPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const outerHalf = outerWidth * 0.55;
  const innerHalf = innerWidth * 0.5;
  const guardHalf = outerWidth * 0.7;

  const outerLeft = offsetPoints(outerHalf);
  const outerRight = offsetPoints(-outerHalf);
  const bodyGradient = ctx.createLinearGradient(topX, topY, bottomX, bottomY);
  bodyGradient.addColorStop(0, "#9FD8FF");
  bodyGradient.addColorStop(0.35, "#59A9F2");
  bodyGradient.addColorStop(1, "#1C62B4");
  drawRibbon(outerLeft, outerRight, bodyGradient);

  // 滑动面
  const bedLeft = offsetPoints(innerHalf);
  const bedRight = offsetPoints(-innerHalf);
  const bedGradient = ctx.createLinearGradient(topX, topY, bottomX, bottomY);
  bedGradient.addColorStop(0, "#D8F1FF");
  bedGradient.addColorStop(1, "#4FA4F7");
  drawRibbon(bedLeft, bedRight, bedGradient);

  // 护栏
  const guardLeftOuter = offsetPoints(guardHalf);
  const guardLeftInner = offsetPoints(outerHalf);
  const guardRightOuter = offsetPoints(-guardHalf);
  const guardRightInner = offsetPoints(-outerHalf);
  const guardGradient = ctx.createLinearGradient(topX, topY, bottomX, bottomY);
  guardGradient.addColorStop(0, "#7AC5FF");
  guardGradient.addColorStop(1, "#1D6BC6");
  drawRibbon(guardLeftOuter, guardLeftInner, guardGradient);
  drawRibbon(guardRightInner, guardRightOuter, guardGradient);

  // 高光与阴影线
  ctx.lineWidth = outerWidth * 0.12;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  for (let i = 0; i < guardRightInner.length; i++) {
    const { x, y } = guardRightInner[i];
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(13, 71, 161, 0.3)";
  ctx.beginPath();
  for (let i = 0; i < guardLeftInner.length; i++) {
    const { x, y } = guardLeftInner[i];
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 底部出口圆弧 (Integrated cap)
  ctx.save();
  const lastP = samples[samples.length - 1];
  ctx.translate(lastP.x, lastP.y);
  ctx.rotate(lastP.angle);

  // Draw a cap at the end
  ctx.fillStyle = "#1C62B4"; // Match body end color
  ctx.beginPath();
  ctx.ellipse(0, 0, outerWidth * 0.1, outerWidth * 0.55, 0, Math.PI / 2, Math.PI * 1.5);
  ctx.fill();
  ctx.restore();

  // 入口圆弧
  ctx.fillStyle = "#8DC9FF";
  ctx.beginPath();
  ctx.arc(topX, topY, outerWidth * 0.6, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();

  // 滑面中线
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = outerWidth * 0.05;
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, bottomX, bottomY);
  ctx.stroke();
}

function drawSlideChild(ctx, geom, t) {
  const slidePoint = evaluateSlidePath(geom, Math.max(0, Math.min(1, t || 0)));
  if (!slidePoint) return;

  const { x: px, y: py, angle } = slidePoint;
  const scale = Math.max(0.55, Math.min(1.15, (geom.outerWidth || 45) / 65));
  const bodyWidth = 24 * scale;
  const bodyHeight = 30 * scale;
  const headRadius = 12 * scale;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle - Math.PI / 30);
  ctx.translate(0, -geom.outerWidth * 0.08);

  // 腿与鞋子
  ctx.strokeStyle = "#FFB74D";
  ctx.lineCap = "round";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(-6 * scale, bodyHeight * 0.1);
  ctx.lineTo(-2 * scale, bodyHeight * 0.75);
  ctx.moveTo(8 * scale, bodyHeight * 0.1);
  ctx.lineTo(12 * scale, bodyHeight * 0.75);
  ctx.stroke();

  ctx.fillStyle = "#FDD835";
  ctx.beginPath();
  ctx.ellipse(-2 * scale, bodyHeight * 0.85, 5 * scale, 3 * scale, Math.PI / 16, 0, Math.PI * 2);
  ctx.ellipse(12 * scale, bodyHeight * 0.85, 5 * scale, 3 * scale, -Math.PI / 16, 0, Math.PI * 2);
  ctx.fill();

  // 连衣裙
  ctx.fillStyle = "#F8AEDD";
  ctx.beginPath();
  ctx.moveTo(-bodyWidth * 0.45, -bodyHeight * 0.1);
  ctx.lineTo(bodyWidth * 0.45, -bodyHeight * 0.1);
  ctx.quadraticCurveTo(
    bodyWidth * 0.75,
    bodyHeight * 0.6,
    0,
    bodyHeight * 0.85
  );
  ctx.quadraticCurveTo(
    -bodyWidth * 0.75,
    bodyHeight * 0.6,
    -bodyWidth * 0.45,
    -bodyHeight * 0.1
  );
  ctx.closePath();
  ctx.fill();

  // 袖口和衣领
  ctx.fillStyle = "#FCE4EC";
  ctx.beginPath();
  ctx.ellipse(0, -bodyHeight * 0.18, bodyWidth * 0.22, bodyHeight * 0.22, 0, 0, Math.PI);
  ctx.fill();

  // 手臂
  ctx.strokeStyle = "#F6C7A1";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(-bodyWidth * 0.38, -bodyHeight * 0.05);
  ctx.lineTo(-bodyWidth * 0.95, bodyHeight * 0.25);
  ctx.moveTo(bodyWidth * 0.38, -bodyHeight * 0.05);
  ctx.lineTo(bodyWidth * 0.9, bodyHeight * 0.2);
  ctx.stroke();

  ctx.fillStyle = "#FFE0B2";
  ctx.beginPath();
  ctx.arc(-bodyWidth * 0.96, bodyHeight * 0.25, 3 * scale, 0, Math.PI * 2);
  ctx.arc(bodyWidth * 0.92, bodyHeight * 0.2, 3 * scale, 0, Math.PI * 2);
  ctx.fill();

  const headCenterY = -bodyHeight * 0.55;

  // 发型与辫子
  ctx.fillStyle = "#5C4033";
  ctx.beginPath();
  ctx.arc(0, headCenterY - headRadius * 0.45, headRadius * 1.3, Math.PI, Math.PI * 2);
  ctx.quadraticCurveTo(
    headRadius * 1.35,
    headCenterY + headRadius * 0.6,
    headRadius * 0.45,
    headCenterY + headRadius * 0.65
  );
  ctx.quadraticCurveTo(
    0,
    headCenterY + headRadius * 0.75,
    -headRadius * 0.45,
    headCenterY + headRadius * 0.65
  );
  ctx.quadraticCurveTo(
    -headRadius * 1.35,
    headCenterY + headRadius * 0.6,
    -headRadius * 1.3,
    headCenterY - headRadius * 0.45
  );
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-headRadius * 1.2, headCenterY + headRadius * 0.2, headRadius * 0.55, 0, Math.PI * 2);
  ctx.arc(headRadius * 1.2, headCenterY + headRadius * 0.2, headRadius * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFD54F";
  ctx.beginPath();
  ctx.arc(-headRadius * 1.2, headCenterY + headRadius * 0.05, headRadius * 0.2, 0, Math.PI * 2);
  ctx.arc(headRadius * 1.2, headCenterY + headRadius * 0.05, headRadius * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 头部
  ctx.fillStyle = "#FFE0B2";
  ctx.beginPath();
  ctx.arc(0, headCenterY, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // 面部细节
  ctx.fillStyle = "#3E2723";
  ctx.beginPath();
  ctx.arc(-headRadius * 0.35, headCenterY - headRadius * 0.2, headRadius * 0.12, 0, Math.PI * 2);
  ctx.arc(headRadius * 0.35, headCenterY - headRadius * 0.2, headRadius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-headRadius * 0.35, headCenterY - headRadius * 0.25, headRadius * 0.045, 0, Math.PI * 2);
  ctx.arc(headRadius * 0.35, headCenterY - headRadius * 0.25, headRadius * 0.045, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#E65100";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(0, headCenterY - headRadius * 0.05, headRadius * 0.45, Math.PI * 0.2, Math.PI - Math.PI * 0.2);
  ctx.stroke();

  ctx.fillStyle = "#F06292";
  ctx.beginPath();
  ctx.arc(0, headCenterY + headRadius * 0.2, headRadius * 0.35, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = "rgba(244, 143, 177, 0.4)";
  ctx.beginPath();
  ctx.arc(-headRadius * 0.55, headCenterY, headRadius * 0.18, 0, Math.PI * 2);
  ctx.arc(headRadius * 0.55, headCenterY, headRadius * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // 头发高光
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(-headRadius * 0.7, headCenterY - headRadius * 0.55);
  ctx.quadraticCurveTo(0, headCenterY - headRadius * 1.05, headRadius * 0.7, headCenterY - headRadius * 0.45);
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
    dx,
    dy,
    angle: Math.atan2(dy, dx)
  };
}

function drawSpeedLines(ctx, geom, t, velocity) {
  if (velocity < 300) return; // Only draw if fast enough

  const { x, y, angle } = evaluateSlidePath(geom, t);
  const scale = Math.max(0.55, Math.min(1.15, (geom.outerWidth || 45) / 65));

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const lineCount = Math.min(5, Math.floor(velocity / 200));
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";

  for (let i = 0; i < lineCount; i++) {
    const offsetX = - (20 + Math.random() * 30) * scale;
    const offsetY = (Math.random() - 0.5) * 30 * scale;
    const length = (10 + Math.random() * 20) * scale * (velocity / 800);

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX - length, offsetY);
    ctx.stroke();
  }

  ctx.restore();
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
