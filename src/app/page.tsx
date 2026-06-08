"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Users, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
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
    src: "/kiosk/peacekeeper-salute-vinh.png",
    alt: "Nữ sĩ quan gìn giữ hòa bình Việt Nam chào điều lệnh",
  },
  {
    src: "/kiosk/peacekeepers-ministry.png",
    alt: "Lực lượng gìn giữ hòa bình Việt Nam tại Bộ Công an",
  },
  {
    src: "/kiosk/peacekeepers-map-training.png",
    alt: "Chiến sĩ gìn giữ hòa bình Việt Nam trao đổi trên bản đồ nhiệm vụ",
  },
  {
    src: "/kiosk/peacekeepers-welcome.png",
    alt: "Lãnh đạo gặp mặt lực lượng gìn giữ hòa bình Việt Nam",
  },
  {
    src: "/kiosk/peacekeepers-south-sudan.png",
    alt: "Lực lượng gìn giữ hòa bình Việt Nam tại Nam Sudan",
  },
];

const introLines = [
  "Lực lượng Gìn giữ Hòa bình Việt Nam lan tỏa hình ảnh đất nước yêu chuộng hòa bình, trách nhiệm và nhân văn.",
  "Những chiến sĩ mũ nồi xanh Việt Nam thực hiện nhiệm vụ quốc tế với bản lĩnh, kỷ luật và tinh thần chuyên nghiệp.",
  "Hoạt động gìn giữ hòa bình góp phần nâng cao vị thế Việt Nam và thắt chặt hợp tác với Liên Hợp Quốc.",
  "Hãy tham gia thử thách để tìm hiểu những dấu mốc, nhiệm vụ và niềm tự hào của lực lượng GGHB Việt Nam.",
];

const SLIDE_INTERVAL_MS = 5200;
const SECRET_TAP_TARGET = 7;
const SECRET_WINNER_ACCESS_NAME = "nguyen truong hai";

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

function normalizeAccessName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [isSecretPromptOpen, setIsSecretPromptOpen] = useState(false);
  const [secretAccessName, setSecretAccessName] = useState("");
  const [secretError, setSecretError] = useState<string | null>(null);
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
        setLeaderboard(leaderboardData.slice(0, 50));
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

  function handleSecretCornerTap() {
    setSecretTapCount((count) => {
      const nextCount = count + 1;

      if (nextCount >= SECRET_TAP_TARGET) {
        setIsSecretPromptOpen(true);
        setSecretError(null);
        return 0;
      }

      return nextCount;
    });
  }

  function submitSecretAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (normalizeAccessName(secretAccessName) !== SECRET_WINNER_ACCESS_NAME) {
      setSecretError("Tên xác nhận chưa đúng.");
      return;
    }

    window.sessionStorage.setItem("quiz-victory-preview", "enabled");
    router.push("/play?victory=preview");
  }

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black text-white">
      <section className="kiosk-stage relative h-full w-full max-w-[min(100vw,calc(100svh*9/16))] overflow-hidden bg-[#061526]">
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

        <div className="kiosk-background-scrim absolute inset-0 bg-gradient-to-b from-[#04111f]/82 via-[#04111f]/10 to-[#04111f]/94" />
        <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(74,163,223,0.2),transparent_40%,rgba(218,37,29,0.18))]" />
        <div className="kiosk-landscape-slide pointer-events-none hidden" aria-hidden="true">
          <div className="kiosk-landscape-slide-card relative h-full w-full overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/8 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`landscape-${activeImage.src}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 1.25, ease: "easeInOut" }}
              >
                <Image
                  src={activeImage.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#04111f]/45 via-transparent to-white/5" />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSecretCornerTap}
          className="absolute right-0 top-0 z-20 h-24 w-24 bg-transparent"
          aria-label="Khu vực thao tác ẩn"
        />

        <div className="kiosk-content relative z-10 flex h-full min-h-0 flex-col px-4 py-5 sm:px-6 sm:py-7">
          <header className="flex items-start">
            <div className="relative h-12 w-28 sm:h-16 sm:w-36">
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

          <section className="kiosk-intro-card mt-3 rounded-[1.25rem] border border-white/15 bg-black/34 p-3 shadow-2xl backdrop-blur-md sm:mt-5 sm:rounded-[1.8rem] sm:p-5">
            <h1 className="font-serif text-[clamp(1.35rem,6.4vw,2.1rem)] font-black leading-[1.03] text-white sm:text-[2.75rem]">
              <span className="block">Tìm hiểu về</span>
              <span className="block whitespace-nowrap text-[#4aa3df]">
                Lực lượng Gìn giữ Hòa bình
              </span>
              <span className="block translate-y-[5px] text-[#ffcd00]">
                Việt Nam
              </span>
            </h1>

            <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/10 py-2.5 sm:mt-5 sm:rounded-2xl sm:py-4">
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
                        className="mx-3 inline-block text-xs font-semibold text-white/88 sm:mx-6 sm:text-base"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="kiosk-spacer flex-1" />

          <button
            type="button"
            onClick={startGame}
            disabled={isStarting}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#da251d] px-7 py-4 text-xl font-black uppercase tracking-[0.04em] text-white shadow-[0_18px_60px_rgba(218,37,29,0.45)] transition hover:bg-[#b91d17] disabled:cursor-not-allowed disabled:opacity-70 sm:gap-3 sm:px-8 sm:py-5 sm:text-2xl"
          >
            {isStarting ? "Đang bắt đầu..." : "Tham Gia"}
            <ChevronRight className="h-6 w-6 transition group-hover:translate-x-1 sm:h-7 sm:w-7" />
          </button>

          <p className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-white/75 sm:mt-3 sm:text-sm">
            <Users className="h-4 w-4 text-[#ffcd00]" />
            Số lượng người chơi:{" "}
            <span className="font-black text-[#ffcd00]">
              {gameStats?.totalPlayers ?? 0}
            </span>
          </p>

          <section className="kiosk-leaderboard-card mt-2 rounded-[1.5rem] border border-white/15 bg-black/48 p-3 shadow-2xl backdrop-blur-md sm:mt-3 sm:rounded-[1.8rem] sm:p-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#ffcd00] sm:text-xs sm:tracking-[0.2em]">
                  Bảng xếp hạng
                </p>
                <p className="text-[0.68rem] font-semibold text-white/55 sm:text-xs">
                  Đúng nhiều nhất, nhanh nhất
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                {leaderboard.length > 0 ? (
                  leaderboard.slice(0, 1).map((entry, index) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-xl bg-black/22 px-2.5 py-1.5 text-xs sm:grid-cols-[2.5rem_1fr_auto] sm:px-3 sm:py-2 sm:text-sm"
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

              <button
                type="button"
                onClick={() => setIsLeaderboardOpen(true)}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#ffcd00]/35 bg-[#ffcd00]/12 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#ffcd00] transition hover:bg-[#ffcd00]/20"
              >
                Xem chi tiết bảng xếp hạng
              </button>
            </div>
          </section>

        </div>

        <AnimatePresence>
          {isLeaderboardOpen ? (
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/72 px-3 py-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.section
                className="flex max-h-[88svh] w-full max-w-[min(92vw,calc(88svh*9/16))] flex-col rounded-[1.5rem] border border-white/15 bg-[#071a2f]/96 p-4 text-white shadow-2xl"
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.97 }}
                transition={{ duration: 0.22 }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcd00]">
                      Bảng xếp hạng
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      Hiển thị tối đa 50 người chơi
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLeaderboardOpen(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Đóng bảng xếp hạng"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  {leaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {leaderboard.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs"
                        >
                          <span className="font-black text-[#ffcd00]">
                            #{index + 1}
                          </span>
                          <span className="truncate font-semibold">
                            {entry.playerName}
                          </span>
                          <span className="font-black">
                            {entry.score}/{entry.totalQuestions} ·{" "}
                            {formatDuration(entry.durationMs)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-white/10 px-3 py-4 text-center text-sm font-semibold text-white/65">
                      Chưa có người chơi hoàn thành.
                    </p>
                  )}
                </div>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {isSecretPromptOpen ? (
            <motion.div
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.form
                onSubmit={submitSecretAccess}
                className="w-full max-w-sm rounded-[1.5rem] border border-white/15 bg-[#071a2f]/96 p-5 text-white shadow-2xl"
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.97 }}
                transition={{ duration: 0.22 }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcd00]">
                      Xác nhận truy cập
                    </p>
                    <p className="mt-1 text-sm text-white/65">
                      Nhập đúng tên để mở màn chiến thắng.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSecretPromptOpen(false);
                      setSecretAccessName("");
                      setSecretError(null);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Đóng xác nhận"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <label className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                  Tên xác nhận
                  <input
                    value={secretAccessName}
                    onChange={(event) => {
                      setSecretAccessName(event.target.value);
                      setSecretError(null);
                    }}
                    autoFocus
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-white px-4 py-3 text-base font-semibold text-[#071a2f] outline-none focus:border-[#ffcd00] focus:ring-2 focus:ring-[#ffcd00]/35"
                    placeholder="Nhập tên"
                  />
                </label>

                {secretError ? (
                  <p className="mt-3 rounded-xl border border-red-300/30 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
                    {secretError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="mt-4 w-full rounded-full bg-[#ffcd00] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#071a2f] transition hover:bg-[#ffe066]"
                >
                  Mở màn chiến thắng
                </button>
              </motion.form>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
}
