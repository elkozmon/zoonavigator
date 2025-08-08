import { request, type FullConfig } from "@playwright/test";
import { config } from "./config";

async function globalTeardown(fullConfig: FullConfig) {
  const connectionParams = {
    connectionString: config.zookeeper.connectionString,
    authInfo: []
  };

  try {
    const connectionParamsBase64 = Buffer.from(JSON.stringify(connectionParams)).toString("base64");
    const { baseURL } = fullConfig.projects[0].use;
    const appContext = await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        "Zoo-Authorization": `CxnParams ${connectionParamsBase64}`
      }
    });

    const response = await appContext.delete(`/api/znode?path=${encodeURIComponent(config.testsNode)}&version=0`);

    if (response.ok()) {
      console.log("Successfully deleted /tests node");
    } else {
      console.log(`Failed to delete /tests node: ${response.status()}`);
    }
  } catch (error) {
    console.log(`Error during teardown: ${error}`);
  }
}

export default globalTeardown;

