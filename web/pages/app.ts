import { Page } from "@playwright/test";
import { ConnectPage } from "./connect-page";
import { EditorPage } from "./editor-page";

export class App {
  readonly connectPage: ConnectPage;
  readonly editorPage: EditorPage;

  constructor(page: Page) {
    this.connectPage = new ConnectPage(page);
    this.editorPage = new EditorPage(page);
  }
}
