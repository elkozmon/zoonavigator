import { test, expect } from "../fixtures";

test.describe("Connect Page", () => {

  test("should display connection form elements", async ({ connectPage }) => {
    await expect(connectPage.connectionStringInput).toBeVisible();
    await expect(connectPage.authUsernameInput).toBeVisible();
    await expect(connectPage.authPasswordInput).toBeVisible();
    await expect(connectPage.connectButton).toBeVisible();
  });

  test("should require connection string", async ({ connectPage }) => {
    await expect(connectPage.connectButton).toBeDisabled();
  });

  test("should enable connect button when connection string provided", async ({ connectPage }) => {
    await connectPage.setConnectionString("localhost:2181");
    await expect(connectPage.connectButton).toBeEnabled();
  });

  test("should handle invalid connection string", async ({ connectPage }) => {
    await connectPage.setConnectionString("invalid connection string");
    await connectPage.clickConnect();
    await connectPage.errorDialog.waitUntilVisible();
    await expect(connectPage.errorDialog.message).toHaveText(/Unable to establish connection with ZooKeeper/);
  });

  test("should handle connection timeout gracefully", async ({ connectPage }) => {
    await connectPage.setConnectionString("1.2.3.4:2181");
    await connectPage.clickConnect();
    await connectPage.errorDialog.waitUntilVisible();
    await expect(connectPage.errorDialog.message).toHaveText(/Unable to establish connection with ZooKeeper/);
  });
});
