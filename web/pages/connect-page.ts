import { Page, Locator } from "@playwright/test";
import { ErrorDialog } from "./shared-components";

export class ConnectPage {
  readonly connectionStringInput: Locator;
  readonly connectButton: Locator;
  readonly authUsernameInput: Locator;
  readonly authPasswordInput: Locator;
  readonly errorDialog: ErrorDialog;

  constructor(page: Page) {
    this.connectionStringInput = page.getByRole("textbox", { name: "Connection string" });
    this.connectButton = page.getByRole("button", { name: "Connect" });
    this.authUsernameInput = page.getByRole("textbox", { name: "Auth username" });
    this.authPasswordInput = page.getByRole("textbox", { name: "Auth password" });
    this.errorDialog = new ErrorDialog(page);
  }

  async setConnectionString(connectionString: string) {
    await this.connectionStringInput.fill(connectionString);
  }

  async setAuthInfo(username: string, password: string) {
    await this.authUsernameInput.fill(username);
    await this.authPasswordInput.fill(password);
  }

  async clickConnect() {
    await this.connectButton.click();
  }
}
