import { randomInt } from "node:crypto";

const MIN_LEVEL = 1;
const MAX_LEVEL = 5;
const REWARD_CODE_LENGTH = 6;
const REWARD_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function parseGameLevel(value: unknown) {
  const level = Number(value);

  if (!Number.isInteger(level) || level < MIN_LEVEL || level > MAX_LEVEL) {
    return null;
  }

  return level;
}

export function generateRewardCode() {
  let code = "";

  for (let index = 0; index < REWARD_CODE_LENGTH; index += 1) {
    code += REWARD_CODE_ALPHABET[randomInt(REWARD_CODE_ALPHABET.length)];
  }

  return code;
}

export function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
