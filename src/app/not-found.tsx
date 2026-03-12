import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-5xl">🔍</div>
      <h1 className="text-2xl font-bold text-gray-900">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-2 text-gray-500">
        찾으시는 페이지가 존재하지 않아요.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-op-red px-6 font-semibold text-white transition-all hover:brightness-110"
      >
        처음으로 돌아가기
      </Link>
    </div>
  );
}
