import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { defaultQuestions } from "./seed-data";
import { PrismaClient } from "../src/generated/prisma/client";

type SeedAnswer = {
  content: string;
  isCorrect: boolean;
};

type SeedQuestion = {
  level: number;
  content: string;
  explanation: string | null;
  imageUrl: string | null;
  answers: SeedAnswer[];
};

type DraftQuestion = {
  level: number;
  content: string;
  explanation: string | null;
  imageUrl: string | null;
  answers: string[];
  correctAnswerRaw: string | null;
};

type SeedOptions = {
  source: string | null;
  reset: boolean;
  dryRun: boolean;
};

const LEVEL_PATTERN = /^(?:level|cấp độ|cap do)\s*[:\-]?\s*([1-5])\b/i;
const QUESTION_PATTERN =
  /^(?:câu\s*)?(\d+)[\.\):\-]\s*(.+)$|^q(?:uestion)?\s*[:\-]\s*(.+)$/i;
const ANSWER_PATTERN = /^(?:([A-Da-d])[\.\)]|[-*•])\s+(.+)$/;
const CORRECT_PATTERN =
  /^(?:đáp án đúng|dap an dung|đáp án|dap an|answer|correct answer)\s*[:：\-]\s*(.+)$/i;
const EXPLANATION_PATTERN =
  /^(?:giải thích|giai thich|explanation)\s*[:：\-]\s*(.*)$/i;
const IMAGE_PATTERN =
  /^(?:ảnh|anh|hình|hinh|image|imageUrl)\s*[:：\-]\s*(.+)$/i;

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const sourceFlagIndex = args.findIndex((arg) => arg === "--source");
  const sourceFromFlag =
    sourceFlagIndex >= 0 ? args[sourceFlagIndex + 1] : undefined;
  const positionalSource = args.find((arg) => !arg.startsWith("--"));

  return {
    source: sourceFromFlag ?? positionalSource ?? process.env.SEED_SOURCE ?? null,
    reset: args.includes("--reset") || process.env.SEED_RESET === "true",
    dryRun: args.includes("--dry-run") || process.env.SEED_DRY_RUN === "true",
  };
}

function toGoogleDocExportUrl(source: string) {
  const match = source.match(/docs\.google\.com\/document\/d\/([^/]+)/);

  if (!match) {
    return source;
  }

  return `https://docs.google.com/document/d/${match[1]}/export?format=txt`;
}

async function loadSeedText(source: string) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(toGoogleDocExportUrl(source));

    if (!response.ok) {
      throw new Error(
        `Could not fetch seed source: ${response.status} ${response.statusText}`,
      );
    }

    return response.text();
  }

  return readFile(path.resolve(process.cwd(), source), "utf8");
}

function normalizeText(value: string) {
  return value
    .normalize("NFC")
    .replace(/\u00a0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function normalizeForCompare(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function createDraftQuestion(level: number, content: string): DraftQuestion {
  return {
    level,
    content: content.trim(),
    explanation: null,
    imageUrl: null,
    answers: [],
    correctAnswerRaw: null,
  };
}

function answerLetterToIndex(value: string) {
  const match = value.trim().match(/^([A-Da-d])(?:[\.\)]|\b)/);

  if (!match) {
    return null;
  }

  return match[1].toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
}

function findCorrectAnswerIndex(question: DraftQuestion) {
  if (!question.correctAnswerRaw) {
    return question.answers.length - 1;
  }

  const rawCorrectAnswer = question.correctAnswerRaw.trim();
  const indexFromLetter = answerLetterToIndex(rawCorrectAnswer);

  if (
    indexFromLetter !== null &&
    indexFromLetter >= 0 &&
    indexFromLetter < question.answers.length
  ) {
    return indexFromLetter;
  }

  const normalizedCorrectAnswer = normalizeForCompare(
    rawCorrectAnswer.replace(/^[A-Da-d][\.\)]\s*/, ""),
  );

  return question.answers.findIndex(
    (answer) => normalizeForCompare(answer) === normalizedCorrectAnswer,
  );
}

function finalizeQuestion(question: DraftQuestion, questionNumber: number) {
  if (!question.content) {
    throw new Error(`Question #${questionNumber} is missing content.`);
  }

  if (question.level < 1 || question.level > 5) {
    throw new Error(`Question #${questionNumber} has invalid level.`);
  }

  if (question.answers.length < 2 || question.answers.length > 4) {
    throw new Error(
      `Question #${questionNumber} must have 2, 3, or 4 answers.`,
    );
  }

  const correctAnswerIndex = findCorrectAnswerIndex(question);

  if (correctAnswerIndex < 0 || correctAnswerIndex >= question.answers.length) {
    throw new Error(
      `Question #${questionNumber} has a correct answer that does not match any option.`,
    );
  }

  return {
    level: question.level,
    content: question.content,
    explanation: question.explanation,
    imageUrl: question.imageUrl,
    answers: question.answers.map((answer, index) => ({
      content: answer,
      isCorrect: index === correctAnswerIndex,
    })),
  } satisfies SeedQuestion;
}

function parseSeedText(input: string) {
  const lines = normalizeText(input)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const questions: SeedQuestion[] = [];
  let currentLevel = 1;
  let currentQuestion: DraftQuestion | null = null;
  let isReadingExplanation = false;

  function flushQuestion() {
    if (!currentQuestion) {
      return;
    }

    questions.push(finalizeQuestion(currentQuestion, questions.length + 1));
    currentQuestion = null;
    isReadingExplanation = false;
  }

  for (const line of lines) {
    const levelMatch = line.match(LEVEL_PATTERN);

    if (levelMatch) {
      flushQuestion();
      currentLevel = Number(levelMatch[1]);
      continue;
    }

    const questionMatch = line.match(QUESTION_PATTERN);

    if (questionMatch) {
      flushQuestion();
      currentQuestion = createDraftQuestion(
        currentLevel,
        questionMatch[2] ?? questionMatch[3] ?? "",
      );
      continue;
    }

    if (!currentQuestion) {
      continue;
    }

    const imageMatch = line.match(IMAGE_PATTERN);

    if (imageMatch) {
      currentQuestion.imageUrl = imageMatch[1].trim();
      isReadingExplanation = false;
      continue;
    }

    const answerMatch = line.match(ANSWER_PATTERN);

    if (answerMatch) {
      currentQuestion.answers.push(answerMatch[2].trim());
      isReadingExplanation = false;
      continue;
    }

    const correctMatch = line.match(CORRECT_PATTERN);

    if (correctMatch) {
      currentQuestion.correctAnswerRaw = correctMatch[1].trim();
      isReadingExplanation = false;
      continue;
    }

    const explanationMatch = line.match(EXPLANATION_PATTERN);

    if (explanationMatch) {
      currentQuestion.explanation = explanationMatch[1].trim() || null;
      isReadingExplanation = true;
      continue;
    }

    if (isReadingExplanation) {
      currentQuestion.explanation = [currentQuestion.explanation, line]
        .filter(Boolean)
        .join(" ");
      continue;
    }

    if (currentQuestion.answers.length === 0) {
      currentQuestion.content = `${currentQuestion.content} ${line}`.trim();
    }
  }

  flushQuestion();

  return questions;
}

async function seedQuestions(questions: SeedQuestion[], shouldReset: boolean) {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    if (shouldReset) {
      await prisma.question.deleteMany();
    }

    for (const question of questions) {
      await prisma.question.create({
        data: {
          content: question.content,
          explanation: question.explanation,
          imageUrl: question.imageUrl,
          level: question.level,
          answers: {
            create: question.answers,
          },
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

function printSummary(questions: SeedQuestion[]) {
  const summary = questions.reduce<Record<number, number>>((accumulator, question) => {
    accumulator[question.level] = (accumulator[question.level] ?? 0) + 1;
    return accumulator;
  }, {});

  console.log(`Parsed ${questions.length} questions.`);

  for (const level of [1, 2, 3, 4, 5]) {
    console.log(`- Level ${level}: ${summary[level] ?? 0} question(s)`);
  }
}

async function main() {
  const options = parseArgs();

  const questions = options.source
    ? parseSeedText(await loadSeedText(options.source))
    : defaultQuestions;

  if (questions.length === 0) {
    throw new Error("No questions were parsed from the seed source.");
  }

  printSummary(questions);

  if (options.dryRun) {
    console.log("Dry run enabled. No data was written.");
    return;
  }

  await seedQuestions(questions, options.reset);
  console.log(
    options.reset
      ? "Seed completed after clearing existing questions."
      : "Seed completed. Existing questions were kept.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
