import { chromium, type FullConfig } from "@playwright/test";
import { getZooKeeperConnectionString } from "./utils";
import { ConnectPage, EditorPage } from "./pages";

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL,
  });
  const page = await context.newPage();

  try {
    console.log("Setting up global authentication state");

    await page.goto("/connect", { waitUntil: "commit" });
    const connectPage = new ConnectPage(page);
    const connectionString = getZooKeeperConnectionString();

    await connectPage.setConnectionString(connectionString);
    await connectPage.clickConnect();

    const editorPage = new EditorPage(page);
    await editorPage.header.header.waitFor({ state: "visible" });

    await context.storageState({
      path: ".auth/zookeeper-session.json",
    });

    console.log("Authentication state saved successfully");
  } catch (error) {
    console.error("Failed to setup authentication state:", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
