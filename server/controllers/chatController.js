const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { getVectorStore, getCourseData } = require('../services/vectorStoreService');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

// Initialize the Google Gemini chat model with error handling
const initializeGeminiModel = () => {
    try {
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            console.warn('Google Gemini API key not configured');
            return null;
        }

        const model = new ChatGoogleGenerativeAI({
            modelName: 'gemini-pro',
            maxOutputTokens: 2048,
            apiKey: process.env.GOOGLE_GEMINI_API_KEY,
            temperature: 0.7,
        });
        console.log('✅ Gemini model initialized successfully');
        return model;
    } catch (error) {
        console.error('⚠️ Error initializing Gemini model:', error.message);
        return null;
    }
};

// Create chat prompt template for course-related queries
const createChatPrompt = () => {
    return ChatPromptTemplate.fromMessages([
        ["system", `You are an intelligent assistant for an E-Learning Platform. Your primary role is to help users with course-related queries, recommendations, and educational guidance.

Key responsibilities:
- Answer questions about available courses
- Provide course recommendations based on user interests and skill level
- Explain course content, prerequisites, and learning outcomes
- Help users choose between free and paid courses
- Assist with learning paths and career guidance
- Provide general educational advice

Context from course database:
{context}

Guidelines:
- Be helpful, informative, and encouraging
- Focus on educational content and learning
- Use the provided course context to give specific recommendations
- If asked about non-educational topics, politely redirect to course-related discussions
- Provide specific and actionable advice when possible
- Be concise but comprehensive in your responses`],
        ["human", "{question}"]
    ]);
};

// Enhanced chat controller function with vector store integration
const handleChatQuery = async (req, res) => {
    try {
        const { message, chatHistory = [] } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a string'
            });
        }

        // Check if API key is configured
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Google Gemini API key is not configured'
            });
        }

        // Initialize components
        const model = initializeGeminiModel();
        const outputParser = new StringOutputParser();
        const promptTemplate = createChatPrompt();

        // Get relevant course context from vector store
        let context = '';
        try {
            const vectorStore = await getVectorStore();
            if (vectorStore) {
                const relevantDocs = await vectorStore.similaritySearch(message, 3);
                context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
            }
        } catch (vectorError) {
            console.warn('Vector store not available, using basic course data:', vectorError.message);
            // Fallback to basic course data
            try {
                const courseData = await getCourseData();
                context = courseData.slice(0, 3).map(course =>
                    `Title: ${course.title}\nAuthor: ${course.author}\nOverview: ${course.overview}\nFree: ${course.free ? 'Yes' : 'No'}`
                ).join('\n\n');
            } catch (courseError) {
                console.warn('Course data not available:', courseError.message);
                context = 'Course data temporarily unavailable.';
            }
        }

        // Create the processing chain
        const chain = promptTemplate.pipe(model).pipe(outputParser);

        // Generate response
        const response = await chain.invoke({
            context: context,
            question: message
        });

        // Return the response
        res.json({
            success: true,
            data: {
                message: response,
                timestamp: new Date().toISOString(),
                hasContext: context.length > 0
            }
        });

    } catch (error) {
        console.error('Chat controller error:', error);

        // Handle specific error types
        if (error.message.includes('API_KEY')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or missing Google Gemini API key'
            });
        }

        if (error.message.includes('quota')) {
            return res.status(429).json({
                success: false,
                error: 'API quota exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your request'
        });
    }
};

// Get chat configuration
const getChatConfig = async (req, res) => {
    try {
        // Check vector store availability
        let vectorStoreAvailable = false;
        try {
            const vectorStore = await getVectorStore();
            vectorStoreAvailable = !!vectorStore;
        } catch (error) {
            vectorStoreAvailable = false;
        }

        res.json({
            success: true,
            data: {
                model: 'gemini-pro',
                maxTokens: 2048,
                temperature: 0.7,
                available: !!process.env.GOOGLE_GEMINI_API_KEY,
                vectorStoreEnabled: vectorStoreAvailable,
                features: {
                    contextAware: vectorStoreAvailable,
                    courseRecommendations: true,
                    chatHistory: true
                }
            }
        });
    } catch (error) {
        console.error('Error getting chat config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get chat configuration'
        });
    }
};

// Simple fallback chat function that doesn't require AI
const chatWithCourses = async (req, res) => {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        const message = req.body.message?.trim();

        if (!message) {
            return res.status(400).json({
                error: 'Please enter a valid question about our courses.'
            });
        }

        const courseData = getCourseData();
        const courseCount = courseData.length;
        const normalizedMessage = message.toLowerCase();

        let reply = '';
        let courses = [];

        // Simple pattern matching responses
        if (/^(hi|hello|hey|greetings|how are you|what's up)\b/i.test(normalizedMessage)) {
            reply = `Hi! I'm your e-learning assistant. I can help you explore our ${courseCount} available courses.`;
            courses = [];
        }
        else if (/(how many courses|total courses|number of courses)/i.test(normalizedMessage)) {
            reply = `We currently offer ${courseCount} expert-led courses.`;
            courses = courseData.slice(0, 5);
        }
        else if (/free courses/i.test(normalizedMessage)) {
            const freeCourses = courseData.filter(c => c.free);
            reply = `We have ${freeCourses.length} free courses available.`;
            courses = freeCourses;
        }
        else if (/paid courses/i.test(normalizedMessage)) {
            const paidCourses = courseData.filter(c => !c.free);
            reply = `We have ${paidCourses.length} paid courses available.`;
            courses = paidCourses;
        }
        else if (/list all courses|show all courses|catalog/i.test(normalizedMessage)) {
            reply = `Here are all our ${courseCount} available courses:`;
            courses = courseData;
        }
        else {
            // Keyword search fallback
            const relevantCourses = courseData.filter(course =>
                course.title.toLowerCase().includes(normalizedMessage) ||
                course.author.toLowerCase().includes(normalizedMessage) ||
                course.overview.toLowerCase().includes(normalizedMessage)
            );

            if (relevantCourses.length > 0) {
                reply = `I found ${relevantCourses.length} courses related to "${message}":`;
                courses = relevantCourses.slice(0, 5);
            } else {
                reply = "I couldn't find specific courses matching your query. Here are some popular courses:";
                courses = courseData.slice(0, 5);
            }
        }

        return res.json({
            reply,
            courses,
            source: "keyword_search",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat controller error:', error);
        res.header('Access-Control-Allow-Origin', '*');

        return res.status(500).json({
            error: 'An error occurred while processing your request. Please try again.',
            fallback: true
        });
    }
};

module.exports = {
    handleChatQuery: async (req, res) => {
        // Similar error handling for other chat functions
        try {
            const chatModel = initializeGeminiModel();
            if (!chatModel) {
                return res.status(503).json({
                    success: false,
                    error: 'Chat service is currently unavailable'
                });
            }
            // ... rest of handleChatQuery implementation
        } catch (error) {
            console.error('Chat error:', error);
            return res.status(500).json({
                success: false,
                error: 'Chat service error'
            });
        }
    },
    getChatConfig: async (req, res) => {
        try {
            const isAvailable = !!process.env.GOOGLE_GEMINI_API_KEY;
            res.json({
                success: true,
                data: {
                    available: isAvailable,
                    message: isAvailable ? 'Chat service is available' : 'Chat service requires API key configuration'
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get chat configuration'
            });
        }
    },
    chatWithCourses
};