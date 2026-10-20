import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(req) {
  try {
    const auth = verifyToken(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectMongoDB();
    const user = await User.findById(auth.user.userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("ME ROUTE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
