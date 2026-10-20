import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import { verifyToken } from "@/lib/auth";

export async function POST(req, { params }) {
  try {
    // 1. Verify Authentication
    const auth = verifyToken(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 2. Await Next.js 16 async params
    const resolvedParams = await params;
    const courseId = resolvedParams?.course_id;

    if (!courseId || courseId === "undefined") {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    // 3. Role Authorization: Only Students can enroll
    if (auth.user.role !== "Student") {
      return NextResponse.json(
        { error: "Only students can enroll in courses" },
        { status: 403 },
      );
    }

    await connectMongoDB();

    // 4. Find target course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 5. Business Logic Rule: Check if course is open
    if (course.status !== "Open") {
      return NextResponse.json(
        { error: "Course is not open for enrollment" },
        { status: 400 },
      );
    }

    // 6. Business Logic Rule: Check if course reached maximum capacity
    if (course.enrolledStudents.length >= course.maxStudent) {
      return NextResponse.json({ error: "Course is full" }, { status: 400 });
    }

    // 7. Business Logic Rule: Prevent duplicate enrollment
    const studentId = auth.user.userId;
    const isAlreadyEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === studentId,
    );

    if (isAlreadyEnrolled) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 },
      );
    }

    // 8. Enroll student
    course.enrolledStudents.push(studentId);
    await course.save();

    return NextResponse.json(
      { message: "Enrolled successfully", course },
      { status: 200 },
    );
  } catch (error) {
    console.error("ENROLL COURSE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
