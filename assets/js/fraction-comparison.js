// 分数大小比较互动
const fractionState = {
  fracA: { n: 1, d: 2 },
  fracB: { n: 1, d: 3 },
  mode: "same-den"
};

function initFractionCompare() {
  const barA = document.getElementById("frac-a");
  const barB = document.getElementById("frac-b");
  const labelA = document.getElementById("frac-label-a");
  const labelB = document.getElementById("frac-label-b");
  const generateBtn = document.getElementById("frac-generate");
  const biggerA = document.getElementById("frac-choose-a");
  const biggerB = document.getElementById("frac-choose-b");
  const feedback = document.getElementById("frac-feedback");

  if (!barA || !barB) return;

  const render = () => {
    const { fracA, fracB } = fractionState;
    const valueA = fracA.n / fracA.d;
    const valueB = fracB.n / fracB.d;
    barA.style.width = `${valueA * 100}%`;
    barB.style.width = `${valueB * 100}%`;
    labelA.textContent = `${fracA.n}/${fracA.d}`;
    labelB.textContent = `${fracB.n}/${fracB.d}`;
    feedback.textContent = "点击上面的按钮，选择你认为更大的分数。";
    feedback.className = "feedback";
  };

  const randomSameDen = () => {
    const d = [4, 6, 8, 10][Math.floor(Math.random() * 4)];
    let n1 = Math.floor(Math.random() * (d - 1)) + 1;
    let n2 = Math.floor(Math.random() * (d - 1)) + 1;
    while (n2 === n1) n2 = Math.floor(Math.random() * (d - 1)) + 1;
    return [
      { n: n1, d },
      { n: n2, d }
    ];
  };

  const randomSameNum = () => {
    const n = [1, 2, 3][Math.floor(Math.random() * 3)];
    let d1 = Math.floor(Math.random() * 6) + 3;
    let d2 = Math.floor(Math.random() * 6) + 3;
    while (d2 === d1) d2 = Math.floor(Math.random() * 6) + 3;
    return [
      { n, d: d1 },
      { n, d: d2 }
    ];
  };

  const generate = () => {
    fractionState.mode = Math.random() > 0.5 ? "same-den" : "same-num";
    const pair =
      fractionState.mode === "same-den" ? randomSameDen() : randomSameNum();
    [fractionState.fracA, fractionState.fracB] = pair;
    render();
  };

  const check = (pick) => {
    const { fracA, fracB } = fractionState;
    const valueA = fracA.n / fracA.d;
    const valueB = fracB.n / fracB.d;
    const correct = valueA === valueB ? "equal" : valueA > valueB ? "A" : "B";
    if (correct === "equal") {
      feedback.textContent = "两个分数一样大哦！";
      feedback.className = "feedback correct";
      return;
    }
    if (pick === correct) {
      feedback.textContent = "答对了！想想为什么这个更大？";
      feedback.className = "feedback correct";
    } else {
      feedback.textContent =
        correct === "A"
          ? "其实左边更大，因为它占的整体比例更高。"
          : "其实右边更大，观察它填充的宽度。";
      feedback.className = "feedback incorrect";
    }
  };

  generateBtn?.addEventListener("click", generate);
  biggerA?.addEventListener("click", () => check("A"));
  biggerB?.addEventListener("click", () => check("B"));

  generate();
}

document.addEventListener("DOMContentLoaded", initFractionCompare);
