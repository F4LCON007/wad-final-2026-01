import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/lib/models/Course";
import { verifyToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
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

    await connectMongoDB();

    // 3. Find target course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 4. Role Authorization
    if (auth.user.role !== "Teacher") {
      return NextResponse.json(
        { error: "Forbidden: Teacher access required" },
        { status: 403 },
      );
    }

    if (course.teacherId.toString() !== auth.user.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own courses" },
        { status: 403 },
      );
    }

    // 5. Enforce Business Logic: Block deletion if students are enrolled
    if (course.enrolledStudents && course.enrolledStudents.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with enrolled students" },
        { status: 400 },
      );
    }

    // 6. Delete course
    await Course.findByIdAndDelete(courseId);

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
