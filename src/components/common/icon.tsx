type IconProps = {
  name: string;
  filled?: boolean;
  size?: number;
  color?: string;
  className?: string;
};

export function Icon({
  name,
  filled = false,
  size = 24,
  color,
  className,
}: IconProps) {
  return (
    <span
      className={`material-symbols-rounded ${className ?? ""}`}
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" ${size}`,
        color,
      }}
    >
      {name}
    </span>
  );
}
