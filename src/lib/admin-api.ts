import { NextResponse } from "next/server";

import { parseGameLevel } from "@/lib/game";

export type AdminAnswerInput = {
  content: string;
  isCorrect: boolean;
};

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function parseOptionalString(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function parseRequiredString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function parseOptionalBoolean(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "boolean" ? value : null;
}

export function parseLevelOrNull(value: unknown) {
  return parseGameLevel(value);
}

export function parseAnswerInputs(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const answers: AdminAnswerInput[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const content = parseRequiredString("content" in item ? item.content : null);
    const isCorrect = "isCorrect" in item ? item.isCorrect : null;

    if (!content || typeof isCorrect !== "boolean") {
      return null;
    }

    answers.push({ content, isCorrect });
  }

  return answers;
}
