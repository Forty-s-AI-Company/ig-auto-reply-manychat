import Image from "next/image";

type InboxPilotLogoProps = {
  markOnly?: boolean;
  size?: "sm" | "md";
  tone?: "light" | "dark";
  className?: string;
};

export function InboxPilotLogo({ markOnly = false, size = "md", tone = "dark", className = "" }: InboxPilotLogoProps) {
  const dimensions = markOnly
    ? size === "sm"
      ? "h-8 w-8"
      : "h-9 w-9"
    : size === "sm"
      ? "h-8 w-[132px]"
      : "h-10 w-[166px]";
  const toneClass = tone === "light" ? "brightness-0 invert" : "";

  return (
    <span className={`inline-flex items-center ${dimensions} ${className}`}>
      <Image
        src="/inboxpilot-logo.png"
        alt="InboxPilot"
        width={1159}
        height={348}
        priority
        className={`h-full w-full object-contain object-left ${toneClass}`}
      />
    </span>
  );
}
