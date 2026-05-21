"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  "Lực lượng Gìn giữ Hòa bình Việt Nam là biểu tượng của trách nhiệm, bản lĩnh và khát vọng hòa bình.",
  "Các chiến sĩ mũ nồi xanh Việt Nam tham gia nhiệm vụ quốc tế với tinh thần chuyên nghiệp và nhân văn.",
  "Hoạt động gìn giữ hòa bình góp phần nâng cao vị thế Việt Nam trong cộng đồng quốc tế.",
  "Hãy cùng tìm hiểu những dấu mốc, nhiệm vụ và hình ảnh tiêu biểu của lực lượng GGHB Việt Nam.",
];

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const activeImage = kioskImages[activeImageIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageIndex((index) => (index + 1) % kioskImages.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch("/api/game/players").then(
        (response) =>
          response.json() as Promise<ApiResponse<{ totalPlayers: number }>>,
      ),
      fetch("/api/game/leaderboard").then(
        (response) =>
          response.json() as Promise<ApiResponse<LeaderboardEntry[]>>,
      ),
    ])
      .then(([playersPayload, leaderboardPayload]) => {
        if (!isMounted) {
          return;
        }

        setTotalPlayers(playersPayload.data?.totalPlayers ?? 0);
        setLeaderboard((leaderboardPayload.data ?? []).slice(0, 5));
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setTotalPlayers(0);
        setLeaderboard([]);
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
      await fetch("/api/game/players", {
        method: "POST",
      });
      setTotalPlayers((current) => current + 1);
    } finally {
      router.push("/play");
    }
  }

  function formatDuration(durationMs: number) {
    const seconds = Math.max(0, Math.round(durationMs / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return (
    <main className="flex h-[100dvh] items-center justify-center overflow-hidden bg-black text-white">
      <section className="relative h-[100dvh] w-full max-w-[min(100vw,calc(100dvh*9/16))] overflow-hidden bg-[#061526] shadow-2xl">
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

        <div className="absolute inset-0 bg-gradient-to-b from-[#04111f]/86 via-[#04111f]/16 to-[#04111f]/92" />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(74,163,223,0.18),transparent_48%,rgba(218,37,29,0.14))]" />

        <div className="relative z-10 flex h-full flex-col px-6 py-6">
          <header className="flex items-center justify-between gap-4">
            <div className="relative h-14 w-28 overflow-hidden rounded-full border-2 border-[#ffcd00] bg-black/70 shadow-2xl">
              <Image
                src="/logo-gghb.png"
                alt="Logo Lực lượng Gìn giữ Hòa bình Việt Nam"
                fill
                priority
                className="object-contain p-1.5"
                sizes="112px"
              />
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-[#4aa3df] text-base font-black shadow-2xl">
              UN
            </div>
          </header>

          <section className="mt-6 rounded-[1.8rem] border border-white/15 bg-black/32 p-5 shadow-2xl backdrop-blur-sm">
            <h1 className="font-serif text-[2.75rem] font-black leading-[1.03] text-white">
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

          <section className="mb-4 grid gap-3">
            <div className="grid grid-cols-[0.9fr_1.1fr] gap-3">
              <div className="rounded-3xl border border-white/15 bg-black/45 p-4 shadow-2xl backdrop-blur-md">
                <div className="mb-2 flex items-center gap-2 text-[#ffcd00]">
                  <Users className="h-5 w-5" />
                  <p className="text-xs font-black uppercase tracking-[0.18em]">
                    Tham gia
                  </p>
                </div>
                <p className="text-5xl font-black text-white">
                  {totalPlayers}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/65">
                  lượt người chơi
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-black/45 p-4 shadow-2xl backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2 text-[#ffcd00]">
                  <Trophy className="h-5 w-5" />
                  <p className="text-xs font-black uppercase tracking-[0.18em]">
                    Bảng xếp hạng
                  </p>
                </div>
                <div className="space-y-2">
                  {leaderboard.length > 0 ? (
                    leaderboard.slice(0, 3).map((entry, index) => (
                      <div
                        key={entry.id}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl bg-white/10 px-3 py-2"
                      >
                        <span className="text-sm font-black text-[#ffcd00]">
                          #{index + 1}
                        </span>
                        <span className="truncate text-sm font-bold text-white">
                          {entry.playerName}
                        </span>
                        <span className="text-xs font-black text-white/80">
                          {entry.score}/{entry.totalQuestions} ·{" "}
                          {formatDuration(entry.durationMs)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-white/10 px-3 py-3 text-sm font-semibold text-white/70">
                      Chưa có dữ liệu xếp hạng.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/15 bg-black/50 p-5 text-center shadow-2xl backdrop-blur-md">
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
        </div>
      </section>
    </main>
  );
}
