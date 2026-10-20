import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectMongoDB();

    // Prevent duplicate seeding
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json(
        { message: "Database already seeded with users." },
        { status: 200 },
      );
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    const testUsers = [
      {
        username: "Teacher One",
        email: "t1@exam.com",
        password: hashedPassword,
        role: "Teacher",
      },
      {
        username: "Teacher Two",
        email: "t2@exam.com",
        password: hashedPassword,
        role: "Teacher",
      },
      {
        username: "Teacher Three",
        email: "t3@exam.com",
        password: hashedPassword,
        role: "Teacher",
      },
      {
        username: "Student One",
        email: "s1@exam.com",
        password: hashedPassword,
        role: "Student",
      },
      {
        username: "Student Two",
        email: "s2@exam.com",
        password: hashedPassword,
        role: "Student",
      },
      {
        username: "Student Three",
        email: "s3@exam.com",
        password: hashedPassword,
        role: "Student",
      },
    ];

    await User.insertMany(testUsers);

    return NextResponse.json(
      { message: "Successfully seeded 3 Teachers and 3 Students." },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed database: " + error.message },
      { status: 500 },
    );
  }
}
