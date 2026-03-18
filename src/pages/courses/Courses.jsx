import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      // Don't fetch if no user is authenticated yet
      if (!user) {
        setError("Please wait while we confirm your authentication status...");
        return;
      }

      setError("");
      try {
        const data = await getDocs(collection(db, "courses"));
        setCourses(
          data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
      } catch (err) {
        console.error("Error fetching courses:", err);
        if (err.code === "permission-denied") {
          setError("You do not have permission to view courses. Please confirm you are logged in.");
        } else {
          setError("An error occurred while loading courses.");
        }
      }
    };

    fetchCourses();
  }, [user]);

  return (
    <div>
      <h1>Courses</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {courses.map((course) => (
        <div key={course.id}>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <iframe
            width="500"
            height="300"
            src={course.videoUrl}
            title={course.title}
          />
          <p>Instructor: {course.instructor}</p>
        </div>
      ))}
    </div>
  );
}