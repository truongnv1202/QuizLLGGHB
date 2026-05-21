"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Medal,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { type GameBackground, useGameStore } from "@/store/gameStore";

const ANSWER_DELAY_MS = 3000;
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const QUESTION_TIME_SECONDS = 10;
const TIMER_WARNING_SECONDS = 3;
const FALLBACK_BACKGROUNDS: GameBackground[] = [
  {
    id: "fallback-salute",
    imageUrl: "/kiosk/peacekeepers-salute.png",
  },
  {
    id: "fallback-formation",
    imageUrl: "/kiosk/peacekeepers-formation.png",
  },
  {
    id: "fallback-flags",
    imageUrl: "/kiosk/vietnam-un-flags.png",
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

function FireworksOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-3 w-3 rounded-full bg-[#ffcd00] shadow-[0_0_22px_rgba(255,205,0,0.95)]"
          style={{
            left: `${12 + ((index * 17) % 76)}%`,
            top: `${18 + ((index * 23) % 52)}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.9, 0.4],
            x: [0, ((index % 5) - 2) * 34],
            y: [0, ((index % 4) - 1.5) * 30],
          }}
          transition={{ duration: 1.05, ease: "easeOut" }}
        />
      ))}
    </div>
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
        Bạn Thua cuộc
      </p>
      <h1 className="text-4xl font-black text-white md:text-5xl">
        Chưa đạt mốc 80%
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
        Theo luật chơi, khi không vượt qua cấp độ hiện tại, tiến trình được đặt
        lại về Cấp độ 1. Hãy bắt đầu lại và chinh phục toàn bộ 5 cấp độ.
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
  const router = useRouter();
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
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctAnswerId: string;
    correctAnswer: string;
    explanation: string | null;
  } | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progressText = useMemo(
    () =>
      questions.length > 0
        ? `${currentQuestionIndex + 1}/${questions.length}`
        : "0/0",
    [currentQuestionIndex, questions.length],
  );
  const isTimerWarning =
    timeLeft <= TIMER_WARNING_SECONDS &&
    !feedback &&
    !isAdvancing &&
    status === "ready";

  useEffect(() => {
    void loadBackgrounds();
    void loadQuestions(1);
  }, [loadBackgrounds, loadQuestions]);

  useEffect(() => {
    let timeoutId: number | undefined;

    const goToKioskScreen = () => {
      resetGame();
      router.replace("/");
    };

    const resetInactivityTimer = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(goToKioskScreen, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = [
      "pointerdown",
      "pointermove",
      "mousedown",
      "mousemove",
      "touchstart",
      "keydown",
    ] as const;

    resetInactivityTimer();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, {
        passive: true,
      });
    });

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [resetGame, router]);

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
    setFeedback(null);
    setShowFireworks(false);
    setTimeLeft(QUESTION_TIME_SECONDS);
    await loadQuestions(1);
  }

  async function handleNextLevel() {
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setIsAdvancing(false);
    setLevelSummary(null);
    setFeedback(null);
    setShowFireworks(false);
    setTimeLeft(QUESTION_TIME_SECONDS);
    await nextLevel();
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
        totalQuestions: 40,
        durationMs: new Date().getTime() - gameStartedAt,
      }),
    });
  }, [gameStartedAt, hasSavedLeaderboard]);

  const playAnswerSound = useCallback((isCorrect: boolean) => {
    const audio = new Audio(isCorrect ? "/sfx/correct.mp3" : "/sfx/wrong.mp3");
    audio.volume = 0.85;
    void audio.play().catch(() => undefined);
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
    if (!currentQuestion || isAdvancing || status === "submitting") {
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

    if (answerResult) {
      playAnswerSound(answerResult.isCorrect);
      setFeedback({
        isCorrect: answerResult.isCorrect,
        correctAnswerId: answerResult.correctAnswer.id,
        correctAnswer: answerResult.correctAnswer.content,
        explanation: answerResult.explanation,
      });

      if (answerResult.isCorrect) {
        setShowFireworks(true);
        window.setTimeout(() => setShowFireworks(false), 1100);
      }
    }

    window.setTimeout(async () => {
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;

      if (!isLastQuestion) {
        setCurrentQuestionIndex((index) => index + 1);
        setSelectedAnswerId(null);
        setIsAdvancing(false);
        setFeedback(null);
        setShowFireworks(false);
        setTimeLeft(QUESTION_TIME_SECONDS);
        return;
      }

      try {
        const result = await submitLevel();

        if (result.result === "fail") {
          setIsGameOver(true);
          setSelectedAnswerId(null);
          setIsAdvancing(false);
          setFeedback(null);
          setTimeLeft(QUESTION_TIME_SECONDS);
          return;
        }

        if (currentLevel === 5) {
          const finalScore = totalCorrectAnswers + result.correctCount;
          setTotalCorrectAnswers(finalScore);
          await saveLeaderboardEntry(finalScore);
          await createRewardCode();
          setSelectedAnswerId(null);
          setIsAdvancing(false);
          setFeedback(null);
          setTimeLeft(QUESTION_TIME_SECONDS);
          return;
        }

        setTotalCorrectAnswers((score) => score + result.correctCount);
        setLevelSummary(
          `Bạn đã trả lời đúng ${result.correctCount}/${result.totalQuestions} câu (${result.scorePercent}%).`,
        );
        setSelectedAnswerId(null);
        setIsAdvancing(false);
        setFeedback(null);
        setTimeLeft(QUESTION_TIME_SECONDS);
      } catch {
        setSelectedAnswerId(null);
        setIsAdvancing(false);
        setFeedback(null);
        setTimeLeft(QUESTION_TIME_SECONDS);
      }
    }, ANSWER_DELAY_MS);
  }, [
    checkAnswer,
    createRewardCode,
    currentLevel,
    currentQuestion,
    currentQuestionIndex,
    isAdvancing,
    playAnswerSound,
    questions.length,
    saveLeaderboardEntry,
    selectAnswer,
    status,
    submitLevel,
    totalCorrectAnswers,
  ]);

  function handleAnswerClick(answerId: string) {
    void completeQuestion(answerId);
  }

  useEffect(() => {
    if (
      !currentQuestion ||
      isAdvancing ||
      feedback ||
      isGameOver ||
      levelSummary ||
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
    isAdvancing,
    isGameOver,
    levelSummary,
    status,
    timeLeft,
  ]);

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black text-white">
      <section className="relative h-full w-full max-w-[min(100vw,calc(100svh*9/16))] overflow-hidden px-2 py-2 sm:px-4 sm:py-4">
        <BackgroundSlider backgrounds={backgrounds} />
        <FireworksOverlay isVisible={showFireworks} />

      <div className="relative z-10 mx-auto flex h-full min-h-0 flex-col gap-2 sm:gap-4">
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
              className="mx-auto flex min-h-0 flex-1 w-full flex-col items-center justify-center rounded-[2rem] border border-[#4aa3df]/30 bg-[#071a2f]/90 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
            >
              <Medal className="mb-5 h-16 w-16 text-[#ffcd00]" />
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-[#4aa3df]">
                Cấp độ {currentLevel} đã vượt qua
              </p>
              <h1 className="text-4xl font-black">Đủ điều kiện đi tiếp</h1>
              <p className="mt-4 max-w-xl text-white/75">{levelSummary}</p>
              <button
                type="button"
                onClick={handleNextLevel}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#4aa3df] px-7 py-3 font-bold text-[#06111f] shadow-lg transition hover:bg-[#7cc3ef]"
              >
                Vào cấp độ {currentLevel + 1}
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.section>
          ) : (
            <motion.section
              key="question"
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden pb-1 sm:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <aside className="shrink-0 rounded-[1.25rem] border border-white/15 bg-[#1f2b1f]/75 p-2.5 shadow-2xl backdrop-blur-xl sm:rounded-[1.6rem] sm:p-4">
                <div className="mb-2 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
                  <div className="min-w-0">
                    <h1 className="text-xl font-black text-white sm:text-3xl">
                      Cấp độ {currentLevel}
                    </h1>
                    <p className="mt-1 text-[0.68rem] leading-4 text-white/70 sm:text-xs sm:leading-5">
                      Đạt tối thiểu 80% để đi tiếp. Không đạt sẽ quay lại Cấp độ
                      1.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-[#4aa3df]/40 bg-[#4aa3df]/15 px-2.5 py-1.5 text-right sm:px-3 sm:py-2">
                      <p className="text-[0.65rem] font-bold uppercase text-[#9bd8ff]">
                        Câu hỏi
                      </p>
                      <p className="text-lg font-black text-white sm:text-2xl">
                        {progressText}
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl border px-2.5 py-1.5 text-right transition sm:px-3 sm:py-2 ${
                        isTimerWarning
                          ? "animate-pulse border-red-300 bg-red-600/70 text-white shadow-[0_0_24px_rgba(220,38,38,0.5)]"
                          : "border-[#ffcd00]/40 bg-[#ffcd00]/15 text-white"
                      }`}
                    >
                      <p className="flex items-center justify-end gap-1 text-[0.65rem] font-bold uppercase">
                        <Clock className="h-3.5 w-3.5" />
                        Thời gian
                      </p>
                      <p className="text-lg font-black sm:text-2xl">
                        {timeLeft}s
                      </p>
                    </div>
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

              </aside>

              <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-white/15 bg-white/95 p-3 text-[#071a2f] shadow-2xl backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5">
                {status === "loading" ? (
                  <div className="flex min-h-0 flex-1 items-center justify-center text-base font-bold text-[#0b4f8a] sm:text-lg">
                    Đang tải câu hỏi...
                  </div>
                ) : !currentQuestion ? (
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
                    <Sparkles className="mb-4 h-12 w-12 text-[#da251d]" />
                    <h2 className="text-2xl font-black">
                      Chưa có câu hỏi cho cấp độ này
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
                          className="mb-3 max-h-32 w-full shrink-0 rounded-2xl object-cover shadow-lg sm:mb-5 sm:max-h-56 sm:rounded-3xl"
                        />
                      ) : null}

                      <p className="mb-1.5 text-xs font-black uppercase tracking-[0.22em] text-[#da251d] sm:mb-3 sm:text-sm sm:tracking-[0.25em]">
                        Câu hỏi {currentQuestionIndex + 1}
                      </p>
                      <h2 className="text-lg font-normal leading-snug text-[#0b4f8a] sm:text-2xl">
                        {currentQuestion.content}
                      </h2>

                      <div className="mt-3 grid min-h-0 flex-1 content-start gap-2 sm:mt-5 sm:gap-3">
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
                              disabled={isAdvancing || status === "submitting"}
                              className={`flex min-h-12 items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm font-normal shadow-sm transition sm:min-h-16 sm:gap-4 sm:px-5 sm:py-4 sm:text-base ${answerColorClass} disabled:cursor-not-allowed`}
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0b4f8a] text-white sm:h-9 sm:w-9">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="font-normal">{answer.content}</span>
                            </button>
                          );
                        })}
                      </div>

                      {status === "submitting" ? (
                        <p className="mt-5 text-sm font-bold text-[#0b4f8a]">
                          Đang chấm kết quả cấp độ...
                        </p>
                      ) : null}

                      {feedback ? (
                        <div
                          className={`mt-4 rounded-2xl border px-4 py-3 sm:mt-5 ${
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
                            <p className="mt-2 text-sm font-semibold leading-6">
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
