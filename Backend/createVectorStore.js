// const PineconeClient = require("@pinecone-database/pinecone").PineconeClient;
const {Pinecone:PineconeClient} = require('@pinecone-database/pinecone');
const pinecone = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const PineconeStore = require("@langchain/pinecone").PineconeStore;
const RecursiveCharacterTextSplitter = require("langchain/text_splitter").RecursiveCharacterTextSplitter;
const Document = require("langchain/document").Document;
const OpenAIEmbeddings = require("langchain/embeddings/openai").OpenAIEmbeddings;
const  {OpenAI} = require ("openai");
const { AssemblyAI } = require('assemblyai');
require("dotenv").config();
const { OpenAIApi } = require("openai");
const { Configuration } = require("openai");
const fs = require("fs");
const axios = require("axios");

const props = {
  openai_api_key: process.env.OPENAI_API_KEY,
  pinecone_api_key: process.env.PINECONE_API_KEY,
  pinecone_env: process.env.PINECONE_ENV, 
  pinecone_index: process.env.PINECONE_INDEX,
  pinecone_delete: process.env.PINECONE_DELETE,
  assembly_ai: process.env.ASSEMBLY_AI_API_KEY,
};


async function speechToText(key) {
  console.log("speech to Text function called");

  const client = new AssemblyAI({
    apiKey: assembly_ai,
  });

  let transcript = await client.transcripts.transcribe({
    audio: "compressedAudio.mp3",
  });
  console.log(transcript.text);
  return transcript.text;
}
const createVectorStore = async () => {
  return new Promise(async (resolve, reject) => {
    console.log("createVectorStore Function called");
    const jsonContent = await speechToText(props.openai_api_key);
    const jsonString = JSON.stringify(jsonContent);
    console.log("Transcribe JSON Ready");
    fs.writeFile("transcript.txt", jsonString, function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        reject();
        return console.log(err);
      }
      console.log("JSON file has been saved.");
    });

    console.log("Transcript File Ready");
    const pinecone = new PineconeClient({
        apiKey: props.pinecone_api_key,
    });
    console.log("PineCone Client Created");
    
    const pinecone1 = new Pinecone(
      {apiKey: props.pinecone_api_key}
    );
    const pineconeIndex = pinecone1.Index(props.pinecone_index);
    
    console.log("deleted previous index");
    await pinecone.deleteIndex(props.pinecone_index);

    console.log("New index created");
    await pinecone.createIndex({
      name: 'gptvideo',
      dimension: 1536,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    }); 
  
    console.log("PineCone setup");
    try {
      var data = jsonString;  
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 1,
      });
      console.log("Data Reading...");
      const docOutput = await splitter.splitDocuments([
        new Document({ pageContent: data }),
      ]);
      console.log("Pinecone api for embedding");
      await PineconeStore.fromDocuments(docOutput, new OpenAIEmbeddings(props.openai_api_key), {
        pineconeIndex, 
      });
      console.log("Vector Created Successfully");
      resolve();
    } catch (error) {
      console.log(error);
      reject();
    }
  }); 
};
module.exports = createVectorStore;
  