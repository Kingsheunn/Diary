import express from "express";
import bodyParser from "body-parser";
import router from "./routers/index.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Register routes
app.use(router);



// Start the server
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

export default app; 
