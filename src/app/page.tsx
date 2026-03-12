import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <section className="mx-auto max-w-2xl text-center">
        <div className="mb-6 text-6xl">🏴‍☠️</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          나에게 맞는
          <br />
          <span className="text-op-red">원피스 카드 게임 덱</span>은?
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          5개 질문에 답하면 당신에게 딱 맞는 덱을 추천해 드려요!
        </p>

        <Link
          href="/quiz"
          className="mt-8 inline-flex h-14 items-center justify-center rounded-xl bg-op-red px-8 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:brightness-110 active:brightness-90"
        >
          덱 추천 시작하기 ⚔️
        </Link>
      </section>

      {/* Feature Highlights */}
      <section className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
        <FeatureItem
          icon="❓"
          title="5가지 간단한 질문"
          description="플레이 스타일, 선호 색상 등 간단한 질문에 답해 주세요"
        />
        <FeatureItem
          icon="🃏"
          title="18개 메타 덱 분석"
          description="S~C 티어 덱을 분석하여 최적의 덱을 찾아드려요"
        />
        <FeatureItem
          icon="🔥"
          title="OP-11 최신 메타"
          description="11탄까지의 최신 카드와 메타를 반영했어요"
        />
      </section>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <div className="mb-2 text-3xl">{icon}</div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
