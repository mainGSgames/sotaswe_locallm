
import * as vscode from 'vscode';
import { getNonce } from './utils';

export class PanelProvider implements vscode.WebviewViewProvider {
  constructor(
      private readonly _extensionUri: vscode.Uri,
  ) { }

  public resolveWebviewView(
      webviewView: vscode.WebviewView,
      context: vscode.WebviewViewResolveContext,
      _token: vscode.CancellationToken,
  ) {
      webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [
              this._extensionUri
          ]
      };

      webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

      // Handle messages from the webview
      webviewView.webview.onDidReceiveMessage(data => {
        console.log('message from webview', data);
          switch (data.type) {
            case 'init':
                webviewView.webview.postMessage({ command: 'init' });
                break;
          }
      });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "dist", "index.js")
      );

      const styleUri = webview.asWebviewUri(
       vscode.Uri.joinPath(this._extensionUri, "dist", "style.css")
     );

      const nonce = getNonce();

      return `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Example View</title>
              <link rel="stylesheet" href="${styleUri}">
          </head>
          <body>
            <div id="root"></div>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                window.onload = function() {
                  vscode.postMessage({ type: 'init' });
                  console.log('HTML started up.');
                };
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
          </body>
    </html>`;
  }
}
