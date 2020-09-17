// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


export async function showQuickPick() {
	let i = 0;
	const result = await vscode.window.showQuickPick(['eins', 'zwei', 'drei'], {
		placeHolder: 'eins, zwei or drei',
		onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
	});
	vscode.window.showInformationMessage(`Got: ${result}`);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
		showQuickPick,
	};
	console.log(options);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-file-explorer-enhancements" is now active!');

	let menuDisposable = vscode.commands.registerCommand('vscode-file-explorer-enhancements.openFileEnhancementsMenu', () => {
		const items:{ [key:string] : {description: string, callback: (context: vscode.ExtensionContext) => Promise<void>}} = {
			'addChildNode': {description: 'Add a childnode', callback: addChildNode},
			'moveCurrentNode': {description: 'Move current node', callback: moveChildNode},
			'deleteCurrentNode': {description: 'Delete current node', callback: deleteChildNode},
			'revealCurrentNode': {description: 'Reveal Current Node in File Manager', callback: revealCurrentNodeInFileExplorer},
			'openCurrentNodeWithEditor': {description: 'Reveal Current Node in File Manager', callback: openCurrentNodeWithEditor},
			'copyCurrentNode': {description: 'Reveal Current Node in File Manager', callback: copyCurrentNode},
			'copyPathToClipboard': {description: 'Reveal Current Node in File Manager', callback: copyPathToClipboard},
			'listCurrentNode': {description: 'Reveal Current Node in File Manager', callback: listCurrentNode},
		};

		let quickPick = vscode.window.createQuickPick();
		let currentlySelectedItem:vscode.QuickPickItem | null = null;
		quickPick.items = Object.keys(items).map(label => ({label: label, description: items[label].description}));
		quickPick.onDidChangeSelection(item => {
			if (item[0]) {
				currentlySelectedItem = item[0];
			}
		});
		quickPick.onDidAccept(() => {
			if (currentlySelectedItem) {
				items[currentlySelectedItem.label].callback(context);
			}
			quickPick.hide(); // TODO: Figure out if this creates a strong reference cycle
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	});

	context.subscriptions.push(menuDisposable);
}

async function getCurrentlySelectedFile() : Promise<string> {
	let currentText = await vscode.env.clipboard.readText();
	await vscode.commands.executeCommand('copyFilePath');
	let pathOfActiveFile = await vscode.env.clipboard.readText();
	await vscode.env.clipboard.writeText(currentText);
	return pathOfActiveFile;
}

export async function addChildNode(context: any) {
	console.log("Hi addChildNode :", await getCurrentlySelectedFile());
}

export async function deleteChildNode(context: vscode.ExtensionContext) {
	console.log("Hi deleteChildNode: ", await getCurrentlySelectedFile());
}

export async function moveChildNode(context: vscode.ExtensionContext) {
	console.log("Hi moveChildNode");
}

export async function revealCurrentNodeInFileExplorer(context: vscode.ExtensionContext) {
	console.log("Hi revealCurrentNodeInFileExplorer");
}

export async function openCurrentNodeWithEditor(context: vscode.ExtensionContext) {
	console.log("Hi openCurrentNodeWithEditor");
}

export async function copyCurrentNode(context: vscode.ExtensionContext) {
	console.log("Hi copyCurrentNode");
}

export async function copyPathToClipboard(context: vscode.ExtensionContext) {
	console.log("Hi copyPathToClipboard");
}

export async function listCurrentNode(context: vscode.ExtensionContext) {
	console.log("Hi listCurrentNode");
}

// this method is called when your extension is deactivated
export function deactivate() {}
