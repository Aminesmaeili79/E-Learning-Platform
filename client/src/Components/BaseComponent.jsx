import { useState, useEffect } from "react";
import { Container, Alert, Spinner } from "react-bootstrap";
import SearchCourse from "./SearchCourse";
import Courses from "./Courses";
import api from "../Api/api";

const BaseComponent = () => {
    const [courses, setCourses] = useState([]); // Initialize as empty array
    const [searchString, setSearchString] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Fetch courses from the backend
    const fetchData = async () => {
        try {
            console.log("Attempting to fetch courses from API...");
            const res = await api.get("/loadAllCourses");
            console.log("API Response:", res.data);

            // Ensure we always set an array
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setCourses(res.data);
                console.log("Courses loaded successfully:", res.data.length, "courses");
            } else if (res.data && Array.isArray(res.data)) {
                setCourses([]);
                console.log("API returned empty array");
                setError("No courses available from the server");
            } else {
                console.log("API response is not an array:", typeof res.data);
                setError("Invalid data format received from server");
                setCourses([]); // Ensure it's still an array
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(`Failed to load courses: ${error.message}`);

            // Fallback to static data if API fails
            try {
                const { default: staticData } = await import("../Data/courses.json");
                if (Array.isArray(staticData)) {
                    setCourses(staticData);
                    console.log("Loaded static course data as fallback");
                    setError("Using offline course data"); // Update error to indicate fallback
                } else {
                    setCourses([]);
                    console.error("Static data is not an array");
                }
            } catch (fallbackError) {
                console.error("Failed to load static data:", fallbackError);
                setCourses([]); // Ensure it's still an array
            }
        } finally {
            setLoaded(true);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearchStringUpdate = (value) => {
        setSearchString(value);
    };

    return (
        <Container className="py-4">
            <h1 className="text-center mb-4">E-Learning Platform</h1>

            {error && (
                <Alert variant={error.includes("offline") ? "info" : "warning"} className="mb-3">
                    {error}
                </Alert>
            )}

            {!loaded && (
                <div className="text-center py-4">
                    <Spinner animation="border" role="status" className="me-2" />
                    <span>Loading courses...</span>
                </div>
            )}

            <SearchCourse
                search_string={searchString}
                searchStringUpdated={handleSearchStringUpdate}
            />

            <Courses
                courses_data={courses}
                loaded_from_db={loaded}
                search_string={searchString}
            />

            {loaded && courses.length === 0 && !error && (
                <Alert variant="info" className="text-center mt-4">
                    No courses available at the moment.
                </Alert>
            )}
        </Container>
    );
};

export default BaseComponent;