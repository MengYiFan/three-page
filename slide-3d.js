// 3D Slide Simulation using Three.js

const slideState = {
  currentAngle: 40,
  isSliding: false,
  t: 0, // Progress along the path (0 to 1)
  velocity: 0,
  slideLength: 15, // Unified slope length (meters/units)
  gravity: 100, // High gravity for dangerous speed at steep angles
  frictionCoef: 0.15, // Base friction (allows sliding at > 10 degrees)
  dragCoef: 0.01
};

const PRESET_ANGLES = {
  easy: 10,
  medium: 40,
  hard: 70
};

// Three.js Global Variables
let scene, camera, renderer, controls;
let slideMesh, characterGroup;
let slidePathCurve;
let animationId;
let lastTime = 0;

// DOM Elements
const dom = {};

function init() {
  // 1. DOM Elements
  dom.canvasContainer = document.querySelector('.slide-visual');
  // Remove existing canvas if any (from previous 2D version)
  const oldCanvas = document.getElementById('slide-canvas');
  if (oldCanvas) oldCanvas.remove();

  dom.difficultyButtons = document.querySelectorAll('.difficulty-buttons button, .difficulty-buttons select');
  dom.generateBtn = document.getElementById('generate-angle');
  dom.angleInput = document.getElementById('angle-input');
  dom.submitBtn = document.getElementById('submit-angle');
  dom.currentAngleDisplay = document.getElementById('current-angle-value');
  dom.safetyBadge = document.getElementById('current-angle-level');
  dom.feedback = document.getElementById('angle-feedback');
  dom.safetyDetail = document.getElementById('angle-safety-detail');
  dom.select = document.getElementById('difficulty-select');

  // 2. Three.js Setup
  setupThreeJS();

  // 3. Initial Scene
  updateSlideGeometry(slideState.currentAngle);
  createCharacter();

  // 4. Listeners
  setupListeners();

  // 5. Start Loop
  requestAnimationFrame(animate);
}

function setupThreeJS() {
  const width = dom.canvasContainer.clientWidth;
  const height = dom.canvasContainer.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbbdefb); // Sky blue
  scene.fog = new THREE.Fog(0xbbdefb, 20, 100);

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(20, 15, 30);
  camera.lookAt(0, 5, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  // renderer.shadowMap.enabled = true; // Disable shadows
  dom.canvasContainer.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  // dirLight.castShadow = true; // Disable shadows
  dirLight.shadow.camera.left = -20;
  dirLight.shadow.camera.right = 20;
  dirLight.shadow.camera.top = 20;
  dirLight.shadow.camera.bottom = -20;
  scene.add(dirLight);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xa5d6a7 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  // ground.receiveShadow = true; // Disable shadows
  scene.add(ground);

  // Resize Handler
  window.addEventListener('resize', onWindowResize);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 100;
  // Limit vertical angle to prevent going under ground too much
  controls.maxPolarAngle = Math.PI / 2 - 0.05;

  // Limit vertical angle to prevent going under ground too much
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
}


function onWindowResize() {
  if (!dom.canvasContainer) return;
  const width = dom.canvasContainer.clientWidth;
  const height = dom.canvasContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// --- 3D Angle Diagram ---
let angleDiagramGroup;

function updateAngleDiagram(angle, x, y, z) {
  if (angleDiagramGroup) scene.remove(angleDiagramGroup);
  angleDiagramGroup = new THREE.Group();

  const size = 3; // World units

  // 1. Axes (Ground and Vertical)
  const material = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
  const points = [];
  // Ground (Left)
  points.push(new THREE.Vector3(-size, 0, 0));
  points.push(new THREE.Vector3(0, 0, 0)); // Origin
  // Vertical (Up)
  points.push(new THREE.Vector3(0, size, 0));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const axes = new THREE.Line(geometry, material);
  angleDiagramGroup.add(axes);

  // 2. Slope Line
  const rad = angle * Math.PI / 180;
  const slopeLen = size * 0.8;
  // Slope goes Up-Left
  // x = -cos(rad) * len
  // y = sin(rad) * len
  const slopeEnd = new THREE.Vector3(-Math.cos(rad) * slopeLen, Math.sin(rad) * slopeLen, 0);

  const slopePoints = [new THREE.Vector3(0, 0, 0), slopeEnd];
  const slopeGeo = new THREE.BufferGeometry().setFromPoints(slopePoints);
  const slopeMat = new THREE.LineBasicMaterial({ color: 0x2196f3, linewidth: 3 });
  const slopeLine = new THREE.Line(slopeGeo, slopeMat);
  angleDiagramGroup.add(slopeLine);

  // 3. Arc
  // Arc from PI (Left) to PI - rad (Up-Left)
  const curve = new THREE.EllipseCurve(
    0, 0,             // ax, aY
    size * 0.4, size * 0.4, // xRadius, yRadius
    Math.PI, Math.PI - rad, // aStartAngle, aEndAngle
    true,             // aClockwise (true for decreasing angle? Wait. PI -> PI-rad is decreasing. So Clockwise?)
    // EllipseCurve: aClockwise – Whether the ellipse is drawn clockwise. Default is false.
    // We want PI -> PI-rad. 180 -> 140. Decreasing.
    // So Clockwise = true.
    0                 // aRotation
  );

  const arcPoints = curve.getPoints(20);
  const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
  const arcMat = new THREE.LineBasicMaterial({ color: 0x2196f3 });
  const arc = new THREE.Line(arcGeo, arcMat);
  angleDiagramGroup.add(arc);

  // 4. Text Labels
  // Angle Value
  const angleLabel = createTextSprite(`${angle}°`, '#0d47a1'); // Darker blue
  // Position it near the arc
  const midAngle = Math.PI - rad / 2;
  const labelDist = size * 0.7; // Move slightly further out
  angleLabel.position.set(Math.cos(midAngle) * labelDist, Math.sin(midAngle) * labelDist, 0);
  // Scale needs to match aspect ratio of canvas (which is 2:1 now)
  // And be large enough in world units.
  angleLabel.scale.set(3, 1.5, 1);
  angleDiagramGroup.add(angleLabel);

  // Ground Label
  // const groundLabel = createTextSprite('地面', '#333333');
  // groundLabel.position.set(-size + 0.5, -0.5, 0);
  // groundLabel.scale.set(3, 1.5, 1);
  // angleDiagramGroup.add(groundLabel);

  // Position the whole group
  angleDiagramGroup.position.set(x, y, z);
  scene.add(angleDiagramGroup);
}

function createTextSprite(message, color) {
  const canvas = document.createElement('canvas');
  const height = 128; // Higher resolution
  const width = 256;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Debug background? No, transparent.
  // ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  // ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = color;
  ctx.font = 'bold 80px Arial'; // Larger font
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false // Always show on top of lines/slide
  });
  const sprite = new THREE.Sprite(material);

  // Initial scale (will be overridden)
  sprite.scale.set(2, 1, 1);

  return sprite;
}

// --- Logic: Unified Slope Length ---
// The slide has a fixed length L.
// Height H = L * sin(theta)
// Base W = L * cos(theta)
// We align the slide so it ends at (0,0,0) or near it.
// Start Point: (-W, H, 0) -> End Point: (0, 0, 0)
// Actually, let's center it a bit.
function updateSlideGeometry(angleDeg) {
  if (slideMesh) scene.remove(slideMesh);

  const angleRad = angleDeg * Math.PI / 180;
  const L = slideState.slideLength;

  // Calculate dimensions based on angle
  const height = L * Math.sin(angleRad);
  const baseLen = L * Math.cos(angleRad);

  // Create a curve path
  // We want a straight slope for most of it, then a curve at the bottom.
  // Let's say 80% is slope, 20% is curve out.
  // Actually, for "Unified Length", the hypotenuse of the main slope should be roughly constant.
  // Let's define the path points.

  const startX = -baseLen;
  const startY = height;
  const endX = 0;
  const endY = 0;

  // Simple Quadratic Bezier for the slide path
  // Control point to make it straight-ish then curve
  // To make it mostly straight, CP should be close to the line?
  // Or we can use a CurvePath with a LineCurve and a QuadraticBezierCurve.

  // Let's use a CatmullRomCurve3 for smoothness, but control points carefully.
  // Point 0: Top
  // Point 1: Near Bottom (straight line)
  // Point 2: Bottom (curved out)

  // To strictly follow "Unified Length" of the slope face:
  // The distance from Top to "Start of Curve" should be dominant.
  // Let's simplify: The slide is a curve from (-baseLen, height, 0) to (2, 0, 0).
  // The "2" is a small run-out at the bottom.

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(startX, startY, 0),
    new THREE.Vector3(startX * 0.1, startY * 0.1, 0), // Linearly interpolate? No, Catmull will curve.
    new THREE.Vector3(2, 0.5, 0), // Run out
    new THREE.Vector3(4, 0, 0)
  ]);

  // Better approach for "Straight Slope":
  // Use a path composed of a Line and a Curve.
  // But for visual simplicity in Three.js ExtrudeGeometry, a single curve is easier.
  // Let's stick to a simple curve that approximates the slope.
  // Start: (-baseLen, height)
  // End: (0, 0)
  // Control: (-baseLen * 0.2, height * 0.1) -> this gives a "slide" shape.

  const path = new THREE.CurvePath();
  // Main Slope
  const slopeEndRatio = 0.8;
  const slopeEndX = startX + (endX - startX) * slopeEndRatio;
  const slopeEndY = startY + (endY - startY) * slopeEndRatio;

  const mainSlope = new THREE.LineCurve3(
    new THREE.Vector3(startX, startY, 0),
    new THREE.Vector3(slopeEndX, slopeEndY, 0)
  );

  // Bottom Curve (leveling out)
  const runOutX = endX + 2; // Extra bit at bottom
  const bottomCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(slopeEndX, slopeEndY, 0),
    new THREE.Vector3(endX, 0, 0), // Control point
    new THREE.Vector3(runOutX, 0, 0) // End point
  );

  path.add(mainSlope);
  path.add(bottomCurve);
  slidePathCurve = path;

  // Extrude Shape (U-profile)
  const shape = new THREE.Shape();
  const w = 1.5; // Slide width
  const wallH = 0.5;
  const thick = 0.2;

  // Draw U-shape cross section
  shape.moveTo(-w / 2, wallH);
  shape.lineTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, wallH);
  shape.lineTo(w / 2 + thick, wallH);
  shape.lineTo(w / 2 + thick, -thick);
  shape.lineTo(-w / 2 - thick, -thick);
  shape.lineTo(-w / 2 - thick, wallH);

  const extrudeSettings = {
    steps: 50,
    bevelEnabled: false,
    extrudePath: path
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2196f3, // Blue slide
    roughness: 0.4,
    metalness: 0.1
  });

  slideMesh = new THREE.Mesh(geometry, material);
  // slideMesh.castShadow = true;
  // slideMesh.receiveShadow = true;
  scene.add(slideMesh);

  // Add Ladder/Stairs (Visual only)
  addLadder(startX, startY);

  // Update Camera to frame the slide
  // Calculate bounding box center and size
  // Slide goes from (startX, startY, 0) to (runOutX, 0, 0)
  // Width: runOutX - startX
  // Height: startY
  // Depth: w (1.5)

  const centerX = (startX + runOutX) / 2;
  const centerY = startY / 2;
  const centerZ = 0;

  const width = runOutX - startX;
  const slideHeight = startY;

  // Fit to view
  // We want to fit 'width' and 'height' into the camera frustum.
  // Camera is perspective.
  const maxDim = Math.max(width, slideHeight);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

  // Add some padding
  // cameraZ *= 1.5; // Old zoom
  cameraZ *= 1.2; // Zoom in (closer)

  // Position camera
  // We want a side/diagonal view.
  // Let's keep the angle consistent but adjust distance.
  const offset = cameraZ;

  // Smoothly move camera or jump? User said "initialization", so jump is fine.
  // But if they change angle, maybe smooth? For now, direct set.

  // We update controls target too so rotation is centered.
  if (controls) {
    controls.target.set(centerX, centerY, centerZ);
    controls.update();
  }

  // Set position relative to target
  // Based on feedback "see the slide way" and reference images, 
  // they likely want to look DOWN the slide from the top (Left side).
  // This corresponds to moving the Camera to the Left (-X).
  // We also increase elevation to see the bed clearly.

  const angleOffset = -35 * Math.PI / 180; // 8 degrees

  // Calculate position on the circle (orbit)
  // Move Camera Left (-X) to look from the Start of the slide.
  const rotX = -offset * Math.sin(angleOffset);
  const rotZ = offset * Math.cos(angleOffset);
  const rotY = offset * 0.35; // Higher elevation to see inside

  camera.position.set(centerX + rotX, centerY + rotY, centerZ + rotZ);
  camera.lookAt(centerX, centerY, centerZ);

  // Update 3D Angle Diagram
  // Position it at the end of the slide, slightly offset
  updateAngleDiagram(angleDeg, runOutX + 1, 0, 0);
}

let ladderGroup;
function addLadder(topX, topY) {
  if (ladderGroup) scene.remove(ladderGroup);
  ladderGroup = new THREE.Group();

  // Poles
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, topY, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x757575 });

  const pole1 = new THREE.Mesh(poleGeo, poleMat);
  pole1.position.set(topX - 0.8, topY / 2, 0);

  const pole2 = new THREE.Mesh(poleGeo, poleMat);
  pole2.position.set(topX - 0.8 - 1, topY / 2, 0); // 1 meter wide ladder

  ladderGroup.add(pole1);
  ladderGroup.add(pole2);

  // Rungs
  const rungCount = Math.floor(topY / 0.5);
  const rungGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
  rungGeo.rotateZ(Math.PI / 2);

  for (let i = 1; i < rungCount; i++) {
    const rung = new THREE.Mesh(rungGeo, poleMat);
    rung.position.set(topX - 0.8 - 0.5, i * 0.5, 0);
    ladderGroup.add(rung);
  }

  // Platform
  const platGeo = new THREE.BoxGeometry(2, 0.2, 2);
  const platMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
  const platform = new THREE.Mesh(platGeo, platMat);
  platform.position.set(topX - 0.5, topY - 0.1, 0);
  ladderGroup.add(platform);

  scene.add(ladderGroup);
}

function createCharacter() {
  if (characterGroup) scene.remove(characterGroup);
  characterGroup = new THREE.Group();

  // Materials
  const matWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const matVisor = new THREE.MeshStandardMaterial({
    color: 0x6a1b9a,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.3
  });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffccbc }); // Pinkish skin
  const matDetail = new THREE.MeshStandardMaterial({ color: 0xff5252 }); // Red detail
  const matBlack = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // 1. Helmet (Head)
  const helmetGeo = new THREE.SphereGeometry(0.4, 32, 32);
  const helmet = new THREE.Mesh(helmetGeo, matWhite);
  helmet.position.y = 1.3;
  characterGroup.add(helmet);

  // Visor (Glass)
  const visorGeo = new THREE.SphereGeometry(0.32, 32, 32);
  const visor = new THREE.Mesh(visorGeo, matVisor);
  visor.position.set(0, 1.3, 0.12); // Slightly forward
  characterGroup.add(visor);

  // Face (Inside)
  const faceGeo = new THREE.SphereGeometry(0.28, 32, 32);
  const face = new THREE.Mesh(faceGeo, matSkin);
  face.position.set(0, 1.3, 0.05);
  characterGroup.add(face);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.04, 16, 16);
  const eyeL = new THREE.Mesh(eyeGeo, matBlack);
  eyeL.position.set(-0.1, 1.35, 0.30);
  characterGroup.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, matBlack);
  eyeR.position.set(0.1, 1.35, 0.30);
  characterGroup.add(eyeR);

  // 2. Body (Suit)
  const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.6, 16);
  const body = new THREE.Mesh(bodyGeo, matWhite);
  body.position.y = 0.8;
  characterGroup.add(body);

  // Backpack
  const backpackGeo = new THREE.BoxGeometry(0.5, 0.6, 0.3);
  const backpack = new THREE.Mesh(backpackGeo, matWhite);
  backpack.position.set(0, 0.9, -0.3);
  characterGroup.add(backpack);

  // Chest Detail (Red Box)
  const chestGeo = new THREE.BoxGeometry(0.2, 0.15, 0.05);
  const chest = new THREE.Mesh(chestGeo, matDetail);
  chest.position.set(0, 0.8, 0.3);
  characterGroup.add(chest);

  // 3. Legs (Sitting)
  const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 12);
  const legL = new THREE.Mesh(legGeo, matWhite);
  legL.rotation.x = -Math.PI / 2; // Forward
  legL.position.set(-0.2, 0.5, 0.3);
  characterGroup.add(legL);

  const legR = new THREE.Mesh(legGeo, matWhite);
  legR.rotation.x = -Math.PI / 2;
  legR.position.set(0.2, 0.5, 0.3);
  characterGroup.add(legR);

  // Feet/Boots
  const bootGeo = new THREE.SphereGeometry(0.14, 16, 16);
  const bootL = new THREE.Mesh(bootGeo, matWhite);
  bootL.position.set(-0.2, 0.5, 0.55);
  bootL.scale.set(1, 0.8, 1.2);
  characterGroup.add(bootL);

  const bootR = new THREE.Mesh(bootGeo, matWhite);
  bootR.position.set(0.2, 0.5, 0.55);
  bootR.scale.set(1, 0.8, 1.2);
  characterGroup.add(bootR);

  // 4. Arms
  const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12);
  const armL = new THREE.Mesh(armGeo, matWhite);
  armL.rotation.z = Math.PI / 4;
  armL.position.set(-0.4, 1.0, 0);
  characterGroup.add(armL);

  const armR = new THREE.Mesh(armGeo, matWhite);
  armR.rotation.z = -Math.PI / 4;
  armR.position.set(0.4, 1.0, 0);
  characterGroup.add(armR);

  // Scale down to fit slide
  characterGroup.scale.set(1.2, 1.2, 1.2);

  scene.add(characterGroup);
  resetCharacter();
}

function resetCharacter() {
  slideState.t = 0;
  slideState.velocity = 0;
  slideState.isSliding = false;
  updateCharacterPosition();
}

function updateCharacterPosition() {
  if (!slidePathCurve || !characterGroup) return;

  const point = slidePathCurve.getPointAt(slideState.t);
  const tangent = slidePathCurve.getTangentAt(slideState.t);

  characterGroup.position.copy(point);
  // Character's lowest point (legs) is at local y=0.5 * 1.2 = 0.6.
  // Slide surface is at y=0.
  // So we need to lower the character by ~0.6 to sit on the slide.
  // Let's lower by 0.58 to leave a tiny gap (or slight embed) to avoid Z-fighting/clipping.
  characterGroup.position.y -= 0.58;

  // Orient character to face down the slide
  // Tangent is the forward vector.
  // We want the character's -Z (or forward) to align with tangent?
  // Or just look at the next point.
  const lookAtPoint = point.clone().add(tangent);
  characterGroup.lookAt(lookAtPoint);
}

// --- Physics Loop ---
function animate(time) {
  requestAnimationFrame(animate);

  const dt = (time - lastTime) / 1000;
  lastTime = time;

  if (slideState.isSliding) {
    // Physics Step
    // 1. Get slope angle at current t
    const tangent = slidePathCurve.getTangentAt(slideState.t);
    // Angle with horizontal: tangent.y is sin(theta) if normalized?
    // tangent is a unit vector.
    // The slope angle theta: sin(theta) = -tangent.y (since y goes down as we slide? No, y is up in Three.js)
    // Tangent points "forward" along the curve.
    // If we go down, tangent.y is negative.
    // Slope angle theta (positive) -> sin(theta) = -tangent.y

    const sinTheta = -tangent.y;
    const cosTheta = Math.sqrt(tangent.x * tangent.x + tangent.z * tangent.z); // Horizontal component

    // 2. Forces
    // Gravity accelerates: g * sinTheta
    // Friction decelerates: mu * g * cosTheta

    // If sinTheta < 0 (going up), gravity decelerates.
    // If sinTheta > 0 (going down), gravity accelerates.

    // Clamp sinTheta to 0 if it's flat/uphill (for this simple slide)
    const effectiveSin = Math.max(0, sinTheta);

    const gravityForce = slideState.gravity * effectiveSin;
    const frictionForce = slideState.gravity * cosTheta * slideState.frictionCoef;

    let accel = gravityForce - frictionForce;

    // Remove artificial angle scaling to restore Newtonian physics
    // const angleFactor = slideState.currentAngle / 90;
    // accel *= angleFactor;

    // Drag
    accel -= slideState.dragCoef * slideState.velocity * slideState.velocity;

    // If stopped and gravity < friction, don't move
    if (slideState.velocity <= 0.01 && accel <= 0) {
      accel = 0;
      slideState.velocity = 0;
    }

    // 3. Update Velocity
    slideState.velocity += accel * dt;
    if (slideState.velocity < 0) slideState.velocity = 0;

    // 4. Update Position (t)
    // velocity is in units/sec.
    // We need to map this to 't' (0 to 1).
    // Length of curve?
    const totalLength = slidePathCurve.getLength();
    const distStep = slideState.velocity * dt;
    const tStep = distStep / totalLength;

    slideState.t += tStep;

    if (slideState.t >= 1) {
      slideState.t = 0; // Loop
      slideState.velocity = 0; // Reset speed for loop
      // Optional: Pause at top?
    }

    updateCharacterPosition();
  }

  if (controls) controls.update();

  if (controls) controls.update();

  renderer.render(scene, camera);
}

// --- Interaction ---
function setupListeners() {
  // Difficulty Buttons
  dom.difficultyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Handle both button and select
      const val = e.target.value || e.target.dataset.level;
      if (val && PRESET_ANGLES[val]) {
        setAngle(PRESET_ANGLES[val]);
        dom.select.value = val; // Sync select
      }
    });
  });

  dom.select.addEventListener('change', (e) => {
    const val = e.target.value;
    if (PRESET_ANGLES[val]) {
      setAngle(PRESET_ANGLES[val]);
    }
  });

  // Generate/Start
  dom.generateBtn.addEventListener('click', () => {
    startSlide();
  });

  // Custom Input
  dom.submitBtn.addEventListener('click', () => {
    const val = parseFloat(dom.angleInput.value);
    if (val >= 5 && val <= 75) {
      setAngle(val);
      assessSafety(val);
      startSlide();
    } else {
      alert("请输入 5 - 75 之间的角度");
    }
  });
}

function setAngle(angle) {
  slideState.currentAngle = angle;
  dom.currentAngleDisplay.textContent = angle;
  dom.generateBtn.disabled = false;

  // Update Visuals
  updateSlideGeometry(angle);
  resetCharacter();

  // Dynamic Friction: Explicitly prevent sliding for <= 10 degrees
  if (angle <= 10) {
    slideState.frictionCoef = 1.0; // High friction, won't move
  } else {
    slideState.frictionCoef = 0.15; // Low friction, ensures sliding at 15 degrees
  }

  // Update Safety Badge (Preview)
  assessSafety(angle);
}

function startSlide() {
  slideState.isSliding = true;
  slideState.velocity = 0;
  slideState.t = 0;
}

function assessSafety(angle) {
  let level = { label: "未知", class: "bg-slate-400", summary: "" };

  if (angle <= 10) {
    level = { label: "过缓", class: "bg-sky-500", summary: "因为摩擦力原因，无法滑动。" };
  } else if (angle <= 35) {
    level = { label: "安全适中", class: "bg-emerald-500", summary: "适合儿童玩耍的安全角度。" };
  } else if (angle <= 50) {
    level = { label: "偏陡", class: "bg-amber-500", summary: "速度较快，需注意安全。" };
  } else {
    level = { label: "危险", class: "bg-rose-500", summary: "滑动速度很快，很危险。" };
  }

  dom.safetyBadge.textContent = level.label;
  dom.safetyBadge.className = `safety-badge angle-level-badge inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white shadow ${level.class}`;

  if (dom.feedback) {
    dom.feedback.textContent = `当前角度 ${angle}° - ${level.summary}`;
    dom.feedback.className = angle > 40 ? "feedback incorrect" : "feedback correct";
  }
}

// Init
document.addEventListener('DOMContentLoaded', init);
