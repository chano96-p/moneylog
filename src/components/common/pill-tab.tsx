"use client";

type PillTabProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function PillTab({ active, onClick, children }: PillTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 cursor-pointer rounded-full px-3.5 text-[13px] transition ${
        active
          ? "bg-gray-900 font-bold text-white"
          : "bg-white font-semibold text-gray-700 shadow-control"
      }`}
    >
      {children}
    </button>
  );
}
