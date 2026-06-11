"use client";

import { create } from "zustand";

export type GameAnswer = {
  id: string;
  content: string;
};

export type GameQuestion = {
  id: string;
  content: string;
  imageUrl: string | null;
  level: number;
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

type GameStatus =
  | "idle"
  | "loading"
  | "ready"
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

type RewardCodeResponse = {
  data?: RewardCode;
  error?: string;
};

type GameState = {
  questions: GameQuestion[];
  answers: Record<string, string>;
  backgrounds: GameBackground[];
  rewardCode: RewardCode | null;
  score: number;
  status: GameStatus;
  error: string | null;
  loadBackgrounds: () => Promise<void>;
  loadAllQuestions: () => Promise<void>;
  selectAnswer: (questionId: string, answerId: string) => void;
  createRewardCode: () => Promise<RewardCode>;
  resetGame: () => void;
};

const initialGameState = {
  questions: [],
  answers: {},
  backgrounds: [],
  rewardCode: null,
  score: 0,
  status: "idle" as GameStatus,
  error: null,
};

const QUESTIONS_PER_GAME = 5;

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

function shuffleQuestions(questions: GameQuestion[]) {
  const shuffledQuestions = [...questions];

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[swapIndex]] = [
      shuffledQuestions[swapIndex],
      shuffledQuestions[index],
    ];
  }

  return shuffledQuestions;
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

  loadAllQuestions: async () => {
    set({
      questions: [],
      answers: {},
      rewardCode: null,
      score: 0,
      status: "loading",
      error: null,
    });

    try {
      const response = await fetch("/api/game/questions");
      const payload = (await response.json()) as QuestionsResponse;

      if (!response.ok || !Array.isArray(payload.data)) {
        throw new Error(getApiError(payload, "Failed to load questions."));
      }

      set({
        questions: shuffleQuestions(payload.data).slice(0, QUESTIONS_PER_GAME),
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
