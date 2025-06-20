import axios from "axios";

// Set the base URL for your backend server
// Update this with your actual server URL when deployed
const Base_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const instance = axios.create({
    baseURL: Base_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default instance;