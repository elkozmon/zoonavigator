import { test, expect } from "../../fixtures";
import * as path from "path";

test.describe("Toolbar", () => {

  test("should display connection info", async ({ editorPage, connectionString }) => {
    await expect(editorPage.toolbar.connectionSelector).toHaveText(connectionString);
  });

  test("should toggle sort ordering", async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);

    // Create multiple nodes to ensure we have something to sort
    await editorPage.createNode(`${testDirectory}/test-sort-a`);
    await editorPage.createNode(`${testDirectory}/test-sort-b`);

    // Get the order of the first two nodes
    const nodeItems = editorPage.sidebar.nodeItems;
    const firstNodeText = await nodeItems.first().textContent();
    const secondNodeText = await nodeItems.nth(1).textContent();

    // Click the toggle ordering button to change sort order
    await editorPage.toolbar.toggleOrderingButton.click();

    // Verify the order has changed
    const newFirstNodeText = nodeItems.first();
    const newSecondNodeText = nodeItems.nth(1);

    // The first and second nodes should have swapped positions
    await expect(newFirstNodeText).toHaveText(secondNodeText);
    await expect(newSecondNodeText).toHaveText(firstNodeText);
  });

  test("should import node", async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath("/");

    await editorPage.toolbar.importNodesButton.click();
    await editorPage.importNodeDialog.waitUntilVisible();

    const fileChooser = await editorPage.importNodeDialog.browse();
    fileChooser.setFiles(path.join(__dirname, "../../data/znode-export-test.gz"));
    await editorPage.importNodeDialog.destinationPathInput.fill(testDirectory);
    await editorPage.importNodeDialog.openParentAfterwardsCheckbox.setChecked(true);
    await editorPage.importNodeDialog.importButton.click();
    await editorPage.importNodeDialog.waitUntilHidden();

    await expect(editorPage.sidebar.getNodeItem("import-test")).toBeVisible();
  });

  test("should enable bulk actions when nodes selected", async ({ editorPage, testDirectory }) => {
    const nodeName = "bulk-actions-test";
    const nodePath = `${testDirectory}/${nodeName}`;

    await editorPage.createNode(nodePath);
    await editorPage.navigateToPath(testDirectory);
    await editorPage.sidebar.getNodeCheckbox(nodeName).setChecked(true, { force: true });
    await expect(editorPage.toolbar.bulkNodeActionsButton).toBeEnabled();
  });

  test("should toggle select all and unselect all nodes", async ({ editorPage, testDirectory }) => {
    const parentNodePath = `${testDirectory}/select-test`;
    const nodeNames = ["test-select-1", "test-select-2", "test-select-3"];

    await editorPage.createNode(parentNodePath, true);

    for (const nodeName of nodeNames) {
      await editorPage.createNode(`${parentNodePath}/${nodeName}`);
    }

    await editorPage.navigateToPath(parentNodePath);

    for (const nodeName of nodeNames) {
      await expect(editorPage.sidebar.getNodeCheckbox(nodeName)).not.toBeChecked();
    }

    await editorPage.toolbar.toggleSelectAllButton.click();

    for (const nodeName of nodeNames) {
      await expect(editorPage.sidebar.getNodeCheckbox(nodeName)).toBeChecked();
    }

    await editorPage.toolbar.toggleSelectAllButton.click();

    for (const nodeName of nodeNames) {
      await expect(editorPage.sidebar.getNodeCheckbox(nodeName)).not.toBeChecked();
    }
  });

  test("should navigate using home button", async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
    await expect(editorPage.toolbar.pathInput).not.toHaveValue("/");

    await editorPage.toolbar.goToRootButton.click();
    await expect(editorPage.toolbar.pathInput).toHaveValue("/");
  });

  test("should show actions menu for selected node", async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
    await expect(editorPage.toolbar.currentNodeActionsButton).toBeVisible();
  });

  test("should export node using actions menu", async ({ page, editorPage, testDirectory }) => {
    const nodePath = `${testDirectory}/test-export-node`;

    await editorPage.createNode(nodePath);
    await editorPage.navigateToPath(nodePath);

    await editorPage.toolbar.currentNodeActionsButton.click();
    await editorPage.toolbar.currentNodeActionsMenu.waitUntilVisible();

    const downloadPromise = page.waitForEvent("download");
    await editorPage.toolbar.currentNodeActionsMenu.exportButton.click();
    await editorPage.toolbar.currentNodeActionsMenu.waitUntilHidden();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^znode-export-.*.gz$/);
  });

  test("should delete node using actions menu", async ({ editorPage, testDirectory }) => {
    const nodeName = "test-toolbar-delete";
    const nodePath = `${testDirectory}/${nodeName}`;

    await editorPage.createNode(nodePath);
    await editorPage.navigateToPath(nodePath);

    await editorPage.toolbar.currentNodeActionsButton.click();
    await editorPage.toolbar.currentNodeActionsMenu.waitUntilVisible();
    await editorPage.toolbar.currentNodeActionsMenu.deleteButton.click();
    await editorPage.toolbar.currentNodeActionsMenu.waitUntilHidden();

    await editorPage.recursiveDeleteNodeDialog.waitUntilVisible();
    await editorPage.recursiveDeleteNodeDialog.confirmButton.click();
    await editorPage.recursiveDeleteNodeDialog.waitUntilHidden();

    // Verify we were redirected to parent ndoe and that the deleted node is no longer visible
    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory);
    await expect(editorPage.sidebar.getNodeItem(nodeName)).toBeHidden();
  });

  test("should move node using actions menu", async ({ editorPage, testDirectory }) => {
    const sourceNodeName = "test-move-source";
    const targetNodeName = "test-move-target";
    const sourceNodePath = `${testDirectory}/${sourceNodeName}`;
    const targetNodePath = `${testDirectory}/${targetNodeName}`;

    await editorPage.createNode(sourceNodePath);
    await editorPage.navigateToPath(sourceNodePath);

    await editorPage.toolbar.currentNodeActionsButton.click();
    await editorPage.toolbar.currentNodeActionsMenu.waitUntilVisible();
    await editorPage.toolbar.currentNodeActionsMenu.moveButton.click();
    await editorPage.toolbar.currentNodeActionsMenu.waitUntilHidden();

    await editorPage.moveNodeDialog.waitUntilVisible();
    await editorPage.moveNodeDialog.pathInput.fill(targetNodePath);
    await editorPage.moveNodeDialog.moveButton.click();
    await editorPage.moveNodeDialog.waitUntilHidden();

    // Verify current editor path changed to the target node
    await expect(editorPage.toolbar.pathInput).toHaveValue(targetNodePath);

    // Navigate to parent directory and verify the node was moved
    await editorPage.navigateToPath(testDirectory);
    await expect(editorPage.sidebar.getNodeItem(sourceNodeName)).toBeHidden();
    await expect(editorPage.sidebar.getNodeItem(targetNodeName)).toBeVisible();
  });

  test("should duplicate node using actions menu", async ({ editorPage, testDirectory }) => {
    const sourceNodeName = "test-duplicate-source";
    const targetNodeName = "test-duplicate-target";
    const sourceNodePath = `${testDirectory}/${sourceNodeName}`;
    const targetNodePath = `${testDirectory}/${targetNodeName}`;

    await editorPage.createNode(sourceNodePath);
    await editorPage.navigateToPath(sourceNodePath);

    await editorPage.toolbar.currentNodeActionsButton.click();
    await editorPage.toolbar.currentNodeActionsMenu.waitUntilVisible();
    await editorPage.toolbar.currentNodeActionsMenu.duplicateButton.click();
    await editorPage.toolbar.currentNodeActionsMenu.waitUntilHidden();

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

  test("should bulk delete selected nodes", async ({ editorPage, testDirectory }) => {
    const nodeNames = ["bulk-delete-1", "bulk-delete-2", "bulk-delete-3"];

    for (const nodeName of nodeNames) {
      await editorPage.createNode(`${testDirectory}/${nodeName}`);
    }

    await editorPage.navigateToPath(testDirectory);

    await editorPage.sidebar.checkNode(nodeNames[0]);
    await editorPage.sidebar.checkNode(nodeNames[1]);

    await expect(editorPage.toolbar.bulkNodeActionsButton).toBeEnabled();
    await editorPage.toolbar.bulkNodeActionsButton.click();

    await editorPage.toolbar.bulkNodeActionsMenu.waitUntilVisible();
    await editorPage.toolbar.bulkNodeActionsMenu.deleteButton.click();
    await editorPage.toolbar.bulkNodeActionsMenu.waitUntilHidden();

    await editorPage.recursiveDeleteNodeDialog.waitUntilVisible();
    await editorPage.recursiveDeleteNodeDialog.confirmButton.click();
    await editorPage.recursiveDeleteNodeDialog.waitUntilHidden();

    await expect(editorPage.sidebar.getNodeItem(nodeNames[0])).toBeHidden();
    await expect(editorPage.sidebar.getNodeItem(nodeNames[1])).toBeHidden();
    await expect(editorPage.sidebar.getNodeItem(nodeNames[2])).toBeVisible();
  });

  test("should bulk export selected nodes", async ({ page, editorPage, testDirectory }) => {
    const nodeNames = ["bulk-export-1", "bulk-export-2"];

    for (const nodeName of nodeNames) {
      await editorPage.createNode(`${testDirectory}/${nodeName}`);
    }

    await editorPage.navigateToPath(testDirectory);

    await editorPage.sidebar.checkNode(nodeNames[0]);
    await editorPage.sidebar.checkNode(nodeNames[1]);

    await expect(editorPage.toolbar.bulkNodeActionsButton).toBeEnabled();
    await editorPage.toolbar.bulkNodeActionsButton.click();

    await editorPage.toolbar.bulkNodeActionsMenu.waitUntilVisible();

    const downloadPromise = page.waitForEvent("download");
    await editorPage.toolbar.bulkNodeActionsMenu.exportButton.click();
    await editorPage.toolbar.bulkNodeActionsMenu.waitUntilHidden();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^znode-export-.*.gz$/);
  });

  test("should select all nodes and perform bulk delete", async ({ editorPage, testDirectory }) => {
    const nodeNames = ["select-all-1", "select-all-2", "select-all-3"];

    for (const nodeName of nodeNames) {
      await editorPage.createNode(`${testDirectory}/${nodeName}`);
    }

    await editorPage.navigateToPath(testDirectory);

    await editorPage.toolbar.toggleSelectAllButton.click();

    for (const nodeName of nodeNames) {
      await expect(editorPage.sidebar.getNodeCheckbox(nodeName)).toBeChecked();
    }

    await expect(editorPage.toolbar.bulkNodeActionsButton).toBeEnabled();
    await editorPage.toolbar.bulkNodeActionsButton.click();

    await editorPage.toolbar.bulkNodeActionsMenu.waitUntilVisible();
    await editorPage.toolbar.bulkNodeActionsMenu.deleteButton.click();
    await editorPage.toolbar.bulkNodeActionsMenu.waitUntilHidden();

    await editorPage.recursiveDeleteNodeDialog.waitUntilVisible();
    await editorPage.recursiveDeleteNodeDialog.confirmButton.click();
    await editorPage.recursiveDeleteNodeDialog.waitUntilHidden();

    for (const nodeName of nodeNames) {
      await expect(editorPage.sidebar.getNodeItem(nodeName)).toBeHidden();
    }
  });
});
