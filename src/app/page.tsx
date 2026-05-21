"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type GameStats = {
  totalPlayers: number;
};

type LeaderboardEntry = {
  id: string;
  playerName: string;
  score: number;
  totalQuestions: number;
  durationMs: number;
};

type ApiResponse<T> = {
  data?: T;
};

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
  "Lực lượng Gìn giữ Hòa bình Việt Nam lan tỏa hình ảnh đất nước yêu chuộng hòa bình, trách nhiệm và nhân văn.",
  "Những chiến sĩ mũ nồi xanh Việt Nam thực hiện nhiệm vụ quốc tế với bản lĩnh, kỷ luật và tinh thần chuyên nghiệp.",
  "Hoạt động gìn giữ hòa bình góp phần nâng cao vị thế Việt Nam và thắt chặt hợp tác với Liên Hợp Quốc.",
  "Hãy tham gia thử thách để tìm hiểu những dấu mốc, nhiệm vụ và niềm tự hào của lực lượng GGHB Việt Nam.",
];

const SLIDE_INTERVAL_MS = 5200;

async function fetchJson<T>(url: string) {
  const response = await fetch(url);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.data === undefined) {
    return null;
  }

  return payload.data;
}

function formatDuration(durationMs: number) {
  const seconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const activeImage = kioskImages[activeImageIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageIndex((index) => (index + 1) % kioskImages.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchJson<GameStats>("/api/game/stats"),
      fetchJson<LeaderboardEntry[]>("/api/game/leaderboard"),
    ]).then(([statsData, leaderboardData]) => {
      if (!isMounted) {
        return;
      }

      if (statsData) {
        setGameStats(statsData);
      }

      if (leaderboardData) {
        setLeaderboard(leaderboardData.slice(0, 5));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function startGame() {
    if (isStarting) {
      return;
    }

    setIsStarting(true);

    try {
      const response = await fetch("/api/game/players", {
        method: "POST",
      });
      const payload = (await response.json()) as ApiResponse<GameStats>;

      if (payload.data) {
        setGameStats(payload.data);
      }
    } finally {
      router.push("/play");
    }
  }

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black text-white">
      <section className="relative h-full w-full max-w-[min(100vw,calc(100svh*9/16))] overflow-hidden bg-[#061526]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.src}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 1.25, ease: "easeInOut" }}
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

        <div className="absolute inset-0 bg-gradient-to-b from-[#04111f]/82 via-[#04111f]/10 to-[#04111f]/94" />
        <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(74,163,223,0.2),transparent_40%,rgba(218,37,29,0.18))]" />

        <div className="relative z-10 flex h-full flex-col px-6 py-7">
          <header className="flex items-start">
            <div className="relative h-16 w-36">
              <Image
                src="/logo-gghb.png"
                alt="Logo Lực lượng Gìn giữ Hòa bình Việt Nam"
                fill
                priority
                className="object-contain"
                sizes="144px"
              />
            </div>
          </header>

          <section className="mt-5 rounded-[1.8rem] border border-white/15 bg-black/38 p-5 shadow-2xl backdrop-blur-md">
            <h1 className="font-serif text-[2.75rem] font-black leading-[1.03] text-white">
              Tìm hiểu về
              <span className="block text-[#4aa3df]">
                Lực lượng Gìn giữ Hòa bình
              </span>
              <span className="block text-[#ffcd00]">Việt Nam</span>
            </h1>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/10 py-4">
              <div className="kiosk-marquee-track">
                {[0, 1].map((groupIndex) => (
                  <div
                    key={groupIndex}
                    className="kiosk-marquee-group whitespace-nowrap"
                    aria-hidden={groupIndex === 1}
                  >
                    {introLines.map((line, index) => (
                      <span
                        key={`${groupIndex}-${line}-${index}`}
                        className="mx-6 inline-block text-base font-semibold text-white/88"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex-1" />

          <button
            type="button"
            onClick={startGame}
            disabled={isStarting}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#da251d] px-8 py-5 text-2xl font-black uppercase tracking-[0.04em] text-white shadow-[0_18px_60px_rgba(218,37,29,0.45)] transition hover:bg-[#b91d17] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isStarting ? "Đang bắt đầu..." : "Tham Gia"}
            <ChevronRight className="h-7 w-7 transition group-hover:translate-x-1" />
          </button>

          <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-white/75">
            <Users className="h-4 w-4 text-[#ffcd00]" />
            Số lượng người chơi:{" "}
            <span className="font-black text-[#ffcd00]">
              {gameStats?.totalPlayers ?? 0}
            </span>
          </p>

          <section className="mt-3 rounded-[1.8rem] border border-white/15 bg-black/48 p-4 shadow-2xl backdrop-blur-md">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcd00]">
                  Bảng xếp hạng
                </p>
                <p className="text-xs font-semibold text-white/55">
                  Đúng nhiều nhất, nhanh nhất
                </p>
              </div>

              <div className="space-y-2">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-xl bg-black/22 px-3 py-2 text-sm"
                    >
                      <span className="font-black text-[#ffcd00]">
                        #{index + 1}
                      </span>
                      <span className="truncate font-bold">
                        {entry.playerName}
                      </span>
                      <span className="font-black">
                        {entry.score}/{entry.totalQuestions} ·{" "}
                        {formatDuration(entry.durationMs)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-black/22 px-3 py-3 text-sm font-semibold text-white/65">
                    Chưa có người chơi hoàn thành. Hãy là người đầu tiên!
                  </p>
                )}
              </div>
            </div>
          </section>

        </div>
      </section>
    </main>
  );
}
