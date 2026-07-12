import express from "express";
import dotenv from "dotenv";
import {graph} from "./services/aiRespnse.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/ai-query", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      error: "Query is required",
    });
  }

  try {
    const result = await graph.invoke(
        {
        messages: [
            {
            role: "user",
            content: query,
            },
        ],
        },
        {
            configurable:{thread_id:"user-01"}
        }
    );

    const finalMessage = result.messages[result.messages.length - 1];

        res.status(200).json({
            response: finalMessage.content,
        });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch AI response",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});