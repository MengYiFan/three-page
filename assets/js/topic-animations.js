// 统一的 3D 互动动画脚本（除滑滑梯与地球自转外的全部 topic）

let threePromise = null;

function ensureThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (!threePromise) {
    threePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/three@0.161.0/build/three.min.js";
      script.onload = () => resolve(window.THREE);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return threePromise;
}

function ensureStage(id, fallbackSelector = ".viz-card") {
  let container = document.getElementById(id);
  if (!container) {
    const host = document.querySelector(fallbackSelector) || document.querySelector(".main-content") || document.body;
    container = document.createElement("div");
    container.id = id;
    container.className = "three-stage";
    host.prepend(container);
  } else {
    container.classList.add("three-stage");
  }
  return container;
}

function getOrCreateButton(id, label, anchor) {
  let btn = document.getElementById(id);
  if (!btn) {
    btn = document.createElement("button");
    btn.id = id;
    btn.type = "button";
    btn.className = "btn btn-small ghost";
    btn.textContent = label;
    (anchor || document.querySelector(".viz-card") || document.querySelector(".main-content") || document.body).appendChild(btn);
  }
  return btn;
}

function createPlaySpace(containerId, options = {}) {
  const container = ensureStage(containerId, options.hostSelector);
  if (!container) return Promise.resolve(null);

  return ensureThree().then((THREE) => {
    const width = container.clientWidth || container.offsetWidth || 760;
    const height = options.height || Math.max(320, Math.floor(width * (options.aspect || 9 / 16)));

    container.innerHTML = "";
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(options.background || 0xf5f7fb);

    const camera = new THREE.PerspectiveCamera(options.fov || 45, width / height, 0.1, 200);
    const pos = options.cameraPos || [0, 8, 16];
    camera.position.set(pos[0], pos[1], pos[2]);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(6, 12, 6);
    scene.add(dir);

    if (options.showGrid !== false) {
      const grid = new THREE.GridHelper(40, 20, 0xcfd8dc, 0xe0e0e0);
      grid.position.y = 0;
      scene.add(grid);
    }

    const clock = new THREE.Clock();
    const updaters = [];

    function resize() {
      const w = container.clientWidth || width;
      const h = options.height || Math.max(320, Math.floor(w * (options.aspect || 9 / 16)));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);

    function render() {
      requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      updaters.forEach((fn) => fn(delta, elapsed));
      renderer.render(scene, camera);
    }
    render();

    return { THREE, scene, camera, renderer, updaters, container };
  });
}

function addGroundPlane({ THREE, scene }, color = 0xffffff, size = 24) {
  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.01;
  scene.add(mesh);
  return mesh;
}

const makePulse = (mesh, strength = 0.2, speed = 2) => (delta, elapsed) => {
  const scale = 1 + Math.sin(elapsed * speed) * strength;
  mesh.scale.set(scale, scale, scale);
};

const spin = (mesh, speed = 0.6) => (delta) => {
  mesh.rotation.y += speed * delta;
};

const gentleBob = (mesh, base, axis = "y") => (delta, elapsed) => {
  const offset = Math.sin(elapsed * 1.8) * 0.25;
  mesh.position[axis] = base + offset;
};

function spreadRing({ THREE, scene }, radius, count, color) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const geo = new THREE.SphereGeometry(0.25, 12, 12);
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(angle) * radius, 0.25, Math.sin(angle) * radius);
    group.add(mesh);
  }
  scene.add(group);
  return group;
}

function updateValueText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}


function initAverageJump() {
  const info = document.getElementById("average-info");
  const replayBtn = getOrCreateButton("replay-average", "重新播放跳跃", document.querySelector(".viz-card"));
  const data = [
    { name: "小雅", value: 96, color: 0x4fc3f7 },
    { name: "小俊", value: 84, color: 0xffb74d },
    { name: "小敏", value: 90, color: 0x81c784 },
    { name: "小杰", value: 110, color: 0xf06292 }
  ];
  const average = data.reduce((s, v) => s + v.value, 0) / data.length;
  const max = Math.max(...data.map((d) => d.value));

  createPlaySpace("average-chart", { cameraPos: [0, 7, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 26);

    const avgLine = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.12, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x3f51b5, transparent: true, opacity: 0.6 })
    );
    avgLine.position.y = (average / max) * 6 + 0.5;
    scene.add(avgLine);

    const jumpers = data.map((item, idx) => {
      const barHeight = (item.value / max) * 6 + 0.4;
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, barHeight, 1.2),
        new THREE.MeshStandardMaterial({ color: item.color })
      );
      bar.position.set(-4.5 + idx * 3, barHeight / 2, 0);
      scene.add(bar);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: item.color, emissiveIntensity: 0.2 })
      );
      head.position.set(bar.position.x, barHeight + 0.6, 0);
      scene.add(head);

      const ropeMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.9, 0.06, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.1, roughness: 0.6 })
      );
      ropeMesh.position.set(head.position.x, 0.5, 0);
      ropeMesh.rotation.x = Math.PI / 2;
      scene.add(ropeMesh);

      return { head, rope: ropeMesh, peak: barHeight + 1.6 };
    });

    function playJump() {
      updaters.length = 0;
      jumpers.forEach((jumper, idx) => {
        updaters.push((delta, elapsed) => {
          const t = elapsed * 2.2 + idx * 0.6;
          const jump = Math.abs(Math.sin(t)) * 1.2;
          jumper.head.position.y = jumper.peak + jump;
          jumper.rope.rotation.z = Math.sin(t) * Math.PI * 0.4;
        });
      });
      if (info) {
        const above = data.filter((d) => d.value >= average).map((d) => d.name).join("、");
        const below = data.filter((d) => d.value < average).map((d) => d.name).join("、");
        info.textContent = `平均 ${average.toFixed(1)} 次/分；高于平均：${above}，低于平均：${below || "无"}`;
      }
    }

    playJump();
    replayBtn.addEventListener("click", playJump);
  });
}

function initFractionPizza() {
  const replayBtn = getOrCreateButton("replay-pizza", "重新切分披萨", document.querySelector(".viz-card"));
  createPlaySpace("pizza-canvas", { cameraPos: [0, 7, 14], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 26);

    const pizzas = [
      { total: 8, eaten: 5, center: [-3, 0, 0], color: 0xffb74d },
      { total: 6, eaten: 3, center: [4, 0, 0], color: 0xff8a65 }
    ];

    const slices = [];

    pizzas.forEach((pizza) => {
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(3.6, 3.6, 0.1, 48),
        new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.1 })
      );
      plate.position.set(pizza.center[0], 0.05, pizza.center[2]);
      scene.add(plate);

      for (let i = 0; i < pizza.total; i++) {
        const slice = new THREE.Mesh(
          new THREE.CylinderGeometry(3, 3, 0.6, 24, 1, false, (Math.PI * 2 * i) / pizza.total, (Math.PI * 2) / pizza.total),
          new THREE.MeshStandardMaterial({ color: pizza.color, emissive: pizza.color, emissiveIntensity: 0.15 })
        );
        slice.position.set(pizza.center[0], 0.5, pizza.center[2]);
        scene.add(slice);
        slices.push({ mesh: slice, pizza, index: i });
      }
    });

    function updateSlices(progress = 1) {
      slices.forEach((slice) => {
        const shouldHide = slice.index < slice.pizza.eaten;
        const height = shouldHide ? Math.max(0.05, 0.6 * (1 - progress)) : 0.6;
        slice.mesh.scale.y = height / 0.6;
        slice.mesh.material.opacity = shouldHide ? Math.max(0.2, 1 - progress) : 1;
        slice.mesh.material.transparent = shouldHide;
      });
    }

    let playTime = 0;
    updaters.push((delta) => {
      playTime = Math.min(1, playTime + delta * 0.5);
      updateSlices(playTime);
    });

    function replay() {
      playTime = 0;
      updateSlices(0);
    }

    replayBtn.addEventListener("click", replay);
  });
}

function initRectanglePlayground() {
  const lengthInput = document.getElementById("rect-length");
  const widthInput = document.getElementById("rect-width");
  createPlaySpace("rect-visual", { cameraPos: [8, 8, 16] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 30);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.4, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x607d8b })
    );
    frame.scale.set(12, 1, 8);
    frame.position.y = 0.2;
    scene.add(frame);

    const fill = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x81c784, transparent: true, opacity: 0.8 })
    );
    fill.position.y = 0.3;
    scene.add(fill);

    function updateRect() {
      const length = Number(lengthInput?.value || 12);
      const width = Number(widthInput?.value || 8);
      frame.scale.set(length, 1, width);
      fill.scale.set(length - 0.4, 1, width - 0.4);
      updateValueText("rect-length-value", length.toString());
      updateValueText("rect-width-value", width.toString());
      updateValueText("rect-perimeter", `周长：${(length + width) * 2} 米`);
      updateValueText("rect-area", `面积：${length * width} 平方米`);
    }

    updateRect();
    [lengthInput, widthInput].forEach((input) => input?.addEventListener("input", updateRect));
    updaters.push(makePulse(fill, 0.05, 1.5));
  });
}

function initLeverSimulation() {
  const weightInput = document.getElementById("lever-weight");
  const posInput = document.getElementById("lever-position");
  const status = document.getElementById("lever-status");
  createPlaySpace("lever-canvas", { cameraPos: [0, 6, 14], hostSelector: ".lever-canvas-wrapper" }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 26);

    const fulcrum = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 1.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
    );
    fulcrum.position.y = 0.8;
    scene.add(fulcrum);

    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x90caf9, metalness: 0.1, roughness: 0.6 })
    );
    plank.position.y = 1.2;
    scene.add(plank);

    const left = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xffb74d })
    );
    left.position.set(-4, 1.8, 0);
    scene.add(left);

    const right = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x4db6ac })
    );
    scene.add(right);

    function updateLever() {
      const weight = Number(weightInput?.value || 2);
      const position = Number(posInput?.value || 40);
      const leftTorque = 4 * 40;
      const rightTorque = weight * position;
      const tilt = (rightTorque - leftTorque) / 400;
      plank.rotation.z = tilt * 0.4;
      right.position.set((position - 40) / 5, 1.8 + tilt * 0.8, 0);
      left.position.y = 1.8 - tilt * 0.8;
      updateValueText("lever-weight-value", weight.toString());
      updateValueText("lever-position-value", position.toString());
      if (status) {
        status.textContent = Math.abs(rightTorque - leftTorque) < 5 ? "状态：接近平衡" : rightTorque > leftTorque ? "状态：右侧更重" : "状态：左侧更重";
      }
    }

    updateLever();
    [weightInput, posInput].forEach((el) => el?.addEventListener("input", updateLever));
    updaters.push(gentleBob(left, left.position.y));
    updaters.push(gentleBob(right, right.position.y));
  });
}

function initWaterCycle() {
  const sliderId = "water-energy";
  let energyControl = document.getElementById(sliderId);
  if (!energyControl) {
    const bar = document.createElement("div");
    bar.className = "control-row";
    bar.innerHTML = `<label>阳光强度</label><input id="${sliderId}" type="range" min="0.2" max="2" step="0.1" value="1">`;
    (document.querySelector(".water-scene") || document.querySelector(".viz-card") || document.querySelector(".main-content"))?.appendChild(bar);
    energyControl = bar.querySelector("input");
  }

  createPlaySpace("water-canvas", { cameraPos: [0, 8, 15], background: 0xe3f2fd }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xbbdefb, 26);

    const ocean = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 1, 48),
      new THREE.MeshStandardMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.7 })
    );
    ocean.position.set(-4, 0.5, -1);
    scene.add(ocean);

    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    cloud.position.set(3.5, 3.4, 0);
    scene.add(cloud);

    const droplets = [];
    for (let i = 0; i < 70; i++) {
      const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x29b6f6, emissive: 0x29b6f6, emissiveIntensity: 0.3 })
      );
      drop.position.set(-4 + Math.random() * 2 - 1, 0.2 + Math.random(), -1 + Math.random() * 2 - 1);
      scene.add(drop);
      droplets.push(drop);
    }

    const rains = [];
    for (let i = 0; i < 50; i++) {
      const rain = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x0277bd })
      );
      rain.position.set(3.5 + Math.random() * 1.5 - 0.75, 3 + Math.random() * 1, Math.random() * 2 - 1);
      scene.add(rain);
      rains.push(rain);
    }

    updaters.push((delta, elapsed) => {
      const energy = Number(energyControl?.value || 1);
      droplets.forEach((drop, idx) => {
        drop.position.y += delta * energy * 0.8;
        if (drop.position.y > 2.6) drop.position.y = 0.1;
        drop.position.x += Math.sin(elapsed * 0.5 + idx) * 0.002;
      });
      rains.forEach((rain) => {
        rain.position.y -= delta * (1 + energy * 0.8);
        if (rain.position.y < 0) rain.position.y = 3.2;
      });
      cloud.scale.setScalar(1 + Math.min(0.6, energy * 0.3));
    });
  });
}


function initPythagorasDemo() {
  createPlaySpace("pythagoras-board", { cameraPos: [0, 9, 18] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 28);

    const tri = new THREE.Mesh(
      new THREE.ConeGeometry(6, 0.4, 3),
      new THREE.MeshStandardMaterial({ color: 0x90a4ae, transparent: true, opacity: 0.8 })
    );
    tri.rotation.x = -Math.PI / 2;
    tri.position.y = 0.2;
    scene.add(tri);

    const squares = [
      { color: 0xff8a65, size: 6, pos: [-4.5, 0.21, -4.5] },
      { color: 0x4fc3f7, size: 8, pos: [4.5, 0.21, -4.5] },
      { color: 0x81c784, size: 10, pos: [0, 0.21, 5] }
    ];

    squares.forEach((s) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(s.size, 0.3, s.size),
        new THREE.MeshStandardMaterial({ color: s.color, transparent: true, opacity: 0.75 })
      );
      mesh.position.set(s.pos[0], s.pos[1], s.pos[2]);
      scene.add(mesh);
      updaters.push(makePulse(mesh, 0.04, 1.8));
    });
  });
}

function initMultiplicationArrays() {
  const rowsInput = document.getElementById("array-rows");
  const colsInput = document.getElementById("array-cols");
  const swapBtn = document.getElementById("array-swap") || getOrCreateButton("array-swap", "行列互换", document.querySelector(".viz-card"));
  const totalEl = document.getElementById("array-total");
  const rowsValue = document.getElementById("array-rows-value");
  const colsValue = document.getElementById("array-cols-value");

  createPlaySpace("array-grid", { cameraPos: [6, 10, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 24);

    let group = new THREE.Group();
    scene.add(group);

    function rebuild(rows, cols) {
      scene.remove(group);
      group.children.forEach((c) => c.geometry?.dispose?.());
      group = new THREE.Group();
      scene.add(group);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xffc107, emissive: 0xffb300, emissiveIntensity: 0.35 })
          );
          mesh.position.set((c - cols / 2) * 1.3, 0.35, (r - rows / 2) * 1.3);
          mesh.userData.base = mesh.position.clone();
          group.add(mesh);
        }
      }

      if (rowsValue) rowsValue.textContent = rows;
      if (colsValue) colsValue.textContent = cols;
      if (totalEl) totalEl.textContent = rows * cols;
    }

    function readAndApply() {
      const rows = Number(rowsInput?.value || 4);
      const cols = Number(colsInput?.value || 5);
      rebuild(rows, cols);
    }

    updaters.push((delta, elapsed) => {
      group.children.forEach((fruit, idx) => {
        const pulse = 1 + Math.sin(elapsed * 2 + idx) * 0.05;
        fruit.scale.setScalar(pulse);
        fruit.position.y = 0.35 + Math.abs(Math.sin(elapsed * 1.5 + idx)) * 0.2;
      });
    });

    readAndApply();
    rowsInput?.addEventListener("input", readAndApply);
    colsInput?.addEventListener("input", readAndApply);
    swapBtn?.addEventListener("click", () => {
      if (rowsInput && colsInput) {
        const r = rowsInput.value;
        rowsInput.value = colsInput.value;
        colsInput.value = r;
      }
      readAndApply();
    });
  });
}

function initFractionAddition() {
  const playBtn = getOrCreateButton("fraction-merge", "通分并合并", document.querySelector(".viz-card"));
  createPlaySpace("fraction-bars", { cameraPos: [0, 7, 14], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 22);

    const barA = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.85 })
    );
    barA.position.set(0, 0.5, -1.4);
    scene.add(barA);

    const barB = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xffb74d, transparent: true, opacity: 0.85 })
    );
    barB.position.set(0, 0.5, 1.4);
    scene.add(barB);

    const result = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.6, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x81c784, transparent: true, opacity: 0.3 })
    );
    result.position.set(0, 0.6, 0);
    scene.add(result);

    function merge() {
      result.material.opacity = 0.3;
      updaters.push((delta) => {
        result.material.opacity = Math.min(0.95, result.material.opacity + delta);
      });
      barA.position.x = -1.5;
      barB.position.x = 1.5;
      updaters.push((delta) => {
        barA.position.x = Math.min(0, barA.position.x + delta * 2);
        barB.position.x = Math.max(0, barB.position.x - delta * 2);
      });
    }

    merge();
    playBtn.addEventListener("click", merge);
  });
}

function initTimeConversion() {
  const daysSlider = document.getElementById("days-slider");
  const daysValue = document.getElementById("days-value");
  const minutesTotal = document.getElementById("minutes-total");
  const hoursTotal = document.getElementById("hours-total");
  const daysTotal = document.getElementById("days-total");

  createPlaySpace("time-scene", { cameraPos: [0, 7, 12], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 22);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 0.3, 48),
      new THREE.MeshStandardMaterial({ color: 0xe0f2f1 })
    );
    plate.position.y = 0.15;
    scene.add(plate);

    const hourHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x00796b })
    );
    hourHand.position.y = 1.2;
    scene.add(hourHand);

    const minuteHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 3.2, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xff7043 })
    );
    minuteHand.position.y = 1.6;
    scene.add(minuteHand);

    function updateTotals() {
      const days = Number(daysSlider?.value || 7);
      const daily = 147;
      const totalMinutes = daily * days;
      if (daysValue) daysValue.textContent = days;
      if (minutesTotal) minutesTotal.textContent = `每日 ${daily} 分钟`;
      if (hoursTotal) hoursTotal.textContent = `≈ ${(daily / 60).toFixed(2)} 小时`;
      if (daysTotal) daysTotal.textContent = `${days} 天合计 ≈ ${(totalMinutes / 60).toFixed(1)} 小时`;

      const hours = Math.floor((daily % 720) / 60);
      const mins = daily % 60;
      hourHand.rotation.y = (Math.PI * 2 * (hours + mins / 60)) / 12;
      minuteHand.rotation.y = (Math.PI * 2 * mins) / 60;
      updateValueText("time-digital", `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
    }

    daysSlider?.addEventListener("input", updateTotals);
    updaters.push(spin(plate, 0.2));
    updateTotals();
  });
}

function initMagnetExperiment() {
  const btn = getOrCreateButton("magnet-pulse", "吸附实验", document.querySelector(".viz-card"));
  const mode = document.getElementById("magnet-mode");
  const barrier = document.getElementById("magnet-barrier");
  const barrierValue = document.getElementById("magnet-barrier-value");
  createPlaySpace("magnet-canvas", { cameraPos: [0, 8, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 24);

    const magnet = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.4, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0xc62828, metalness: 0.4, roughness: 0.4 })
    );
    magnet.position.set(-2.4, 1, 0);
    scene.add(magnet);

    const nails = [];
    for (let i = 0; i < 12; i++) {
      const nail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 1, 8),
        new THREE.MeshStandardMaterial({ color: 0x90a4ae })
      );
      nail.position.set(2 + Math.random() * 3, 0.5, Math.random() * 2 - 1);
      scene.add(nail);
      nails.push(nail);
    }

    const field = spreadRing(ctx, 3.6, 24, 0x29b6f6);

    function pulse() {
      const barrierScale = 1 - Math.min(1, Number(barrier?.value || 0) / 12);
      if (barrierValue) barrierValue.textContent = barrier?.value || "0";
      updaters.push((delta, elapsed) => {
        field.children.forEach((sphere, idx) => {
          sphere.position.y = 0.25 + Math.sin(elapsed * 2 + idx) * 0.2 * barrierScale;
        });
        nails.forEach((nail) => {
          const attract = mode?.value === "same" ? -1 : 1;
          const force = attract * barrierScale * 0.8;
          nail.position.x += (-1.6 - nail.position.x) * delta * force;
          nail.position.y = 0.5 + (1.8 - nail.position.x) * 0.05 * attract;
        });
      });
    }

    pulse();
    btn.addEventListener("click", pulse);
    barrier?.addEventListener("input", pulse);
    mode?.addEventListener("change", pulse);
  });
}

function initPlantTranspiration() {
  const sliderId = "transpiration-speed";
  let slider = document.getElementById(sliderId);
  if (!slider) {
    const wrap = document.createElement("div");
    wrap.className = "control-row";
    wrap.innerHTML = `<label>阳光</label><input id="${sliderId}" type="range" min="0.5" max="2" step="0.1" value="1">`;
    (document.querySelector(".viz-card") || document.querySelector(".main-content"))?.appendChild(wrap);
    slider = wrap.querySelector("input");
  }

  createPlaySpace("transpiration-canvas", { cameraPos: [0, 9, 14], background: 0xe8f5e9 }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xc8e6c9, 24);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 5, 12),
      new THREE.MeshStandardMaterial({ color: 0x66bb6a })
    );
    stem.position.y = 2.5;
    scene.add(stem);

    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 24, 24, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x81c784, transparent: true, opacity: 0.8 })
    );
    leaf.rotation.z = Math.PI / 2;
    leaf.position.set(0, 3.5, 0);
    scene.add(leaf);

    const droplets = [];
    for (let i = 0; i < 60; i++) {
      const d = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x4fc3f7, emissive: 0x4fc3f7, emissiveIntensity: 0.5 })
      );
      d.position.set((Math.random() - 0.5) * 3, 2.2 + Math.random() * 1.4, (Math.random() - 0.5) * 1.4);
      scene.add(d);
      droplets.push(d);
    }

    updaters.push((delta, elapsed) => {
      const speed = Number(slider?.value || 1);
      droplets.forEach((d) => {
        d.position.y += delta * speed * 0.8;
        if (d.position.y > 6) d.position.y = 2 + Math.random();
      });
      leaf.scale.setScalar(1 + Math.sin(elapsed) * 0.02 * speed);
    });
  });
}

function initTriangleAngleSum() {
  const foldBtn = getOrCreateButton("triangle-fold", "折叠角度", document.querySelector(".viz-card"));
  createPlaySpace("triangle-canvas", { cameraPos: [0, 8, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 24);

    const triangle = new THREE.Mesh(
      new THREE.ConeGeometry(5, 0.2, 3),
      new THREE.MeshStandardMaterial({ color: 0x90caf9, transparent: true, opacity: 0.7 })
    );
    triangle.rotation.x = -Math.PI / 2;
    triangle.position.y = 0.2;
    scene.add(triangle);

    const wedges = [
      { color: 0xff8a65, pos: [-2.5, 0.25, -2.5] },
      { color: 0x4dd0e1, pos: [2.5, 0.25, -2.5] },
      { color: 0x9575cd, pos: [0, 0.25, 3] }
    ].map((w) => {
      const wedge = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.4, 0.4, 32, 1, false, -Math.PI / 2, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: w.color })
      );
      wedge.position.set(w.pos[0], w.pos[1], w.pos[2]);
      scene.add(wedge);
      return wedge;
    });

    function fold() {
      updaters.push((delta) => {
        wedges[0].rotation.y = Math.min(Math.PI / 2, wedges[0].rotation.y + delta * 1.2);
        wedges[1].rotation.y = Math.min(Math.PI / 2, wedges[1].rotation.y + delta * 1.2);
        wedges[2].rotation.y = Math.max(0, wedges[2].rotation.y - delta * 1.2);
      });
    }

    foldBtn.addEventListener("click", fold);
  });
}

function initPlaceValueMachine() {
  const slider = document.getElementById("place-value-slider");
  const input = document.getElementById("place-value-input");
  const randomBtn = document.getElementById("place-value-random") || getOrCreateButton("place-value-random", "随机一个数字", document.querySelector(".viz-card"));
  const summary = document.getElementById("place-value-summary");

  createPlaySpace("place-value-grid", { cameraPos: [0, 8, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 26);

    const belts = [
      { x: -4, color: 0xffb74d },
      { x: 0, color: 0x4fc3f7 },
      { x: 4, color: 0x81c784 },
      { x: 8, color: 0xba68c8 }
    ];

    const balls = belts.map((belt, idx) => {
      const track = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: belt.color, transparent: true, opacity: 0.5 })
      );
      track.position.set(belt.x, 0.2, 0);
      scene.add(track);

      const group = [];
      for (let i = 0; i < 10; i++) {
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(idx >= 2 ? 0.6 : 0.45, 14, 14),
          new THREE.MeshStandardMaterial({ color: belt.color, emissive: belt.color, emissiveIntensity: 0.25 })
        );
        ball.position.set(belt.x + (Math.random() - 0.5) * 1.4, 0.6, -3 + i * 0.65);
        scene.add(ball);
        group.push(ball);
      }
      return group;
    });

    function applyValue(num) {
      const n = Math.max(0, Math.min(9999, Math.floor(num)));
      if (slider) slider.value = String(n);
      if (input) input.value = String(n);

      const digits = [Math.floor(n / 1000), Math.floor((n % 1000) / 100), Math.floor((n % 100) / 10), n % 10];
      belts.forEach((belt, idx) => {
        const count = digits[idx];
        balls[idx].forEach((ball, i) => {
          ball.visible = i < count;
          ball.position.z = -3 + i * 0.65;
        });
      });

      if (summary) {
        summary.textContent = `${n} = ${digits[0]}×1000 + ${digits[1]}×100 + ${digits[2]}×10 + ${digits[3]}`;
      }
    }

    slider?.addEventListener("input", (e) => applyValue(Number(e?.target?.value || 0)));
    input?.addEventListener("input", (e) => applyValue(Number(e?.target?.value || 0)));
    randomBtn?.addEventListener("click", () => {
      const val = Math.floor(Math.random() * 10000);
      applyValue(val);
    });

    updaters.push((delta, elapsed) => {
      balls.flat().forEach((ball, idx) => {
        if (!ball.visible) return;
        ball.position.y = 0.6 + Math.sin(elapsed * 2 + idx) * 0.05;
      });
    });

    applyValue(Number(slider?.value || 3578));
  });
}

function initProbabilitySpinner() {
  const spinBtn = getOrCreateButton("spin-wheel", "旋转转盘", document.querySelector(".viz-card"));
  createPlaySpace("spinner-canvas", { cameraPos: [0, 8, 14], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 22);

    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: 0xfff59d, emissive: 0xfff59d, emissiveIntensity: 0.3 })
    );
    wheel.rotation.x = Math.PI / 2;
    wheel.position.y = 0.8;
    scene.add(wheel);

    const pointer = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe53935 })
    );
    pointer.position.set(0, 2.2, 0);
    scene.add(pointer);

    let angular = 0;
    updaters.push((delta) => {
      wheel.rotation.y += angular * delta;
      angular = Math.max(0, angular - delta * 0.6);
    });

    spinBtn.addEventListener("click", () => {
      angular = 3 + Math.random();
    });
  });
}

function initSpeedDistance() {
  const distanceInput = document.getElementById("distance-input");
  const timeInput = document.getElementById("time-input");
  const startBtn = document.getElementById("start-speed-run") || getOrCreateButton("start-speed-run", "开始跑道", document.querySelector(".viz-card"));
  const distanceValue = document.getElementById("distance-value");
  const timeValue = document.getElementById("time-value");
  const info = document.getElementById("speed-info");
  const progress = document.getElementById("speed-progress");

  createPlaySpace("speed-track", { cameraPos: [0, 7, 16] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 30);

    const car = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.8, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x42a5f5, metalness: 0.3 })
    );
    car.position.y = 0.6;
    scene.add(car);

    let runTime = Number(timeInput?.value || 30);
    let distance = Number(distanceInput?.value || 180);
    let elapsedRun = 0;
    let running = false;

    function updateLabels() {
      if (distanceValue) distanceValue.textContent = `${distance} 米`;
      if (timeValue) timeValue.textContent = `${runTime} 秒`;
      if (info) info.textContent = `速度 = 距离 ÷ 时间 = ${(distance / runTime).toFixed(2)} m/s`;
    }

    function startRun() {
      elapsedRun = 0;
      running = true;
    }

    distanceInput?.addEventListener("input", (e) => {
      distance = Number(e?.target?.value || distance);
      updateLabels();
    });
    timeInput?.addEventListener("input", (e) => {
      runTime = Number(e?.target?.value || runTime);
      updateLabels();
    });
    startBtn?.addEventListener("click", startRun);

    updaters.push((delta) => {
      if (!running) return;
      elapsedRun += delta;
      const t = Math.min(1, elapsedRun / runTime);
      car.position.x = -6 + 12 * t;
      car.rotation.y = Math.sin(t * Math.PI) * 0.2;
      if (progress) progress.style.width = `${t * 100}%`;
      if (t >= 1) running = false;
    });

    updateLabels();
  });
}

function initSymmetryFolding() {
  const foldBtn = getOrCreateButton("fold-paper", "对折纸张", document.querySelector(".viz-card"));
  createPlaySpace("symmetry-paper", { cameraPos: [0, 8, 12], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 20);

    const left = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: 0x90caf9, transparent: true, opacity: 0.7 })
    );
    left.position.set(-2.1, 0.1, 0);
    scene.add(left);

    const right = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: 0xffcc80, transparent: true, opacity: 0.7 })
    );
    right.position.set(2.1, 0.1, 0);
    scene.add(right);

    function fold() {
      updaters.push((delta) => {
        left.rotation.z = Math.max(-Math.PI, left.rotation.z - delta * 2);
        right.rotation.z = Math.min(Math.PI, right.rotation.z + delta * 2);
      });
    }

    foldBtn.addEventListener("click", fold);
  });
}

function initPlanetOrbits() {
  const accel = getOrCreateButton("orbit-boost", "加速公转", document.querySelector(".viz-card"));
  createPlaySpace("orbit-stage", { cameraPos: [0, 10, 18], background: 0x0d47a1, showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xffca28, emissive: 0xffb300, emissiveIntensity: 0.8 })
    );
    scene.add(sun);

    const planets = [
      { radius: 4, speed: 0.6, color: 0x81d4fa },
      { radius: 7, speed: 0.4, color: 0x9575cd },
      { radius: 10, speed: 0.25, color: 0xffab91 }
    ].map((p) => {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 18, 18),
        new THREE.MeshStandardMaterial({ color: p.color })
      );
      scene.add(body);
      return { ...p, body };
    });

    let boost = 1;
    accel.addEventListener("click", () => {
      boost = boost === 1 ? 2 : 1;
    });

    updaters.push((delta, elapsed) => {
      planets.forEach((p, idx) => {
        const angle = elapsed * p.speed * boost + idx;
        p.body.position.set(Math.cos(angle) * p.radius, 0.6, Math.sin(angle) * p.radius);
        p.body.scale.x = 1 + Math.sin(angle) * 0.05;
      });
    });
  });
}

function initSoundWaves() {
  const clapBtn = getOrCreateButton("sound-clap", "拍手/鼓点", document.querySelector(".viz-card"));
  createPlaySpace("sound-canvas", { cameraPos: [0, 7, 14], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 22);

    const rings = [];
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1 + i * 0.8, 0.06, 12, 60),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x29b6f6 : 0xff7043, transparent: true, opacity: 0.4 })
      );
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      rings.push(ring);
    }

    function pulse() {
      updaters.push((delta, elapsed) => {
        rings.forEach((ring, idx) => {
          const scale = 1 + ((elapsed * 0.8 + idx * 0.15) % 2);
          ring.scale.setScalar(scale);
          ring.material.opacity = Math.max(0, 0.6 - (scale - 1) * 0.3);
        });
      });
    }

    pulse();
    clapBtn.addEventListener("click", pulse);
  });
}

function initParticleStates() {
  createPlaySpace("particle-canvas", { cameraPos: [0, 7, 14], background: 0xeceff1 }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 20);

    const states = [
      { center: [-4, 0.4, 0], spread: 0.4, color: 0x8d6e63, speed: 0.5 },
      { center: [0, 0.4, 0], spread: 1, color: 0x4db6ac, speed: 1.2 },
      { center: [4, 0.4, 0], spread: 2, color: 0x29b6f6, speed: 2 }
    ];

    const particles = [];
    states.forEach((state) => {
      for (let i = 0; i < 35; i++) {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 10, 10),
          new THREE.MeshStandardMaterial({ color: state.color, emissive: state.color, emissiveIntensity: 0.3 })
        );
        p.userData.state = state;
        p.position.set(
          state.center[0] + (Math.random() - 0.5) * state.spread,
          0.3 + Math.random() * 0.5,
          (Math.random() - 0.5) * state.spread
        );
        scene.add(p);
        particles.push(p);
      }
    });

    updaters.push((delta, elapsed) => {
      particles.forEach((p, idx) => {
        const { spread, speed, center } = p.userData.state;
        p.position.x += Math.sin(elapsed * speed + idx) * 0.005 * spread;
        p.position.z += Math.cos(elapsed * speed + idx) * 0.005 * spread;
        p.position.y = 0.3 + Math.sin(elapsed * (speed + 0.5) + idx) * 0.08 * spread;
      });
    });
  });
}


function initArithmeticStaircase() {
  createPlaySpace("staircase-canvas", { cameraPos: [0, 8, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 24);

    const steps = [];
    for (let i = 0; i < 6; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.6 + i * 0.2, 1.4),
        new THREE.MeshStandardMaterial({ color: 0xffc107, transparent: true, opacity: 0.8 })
      );
      step.position.set(-5 + i * 2, 0.3 + i * 0.1, 0);
      scene.add(step);
      steps.push(step);
    }

    const token = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x4fc3f7 })
    );
    token.position.set(-5, 2, 0);
    scene.add(token);

    updaters.push((delta, elapsed) => {
      const pos = Math.min(steps.length - 1, Math.floor((elapsed * 0.5) % steps.length));
      token.position.x = steps[pos].position.x;
      token.position.y = steps[pos].position.y + 1.2;
    });
  });
}

function initCircleMeasures() {
  const slider = document.getElementById("circle-radius");
  const perimeterEl = document.getElementById("circle-perimeter");
  const areaEl = document.getElementById("circle-area");

  createPlaySpace("circle-canvas", { cameraPos: [0, 8, 14], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 20);

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 0.3, 64),
      new THREE.MeshStandardMaterial({ color: 0xffe082, transparent: true, opacity: 0.8 })
    );
    disc.rotation.x = Math.PI / 2;
    disc.position.y = 0.2;
    scene.add(disc);

    const radiusBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x42a5f5 })
    );
    radiusBar.position.set(0, 0.5, 1.75);
    scene.add(radiusBar);

    const diameter = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 7),
      new THREE.MeshStandardMaterial({ color: 0xef5350 })
    );
    diameter.position.set(0, 0.6, 0);
    scene.add(diameter);

    function updateCircle(r) {
      disc.geometry.dispose();
      disc.geometry = new THREE.CylinderGeometry(r, r, 0.3, 64);
      radiusBar.scale.z = r / 3.5;
      radiusBar.position.z = r / 2;
      diameter.scale.z = (r * 2) / 7;
      if (perimeterEl) perimeterEl.textContent = (2 * Math.PI * r).toFixed(2);
      if (areaEl) areaEl.textContent = (Math.PI * r * r).toFixed(2);
    }

    slider?.addEventListener("input", (e) => {
      updateCircle(Number(e?.target?.value || 3.5));
    });

    updateCircle(Number(slider?.value || 3.5));
    updaters.push(spin(disc, 0.4));
  });
}

function initParallelogramRectangle() {
  createPlaySpace("parallelogram-canvas", { cameraPos: [0, 8, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 22);

    const rect = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.2, 5),
      new THREE.MeshStandardMaterial({ color: 0x81c784, transparent: true, opacity: 0.7 })
    );
    rect.position.y = 0.2;
    scene.add(rect);

    const para = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.2, 5),
      new THREE.MeshStandardMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.7 })
    );
    para.position.set(0, 0.6, 0);
    para.rotation.y = Math.PI / 12;
    scene.add(para);

    updaters.push((delta, elapsed) => {
      para.rotation.y = Math.sin(elapsed * 0.5) * 0.4;
    });
  });
}

function initLightReflection() {
  createPlaySpace("reflection-canvas", { cameraPos: [0, 8, 14], background: 0xe3f2fd }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 22);

    const mirror = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0x90caf9, metalness: 0.9, roughness: 0.05 })
    );
    scene.add(mirror);

    const beamIn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0xffa726, emissive: 0xffa726, emissiveIntensity: 0.8 })
    );
    beamIn.rotation.z = -Math.PI / 4;
    beamIn.position.set(-3, 1.5, 0);
    scene.add(beamIn);

    const beamOut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x29b6f6, emissive: 0x29b6f6, emissiveIntensity: 0.8 })
    );
    beamOut.rotation.z = Math.PI / 4;
    beamOut.position.set(3, 1.5, 0);
    scene.add(beamOut);

    updaters.push(makePulse(beamIn, 0.05, 2));
    updaters.push(makePulse(beamOut, 0.05, 2));
  });
}

function initBuoyancyTank() {
  const density = document.getElementById("buoy-density");
  createPlaySpace("buoyancy-canvas", { cameraPos: [0, 8, 14], background: 0xe1f5fe }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;

    const water = new THREE.Mesh(
      new THREE.BoxGeometry(10, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.4 })
    );
    water.position.y = 3;
    scene.add(water);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.6, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xffb74d })
    );
    cube.position.y = 5;
    scene.add(cube);

    function updateFloat() {
      const rho = Number(density?.value || 0.8);
      cube.position.y = 1 + 4 * (1 - rho / 1.5);
    }

    density?.addEventListener("input", updateFloat);
    updaters.push((delta, elapsed) => {
      cube.position.x = Math.sin(elapsed) * 0.8;
    });
    updateFloat();
  });
}

function initSunShadow() {
  const sliderId = "shadow-angle";
  let slider = document.getElementById(sliderId);
  if (!slider) {
    const wrap = document.createElement("div");
    wrap.className = "control-row";
    wrap.innerHTML = `<label>太阳高度</label><input id="${sliderId}" type="range" min="10" max="80" value="45">`;
    (document.querySelector(".viz-card") || document.querySelector(".main-content"))?.appendChild(wrap);
    slider = wrap.querySelector("input");
  }

  createPlaySpace("shadow-canvas", { cameraPos: [0, 9, 16], background: 0xfff8e1 }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene } = ctx;
    addGroundPlane(ctx, 0xffffff, 24);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 5, 12),
      new THREE.MeshStandardMaterial({ color: 0x795548 })
    );
    pole.position.y = 2.5;
    scene.add(pole);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 6),
      new THREE.MeshStandardMaterial({ color: 0x757575, transparent: true, opacity: 0.4 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    scene.add(shadow);

    function updateShadow() {
      const angle = (Number(slider?.value || 45) * Math.PI) / 180;
      const length = Math.max(0.5, 5 / Math.tan(angle));
      shadow.scale.set(1.2, length, 1);
      shadow.position.z = -length / 2;
    }

    updateShadow();
    slider?.addEventListener("input", updateShadow);
  });
}

function initEnergyPyramid() {
  createPlaySpace("energy-canvas", { cameraPos: [0, 9, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 24);

    const levels = [
      { color: 0xffcc80, size: 10 },
      { color: 0xa5d6a7, size: 8 },
      { color: 0x81d4fa, size: 6 },
      { color: 0xce93d8, size: 4 }
    ];

    levels.forEach((lvl, idx) => {
      const layer = new THREE.Mesh(
        new THREE.ConeGeometry(lvl.size / 2, 1.4, 4),
        new THREE.MeshStandardMaterial({ color: lvl.color, transparent: true, opacity: 0.8 })
      );
      layer.rotation.y = Math.PI / 4;
      layer.position.y = 0.7 + idx * 1.1;
      scene.add(layer);
      updaters.push(gentleBob(layer, layer.position.y, "y"));
    });
  });
}

function initEarthRotation() {
  const speedSlider = document.getElementById("earth-speed");
  const playBtn = document.getElementById("earth-play");
  const terminator = document.getElementById("terminator");
  const earth = document.getElementById("earth");
  if (!speedSlider || !playBtn || !terminator || !earth) return;

  const AXIS_TILT = 23.5;
  let speed = Number(speedSlider.value) || 1;
  let playing = true;
  let angle = 0;
  let last = 0;

  terminator.style.transform = `translate(-50%, 0) rotate(${AXIS_TILT}deg)`;

  function loop(timestamp) {
    if (!last) last = timestamp;
    const delta = timestamp - last;
    last = timestamp;
    if (playing) {
      angle = (angle + delta * 0.018 * speed) % 360;
      earth.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }
    requestAnimationFrame(loop);
  }

  speedSlider.addEventListener("input", (event) => {
    speed = Number(event?.target?.value) || 1;
  });

  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "暂停" : "继续旋转";
  });

  requestAnimationFrame(loop);
}

function initArithmeticStairs() {
  const firstInput = document.getElementById("arith-first");
  const diffInput = document.getElementById("arith-diff");
  const nInput = document.getElementById("arith-n");
  const replay = document.getElementById("arith-replay") || getOrCreateButton("arith-replay", "重新生成", document.querySelector(".viz-card"));
  const info = document.getElementById("arith-info");
  const firstVal = document.getElementById("arith-first-value");
  const diffVal = document.getElementById("arith-diff-value");

  createPlaySpace("arith-chart", { cameraPos: [0, 7, 14] }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xfafafa, 22);

    const steps = [];
    for (let i = 0; i < 12; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.8 })
      );
      scene.add(step);
      steps.push(step);
    }

    const coin = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.12, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0xffd54f })
    );
    coin.position.set(-6, 1, 0);
    scene.add(coin);

    function rebuild() {
      const a1 = Number(firstInput?.value || 2);
      const d = Number(diffInput?.value || 1);
      const n = Math.min(steps.length, Math.max(1, Number(nInput?.value || 1)));
      if (firstVal) firstVal.textContent = a1;
      if (diffVal) diffVal.textContent = d;

      steps.forEach((step, idx) => {
        const an = a1 + idx * d;
        const height = Math.max(0.4, 0.6 + an * 0.15);
        step.scale.set(1, height, 1);
        step.position.set(-6 + idx * 1.2, height / 2, 0);
        step.material.color.setHex(idx + 1 === n ? 0xffb74d : 0x4fc3f7);
      });

      const target = steps[n - 1];
      coin.position.x = target.position.x;
      coin.position.y = target.position.y + 0.8;
      if (info) info.textContent = `aₙ = ${a1} + (n-1)×${d}；第 ${n} 项 ≈ ${a1 + (n - 1) * d}`;
    }

    updaters.push((delta, elapsed) => {
      const idx = Math.floor((elapsed * 0.8) % steps.length);
      const step = steps[idx];
      if (step) {
        coin.position.x += (step.position.x - coin.position.x) * delta * 3;
        coin.position.y += (step.position.y + 0.8 - coin.position.y) * delta * 3;
      }
    });

    rebuild();
    [firstInput, diffInput].forEach((el) => el?.addEventListener("input", rebuild));
    nInput?.addEventListener("change", rebuild);
    replay?.addEventListener("click", rebuild);
  });
}

function initPercentDonut() {
  const slider = document.getElementById("donut-progress");
  const valueEl = document.getElementById("donut-value");
  const infoEl = document.getElementById("donut-info");
  const animateBtn = document.getElementById("donut-animate") || getOrCreateButton("donut-animate", "自动播放", document.querySelector(".viz-card"));

  createPlaySpace("donut-canvas", { cameraPos: [0, 7, 12], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 18);

    const donut = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.8, 16, 120),
      new THREE.MeshStandardMaterial({ color: 0x29b6f6, emissive: 0x29b6f6, emissiveIntensity: 0.6, transparent: true })
    );
    donut.rotation.x = Math.PI / 2;
    scene.add(donut);

    function applyProgress(pct) {
      const angle = Math.max(0.05, (Math.PI * 2 * pct) / 100);
      donut.geometry.dispose();
      donut.geometry = new THREE.TorusGeometry(3, 0.8, 16, 120, angle);
      if (valueEl) valueEl.textContent = `${pct}%`;
      if (infoEl) infoEl.textContent = `${(pct / 100).toFixed(2)} = ${pct}/100`;
    }

    let auto = false;
    let t = Number(slider?.value || 68) / 100;
    applyProgress(t * 100);

    updaters.push((delta) => {
      if (auto) {
        t += delta * 0.2;
        if (t > 1) t = 0;
        const pct = Math.round(t * 100);
        applyProgress(pct);
        if (slider) slider.value = String(pct);
      }
    });

    slider?.addEventListener("input", (e) => {
      const pct = Number(e?.target?.value || 0);
      applyProgress(pct);
    });

    animateBtn?.addEventListener("click", () => {
      auto = !auto;
      if (animateBtn) animateBtn.textContent = auto ? "暂停播放" : "自动播放";
    });
  });
}

function initCoordinateTransform() {
  const moveX = document.getElementById("move-x");
  const moveY = document.getElementById("move-y");
  const rotate = document.getElementById("rotate-angle");
  const resetBtn = document.getElementById("transform-reset") || getOrCreateButton("transform-reset", "回到初始", document.querySelector(".viz-card"));
  const info = document.getElementById("transform-info");
  const moveXValue = document.getElementById("move-x-value");
  const moveYValue = document.getElementById("move-y-value");
  const rotateValue = document.getElementById("rotate-angle-value");

  createPlaySpace("transform-canvas", { cameraPos: [0, 8, 14], showGrid: true }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;

    const axes = new THREE.AxesHelper(6);
    scene.add(axes);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xff7043 })
    );
    cube.position.set(-4, 1, -4);
    scene.add(cube);

    function updateTransform() {
      const tx = Number(moveX?.value || 0);
      const ty = Number(moveY?.value || 0);
      const ang = (Number(rotate?.value || 0) * Math.PI) / 180;
      cube.position.set(tx, 1 + ty * 0.15, ty);
      cube.rotation.y = ang;
      if (moveXValue) moveXValue.textContent = tx;
      if (moveYValue) moveYValue.textContent = ty;
      if (rotateValue) rotateValue.textContent = `${Number(rotate?.value || 0)}°`;
      if (info) info.textContent = `坐标：(${tx.toFixed(1)}, ${ty.toFixed(1)})，旋转 ${rotate?.value || 0}°`;
    }

    moveX?.addEventListener("input", updateTransform);
    moveY?.addEventListener("input", updateTransform);
    rotate?.addEventListener("input", updateTransform);
    resetBtn?.addEventListener("click", () => {
      if (moveX) moveX.value = "1";
      if (moveY) moveY.value = "0";
      if (rotate) rotate.value = "20";
      updateTransform();
    });

    updateTransform();
    updaters.push(makePulse(cube, 0.04, 2));
  });
}

function initLineSlope() {
  createPlaySpace("slope-canvas", { cameraPos: [0, 8, 14], showGrid: true }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x7e57c2 })
    );
    line.position.y = 0.2;
    scene.add(line);

    const rider = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffb74d })
    );
    rider.position.set(-5, 1, 0);
    scene.add(rider);

    updaters.push((delta, elapsed) => {
      const slope = Math.sin(elapsed * 0.5) * 0.5;
      line.rotation.z = -slope;
      rider.position.x = Math.sin(elapsed) * 4.5;
      rider.position.y = 1 + slope * rider.position.x * 0.4;
    });
  });
}

function initBuoyancyDensity() {
  createPlaySpace("density-canvas", { cameraPos: [0, 8, 14], background: 0xe3f2fd }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;

    const water = new THREE.Mesh(
      new THREE.BoxGeometry(10, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x90caf9, transparent: true, opacity: 0.5 })
    );
    water.position.y = 3;
    scene.add(water);

    const wood = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xa1887f })
    );
    wood.position.y = 5;
    scene.add(wood);

    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x546e7a })
    );
    stone.position.y = 4;
    stone.position.x = 2;
    scene.add(stone);

    updaters.push((delta, elapsed) => {
      wood.position.y = 4 + Math.sin(elapsed) * 0.3;
      stone.position.y = 2 + Math.sin(elapsed) * 0.1;
    });
  });
}

function initCircuitBrightness() {
  createPlaySpace("brightness-canvas", { cameraPos: [0, 8, 14], showGrid: false }).then((ctx) => {
    if (!ctx) return;
    const { THREE, scene, updaters } = ctx;
    addGroundPlane(ctx, 0xffffff, 22);

    const battery = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xff8a65 })
    );
    battery.position.set(-4, 1.2, 0);
    scene.add(battery);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0xfff59d, emissive: 0xfff176, emissiveIntensity: 0.8 })
    );
    bulb.position.set(2, 1.2, 0);
    scene.add(bulb);

    let brightness = 0;
    updaters.push((delta, elapsed) => {
      brightness = 0.6 + Math.abs(Math.sin(elapsed * 1.5)) * 0.6;
      bulb.material.emissiveIntensity = brightness;
    });
  });
}

const topicInits = {
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
  "earth-rotation": initEarthRotation,
  "arithmetic-stairs": initArithmeticStairs,
  "percent-donut": initPercentDonut,
  "coordinate-transform": initCoordinateTransform,
  "line-slope": initLineSlope,
  "buoyancy-density": initBuoyancyDensity,
  "circuit-brightness": initCircuitBrightness
};

document.addEventListener("DOMContentLoaded", () => {
  const topic = document.body.dataset.topic;
  const init = topicInits[topic];
  if (typeof init === "function") {
    init();
  }
});

