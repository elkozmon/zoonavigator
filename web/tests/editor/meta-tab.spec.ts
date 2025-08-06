import { test, expect } from "../fixtures";
import { METADATA_PROPERTIES } from "../../pages/editor-page";

test.describe("Meta Tab", () => {

  test.beforeEach(async ({ editorPage, testDirectory }) => {
    await editorPage.navigateToPath(testDirectory);
    await editorPage.switchToMetaTab();
  });

  test("should show metadata for zookeeper node", async ({ editorPage }) => {
    for (const property of METADATA_PROPERTIES) {
      await expect(editorPage.metaTab.getMetadataValue(property)).resolves.not.toBeUndefined();
    }
  });
});
