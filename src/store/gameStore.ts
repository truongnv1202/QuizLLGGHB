"use client";

import { create } from "zustand";

export type GameLevel = 1 | 2 | 3 | 4 | 5;
export type LevelResult = "pass" | "fail";

export type GameAnswer = {
  id: string;
  content: string;
};

export type GameQuestion = {
  id: string;
  content: string;
  imageUrl: string | null;
  level: GameLevel;
  answers: GameAnswer[];
};

export type GameBackground = {
  id: string;
  imageUrl: string;
};

export type RewardCode = {
  code: string;
  createdAt: string;
};

export type LevelSubmitResult = {
  result: LevelResult;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
};

type GameStatus =
  | "idle"
  | "loading"
  | "ready"
  | "submitting"
  | "passed"
  | "victory"
  | "error";

type QuestionsResponse = {
  data?: GameQuestion[];
  error?: string;
};

type BackgroundsResponse = {
  data?: GameBackground[];
  error?: string;
};

type CheckLevelResponse =
  | LevelSubmitResult
  | {
      error: string;
    };

type RewardCodeResponse = {
  data?: RewardCode;
  error?: string;
};

type GameState = {
  currentLevel: GameLevel;
  questions: GameQuestion[];
  answers: Record<string, string>;
  backgrounds: GameBackground[];
  rewardCode: RewardCode | null;
  score: number;
  status: GameStatus;
  error: string | null;
  loadBackgrounds: () => Promise<void>;
  loadQuestions: (level?: GameLevel) => Promise<void>;
  selectAnswer: (questionId: string, answerId: string) => void;
  submitLevel: () => Promise<LevelSubmitResult>;
  nextLevel: () => Promise<void>;
  createRewardCode: () => Promise<RewardCode>;
  resetGame: () => void;
};

const INITIAL_LEVEL: GameLevel = 1;
const MAX_LEVEL: GameLevel = 5;

const initialGameState = {
  currentLevel: INITIAL_LEVEL,
  questions: [],
  answers: {},
  backgrounds: [],
  rewardCode: null,
  score: 0,
  status: "idle" as GameStatus,
  error: null,
};

function getApiError(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return fallback;
}

function isLevelSubmitResult(
  payload: CheckLevelResponse,
): payload is LevelSubmitResult {
  return (
    "result" in payload &&
    (payload.result === "pass" || payload.result === "fail") &&
    typeof payload.correctCount === "number" &&
    typeof payload.totalQuestions === "number" &&
    typeof payload.scorePercent === "number"
  );
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialGameState,

  loadBackgrounds: async () => {
    try {
      const response = await fetch("/api/game/backgrounds");
      const payload = (await response.json()) as BackgroundsResponse;

      if (!response.ok || !Array.isArray(payload.data)) {
        throw new Error(getApiError(payload, "Failed to load backgrounds."));
      }

      set({
        backgrounds: payload.data,
        error: null,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load backgrounds.",
      });
    }
  },

  loadQuestions: async (level = get().currentLevel) => {
    set({
      currentLevel: level,
      questions: [],
      answers: {},
      rewardCode: null,
      score: 0,
      status: "loading",
      error: null,
    });

    try {
      const response = await fetch(`/api/game/questions/${level}`);
      const payload = (await response.json()) as QuestionsResponse;

      if (!response.ok || !Array.isArray(payload.data)) {
        throw new Error(getApiError(payload, "Failed to load questions."));
      }

      set({
        currentLevel: level,
        questions: payload.data,
        answers: {},
        score: 0,
        status: "ready",
        error: null,
      });
    } catch (error) {
      set({
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to load questions.",
      });
    }
  },

  selectAnswer: (questionId, answerId) => {
    set((state) => {
      const question = state.questions.find((item) => item.id === questionId);
      const answerBelongsToQuestion = question?.answers.some(
        (answer) => answer.id === answerId,
      );

      if (!question || !answerBelongsToQuestion) {
        return state;
      }

      return {
        answers: {
          ...state.answers,
          [questionId]: answerId,
        },
        error: null,
      };
    });
  },

  submitLevel: async () => {
    const { answers, currentLevel } = get();
    const submittedAnswers = Object.entries(answers).map(
      ([questionId, answerId]) => ({
        questionId,
        answerId,
      }),
    );

    set({
      status: "submitting",
      error: null,
    });

    try {
      const response = await fetch("/api/game/check-level", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: currentLevel,
          answers: submittedAnswers,
        }),
      });
      const payload = (await response.json()) as CheckLevelResponse;

      if (!response.ok || !isLevelSubmitResult(payload)) {
        throw new Error(getApiError(payload, "Failed to submit level."));
      }

      if (payload.result === "fail") {
        get().resetGame();

        return payload;
      }

      set({
        score: payload.correctCount,
        status: currentLevel === MAX_LEVEL ? "victory" : "passed",
        error: null,
      });

      return payload;
    } catch (error) {
      set({
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to submit level.",
      });

      throw error;
    }
  },

  nextLevel: async () => {
    const { currentLevel, loadQuestions } = get();

    if (currentLevel >= MAX_LEVEL) {
      set({
        status: "victory",
        error: null,
      });

      return;
    }

    await loadQuestions((currentLevel + 1) as GameLevel);
  },

  createRewardCode: async () => {
    const existingRewardCode = get().rewardCode;

    if (existingRewardCode) {
      return existingRewardCode;
    }

    try {
      const response = await fetch("/api/game/reward-code", {
        method: "POST",
      });
      const payload = (await response.json()) as RewardCodeResponse;

      if (!response.ok || !payload.data) {
        throw new Error(getApiError(payload, "Failed to create reward code."));
      }

      set({
        rewardCode: payload.data,
        error: null,
      });

      return payload.data;
    } catch (error) {
      set({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Failed to create reward code.",
      });

      throw error;
    }
  },

  resetGame: () => {
    set((state) => ({
      ...initialGameState,
      backgrounds: state.backgrounds,
    }));
  },
}));
