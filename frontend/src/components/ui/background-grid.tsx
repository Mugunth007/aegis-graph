import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundGrid = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-slate-950 flex flex-col items-center justify-start",
        className
      )}
    >
      {/* Aceternity Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      {/* Radial gradient mask for center spotlight glow */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
