import React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export const BentoCard = ({
  children,
  className,
  title,
  subtitle,
  icon,
  badge,
}: BentoCardProps) => {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/10 flex flex-col justify-between overflow-hidden",
        className
      )}
    >
      {/* Subtle top border glow highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {(title || icon || badge) && (
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-indigo-400">{icon}</div>}
            <div>
              {title && (
                <h3 className="font-semibold text-sm text-slate-100 tracking-tight flex items-center gap-2">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 font-normal">{subtitle}</p>
              )}
            </div>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
};
