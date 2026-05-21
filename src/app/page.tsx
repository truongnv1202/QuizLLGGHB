"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

const introLines = [
  "Lực lượng Gìn giữ Hòa bình Việt Nam là biểu tượng của trách nhiệm, bản lĩnh và khát vọng hòa bình.",
  "Các chiến sĩ mũ nồi xanh Việt Nam tham gia nhiệm vụ quốc tế với tinh thần chuyên nghiệp và nhân văn.",
  "Hoạt động gìn giữ hòa bình góp phần nâng cao vị thế Việt Nam trong cộng đồng quốc tế.",
  "Hãy cùng tìm hiểu những dấu mốc, nhiệm vụ và hình ảnh tiêu biểu của lực lượng GGHB Việt Nam.",
];

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = kioskImages[activeImageIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageIndex((index) => (index + 1) % kioskImages.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, []);

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
    <main className="flex min-h-[100svh] items-center justify-center overflow-hidden bg-black text-white">
      <section className="relative h-[100svh] w-full max-w-[min(100vw,calc(100svh*9/16))] overflow-hidden bg-[#061526] shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.src}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-[#04111f]/95 via-[#04111f]/35 to-[#04111f]/92" />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(74,163,223,0.25),transparent_42%,rgba(218,37,29,0.16))]" />

        <div className="relative z-10 flex h-full flex-col px-6 py-7">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/35 px-3 py-2 shadow-2xl backdrop-blur">
              <div className="relative h-12 w-24 overflow-hidden rounded-full border-2 border-[#ffcd00] bg-black/70">
                <Image
                  src="/logo-gghb.png"
                  alt="Logo Lực lượng Gìn giữ Hòa bình Việt Nam"
                  fill
                  priority
                  className="object-contain p-1.5"
                  sizes="96px"
                />
              </div>
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-[#ffcd00]">
                  GGHB Việt Nam
                </p>
                <p className="text-xs font-bold text-white/85">
                  Vietnam Peacekeeping Force
                </p>
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-[#4aa3df] text-base font-black shadow-2xl">
              UN
            </div>
          </header>

          <section className="mt-7 rounded-[1.8rem] border border-white/15 bg-black/40 p-5 shadow-2xl backdrop-blur-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ffcd00]/30 bg-[#ffcd00]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#ffcd00]">
              <Sparkles className="h-4 w-4" />
              Kiosk Quiz Game
            </div>

            <h1 className="font-serif text-[2.8rem] font-black leading-[1.03] text-white">
              Tìm hiểu về
              <span className="block text-[#4aa3df]">
                Lực lượng Gìn giữ Hòa bình
              </span>
              <span className="block text-[#ffcd00]">Việt Nam</span>
            </h1>

            <div className="mt-5 h-36 overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-4">
              <div className="animate-[kioskTextScroll_18s_linear_infinite] space-y-4">
                {[...introLines, ...introLines].map((line, index) => (
                  <p
                    key={`${line}-${index}`}
                    className="text-base font-semibold leading-7 text-white/86"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </section>

          <div className="flex-1" />

          <section className="rounded-[2rem] border border-white/15 bg-black/45 p-5 text-center shadow-2xl backdrop-blur-md">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/70">
              Chạm để bắt đầu thử thách
            </p>
            <button
              type="button"
              onClick={startGame}
              disabled={isStarting}
              className="group mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#da251d] px-8 py-5 text-2xl font-black text-white shadow-[0_18px_60px_rgba(218,37,29,0.45)] transition hover:bg-[#b91d17] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isStarting ? "Đang bắt đầu..." : "Tìm hiểu"}
              <ChevronRight className="h-7 w-7 transition group-hover:translate-x-1" />
            </button>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/70">
              Vượt qua 5 cấp độ, đạt tối thiểu 80% mỗi level để nhận mã phần
              thưởng.
            </p>
          </section>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {kioskImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`relative h-20 overflow-hidden rounded-2xl border transition ${
                  activeImageIndex === index
                    ? "border-[#ffcd00]"
                    : "border-white/20"
                }`}
                aria-label={`Hiển thị ảnh ${index + 1}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-black/20" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
