"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { OAuthPopupConnectButton } from "@/components/oauth/OAuthPopupConnectButton";
import type { OAuthProviderId } from "@/lib/oauth/types";

type OAuthPopupButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function OAuthPopupButton({ href, children, variant = "primary" }: OAuthPopupButtonProps) {
  const router = useRouter();
  const provider: OAuthProviderId = href.includes("mode=facebook") ? "meta-facebook" : "meta-instagram";
  const className =
    variant === "primary"
      ? "mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-bold text-white hover:bg-[#005fd0]"
      : "flex h-11 items-center justify-center rounded-md border border-[#d2d6dc] bg-white px-4 text-sm font-bold text-[#17191c] hover:bg-[#f6f7f9]";

  return (
    <OAuthPopupConnectButton
      provider={provider}
      href={href}
      className={className}
      onSuccess={() => {
        router.push("/channels#instagram");
        router.refresh();
      }}
    >
      {children}
    </OAuthPopupConnectButton>
  );
}
