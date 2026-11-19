import { NextResponse } from "next/server";

import sampleResponse from "@/lib/sample-response.json";

export function GET() {
  return NextResponse.json(sampleResponse);
}
