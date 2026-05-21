"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Medal,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { type GameBackground, useGameStore } from "@/store/gameStore";

const ANSWER_DELAY_MS = 1500;

function BackgroundSlider({ backgrounds }: { backgrounds: GameBackground[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBackground =
    backgrounds.length > 0 ? backgrounds[activeIndex % backgrounds.length] : null;

  useEffect(() => {
    if (backgrounds.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % backgrounds.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [backgrounds.length]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#071a2f]">
      <AnimatePresence mode="wait">
        {activeBackground ? (
          <motion.img
            key={activeBackground.id}
            src={activeBackground.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        ) : (
          <motion.div
            key="fallback-background"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4aa3df_0%,#123b56_38%,#1f2b1f_100%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-[#04111f]/70" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,158,219,0.22),rgba(218,37,29,0.18),rgba(255,205,0,0.16))]" />
    </div>
  );
}

function LogoBar() {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white shadow-lg backdrop-blur">
        <div className="relative h-12 w-24 overflow-hidden rounded-full border-2 border-[#ffcd00] bg-black/60">
          <Image
            src="/logo-gghb.png"
            alt="Logo Lực lượng Gìn giữ Hòa bình Việt Nam"
            fill
            className="object-contain p-1.5"
            sizes="96px"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#ffcd00]">
            GGHB Việt Nam
          </p>
          <p className="text-sm font-semibold">Vietnam Peacekeeping Force</p>
        </div>
      </div>

      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-[#4aa3df]/90 text-lg font-black text-white shadow-lg">
        UN
      </div>
    </header>
  );
}

function GameOverPanel({ onRestart }: { onRestart: () => void }) {
  return (
    <motion.section
      className="mx-auto flex min-h-[520px] max-w-3xl flex-col items-center justify-center rounded-[2rem] border border-red-300/30 bg-[#160d0d]/85 p-8 text-center text-white shadow-2xl backdrop-blur-xl"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-red-300/40 bg-red-600/20">
        <RotateCcw className="h-10 w-10 text-red-200" />
      </div>
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-red-200">
        Game Over
      </p>
      <h1 className="text-4xl font-black text-white md:text-5xl">
        Chưa đạt mốc 80%
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
        Theo luật chơi, khi không vượt qua level hiện tại, tiến trình được đặt
        lại về Level 1. Hãy bắt đầu lại và chinh phục toàn bộ 5 level.
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#da251d] px-7 py-3 font-bold text-white shadow-lg transition hover:bg-[#b91d17]"
      >
        Chơi lại từ đầu
        <ChevronRight className="h-5 w-5" />
      </button>
    </motion.section>
  );
}

function VictoryPanel({
  rewardCode,
  onRestart,
}: {
  rewardCode: string | null;
  onRestart: () => void;
}) {
  return (
    <motion.section
      className="mx-auto flex min-h-[560px] max-w-4xl flex-col items-center justify-center rounded-[2rem] border border-[#ffcd00]/40 bg-[#081521]/90 p-8 text-center text-white shadow-2xl backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#ffcd00]/50 bg-[#ffcd00]/15">
        <Trophy className="h-10 w-10 text-[#ffcd00]" />
      </div>
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.32em] text-[#4aa3df]">
        Victory
      </p>
      <h1 className="text-4xl font-black md:text-6xl">
        Hoàn thành thử thách GGHB VN
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
        Hãy giữ màn hình này để chụp ảnh Photobooth cùng mã phần thưởng.
      </p>

      <div className="mt-8 rounded-3xl border border-[#ffcd00]/50 bg-white px-8 py-6 text-[#071a2f] shadow-[0_0_60px_rgba(255,205,0,0.25)]">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.34em] text-[#8b6f00]">
          Reward Code
        </p>
        <div className="font-mono text-6xl font-black tracking-[0.22em] md:text-8xl">
          {rewardCode ?? "------"}
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3 font-bold text-white transition hover:bg-white/20"
      >
        <RotateCcw className="h-5 w-5" />
        Chơi lại
      </button>
    </motion.section>
  );
}

export default function PlayPage() {
  const {
    answers,
    backgrounds,
    createRewardCode,
    currentLevel,
    error,
    loadBackgrounds,
    loadQuestions,
    nextLevel,
    questions,
    resetGame,
    rewardCode,
    score,
    selectAnswer,
    status,
    submitLevel,
  } = useGameStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [levelSummary, setLevelSummary] = useState<string | null>(null);
  const [gameStartedAt, setGameStartedAt] = useState(() =>
    new Date().getTime(),
  );
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const [hasSavedLeaderboard, setHasSavedLeaderboard] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progressText = useMemo(
    () =>
      questions.length > 0
        ? `${currentQuestionIndex + 1}/${questions.length}`
        : "0/0",
    [currentQuestionIndex, questions.length],
  );

  useEffect(() => {
    void loadBackgrounds();
    void loadQuestions(1);
  }, [loadBackgrounds, loadQuestions]);

  async function restartFromLevelOne() {
    resetGame();
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setIsAdvancing(false);
    setIsGameOver(false);
    setLevelSummary(null);
    setGameStartedAt(new Date().getTime());
    setTotalCorrectAnswers(0);
    setHasSavedLeaderboard(false);
    await loadQuestions(1);
  }

  async function handleNextLevel() {
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setIsAdvancing(false);
    setLevelSummary(null);
    await nextLevel();
  }

  async function saveLeaderboardEntry(score: number) {
    if (hasSavedLeaderboard) {
      return;
    }

    setHasSavedLeaderboard(true);

    await fetch("/api/game/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerName: "Khách tham gia",
        score,
        totalQuestions: 40,
        durationMs: new Date().getTime() - gameStartedAt,
      }),
    });
  }

  async function handleAnswerClick(answerId: string) {
    if (!currentQuestion || isAdvancing || status === "submitting") {
      return;
    }

    selectAnswer(currentQuestion.id, answerId);
    setSelectedAnswerId(answerId);
    setIsAdvancing(true);

    window.setTimeout(async () => {
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;

      if (!isLastQuestion) {
        setCurrentQuestionIndex((index) => index + 1);
        setSelectedAnswerId(null);
        setIsAdvancing(false);
        return;
      }

      try {
        const result = await submitLevel();

        if (result.result === "fail") {
          setIsGameOver(true);
          setSelectedAnswerId(null);
          setIsAdvancing(false);
          return;
        }

        if (currentLevel === 5) {
          const finalScore = totalCorrectAnswers + result.correctCount;
          setTotalCorrectAnswers(finalScore);
          await saveLeaderboardEntry(finalScore);
          await createRewardCode();
          setSelectedAnswerId(null);
          setIsAdvancing(false);
          return;
        }

        setTotalCorrectAnswers((score) => score + result.correctCount);
        setLevelSummary(
          `Bạn đã trả lời đúng ${result.correctCount}/${result.totalQuestions} câu (${result.scorePercent}%).`,
        );
        setSelectedAnswerId(null);
        setIsAdvancing(false);
      } catch {
        setSelectedAnswerId(null);
        setIsAdvancing(false);
      }
    }, ANSWER_DELAY_MS);
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center overflow-hidden bg-black text-white">
      <section className="relative h-[100svh] w-full max-w-[min(100vw,calc(100svh*9/16))] overflow-hidden px-4 py-4">
        <BackgroundSlider backgrounds={backgrounds} />

      <div className="relative z-10 mx-auto flex h-full flex-col gap-4">
        <LogoBar />

        <AnimatePresence mode="wait">
          {isGameOver ? (
            <GameOverPanel key="game-over" onRestart={restartFromLevelOne} />
          ) : status === "victory" ? (
            <VictoryPanel
              key="victory"
              rewardCode={rewardCode?.code ?? null}
              onRestart={restartFromLevelOne}
            />
          ) : levelSummary ? (
            <motion.section
              key="level-pass"
              className="mx-auto flex min-h-[70svh] w-full flex-col items-center justify-center rounded-[2rem] border border-[#4aa3df]/30 bg-[#071a2f]/90 p-8 text-center shadow-2xl backdrop-blur-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
            >
              <Medal className="mb-5 h-16 w-16 text-[#ffcd00]" />
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-[#4aa3df]">
                Level {currentLevel} Passed
              </p>
              <h1 className="text-4xl font-black">Đủ điều kiện đi tiếp</h1>
              <p className="mt-4 max-w-xl text-white/75">{levelSummary}</p>
              <button
                type="button"
                onClick={handleNextLevel}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#4aa3df] px-7 py-3 font-bold text-[#06111f] shadow-lg transition hover:bg-[#7cc3ef]"
              >
                Vào Level {currentLevel + 1}
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.section>
          ) : (
            <motion.section
              key="question"
              className="flex flex-1 flex-col gap-4 overflow-y-auto pb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <aside className="rounded-[1.6rem] border border-white/15 bg-[#1f2b1f]/75 p-4 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ffcd00]">
                      Quiz Game
                    </p>
                    <h1 className="mt-1 text-3xl font-black text-white">
                      Level {currentLevel}
                    </h1>
                  </div>
                  <div className="rounded-2xl border border-[#4aa3df]/40 bg-[#4aa3df]/15 px-4 py-2 text-right">
                    <p className="text-xs font-bold uppercase text-[#9bd8ff]">
                      Câu hỏi
                    </p>
                    <p className="text-2xl font-black text-white">
                      {progressText}
                    </p>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#ffcd00] transition-all duration-500"
                    style={{
                      width:
                        questions.length > 0
                          ? `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Điểm level
                    </p>
                    <p className="mt-1 text-3xl font-black text-[#ffcd00]">
                      {score}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-white/65">
                    Đạt tối thiểu 80% để đi tiếp. Không đạt sẽ quay lại Level 1.
                  </p>
                </div>
              </aside>

              <section className="rounded-[1.8rem] border border-white/15 bg-white/95 p-5 text-[#071a2f] shadow-2xl backdrop-blur-xl">
                {status === "loading" ? (
                  <div className="flex min-h-[460px] items-center justify-center text-lg font-bold text-[#0b4f8a]">
                    Đang tải câu hỏi...
                  </div>
                ) : !currentQuestion ? (
                  <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                    <Sparkles className="mb-4 h-12 w-12 text-[#da251d]" />
                    <h2 className="text-2xl font-black">
                      Chưa có câu hỏi cho level này
                    </h2>
                    <p className="mt-2 max-w-md text-slate-600">
                      Hãy thêm dữ liệu câu hỏi trong Admin Dashboard trước khi
                      bắt đầu chơi.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.35 }}
                    >
                      {currentQuestion.imageUrl ? (
                        <img
                          src={currentQuestion.imageUrl}
                          alt=""
                          className="mb-6 max-h-64 w-full rounded-3xl object-cover shadow-lg"
                        />
                      ) : null}

                      <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#da251d]">
                        Câu hỏi {currentQuestionIndex + 1}
                      </p>
                      <h2 className="text-2xl font-black leading-tight text-[#0b4f8a]">
                        {currentQuestion.content}
                      </h2>

                      <div className="mt-7 grid gap-3">
                        {currentQuestion.answers.map((answer, index) => {
                          const isSelected = selectedAnswerId === answer.id;
                          const isAlreadyChosen =
                            answers[currentQuestion.id] === answer.id;

                          return (
                            <motion.button
                              key={answer.id}
                              type="button"
                              onClick={() => handleAnswerClick(answer.id)}
                              disabled={isAdvancing || status === "submitting"}
                              className={`flex min-h-16 items-center gap-4 rounded-2xl border px-5 py-4 text-left text-base font-bold shadow-sm transition ${
                                isSelected || isAlreadyChosen
                                  ? "border-[#ffcd00] bg-[#ffcd00] text-[#071a2f]"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-[#4aa3df] hover:bg-[#e9f7ff]"
                              } disabled:cursor-not-allowed`}
                              whileTap={{ scale: 0.98 }}
                              animate={
                                isSelected
                                  ? { scale: 1.02 }
                                  : { scale: 1 }
                              }
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b4f8a] text-white">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span>{answer.content}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {status === "submitting" ? (
                        <p className="mt-5 text-sm font-bold text-[#0b4f8a]">
                          Đang chấm kết quả level...
                        </p>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                )}

                {error ? (
                  <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                  </p>
                ) : null}
              </section>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
      </section>
    </main>
  );
}
