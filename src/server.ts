import { createServer } from "node:http";
import {createExpressApplication} from './app/app.js'

async function main() {
  try {
    const server = createServer(createExpressApplication());
    const PORT: number = 8000;

    server.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed start server");
    throw error;
  }
}

main()