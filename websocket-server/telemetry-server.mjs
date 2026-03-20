import { WebSocketServer } from "ws";

const PORT = 8080;
const LERP_FACTOR = 0.05;
const TICK_MS = 100;
const PHASE_DURATION_MS = 3000;

const EXCAVATOR_ID = "excavator-01";

const PHASES = [
  "ROTATING_TO_DIG",
  "LOWERING_ARM",
  "DIGGING",
  "RAISING_ARM",
  "ROTATING_TO_DUMP",
  "DUMPING",
];

const digRotation = 0.9; // radians
const dumpRotation = -0.9; // radians

const maxArmAngle = 1.0; // arbitrary units/radians
const maxBucketDepth = 1.0; // arbitrary units (0..1)

function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[ws] Telemetry server listening on ws://localhost:${PORT}`);

wss.on("connection", (socket) => {
  console.log("[ws] client connected");

  socket.on("close", () => {
    console.log("[ws] client disconnected");
  });
});

// Telemetry state (values are continuously lerped toward per-phase targets).
let phaseIndex = 0;
let phaseStartedAt = Date.now();
let currentPositionX = 0.0;
let currentPositionZ = 0.0;
let currentBodyRotation = 0.0;
let currentArmAngle = 0.0;
let currentBucketDepth = 0.0;
let battery = 100;

// Position drift state (slight wobble around a drifting "work area").
let areaOffsetX = 0.0;
let areaOffsetZ = 0.0;
const wobbleSeedX = Math.random() * 1000;
const wobbleSeedZ = Math.random() * 1000;

function phaseTargets(phaseName) {
  switch (phaseName) {
    case "ROTATING_TO_DIG":
      return { bodyRotation: digRotation, armAngle: 0, bucketDepth: 0 };
    case "LOWERING_ARM":
      return { bodyRotation: digRotation, armAngle: maxArmAngle, bucketDepth: 0 };
    case "DIGGING":
      return { bodyRotation: digRotation, armAngle: maxArmAngle, bucketDepth: maxBucketDepth };
    case "RAISING_ARM":
      return { bodyRotation: digRotation, armAngle: 0, bucketDepth: 0 };
    case "ROTATING_TO_DUMP":
      return { bodyRotation: dumpRotation, armAngle: 0, bucketDepth: 0 };
    case "DUMPING":
      return { bodyRotation: dumpRotation, armAngle: 0, bucketDepth: 0 };
    default:
      return { bodyRotation: digRotation, armAngle: 0, bucketDepth: 0 };
  }
}

// Alerts.
let activeAlert = null; // { type: string, untilMs: number }
let nextAlertAtMs = Date.now() + 20000;

function pickAlertType() {
  const types = ["obstacle_detected", "low_battery", "arm_overload"];
  // Small bias toward "low_battery" as battery approaches the reset threshold.
  const biasLowBattery = battery <= 25 ? 0.45 : 0.1;

  // Weighted pick without extra deps.
  const r = Math.random();
  if (r < biasLowBattery) return "low_battery";

  // Remaining two types.
  return Math.random() < 0.5 ? "obstacle_detected" : "arm_overload";
}

let lastTickAtMs = Date.now();

setInterval(() => {
  const nowMs = Date.now();
  const deltaMs = nowMs - lastTickAtMs;
  lastTickAtMs = nowMs;

  // Phase advancement.
  while (nowMs - phaseStartedAt >= PHASE_DURATION_MS) {
    phaseIndex = (phaseIndex + 1) % PHASES.length;
    phaseStartedAt += PHASE_DURATION_MS;

    // Drift the work area slightly at the beginning of each full cycle.
    if (phaseIndex === 0) {
      areaOffsetX += (Math.random() - 0.5) * 0.12;
      areaOffsetZ += (Math.random() - 0.5) * 0.12;
      areaOffsetX = clamp(areaOffsetX, -2.0, 2.0);
      areaOffsetZ = clamp(areaOffsetZ, -2.0, 2.0);
    }
  }

  const phaseName = PHASES[phaseIndex];
  const targets = phaseTargets(phaseName);

  // Battery drains from 100 to 0 over 10 minutes, but resets when it hits 10%.
  const drainPerMs = 100 / (10 * 60 * 1000);
  battery = battery - drainPerMs * deltaMs;
  if (battery <= 10) battery = 100;

  // Manage alert lifecycle.
  if (activeAlert && nowMs >= activeAlert.untilMs) {
    activeAlert = null;
  }

  if (!activeAlert && nowMs >= nextAlertAtMs) {
    const alertType = pickAlertType();
    activeAlert = { type: alertType, untilMs: nowMs + 3000 };
    nextAlertAtMs = nowMs + 15000 + Math.random() * 10000; // ~20s average
    console.log(`[telemetry] alert_fired=${alertType}`);
  }

  // Position drift wobble around the work area.
  const wobbleX = 0.02 * Math.sin(nowMs / 1000 * 0.5 + wobbleSeedX + phaseIndex * 0.37);
  const wobbleZ = 0.02 * Math.cos(nowMs / 1000 * 0.5 + wobbleSeedZ + phaseIndex * 0.41);
  const targetX = areaOffsetX + wobbleX;
  const targetZ = areaOffsetZ + wobbleZ;

  currentPositionX = lerp(currentPositionX, targetX, LERP_FACTOR);
  currentPositionZ = lerp(currentPositionZ, targetZ, LERP_FACTOR);

  currentBodyRotation = lerp(currentBodyRotation, targets.bodyRotation, LERP_FACTOR);
  currentArmAngle = lerp(currentArmAngle, targets.armAngle, LERP_FACTOR);
  currentBucketDepth = lerp(currentBucketDepth, targets.bucketDepth, LERP_FACTOR);

  const payload = {
    id: EXCAVATOR_ID,
    phase: phaseName,
    position: { x: currentPositionX, z: currentPositionZ },
    bodyRotation: currentBodyRotation,
    armAngle: currentArmAngle,
    bucketDepth: currentBucketDepth,
    battery: clamp(battery, 0, 100),
    alert: activeAlert ? activeAlert.type : null,
  };

  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1 /* WebSocket.OPEN */) {
      client.send(message);
    }
  }
}, TICK_MS);

