"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

type ShareState = "idle" | "copied" | "shared" | "error";

const LABEL: Record<ShareState, string> = {
  idle: "결과 공유하기 📤",
  copied: "링크 복사됨! ✅",
  shared: "공유 완료! ✅",
  error: "공유 실패 😢",
};

export function ShareButton() {
  const [state, setState] = useState<ShareState>("idle");

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "원피스 카드 게임 덱 추천 결과",
          url,
        });
        setState("shared");
        trackEvent({ name: "share_clicked", data: { method: "native_share" } });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState("error");
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setState("copied");
        trackEvent({ name: "share_clicked", data: { method: "clipboard_copy" } });
      } catch {
        setState("error");
      }
    }

    setTimeout(() => setState("idle"), 2000);
  }, []);

  return (
    <Button variant={state === "idle" ? "secondary" : "ghost"} size="lg" onClick={handleShare}>
      {LABEL[state]}
    </Button>
  );
}
