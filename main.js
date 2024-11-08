import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import floor from "./assets/floor.jpg";
import ceilingImg from "./assets/ceiling.jpg";
import wallImg from "./assets/wall.jpg";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let paddle1DirX = 0;
let paddle2DirX = 0;
let paddleSpeed = 0.2;

let ballDirX = 1;
let ballDirZ = 1;
let ballSpeed = 0.1;

const gui = new dat.GUI();
const options = {
  angle: 1,
  penumbra: 0,
  intensity: 100,
};

gui.add(options, "angle", 0, 1);
gui.add(options, "penumbra", 0, 1);
gui.add(options, "intensity", 0, 200);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const textureLoader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

let movePaddleLeft = false;
let movePaddleRight = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
const objects = [];
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

    case "Space":
      if (canJump === true) velocity.y += 200;
      canJump = false;
      break;
  }
};

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

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// const orbit = new OrbitControls(camera, renderer.domElement);
// scene.add(orbit);

camera.position.set(0, 8, 25);
// orbit.update();

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(camera.position);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.y = 15;
scene.add(directionalLight);

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(dLightHelper);

const spotLight = new THREE.SpotLight(0xffffff, 100);
spotLight.position.set(0, 10, 0);
spotLight.castShadow = true;
scene.add(spotLight);

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

scene.add(spotLight);

const floorTexture = textureLoader.load(floor);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(20, 20);

const groundGeomtery = new THREE.BoxGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: "#eef0e1",
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
ceilingTexture.repeat.set(20, 20);

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

const wallGroup = new THREE.Group();
scene.add(wallGroup);

const wallTexture = textureLoader.load(wallImg);
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(20, 20);

const frontWall = new THREE.Mesh(
  new THREE.BoxGeometry(100, 50, 0.001),
  new THREE.MeshLambertMaterial({ map: wallTexture }),
);
frontWall.position.z = -50;
frontWall.position.y = 15;

const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(100, 50, 0.001),
  new THREE.MeshLambertMaterial({ map: wallTexture }),
);
backWall.position.z = 50;
backWall.position.y = 15;

const leftWall = new THREE.Mesh(
  new THREE.BoxGeometry(100, 50, 0.001),
  new THREE.MeshLambertMaterial({
    map: wallTexture,
  }),
);
leftWall.position.x = -50;
leftWall.position.y = 15;
leftWall.rotation.y = Math.PI / 2;

const rightWall = new THREE.Mesh(
  new THREE.BoxGeometry(100, 50, 0.001),
  new THREE.MeshLambertMaterial({
    map: wallTexture,
  }),
);
rightWall.position.x = 50;
rightWall.position.y = 15;
rightWall.rotation.y = Math.PI / 2;

wallGroup.add(frontWall, backWall, leftWall, rightWall);

// for (let i = 0; i < wallGroup.children.length; i++) {
//   wallGroup.children[i].BBox = new THREE.Box3();
//   wallGroup.children[i].BBox.setFromObject(wallGroup.children[i]);
// }
// Create the ceiling
// const ceilingGeometry = new THREE.PlaneBufferGeometry(50, 50);
// const ceilingMaterial = new THREE.MeshLambertMaterial({
//   color: "blue",
// });

// const ceilingPlane = new THREE.Mesh(ceilingGeometry, ceilingMaterial); // create ceiling with geometry and material
// ceilingPlane.rotation.x = Math.PI / 2; // this is 90 degrees
// ceilingPlane.position.y = 12;
// scene.add(ceilingPlane);

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
scene.add(table);

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

const pillarGeometry = new THREE.BoxGeometry(2, 20, 2);
const pillarMaterial = new THREE.MeshStandardMaterial({
  color: 0x909acf,
});

const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
pillar2.position.x = 20;
pillar2.position.z += 5;
scene.add(pillar2);

// const assetLoader = new GLTFLoader();
// assetLoader.load(
//   wallLeather.href,
//   (gltf) => {
//     const model = gltf.scene;
//     scene.add(model);
//     frontWall.material.map = model;
//     model.scale.set(8, 8, 8);
//     model.position.set(25, -9.5, -10);
//   },
//   undefined,
//   function (error) {
//     console.error(error);
//   },
// );

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

function animate() {
  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity;
  sLightHelper.update();

  const time = performance.now();
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.object.position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.object.position.y += velocity.y * delta; // new behavior

    if (controls.object.position.y < 10) {
      velocity.y = 0;
      controls.object.position.y = 10;

      canJump = true;
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
  } else if (ball.position.x <= -10) {
    ballDirX = -ballDirX;
  } else if (ball.position.x >= 10) {
    ballDirX = -ballDirX;
  }

  ball.position.x += ballDirX * ballSpeed;
  ball.position.z += ballDirZ * ballSpeed;
}

function paddleLogic() {
  if (ball.position.z >= paddle1.position.z) {
    if (
      ball.position.x <= paddle1.position.x + 0.5 &&
      ball.position.x >= paddle1.position.x - 0.5
    ) {
      paddle1.material.color.set("#ff0000");
      ballDirZ = -ballDirZ;
    } else {
      paddle1.material.color.set("#00ff00");
      ball.position.setX(0);
      ball.position.setZ(0);
    }
  } else if (ball.position.z <= paddle2.position.z) {
    if (
      ball.position.x <= paddle2.position.x + 0.5 &&
      ball.position.x >= paddle2.position.x - 0.5
    ) {
      paddle2.material.color.set("#ff0000");
      ballDirZ = -ballDirZ;
    } else {
      paddle2.material.color.set("#00ff00");
      ball.position.setX(0);
      ball.position.setZ(0);
    }
  }
}

function cpuPaddleLogic() {
  paddle2DirX = (ball.position.x - paddle2.position.x) * 0.2;
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
    if (paddle1.position.x > -15) {
      paddle1DirX = -paddleSpeed * 0.5;
    } else {
      paddle1DirX = 0;
    }
  } else if (movePaddleRight) {
    if (paddle1.position.x < 15) {
      paddle1DirX = paddleSpeed * 0.5;
    } else {
      paddle1DirX = 0;
    }
  } else {
    paddle1DirX = 0;
  }

  paddle1.position.x += paddle1DirX;
}
