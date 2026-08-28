import React from "react";

export default function Input({
  label,
  error,
  icon = null,
  rightElement = null,
  className = "",
  containerClassName = "",
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-slate-950/60 border ${
            error ? "border-rose-500/80 focus:ring-rose-500/20" : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
          } rounded-xl py-2.5 ${icon ? "pl-11" : "pl-4"} ${
            rightElement ? "pr-11" : "pr-4"
          } text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-4 transition-all duration-200 ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 text-slate-400 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
}
