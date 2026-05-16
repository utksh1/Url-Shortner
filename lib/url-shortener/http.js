import { AppError } from "./errors"
import { NextResponse } from "next/server"

export function jsonError(error) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }

  console.error("Unhandled API error:", error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
