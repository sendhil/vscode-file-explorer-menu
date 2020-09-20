import * as vscode from 'vscode';
import * as path from 'path';
export function activate(context: vscode.ExtensionContext) {
	console.log('"vscode-file-explorer-enhancements" is now active!');

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

async function getCurrentlySelectedFilePath() : Promise<string> {
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
			return ['y','n','yes', 'no'].indexOf(lowerCaseText) === -1 ? 'y or n' : null;
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
	console.log("Hi listCurrentNode");
}

// this method is called when your extension is deactivated
export function deactivate() {}
