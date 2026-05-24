import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = process.env.CLIPBOARD_DATA_DIR
  ? path.resolve(process.env.CLIPBOARD_DATA_DIR)
  : path.resolve(__dirname, "../data");
const dbPath = path.join(dataDir, "db.json");
const MAX_ITEMS_PER_ROOM = 200;

let database = { rooms: {} };
let writeQueue = Promise.resolve();

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(dbPath, "utf8");
    database = JSON.parse(raw);
    if (!database.rooms || typeof database.rooms !== "object") {
      database = { rooms: {} };
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Could not read database, starting with an empty store:", error.message);
    }
    await persist();
  }
}

function persist() {
  writeQueue = writeQueue.then(() =>
    writeFile(dbPath, JSON.stringify(database, null, 2), "utf8")
  );
  return writeQueue;
}

function getRoomItems(roomId) {
  return [...(database.rooms[roomId] || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function addRoomItem(roomId, item) {
  const items = database.rooms[roomId] || [];
  database.rooms[roomId] = [item, ...items].slice(0, MAX_ITEMS_PER_ROOM);
  await persist();
  return item;
}

async function deleteRoomItem(roomId, itemId) {
  const items = database.rooms[roomId] || [];
  const nextItems = items.filter((item) => item.id !== itemId);
  database.rooms[roomId] = nextItems;
  await persist();
  return nextItems.length !== items.length;
}

async function clearRoom(roomId) {
  database.rooms[roomId] = [];
  await persist();
}

await ensureStore();

export { addRoomItem, clearRoom, deleteRoomItem, getRoomItems };
