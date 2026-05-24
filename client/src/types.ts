export type ClipboardItemType = "text" | "link" | "image" | "file";

export interface ClipboardItem {
  id: string;
  roomId: string;
  type: ClipboardItemType;
  content: string;
  fileUrl?: string;
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface SocketAck<T = unknown> {
  ok: boolean;
  message?: string;
  item?: T;
  items?: T[];
}
