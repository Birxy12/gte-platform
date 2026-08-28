import React from "react";

export default function Card({
  children,
  className = "",
  hover = false,
  glass = true,
  glow = false,
  onClick,
  ...props
}) {
  const glassStyle = glass
    ? "bg-slate-900/70 backdrop-blur-xl border border-slate-800/80"
    : "bg-slate-900 border border-slate-800";
    
  const hoverStyle = hover
    ? "transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
    : "";

  const glowStyle = glow
    ? "shadow-lg shadow-blue-500/10 border-blue-500/30"
    : "shadow-xl";

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 ${glassStyle} ${hoverStyle} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
