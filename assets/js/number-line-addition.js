// 数轴加法小兔跳格子互动
const numberLineState = {
  start: 0,
  steps: 0,
  answer: 0,
  isAnimating: false
};

function initNumberLineGame() {
  const questionEl = document.getElementById("nl-question");
  const bunnyEl = document.getElementById("nl-bunny");
  const trackEl = document.getElementById("nl-track");
  const startBtn = document.getElementById("nl-start");
  const submitBtn = document.getElementById("nl-submit");
  const inputEl = document.getElementById("nl-input");
  const feedbackEl = document.getElementById("nl-feedback");

  if (!questionEl || !bunnyEl || !trackEl) return;

  const generate = () => {
    const start = Math.floor(Math.random() * 10); // 0-9
    let steps = Math.floor(Math.random() * 8) + 2; // 2-9
    // 控制结果不超过 20
    if (start + steps > 20) steps = 20 - start;
    numberLineState.start = start;
    numberLineState.steps = steps;
    numberLineState.answer = start + steps;
    numberLineState.isAnimating = false;
    questionEl.textContent = `小兔从 ${start} 出发，向右跳 ${steps} 格，会跳到哪里？`;
    inputEl.value = "";
    feedbackEl.textContent = "";
    setBunnyPosition(bunnyEl, start);
  };

  const setBunnyPosition = (el, value) => {
    const clamped = Math.max(0, Math.min(20, value));
    const percent = (clamped / 20) * 100;
    el.style.left = `${percent}%`;
    el.style.transform = "translateX(-50%)";
  };

  const animateHop = () => {
    if (numberLineState.isAnimating) return;
    numberLineState.isAnimating = true;
    feedbackEl.textContent = "正在跳格子...";
    const start = numberLineState.start;
    const end = numberLineState.answer;
    let current = start;
    const stepTime = 300;

    const hop = () => {
      current += 1;
      setBunnyPosition(bunnyEl, current);
      if (current < end) {
        setTimeout(hop, stepTime);
      } else {
        numberLineState.isAnimating = false;
        feedbackEl.textContent = `跳到了 ${end}！试着在下方输入答案。`;
      }
    };

    setTimeout(hop, stepTime);
  };

  startBtn?.addEventListener("click", () => {
    animateHop();
  });

  submitBtn?.addEventListener("click", () => {
    const user = parseInt(inputEl.value, 10);
    if (Number.isNaN(user)) {
      feedbackEl.textContent = "请输入数字答案哦。";
      return;
    }
    if (user === numberLineState.answer) {
      feedbackEl.textContent = `答对了！${numberLineState.start} + ${numberLineState.steps} = ${numberLineState.answer}`;
      feedbackEl.className = "feedback correct";
    } else {
      feedbackEl.textContent = `再想一想，小兔实际跳到了 ${numberLineState.answer}。`;
      feedbackEl.className = "feedback incorrect";
    }
  });

  generate();
}

document.addEventListener("DOMContentLoaded", initNumberLineGame);
