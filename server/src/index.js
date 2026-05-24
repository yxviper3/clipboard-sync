import crypto from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import multer from "multer";
import { Server } from "socket.io";
import { addRoomItem, clearRoom, deleteRoomItem, getRoomItems } from "./store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "0.0.0.0";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ROOM_PATTERN = /^\d{4}$/;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "DELETE"]
  }
});

const uploadsDir = process.env.CLIPBOARD_UPLOADS_DIR
  ? path.resolve(process.env.CLIPBOARD_UPLOADS_DIR)
  : path.resolve(__dirname, "../uploads");
const clientDistDir = process.env.CLIENT_DIST_DIR
  ? path.resolve(process.env.CLIENT_DIST_DIR)
  : path.resolve(__dirname, "../../client/dist");
await mkdir(uploadsDir, { recursive: true });

app.use(
  cors({
    origin: true,
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const roomSockets = new Map();

function isRoomId(value) {
  return typeof value === "string" && ROOM_PATTERN.test(value);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function detectType(text) {
  try {
    const url = new URL(text);
    return ["http:", "https:"].includes(url.protocol) ? "link" : "text";
  } catch {
    return "text";
  }
}

function getFileUrl(filename) {
  return `/uploads/${filename}`;
}

function joinRoom(socket, roomId) {
  socket.join(roomId);
  socket.data.roomId = roomId;

  const sockets = roomSockets.get(roomId) || new Set();
  sockets.add(socket.id);
  roomSockets.set(roomId, sockets);
  io.to(roomId).emit("room:devices", sockets.size);
}

function leaveCurrentRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId) return;

  socket.leave(roomId);
  const sockets = roomSockets.get(roomId);
  if (sockets) {
    sockets.delete(socket.id);
    if (sockets.size === 0) {
      roomSockets.delete(roomId);
    } else {
      io.to(roomId).emit("room:devices", sockets.size);
    }
  }
  socket.data.roomId = undefined;
}

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "clipboard-sync-server" });
});

app.get("/api/network", (request, response) => {
  const interfaces = os.networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter(Boolean)
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address);

  response.json({
    port: PORT,
    addresses,
    urls: addresses.map((address) => `${request.protocol}://${address}:${PORT}`)
  });
});

app.get("/api/rooms/:roomId/items", (request, response) => {
  const { roomId } = request.params;
  if (!isRoomId(roomId)) {
    response.status(400).json({ message: "Room code must be a 4-digit number." });
    return;
  }

  response.json({ items: getRoomItems(roomId) });
});

app.post("/api/rooms/:roomId/upload", upload.single("file"), async (request, response) => {
  const { roomId } = request.params;
  if (!isRoomId(roomId)) {
    response.status(400).json({ message: "Room code must be a 4-digit number." });
    return;
  }

  if (!request.file) {
    response.status(400).json({ message: "No file uploaded." });
    return;
  }

  const isImage = request.file.mimetype.startsWith("image/");
  const fileUrl = getFileUrl(request.file.filename);
  const item = {
    id: crypto.randomUUID(),
    roomId,
    type: isImage ? "image" : "file",
    content: request.file.originalname || "file",
    fileUrl,
    imageUrl: isImage ? fileUrl : undefined,
    fileName: request.file.originalname || request.file.filename,
    fileSize: request.file.size,
    mimeType: request.file.mimetype,
    createdAt: new Date().toISOString()
  };

  await addRoomItem(roomId, item);
  io.to(roomId).emit("item:new", item);
  response.status(201).json({ item });
});

app.delete("/api/rooms/:roomId/items/:itemId", async (request, response) => {
  const { roomId, itemId } = request.params;
  if (!isRoomId(roomId)) {
    response.status(400).json({ message: "Room code must be a 4-digit number." });
    return;
  }

  await deleteRoomItem(roomId, itemId);
  io.to(roomId).emit("item:deleted", { id: itemId });
  response.json({ ok: true });
});

app.delete("/api/rooms/:roomId/items", async (request, response) => {
  const { roomId } = request.params;
  if (!isRoomId(roomId)) {
    response.status(400).json({ message: "Room code must be a 4-digit number." });
    return;
  }

  await clearRoom(roomId);
  io.to(roomId).emit("items:cleared");
  response.json({ ok: true });
});

if (existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
  app.get("*", (request, response, next) => {
    if (
      request.path.startsWith("/api") ||
      request.path.startsWith("/uploads") ||
      request.path.startsWith("/socket.io")
    ) {
      next();
      return;
    }

    response.sendFile(path.join(clientDistDir, "index.html"));
  });
}

io.on("connection", (socket) => {
  socket.on("room:join", async (roomId, callback) => {
    if (!isRoomId(roomId)) {
      callback?.({ ok: false, message: "Room code must be a 4-digit number." });
      return;
    }

    leaveCurrentRoom(socket);
    joinRoom(socket, roomId);
    callback?.({ ok: true, items: getRoomItems(roomId) });
  });

  socket.on("item:create", async (payload, callback) => {
    const roomId = socket.data.roomId;
    const content = normalizeText(payload?.content);

    if (!isRoomId(roomId)) {
      callback?.({ ok: false, message: "Join a room before sending." });
      return;
    }

    if (!content) {
      callback?.({ ok: false, message: "Content cannot be empty." });
      return;
    }

    if (content.length > 5000) {
      callback?.({ ok: false, message: "Text is too long. Keep it under 5000 characters." });
      return;
    }

    const item = {
      id: crypto.randomUUID(),
      roomId,
      type: detectType(content),
      content,
      createdAt: new Date().toISOString()
    };

    await addRoomItem(roomId, item);
    io.to(roomId).emit("item:new", item);
    callback?.({ ok: true, item });
  });

  socket.on("disconnect", () => {
    leaveCurrentRoom(socket);
  });
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    response.status(413).json({ message: "File must be 100MB or smaller." });
    return;
  }

  response.status(400).json({ message: error.message || "Request failed." });
});

server.listen(PORT, HOST, () => {
  console.log(`Clipboard Sync server running at http://localhost:${PORT}`);
});
