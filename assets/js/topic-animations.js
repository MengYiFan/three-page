// 通用交互动画脚本，根据 body data-topic 初始化对应场景

document.addEventListener("DOMContentLoaded", () => {
  const topic = document.body.dataset.topic;
  const inits = {
    "average-jump": initAverageJump,
    "fractions-pizza": initFractionPizza,
    "rectangle-area": initRectanglePlayground,
    "lever-balance": initLeverSimulation,
    "water-cycle": initWaterCycle,
    "pythagoras": initPythagorasDemo,
    "multiplication-arrays": initMultiplicationArrays,
    "fraction-addition": initFractionAddition,
    "time-conversion": initTimeConversion,
    "magnet-experiment": initMagnetExperiment,
    "plant-transpiration": initPlantTranspiration,
    "triangle-angle-sum": initTriangleAngleSum,
    "place-value-machine": initPlaceValueMachine,
    "probability-spinner": initProbabilitySpinner,
    "speed-distance": initSpeedDistance,
    "symmetry-folding": initSymmetryFolding,
    "planet-orbits": initPlanetOrbits,
    "sound-waves": initSoundWaves,
    "particle-states": initParticleStates,
    "arithmetic-staircase": initArithmeticStaircase,
    "circle-measures": initCircleMeasures,
    "parallelogram-rectangle": initParallelogramRectangle,
    "light-reflection": initLightReflection,
    "buoyancy-tank": initBuoyancyTank,
    "sun-shadow": initSunShadow,
    "energy-pyramid": initEnergyPyramid,
    "earth-rotation": initEarthRotation
    "arithmetic-stairs": initArithmeticStairs,
    "percent-donut": initPercentDonut,
    "coordinate-transform": initCoordinateTransform,
    "line-slope": initLineSlope,
    "light-reflection": initLightReflection,
    "sun-shadow": initSunShadow,
    "buoyancy-density": initBuoyancyDensity,
    "circuit-brightness": initCircuitBrightness
  };
  if (topic && typeof inits[topic] === "function") {
    inits[topic]();
  }
});

function initAverageJump() {
  const container = document.getElementById("average-chart");
  if (!container) return;

  const data = [
    { name: "小雅", value: 96 },
    { name: "小俊", value: 84 },
    { name: "小敏", value: 90 },
    { name: "小杰", value: 110 }
  ];
  const average = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  const maxValue = Math.max(...data.map((item) => item.value));

  const replayBtn = document.getElementById("replay-average");
  const info = document.getElementById("average-info");

  container.innerHTML = "";
  const avgLine = document.createElement("div");
  avgLine.className = "avg-line";
  avgLine.style.bottom = `${(average / maxValue) * 100}%`;
  avgLine.innerHTML = `<span>平均：${average.toFixed(1)} 次</span>`;

  data.forEach((item) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.dataset.value = item.value;
    bar.dataset.target = ((item.value / maxValue) * 100).toFixed(1);
    bar.innerHTML = `<span class="bar-label">${item.name}</span>`;
    container.appendChild(bar);
  });
  container.appendChild(avgLine);

  function animateBars() {
    const bars = container.querySelectorAll(".bar");
    bars.forEach((bar, index) => {
      bar.style.height = "0%";
      bar.classList.remove("bar-above", "bar-below", "show-value");
      requestAnimationFrame(() => {
        setTimeout(() => {
          bar.style.height = `${bar.dataset.target}%`;
          const value = Number(bar.dataset.value);
          const diff = value - average;
          if (diff >= 0) {
            bar.classList.add("bar-above");
          } else {
            bar.classList.add("bar-below");
          }
          setTimeout(() => {
            bar.classList.add("show-value");
          }, 500);
        }, index * 300);
      });
    });

    if (info) {
      const aboveNames = data
        .filter((item) => item.value >= average)
        .map((item) => item.name)
        .join("、");
      const belowNames = data
        .filter((item) => item.value < average)
        .map((item) => item.name)
        .join("、");
      info.textContent = `平均数为 ${average.toFixed(
        1
      )} 次/分钟，高于平均：${aboveNames || "无"}；低于平均：${
        belowNames || "无"
      }。`;
    }
  }

  animateBars();
  replayBtn?.addEventListener("click", animateBars);
}

function initFractionPizza() {
  const canvas = document.getElementById("pizza-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const pizzas = [
    {
      total: 8,
      eaten: 5,
      center: { x: 150, y: 125 },
      radius: 90,
      label: "切 8 份"
    },
    {
      total: 6,
      eaten: 3,
      center: { x: 320, y: 125 },
      radius: 90,
      label: "切 6 份"
    }
  ];

  const replayBtn = document.getElementById("replay-pizza");
  let progress = 0;
  let animId = null;

  function draw(progressValue) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pizzas.forEach((pizza) => {
      const { center, radius, total, eaten, label } = pizza;
      ctx.save();
      ctx.translate(center.x, center.y);

      // 背景与剩余部分
      ctx.beginPath();
      ctx.fillStyle = "#ffb74d";
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // 边缘
      ctx.strokeStyle = "#d84315";
      ctx.lineWidth = 6;
      ctx.stroke();

      // 切片线
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 3;
      const startAngle = -Math.PI / 2;
      const sliceAngle = (Math.PI * 2) / total;
      for (let i = 0; i < total; i++) {
        const angle = startAngle + sliceAngle * i;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.stroke();
      }

      // 已吃掉部分
      const eatenAngle = sliceAngle * eaten * progressValue;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.fillStyle = "rgba(224, 224, 224, 0.92)";
      ctx.arc(0, 0, radius, startAngle, startAngle + eatenAngle, false);
      ctx.closePath();
      ctx.fill();

      // 文本
      ctx.fillStyle = "#5d4037";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `${label} · 剩余 ${total - eaten}/${total}`,
        0,
        radius + 24
      );
      ctx.restore();
    });
  }

  function animate() {
    cancelAnimationFrame(animId);
    progress = 0;

    const step = () => {
      progress += 0.015;
      if (progress > 1) progress = 1;
      draw(progress);
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    step();
  }

  animate();
  replayBtn?.addEventListener("click", animate);
}

function initRectanglePlayground() {
  const lengthInput = document.getElementById("rect-length");
  const widthInput = document.getElementById("rect-width");
  if (!lengthInput || !widthInput) return;
  const rectVisual = document.getElementById("rect-visual");
  const perimeterText = document.getElementById("rect-perimeter");
  const areaText = document.getElementById("rect-area");
  const lengthValue = document.getElementById("rect-length-value");
  const widthValue = document.getElementById("rect-width-value");

  const maxDimension = Number(lengthInput.max) || 20;

  function updateRectangle() {
    const length = Number(lengthInput.value);
    const width = Number(widthInput.value);
    const perimeter = (length + width) * 2;
    const area = length * width;

    lengthValue.textContent = length.toString();
    widthValue.textContent = width.toString();

    const widthPercent = Math.max(15, (length / maxDimension) * 90);
    const heightPercent = Math.max(15, (width / maxDimension) * 90);
    rectVisual?.style.setProperty("--rect-width", `${widthPercent}%`);
    rectVisual?.style.setProperty("--rect-height", `${heightPercent}%`);
    if (rectVisual) {
      rectVisual.textContent = `${length}m × ${width}m`;
    }
    perimeterText.textContent = `周长：${perimeter} 米`;
    areaText.textContent = `面积：${area} 平方米`;
  }

  lengthInput.addEventListener("input", updateRectangle);
  widthInput.addEventListener("input", updateRectangle);
  updateRectangle();
}

function initLeverSimulation() {
  const canvas = document.getElementById("lever-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const weightInput = document.getElementById("lever-weight");
  const positionInput = document.getElementById("lever-position");
  const weightValue = document.getElementById("lever-weight-value");
  const positionValue = document.getElementById("lever-position-value");
  const leftTorqueText = document.getElementById("left-torque");
  const rightTorqueText = document.getElementById("right-torque");
  const statusText = document.getElementById("lever-status");

  const scale = 8; // 每厘米的像素值
  const beamLengthCm = 50;
  const beamLengthPx = beamLengthCm * scale;
  const offsetX = 60;
  const pivotCm = 20;
  const pivotX = offsetX + pivotCm * scale;
  const pivotY = 130;
  const beamThickness = 16;
  const leftMassCount = 2;
  const leftPositionCm = 5;
  const leftArm = pivotCm - leftPositionCm; // 15 cm
  const baseForce = 50; // 50 g

  function drawLever(angle, rightPosition, rightMass) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 地面
    ctx.fillStyle = "#d7ccc8";
    ctx.fillRect(0, pivotY + 40, canvas.width, 30);

    // 支点
    ctx.fillStyle = "#8d6e63";
    ctx.beginPath();
    ctx.moveTo(pivotX - 25, pivotY + 40);
    ctx.lineTo(pivotX + 25, pivotY + 40);
    ctx.lineTo(pivotX, pivotY - 10);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(pivotX, pivotY - 10);
    ctx.rotate(angle);

    // 杠杆
    ctx.fillStyle = "#ffe082";
    ctx.fillRect(-pivotCm * scale, -beamThickness / 2, beamLengthPx, beamThickness);
    ctx.strokeStyle = "#ffb300";
    ctx.lineWidth = 2;
    ctx.strokeRect(-pivotCm * scale, -beamThickness / 2, beamLengthPx, beamThickness);

    // 刻度
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    for (let cm = 0; cm <= beamLengthCm; cm += 5) {
      const x = (cm - pivotCm) * scale;
      ctx.beginPath();
      ctx.moveTo(x, -beamThickness / 2);
      ctx.lineTo(x, beamThickness / 2);
      ctx.stroke();
    }

    // 左侧砝码
    drawWeight(ctx, (leftPositionCm - pivotCm) * scale, -35, leftMassCount, "#4dd0e1");
    // 右侧砝码
    drawWeight(
      ctx,
      (rightPosition - pivotCm) * scale,
      -35,
      rightMass,
      "#ff8a65"
    );

    ctx.restore();
  }

function drawWeight(ctx, offsetX, offsetY, massCount, color) {
  if (massCount <= 0) return;
  ctx.save();
  ctx.translate(offsetX, offsetY);

    const width = 24;
    const height = 22;
    const spacing = 6;
    for (let i = 0; i < Math.ceil(massCount); i++) {
      const isHalf = massCount - i === 0.5;
      const actualHeight = isHalf ? height / 2 : height;
      ctx.fillStyle = color;
      ctx.strokeStyle = "#5d4037";
      ctx.lineWidth = 1.5;
    drawRoundedRect(
      ctx,
      -width / 2,
      i * (height + spacing),
      width,
      actualHeight,
      4
    );
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

  function updateLever() {
    const rightMass = Number(weightInput.value);
    const rightPosition = Number(positionInput.value);
    weightValue.textContent = rightMass.toString();
    positionValue.textContent = rightPosition.toString();

    const leftTorque = leftMassCount * baseForce * leftArm;
    const rightArm = rightPosition - pivotCm;
    const rightTorque = rightMass * baseForce * rightArm;

    const torqueDiff = rightTorque - leftTorque;
    const angle = Math.max(-0.35, Math.min(0.35, torqueDiff / 6000));

    leftTorqueText.textContent = `左侧力矩：${leftTorque.toFixed(0)} g·cm`;
    rightTorqueText.textContent = `右侧力矩：${rightTorque.toFixed(0)} g·cm`;
    const status =
      Math.abs(torqueDiff) < 30
        ? "状态：平衡 ✅"
        : torqueDiff > 0
        ? "状态：右侧较重 ↘"
        : "状态：左侧较重 ↗";
    statusText.textContent = status;

    drawLever(angle, rightPosition, rightMass);
  }

  weightInput.addEventListener("input", updateLever);
  positionInput.addEventListener("input", updateLever);
  updateLever();
}

function initWaterCycle() {
  const canvas = document.getElementById("water-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("sun-intensity");
  const sliderValue = document.getElementById("sun-intensity-value");

  let sunIntensity = Number(slider?.value || 3);
  let vapors = [];
  let raindrops = [];
  let cloudMoisture = 0;
  let lastTime = 0;

  function addVapor() {
    const waterY = canvas.height - 60;
    vapors.push({
      x: Math.random() * canvas.width,
      y: waterY,
      speed: 0.05 + Math.random() * 0.05 * sunIntensity
    });
  }

  function addRaindrop() {
    const cloudY = 80;
    raindrops.push({
      x: canvas.width * 0.25 + Math.random() * canvas.width * 0.5,
      y: cloudY,
      speed: 0.18 + Math.random() * 0.04
    });
  }

  function update(dt) {
    // 蒸发
    const vaporRate = sunIntensity * 0.04;
    for (let i = 0; i < vaporRate; i++) {
      addVapor();
    }
    vapors = vapors.filter((vapor) => {
      vapor.y -= vapor.speed * dt;
      if (vapor.y <= 95) {
        cloudMoisture += vapor.speed * dt * 2;
        return false;
      }
      return vapor.y > 0;
    });

    // 云层达到饱和触发降水
    if (cloudMoisture > 30) {
      addRaindrop();
      cloudMoisture -= 10;
    }

    raindrops = raindrops.filter((drop) => {
      drop.y += drop.speed * dt;
      return drop.y < canvas.height - 30;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const waterY = canvas.height - 60;

    // 天空背景
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, "#bbdefb");
    skyGrad.addColorStop(0.5, "#e3f2fd");
    skyGrad.addColorStop(1, "#b2dfdb");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 太阳
    ctx.beginPath();
    ctx.fillStyle = "#ffd54f";
    ctx.arc(canvas.width - 60, 60, 35 + sunIntensity * 2, 0, Math.PI * 2);
    ctx.fill();

    // 水面
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, canvas.height);
    waterGrad.addColorStop(0, "#29b6f6");
    waterGrad.addColorStop(1, "#0288d1");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, canvas.width, canvas.height - waterY);

    // 云
    const cloudOpacity = Math.min(0.2 + cloudMoisture / 120, 0.8);
    ctx.fillStyle = `rgba(255,255,255,${cloudOpacity})`;
    ctx.beginPath();
    ctx.ellipse(canvas.width / 3, 90, 90, 30, 0, 0, Math.PI * 2);
    ctx.ellipse(canvas.width / 2, 70, 110, 35, 0, 0, Math.PI * 2);
    ctx.ellipse((canvas.width / 3) * 2, 95, 80, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 水汽
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    vapors.forEach((vapor) => {
      ctx.beginPath();
      ctx.arc(vapor.x, vapor.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 降雨
    ctx.strokeStyle = "rgba(33,150,243,0.9)";
    ctx.lineWidth = 2;
    raindrops.forEach((drop) => {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + 10);
      ctx.stroke();
    });

    // 文本提示
    ctx.fillStyle = "#01579b";
    ctx.font = "14px Sans-Serif";
    ctx.fillText("蒸发", 40, waterY - 30);
    ctx.fillText("凝结形成云层", canvas.width / 2 - 60, 60);
    ctx.fillText("降水", canvas.width / 2, 160);
  }

  function loop(timestamp) {
    const dt = timestamp - lastTime || 16;
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  slider?.addEventListener("input", (event) => {
    sunIntensity = Number(event.target.value);
    sliderValue.textContent = sunIntensity.toString();
  });

  sliderValue.textContent = sunIntensity.toString();
  requestAnimationFrame(loop);
}

function initPythagorasDemo() {
  const canvas = document.getElementById("pythagoras-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const baseSlider = document.getElementById("tri-base");
  const heightSlider = document.getElementById("tri-height");
  const baseValue = document.getElementById("tri-base-value");
  const heightValue = document.getElementById("tri-height-value");
  const formulaText = document.getElementById("tri-formula");

  function drawTriangle() {
    const base = Number(baseSlider.value);
    const height = Number(heightSlider.value);
    const hypotenuse = Math.sqrt(base * base + height * height);
    const padding = 45;
    const basePx = base;
    const heightPx = height;
    const scale = Math.min(
      (canvas.width - padding * 2) / basePx,
      (canvas.height - padding * 2) / heightPx
    );
    const scaledBase = basePx * scale;
    const scaledHeight = heightPx * scale;
    const originX = padding;
    const originY = canvas.height - padding;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#e3f2fd");
    bg.addColorStop(1, "#fffde7");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Squares on legs
    ctx.fillStyle = "rgba(25, 118, 210, 0.15)";
    ctx.strokeStyle = "#1e88e5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(originX, originY, scaledBase, -scaledBase);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(67, 160, 71, 0.18)";
    ctx.strokeStyle = "#43a047";
    ctx.beginPath();
    ctx.rect(originX, originY, -scaledHeight, -scaledHeight);
    ctx.fill();
    ctx.stroke();

    // Triangle
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + scaledBase, originY);
    ctx.lineTo(originX, originY - scaledHeight);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 183, 77, 0.65)";
    ctx.fill();
    ctx.strokeStyle = "#fb8c00";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Right angle marker
    ctx.strokeStyle = "#fb8c00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX + 18, originY);
    ctx.lineTo(originX + 18, originY - 18);
    ctx.lineTo(originX, originY - 18);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#0d47a1";
    ctx.font = "14px Sans-Serif";
    ctx.fillText(
      `a = ${base.toFixed(1)} m`,
      originX + scaledBase / 2 - 30,
      originY + 22
    );
    ctx.save();
    ctx.translate(originX - 30, originY - scaledHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`b = ${height.toFixed(1)} m`, -20, 0);
    ctx.restore();

    ctx.fillStyle = "#bf360c";
    ctx.font = "16px Sans-Serif";
    const midX = originX + scaledBase / 2 - 30;
    const midY = originY - scaledHeight / 2 - 8;
    ctx.fillText(`c ≈ ${hypotenuse.toFixed(2)} m`, midX, midY);

    if (baseValue) baseValue.textContent = base.toString();
    if (heightValue) heightValue.textContent = height.toString();
    if (formulaText) {
      formulaText.textContent = `${base.toFixed(1)}² + ${height.toFixed(
        1
      )}² = ${hypotenuse.toFixed(2)}²`;
    }
  }

  baseSlider?.addEventListener("input", drawTriangle);
  heightSlider?.addEventListener("input", drawTriangle);
  drawTriangle();
}

function initMultiplicationArrays() {
  const rowsInput = document.getElementById("array-rows");
  const colsInput = document.getElementById("array-cols");
  const rowsValue = document.getElementById("array-rows-value");
  const colsValue = document.getElementById("array-cols-value");
  const totalText = document.getElementById("array-total");
  const grid = document.getElementById("array-grid");
  const swapBtn = document.getElementById("array-swap");
  if (!rowsInput || !colsInput || !grid) return;

  function renderGrid(rows, cols) {
    grid.innerHTML = "";
    grid.style.setProperty("--cols", cols);
    const total = rows * cols;
    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.className = "array-cell fade-in";
      grid.appendChild(cell);
    }
    rowsValue.textContent = rows.toString();
    colsValue.textContent = cols.toString();
    if (totalText) {
      totalText.textContent = total.toString();
    }
  }

  function handleChange() {
    const rows = Number(rowsInput.value);
    const cols = Number(colsInput.value);
    renderGrid(rows, cols);
  }

  swapBtn?.addEventListener("click", () => {
    const temp = rowsInput.value;
    rowsInput.value = colsInput.value;
    colsInput.value = temp;
    handleChange();
  });

  rowsInput.addEventListener("input", handleChange);
  colsInput.addEventListener("input", handleChange);
  handleChange();
}

function initFractionAddition() {
  const canvas = document.getElementById("fraction-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const replayBtn = document.getElementById("fraction-replay");

  const fractionTargets = {
    first: 5 / 8,
    second: 1 / 4,
    combined: 7 / 8
  };

  let progress = 0;
  let requestId;

  function drawFractionBar(x, y, width, height, segments, filledRatio, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#ffe0b2";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#ffb74d";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    const segWidth = width / segments;
    for (let i = 1; i < segments; i++) {
      ctx.beginPath();
      ctx.moveTo(segWidth * i, 0);
      ctx.lineTo(segWidth * i, height);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.stroke();
    }

    ctx.fillStyle = "#f06292";
    ctx.fillRect(0, 0, width * filledRatio, height);

    ctx.fillStyle = "#5d4037";
    ctx.font = "bold 14px Sans-Serif";
    ctx.fillText(label, width / 2 - ctx.measureText(label).width / 2, height + 18);
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const firstPhase = Math.min(progress / 0.35, 1);
    const secondPhase = Math.min(Math.max((progress - 0.35) / 0.35, 0), 1);
    const combinedPhase = Math.min(Math.max((progress - 0.7) / 0.3, 0), 1);

    drawFractionBar(30, 20, 160, 40, 8, fractionTargets.first * firstPhase, "第一块 5/8");
    drawFractionBar(230, 20, 160, 40, 4, fractionTargets.second * secondPhase, "第二块 1/4");

    ctx.save();
    ctx.translate(30, 120);
    ctx.fillStyle = "#fffde7";
    ctx.fillRect(0, 0, 360, 50);
    ctx.strokeStyle = "#ffecb3";
    ctx.strokeRect(0, 0, 360, 50);
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo((360 / 8) * i, 0);
      ctx.lineTo((360 / 8) * i, 50);
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.stroke();
    }
    ctx.fillStyle = "#ff8a65";
    ctx.fillRect(0, 0, 360 * fractionTargets.combined * combinedPhase, 50);
    ctx.fillStyle = "#5d4037";
    ctx.font = "bold 16px Sans-Serif";
    const text = `合计：7/8`;
    ctx.fillText(text, 180 - ctx.measureText(text).width / 2, 75);
    ctx.restore();
  }

  function step() {
    progress += 0.01;
    if (progress > 1) progress = 1;
    draw();
    if (progress < 1) {
      requestId = requestAnimationFrame(step);
    }
  }

  function startAnimation() {
    cancelAnimationFrame(requestId);
    progress = 0;
    step();
  }

  replayBtn?.addEventListener("click", startAnimation);
  startAnimation();
}

function initTimeConversion() {
  const slider = document.getElementById("days-slider");
  const daysValue = document.getElementById("days-value");
  const minutesTotal = document.getElementById("minutes-total");
  const hoursTotal = document.getElementById("hours-total");
  const daysTotal = document.getElementById("days-total");
  const timeBars = document.getElementById("time-bars");
  if (!slider || !timeBars) return;

  const sessions = [
    { name: "morning", minutes: 90 },
    { name: "afternoon", minutes: 45 },
    { name: "night", minutes: 12 }
  ];
  const dailyTotal = sessions.reduce((sum, s) => sum + s.minutes, 0);

  function formatHours(mins) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours} 小时 ${minutes} 分`;
  }

  function update() {
    const days = Number(slider.value);
    daysValue.textContent = days.toString();

    Array.from(timeBars.children).forEach((bar, index) => {
      const session = sessions[index];
      const percent = (session.minutes / dailyTotal) * 100;
      bar.style.flexBasis = `${percent}%`;
      bar.style.width = `${percent}%`;
    });

    minutesTotal.textContent = `每日 ${dailyTotal} 分钟`;
    hoursTotal.textContent = `≈ ${formatHours(dailyTotal)}`;
    const totalMinutes = dailyTotal * days;
    daysTotal.textContent = `${days} 天合计 ≈ ${formatHours(totalMinutes)}`;
  }

  slider.addEventListener("input", update);
  update();
}

function initMagnetExperiment() {
  const canvas = document.getElementById("magnet-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const modeSelect = document.getElementById("magnet-mode");
  const barrierSlider = document.getElementById("magnet-barrier");
  const barrierValue = document.getElementById("magnet-barrier-value");

  let mode = modeSelect?.value || "opposite";
  let barrier = Number(barrierSlider?.value || 2);

  function drawMagnet(x, y, width, height, colors, labels) {
    ctx.save();
    ctx.translate(x, y);
    const half = width / 2;
    ctx.fillStyle = colors[0];
    ctx.fillRect(-half, -height / 2, half, height);
    ctx.fillStyle = colors[1];
    ctx.fillRect(0, -height / 2, half, height);
    ctx.strokeStyle = "#263238";
    ctx.lineWidth = 2;
    ctx.strokeRect(-half, -height / 2, width, height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px Sans-Serif";
    ctx.fillText(labels[0], -half + 12, 6);
    ctx.fillText(labels[1], half - 26, 6);
    ctx.restore();
  }

  function drawFieldLines(opposite, spacing) {
    ctx.strokeStyle = opposite ? "rgba(33,150,243,0.8)" : "rgba(244,81,30,0.7)";
    ctx.lineWidth = 2;
    const baseY = canvas.height / 2;
    const leftX = canvas.width / 2 - spacing / 2;
    const rightX = canvas.width / 2 + spacing / 2;

    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      const offsetY = i * 20;
      if (opposite) {
        ctx.moveTo(leftX, baseY + offsetY);
        ctx.bezierCurveTo(
          leftX + spacing * 0.25,
          baseY - 60,
          rightX - spacing * 0.25,
          baseY - 60,
          rightX,
          baseY + offsetY
        );
      } else {
        ctx.moveTo(leftX, baseY + offsetY);
        ctx.bezierCurveTo(
          leftX - spacing * 0.4,
          baseY + offsetY - 80,
          leftX - spacing * 0.4,
          baseY + offsetY + 80,
          leftX,
          baseY + offsetY
        );
      }
      ctx.stroke();
    }

    if (!opposite) {
      ctx.strokeStyle = "rgba(33,150,243,0.35)";
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        const offsetY = i * 20;
        ctx.moveTo(rightX, baseY + offsetY);
        ctx.bezierCurveTo(
          rightX + spacing * 0.4,
          baseY + offsetY - 80,
          rightX + spacing * 0.4,
          baseY + offsetY + 80,
          rightX,
          baseY + offsetY
        );
        ctx.stroke();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const magnetWidth = 100;
    const magnetHeight = 60;
    const spacing = 120 + barrier * 3;
    const centerY = canvas.height / 2;

    drawFieldLines(mode === "opposite", spacing);

    drawMagnet(
      canvas.width / 2 - spacing / 2,
      centerY,
      magnetWidth,
      magnetHeight,
      ["#e53935", "#1e88e5"],
      mode === "opposite" ? ["N", "S"] : ["N", "N"]
    );
    drawMagnet(
      canvas.width / 2 + spacing / 2,
      centerY,
      magnetWidth,
      magnetHeight,
      ["#1e88e5", "#e53935"],
      mode === "opposite" ? ["S", "N"] : ["N", "N"]
    );

    // 隔层
    ctx.fillStyle = `rgba(158, 158, 158, ${Math.min(barrier / 12, 0.85)})`;
    const barrierWidth = Math.max(6, barrier * 2);
    ctx.fillRect(canvas.width / 2 - barrierWidth / 2, centerY - 70, barrierWidth, 140);

    ctx.fillStyle = "#37474f";
    ctx.font = "14px Sans-Serif";
    const label =
      mode === "opposite" ? "异极：磁力线连接两极" : "同极：磁力线向外扩散并相互排斥";
    ctx.fillText(label, canvas.width / 2 - ctx.measureText(label).width / 2, 25);
  }

  function update() {
    mode = modeSelect?.value || mode;
    barrier = Number(barrierSlider?.value || barrier);
    if (barrierValue) {
      barrierValue.textContent = barrier.toString();
    }
    draw();
  }

  modeSelect?.addEventListener("change", update);
  barrierSlider?.addEventListener("input", update);
  update();
}

function initPlantTranspiration() {
  const canvas = document.getElementById("plant-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const lightSlider = document.getElementById("plant-light");
  const humiditySlider = document.getElementById("plant-humidity");
  const lightValue = document.getElementById("plant-light-value");
  const humidityValue = document.getElementById("plant-humidity-value");

  let light = Number(lightSlider?.value || 3);
  let humidity = Number(humiditySlider?.value || 50);

  let particles = [];
  let bagDrops = 0;
  let lastTime = 0;

  function spawnParticle() {
    const baseX = canvas.width / 2;
    const leafY = canvas.height - 80;
    particles.push({
      x: baseX + (Math.random() - 0.5) * 80,
      y: leafY + Math.random() * 10,
      speed: 0.04 + Math.random() * 0.03,
      drift: (Math.random() - 0.5) * 0.04
    });
  }

  function update(dt) {
    const dryness = Math.max(0.2, 1 - humidity / 120);
    const rate = light * dryness * 0.6;
    for (let i = 0; i < rate; i++) {
      spawnParticle();
    }

    particles = particles.filter((p) => {
      p.y -= p.speed * dt * 15;
      p.x += Math.sin(p.y / 25) * p.drift * dt * 15;
      if (p.y < 80) {
        bagDrops = Math.min(100, bagDrops + 0.05 * light);
        return false;
      }
      return p.y > 0;
    });

    bagDrops *= 0.995; // 缓慢回落，模拟滴落
  }

  function drawPlant() {
    const stemX = canvas.width / 2;
    const baseY = canvas.height - 20;
    ctx.fillStyle = "#8bc34a";
    ctx.beginPath();
    ctx.moveTo(stemX - 8, baseY);
    ctx.quadraticCurveTo(stemX - 12, baseY - 80, stemX - 4, baseY - 150);
    ctx.quadraticCurveTo(stemX, baseY - 200, stemX + 6, baseY - 150);
    ctx.quadraticCurveTo(stemX + 14, baseY - 60, stemX + 4, baseY);
    ctx.closePath();
    ctx.fill();

    // 叶片
    ctx.fillStyle = "#66bb6a";
    ctx.beginPath();
    ctx.ellipse(stemX - 40, baseY - 110, 35, 18, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(stemX + 40, baseY - 120, 35, 18, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 塑料袋
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(stemX - 90, baseY - 150);
    ctx.quadraticCurveTo(stemX - 40, baseY - 220, stemX + 10, baseY - 220);
    ctx.quadraticCurveTo(stemX + 70, baseY - 210, stemX + 90, baseY - 150);
    ctx.lineTo(stemX + 70, baseY - 20);
    ctx.lineTo(stemX - 70, baseY - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#e1f5fe");
    gradient.addColorStop(1, "#c8e6c9");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 太阳
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(60, 50, 20 + light * 3, 0, Math.PI * 2);
    ctx.fill();

    drawPlant();

    // 水汽粒子
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 袋中水滴
    ctx.fillStyle = "#81d4fa";
    ctx.beginPath();
    const dropletHeight = bagDrops;
    ctx.ellipse(canvas.width / 2, canvas.height - 40, 50, dropletHeight / 4, 0, 0, Math.PI, true);
    ctx.fill();

    ctx.fillStyle = "#01579b";
    ctx.font = "14px Sans-Serif";
    ctx.fillText(
      `收集水量 ≈ ${(bagDrops / 5).toFixed(1)} mL`,
      canvas.width / 2 - 60,
      canvas.height - 10
    );
  }

  function loop(timestamp) {
    const dt = timestamp - lastTime || 16;
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function handleLightChange(event) {
    if (!event?.target) return;
    light = Number(event.target.value);
    if (lightValue) {
      lightValue.textContent = light.toString();
    }
  }

  function handleHumidityChange(event) {
    if (!event?.target) return;
    humidity = Number(event.target.value);
    if (humidityValue) {
      humidityValue.textContent = `${humidity}%`;
    }
  }

  lightSlider?.addEventListener("input", handleLightChange);
  humiditySlider?.addEventListener("input", handleHumidityChange);
  handleLightChange({ target: lightSlider });
  handleHumidityChange({ target: humiditySlider });
  requestAnimationFrame(loop);
}

function initTriangleAngleSum() {
  const canvas = document.getElementById("triangle-angle-canvas");
  const chipsLayer = document.getElementById("triangle-angle-chips");
  const foldBtn = document.getElementById("play-angle-fold");
  const caption = document.getElementById("triangle-angle-caption");
  if (!canvas || !canvas.getContext || !chipsLayer) return;

  const ctx = canvas.getContext("2d");
  const points = [
    { x: 70, y: 190 },
    { x: 210, y: 60 },
    { x: 310, y: 190 }
  ];

  const chipConfigs = [
    {
      label: "∠A",
      deg: 64,
      color: "#ff8a80",
      from: { x: 70, y: 190, rotate: -35 },
      to: { x: 120, y: 235, rotate: 0 }
    },
    {
      label: "∠B",
      deg: 92,
      color: "#7986cb",
      from: { x: 210, y: 70, rotate: 0 },
      to: { x: 190, y: 235, rotate: 0 }
    },
    {
      label: "∠C",
      deg: 24,
      color: "#4db6ac",
      from: { x: 315, y: 190, rotate: 34 },
      to: { x: 260, y: 235, rotate: 0 }
    }
  ];

  const chips = chipConfigs.map((cfg) => {
    const el = document.createElement("div");
    el.className = "angle-chip";
    el.innerHTML = `<span>${cfg.label}</span><strong>${cfg.deg}°</strong>`;
    el.style.setProperty("--chip-color", cfg.color);
    chipsLayer.appendChild(el);
    return { el, cfg };
  });

  function drawTriangle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#e3f2fd");
    bg.addColorStop(1, "#fafafa");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#c8e6c9";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    const triGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    triGradient.addColorStop(0, "#90caf9");
    triGradient.addColorStop(1, "#1e88e5");
    ctx.fillStyle = triGradient;
    ctx.strokeStyle = "#0d47a1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const arcs = [
      { center: points[0], radius: 28, start: Math.PI * 0.8, end: Math.PI * 1.2, color: "#ff8a80" },
      { center: points[1], radius: 28, start: Math.PI * 1.1, end: Math.PI * 1.9, color: "#7986cb" },
      { center: points[2], radius: 28, start: Math.PI * -0.2, end: Math.PI * 0.2, color: "#4db6ac" }
    ];
    arcs.forEach((arc) => {
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(arc.center.x, arc.center.y, arc.radius, arc.start, arc.end);
      ctx.stroke();
    });
  }

  let aligned = false;

  function applyChipPositions() {
    chips.forEach(({ el, cfg }) => {
      const target = aligned ? cfg.to : cfg.from;
      el.style.left = `${target.x}px`;
      el.style.top = `${target.y}px`;
      el.style.transform = `translate(-50%, -50%) rotate(${target.rotate || 0}deg)`;
    });
    if (caption) {
      caption.textContent = aligned
        ? "三个角像拼图一样排成直线，总和 180°。"
        : "点击按钮，把三角形的三个角剪下并拖去拼放。";
    }
    if (foldBtn) {
      foldBtn.textContent = aligned ? "复位三角形" : "折叠成一条直线";
    }
  }

  foldBtn?.addEventListener("click", () => {
    aligned = !aligned;
    applyChipPositions();
  });

  drawTriangle();
  applyChipPositions();
}

function initPlaceValueMachine() {
  const slider = document.getElementById("place-value-slider");
  const numberInput = document.getElementById("place-value-input");
  const randomBtn = document.getElementById("place-value-random");
  const grid = document.getElementById("place-value-grid");
  const summary = document.getElementById("place-value-summary");
  if (!slider || !numberInput || !grid || !summary) return;

  const places = [
    { id: "thousand", label: "千位", unit: 1000, color: "#ff8a80" },
    { id: "hundred", label: "百位", unit: 100, color: "#ffb74d" },
    { id: "ten", label: "十位", unit: 10, color: "#4dd0e1" },
    { id: "one", label: "个位", unit: 1, color: "#7e57c2" }
  ];

  grid.innerHTML = places
    .map(
      (place) => `
      <div class="place-column" data-place="${place.id}">
        <header>
          <span class="place-label">${place.label}</span>
          <span class="place-unit">× ${place.unit}</span>
        </header>
        <div class="place-token-wrap"></div>
      </div>
    `
    )
    .join("");

  function render(value) {
    const safeValue = Math.max(0, Math.min(9999, Number(value) || 0));
    slider.value = safeValue.toString();
    numberInput.value = safeValue.toString();
    const digits = {
      thousand: Math.floor(safeValue / 1000),
      hundred: Math.floor((safeValue % 1000) / 100),
      ten: Math.floor((safeValue % 100) / 10),
      one: safeValue % 10
    };
    const terms = [];
    places.forEach((place) => {
      const wrap = grid.querySelector(
        `.place-column[data-place="${place.id}"] .place-token-wrap`
      );
      if (!wrap) return;
      wrap.innerHTML = "";
      const count = digits[place.id];
      for (let i = 0; i < count; i++) {
        const token = document.createElement("span");
        token.className = "place-token";
        token.style.setProperty("--token-color", place.color);
        token.textContent = place.label[0];
        token.style.animationDelay = `${i * 60}ms`;
        wrap.appendChild(token);
      }
      if (count > 0) {
        terms.push(`${count} × ${place.unit}`);
      }
    });
    summary.textContent = terms.length
      ? `${safeValue} = ${terms.join(" + ")}`
      : "这个数没有千位或百位，也是一种拆分。";
  }

  slider.addEventListener("input", (event) => render(event?.target?.value));
  numberInput.addEventListener("input", (event) => render(event?.target?.value));
  randomBtn?.addEventListener("click", () => {
    const randomValue = Math.floor(Math.random() * 10000);
    render(randomValue);
  });

  render(Number(slider.value || 0));
}

function initProbabilitySpinner() {
  const canvas = document.getElementById("spinner-canvas");
  const spinBtn = document.getElementById("spin-btn");
  const resultText = document.getElementById("spin-result");
  const statsEl = document.getElementById("spin-stats");
  if (!canvas || !canvas.getContext || !spinBtn || !statsEl) return;

  const ctx = canvas.getContext("2d");
  const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
  const pointerAngle = -Math.PI / 2;
  const segments = [
    { label: "蓝色 2 份", color: "#42a5f5", weight: 2 },
    { label: "黄色 3 份", color: "#ffeb3b", weight: 3 },
    { label: "粉色 1 份", color: "#f48fb1", weight: 1 },
    { label: "绿色 2 份", color: "#81c784", weight: 2 }
  ];
  const totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0);
  let rotation = 0;
  let startRotation = 0;
  let targetRotation = 0;
  let spinning = false;
  let animStart = 0;
  let currentTarget = null;
  const counts = new Map();
  segments.forEach((seg) => counts.set(seg.label, 0));
  let total = 0;

  const segmentAngles = segments.map((seg, index) => {
    const previousAngle = segments
      .slice(0, index)
      .reduce((sum, item) => sum + (item.weight / totalWeight) * Math.PI * 2, 0);
    const angleSize = (seg.weight / totalWeight) * Math.PI * 2;
    return { ...seg, start: previousAngle, end: previousAngle + angleSize };
  });

  function drawSpinner() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation);
    segmentAngles.forEach((seg) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.fillStyle = seg.color;
      ctx.arc(0, 0, radius, seg.start, seg.end);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.rotate((seg.start + seg.end) / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#263238";
      ctx.font = "bold 13px Sans-Serif";
      ctx.fillText(seg.label, radius * 0.6, 0);
      ctx.restore();
    });
    ctx.restore();

    ctx.fillStyle = "#546e7a";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 12, 10);
    ctx.lineTo(canvas.width / 2 + 12, 10);
    ctx.lineTo(canvas.width / 2, 44);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  function updateStats() {
    const rows = segments
      .map((seg) => {
        const count = counts.get(seg.label) || 0;
        const rate = total ? ((count / total) * 100).toFixed(1) : "0.0";
        return `<li>${seg.label}：<strong>${count}</strong> 次（${rate}%）</li>`;
      })
      .join("");
    statsEl.innerHTML = `<ul class="spin-stats-list">${rows}</ul>`;
  }

  function animate(timestamp) {
    if (!spinning) {
      drawSpinner();
      return;
    }
    if (!animStart) {
      animStart = timestamp;
    }
    const duration = 2600;
    const progress = Math.min(1, (timestamp - animStart) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    rotation = startRotation + (targetRotation - startRotation) * eased;
    drawSpinner();
    if (progress < 1) {
      requestAnimationFrame(animate);
      return;
    }
    rotation = targetRotation;
    spinning = false;
    animStart = 0;
    if (currentTarget) {
      total += 1;
      counts.set(currentTarget.label, (counts.get(currentTarget.label) || 0) + 1);
      updateStats();
      if (resultText) {
        resultText.textContent = `结果：${currentTarget.label}`;
      }
    }
  }

  function spin() {
    if (spinning) return;
    const r = Math.random() * totalWeight;
    let accumulated = 0;
    let selected = segmentAngles[0];
    for (const seg of segmentAngles) {
      accumulated += seg.weight;
      if (r <= accumulated) {
        selected = seg;
        break;
      }
    }
    const randomAngle = selected.start + Math.random() * (selected.end - selected.start);
    const angleNow = randomAngle + rotation;
    let delta = pointerAngle - angleNow;
    const circle = Math.PI * 2;
    delta = ((delta % circle) + circle) % circle;
    const extraTurns = circle * 2 + Math.random() * circle;
    startRotation = rotation;
    targetRotation = rotation + delta + extraTurns;
    spinning = true;
    animStart = 0;
    currentTarget = selected;
    requestAnimationFrame(animate);
  }

  spinBtn.addEventListener("click", spin);
  updateStats();
  drawSpinner();
}

function initSpeedDistance() {
  const distanceInput = document.getElementById("distance-input");
  const timeInput = document.getElementById("time-input");
  const distanceValue = document.getElementById("distance-value");
  const timeValue = document.getElementById("time-value");
  const startBtn = document.getElementById("start-speed-run");
  const track = document.getElementById("speed-track");
  const car = document.getElementById("speed-car");
  const progressBar = document.getElementById("speed-progress");
  const info = document.getElementById("speed-info");
  if (!distanceInput || !timeInput || !track || !car) return;

  function updateLabels() {
    if (distanceValue) distanceValue.textContent = `${distanceInput.value} 米`;
    if (timeValue) timeValue.textContent = `${timeInput.value} 秒`;
    const time = Number(timeInput.value);
    const distance = Number(distanceInput.value);
    if (info) {
      if (time > 0) {
        info.textContent = `平均速度 ≈ ${(distance / time).toFixed(1)} 米/秒`;
      } else {
        info.textContent = "设置跑道参数再点击开始。";
      }
    }
  }

  function playRun() {
    const distance = Math.max(10, Number(distanceInput.value));
    const time = Math.max(1, Number(timeInput.value));
    const duration = Math.max(1500, time * 180);
    const trackWidth = track.clientWidth - car.clientWidth;
    car.style.transition = "none";
    car.style.transform = "translateX(0)";
    if (progressBar) {
      progressBar.style.transition = "none";
      progressBar.style.width = "0%";
    }
    void car.offsetWidth;
    requestAnimationFrame(() => {
      car.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      car.style.transform = `translateX(${trackWidth}px)`;
      if (progressBar) {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = "100%";
      }
      if (info) {
        const speedValue = distance / time;
        info.textContent = `跑完 ${distance} 米用时 ${time} 秒，平均速度 ≈ ${speedValue.toFixed(2)} m/s`;
      }
    });
  }

  distanceInput.addEventListener("input", updateLabels);
  timeInput.addEventListener("input", updateLabels);
  startBtn?.addEventListener("click", playRun);
  updateLabels();
}

function initSymmetryFolding() {
  const canvas = document.getElementById("symmetry-canvas");
  const foldBtn = document.getElementById("symmetry-fold");
  const changeBtn = document.getElementById("symmetry-change");
  const label = document.getElementById("symmetry-shape-name");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const shapes = [
    {
      name: "叶子",
      color: "#66bb6a",
      drawLeft(drawCtx) {
        drawCtx.beginPath();
        drawCtx.moveTo(0, -80);
        drawCtx.bezierCurveTo(-100, -40, -100, 40, 0, 80);
        drawCtx.closePath();
        drawCtx.fillStyle = this.color;
        drawCtx.fill();
      }
    },
    {
      name: "风筝",
      color: "#29b6f6",
      drawLeft(drawCtx) {
        drawCtx.beginPath();
        drawCtx.moveTo(0, -90);
        drawCtx.lineTo(-70, 0);
        drawCtx.lineTo(0, 90);
        drawCtx.closePath();
        drawCtx.fillStyle = this.color;
        drawCtx.fill();
        drawCtx.strokeStyle = "rgba(0,0,0,0.2)";
        drawCtx.stroke();
      }
    },
    {
      name: "蝴蝶翅膀",
      color: "#f48fb1",
      drawLeft(drawCtx) {
        drawCtx.beginPath();
        drawCtx.moveTo(0, -60);
        drawCtx.bezierCurveTo(-140, -80, -120, 20, 0, 30);
        drawCtx.bezierCurveTo(-130, 50, -70, 110, 0, 70);
        drawCtx.closePath();
        drawCtx.fillStyle = this.color;
        drawCtx.fill();
      }
    }
  ];

  let shapeIndex = 0;
  let progress = 0;
  let target = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#e8eaf6");
    grad.addColorStop(1, "#fff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#9fa8da";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10);
    ctx.lineTo(canvas.width / 2, canvas.height - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    const shape = shapes[shapeIndex];
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    shape.drawLeft(ctx);
    ctx.restore();

    if (progress > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(canvas.width / 2, 0, (canvas.width / 2) * progress, canvas.height);
      ctx.clip();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(-1, 1);
      shape.drawLeft(ctx);
      ctx.restore();
    }

    if (label) {
      label.textContent = `${shape.name} · 折叠完成 ${Math.round(progress * 100)}%`;
    }
  }

  function loop() {
    progress += (target - progress) * 0.08;
    if (Math.abs(target - progress) < 0.001) {
      progress = target;
    }
    draw();
    requestAnimationFrame(loop);
  }

  foldBtn?.addEventListener("click", () => {
    target = target > 0.5 ? 0 : 1;
    foldBtn.textContent = target > 0.5 ? "展开一半" : "继续折叠";
  });

  changeBtn?.addEventListener("click", () => {
    shapeIndex = (shapeIndex + 1) % shapes.length;
    target = 0;
  });

  loop();
}

function initPlanetOrbits() {
  const canvas = document.getElementById("orbit-canvas");
  const speedSlider = document.getElementById("orbit-speed");
  const speedValue = document.getElementById("orbit-speed-value");
  const toggleBtn = document.getElementById("orbit-toggle");
  const info = document.getElementById("orbit-info");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const planets = [
    { name: "水星", radius: 50, size: 5, period: 0.24, color: "#ffcc80" },
    { name: "金星", radius: 90, size: 7, period: 0.62, color: "#ffab91" },
    { name: "地球", radius: 130, size: 8, period: 1, color: "#64b5f6" },
    { name: "火星", radius: 170, size: 6, period: 1.88, color: "#ef9a9a" }
  ];

  let speedFactor = Number(speedSlider?.value || 1);
  let lastTime = 0;
  let elapsed = 0;
  let running = true;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    gradient.addColorStop(0, "#212121");
    gradient.addColorStop(1, "#000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.3;
    planets.forEach((planet) => {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, planet.radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    planets.forEach((planet) => {
      const baseDuration = 8000;
      const angle = ((elapsed * speedFactor) / (planet.period * baseDuration)) * Math.PI * 2;
      const x = canvas.width / 2 + Math.cos(angle) * planet.radius;
      const y = canvas.height / 2 + Math.sin(angle) * planet.radius;
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(x, y, planet.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop(timestamp) {
    if (!lastTime) {
      lastTime = timestamp;
    }
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    if (running) {
      elapsed += dt;
    }
    draw();
    requestAnimationFrame(loop);
  }

  function updateInfo() {
    if (!info) return;
    const rows = planets
      .map((planet) => {
        const days = (planet.period * 365).toFixed(0);
        return `<li>${planet.name}：约 ${days} 天绕太阳一圈</li>`;
      })
      .join("");
    info.innerHTML = `<ul class="orbit-info-list">${rows}</ul>`;
  }

  speedSlider?.addEventListener("input", (event) => {
    speedFactor = Number(event?.target?.value) || 1;
    if (speedValue) {
      speedValue.textContent = `${speedFactor.toFixed(1)} ×`;
    }
  });

  toggleBtn?.addEventListener("click", () => {
    running = !running;
    toggleBtn.textContent = running ? "暂停公转" : "继续公转";
  });

  updateInfo();
  if (speedValue) {
    speedValue.textContent = `${speedFactor.toFixed(1)} ×`;
  }
  draw();
  requestAnimationFrame(loop);
}

function initSoundWaves() {
  const canvas = document.getElementById("sound-wave-canvas");
  const freqSlider = document.getElementById("sound-frequency");
  const ampSlider = document.getElementById("sound-amplitude");
  const freqValue = document.getElementById("sound-frequency-value");
  const ampValue = document.getElementById("sound-amplitude-value");
  const info = document.getElementById("sound-wave-info");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  let frequency = Number(freqSlider?.value || 4);
  let amplitude = Number(ampSlider?.value || 30);
  let phase = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const center = canvas.height / 2;
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#cfd8dc";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, center);
    ctx.lineTo(canvas.width, center);
    ctx.stroke();

    ctx.strokeStyle = "#ff7043";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x++) {
      const y = center + Math.sin((x + phase) * (frequency * 0.03)) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(255,112,67,0.2)";
    ctx.beginPath();
    ctx.moveTo(0, center);
    for (let x = 0; x <= canvas.width; x++) {
      const y = center + Math.sin((x + phase) * (frequency * 0.03)) * amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, center);
    ctx.closePath();
    ctx.fill();
  }

  function loop() {
    phase += frequency * 0.5;
    draw();
    requestAnimationFrame(loop);
  }

  function updateInfo() {
    if (freqValue) freqValue.textContent = `${frequency} Hz`;
    if (ampValue) ampValue.textContent = `${amplitude.toFixed(0)} px`;
    if (info) {
      info.textContent = "调节频率与振幅，观察波峰的疏密与高度变化。";
    }
  }

  freqSlider?.addEventListener("input", (event) => {
    frequency = Number(event?.target?.value) || frequency;
    updateInfo();
  });
  ampSlider?.addEventListener("input", (event) => {
    amplitude = Number(event?.target?.value) || amplitude;
    updateInfo();
  });

  updateInfo();
  draw();
  requestAnimationFrame(loop);
}

function initParticleStates() {
  const canvas = document.getElementById("particle-state-canvas");
  const slider = document.getElementById("particle-temperature");
  const valueEl = document.getElementById("particle-temperature-value");
  const info = document.getElementById("particle-state-info");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;
  const sections = [
    { name: "固态", start: 0, end: width / 3, color: "#90caf9" },
    { name: "液态", start: width / 3, end: (width / 3) * 2, color: "#80cbc4" },
    { name: "气态", start: (width / 3) * 2, end: width, color: "#ffe082" }
  ];

  const particles = [];
  sections.forEach((section, index) => {
    const count = index === 0 ? 24 : 28;
    for (let i = 0; i < count; i++) {
      const span = section.end - section.start;
      const x = section.start + 20 + Math.random() * (span - 40);
      const y = 40 + Math.random() * (height - 80);
      particles.push({
        type: index === 0 ? "solid" : index === 1 ? "liquid" : "gas",
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
  });

  let temperature = Number(slider?.value || 2);
  let lastTime = 0;

  function drawBackground() {
    sections.forEach((section) => {
      ctx.fillStyle = `${section.color}22`;
      ctx.fillRect(section.start, 0, section.end - section.start, height);
      ctx.fillStyle = "#37474f";
      ctx.font = "bold 14px Sans-Serif";
      ctx.fillText(section.name, section.start + 12, 20);
    });
  }

  function updateParticles(dt) {
    const tempFactor = temperature / 3;
    particles.forEach((p) => {
      if (p.type === "solid") {
        p.phase += dt * 0.005 * tempFactor;
        p.x = p.baseX + Math.sin(p.phase) * 3 * tempFactor;
        p.y = p.baseY + Math.cos(p.phase) * 3 * tempFactor;
      } else {
        const section = p.type === "liquid" ? sections[1] : sections[2];
        const speed = p.type === "gas" ? 0.08 : 0.04;
        p.x += p.vx * dt * (speed * temperature + 0.05);
        p.y += p.vy * dt * (speed * temperature + 0.05);
        const minX = section.start + 12;
        const maxX = section.end - 12;
        if (p.x < minX || p.x > maxX) {
          p.vx *= -1;
          p.x = Math.max(minX, Math.min(maxX, p.x));
        }
        const minY = 30;
        const maxY = height - 30;
        if (p.y < minY || p.y > maxY) {
          p.vy *= -1;
          p.y = Math.max(minY, Math.min(maxY, p.y));
        }
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    ctx.fillStyle = "#263238";
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop(timestamp) {
    if (!lastTime) {
      lastTime = timestamp;
    }
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    updateParticles(dt);
    draw();
    requestAnimationFrame(loop);
  }

  slider?.addEventListener("input", (event) => {
    temperature = Number(event?.target?.value) || temperature;
    if (valueEl) {
      valueEl.textContent = `${temperature} 级`;
    }
    if (info) {
      info.textContent =
        temperature >= 4
          ? "温度高时，液态和气态粒子更活跃，运动范围变大。"
          : "温度低时，固态粒子几乎只在原位振动。";
    }
  });

  if (valueEl) {
    valueEl.textContent = `${temperature} 级`;
  }
  if (info) {
    info.textContent = "拖动温度滑块，对比三种物态的运动。";
  }
  requestAnimationFrame(loop);
}

function initArithmeticStaircase() {
  const a1Input = document.getElementById("arith-a1");
  const dInput = document.getElementById("arith-d");
  const nInput = document.getElementById("arith-n");
  const bars = document.getElementById("arith-bars");
  const sumEl = document.getElementById("arith-sum");
  const nDisplay = document.getElementById("arith-n-display");
  if (!a1Input || !dInput || !nInput || !bars) return;

  function render() {
    const a1 = Number(a1Input.value);
    const d = Number(dInput.value);
    const n = Number(nInput.value);
    const terms = Array.from({ length: n }, (_, i) => a1 + i * d);
    const maxAbs = Math.max(1, ...terms.map((t) => Math.abs(t)));
    const sum = terms.reduce((acc, cur) => acc + cur, 0);

    bars.innerHTML = "";
    terms.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.className = "stair-bar";
      bar.dataset.value = value.toFixed(1).replace(/\.0$/, "");
      bar.dataset.label = `a${index + 1}`;
      bar.style.height = "0%";
      bars.appendChild(bar);
      requestAnimationFrame(() => {
        setTimeout(() => {
          const heightPercent = Math.max(8, (Math.abs(value) / maxAbs) * 95);
          bar.style.height = `${heightPercent}%`;
          bar.classList.add("show-value");
        }, index * 120);
      });
    });

    sumEl && (sumEl.textContent = sum.toFixed(1).replace(/\.0$/, ""));
    nDisplay && (nDisplay.textContent = `${n}`);
  }

  [a1Input, dInput, nInput].forEach((input) => input?.addEventListener("input", render));
  render();
}

function initCircleMeasures() {
  const slider = document.getElementById("circle-radius");
  const canvas = document.getElementById("circle-canvas");
  const perimeterEl = document.getElementById("circle-perimeter");
  const areaEl = document.getElementById("circle-area");
  if (!slider || !canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  let progress = 0;
  let animId;

  function draw(radius, progressValue) {
    const scale = 8;
    const r = radius * scale;
    const center = { x: canvas.width / 2, y: canvas.height / 2 + 10 };
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // area fill
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
    ctx.arc(center.x, center.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progressValue);
    ctx.closePath();
    ctx.fill();

    // outline
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.arc(center.x, center.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progressValue);
    ctx.stroke();

    ctx.fillStyle = "#111827";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`r = ${radius} cm`, center.x, center.y + r + 24);
  }

  function updateText(radius) {
    const perimeter = 2 * Math.PI * radius;
    const area = Math.PI * radius * radius;
    perimeterEl && (perimeterEl.textContent = perimeter.toFixed(2));
    areaEl && (areaEl.textContent = area.toFixed(2));
  }

  function animate() {
    cancelAnimationFrame(animId);
    progress = 0;
    const radius = Number(slider.value);
    updateText(radius);
    const step = () => {
      progress += 0.018;
      if (progress > 1) progress = 1;
      draw(radius, progress);
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    step();
  }

  slider.addEventListener("input", animate);
  animate();
}

function initParallelogramRectangle() {
  const baseInput = document.getElementById("para-base");
  const heightInput = document.getElementById("para-height");
  const leftPiece = document.querySelector(".para-piece-left");
  const rightPiece = document.querySelector(".para-piece-right");
  const shape = document.getElementById("para-shape");
  const rect = document.getElementById("para-rect");
  const playBtn = document.getElementById("para-play");
  const areaEl = document.getElementById("para-area");
  if (!baseInput || !heightInput || !leftPiece || !rightPiece || !shape || !rect) return;

  let baseVal = Number(baseInput.value);
  let heightVal = Number(heightInput.value);
  let leftWidth = 60;

  function applySize() {
    baseVal = Number(baseInput.value);
    heightVal = Number(heightInput.value);
    const widthPx = 30 + baseVal * 14;
    const heightPx = 20 + heightVal * 14;
    leftWidth = Math.max(40, widthPx * 0.3);
    const rightWidth = Math.max(50, widthPx - leftWidth);

    shape.style.width = `${widthPx}px`;
    shape.style.height = `${heightPx}px`;
    leftPiece.style.width = `${leftWidth}px`;
    rightPiece.style.width = `${rightWidth}px`;
    rightPiece.style.left = `${leftWidth}px`;
    rect.style.height = `${heightPx}px`;
    rect.style.width = `0px`;
    rect.style.opacity = "0";
    leftPiece.style.transform = "translateX(0)";

    if (areaEl) {
      areaEl.textContent = (baseVal * heightVal).toFixed(1).replace(/\.0$/, "");
    }
  }

  function play() {
    leftPiece.style.transform = `translateX(${Math.max(0, shape.clientWidth - leftWidth)}px)`;
    setTimeout(() => {
      rect.style.opacity = "1";
      rect.style.width = `${shape.clientWidth}px`;
    }, 220);
  }

  baseInput.addEventListener("input", applySize);
  heightInput.addEventListener("input", applySize);
  playBtn?.addEventListener("click", play);
  applySize();
}

function initLightReflection() {
  const slider = document.getElementById("light-angle");
  const canvas = document.getElementById("light-canvas");
  if (!slider || !canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  function draw(angleDeg) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const center = { x: canvas.width / 2, y: canvas.height * 0.65 };
    const len = 140;
    const normalVec = { x: 0, y: -1 };
    const incVec = {
      x: -Math.sin(angleRad) * len,
      y: normalVec.y * Math.cos(angleRad) * len
    };
    const refVec = {
      x: Math.sin(angleRad) * len,
      y: normalVec.y * Math.cos(angleRad) * len
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // mirror
    ctx.beginPath();
    ctx.moveTo(center.x, 20);
    ctx.lineTo(center.x, canvas.height - 20);
    ctx.strokeStyle = "#64748b";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 3;
    ctx.stroke();

    // normal
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x, center.y - len * 0.9);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // incident ray
    ctx.beginPath();
    ctx.moveTo(center.x + incVec.x, center.y + incVec.y);
    ctx.lineTo(center.x, center.y);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.stroke();

    // reflected ray
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + refVec.x, center.y + refVec.y);
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`入射角 ${angleDeg}°`, center.x - 120, center.y - 12);
    ctx.fillText(`反射角 ${angleDeg}°`, center.x + 30, center.y - 12);
  }

  slider.addEventListener("input", (event) => {
    const angle = Number(event?.target?.value) || 30;
    draw(angle);
  });
  draw(Number(slider.value));
}

function initBuoyancyTank() {
  const slider = document.getElementById("buoy-density");
  const block = document.getElementById("buoy-block");
  const ratioEl = document.getElementById("buoy-ratio");
  const tank = block?.parentElement;
  if (!slider || !block || !tank) return;

  const waterDensity = 1.0;
  const baseHeight = block.clientHeight || 80;

  function update() {
    const density = Number(slider.value);
    const submergeRatio = Math.min(1, density / waterDensity);
    const exposed = Math.max(0, 1 - submergeRatio);
    const heightPx = baseHeight * (0.65 + 0.35 * submergeRatio);
    block.style.height = `${heightPx}px`;

    const waterTop = tank.clientHeight * 0.35;
    const waterBottom = tank.clientHeight - 8;
    const submergedHeight = heightPx * submergeRatio;
    const topPosition = Math.min(
      waterBottom - heightPx,
      waterTop + submergedHeight - heightPx
    );
    block.style.top = `${topPosition}px`;

    if (ratioEl) {
      ratioEl.textContent = `${Math.round(exposed * 100)}%`;
    }
  }

  slider.addEventListener("input", update);
  update();
}

function initSunShadow() {
  const slider = document.getElementById("sun-angle");
  const sun = document.getElementById("sun-dot");
  const shadow = document.getElementById("shadow");
  const shadowLengthEl = document.getElementById("shadow-length");
  if (!slider || !sun || !shadow) return;

  const poleHeightMeters = 4;
  const pixelsPerMeter = 30;

  function update(angleDeg) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const lengthMeters = poleHeightMeters / Math.tan(angleRad);
    const lengthPx = Math.min(320, Math.max(10, lengthMeters * pixelsPerMeter));
    shadow.style.width = `${lengthPx}px`;
    shadow.style.transform = `rotate(${Math.max(5, 90 - angleDeg)}deg)`;

    const arcRadius = 120;
    const center = { x: 120, y: 220 };
    sun.style.left = `${center.x + arcRadius * Math.cos(angleRad)}px`;
    sun.style.top = `${center.y - arcRadius * Math.sin(angleRad)}px`;

    shadowLengthEl && (shadowLengthEl.textContent = lengthMeters.toFixed(2));
  }

  slider.addEventListener("input", (event) => {
    const value = Number(event?.target?.value) || 30;
    update(value);
  });
  update(Number(slider.value));
}

function initEnergyPyramid() {
  const slider = document.getElementById("energy-input");
  const bars = {
    producer: document.getElementById("energy-producer"),
    primary: document.getElementById("energy-primary"),
    secondary: document.getElementById("energy-secondary"),
    tertiary: document.getElementById("energy-tertiary")
  };
  const values = {
    producer: document.getElementById("energy-producer-value"),
    primary: document.getElementById("energy-primary-value"),
    secondary: document.getElementById("energy-secondary-value"),
    tertiary: document.getElementById("energy-tertiary-value")
  };
  if (!slider) return;

  function update() {
    const baseEnergy = Number(slider.value);
    const energies = [baseEnergy, baseEnergy * 0.1, baseEnergy * 0.01, baseEnergy * 0.001];
    const labels = ["producer", "primary", "secondary", "tertiary"];
    labels.forEach((label, index) => {
      const widthPercent = Math.max(4, (energies[index] / baseEnergy) * 100);
      if (bars[label]) {
        bars[label].style.width = `${widthPercent}%`;
      }
      if (values[label]) {
        values[label].textContent = `${energies[index].toFixed(1)} kJ`;
      }
    });
  }

  slider.addEventListener("input", update);
  update();
}

function initEarthRotation() {
  const speedSlider = document.getElementById("earth-speed");
  const playBtn = document.getElementById("earth-play");
  const terminator = document.getElementById("terminator");
  const earth = document.getElementById("earth");
  if (!speedSlider || !playBtn || !terminator || !earth) return;

  let speed = Number(speedSlider.value);
  let playing = true;
  let angle = 0;
  let last = 0;

  function loop(timestamp) {
    if (!last) last = timestamp;
    const delta = timestamp - last;
    last = timestamp;
    if (playing) {
      angle = (angle + delta * 0.018 * speed) % 360;
      terminator.style.transform = `translateX(-50%) rotate(${angle}deg)`;
      earth.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }
    requestAnimationFrame(loop);
  }

  speedSlider.addEventListener("input", (event) => {
    speed = Number(event?.target?.value) || 1;
  });

  playBtn.addEventListener("click", () => {
    playing = !playing;
  });

  requestAnimationFrame(loop);
}
