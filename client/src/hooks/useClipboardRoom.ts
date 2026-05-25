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
  const [uploadProgress, setUploadProgress] = useState(0);

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

        toast.success("已发送到所有在线设备");
        resolve(true);
      });
    });
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("文件不能超过 100MB");
        return false;
      }

      const formData = new FormData();
      formData.append("file", file);
      setUploading(true);
      setUploadProgress(0);

      try {
        await new Promise<void>((resolve, reject) => {
          const request = new XMLHttpRequest();
          request.open("POST", `${API_URL}/api/rooms/${roomCode}/upload`);

          request.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          };

          request.onload = () => {
            let result: { message?: string } = {};
            try {
              result = JSON.parse(request.responseText || "{}");
            } catch {
              result = {};
            }

            if (request.status >= 200 && request.status < 300) {
              setUploadProgress(100);
              resolve();
              return;
            }

            reject(new Error(result.message || "文件上传失败"));
          };

          request.onerror = () => reject(new Error("网络错误，文件上传失败"));
          request.onabort = () => reject(new Error("文件上传已取消"));
          request.send(formData);
        });

        toast.success(file.type.startsWith("image/") ? "图片已同步" : "文件已同步");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "文件上传失败");
        return false;
      } finally {
        window.setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 350);
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
      uploadProgress,
      sendText,
      uploadFile,
      deleteItem,
      clearItems
    }),
    [items, onlineDevices, connected, loading, uploading, uploadProgress, sendText, uploadFile, deleteItem, clearItems]
  );
}
