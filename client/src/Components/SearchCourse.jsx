import { Form, Button, Row, Col, Container, InputGroup } from "react-bootstrap";
import { BsSearch, BsX } from "react-icons/bs";
import { useState, useRef, useEffect } from 'react';

const SearchCourse = ({ search_string, searchStringUpdated, placeholder = "Search courses..." }) => {
    const [searchValue, setSearchValue] = useState(search_string || '');
    const inputRef = useRef(null);

    // Update local state when search_string prop changes
    useEffect(() => {
        setSearchValue(search_string || '');
    }, [search_string]);

    const handleChange = (event) => {
        setSearchValue(event.target.value);
        searchStringUpdated(event.target.value);
    };

    const handleClear = () => {
        setSearchValue('');
        searchStringUpdated('');
        inputRef.current.focus();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        inputRef.current.blur();
    };

    // Focus the input on mount for better UX
    useEffect(() => {
        inputRef.current.focus();
    }, []);

    return (
        <Container className="my-4">
            <Form onSubmit={handleSubmit}>
                <Row className="justify-content-center">
                    <Col xs={12} md={8} lg={6}>
                        <InputGroup className="shadow-sm">
                            <Form.Control
                                ref={inputRef}
                                type="text"
                                placeholder={placeholder}
                                value={searchValue}
                                onChange={handleChange}
                                className="border-end-0 py-2"
                            />
                            {searchValue && (
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleClear}
                                    className="border-start-0 border-end-0 bg-white"
                                    aria-label="Clear search"
                                >
                                    <BsX size={20} />
                                </Button>
                            )}
                            <Button
                                variant={searchValue ? "primary" : "outline-secondary"}
                                type="submit"
                                className="border-start-0"
                            >
                                <BsSearch size={18} />
                            </Button>
                        </InputGroup>
                        <div className="text-muted small mt-2 text-center">
                            Search by course name, university, or keywords
                        </div>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default SearchCourse;