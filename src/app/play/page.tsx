"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type GameBackground, useGameStore } from "@/store/gameStore";

const ANSWER_DELAY_MS = 3000;
const INACTIVITY_CHECK_INTERVAL_MS = 1000;
const INACTIVITY_TIMEOUT_MS = 15 * 1000;
const PREVIEW_WINNER_DURATION_MS = 5 * 60 * 1000;
const QUESTION_TIME_SECONDS = 10;
const TIMER_WARNING_SECONDS = 3;
const WINNING_CORRECT_ANSWERS = 5;
const FALLBACK_BACKGROUNDS: GameBackground[] = [
  {
    id: "fallback-salute-vinh",
    imageUrl: "/kiosk/peacekeeper-salute-vinh.png",
  },
  {
    id: "fallback-ministry",
    imageUrl: "/kiosk/peacekeepers-ministry.png",
  },
  {
    id: "fallback-map-training",
    imageUrl: "/kiosk/peacekeepers-map-training.png",
  },
  {
    id: "fallback-welcome",
    imageUrl: "/kiosk/peacekeepers-welcome.png",
  },
  {
    id: "fallback-south-sudan",
    imageUrl: "/kiosk/peacekeepers-south-sudan.png",
  },
];

type CheckAnswerResponse = {
  data?: {
    isCorrect: boolean;
    correctAnswer: {
      id: string;
      content: string;
    };
    explanation: string | null;
  };
  error?: string;
};

function BackgroundSlider({ backgrounds }: { backgrounds: GameBackground[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = backgrounds.length > 0 ? backgrounds : FALLBACK_BACKGROUNDS;
  const activeBackground =
    slides.length > 0 ? slides[activeIndex % slides.length] : null;

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  return (
    <div className="game-background-slider absolute inset-0 -z-10 overflow-hidden bg-[#071a2f]">
      <AnimatePresence mode="wait">
        {activeBackground ? (
          <motion.img
            key={activeBackground.id}
            src={activeBackground.imageUrl}
            alt=""
            className="game-background-slider-image absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
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
      <div className="game-background-scrim absolute inset-0 bg-[#04111f]/70" />
      <div className="game-background-tint absolute inset-0 bg-[linear-gradient(135deg,rgba(0,158,219,0.22),rgba(218,37,29,0.18),rgba(255,205,0,0.16))]" />
    </div>
  );
}

function FireworksOverlay({
  isVisible,
  isVictory = false,
}: {
  isVisible: boolean;
  isVictory?: boolean;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from({ length: isVictory ? 42 : 18 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-3 w-3 rounded-full bg-[#ffcd00] shadow-[0_0_22px_rgba(255,205,0,0.95)]"
          style={{
            left: `${8 + ((index * 17) % 84)}%`,
            top: `${10 + ((index * 23) % 72)}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, isVictory ? 2.6 : 1.9, 0.4],
            x: [0, ((index % 7) - 3) * (isVictory ? 46 : 34)],
            y: [0, ((index % 5) - 2) * (isVictory ? 40 : 30)],
          }}
          transition={{
            duration: isVictory ? 1.45 : 1.05,
            ease: "easeOut",
            repeat: isVictory ? Infinity : 0,
            repeatDelay: 0.25 + (index % 5) * 0.08,
          }}
        />
      ))}
    </div>
  );
}

function VictoryPanel({
  onRestart,
  onSaveWinnerName,
  rewardCode,
  showWinnerNameForm = false,
}: {
  onRestart: () => void;
  onSaveWinnerName?: (playerName: string) => Promise<void>;
  rewardCode?: string | null;
  showWinnerNameForm?: boolean;
}) {
  const [winnerName, setWinnerName] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  async function submitWinnerName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSaveWinnerName) {
      return;
    }

    const trimmedName = winnerName.trim();

    if (!trimmedName) {
      setSaveError("Vui lòng nhập tên người chiến thắng.");
      setSaveStatus("error");
      return;
    }

    try {
      setSaveStatus("saving");
      setSaveError(null);
      await onSaveWinnerName(trimmedName);
      setSaveStatus("saved");
    } catch {
      setSaveError("Chưa lưu được tên người chiến thắng. Vui lòng thử lại.");
      setSaveStatus("error");
    }
  }

  return (
    <motion.section
      className="mx-auto flex min-h-0 flex-1 w-full max-w-4xl flex-col items-center justify-center rounded-[2rem] border border-[#ffcd00]/40 bg-[#081521]/92 p-6 text-center text-white shadow-2xl backdrop-blur-xl sm:p-8"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative mb-6 h-28 w-full max-w-[18rem] sm:h-36 sm:max-w-[24rem]">
        <Image
          src="/logo-gghb.png"
          alt="Logo Lực lượng Gìn giữ Hòa bình Việt Nam"
          fill
          priority
          className="object-contain drop-shadow-[0_0_28px_rgba(255,205,0,0.28)]"
          sizes="384px"
        />
      </div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-[#ffcd00] sm:text-sm">
        Chúc mừng
      </p>
      <h1 className="text-3xl font-black leading-tight sm:text-5xl">
        Chúc mừng bạn đã chiến thắng trò chơi!
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
        Bạn được nhận 1 món quà từ Lục Lượng Gìn Giữ Hòa Bình Việt Nam!
      </p>

      {!showWinnerNameForm ? (
        <div className="mt-6 w-full max-w-md rounded-3xl border border-[#ffcd00]/35 bg-[#ffcd00]/12 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ffcd00]">
            Mã phần thưởng
          </p>
          <p className="mt-2 font-mono text-4xl font-black tracking-[0.24em] text-white sm:text-5xl">
            {rewardCode ?? "......"}
          </p>
          <p className="mt-2 text-xs font-semibold text-white/60">
            Chụp ảnh màn hình cùng mã này tại khu vực Photobooth.
          </p>
        </div>
      ) : null}

      {showWinnerNameForm ? (
        <form
          onSubmit={submitWinnerName}
          className="mt-6 w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-4 text-left"
        >
          <label className="text-xs font-black uppercase tracking-[0.16em] text-[#ffcd00]">
            Tên người chiến thắng
            <input
              value={winnerName}
              onChange={(event) => {
                setWinnerName(event.target.value);
                setSaveError(null);
                if (saveStatus !== "saving") {
                  setSaveStatus("idle");
                }
              }}
              disabled={saveStatus === "saving" || saveStatus === "saved"}
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white px-4 py-3 text-base font-semibold text-[#071a2f] outline-none focus:border-[#ffcd00] focus:ring-2 focus:ring-[#ffcd00]/35 disabled:opacity-70"
              placeholder="Nhập tên hiển thị trên BXH"
            />
          </label>

          {saveError ? (
            <p className="mt-3 rounded-xl border border-red-300/30 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              {saveError}
            </p>
          ) : null}

          {saveStatus === "saved" ? (
            <p className="mt-3 rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-100">
              Đã lưu tên người chiến thắng vào bảng xếp hạng.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className="mt-4 w-full rounded-full bg-[#ffcd00] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#071a2f] transition hover:bg-[#ffe066] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveStatus === "saving" ? "Đang lưu..." : "Lưu tên chiến thắng"}
          </button>
        </form>
      ) : null}

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3 font-bold text-white transition hover:bg-white/20"
      >
        <RotateCcw className="h-5 w-5" />
        Kết thúc game
      </button>
    </motion.section>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const {
    answers,
    backgrounds,
    error,
    loadAllQuestions,
    loadBackgrounds,
    questions,
    createRewardCode,
    rewardCode,
    resetGame,
    selectAnswer,
    status,
  } = useGameStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [gameStartedAt, setGameStartedAt] = useState(() =>
    new Date().getTime(),
  );
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const [hasSavedLeaderboard, setHasSavedLeaderboard] = useState(false);
  const [isVictoryPreview, setIsVictoryPreview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctAnswerId: string;
    correctAnswer: string;
    explanation: string | null;
  } | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const hasReturnedToKioskRef = useRef(false);
  const lastActivityAtRef = useRef(new Date().getTime());

  const currentQuestion = questions[currentQuestionIndex];
  const progressText = useMemo(
    () =>
      questions.length > 0
        ? `${currentQuestionIndex + 1}/${questions.length}`
        : "0/0",
    [currentQuestionIndex, questions.length],
  );
  const correctProgressText = `${Math.min(totalCorrectAnswers, WINNING_CORRECT_ANSWERS)}/${WINNING_CORRECT_ANSWERS}`;
  const isVictoryVisible = hasWon || isVictoryPreview || status === "victory";
  const isTimerWarning =
    timeLeft <= TIMER_WARNING_SECONDS &&
    !feedback &&
    !isAdvancing &&
    status === "ready";

  useEffect(() => {
    void loadBackgrounds();
    void loadAllQuestions();
  }, [loadAllQuestions, loadBackgrounds]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasPreviewAccess =
      searchParams.get("victory") === "preview" &&
      window.sessionStorage.getItem("quiz-victory-preview") === "enabled";

    if (hasPreviewAccess) {
      resetGame();
      setIsVictoryPreview(true);
    }
  }, [resetGame]);

  useEffect(() => {
    if (!isVictoryVisible) {
      return;
    }

    setShowFireworks(true);
    const timeoutId = window.setTimeout(() => {
      if (!hasWon) {
        setShowFireworks(false);
      }
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [hasWon, isVictoryVisible]);

  useEffect(() => {
    if (!hasWon || rewardCode) {
      return;
    }

    void createRewardCode().catch(() => undefined);
  }, [createRewardCode, hasWon, rewardCode]);

  useEffect(() => {
    hasReturnedToKioskRef.current = false;
    lastActivityAtRef.current = new Date().getTime();

    const goToKioskScreen = () => {
      if (hasReturnedToKioskRef.current) {
        return;
      }

      hasReturnedToKioskRef.current = true;
      resetGame();
      router.replace("/");
    };

    const markActivity = () => {
      lastActivityAtRef.current = new Date().getTime();
    };

    const activityEvents = [
      "pointerdown",
      "mousedown",
      "click",
      "touchstart",
      "keydown",
    ] as const;

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, {
        passive: true,
      });
    });

    const intervalId = window.setInterval(() => {
      const inactiveMs = new Date().getTime() - lastActivityAtRef.current;

      if (inactiveMs >= INACTIVITY_TIMEOUT_MS) {
        goToKioskScreen();
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
    };
  }, [resetGame, router]);

  function finishGame() {
    resetGame();
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setIsAdvancing(false);
    setHasWon(false);
    setTotalCorrectAnswers(0);
    setHasSavedLeaderboard(false);
    setFeedback(null);
    setShowFireworks(false);
    setTimeLeft(QUESTION_TIME_SECONDS);
    router.replace("/");
  }

  const saveLeaderboardEntry = useCallback(async (score: number) => {
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
        totalQuestions: WINNING_CORRECT_ANSWERS,
        durationMs: new Date().getTime() - gameStartedAt,
      }),
    });
  }, [gameStartedAt, hasSavedLeaderboard]);

  const playAnswerSound = useCallback((isCorrect: boolean) => {
    const audio = new Audio(isCorrect ? "/sfx/correct.mp3" : "/sfx/wrong.mp3");
    audio.volume = 0.85;
    void audio.play().catch(() => undefined);
  }, []);

  const savePreviewWinnerName = useCallback(async (playerName: string) => {
    const response = await fetch("/api/game/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerName,
        score: WINNING_CORRECT_ANSWERS,
        totalQuestions: WINNING_CORRECT_ANSWERS,
        durationMs: PREVIEW_WINNER_DURATION_MS,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save preview winner.");
    }
  }, []);

  const checkAnswer = useCallback(async (questionId: string, answerId: string | null) => {
    const response = await fetch("/api/game/check-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId,
        answerId,
      }),
    });
    const payload = (await response.json()) as CheckAnswerResponse;

    if (!response.ok || !payload.data) {
      return null;
    }

    return payload.data;
  }, []);

  const completeQuestion = useCallback(async (answerId: string | null) => {
    if (!currentQuestion || hasWon || isAdvancing || status !== "ready") {
      return;
    }

    if (answerId) {
      selectAnswer(currentQuestion.id, answerId);
    }

    setSelectedAnswerId(answerId);
    setIsAdvancing(true);
    setTimeLeft(0);
    setFeedback(null);
    setShowFireworks(false);

    const answerResult = await checkAnswer(currentQuestion.id, answerId);

    const isCorrect = answerResult?.isCorrect ?? false;
    const nextCorrectAnswers =
      totalCorrectAnswers + (isCorrect ? 1 : 0);

    if (answerResult) {
      playAnswerSound(answerResult.isCorrect);
      setFeedback({
        isCorrect: answerResult.isCorrect,
        correctAnswerId: answerResult.correctAnswer.id,
        correctAnswer: answerResult.correctAnswer.content,
        explanation: answerResult.explanation,
      });

      if (answerResult.isCorrect) {
        setTotalCorrectAnswers(nextCorrectAnswers);
        setShowFireworks(true);
        window.setTimeout(() => setShowFireworks(false), 1100);
      }
    }

    window.setTimeout(async () => {
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;

      if (nextCorrectAnswers >= WINNING_CORRECT_ANSWERS) {
        await saveLeaderboardEntry(WINNING_CORRECT_ANSWERS).catch(
          () => undefined,
        );
        setHasWon(true);
        setSelectedAnswerId(null);
        setIsAdvancing(false);
        setFeedback(null);
        setShowFireworks(true);
        setTimeLeft(QUESTION_TIME_SECONDS);
        return;
      }

      if (!isLastQuestion) {
        setCurrentQuestionIndex((index) => index + 1);
        setSelectedAnswerId(null);
        setIsAdvancing(false);
        setFeedback(null);
        setShowFireworks(false);
        setTimeLeft(QUESTION_TIME_SECONDS);
        return;
      }

      setSelectedAnswerId(null);
      setIsAdvancing(false);
      setFeedback(null);
      setShowFireworks(false);
      setTimeLeft(QUESTION_TIME_SECONDS);
    }, ANSWER_DELAY_MS);
  }, [
    checkAnswer,
    currentQuestion,
    currentQuestionIndex,
    hasWon,
    isAdvancing,
    playAnswerSound,
    questions.length,
    saveLeaderboardEntry,
    selectAnswer,
    status,
    totalCorrectAnswers,
  ]);

  function handleAnswerClick(answerId: string) {
    void completeQuestion(answerId);
  }

  useEffect(() => {
    if (
      !currentQuestion ||
      hasWon ||
      isAdvancing ||
      feedback ||
      status !== "ready"
    ) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0);
        void completeQuestion(null);
        return;
      }

      setTimeLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [
    completeQuestion,
    currentQuestion,
    feedback,
    hasWon,
    isAdvancing,
    status,
    timeLeft,
  ]);

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black text-white">
      <section className="play-stage relative h-full w-full max-w-[min(100vw,calc(100svh*9/16))] overflow-hidden px-2 py-2 sm:px-4 sm:py-4">
        <BackgroundSlider backgrounds={backgrounds} />
        <FireworksOverlay
          isVisible={showFireworks || isVictoryVisible}
          isVictory={isVictoryVisible}
        />

      <div className="play-content relative z-10 mx-auto flex h-full min-h-0 flex-col gap-1.5 sm:gap-4">
        <AnimatePresence mode="wait">
          {isVictoryVisible ? (
            <VictoryPanel
              key="victory"
              onRestart={() => {
                window.sessionStorage.removeItem("quiz-victory-preview");
                finishGame();
              }}
              onSaveWinnerName={
                isVictoryPreview ? savePreviewWinnerName : undefined
              }
              rewardCode={isVictoryPreview ? null : rewardCode?.code}
              showWinnerNameForm={isVictoryPreview}
            />
          ) : (
            <motion.section
              key="question"
              className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden pb-1 sm:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <aside className="shrink-0 rounded-[1.15rem] border border-white/15 bg-[#1f2b1f]/75 p-2 shadow-2xl backdrop-blur-xl sm:rounded-[1.6rem] sm:p-4">
                <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
                  <div className="min-w-0">
                    <h1 className="text-lg font-black text-white sm:text-3xl">
                      Mục tiêu chiến thắng
                    </h1>
                    <p className="mt-0.5 text-[0.62rem] leading-3.5 text-white/70 sm:mt-1 sm:text-xs sm:leading-5">
                      Trả lời đúng 5 câu để nhận quà từ Lực lượng Gìn giữ Hòa
                      bình Việt Nam.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <div className="rounded-xl border border-[#4aa3df]/40 bg-[#4aa3df]/15 px-2 py-1 text-right sm:rounded-2xl sm:px-3 sm:py-2">
                      <p className="text-[0.58rem] font-bold uppercase text-[#9bd8ff] sm:text-[0.65rem]">
                        Đã đúng
                      </p>
                      <p className="text-base font-black text-white sm:text-2xl">
                        {correctProgressText}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl border px-2 py-1 text-right transition sm:rounded-2xl sm:px-3 sm:py-2 ${
                        isTimerWarning
                          ? "animate-pulse border-red-300 bg-red-600/70 text-white shadow-[0_0_24px_rgba(220,38,38,0.5)]"
                          : "border-[#ffcd00]/40 bg-[#ffcd00]/15 text-white"
                      }`}
                    >
                      <p className="flex items-center justify-end gap-1 text-[0.58rem] font-bold uppercase sm:text-[0.65rem]">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Thời gian
                      </p>
                      <p className="text-base font-black sm:text-2xl">
                        {timeLeft}s
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/10 sm:h-2">
                  <div
                    className="h-full rounded-full bg-[#ffcd00] transition-all duration-500"
                    style={{
                      width: `${(Math.min(totalCorrectAnswers, WINNING_CORRECT_ANSWERS) / WINNING_CORRECT_ANSWERS) * 100}%`,
                    }}
                  />
                </div>

              </aside>

              <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.2rem] border border-white/15 bg-white/95 p-2.5 text-[#071a2f] shadow-2xl backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5">
                {status === "loading" ? (
                  <div className="flex min-h-0 flex-1 items-center justify-center text-base font-bold text-[#0b4f8a] sm:text-lg">
                    Đang tải câu hỏi...
                  </div>
                ) : !currentQuestion ? (
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
                    <Sparkles className="mb-4 h-12 w-12 text-[#da251d]" />
                    <h2 className="text-2xl font-black">
                      Chưa có câu hỏi để hiển thị
                    </h2>
                    <p className="mt-2 max-w-md text-slate-600">
                      Hãy thêm dữ liệu câu hỏi trong Admin Dashboard trước khi
                      bắt đầu chơi.
                    </p>
                  </div>
                ) : (
                  <div
                    key={currentQuestion.id}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                      {currentQuestion.imageUrl ? (
                        <img
                          src={currentQuestion.imageUrl}
                          alt=""
                          className="mb-2.5 max-h-28 w-full shrink-0 rounded-xl object-cover shadow-lg sm:mb-5 sm:max-h-56 sm:rounded-3xl"
                        />
                      ) : null}

                      <p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#da251d] sm:mb-3 sm:text-sm sm:tracking-[0.25em]">
                        Câu hỏi {progressText}
                      </p>
                      <h2 className="text-base font-normal leading-snug text-[#0b4f8a] sm:text-2xl">
                        {currentQuestion.content}
                      </h2>

                      <div className="mt-2.5 grid min-h-0 flex-1 content-start gap-1.5 sm:mt-5 sm:gap-3">
                        {currentQuestion.answers.map((answer, index) => {
                          const isSelected = selectedAnswerId === answer.id;
                          const isCorrectAnswer =
                            feedback?.correctAnswerId === answer.id;
                          const isAlreadyChosen =
                            answers[currentQuestion.id] === answer.id;
                          const answerColorClass = feedback
                            ? isCorrectAnswer
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : isSelected
                                ? "border-red-500 bg-red-500 text-white"
                                : "border-slate-200 bg-white text-slate-500"
                            : isSelected || isAlreadyChosen
                              ? "border-[#ffcd00] bg-[#ffcd00] text-[#071a2f]"
                              : "border-slate-200 bg-white text-slate-800 hover:border-[#4aa3df] hover:bg-[#e9f7ff]";

                          return (
                            <button
                              key={answer.id}
                              type="button"
                              onClick={() => handleAnswerClick(answer.id)}
                              disabled={isAdvancing}
                              className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[0.82rem] font-normal shadow-sm transition sm:min-h-16 sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base ${answerColorClass} disabled:cursor-not-allowed`}
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0b4f8a] text-xs text-white sm:h-9 sm:w-9 sm:text-base">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="font-normal">{answer.content}</span>
                            </button>
                          );
                        })}
                      </div>

                      {feedback ? (
                        <div
                          className={`mt-3 rounded-xl border px-3 py-2 text-sm sm:mt-5 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base ${
                            feedback.isCorrect
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-red-200 bg-red-50 text-red-800"
                          }`}
                        >
                          <p className="font-semibold">
                            {feedback.isCorrect ? (
                              "Chính xác!"
                            ) : (
                              <>
                                Chưa đúng. Đáp án đúng:{" "}
                                <span className="font-normal">
                                  {feedback.correctAnswer}
                                </span>
                              </>
                            )}
                          </p>
                          {feedback.explanation ? (
                            <p className="mt-1.5 text-xs font-semibold leading-5 sm:mt-2 sm:text-sm sm:leading-6">
                              {feedback.explanation}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                  </div>
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
