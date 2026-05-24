const ROOM_STORAGE_KEY = "clipboard-sync-room";

export function isValidRoomCode(value: string) {
  return /^\d{4}$/.test(value);
}

export function getStoredRoomCode() {
  const queryRoom = new URLSearchParams(window.location.search).get("room");
  if (queryRoom && isValidRoomCode(queryRoom)) {
    localStorage.setItem(ROOM_STORAGE_KEY, queryRoom);
    window.history.replaceState({}, "", window.location.pathname);
    return queryRoom;
  }

  const stored = localStorage.getItem(ROOM_STORAGE_KEY);
  return stored && isValidRoomCode(stored) ? stored : "";
}

export function storeRoomCode(roomCode: string) {
  localStorage.setItem(ROOM_STORAGE_KEY, roomCode);
}

export function clearStoredRoomCode() {
  localStorage.removeItem(ROOM_STORAGE_KEY);
}

export function randomRoomCode() {
  return Math.floor(Math.random() * 10000).toString().padStart(4, "0");
}
