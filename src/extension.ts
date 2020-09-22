import * as vscode from 'vscode';

import { addChildNode } from './addChildNode';
import { deleteChildNode } from './deleteChildNode';
import { moveChildNode } from './moveChildNode';
import { revealCurrentNodeInFileExplorer } from './revealCurrentNodeInFileExplorer';
import { copyCurrentNode } from './copyCurrentNode';
import { copyPathToClipboard } from './copyPathToClipboard';
import { listCurrentNode } from './listCurrentNode';
import { openCurrentNodeWithEditor } from './openCurrentNodeWithEditor';

export function activate(context: vscode.ExtensionContext) {
	let menuDisposable = vscode.commands.registerCommand('vscodeFileExplorerMenu.openFileExplorerMenu', () => {

		const items:Array<{ description: string, callback: (context: vscode.ExtensionContext) => Promise<void> }> = [
			{ description: 'Add a Childnode', callback: addChildNode },
			{ description: 'Move Current Node', callback: moveChildNode },
			{ description: 'Delete Current Node', callback: deleteChildNode },
			{ description: 'Reveal Current Node In File Manager', callback: revealCurrentNodeInFileExplorer },
			{ description: 'Open Current Node With Editor', callback: openCurrentNodeWithEditor },
			{ description: 'Copy Current Node', callback: copyCurrentNode },
			{ description: 'Copy Path To Clipboard', callback: copyPathToClipboard },
			{ description: 'List Current Node', callback: listCurrentNode },
		];

		let quickPick = vscode.window.createQuickPick();
		let currentlySelectedItem: vscode.QuickPickItem | null = null;
		quickPick.items = items.map(item => ({ label: item.description}));
		quickPick.onDidChangeSelection(item => {
			if (item[0]) {
				currentlySelectedItem = item[0];
			}
		});
		quickPick.onDidAccept(() => {
			if (currentlySelectedItem) {
				for (let i=0; i < items.length; i++) {
					if (items[i].description === currentlySelectedItem.label) {
						items[i].callback(context);
					}
				}
			}
			quickPick.dispose();
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	});

	context.subscriptions.push(menuDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
