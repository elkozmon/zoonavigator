import { test, expect } from "../fixtures";

test.describe("ACL Tab", () => {

  const testDigest = "user:OTcyYTFhMTFmMTk5MzQ0MDEyOTFjYzk5MTE3ZWM2MTQ5MzMzNzRjZQo=";

  test.beforeEach(async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
    await editorPage.switchToAclTab();
  });

  test("should display ACL table headers", async ({ editorPage }) => {
    const expectedHeaders = ["Scheme", "Id", "Permissions", "C", "R", "D", "W", "A"];
    for (const header of expectedHeaders) {
      await expect(editorPage.aclTab.getTableHeader(header)).resolves.toBeVisible();
    }
  });

  test("should show permission checkboxes", async ({ editorPage }) => {
    const permissions = ["create", "read", "delete", "write", "admin"];
    for (const permission of permissions) {
      await expect(editorPage.aclTab.getPermissionCheckbox(permission)).resolves.toBeVisible();
    }
  });

  test("should allow to apply ACL recursively without making any changes", async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
    await editorPage.switchToAclTab();
    await expect(editorPage.aclTab.applyRecursivelyButton).toBeEnabled();
  });

  test("should add and save new ACL entry", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/acl-save`;

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToAclTab();

    const initialCount = await editorPage.aclTab.getAclEntryCount();

    await editorPage.aclTab.addAclEntry("digest", testDigest, ["READ", "WRITE"]);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.aclTab.applyButton.click();

    await expect(editorPage.aclTab.hasAclEntry("digest", testDigest)).resolves.toBeTruthy();
    await expect(editorPage.aclTab.getAclEntryCount()).resolves.toEqual(initialCount + 1);
  });

  test("should apply ACL recursively", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/acl-recursive`;
    const childNodePath = `${testNodePath}/child`;

    await editorPage.createNode(testNodePath, true);
    await editorPage.createNode(childNodePath, false);
    await editorPage.navigateToPath(testNodePath);
    await editorPage.switchToAclTab();

    await editorPage.aclTab.addAclEntry("digest", testDigest, ["READ"]);
    await editorPage.aclTab.applyRecursivelyButton.click();
    await editorPage.confirmRecursiveChangeDialog.waitUntilVisible();
    await editorPage.confirmRecursiveChangeDialog.confirmButton.click();
    await editorPage.confirmRecursiveChangeDialog.waitUntilHidden();

    await editorPage.navigateToPath(childNodePath);
    await editorPage.switchToAclTab();
    await expect(editorPage.aclTab.hasAclEntry("digest", testDigest)).resolves.toBeTruthy();
  });

  test("should delete ACL entry", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/acl-delete`;

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToAclTab();

    const initialCount = await editorPage.aclTab.getAclEntryCount();

    await editorPage.aclTab.addAclEntry("digest", testDigest, ["READ"]);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.aclTab.applyButton.click();

    const entryCount = await editorPage.aclTab.getAclEntryCount();
    await editorPage.aclTab.removeAclEntry(entryCount - 1);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.aclTab.applyButton.click();

    await editorPage.toolbar.refreshButton.click();
    await expect(editorPage.aclTab.hasAclEntry("digest", testDigest)).resolves.toBeFalsy();
    await expect(editorPage.aclTab.getAclEntryCount()).resolves.toEqual(initialCount);
  });

  test("should preserve state when canceling discard dialog after removing ACL entry", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/acl-remove-cancel`;

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToAclTab();

    await editorPage.aclTab.addAclEntry("digest", testDigest, ["READ"]);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.aclTab.applyButton.click();

    const entryCount = await editorPage.aclTab.getAclEntryCount();
    await editorPage.aclTab.removeAclEntry(entryCount - 1);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.sidebar.goToParentLink.click();

    await editorPage.discardChangesDialog.waitUntilVisible();
    await editorPage.discardChangesDialog.cancelButton.click();
    await editorPage.discardChangesDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).toHaveValue(testNodePath);
    await expect(editorPage.aclTab.hasAclEntry("digest", testDigest)).resolves.toBeFalsy();
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
  });

  test("should not be removing ACL entry when navigating away without applying changes", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/acl-remove-discard`;

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToAclTab();

    await editorPage.aclTab.addAclEntry("digest", testDigest, ["READ"]);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.aclTab.applyButton.click();

    const entryCount = await editorPage.aclTab.getAclEntryCount();
    await editorPage.aclTab.removeAclEntry(entryCount - 1);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.sidebar.goToParentLink.click();

    await editorPage.discardChangesDialog.waitUntilVisible();
    await editorPage.discardChangesDialog.discardButton.click();
    await editorPage.discardChangesDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory);

    await editorPage.navigateToPath(testNodePath);
    await editorPage.switchToAclTab();

    await expect(async () => {
      await expect(editorPage.aclTab.hasAclEntry("digest", testDigest)).resolves.toBeTruthy();
      await expect(editorPage.aclTab.applyButton).toBeDisabled();
    }).toPass();
  });

  test("should preserve state when canceling discard dialog after adding ACL entry", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/acl-test`;

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToAclTab();

    await editorPage.aclTab.addAclEntry("digest", testDigest, ["READ"]);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.sidebar.goToParentLink.click();

    await editorPage.discardChangesDialog.waitUntilVisible();
    await editorPage.discardChangesDialog.cancelButton.click();
    await editorPage.discardChangesDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).toHaveValue(testNodePath);
    await expect(editorPage.aclTab.hasAclEntry("digest", testDigest)).resolves.toBeTruthy();
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
  });

  test("should not be adding ACL entry when navigating away without applying changes", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/acl-test`;

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToAclTab();

    await editorPage.aclTab.addAclEntry("digest", testDigest, ["READ"]);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.sidebar.goToParentLink.click();

    await editorPage.discardChangesDialog.waitUntilVisible();
    await editorPage.discardChangesDialog.discardButton.click();
    await editorPage.discardChangesDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory);

    await editorPage.navigateToPath(testNodePath);
    await editorPage.switchToAclTab();

    await expect(async () => {
      await expect(editorPage.aclTab.hasAclEntry("digest", testDigest)).resolves.toBeFalsy();
      await expect(editorPage.aclTab.applyButton).toBeDisabled();
    }).toPass();
  });

  test("should show error when creating invalid ACL entry", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/acl-invalid`;

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToAclTab();

    await editorPage.aclTab.addAclEntry("digest", "invalidformat", ["READ"]);
    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await editorPage.aclTab.applyButton.click();

    await editorPage.errorDialog.waitUntilVisible();
    await expect(editorPage.errorDialog.message).toContainText("KeeperErrorCode = InvalidACL");
    await editorPage.errorDialog.closeButton.click();
    await editorPage.errorDialog.waitUntilHidden();

    await expect(editorPage.aclTab.applyButton).toBeEnabled();
    await expect(editorPage.aclTab.hasAclEntry("digest", "invalidformat")).resolves.toBeTruthy();
  });
});
