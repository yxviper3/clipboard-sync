import { useMemo, useState } from "react";
import PairingPage from "./pages/PairingPage";
import ClipboardPage from "./pages/ClipboardPage";
import { clearStoredRoomCode, getStoredRoomCode, storeRoomCode } from "./utils/room";

export default function App() {
  const initialRoomCode = useMemo(() => getStoredRoomCode(), []);
  const [roomCode, setRoomCode] = useState(initialRoomCode);

  const connect = (code: string) => {
    storeRoomCode(code);
    setRoomCode(code);
  };

  const disconnect = () => {
    clearStoredRoomCode();
    setRoomCode("");
  };

  return roomCode ? (
    <ClipboardPage roomCode={roomCode} onDisconnect={disconnect} />
  ) : (
    <PairingPage onConnect={connect} />
  );
}
