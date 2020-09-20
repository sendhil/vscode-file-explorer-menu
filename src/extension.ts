import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	let menuDisposable = vscode.commands.registerCommand('vscode-file-explorer-enhancements.openFileEnhancementsMenu', () => {

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

async function getCurrentlySelectedFilePath(): Promise<string> {
	let currentText = await vscode.env.clipboard.readText();
	await vscode.commands.executeCommand('copyFilePath');
	let pathOfActiveFile = await vscode.env.clipboard.readText();
	await vscode.env.clipboard.writeText(currentText);
	return pathOfActiveFile;
}

export async function addChildNode(context: any) {
	const baseName = await vscode.window.showInputBox({
		value: '',
		placeHolder: 'Enter filename',
	});

	const workingDirectory = path.dirname(await getCurrentlySelectedFilePath());
	const fullFilePath = `${workingDirectory}/${baseName}`;
	vscode.workspace.fs.writeFile(vscode.Uri.file(fullFilePath), new Uint8Array());
	vscode.window.showInformationMessage(`Created : ${fullFilePath}`);
}

export async function deleteChildNode(context: vscode.ExtensionContext) {
	const currentlySelectedFile = await getCurrentlySelectedFilePath();

	const confirmation = await vscode.window.showInputBox({
		prompt: `Are you sure you wish to delete : ${currentlySelectedFile} (yN): ?`,
		validateInput: text => {
			const lowerCaseText = text.toLocaleLowerCase();
			return ['y', 'n', 'yes', 'no'].indexOf(lowerCaseText) === -1 ? 'y or n' : null;
		}
	});

	if (confirmation?.toLowerCase().indexOf("y") === -1) {
		return;
	}

	const dirName = path.dirname(currentlySelectedFile);
	await vscode.workspace.fs.delete(vscode.Uri.file(currentlySelectedFile));
	vscode.window.showInformationMessage(`Deleted :${currentlySelectedFile} located in : ${dirName}`);
}

export async function moveChildNode(context: vscode.ExtensionContext) {
	const currentFilePath = await getCurrentlySelectedFilePath();
	const newFilePath = await vscode.window.showInputBox({
		prompt: "Enter new path",
		value: currentFilePath,
		placeHolder: 'Enter new path',
	});

	if (!newFilePath) {
		return;
	}

	try {
		const fileStats = await vscode.workspace.fs.stat(vscode.Uri.file(newFilePath));
		if (fileStats) {
			vscode.window.showErrorMessage("File already exists");
			return;
		}
	} catch (_) {
	}

	vscode.workspace.fs.rename(vscode.Uri.file(currentFilePath), vscode.Uri.file(newFilePath));
	vscode.window.showInformationMessage(`Moved ${currentFilePath} to ${newFilePath}`);
}

export async function revealCurrentNodeInFileExplorer(context: vscode.ExtensionContext) {
	vscode.commands.executeCommand("revealFileInOS");
}

export async function openCurrentNodeWithEditor(context: vscode.ExtensionContext) {
	console.log("Hi openCurrentNodeWithEditor");
}

export async function copyCurrentNode(context: vscode.ExtensionContext) {
	const currentFilePath = await getCurrentlySelectedFilePath();
	const fileCopyPath = await vscode.window.showInputBox({
		prompt: "Enter the new path to copy the node to",
		value: currentFilePath,
		placeHolder: 'Enter the new path to copy the node to',
	});

	if (!fileCopyPath) {
		return;
	}

	try {
		const fileStats = await vscode.workspace.fs.stat(vscode.Uri.file(fileCopyPath));
		if (fileStats) {
			vscode.window.showErrorMessage("File already exists");
			return;
		}
	} catch (_) {
	}

	vscode.workspace.fs.copy(vscode.Uri.file(currentFilePath), vscode.Uri.file(fileCopyPath));
	vscode.window.showInformationMessage(`Copied ${currentFilePath} to ${fileCopyPath}`);
}

export async function copyPathToClipboard(context: vscode.ExtensionContext) {
	await vscode.commands.executeCommand('copyFilePath');
}

export async function listCurrentNode(context: vscode.ExtensionContext) {
	// TODO: Add option to display in terminal
	let currentFilePath = await getCurrentlySelectedFilePath();

	const {stdout, stderr} = await exec(`ls -la ${currentFilePath}`);
	stdout?.on("data", (output) => {
		vscode.window.showInformationMessage(output);
	});
	stderr?.on("data", (output) => {
		vscode.window.showErrorMessage(output);
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
