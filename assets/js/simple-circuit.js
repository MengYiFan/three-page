// 简单电路闭合/断开演示
function initSimpleCircuit() {
  const circuit = document.getElementById("circuit-demo");
  const btn = document.getElementById("circuit-toggle");
  const status = document.getElementById("circuit-status");
  const hint = document.getElementById("circuit-hint");

  if (!circuit || !btn) return;

  let isClosed = false;

  const render = () => {
    circuit.classList.toggle("circuit-on", isClosed);
    status.textContent = isClosed ? "电路已闭合，小灯泡亮了！" : "电路断开，小灯泡熄灭。";
    hint.textContent = isClosed
      ? "思考：如果再串联一个小灯，会更亮还是更暗？"
      : "思考：如何把断开的地方重新接好？";
    btn.textContent = isClosed ? "断开电路" : "闭合电路";
  };

  btn.addEventListener("click", () => {
    isClosed = !isClosed;
    render();
  });

  render();
}

document.addEventListener("DOMContentLoaded", initSimpleCircuit);
