const fs = require('fs');
const path = require('path');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { Document } = require('@langchain/core/documents');

let vectorStore = null;
let courseData = [];

const initVectorStore = async () => {
    try {
        // Load course data first (this should always work)
        const filePath = path.join(__dirname, '../data/courses.json');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        courseData = JSON.parse(rawData);
        console.log(`✅ Loaded ${courseData.length} courses from JSON file`);

        // Only try to initialize vector store if API key is available
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            console.warn('⚠️ Google Gemini API key not configured - vector store will not be available');
            console.log('📚 Course data is still available for basic functionality');
            return;
        }

        try {
            const documents = courseData.map(item => new Document({
                pageContent: `Course Title: ${item.title}. Author: ${item.author}. Free: ${item.free ? 'Yes' : 'No'}. Overview: ${item.overview}. URL: ${item.url}`,
                metadata: { ...item }
            }));

            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200
            });

            const chunks = await splitter.splitDocuments(documents);

            const embeddings = new GoogleGenerativeAIEmbeddings({
                model: 'text-embedding-004',
                apiKey: process.env.GOOGLE_GEMINI_API_KEY
            });

            vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
            console.log("✅ Vector store initialized successfully");
        } catch (vectorError) {
            console.warn('⚠️ Vector store initialization failed:', vectorError.message);
            console.log('📚 Continuing without vector store - basic functionality available');
            vectorStore = null;
        }

    } catch (error) {
        console.error('⚠️ Error loading course data:', error.message);
        // Try to load some basic data as fallback
        courseData = [];
        console.log('📚 No course data available');
    }
};

const getVectorStore = () => vectorStore;
const getCourseData = () => courseData;

const searchSimilarCourses = async (query, limit = 3) => {
    try {
        if (!vectorStore) {
            throw new Error('Vector store not initialized');
        }

        const results = await vectorStore.similaritySearch(query, limit);
        return results.map(doc => ({
            content: doc.pageContent,
            metadata: doc.metadata,
            score: doc.score || 0
        }));
    } catch (error) {
        console.error('Error searching similar courses:', error);
        throw new Error(`Failed to search courses: ${error.message}`);
    }
};

const getVectorStoreStats = () => {
    try {
        const stats = {
            initialized: !!vectorStore,
            courseCount: courseData ? courseData.length : 0,
            hasApiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
            timestamp: new Date().toISOString()
        };
        return stats;
    } catch (error) {
        console.error('Error getting vector store stats:', error);
        return { error: error.message };
    }
};

module.exports = {
    initVectorStore,
    getVectorStore,
    getCourseData,
    searchSimilarCourses,
    getVectorStoreStats
};