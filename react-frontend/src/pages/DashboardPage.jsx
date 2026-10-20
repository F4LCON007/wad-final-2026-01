import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function DashboardPage() {
  const { user, setUser, loading } = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating course (Teacher only)
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    duration: "",
    topics: "",
    price: "",
    maxStudent: "",
    status: "Open",
  });

  const loadCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/course`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (user) {
      loadCourses();
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setIsCreating(true);

    try {
      const payload = {
        ...newCourse,
        duration: Number(newCourse.duration),
        price: Number(newCourse.price),
        maxStudent: Number(newCourse.maxStudent),
        topics: newCourse.topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(`${API_URL}/course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("Course created successfully!");
        setNewCourse({
          courseName: "",
          duration: "",
          topics: "",
          price: "",
          maxStudent: "",
          status: "Open",
        });
        loadCourses();
      } else {
        setError(data.error || "Failed to create course");
      }
    } catch (err) {
      setError("Error creating course");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    setError("");
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/course/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Course deleted successfully");
        loadCourses();
      } else {
        setError(data.error || "Delete failed");
      }
    } catch (err) {
      setError("Error deleting course");
    }
  };

  const handleEnroll = async (courseId) => {
    setError("");
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/course/${courseId}/enroll`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Enrolled successfully!");
        loadCourses();
      } else {
        setError(data.error || "Enrollment failed");
      }
    } catch (err) {
      setError("Error during enrollment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredCourses = courses.filter((c) => {
    const term = search.toLowerCase();
    const cName = c.courseName?.toLowerCase() || "";
    const tName = c.teacherId?.username?.toLowerCase() || "";
    return cName.includes(term) || tName.includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <span className="font-bold text-lg text-white tracking-wide">
              CourseHub
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-800/80 py-1.5 px-3 rounded-full border border-slate-700/60">
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold uppercase text-white">
                {user.username?.charAt(0) || "U"}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-200 leading-none">
                  {user.username}
                </p>
                <span
                  className={`text-[10px] font-medium leading-none ${
                    user.role === "Teacher"
                      ? "text-indigo-400"
                      : "text-emerald-400"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Alert Notifications */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-200 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {msg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{msg}</span>
            </div>
            <button
              onClick={() => setMsg("")}
              className="text-emerald-400 hover:text-emerald-200 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ==================== TEACHER VIEW ==================== */}
        {user.role === "Teacher" && (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Teacher Dashboard
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Manage your course catalog, track enrollment, and create new
                  offerings.
                </p>
              </div>

              {/* Quick Stats Summary */}
              <div className="flex items-center space-x-4">
                <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 text-center">
                  <span className="block text-xs text-slate-400 font-medium">
                    Courses Created
                  </span>
                  <span className="text-xl font-bold text-indigo-400">
                    {courses.length}
                  </span>
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 text-center">
                  <span className="block text-xs text-slate-400 font-medium">
                    Total Enrolled
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    {courses.reduce(
                      (acc, c) => acc + (c.enrolledStudents?.length || 0),
                      0,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Create New Course Form */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create New Course</span>
              </h2>

              <form
                onSubmit={handleCreateCourse}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourse.courseName}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, courseName: e.target.value })
                    }
                    placeholder="e.g. Web Development 101"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, duration: e.target.value })
                    }
                    placeholder="e.g. 40"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Topics (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourse.topics}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, topics: e.target.value })
                    }
                    placeholder="e.g. React, Node, MongoDB"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newCourse.price}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, price: e.target.value })
                    }
                    placeholder="e.g. 199"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCourse.maxStudent}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, maxStudent: e.target.value })
                    }
                    placeholder="e.g. 25"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={newCourse.status}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Close">Close</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-3 pt-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isCreating ? "Creating Course..." : "Add Course"}
                  </button>
                </div>
              </form>
            </div>

            {/* Courses Cards Grid */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Your Courses
              </h2>
              {courses.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center">
                  <p className="text-slate-400 text-sm">
                    No courses created yet. Use the form above to add your first
                    course.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((c) => {
                    const enrolledCount = c.enrolledStudents?.length || 0;
                    const isEnrolled = enrolledCount > 0;
                    const percentFull = Math.min(
                      100,
                      Math.round((enrolledCount / c.maxStudent) * 100),
                    );

                    return (
                      <div
                        key={c._id || c.id}
                        className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                      >
                        <div>
                          {/* Course Status Badge & Title */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-bold text-lg text-white leading-snug">
                              {c.courseName}
                            </h3>
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                                c.status === "Open"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : c.status === "Close"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>

                          {/* Details List */}
                          <div className="space-y-2 text-xs text-slate-400 mb-4">
                            <p>
                              <strong className="text-slate-200">Price:</strong>{" "}
                              ${c.price}
                            </p>
                            <p>
                              <strong className="text-slate-200">
                                Duration:
                              </strong>{" "}
                              {c.duration} Hours
                            </p>
                            {c.topics && c.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(Array.isArray(c.topics)
                                  ? c.topics
                                  : c.topics.split(",")
                                ).map((tp, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]"
                                  >
                                    {tp.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Enrollment Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">
                                Enrolled Capacity
                              </span>
                              <span className="font-semibold text-slate-200">
                                {enrolledCount} / {c.maxStudent}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  percentFull >= 100
                                    ? "bg-red-500"
                                    : "bg-indigo-500"
                                }`}
                                style={{ width: `${percentFull}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          {isEnrolled ? (
                            <span
                              className="text-[11px] text-slate-500 italic"
                              title="Courses with enrolled students cannot be deleted"
                            >
                              🔒 Active students enrolled
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              No students enrolled
                            </span>
                          )}

                          <button
                            onClick={() => handleDeleteCourse(c._id || c.id)}
                            disabled={isEnrolled}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                              isEnrolled
                                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                : "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20"
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== STUDENT VIEW ==================== */}
        {user.role === "Student" && (
          <div className="space-y-6">
            {/* Search Bar Header */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Browse Courses
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Discover available classes and enroll instantly.
                </p>
              </div>

              <div className="relative">
                <svg
                  className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by course name or teacher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Available Courses Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">
                  Available Offerings
                </h2>
                <span className="text-xs text-slate-400">
                  Showing {filteredCourses.length} course
                  {filteredCourses.length !== 1 && "s"}
                </span>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center">
                  <p className="text-slate-400 text-sm">
                    No courses match your search query.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((c) => {
                    const isEnrolled = c.enrolledStudents?.some(
                      (sId) => sId === user._id || sId?._id === user._id,
                    );
                    const enrolledCount = c.enrolledStudents?.length || 0;
                    const isFull = enrolledCount >= c.maxStudent;
                    const isClosed = c.status === "Close";
                    const isCanceled = c.status === "Cancel";
                    const teacherName = c.teacherId?.username || "Instructor";

                    return (
                      <div
                        key={c._id || c.id}
                        className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                      >
                        <div>
                          {/* Course Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-lg text-white leading-snug">
                              {c.courseName}
                            </h3>
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                                c.status === "Open"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>

                          <p className="text-xs text-indigo-400 font-medium mb-3">
                            Instructor:{" "}
                            <span className="text-slate-300">
                              {teacherName}
                            </span>
                          </p>

                          {/* Info Tags */}
                          <div className="grid grid-cols-2 gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800/60 mb-4 text-xs">
                            <div>
                              <span className="text-slate-500 block text-[10px]">
                                PRICE
                              </span>
                              <span className="font-bold text-white">
                                ${c.price}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">
                                DURATION
                              </span>
                              <span className="font-bold text-white">
                                {c.duration} Hours
                              </span>
                            </div>
                          </div>

                          {/* Capacity */}
                          <div className="text-xs text-slate-400 mb-4">
                            <div className="flex justify-between mb-1">
                              <span>Seats Taken</span>
                              <span className="font-semibold text-slate-200">
                                {enrolledCount} / {c.maxStudent}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (enrolledCount / c.maxStudent) * 100,
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Button Action */}
                        <div className="pt-3 border-t border-slate-800">
                          {isEnrolled ? (
                            <div className="w-full py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-1.5">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span>Enrolled</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEnroll(c._id || c.id)}
                              disabled={isClosed || isFull || isCanceled}
                              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                                isFull || isClosed || isCanceled
                                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                              }`}
                            >
                              <span>
                                {isFull
                                  ? "Class Full"
                                  : isClosed
                                    ? "Registration Closed"
                                    : isCanceled
                                      ? "Course Canceled"
                                      : "Enroll Now"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
