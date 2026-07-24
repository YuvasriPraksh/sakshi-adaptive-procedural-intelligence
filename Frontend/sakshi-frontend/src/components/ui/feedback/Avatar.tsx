import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<AvatarSize, string> = {
  xs:  "h-6  w-6  text-2xs",
  sm:  "h-8  w-8  text-xs",
  md:  "h-10 w-10 text-sm",
  lg:  "h-12 w-12 text-base",
  xl:  "h-16 w-16 text-xl",
  "2xl": "h-20 w-20 text-2xl",
};

const colorPalette = [
  "bg-royal-500   text-white",
  "bg-emerald-600 text-white",
  "bg-amber-500   text-white",
  "bg-danger-500  text-white",
  "bg-navy-600    text-white",
  "bg-purple-500  text-white",
  "bg-pink-500    text-white",
  "bg-teal-500    text-white",
];

function pickColor(name: string) {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colorPalette[code % colorPalette.length];
}

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  name?:      string;
  src?:       string;
  size?:      AvatarSize;
  online?:    boolean;
  className?: string;
}

export function Avatar({ name = "", src, size = "md", online, className, ...props }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !src || imgError;

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-full overflow-hidden font-semibold select-none",
        sizeMap[size],
        showFallback && pickColor(name),
      )}>
        {!showFallback ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            {...props}
          />
        ) : (
          <span aria-label={name}>{initials(name) || "?"}</span>
        )}
      </div>
      {online !== undefined && (
        <span className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-background",
          size === "xs" || size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
          online ? "bg-emerald-500" : "bg-muted-foreground/50",
        )} />
      )}
    </div>
  );
}

// ─── Avatar Group ─────────────────────────────────────────────────────────────
export interface AvatarGroupProps {
  users:      { name: string; src?: string }[];
  max?:       number;
  size?:      AvatarSize;
  className?: string;
}

export function AvatarGroup({ users, max = 4, size = "sm", className }: AvatarGroupProps) {
  const shown  = users.slice(0, max);
  const extra  = users.length - max;
  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((u, i) => (
        <div key={i} className="-ml-2 first:ml-0 ring-2 ring-background rounded-full">
          <Avatar name={u.name} src={u.src} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div className={cn(
          "-ml-2 ring-2 ring-background rounded-full flex items-center justify-center bg-muted font-semibold text-muted-foreground",
          sizeMap[size],
        )}>
          +{extra}
        </div>
      )}
    </div>
  );
}
