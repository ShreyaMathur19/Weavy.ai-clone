import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  // 🔥 For now simulate Transloadit
  // Replace with real transloadit assembly later

  const buffer = Buffer.from(await file.arrayBuffer());

  return NextResponse.json({
  url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
});
}