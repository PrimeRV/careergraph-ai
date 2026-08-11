import { NextResponse } from "next/server";
import { driver } from "@/lib/cognodb";

export async function GET() {
  try {
    await driver.verifyConnectivity();

    return NextResponse.json({
      success: true,
      message: "CognoDB connection successful",
    });
  } catch (error) {
    console.error("CognoDB connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not connect to CognoDB",
      },
      { status: 500 }
    );
  }
}