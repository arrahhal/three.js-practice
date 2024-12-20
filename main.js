import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { gui, options } from "./modules/gui";
import floor from "./assets/floor.jpg";
import ceilingImg from "./assets/ceiling.jpg";
import wallImg from "./assets/wall.jpg";
import loadCeilingLampModel from "./modules/ceilingLamp";
import loadPhotoFrame from "./modules/photoFrame";

let intersection = false;
let paddle1DirX = 0;
let paddle2DirX = 0;
let paddleSpeed = 0.2;

let ballDirX = 1;
let ballDirZ = 1;
let ballSpeed = options.ballSpeed;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const textureLoader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = options.shadow;
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

const playerBox = new THREE.Box3();
const helper = new THREE.Box3Helper(playerBox, 0xffff00);
helper.visible = options.enableHelpers;
scene.add(helper);

let movePaddleLeft = false;
let movePaddleRight = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster(
  new THREE.Vector3(),
  new THREE.Vector3(0, -1, 0),
  0,
  10,
);

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const controls = new PointerLockControls(camera, document.body);

const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");

instructions.addEventListener("click", function () {
  controls.lock();
});

controls.addEventListener("lock", function () {
  instructions.style.display = "none";
  blocker.style.display = "none";
});

controls.addEventListener("unlock", function () {
  blocker.style.display = "block";
  instructions.style.display = "";
});

scene.add(controls.object);

const wallTexture = textureLoader.load(wallImg);
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(5, 5);

const wallGroup = new THREE.Group();
scene.add(wallGroup);

function createWall({ x = 0, y = 0, z = 0 }, isRotated = false) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(100, 50, 0.001),
    new THREE.MeshLambertMaterial({ map: wallTexture }),
  );
  if (isRotated) {
    wall.rotation.y = Math.PI / 2;
  }
  wall.position.x = x;
  wall.position.y = y;
  wall.position.z = z;
  wall.geometry.computeBoundingBox();
  wall.receiveShadow = true;
  wall.castShadow = true;

  return wall;
}

const frontWall = createWall({ z: -50, y: 15 });
loadPhotoFrame(scene, frontWall);

const backWall = createWall({ z: 50, y: 15 });
const leftWall = createWall({ x: -50, y: 15 }, true);
const rightWall = createWall({ x: 50, y: 15 }, true);

wallGroup.add(frontWall, backWall, leftWall, rightWall);

const onKeyUp = function (event) {
  switch (event.code) {
    case "ArrowRight":
      movePaddleRight = false;
      break;

    case "ArrowLeft":
      movePaddleLeft = false;
      break;

    case "KeyW":
      moveForward = false;
      break;

    case "KeyA":
      moveLeft = false;
      break;

    case "KeyS":
      moveBackward = false;
      break;

    case "KeyD":
      moveRight = false;
      break;
  }
};

camera.position.set(0, 8, 25);

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(camera.position);
scene.add(ambientLight);

const dLight = new THREE.DirectionalLight(0xffffff, 1);
dLight.removeEventListener;
dLight.position.y = 30;
dLight.position.x = 45;
dLight.castShadow = true;
dLight.shadow.camera.scale.x = 3;
dLight.shadow.camera.scale.y = 2;
scene.add(dLight);

const dLightShadowHelper = new THREE.CameraHelper(dLight.shadow.camera);
dLightShadowHelper.visible = options.enableHelpers;
const dLightHelper = new THREE.DirectionalLightHelper(dLight);
dLightHelper.visible = options.enableHelpers;
scene.add(dLightHelper, dLightShadowHelper);

const floorTexture = textureLoader.load(floor);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(20, 20);

const groundGeomtery = new THREE.BoxGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
  map: floorTexture,
});
const ground = new THREE.Mesh(groundGeomtery, groundMaterial);
ground.rotation.x = -0.5 * Math.PI;
ground.position.y = -10;
ground.receiveShadow = true;
scene.add(ground);

const ceilingTexture = textureLoader.load(ceilingImg);
ceilingTexture.wrapS = THREE.RepeatWrapping;
ceilingTexture.wrapT = THREE.RepeatWrapping;
ceilingTexture.repeat.set(10, 10);

const ceilingGeomtery = new THREE.BoxGeometry(100, 100);
const ceilingMaterial = new THREE.MeshStandardMaterial({
  color: "#eef0e1",
  map: ceilingTexture,
});
const ceiling = new THREE.Mesh(ceilingGeomtery, ceilingMaterial);
ceiling.rotation.x = -0.5 * Math.PI;
ceiling.position.y = 40;
ceiling.receiveShadow = true;
scene.add(ceiling);
loadCeilingLampModel(scene, ceiling);

const planeGeomtry = new THREE.PlaneGeometry(20, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: "darkgreen",
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeomtry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
scene.add(plane);

const tableGeometry = new THREE.BoxGeometry(22, 32, 10);
const tableMaterial = new THREE.MeshStandardMaterial({ color: "brown" });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
table.rotation.x = -0.5 * Math.PI;
table.position.y -= 5.1;
table.geometry.computeBoundingBox();
table.castShadow = true;
scene.add(table);
const tableBox = new THREE.Box3();

const sphereGeometry = new THREE.SphereGeometry(0.5);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
ball.castShadow = true;
ball.position.y += 0.5;

scene.add(ball);

const paddleGeometry = new THREE.BoxGeometry(3, 1, 1);
const paddleMaterial1 = new THREE.MeshStandardMaterial({
  color: 0xfff0fc,
});
const paddleMaterial2 = new THREE.MeshStandardMaterial({
  color: 0xfff0fc,
});
const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial1);
const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial2);

paddle1.position.y += 0.5;
paddle1.position.z = 15;

paddle2.position.y += 0.5;
paddle2.position.z = -15;

scene.add(paddle1);
scene.add(paddle2);

const onKeyDown = function (event) {
  switch (event.code) {
    case "ArrowRight":
      movePaddleRight = true;
      break;

    case "ArrowLeft":
      movePaddleLeft = true;
      break;

    case "KeyW":
      moveForward = true;
      break;

    case "KeyA":
      moveLeft = true;
      break;

    case "KeyS":
      moveBackward = true;
      break;

    case "KeyD":
      moveRight = true;
      break;
  }
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

const mousePosition = new THREE.Vector2();

window.addEventListener("mousemove", (e) => {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = (e.clientY / window.innerHeight) * 2 + 1;
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("pointermove", onPointerMove);

gui.add(options, "enableHelpers").onChange((e) => {
  helper.visible = e;
  dLightHelper.visible = e;
  dLightShadowHelper.visible = e;
});
gui.add(options, "shadow").onChange((e) => {
  renderer.shadowMap.enabled = e;
});
gui
  .add(options, "ballSpeed")
  .min(0.05)
  .max(0.2)
  .step(0.01)
  .onChange((e) => {
    ballSpeed = e;
  });

let prevPosition = new THREE.Vector3();
prevPosition.copy(controls.object.position);

function animate() {
  playerBox.setFromCenterAndSize(
    new THREE.Vector3(
      controls.object.position.x,
      controls.object.position.y - 10,
      controls.object.position.z,
    ),
    new THREE.Vector3(2, 19, 2),
  );

  wallGroup.children.forEach((wall) => {
    const wallBox = new THREE.Box3();
    wallBox.copy(wall.geometry.boundingBox).applyMatrix4(wall.matrixWorld);
    if (wallBox.intersectsBox(playerBox)) {
      intersection = true;
    }
  });

  tableBox.copy(table.geometry.boundingBox).applyMatrix4(table.matrixWorld);

  if (tableBox.intersectsBox(playerBox)) {
    intersection = true;
  }

  if (intersection === false) {
    prevPosition = controls.object.position.clone();
  } else {
    controls.object.position.copy(prevPosition);
    intersection = false;
  }

  const time = performance.now();
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.object.position);
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.origin.y -= 10;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.object.position.y += velocity.y * delta; // new behavior

    if (controls.object.position.y < 10) {
      velocity.y = 0;
      controls.object.position.y = 10;
    }
  }
  prevTime = time;

  ballLogic();
  paddleLogic();
  cpuPaddleLogic();
  playerPaddleLogic();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function resetBall(loser) {
  ball.position.setX(0);
  ball.position.setZ(0);
  if (loser == 1) {
    ballDirZ = -1;
  } else {
    ballDirZ = 1;
  }
  ballDirX = 1;
}

function ballLogic() {
  if (ball.position.z <= -15) {
    resetBall(2);
  } else if (ball.position.z >= 15) {
    resetBall(1);
  } else if (ball.position.x < -9.5) {
    ballDirX = -ballDirX;
  } else if (ball.position.x > 9.5) {
    ballDirX = -ballDirX;
  }

  ball.position.x += ballDirX * ballSpeed;
  ball.position.z += ballDirZ * ballSpeed;
}

function paddleLogic() {
  if (ball.position.z >= paddle1.position.z - 0.9) {
    if (
      ball.position.x <= paddle1.position.x + 1.1 &&
      ball.position.x >= paddle1.position.x - 1.1
    ) {
      paddle1.material.color.set("green");
      ballDirZ = -ballDirZ;
    }
  } else if (ball.position.z <= paddle2.position.z + 0.9) {
    if (
      ball.position.x <= paddle2.position.x + 1.1 &&
      ball.position.x >= paddle2.position.x - 1.1
    ) {
      paddle2.material.color.set("green");
      ballDirZ = -ballDirZ;
    }
  }
}

function cpuPaddleLogic() {
  paddle2DirX = (ball.position.x - paddle2.position.x) * paddleSpeed;
  if (Math.abs(paddle2DirX) <= paddleSpeed) {
    paddle2.position.x += paddle2DirX;
  } else {
    if (paddle2DirX > paddleSpeed) {
      paddle2.position.x += paddleSpeed;
    } else if (paddle2DirX < -paddleSpeed) {
      paddle2.position.x -= paddleSpeed;
    }
  }
}

function playerPaddleLogic() {
  if (movePaddleLeft) {
    if (paddle1.position.x >= -15) {
      paddle1DirX = -paddleSpeed * 0.5;
    } else {
      paddle1DirX = 0;
    }
  } else if (movePaddleRight) {
    if (paddle1.position.x <= 15) {
      paddle1DirX = paddleSpeed * 0.5;
    } else {
      paddle1DirX = 0;
    }
  } else {
    paddle1DirX = 0;
  }

  paddle1.position.x += paddle1DirX;
}
