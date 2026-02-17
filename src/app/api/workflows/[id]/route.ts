import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: any
) {
  const { id } = await context.params;

  return NextResponse.json({ id });
}