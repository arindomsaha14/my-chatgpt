const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Convert incoming messages into a single prompt string
    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.content
      .map((part) => (part.type === "text" ? part.text : ""))
      .join(" ");

    const result = await model.generateContentStream(userText);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});