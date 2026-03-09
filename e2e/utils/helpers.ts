import { request } from "@playwright/test";

export function getZooKeeperConnectionString(): string {
  return process.env.ZK_CONNECTION_STRING || "localhost:2181";
}

export function getTestNode(): string {
  return process.env.ZK_TEST_NODE || "/test";
}

/**
 * Delete a ZooKeeper node via API
 * @param nodePath - The path of the node to delete
 * @param baseURL - The base URL of the ZooNavigator API
 * @param version - The version of the node (default: 0)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function deleteNodeApi(
  nodePath: string,
  baseURL: string,
  version: number = 0,
): Promise<boolean> {
  try {
    const context = await createAuthenticatedContext(baseURL);
    const response = await context.delete("/api/znode", {
      params: {
        path: nodePath,
        version,
      },
    });

    if (response.ok()) {
      return true;
    } else {
      console.log(`Failed to delete ${nodePath} node: ${response.status()}`);
    }
  } catch (error) {
    console.log(`Error deleting node ${nodePath}: ${error}`);
  }

  return false;
}

/**
 * Create a ZooKeeper node via API
 * @param nodePath - The path of the node to create
 * @param baseURL - The base URL of the ZooNavigator API
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function createNodeApi(
  nodePath: string,
  baseURL: string,
): Promise<boolean> {
  try {
    const context = await createAuthenticatedContext(baseURL);
    const response = await context.post("/api/znode", {
      params: {
        path: nodePath,
      },
    });

    if (response.ok()) {
      return true;
    } else {
      console.log(`Failed to create ${nodePath} node: ${response.status()}`);
    }
  } catch (error) {
    console.log(`Error creating node ${nodePath}: ${error}`);
  }

  return false;
}

/**
 * @param baseURL - The base URL of the ZooNavigator API
 * @returns Promise<APIRequestContext> - Authenticated request context
 */
async function createAuthenticatedContext(baseURL: string) {
  const connectionParams = {
    connectionString: getZooKeeperConnectionString(),
    authInfo: [],
  };

  const connectionParamsBase64 = Buffer.from(JSON.stringify(connectionParams)).toString("base64");

  return await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      "Zoo-Authorization": `CxnParams ${connectionParamsBase64}`,
    },
  });
}
