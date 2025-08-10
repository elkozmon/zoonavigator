import { Page, Locator, expect } from "@playwright/test";
import {
  CreateNodeDialog,
  ImportNodeDialog,
  ErrorDialog,
  SimpleDeleteNodeDialog,
  RecursiveDeleteNodeDialog,
  MoveNodeDialog,
  DuplicateNodeDialog,
  DiscardChangesDialog,
  ConfirmRecursiveChangeDialog,
} from "./shared-components";

export type AclPermission = "CREATE" | "READ" | "DELETE" | "WRITE" | "ADMIN";
export type Mode = "text" | "json" | "yaml" | "xml" | "base64";
export type CompressionType = "none" | "gzip";
export type MetadataProperty = "Creation ID" | "Creation time" | "Modified ID" | "Modified time" | "Data length" | "Data version" | "ACL version" | "Children version" | "Children number" | "Ephemeral owner";

export const ACL_PERMISSIONS: readonly AclPermission[] = ["CREATE", "READ", "DELETE", "WRITE", "ADMIN"];
export const MODES: readonly Mode[] = ["text", "json", "yaml", "xml", "base64"];
export const COMPRESSION_TYPES: readonly CompressionType[] = ["none", "gzip"];
export const METADATA_PROPERTIES: readonly MetadataProperty[] = [
  "Creation ID",
  "Creation time",
  "Modified ID",
  "Modified time",
  "Data length",
  "Data version",
  "ACL version",
  "Children version",
  "Children number",
  "Ephemeral owner",
];

export class EditorPage {
  readonly dataTab: DataTab;
  readonly aclTab: AclTab;
  readonly metaTab: MetaTab;
  readonly toolbar: Toolbar;
  readonly sidebar: SideBar;
  readonly header: Header;
  readonly errorDialog: ErrorDialog;
  readonly createNodeDialog: CreateNodeDialog;
  readonly simpleDeleteNodeDialog: SimpleDeleteNodeDialog;
  readonly recursiveDeleteNodeDialog: RecursiveDeleteNodeDialog;
  readonly importNodeDialog: ImportNodeDialog;
  readonly moveNodeDialog: MoveNodeDialog;
  readonly duplicateNodeDialog: DuplicateNodeDialog;
  readonly discardChangesDialog: DiscardChangesDialog;
  readonly confirmRecursiveChangeDialog: ConfirmRecursiveChangeDialog;
  readonly dataTabLink: Locator;
  readonly aclTabLink: Locator;
  readonly metaTabLink: Locator;

  private page: Page;

  constructor(page: Page) {
    this.dataTab = new DataTab(page);
    this.aclTab = new AclTab(page);
    this.metaTab = new MetaTab(page);
    this.toolbar = new Toolbar(page);
    this.sidebar = new SideBar(page);
    this.header = new Header(page);
    this.errorDialog = new ErrorDialog(page);
    this.createNodeDialog = new CreateNodeDialog(page);
    this.simpleDeleteNodeDialog = new SimpleDeleteNodeDialog(page);
    this.recursiveDeleteNodeDialog = new RecursiveDeleteNodeDialog(page);
    this.importNodeDialog = new ImportNodeDialog(page);
    this.moveNodeDialog = new MoveNodeDialog(page);
    this.duplicateNodeDialog = new DuplicateNodeDialog(page);
    this.discardChangesDialog = new DiscardChangesDialog(page);
    this.confirmRecursiveChangeDialog = new ConfirmRecursiveChangeDialog(page);
    this.dataTabLink = page.getByRole("link", { name: "Data" });
    this.aclTabLink = page.getByRole("link", { name: "ACL" });
    this.metaTabLink = page.getByRole("link", { name: "Meta" });
    this.page = page;
  }

  async createNode(nodePath: string, openAfterwards: boolean = false) {
    await this.toolbar.createNodeButton.click();
    await this.createNodeDialog.waitUntilVisible();
    await this.createNodeDialog.nodePathInput.fill(nodePath);
    await this.createNodeDialog.openNodeAfterwardsCheckbox.setChecked(openAfterwards);

    const responsePromise = this.page.waitForResponse(
      response => response.url().includes("/api/znode") &&
        response.request().method() === "POST" &&
        response.status() === 200,
    );

    await this.createNodeDialog.createButton.click();
    await this.createNodeDialog.waitUntilHidden();

    await responsePromise;
  }

  async navigateToPath(path: string) {
    await this.toolbar.pathInput.clear();
    await this.toolbar.pathInput.fill(path);
    await this.toolbar.pathNavigateButton.click();
  }

  async switchToDataTab() {
    await this.dataTabLink.click();
    await this.page.waitForURL(/\/editor\/data/);
  }

  async switchToAclTab() {
    await this.aclTabLink.click();
    await this.page.waitForURL(/\/editor\/acl/);
  }

  async switchToMetaTab() {
    await this.metaTabLink.click();
    await this.page.waitForURL(/\/editor\/meta/);
  }
}

export class Toolbar {
  readonly connectionSelector: Locator;
  readonly pathInput: Locator;
  readonly pathNavigateButton: Locator;
  readonly createNodeButton: Locator;
  readonly toggleSelectAllButton: Locator;
  readonly toggleOrderingButton: Locator;
  readonly importNodesButton: Locator;
  readonly refreshButton: Locator;
  readonly goToRootButton: Locator;
  readonly bulkNodeActionsButton: Locator;
  readonly currentNodeActionsButton: Locator;
  readonly currentNodeActionsMenu: NodeActionsMenu;
  readonly bulkNodeActionsMenu: BulkNodeActionsMenu;

  constructor(page: Page) {
    this.connectionSelector = page.getByText("@").locator("..//mat-select");
    this.pathInput = page.getByText("@").locator("..").getByRole("textbox");
    this.pathNavigateButton = page.getByText("@").locator("..").getByRole("button").last();
    this.createNodeButton = page.locator("button[matTooltip=\"Create node\"]");
    this.toggleSelectAllButton = page.locator("button[matTooltip=\"Toggle select all\"]");
    this.toggleOrderingButton = page.locator("button[matTooltip=\"Toggle ordering direction\"]");
    this.importNodesButton = page.locator("button[matTooltip=\"Import nodes\"]");
    this.refreshButton = page.locator("button[matTooltip*=\"Refresh\"]");
    this.goToRootButton = page.locator("button[matTooltip=\"Go to root node\"]");
    this.bulkNodeActionsButton = page.locator("button[matTooltip*=\"Selected nodes actions\"]");
    this.currentNodeActionsButton = page.locator("button[matTooltip*=\"Current node actions\"]");
    this.currentNodeActionsMenu = new NodeActionsMenu(page);
    this.bulkNodeActionsMenu = new BulkNodeActionsMenu(page);
  }
}

export class SideBar {
  readonly sidebar: Locator;
  readonly nodeItems: Locator;
  readonly searchInput: Locator;
  readonly goToParentLink: Locator;
  readonly nodeActionsMenu: NodeActionsMenu;

  private page: Page;

  constructor(page: Page) {
    this.sidebar = page.getByRole("navigation").filter({ has: page.getByText("search") });
    this.nodeItems = this.sidebar.locator("a").filter({ has: page.getByRole("checkbox") });
    this.searchInput = this.sidebar.getByRole("textbox").first();
    this.goToParentLink = this.sidebar.locator("a").filter({ has: page.getByText("../") });
    this.nodeActionsMenu = new NodeActionsMenu(page);
    this.page = page;
  }

  getNodeItem(nodeName: string) {
    return this.nodeItems.getByText(nodeName).locator("//ancestor::a[contains(@class, \"zoo-node-item\")]");
  }

  getNodeLink(nodeName: string) {
    return this.getNodeItem(nodeName).locator("a");
  }

  getNodeCheckbox(nodeName: string) {
    return this.getNodeItem(nodeName).getByRole("checkbox").locator("..");
  }

  async getNodeActionsMenuButton(nodeName: string) {
    return this.getNodeItem(nodeName).getByRole("button");
  }

  async clickNodeActionsMenuButton(nodeName: string) {
    const button = await this.getNodeActionsMenuButton(nodeName);
    await button.click();
  }

  async checkNode(nodeName: string) {
    await this.getNodeCheckbox(nodeName).click();
  }

  async clickNode(nodeName: string) {
    await this.getNodeLink(nodeName).click();
  }

  async searchNodes(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.keyboard.press("Tab");
  }
}

export class DataTab {
  readonly dataEditor: Locator;
  readonly saveButton: Locator;
  readonly wrapButton: Locator;
  readonly modeButton: Locator;
  readonly compButton: Locator;
  readonly reformatButton: Locator;
  readonly modeMenu: ModeMenu;
  readonly compressionMenu: CompressionMenu;

  private page: Page;

  constructor(page: Page) {
    this.dataEditor = page.locator(".ace_content");
    this.saveButton = page.getByRole("button", { name: "Save" });
    this.wrapButton = page.getByRole("button").filter({ hasText: "wrap:" });
    this.modeButton = page.getByRole("button").filter({ hasText: "mode:" });
    this.compButton = page.getByRole("button").filter({ hasText: "comp:" });
    this.reformatButton = page.getByRole("button", { name: "Reformat" });
    this.modeMenu = new ModeMenu(page);
    this.compressionMenu = new CompressionMenu(page);
    this.page = page;
  }

  async getData(): Promise<string> {
    const data = await this.dataEditor.innerText() || "";
    return data.trim();
  }

  async setData(data: string) {
    await this.dataEditor.click();
    await this.page.keyboard.press("Control+a");
    await this.page.keyboard.type(data);
  }

  async setMode(mode: Mode) {
    await this.modeButton.click();
    await this.modeMenu.waitUntilVisible();
    await this.modeMenu.selectMode(mode);
    await this.modeMenu.waitUntilHidden();
  }

  async setCompression(compression: CompressionType) {
    await this.compButton.click();
    await this.compressionMenu.waitUntilVisible();
    await this.compressionMenu.selectCompression(compression);
    await this.compressionMenu.waitUntilHidden();
  }

  async expectCompression(expectedCompression: CompressionType) {
    return await expect(this.compButton).toHaveText(new RegExp(`comp:\\s*${expectedCompression}`));
  }

  async expectWrap(enabled: boolean) {
    return await expect(this.wrapButton).toHaveText(new RegExp(`wrap:\\s*${enabled ? "on" : "off"}`));
  }

  async expectMode(expectedMode: Mode) {
    return await expect(this.modeButton).toHaveText(new RegExp(`mode:\\s*${expectedMode}`));
  }
}

export class AclTab {
  readonly aclTable: Locator;
  readonly addAclButton: Locator;
  readonly removeAclButton: Locator;
  readonly applyButton: Locator;
  readonly applyRecursivelyButton: Locator;
  readonly clearButton: Locator;

  private page: Page;

  constructor(page: Page) {
    this.aclTable = page.getByRole("table");
    this.addAclButton = page.getByRole("button", { name: "Add ACL input" });
    this.removeAclButton = page.getByRole("button", { name: "Remove" });
    this.applyButton = page.getByRole("button", { name: "apply" });
    this.applyRecursivelyButton = page.getByRole("button", { name: "recursively" });
    this.clearButton = page.getByRole("button", { name: "clear" });
    this.page = page;
  }

  async addAclEntry(scheme: string, id: string, permissions: AclPermission[]) {
    // Get current number of rows before adding
    const initialRowCount = await this.getAclRows().count();

    // Click Add ACL button to add new row
    await this.addAclButton.click();

    // Fill the new row (last row)
    const schemeInput = this.getSchemeInput(initialRowCount);
    await schemeInput.waitFor({ state: "visible" });
    await schemeInput.fill(scheme);

    const idInput = this.getIdInput(initialRowCount);
    await idInput.waitFor({ state: "visible" });
    await idInput.fill(id);

    // Check the specified permissions
    for (const permission of permissions) {
      const checkbox = this.getPermissionCheckboxWrapperByRow(initialRowCount, permission);
      await checkbox.setChecked(true);
    }
  }

  async removeAclEntry(rowIndex: number) {
    await this.getDeleteButton(rowIndex).click();
    await this.getAclRow(rowIndex).waitFor({ state: "hidden" });
  }

  async getAclEntryCount() {
    return await this.getAclRows().count();
  }

  async hasAclEntry(scheme: string, id: string): Promise<boolean> {
    const rowCount = await this.getAclEntryCount();

    for (let i = 0; i < rowCount; i++) {
      const entryData = await this.getAclEntryData(i);
      if (entryData.scheme === scheme && entryData.id === id) {
        return true;
      }
    }

    return false;
  }

  async getTableHeader(headerName: string): Promise<Locator> {
    return this.page.getByRole("cell", { name: headerName, exact: true });
  }

  async getPermissionCheckbox(permission: string, row: number = 0): Promise<Locator> {
    return this.getPermissionCheckboxWrapperByRow(row, permission.toUpperCase() as AclPermission);
  }

  getSchemeInput(rowIndex: number) {
    return this.getAclRow(rowIndex).locator("input").nth(0);
  }

  getIdInput(rowIndex: number) {
    return this.getAclRow(rowIndex).locator("input").nth(1);
  }

  getDeleteButton(rowIndex: number) {
    return this.getAclRow(rowIndex).getByRole("button");
  }

  private async getAclEntryData(rowIndex: number) {
    const scheme = await this.getSchemeInput(rowIndex).inputValue();
    const id = await this.getIdInput(rowIndex).inputValue();

    const permissions: AclPermission[] = [];

    for (const permission of ACL_PERMISSIONS) {
      const checkbox = this.getPermissionCheckboxWrapperByRow(rowIndex, permission);
      if (await checkbox.isChecked()) {
        permissions.push(permission);
      }
    }

    return { scheme, id, permissions };
  }

  private getAclRows() {
    return this.aclTable.locator("tbody tr");
  }

  private getAclRow(index: number) {
    return this.getAclRows().nth(index);
  }

  private getPermissionCheckboxWrapperByRow(rowIndex: number, permission: AclPermission) {
    const columnIndex = ACL_PERMISSIONS.indexOf(permission);
    return this.getAclRow(rowIndex).getByRole("checkbox").nth(columnIndex).locator("..");
  }
}

export class MetaTab {
  readonly metaTable: Locator;

  constructor(page: Page) {
    this.metaTable = page.getByRole("table");
  }

  async getMetadataValue(property: MetadataProperty): Promise<string | undefined> {
    const row = this.metaTable.locator("tr").filter({ hasText: property });
    return await row.locator("td").first().textContent() || undefined;
  }
}

export class Header {
  readonly header: Locator;
  readonly disconnectButton: Locator;

  constructor(page: Page) {
    this.header = page.locator("mat-toolbar").first();
    this.disconnectButton = this.header.locator("a").last();
  }
}

export class NodeActionsMenu {
  readonly menu: Locator;
  readonly deleteButton: Locator;
  readonly exportButton: Locator;
  readonly duplicateButton: Locator;
  readonly moveButton: Locator;

  constructor(page: Page) {
    this.menu = page.locator(".mat-menu-content").filter({ has: page.getByRole("menuitem", { name: "Duplicate" }) });
    this.deleteButton = this.menu.getByRole("menuitem", { name: "Delete" });
    this.exportButton = this.menu.getByRole("menuitem", { name: "Export" });
    this.duplicateButton = this.menu.getByRole("menuitem", { name: "Duplicate" });
    this.moveButton = this.menu.getByRole("menuitem", { name: "Move" });
  }

  async waitUntilVisible(timeout?: number) {
    await this.menu.waitFor({ state: "visible", timeout });
  }

  async waitUntilHidden(timeout?: number) {
    await this.menu.waitFor({ state: "hidden", timeout });
  }
}

export class BulkNodeActionsMenu {
  readonly menu: Locator;
  readonly deleteButton: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    this.menu = page.locator(".mat-menu-content").filter({ hasNot: page.getByRole("menuitem", { name: "Duplicate" }) });
    this.deleteButton = this.menu.getByRole("menuitem", { name: "Delete" });
    this.exportButton = this.menu.getByRole("menuitem", { name: "Export" });
  }

  async waitUntilVisible(timeout?: number) {
    await this.menu.waitFor({ state: "visible", timeout });
  }

  async waitUntilHidden(timeout?: number) {
    await this.menu.waitFor({ state: "hidden", timeout });
  }
}

export class ModeMenu {
  readonly menu: Locator;

  constructor(page: Page) {
    this.menu = page.locator(".mat-menu-content").filter({ has: page.getByRole("menuitem", { name: "json" }) });
  }

  async selectMode(mode: Mode) {
    await this.menu.getByRole("menuitem", { name: mode }).click();
  }

  async waitUntilVisible(timeout?: number) {
    await this.menu.waitFor({ state: "visible", timeout });
  }

  async waitUntilHidden(timeout?: number) {
    await this.menu.waitFor({ state: "hidden", timeout });
  }
}

export class CompressionMenu {
  readonly menu: Locator;

  constructor(page: Page) {
    this.menu = page.locator(".mat-menu-content").filter({ has: page.getByRole("menuitem", { name: "gzip" }) });
  }

  async selectCompression(compression: CompressionType) {
    await this.menu.getByRole("menuitem", { name: compression }).click();
  }

  async waitUntilVisible(timeout?: number) {
    await this.menu.waitFor({ state: "visible", timeout });
  }

  async waitUntilHidden(timeout?: number) {
    await this.menu.waitFor({ state: "hidden", timeout });
  }
}
