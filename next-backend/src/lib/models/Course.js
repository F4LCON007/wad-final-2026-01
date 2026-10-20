import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true },
    duration: { type: Number, required: true },
    topics: [{ type: String }],
    price: { type: Number, required: true },
    maxStudent: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Open", "Close", "Cancel"],
      default: "Open",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
