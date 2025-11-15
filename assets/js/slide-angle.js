// 角度与滑滑梯安全性交互脚本

const slideAngleState = {
  currentDifficulty: null,
  currentAngle: null
};

const angleElements = {};

function initSlideAnglePage() {
  angleElements.difficultyButtons = document.querySelectorAll(
    ".difficulty-btn"
  );
  angleElements.difficultySelect =
    document.getElementById("difficulty-select");
  angleElements.generateButton = document.getElementById("generate-angle");
  angleElements.slideBoard = document.getElementById("slide-board");
  angleElements.slideChild = document.querySelector(".slide-child");
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

  setupSlideAngleListeners();
  if (angleElements.generateButton) {
    angleElements.generateButton.disabled = true;
  }

  if (angleElements.slideChild) {
    angleElements.slideChild.addEventListener("animationend", (e) => {
      if (e.animationName === "slide-down") {
        angleElements.slideChild.classList.remove("sliding");
      }
    });
  }
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

  if (angleElements.slideBoard) {
    angleElements.slideBoard.style.transform = "rotate(-25deg)";
  }
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
  if (angleElements.slideBoard) {
    angleElements.slideBoard.style.transform = `rotate(${-angle}deg)`;
  }
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

function triggerSlideAnimation() {
  if (!angleElements.slideChild) return;
  angleElements.slideChild.classList.remove("sliding");
  // 触发重绘以便重新播放动画
  void angleElements.slideChild.offsetWidth;
  angleElements.slideChild.classList.add("sliding");
}

document.addEventListener("DOMContentLoaded", initSlideAnglePage);
