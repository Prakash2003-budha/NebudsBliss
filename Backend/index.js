import app from "./src/config/express.config.js";
import http from "http"
import { SERVER_CONFIG } from "./src/config/server.config.js";

const httpServer = http.createServer(app);

httpServer.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, (err) => {
  if (!err) {
    console.log(`Server is running on port: ${SERVER_CONFIG.port}`);
    console.log("Press CTRL + C to stop the server.");
  }
});