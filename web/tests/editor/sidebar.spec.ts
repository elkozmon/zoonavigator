import { test, expect } from "../fixtures";

test.describe("Sidebar", () => {

  test.beforeEach(async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
  });

  test("should navigate into child node", async ({ page, editorPage, testDirectory }) => {
    const nodeName = "test-child";
    const nodePath = `${testDirectory}/${nodeName}`;

    await editorPage.createNode(nodePath);
    await editorPage.navigateToPath(testDirectory);
    await editorPage.sidebar.clickNode(nodeName);
    await expect(editorPage.toolbar.pathInput).toHaveValue(nodePath);
  });

  test("should navigate back using back button", async ({ editorPage, testDirectory }) => {
    const nodeName = "test-child";
    const nodePath = `${testDirectory}/${nodeName}`;

    await editorPage.createNode(nodePath);
    await editorPage.navigateToPath(nodePath);
    await editorPage.sidebar.goToParentLink.click();
    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory);
  });

  test("should perform basic search", async ({ editorPage, testDirectory }) => {
    const searchableNodePath = `${testDirectory}/searchable`;
    const otherNodePath = `${testDirectory}/other`;

    await editorPage.createNode(searchableNodePath);
    await editorPage.createNode(otherNodePath);
    await editorPage.navigateToPath(testDirectory);
    await editorPage.sidebar.searchNodes("search");
    await expect(editorPage.sidebar.getNodeItem("searchable")).not.toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("other")).toHaveClass(/zoo-nav-item-inactive/);
  });

  test("should hide non-matching nodes on search", async ({ editorPage, testDirectory }) => {
    const node1Path = `${testDirectory}/node1`;
    const node2Path = `${testDirectory}/node2`;

    await editorPage.createNode(node1Path);
    await editorPage.createNode(node2Path);
    await editorPage.navigateToPath(testDirectory);
    await editorPage.sidebar.searchNodes("xxx");
    await expect(editorPage.sidebar.getNodeItem("node1")).toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("node2")).toHaveClass(/zoo-nav-item-inactive/);
  });

  test("should clear search", async ({ editorPage, testDirectory }) => {
    const node1Path = `${testDirectory}/node1`;
    const node2Path = `${testDirectory}/node2`;

    await editorPage.createNode(node1Path);
    await editorPage.createNode(node2Path);
    await editorPage.navigateToPath(testDirectory);
    await editorPage.sidebar.searchNodes("xxx");
    await editorPage.sidebar.searchInput.clear();
    await expect(editorPage.sidebar.getNodeItem("node1")).not.toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("node2")).not.toHaveClass(/zoo-nav-item-inactive/);
  });

  test("should perform regex search", async ({ editorPage, testDirectory }) => {
    const node1Path = `${testDirectory}/test123`;
    const node2Path = `${testDirectory}/test456`;
    const node3Path = `${testDirectory}/other789`;
    const node4Path = `${testDirectory}/example123`;

    await editorPage.createNode(node1Path);
    await editorPage.createNode(node2Path);
    await editorPage.createNode(node3Path);
    await editorPage.createNode(node4Path);
    await editorPage.navigateToPath(testDirectory);

    await editorPage.sidebar.searchNodes("\\d+$");
    await expect(editorPage.sidebar.getNodeItem("test123")).not.toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("test456")).not.toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("other789")).not.toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("example123")).not.toHaveClass(/zoo-nav-item-inactive/);

    await editorPage.sidebar.searchNodes("^test");
    await expect(editorPage.sidebar.getNodeItem("test123")).not.toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("test456")).not.toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("other789")).toHaveClass(/zoo-nav-item-inactive/);
    await expect(editorPage.sidebar.getNodeItem("example123")).toHaveClass(/zoo-nav-item-inactive/);
  });

  test("should delete node using actions menu", async ({ editorPage, testDirectory }) => {
    const nodeName = "test-sidebar-delete";
    const nodePath = `${testDirectory}/${nodeName}`;

    await editorPage.createNode(nodePath);
    await editorPage.navigateToPath(testDirectory);

    await editorPage.sidebar.clickNodeActionsMenuButton(nodeName);
    await editorPage.sidebar.nodeActionsMenu.waitUntilVisible();
    await editorPage.sidebar.nodeActionsMenu.deleteButton.click();
    await editorPage.sidebar.nodeActionsMenu.waitUntilHidden();

    await editorPage.recursiveDeleteNodeDialog.waitUntilVisible();
    await editorPage.recursiveDeleteNodeDialog.confirmButton.click();
    await editorPage.recursiveDeleteNodeDialog.waitUntilHidden();

    await expect(editorPage.sidebar.getNodeItem(nodeName)).not.toBeVisible();
  });

  test("should export node using actions menu", async ({ page, editorPage, testDirectory }) => {
    const nodeName = "test-sidebar-export";
    const nodePath = `${testDirectory}/${nodeName}`;

    await editorPage.createNode(nodePath);
    await editorPage.navigateToPath(testDirectory);

    await editorPage.sidebar.clickNodeActionsMenuButton(nodeName);
    await editorPage.sidebar.nodeActionsMenu.waitUntilVisible();

    const downloadPromise = page.waitForEvent("download");
    await editorPage.sidebar.nodeActionsMenu.exportButton.click();
    await editorPage.sidebar.nodeActionsMenu.waitUntilHidden();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^znode-export-.*.gz$/);
  });

  test("should move node using actions menu", async ({ editorPage, testDirectory }) => {
    const sourceNodeName = "test-sidebar-move-source";
    const targetNodeName = "test-sidebar-move-target";
    const sourceNodePath = `${testDirectory}/${sourceNodeName}`;
    const targetNodePath = `${testDirectory}/${targetNodeName}`;

    await editorPage.createNode(sourceNodePath);
    await editorPage.navigateToPath(testDirectory);

    await editorPage.sidebar.clickNodeActionsMenuButton(sourceNodeName);
    await editorPage.sidebar.nodeActionsMenu.waitUntilVisible();
    await editorPage.sidebar.nodeActionsMenu.moveButton.click();
    await editorPage.sidebar.nodeActionsMenu.waitUntilHidden();

    await editorPage.moveNodeDialog.waitUntilVisible();
    await editorPage.moveNodeDialog.pathInput.fill(targetNodePath);
    await editorPage.moveNodeDialog.moveButton.click();
    await editorPage.moveNodeDialog.waitUntilHidden();

    // Navigate to parent directory and verify the node was moved
    await expect(editorPage.sidebar.getNodeItem(sourceNodeName)).not.toBeVisible();
    await expect(editorPage.sidebar.getNodeItem(targetNodeName)).toBeVisible();
  });

  test("should duplicate node using actions menu", async ({ editorPage, testDirectory }) => {
    const sourceNodeName = "test-sidebar-duplicate-source";
    const targetNodeName = "test-sidebar-duplicate-target";
    const sourceNodePath = `${testDirectory}/${sourceNodeName}`;
    const targetNodePath = `${testDirectory}/${targetNodeName}`;

    await editorPage.createNode(sourceNodePath);
    await editorPage.navigateToPath(testDirectory);

    await editorPage.sidebar.clickNodeActionsMenuButton(sourceNodeName);
    await editorPage.sidebar.nodeActionsMenu.waitUntilVisible();
    await editorPage.sidebar.nodeActionsMenu.duplicateButton.click();
    await editorPage.sidebar.nodeActionsMenu.waitUntilHidden();

    await editorPage.duplicateNodeDialog.waitUntilVisible();
    await editorPage.duplicateNodeDialog.pathInput.fill(targetNodePath);
    await editorPage.duplicateNodeDialog.openNodeAfterwardsCheckbox.setChecked(true);
    await editorPage.duplicateNodeDialog.duplicateButton.click();
    await editorPage.duplicateNodeDialog.waitUntilHidden();

    // Verify we're redirected to the duplicated node
    await expect(editorPage.toolbar.pathInput).toHaveValue(targetNodePath);

    // Verify both nodes exist
    await editorPage.navigateToPath(testDirectory);
    await expect(editorPage.sidebar.getNodeItem(sourceNodeName)).toBeVisible();
    await expect(editorPage.sidebar.getNodeItem(targetNodeName)).toBeVisible();
  });
});
