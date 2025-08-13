import { test as base } from "@playwright/test";
import { ConnectPage, EditorPage } from "../pages";
import { getZooKeeperConnectionString, getTestNode, createNodeApi } from "../utils";
import { App } from "../pages/app";

interface ZooNavigatorFixtures {
  app: App;
  connectPage: ConnectPage;
  editorPage: EditorPage;
  connectionString: string;
  testDirectory: string;
}

export const test = base.extend<ZooNavigatorFixtures>({
  testDirectory: async ({ baseURL }, use, testCase) => {
    const nodePath = `${getTestNode()}/${testCase.testId}/${testCase.retry}/${Date.now()}`;
    await createNodeApi(nodePath, baseURL!);

    await use(nodePath);
  },

  connectionString: async ({ }, use) => {
    await use(getZooKeeperConnectionString());
  },

  app: async ({ page }, use) => {
    await page.goto("/", { waitUntil: "commit" });
    const app = new App(page);
    await use(app);
  },

  connectPage: async ({ page }, use) => {
    await page.goto("/connect", { waitUntil: "commit" });
    const connectPage = new ConnectPage(page);
    await use(connectPage);
  },

  editorPage: async ({ page }, use) => {
    await page.goto("/editor", { waitUntil: "commit" });
    const editorPage = new EditorPage(page);
    await use(editorPage);
  },
});

export { expect } from "@playwright/test";
