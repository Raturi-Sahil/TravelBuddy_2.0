import dotenv from "dotenv";
dotenv.config(); // MUST be first - before any imports that use process.env

import http from "http";

import app from "./app";
import { initializeSocket } from "./socket";

const port = process.env.PORT ;

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
