"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const kioskImages = [
    {
      src: "/kiosk/peacekeepers-salute.png",
      alt: "Nữ chiến sĩ Việt Nam đội mũ nồi xanh chào điều lệnh",
    },
    {
      src: "/kiosk/peacekeepers-formation.png",
      alt: "Đội hình nữ chiến sĩ gìn giữ hòa bình Việt Nam",
    },
    {
      src: "/kiosk/vietnam-un-flags.png",
      alt: "Quốc kỳ Việt Nam và cờ Liên Hợp Quốc",
    },
  ];

  async function startGame() {
    if (isStarting) {
      return;
    }

    setIsStarting(true);

    try {
      await fetch("/api/game/players", {
        method: "POST",
      });
    } finally {
      router.push("/play");
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#061526] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(74,163,223,0.35),transparent_32%),linear-gradient(135deg,#061526_0%,#0b304d_48%,#1f2b1f_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(218,37,29,0.16),transparent_32%,rgba(255,205,0,0.14))]" />
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-[#ffcd00]/20" />
      <div className="absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full border border-[#4aa3df]/20" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 shadow-2xl backdrop-blur">
            <div className="relative h-14 w-28 overflow-hidden rounded-full border-2 border-[#ffcd00] bg-black/60">
              <Image
                src="/logo-gghb.png"
                alt="Logo Lực lượng Gìn giữ Hòa bình Việt Nam"
                fill
                priority
                className="object-contain p-1.5"
                sizes="112px"
              />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ffcd00]">
                GGHB Việt Nam
              </p>
              <p className="text-sm font-bold text-white/85">
                Vietnam Peacekeeping Force
              </p>
            </div>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-[#4aa3df] text-lg font-black shadow-2xl">
            UN
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ffcd00]/30 bg-[#ffcd00]/10 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-[#ffcd00]">
              <Sparkles className="h-4 w-4" />
              Kiosk Quiz Game
            </div>

            <h1 className="font-serif text-5xl font-black leading-tight text-white md:text-7xl xl:text-8xl">
              Tìm hiểu về
              <span className="block text-[#4aa3df]">
                Lực lượng Gìn giữ Hòa bình
              </span>
              <span className="block text-[#ffcd00]">Việt Nam</span>
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-9 text-white/78">
              Thử thách kiến thức qua 5 cấp độ, vượt mốc 80% để tiếp tục và
              nhận mã phần thưởng khi hoàn thành. Hãy sẵn sàng trước khi bắt
              đầu.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={startGame}
                disabled={isStarting}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#da251d] px-8 py-4 text-xl font-black text-white shadow-[0_18px_60px_rgba(218,37,29,0.35)] transition hover:bg-[#b91d17]"
              >
                {isStarting ? "Đang bắt đầu..." : "Tham gia chơi"}
                <ChevronRight className="h-6 w-6 transition group-hover:translate-x-1" />
              </button>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">
                Chạm để bắt đầu
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Image
                src="/kiosk/peacekeepers-formation.png"
                alt="Đội hình lực lượng gìn giữ hòa bình Việt Nam"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 90vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061526]/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#ffcd00]">
                  UN Blue Helmets
                </p>
                <p className="mt-1 text-lg font-bold">
                  Bản lĩnh, chuyên nghiệp, trách nhiệm và nhân văn
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-white/60">
              Hình ảnh lực lượng
            </p>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {kioskImages.map((image) => (
              <div
                key={image.src}
                className="relative h-40 overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition duration-700 hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
