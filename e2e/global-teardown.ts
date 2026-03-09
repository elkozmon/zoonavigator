import { type FullConfig } from "@playwright/test";
import { deleteNodeApi, getTestNode } from "./utils";

async function globalTeardown(fullConfig: FullConfig) {
  const { baseURL } = fullConfig.projects[0].use;
  const testNode = getTestNode();

  if (!baseURL) {
    console.log("No baseURL configured, skipping node cleanup");
    return;
  }

  await deleteNodeApi(testNode, baseURL);
}

export default globalTeardown;

