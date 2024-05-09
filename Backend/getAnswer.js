const OpenAI = require("langchain/llms/openai").OpenAI;
const OpenAIEmbeddings = require("langchain/embeddings/openai").OpenAIEmbeddings;
require("dotenv").config();
const PineconeStore = require("langchain/vectorstores/pinecone").PineconeStore;
const loadQAStuffChain = require("langchain/chains").loadQAStuffChain;
const { Pinecone: PineconeClient } = require("@pinecone-database/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");

const getAnswer = async (question) => {
  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY,
  });

  
  const pinecone1 = new Pinecone({apiKey: process.env.PINECONE_API_KEY});
  const pineconeIndex = pinecone1.Index("gptvideo");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );
  const query = question; 
  const docs = await vectorStore.similaritySearch(query);
  const llmA = new OpenAI(); // initializing the new openai model or creating its instance
  const chainA = loadQAStuffChain(llmA);
  const resA = await chainA.invoke({
    input_documents: docs,
    question: query,
  });
  return resA.text;
}; 
module.exports = getAnswer;
 