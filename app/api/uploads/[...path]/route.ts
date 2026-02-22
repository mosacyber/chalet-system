import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: filePath } = await params;
  const fileName = filePath.join("/");

  if (fileName.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "public", "uploads", fileName);

  try {
    const file = await readFile(fullPath);
    const ext = path.extname(fileName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
