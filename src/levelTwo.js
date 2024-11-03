const trackRadius = 190;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const arcAngle1 = (1 / 15) * Math.PI;

const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const arcCenterX = (
  Math.cos(arcAngle1) * innerTrackRadius +
  Math.cos(arcAngle2) * outerTrackRadius
) / 2;

const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius);
const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius);

const carColors = [0x1abc9c, 0x16a085, 0x2ecc71, 0x27ae60, 0x3498db, 0x2980b9, 0x9b59b6, 0x8e44ad, 0x34495e, 0x2c3e50, 0xf1c40f, 0xf39c12, 0xe67e22, 0xd35400, 0xe74c3c, 0xc0392b, 0xbdc3c7, 0x95a5a6, 0x7f8c8d];

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

function carWindshieldTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext("2d");
  
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 32);
  
  context.fillStyle = "#666666";
  context.fillRect(8, 8, 48, 24);
  
  return new THREE.CanvasTexture(canvas);
};

function carSideTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const context = canvas.getContext("2d");
  
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 128, 32);
  
  context.fillStyle = "#666666";
  context.fillRect(10, 8, 38, 24);
  context.fillRect(58, 8, 60, 24);
  
  return new THREE.CanvasTexture(canvas);
};

function carWheel() {
  const wheel = new THREE.Mesh(
    new THREE.BoxBufferGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  )
  wheel.position.z = 6;
  return wheel;
}

function roadLines(mapWidth, mapHeight) {
  const canvas = document.createElement("canvas");
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext("2d");

  context.fillStyle = "#546e90";
  context.fillRect(0, 0, mapWidth, mapHeight);

  context.lineWidth = 2;
  context.strokeStyle = "#E0FFFF";
  context.setLineDash([10, 14]);

  const circleRadius = 190;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;
  const offsetX = circleRadius;
  context.beginPath();

  // Top left semicircle (clockwise)
  context.arc(
    centerX - offsetX,
    centerY,
    circleRadius,
    Math.PI,
    0,
    false
  );

  // Bottom right semicircle (counterclockwise)
  context.arc(
    centerX + offsetX,
    centerY,
    circleRadius,
    Math.PI,
    0,
    true
  );

  // Top right semicircle (counterclockwise)
  context.arc(
    centerX + offsetX,
    centerY,
    circleRadius,
    0, 
    Math.PI, 
    true            
  );

  // Bottom left semicircle (clockwise)
  context.arc(
    centerX - offsetX,
    centerY,
    circleRadius,
    0,                 
    Math.PI,            
    false               
  );

  context.stroke();

  return new THREE.CanvasTexture(canvas);
};




const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -300, 400);
scene.add(dirLight);

const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 1000;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.OrthographicCamera(
  cameraWidth / -2,
  cameraWidth / 2,
  cameraHeight / 2,
  cameraHeight / -2,
  0,
  1000
);

camera.position.set(0, -240, 300);
camera.lookAt(0,0,0);

renderMap(cameraWidth, cameraHeight * 2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);

function car() {
  const car = new THREE.Group();
  
  const backWheel = carWheel();
  backWheel.position.x = -18;
  car.add(backWheel);
  
  const frontWheel = carWheel();
  frontWheel.position.x = 18;
  car.add(frontWheel);
  
  const main = new THREE.Mesh(
    new THREE.BoxBufferGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color: randomColor(carColors) })
  )
  main.position.z = 12;
  car.add(main);
  
  const cft = carWindshieldTexture();
  cft.center = new THREE.Vector2(0.5, 0.5);
  cft.rotation = Math.PI / 2;
  
  const cbt = carWindshieldTexture();
  cbt.center = new THREE.Vector2(0.5, 0.5);
  cbt.rotation = - Math.PI / 2;
  
  const cright = carSideTexture();
  
  const cleft = carSideTexture();
  cleft.flipY = false;
  
  const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 24, 12), [
    new THREE.MeshLambertMaterial( { map: cft }),
    new THREE.MeshLambertMaterial( { map: cbt }),
    new THREE.MeshLambertMaterial( { map: cleft }),
    new THREE.MeshLambertMaterial( { map: cright }),
    new THREE.MeshLambertMaterial( { color: 0xffffff }),
    new THREE.MeshLambertMaterial( { color: 0xffffff }),
  ]);
    
  cabin.position.z = 25.5;
  cabin.position.x = -6;
  car.add(cabin);
  
  return car;
};

function leftIsland() {
  const islandLeft = new THREE.Shape();

  islandLeft.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    0,
    Math.PI * 2,
    false
  );

  return islandLeft;
}

function getMiddleIsland() {
  const islandMiddle = new THREE.Shape();

  islandMiddle.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle3,
    -arcAngle3,
    true
  );

  islandMiddle.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI + arcAngle3,
    Math.PI - arcAngle3,
    true
  );

  return islandMiddle;
}

function rightIsland() {
  const islandRight = new THREE.Shape();

  islandRight.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    0,
    Math.PI * 2,
    true
  );

  return islandRight;
}

function outerIsland(mapWidth, mapHeight) {
  const field = new THREE.Shape();

  field.moveTo(-mapWidth / 2, -mapHeight / 2);
  field.lineTo(0, -mapHeight / 2);

 field.absarc(
    -arcCenterX,
    0,
    outerTrackRadius,
    -arcAngle4,
    arcAngle4,
    true
  );

  field.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI - arcAngle4,
    Math.PI + arcAngle4,
    true
  );

  field.lineTo(0, -mapHeight / 2);
  field.lineTo(mapWidth / 2, -mapHeight / 2);
  field.lineTo(mapWidth / 2, mapHeight / 2);
  field.lineTo(-mapWidth / 2, mapHeight / 2);

  return field;
}




function renderMap(mapWidth, mapHeight) {
  const lineMarkingsTexture = roadLines(mapWidth, mapHeight);

  const planeGeometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight);
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: lineMarkingsTexture,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);
  const leftI = leftIsland();
  const rightI = rightIsland();
  const outerI = outerIsland(mapWidth, mapHeight);
  const fieldGeometry = new THREE.ExtrudeBufferGeometry(
    [leftI, rightI, outerI],
    { depth: 6, bevelEnabled: false, curveSegments: 64 }
  );
  
  const fieldMesh = new THREE.Mesh(fieldGeometry, [
    new THREE.MeshLambertMaterial( { color: 0x2DC7FF }),
    new THREE.MeshLambertMaterial( { color: 0x23311c })
  ]);
  scene.add(fieldMesh);
};

let ready;
let score;
let highScore = 0;
const scoreElement = document.getElementById("score");
let otherVehicles = [];
let lastTimestamp;
let playerAngleMoved;
let accelerate = false;
let decelerate = false;
const playerCar = car();
scene.add(playerCar);
const playerAngleInitial = Math.PI;
const speed = 0.0017;


reset();

function reset() {
  playerAngleMoved = 0;
  movePlayerCar(0);
  score = 0;
  scoreElement.innerText = score;
  lastTimestamp = undefined;
  
  otherVehicles.forEach((vehicle) => {
    scene.remove(vehicle.mesh);
  });
  otherVehicles = [];
  
  renderer.render(scene, camera);
  ready = true;
};

function startGame() {
  if (ready) {
    ready = false;
    renderer.setAnimationLoop(animation);
    document.getElementById("score").classList.remove("hidden");
    document.getElementById("info").classList.add("hidden");
    document.getElementById("info-keys").classList.remove("hidden");
  }
};

window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    startGame();
    accelerate = true;
    return;
  }
  
  if (event.key === "ArrowDown") {
    decelerate = true;
    return;
  }
  
  if (event.key === "R" || event.key === "r") {
    reset();
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("info").classList.remove("hidden");
    document.getElementById("info-keys").classList.add("hidden");
    return;
  }
});


window.addEventListener("keyup", function (event) {
  if (event.key == "ArrowUp") {
    accelerate = false;
    return;
  }
  
  if (event.key == "ArrowDown") {
    decelerate = false;
    return;
  }
});

function animation(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    return;
  }
  
  const timeDelta = timestamp - lastTimestamp;
  
  movePlayerCar(timeDelta);
  
  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 4));
  
  if (laps != score) {
    score = laps;
    scoreElement.innerText = score;
  }
  
  if (otherVehicles.length < (laps + 1) / 2) addVehicle()
  
  moveOtherVehicles(timeDelta);
  
  hitDetection();
  
  renderer.render(scene, camera);
  lastTimestamp = timestamp;
};

function movePlayerCar(timeDelta) {
  const playerSpeed = getPlayerSpeed();
  playerAngleMoved += playerSpeed * timeDelta;

  const totalDistance = playerAngleMoved % (4 * Math.PI);

  const circleRadius = 190;
  const centerXLeft = -arcCenterX;
  const centerXRight = arcCenterX;
  const centerY = 0;
  
  const segmentLength = Math.PI;

  let playerX, playerY, rotation;

  if (totalDistance < segmentLength) {
    // Top left semicircle (clockwise)
    const angle = Math.PI - totalDistance;
    playerX = Math.cos(angle) * circleRadius + centerXLeft;
    playerY = Math.sin(angle) * circleRadius + centerY;
    rotation = angle - Math.PI / 2;
  } else if (totalDistance < 2 * segmentLength) {
    // Bottom right semicircle (counterclockwise)
    const angle = Math.PI - (totalDistance - segmentLength);
    playerX = Math.cos(angle) * circleRadius + centerXRight;
    playerY = -Math.sin(angle) * circleRadius + centerY;
    rotation = -angle + Math.PI / 2;
  } else if (totalDistance < 3 * segmentLength) {
    // Top right semicircle (counterclockwise)
    const angle = totalDistance - 2 * segmentLength;
    playerX = Math.cos(angle) * circleRadius + centerXRight;
    playerY = Math.sin(angle) * circleRadius + centerY;
    rotation = angle + Math.PI / 2;
  } else {
    // Bottom left semicircle (clockwise)
    const angle = totalDistance - 3 * segmentLength;
    playerX = Math.cos(angle) * circleRadius + centerXLeft;
    playerY = -Math.sin(angle) * circleRadius + centerY;
    rotation = -angle - Math.PI / 2;
  }

  playerCar.position.x = playerX;
  playerCar.position.y = playerY;
  playerCar.rotation.z = rotation;
};




function getPlayerSpeed() {
  if (accelerate) return speed * 2;
  if (decelerate) return speed * 0.5;
  return speed;
};

function addVehicle() {
  const mesh = car();
  scene.add(mesh);
  
  const clockwise = false;
  const angle = -Math.PI / 2;
  
  const speed = getVehicleSpeed();
  
  otherVehicles.push({ mesh, clockwise, angle, speed });
};

function getVehicleSpeed() {
  const minSpeed = 1;
  const maxSpeed = 2;
  return minSpeed + Math.random() * (maxSpeed - minSpeed);
};

function moveOtherVehicles(timeDelta) {
  otherVehicles.forEach((vehicle) => {
    if (vehicle.clockwise) {
      vehicle.angle -= speed * timeDelta * vehicle.speed;
    } else {
      vehicle.angle += speed * timeDelta * vehicle.speed;
    }
    
    const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
    const vehicleY = Math.sin(vehicle.angle) * trackRadius;
    const rotation = vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);
    
    vehicle.mesh.position.x = vehicleX;
    vehicle.mesh.position.y = vehicleY;
    vehicle.mesh.rotation.z = rotation;
  });
};

function getHitZonePosition(center, angle, clockwise, distance) {
  const directionAngle = angle + (clockwise ? -Math.PI / 2 : +Math.PI / 2);
  return {
    x: center.x + Math.cos(directionAngle) * distance,
    y: center.y + Math.sin(directionAngle) * distance,
  };
};

function hitDetection() {
  const playerHitZone1 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    15
  );

  const playerHitZone2 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    -15
  );
  
  const hit = otherVehicles.some((vehicle) => {
    const vehicleHitZone1 = getHitZonePosition(
      vehicle.mesh.position,
      vehicle.angle,
      vehicle.clockwise,
      15
    );

    const vehicleHitZone2 = getHitZonePosition(
      vehicle.mesh.position,
      vehicle.angle,
      vehicle.clockwise,
      -15
    );

    if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
    if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;
    if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    if (getDistance(playerHitZone2, vehicleHitZone2) < 40) return true;
  });
  
  if (hit) {
    renderer.setAnimationLoop(null);

    const modal = document.getElementById("modal");
    const modalContent = modal.querySelector(".modal-content");

    if (score > highScore) {
      highScore = score;
      modalContent.innerHTML = `<h1>New High Score: ${score}</h1><p>Press "R" to restart</p>`;
    } else {
      modalContent.innerHTML = `<h1>Score: ${score}</h1><p>Press "R" to restart</p>`;
    }

    modal.classList.remove("hidden");
    document.getElementById("score").classList.add("hidden");
  }

};

function getDistance(coordinate1, coordinate2) {
  return Math.sqrt(
    (coordinate2.x - coordinate1.x) ** 2 + (coordinate2.y - coordinate1.y) ** 2
  );
};
