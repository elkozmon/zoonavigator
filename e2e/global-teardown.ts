import { request, type FullConfig } from "@playwright/test";
import { getZooKeeperConnectionString, getTestNode } from "./utils";

async function globalTeardown(fullConfig: FullConfig) {
  const connectionParams = {
    connectionString: getZooKeeperConnectionString(),
    authInfo: [],
  };

  try {
    const connectionParamsBase64 = Buffer.from(JSON.stringify(connectionParams)).toString("base64");
    const { baseURL } = fullConfig.projects[0].use;
    const appContext = await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        "Zoo-Authorization": `CxnParams ${connectionParamsBase64}`,
      },
    });

    const testNode = getTestNode();
    const response = await appContext.delete(`/api/znode?path=${encodeURIComponent(testNode)}&version=0`);

    if (response.ok()) {
      console.log(`Successfully deleted ${testNode} node`);
    } else {
      console.log(`Failed to delete ${testNode} node: ${response.status()}`);
    }
  } catch (error) {
    console.log(`Error during teardown: ${error}`);
  }
}

export default globalTeardown;

