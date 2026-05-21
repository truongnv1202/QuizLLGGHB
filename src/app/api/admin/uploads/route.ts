import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { badRequest, serverError } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getFileExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  return extension || ".jpg";
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return badRequest("Upload field 'file' is required.");
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return badRequest("Only GIF, JPEG, PNG, and WebP images are allowed.");
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return badRequest("Image must be smaller than 5MB.");
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const fileName = `${randomUUID()}${getFileExtension(file.name)}`;
    const filePath = path.join(uploadsDir, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());

    await mkdir(uploadsDir, { recursive: true });
    await writeFile(filePath, bytes);

    return NextResponse.json(
      {
        data: {
          imageUrl: `/uploads/${fileName}`,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to upload admin image:", error);

    return serverError("Failed to upload image.");
  }
}
