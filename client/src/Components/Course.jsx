import { Row, Col, Image, Button, Card, Badge } from "react-bootstrap";
import React from 'react';

const Course = ({ course }) => {
    return (
        <Card className="my-4 p-4 shadow-sm border-0 rounded-4 hover-shadow transition-all">
            <Row className="g-4 align-items-center">
                <Col xs={12} md={3} className="d-flex justify-content-center">
                    <div className="position-relative d-inline-block cursor-pointer"> {/* Added cursor-pointer */}
                        {/* Make the image clickable by wrapping it in an <a> tag */}
                        <a href={course.url} target="_blank" rel="noopener noreferrer" className="d-block"> {/* d-block ensures the link wraps the image properly */}
                            <Image
                                src={course.img}
                                alt={`Course: ${course.title}`}
                                fluid
                                rounded
                                className="course-image transition-all"
                                style={{
                                    width: "100%",
                                    maxWidth: "200px",
                                    height: "auto",
                                    objectFit: "cover",
                                    border: "3px solid var(--bs-primary)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                }}
                            />
                        </a>
                        {/* Conditional rendering for FREE or PAID badge */}
                        {course.free ? (
                            <Badge pill bg="success" className="position-absolute top-0 start-100 translate-middle">
                                FREE
                            </Badge>
                        ) : (
                            <Badge pill bg="warning" className="position-absolute top-0 start-100 translate-middle">
                                PAID
                            </Badge>
                        )}
                    </div>
                </Col>
                <Col xs={12} md={9} className="text-start">
                    <div className="d-flex flex-column h-100">
                        <div className="mb-3">
                            <h5 className="fw-bold mb-1">
                                <a href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none text-dark hover-primary">
                                    {course.title}
                                </a>
                            </h5>
                            <div className="text-muted small">{course.author}</div>
                        </div>

                        <p className="text-muted mb-3 flex-grow-1">
                            {course.overview}
                        </p>

                        <div className="d-flex justify-content-between align-items-center mt-auto">
                            <div>
                                <span className="me-2">
                                    <i className="bi bi-star-fill text-warning"></i>
                                    <span className="ms-1 small">{course.rating || '4.8'}</span>
                                </span>
                                <span className="me-2">
                                    <i className="bi bi-people-fill text-info"></i>
                                    <span className="ms-1 small">{course.students || '1.2k'}</span>
                                </span>
                                <span className="badge bg-light text-dark">
                                    {course.duration || '8h'}
                                </span>
                            </div>

                            <Button
                                variant="outline-primary"
                                href={course.url}
                                target="_blank"
                                className="px-3 py-2 rounded-pill fw-medium d-flex align-items-center"
                            >
                                <i className="bi bi-arrow-up-right me-2"></i>
                                View Course
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Add this to your CSS file or style tag */}
            <style jsx>{`
                .hover-shadow:hover {
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
                .course-image:hover {
                    transform: scale(1.03);
                }
                .hover-primary:hover {
                    color: var(--bs-primary) !important;
                }
                /* Optional: Add a subtle hover effect to the image wrapper to indicate clickability */
                .position-relative.d-inline-block.cursor-pointer:hover .course-image {
                    transform: scale(1.03); /* Re-apply the scale effect from original image hover */
                    box-shadow: 0 6px 18px rgba(0,0,0,0.2) !important; /* Slightly stronger shadow on hover */
                }
            `}</style>
        </Card>
    );
};

export default Course;