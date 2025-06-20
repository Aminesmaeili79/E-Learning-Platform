import { Container, Alert } from "react-bootstrap";
import Course from "./Course";

const Courses = ({ courses_data, loaded_from_db, search_string }) => {
    console.log("Courses component received:", {
        courses_data_type: typeof courses_data,
        courses_data_value: courses_data,
        courses_count: Array.isArray(courses_data) ? courses_data.length : "not an array",
        loaded_from_db,
        search_string
    });

    // Ensure courses_data is always an array
    const coursesArray = Array.isArray(courses_data) ? courses_data : [];

    const checkCondition = (elem) => {
        if (!elem || typeof elem !== 'string') return false;
        return elem.toLowerCase().includes(search_string.toLowerCase());
    };

    // Filter courses based on search string
    const filteredCourses = coursesArray.filter((course) =>
        checkCondition(course.title) || checkCondition(course.author)
    );

    console.log("Filtered courses count:", filteredCourses.length);

    return coursesArray.length > 0 ? (
        <Container>
            {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                    <div key={index} className="border border-light mt-3 rounded shadow-sm">
                        <Course course={course} />
                    </div>
                ))
            ) : (
                search_string && (
                    <Alert variant="info" className="text-center mt-4 mb-4">
                        <h5 className="text-muted">No Courses Found against your Search</h5>
                    </Alert>
                )
            )}
        </Container>
    ) : (
        loaded_from_db ? (
            <Alert variant="warning" className="text-center mt-4">
                <h5>No courses found!</h5>
                <p>Please check your internet connection or try again later.</p>
            </Alert>
        ) : (
            <div className="text-center mt-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading courses...</span>
                </div>
                <p className="mt-2">Loading courses...</p>
            </div>
        )
    );
};

export default Courses;