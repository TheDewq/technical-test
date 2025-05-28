import { PROCESSING_TIME } from "./constants.js";

const requestQueue = [];

export function enqueueRequest(item) {
  requestQueue.push(item);
}

// Procesa una solicitud cada 100ms = 10/s
setInterval(() => {
  if (requestQueue.length === 0) return;

  const { req, res, handler } = requestQueue.shift();

  // Ejecuta la función del handler como si estuviera enrutada normalmente
  try {
    handler(req, res);
  } catch (error) {
    console.error("REQUEST QUEUE ERROR", error);
  }
}, PROCESSING_TIME);