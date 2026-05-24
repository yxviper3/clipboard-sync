import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { API_URL } from "../utils/config";
import type { ClipboardItem, SocketAck } from "../types";

export function useClipboardRoom(roomCode: string) {
  const socketRef = useRef<Socket | null>(null);
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [onlineDevices, setOnlineDevices] = useState(1);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("room:join", roomCode, (ack: SocketAck<ClipboardItem>) => {
        if (!ack.ok) {
          toast.error(ack.message || "连接失败");
          return;
        }
        setItems(ack.items || []);
        setLoading(false);
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setOnlineDevices(1);
    });

    socket.on("room:devices", (count: number) => {
      setOnlineDevices(count);
    });

    socket.on("item:new", (item: ClipboardItem) => {
      setItems((current) => {
        if (current.some((existing) => existing.id === item.id)) return current;
        return [item, ...current];
      });
    });

    socket.on("item:deleted", ({ id }: { id: string }) => {
      setItems((current) => current.filter((item) => item.id !== id));
    });

    socket.on("items:cleared", () => {
      setItems([]);
    });

    socket.on("connect_error", () => {
      setLoading(false);
      toast.error("无法连接后端服务，请确认 server 正在运行");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomCode]);

  const sendText = useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("请输入要同步的内容");
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      socketRef.current?.emit("item:create", { content: trimmed }, (ack: SocketAck<ClipboardItem>) => {
        if (!ack.ok) {
          toast.error(ack.message || "发送失败");
          resolve(false);
          return;
        }

        toast.success(ack.item?.type === "link" ? "链接已同步" : "文本已同步");
        resolve(true);
      });
    });
  }, []);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("只能上传图片文件");
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("图片不能超过 5MB");
        return false;
      }

      const formData = new FormData();
      formData.append("image", file);
      setUploading(true);

      try {
        const response = await fetch(`${API_URL}/api/rooms/${roomCode}/upload`, {
          method: "POST",
          body: formData
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "图片上传失败");
        }

        toast.success("图片已同步");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "图片上传失败");
        return false;
      } finally {
        setUploading(false);
      }
    },
    [roomCode]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const response = await fetch(`${API_URL}/api/rooms/${roomCode}/items/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        toast.error("删除失败");
        return;
      }

      toast.success("已删除");
    },
    [roomCode]
  );

  const clearItems = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/rooms/${roomCode}/items`, {
      method: "DELETE"
    });

    if (!response.ok) {
      toast.error("清空失败");
      return;
    }

    toast.success("历史已清空");
  }, [roomCode]);

  return useMemo(
    () => ({
      items,
      onlineDevices,
      connected,
      loading,
      uploading,
      sendText,
      uploadImage,
      deleteItem,
      clearItems
    }),
    [items, onlineDevices, connected, loading, uploading, sendText, uploadImage, deleteItem, clearItems]
  );
}
