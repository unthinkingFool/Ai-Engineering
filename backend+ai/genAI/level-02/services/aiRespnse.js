import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { Annotation, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { toolsCondition } from "@langchain/langgraph/prebuilt";

dotenv.config();

/** tools */
const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

const tools=[tool]
const toolNode= new ToolNode(tools)

const memory= new MemorySaver()

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.LLM_MODEL,
  temperature: 0.7,
  maxTokens: 150,
  maxRetries: 3,
}).bindTools(tools);


/** functions in the nodes */
const callLLM = async (state) => {
  try {
    console.log(state)

    const response = await model.invoke([
        {
            role: "system",
            content: "You are a helpful assistant.if you don't know the answer, just reply that you don't know",
        },
        ...state.messages,
    ]);

    return {messages: [response]}
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
};



export const graph=new StateGraph(MessagesAnnotation)

.addNode("agent1",callLLM)
.addNode("tools",toolNode)

.addEdge("__start__","agent1")
.addEdge("tools","agent1")
.addEdge("agent1","__end__")

.addConditionalEdges(
    "agent1",
    toolsCondition
)

.compile({checkpointer: memory})



