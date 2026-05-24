import type { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export default function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-white/[0.07] shadow-panel backdrop-blur-2xl ${className}`}
    >
      {children}
    </section>
  );
}
