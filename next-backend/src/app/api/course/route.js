//src/app/api/course/route.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/lib/models/Course";

// CREATE A COURSE (Teachers Only)
export async function POST(req) {
  try {
    const auth = verifyToken(req);
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

    // Enforce Role: Only Teachers can create courses
    if (auth.user.role !== "Teacher") {
      return NextResponse.json(
        { error: "Forbidden: Only Teachers can create courses" },
        { status: 403 },
      );
    }

    await connectMongoDB();
    const body = await req.json();

    const newCourse = await Course.create({
      ...body,
      teacherId: auth.user.userId, // Automatically assign the logged-in Teacher
      enrolledStudents: [], // Initialize empty
    });

    return NextResponse.json(
      { message: "Course created successfully", course: newCourse },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

// GET COURSES (Role-Based Filtering)
export async function GET(req) {
  try {
    const auth = verifyToken(req);
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

    await connectMongoDB();
    let courses;

    if (auth.user.role === "Teacher") {
      // Teachers only see their own courses
      courses = await Course.find({ teacherId: auth.user.userId }).sort({
        createdAt: -1,
      });
    } else if (auth.user.role === "Student") {
      // Students see all courses except 'Cancel' status, populated with Teacher's name
      courses = await Course.find({ status: { $ne: "Cancel" } })
        .populate("teacherId", "username")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
