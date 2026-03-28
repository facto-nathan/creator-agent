import Link from "next/link";

export default function DNANotFound() {
  return (
    <main className="min-h-dvh bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone mb-8">
          Everyone Creators
        </p>
        <h1 className="text-[26px] font-light tracking-[-0.02em] text-primary-text mb-3">
          DNA 카드를 찾을 수 없어요
        </h1>
        <p className="text-[15px] text-secondary-text leading-[1.7] mb-8">
          이 링크의 DNA 카드가 만료되었거나 존재하지 않아요.
          <br />
          나만의 DNA 카드를 만들어볼까요?
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3.5 bg-primary-text text-accent-inverse rounded-full text-[14px] font-medium hover:bg-[#2C2620] transition-colors duration-200"
        >
          나만의 DNA 카드 만들기
        </Link>
      </div>
    </main>
  );
}
