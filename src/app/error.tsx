"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-5xl">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900">
        문제가 발생했어요
      </h1>
      <p className="mt-2 text-gray-500">
        다시 시도하거나 처음으로 돌아가 주세요.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="primary" onClick={reset}>
          다시 시도
        </Button>
        <Link href="/">
          <Button variant="secondary">처음으로</Button>
        </Link>
      </div>
    </div>
  );
}
