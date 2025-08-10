import { test as base } from "@playwright/test";
import { ConnectPage, EditorPage } from "../pages";
import { getZooKeeperConnectionString, getTestNode } from "../utils";
import { App } from "../pages/app";

interface ZooNavigatorFixtures {
  app: App;
  connectPage: ConnectPage;
  editorPage: EditorPage;
  connectionString: string;
  testDirectory: string;
}

export const test = base.extend<ZooNavigatorFixtures>({
  testDirectory: async ({ }, use) => {
    await use(`${getTestNode()}/${crypto.randomUUID()}`);
  },

  connectionString: async ({ }, use) => {
    await use(getZooKeeperConnectionString());
  },

  app: async ({ page }, use) => {
    await page.goto("/");
    const app = new App(page);
    await use(app);
  },

  connectPage: async ({ page }, use) => {
    await page.goto("/");
    const connectPage = new ConnectPage(page);
    await use(connectPage);
  },

  editorPage: async ({ page, testDirectory, connectionString }, use) => {
    await page.goto("/");
    const connectPage = new ConnectPage(page);
    await connectPage.setConnectionString(connectionString);
    await connectPage.clickConnect();
    await page.waitForURL(/\/editor/);
    const editorPage = new EditorPage(page);

    // Create the test directory before running tests
    await editorPage.toolbar.createNodeButton.click();
    await editorPage.createNodeDialog.waitUntilVisible();
    await editorPage.createNodeDialog.nodePathInput.fill(testDirectory);
    await editorPage.createNodeDialog.createButton.click();
    await editorPage.createNodeDialog.waitUntilHidden();

    await use(editorPage);
  },
});

export { expect } from "@playwright/test";
