// const openai = require("@langchain/openai");
// const pinecone = require("@langchain/pinecone");
const express = require("express");
const app = express(); 
const port = 5000;

// setting up the middleware for req and res objects

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(  
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept"
  ); 
  next();                                     // to pass control to next middleware in stack
});
app.use(express.json());                      // parses incoming requests with JSON payloads


// setting up the routes
app.use("/api", require("./Routes/api.js"));
// setting up the default route
app.get("/", (req, res) => {                  
  res.send("Backend Server Started for Application");
});

app.listen(port, () => {
  console.log(`Server Running at Port ${port}..`);
});
 