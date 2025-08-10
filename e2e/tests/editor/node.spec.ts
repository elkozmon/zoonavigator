import { test, expect } from "../../fixtures";

test.describe("Node operations", () => {

  test.beforeEach(async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
  });

  test("should create a new node", async ({ editorPage, testDirectory }) => {
    const testNodeName = "test-node";
    const testNodePath = `${testDirectory}/${testNodeName}`;

    await editorPage.toolbar.createNodeButton.click();

    await editorPage.createNodeDialog.waitUntilVisible();
    await editorPage.createNodeDialog.nodePathInput.fill(testNodePath);
    await editorPage.createNodeDialog.openNodeAfterwardsCheckbox.setChecked(false);
    await editorPage.createNodeDialog.createButton.click();
    await editorPage.createNodeDialog.waitUntilHidden();

    await expect(async () => {
      await expect(editorPage.toolbar.pathInput).not.toHaveValue(testNodePath);
      await expect(editorPage.sidebar.getNodeItem(testNodeName)).toBeVisible();
    }).toPass();
  });

  test("should cancel node creation", async ({ editorPage, testDirectory }) => {
    const testNodeName = "test-cancel";
    const testNodePath = `${testDirectory}/${testNodeName}`;

    await editorPage.toolbar.createNodeButton.click();

    await editorPage.createNodeDialog.waitUntilVisible();
    await editorPage.createNodeDialog.nodePathInput.fill(testNodePath);
    await editorPage.createNodeDialog.cancelButton.click();
    await editorPage.createNodeDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).not.toHaveValue(testNodePath);
    await expect(editorPage.sidebar.getNodeItem(testNodeName)).toBeHidden();
  });

  test("should open the new node after creation", async ({ editorPage, testDirectory }) => {
    const testNodeName = "test-node";
    const testNodePath = `${testDirectory}/${testNodeName}`;

    await editorPage.toolbar.createNodeButton.click();

    await editorPage.createNodeDialog.waitUntilVisible();
    await editorPage.createNodeDialog.nodePathInput.fill(testNodePath);
    await editorPage.createNodeDialog.openNodeAfterwardsCheckbox.setChecked(true);
    await editorPage.createNodeDialog.createButton.click();
    await editorPage.createNodeDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).toHaveValue(testNodePath);
    await expect(editorPage.sidebar.getNodeItem(testNodeName)).toBeHidden();
  });

  test("should show error dialog when navigating to non-existing node", async ({ editorPage }) => {
    const nonExistentPath = "/nonexistent/path/that/does/not/exist";

    await editorPage.navigateToPath(nonExistentPath);

    await editorPage.errorDialog.waitUntilVisible();
    await expect(editorPage.errorDialog.message).toContainText("KeeperErrorCode = NoNode");
    await expect(editorPage.errorDialog.message).toContainText(nonExistentPath);

    await editorPage.errorDialog.closeButton.click();
    await editorPage.errorDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).toHaveValue(nonExistentPath);
  });
});
