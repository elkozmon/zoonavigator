import { test, expect } from "../../fixtures";

test.describe("Editor", () => {

  test("should switch between tabs", async ({ editorPage }) => {
    await editorPage.switchToAclTab();
    await expect(editorPage.aclTab.aclTable).toBeVisible();

    await editorPage.switchToMetaTab();
    await expect(editorPage.metaTab.metaTable).toBeVisible();

    await editorPage.switchToDataTab();
    await expect(editorPage.dataTab.dataEditor).toBeVisible();
  });

  test("should maintain path when switching tabs", async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory);

    await editorPage.switchToAclTab();
    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory);

    await editorPage.switchToMetaTab();
    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory);

    await editorPage.switchToDataTab();
    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory); 
  });

  test("should disconnect and redirect to connect page", async ({ page, editorPage }) => {
    await editorPage.header.disconnectButton.click();
    await expect(page).toHaveURL(/\/connect/);
  });
});
