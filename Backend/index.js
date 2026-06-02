import app from "./src/config/express.config.js";
import http from "http"

const httpServer = http.createServer(app);

httpServer.listen(9006, "0.0.0.0", (err) => {
  if (!err) {
    console.log("Server is running on port: 9005");
    console.log("Press CTRL + C to stop the server.");
  }
});