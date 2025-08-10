import { test, expect } from "../../fixtures";

test.describe("Data Tab", () => {

  test.beforeEach(async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
    await editorPage.switchToDataTab();
  });

  test("should edit node data", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/data-test`;
    const testData = "test data content";

    await editorPage.createNode(testNodePath, true);
    await editorPage.dataTab.setData(testData);
    await expect(editorPage.dataTab.saveButton).toBeEnabled();
    await editorPage.dataTab.saveButton.click();

    await editorPage.toolbar.refreshButton.click();
    await expect(editorPage.dataTab.dataEditor).toHaveText(testData);
  });

  test("should preserve path and unsaved changes when canceling the discard changes dialog", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/data-test`;
    const testData = "unsaved changes";

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToDataTab();
    await editorPage.dataTab.setData(testData);
    await editorPage.sidebar.goToParentLink.click();

    await editorPage.discardChangesDialog.waitUntilVisible();
    await editorPage.discardChangesDialog.cancelButton.click();
    await editorPage.discardChangesDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).toHaveValue(testNodePath);
    await expect(editorPage.dataTab.dataEditor).toHaveText(testData);
    await expect(editorPage.dataTab.saveButton).toBeEnabled();
  });

  test("should discard unsaved changes when navigating away", async ({ editorPage, testDirectory }) => {
    const testNodePath = `${testDirectory}/data-test`;
    const testData = "unsaved changes";

    await editorPage.createNode(testNodePath, true);
    await editorPage.switchToDataTab();
    await editorPage.dataTab.setData(testData);
    await editorPage.sidebar.goToParentLink.click();

    await editorPage.discardChangesDialog.waitUntilVisible();
    await editorPage.discardChangesDialog.discardButton.click();
    await editorPage.discardChangesDialog.waitUntilHidden();

    await expect(editorPage.toolbar.pathInput).toHaveValue(testDirectory);

    await editorPage.navigateToPath(testNodePath);
    await editorPage.switchToDataTab();

    await expect(async () => {
      await expect(editorPage.toolbar.pathInput).toHaveValue(testNodePath);
      await expect(editorPage.dataTab.dataEditor).toHaveText("");
      await expect(editorPage.dataTab.saveButton).toBeDisabled();
    }).toPass();
  });

  test("should toggle wrap text on and off", async ({ editorPage, testDirectory }) => {
    const testNodeName = "wrap-test";
    const testNodePath = `${testDirectory}/${testNodeName}`;

    await editorPage.createNode(testNodePath);
    await editorPage.navigateToPath(testNodePath);

    await editorPage.dataTab.expectWrap(true);

    await editorPage.dataTab.wrapButton.click();
    await editorPage.dataTab.expectWrap(false);

    await editorPage.dataTab.wrapButton.click();
    await editorPage.dataTab.expectWrap(true);
  });

  test("should switch between different modes", async ({ editorPage, testDirectory }) => {
    const testNodeName = "mode-test";
    const testNodePath = `${testDirectory}/${testNodeName}`;

    await editorPage.createNode(testNodePath);
    await editorPage.navigateToPath(testNodePath);

    await expect(editorPage.dataTab.modeButton).toHaveText(/mode: text/);

    await editorPage.dataTab.setMode("json");
    await expect(editorPage.dataTab.modeButton).toHaveText(/mode: json/);

    await editorPage.dataTab.setMode("xml");
    await expect(editorPage.dataTab.modeButton).toHaveText(/mode: xml/);

    await editorPage.dataTab.setMode("yaml");
    await expect(editorPage.dataTab.modeButton).toHaveText(/mode: yaml/);

    await editorPage.dataTab.setMode("base64");
    await expect(editorPage.dataTab.modeButton).toHaveText(/mode: base64/);
  });

  test("should switch between compression options", async ({ editorPage, testDirectory }) => {
    const testNodeName = "compression-test";
    const testNodePath = `${testDirectory}/${testNodeName}`;

    await editorPage.createNode(testNodePath);
    await editorPage.navigateToPath(testNodePath);

    await expect(editorPage.dataTab.compButton).toHaveText(/comp: none/);

    await editorPage.dataTab.setCompression("gzip");
    await expect(editorPage.dataTab.compButton).toHaveText(/comp: gzip/);

    await editorPage.dataTab.setCompression("none");
    await expect(editorPage.dataTab.compButton).toHaveText(/comp: none/);
  });

  test("should enable reformat button in json mode and reformat content", async ({ editorPage, testDirectory }) => {
    const testNodeName = "reformat-test";
    const testNodePath = `${testDirectory}/${testNodeName}`;
    const unformattedJson = "{\"name\":\"test\",\"value\":123,\"nested\":{\"key\":\"value\"}}";

    await editorPage.createNode(testNodePath);
    await editorPage.navigateToPath(testNodePath);

    await expect(editorPage.dataTab.reformatButton).toBeDisabled();

    await editorPage.dataTab.setMode("json");

    await expect(editorPage.dataTab.reformatButton).toBeEnabled();

    await editorPage.dataTab.setData(unformattedJson);
    await editorPage.dataTab.reformatButton.click();

    await expect(editorPage.dataTab.dataEditor).toHaveText(/\s+"name":.*\s+"value":.*\s+"nested":/);
  });

  test("should make editor dirty when changing compression", async ({ editorPage, testDirectory }) => {
    const testNodeName = "comp-dirty-test";
    const testNodePath = `${testDirectory}/${testNodeName}`;

    await editorPage.createNode(testNodePath);
    await editorPage.navigateToPath(testNodePath);

    await expect(editorPage.dataTab.saveButton).toBeDisabled();

    await editorPage.dataTab.setCompression("gzip");

    await expect(editorPage.dataTab.saveButton).toBeEnabled();
  });

  test("should decode base64 data when switching to text mode", async ({ editorPage, testDirectory }) => {
    const testNodeName = "base64-decode-test";
    const testNodePath = `${testDirectory}/${testNodeName}`;
    const base64Data = "aGVsbG8gd29ybGQK";

    await editorPage.createNode(testNodePath);
    await editorPage.navigateToPath(testNodePath);

    await editorPage.dataTab.setMode("base64");
    await editorPage.dataTab.setData(base64Data);
    await editorPage.dataTab.saveButton.click();

    await editorPage.dataTab.setMode("text");
    await expect(editorPage.dataTab.dataEditor).toHaveText("hello world");
    await expect(editorPage.dataTab.saveButton).toBeDisabled();
  });
});
