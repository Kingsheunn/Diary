import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import configureRoutes from "./routers/index.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure routes
configureRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== ERROR DETAILS ===');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);
  console.error('=====================');
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start the server
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server started on port${port}`);
  });
}

export default app;
