export type ClipboardItemType = "text" | "link" | "image";

export interface ClipboardItem {
  id: string;
  roomId: string;
  type: ClipboardItemType;
  content: string;
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface SocketAck<T = unknown> {
  ok: boolean;
  message?: string;
  item?: T;
  items?: T[];
}
