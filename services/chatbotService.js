const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with your API key (make sure it's in .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateResponse(question, context = "", courseTopics = []) {
    try {
        // Pick a model (gemini-pro is text-only)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Build the prompt with question + context
        const prompt = `
You are a helpful educational AI assistant.
The student asked: "${question}"

Course Context:
${context}

Related Topics:
${courseTopics.join(", ")}

Please give a clear, helpful, and student-friendly explanation.
        `;

        const result = await model.generateContent(prompt);

        // Extract text safely
        const response = result.response.text();

        return response || "Sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I'm having trouble generating a response right now.";
    }
}

async function generateSuggestedQuestions(topics = []) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
Generate 5 suggested student questions for studying based on these topics:
${topics.join(", ")}
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Split into a list of questions (basic cleanup)
        return text.split("\n").filter(q => q.trim().length > 0);
    } catch (error) {
        console.error("Gemini API Error (suggested questions):", error);
        return ["Could not generate suggested questions at the moment."];
    }
}

module.exports = { generateResponse, generateSuggestedQuestions };
