import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );

    // Clear the token cookie with matching cross-site parameters
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 0, // Immediately expires the cookie
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Logout failed" },
      { status: 500 },
    );
  }
}
