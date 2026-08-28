import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon = null,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5"
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/30 active:scale-[0.98]",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 active:scale-[0.98]",
    accent: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-900/30 active:scale-[0.98]",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 active:scale-[0.98]",
    ghost: "bg-transparent hover:bg-white/10 text-slate-300 hover:text-white",
    outline: "bg-transparent border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
