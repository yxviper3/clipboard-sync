import { ChangeEvent, ClipboardEvent, DragEvent, KeyboardEvent, useRef, useState } from "react";
import { Loader2, Paperclip, Send, Sparkles, UploadCloud } from "lucide-react";
import GlassPanel from "./GlassPanel";

interface ComposerProps {
  uploading: boolean;
  onSend: (content: string) => Promise<boolean>;
  onUpload: (file: File) => Promise<boolean>;
}

export default function Composer({ uploading, onSend, onUpload }: ComposerProps) {
  const [content, setContent] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const submit = async () => {
    const ok = await onSend(content);
    if (ok) setContent("");
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (file) {
      await onUpload(file);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      await uploadFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) {
      await uploadFiles(event.dataTransfer.files);
    }
  };

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(event.clipboardData.files)[0];
    if (file) {
      event.preventDefault();
      await onUpload(file);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/15 text-cyan-200">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">发送到所有设备</h2>
          <p className="text-sm text-slate-400">Ctrl + Enter 发送，支持粘贴图片和上传 100MB 内文件</p>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="输入文本、链接，或在这里 Ctrl+V 粘贴图片..."
        className="mt-5 min-h-36 w-full resize-none rounded-3xl border border-white/10 bg-black/20 p-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`mt-4 rounded-3xl border border-dashed p-5 transition ${
          dragging
            ? "border-cyan-200 bg-cyan-300/10"
            : "border-white/15 bg-white/[0.035] hover:border-white/25"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-slate-200 transition hover:bg-white/[0.06]"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          <span>{uploading ? "文件上传中..." : "拖拽文件到这里，或点击选择文件"}</span>
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void submit()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 px-5 py-3 font-semibold text-slate-950 shadow-glow transition hover:scale-[1.01] active:scale-[0.99]"
        >
          <Send className="h-4 w-4" />
          发送内容
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-semibold text-white transition hover:bg-white/[0.1]"
        >
          <Paperclip className="h-4 w-4" />
          上传文件
        </button>
      </div>
    </GlassPanel>
  );
}
