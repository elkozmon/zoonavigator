import { Page, Locator, FileChooser } from "@playwright/test";

export abstract class BaseDialog {
  readonly dialog: Locator;

  protected page: Page;

  constructor(page: Page, dialogSelector: string | Locator) {
    this.dialog = typeof dialogSelector === "string"
      ? page.locator(dialogSelector)
      : dialogSelector;
    this.page = page;
  }

  async waitUntilVisible(timeout?: number) {
    await this.dialog.waitFor({ state: "visible", timeout });
  }

  async waitUntilHidden(timeout?: number) {
    await this.dialog.waitFor({ state: "hidden", timeout });
  }
}

export class CreateNodeDialog extends BaseDialog {
  readonly nodePathInput: Locator;
  readonly nodeDataTextarea: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly openNodeAfterwardsCheckbox: Locator;

  constructor(page: Page) {
    super(page, page.getByRole("dialog", { name: "Create node" }));
    this.nodePathInput = this.dialog.getByRole("textbox", { name: "Enter new path" });
    this.createButton = this.dialog.getByRole("button", { name: "Create" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.openNodeAfterwardsCheckbox = this.dialog.getByText("Open the new node");
  }
}

export abstract class DeleteDialog extends BaseDialog {
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page, dialogName: string) {
    super(page, page.getByRole("dialog", { name: dialogName }));
    this.confirmButton = this.dialog.getByRole("button", { name: "Delete" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
  }
}

export class SimpleDeleteNodeDialog extends DeleteDialog {
  constructor(page: Page) {
    super(page, "Confirm delete");
  }
}

export class RecursiveDeleteNodeDialog extends DeleteDialog {
  constructor(page: Page) {
    super(page, "Confirm recursive delete");
  }
}

export class ImportNodeDialog extends BaseDialog {
  readonly fileInput: Locator;
  readonly destinationPathInput: Locator;
  readonly browseButton: Locator;
  readonly importButton: Locator;
  readonly cancelButton: Locator;
  readonly openParentAfterwardsCheckbox: Locator;

  constructor(page: Page) {
    super(page, page.getByRole("dialog", { name: "Import nodes" }));
    this.fileInput = this.dialog.getByRole("textbox").first();
    this.destinationPathInput = this.dialog.getByRole("textbox").nth(1);
    this.browseButton = this.dialog.getByRole("button", { name: "Browse" });
    this.importButton = this.dialog.getByRole("button", { name: "Import" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.openParentAfterwardsCheckbox = this.dialog.getByText("Open the parent node");
  }

  async browse(): Promise<FileChooser> {
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.browseButton.click();
    return await fileChooserPromise;
  }
}

export class MoveNodeDialog extends BaseDialog {
  readonly pathInput: Locator;
  readonly moveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page, page.getByRole("dialog", { name: "Move node" }));
    this.pathInput = this.dialog.getByRole("textbox");
    this.moveButton = this.dialog.getByRole("button", { name: "Move" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
  }
}

export class DuplicateNodeDialog extends BaseDialog {
  readonly pathInput: Locator;
  readonly duplicateButton: Locator;
  readonly cancelButton: Locator;
  readonly openNodeAfterwardsCheckbox: Locator;

  constructor(page: Page) {
    super(page, page.getByRole("dialog", { name: "Duplicate node" }));
    this.pathInput = this.dialog.getByRole("textbox");
    this.duplicateButton = this.dialog.getByRole("button", { name: "Duplicate" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.openNodeAfterwardsCheckbox = this.dialog.getByText("Open the new node");
  }
}

export class ErrorDialog extends BaseDialog {
  readonly message: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page, page.getByRole("dialog", { name: "Error" }));
    this.message = this.dialog.locator(".dialog-content, .mat-dialog-content");
    this.closeButton = this.dialog.getByRole("button", { name: "Close" });
  }
}

export class DiscardChangesDialog extends BaseDialog {
  readonly discardButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page, page.getByRole("dialog", { name: "Discard changes?" }));
    this.discardButton = this.dialog.getByRole("button", { name: "Discard" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
  }
}

export class ConfirmRecursiveChangeDialog extends BaseDialog {
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page, page.getByRole("dialog", { name: "Confirm recursive change" }));
    this.confirmButton = this.dialog.getByRole("button", { name: "Apply" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
  }
}
