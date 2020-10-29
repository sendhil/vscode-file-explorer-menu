import * as vscode from 'vscode';
import * as path from 'path';
import { getCurrentlySelectedFilePath, doesPathBelongToWorkspace } from './utility';

export async function addChildNode() {
	let rootFolder:vscode.WorkspaceFolder | undefined;
	if (!vscode.window.activeTextEditor) {
		rootFolder = await vscode.window.showWorkspaceFolderPick({ placeHolder: "Select a root folder."});
		if (!rootFolder) {
			await vscode.window.showInformationMessage("No folder selected");
			return;
		}
	}

	let startingFilePath:string | undefined;
	if (rootFolder) {
		startingFilePath = `${rootFolder.uri.fsPath}/`;
	} else {
		// If the currently selected file is a folder, then don't use `path.dirname` as it'll end up returning the parent folder.

		let currentlySelectedFile = await getCurrentlySelectedFilePath();
		const fileStats = await vscode.workspace.fs.stat(vscode.Uri.file(currentlySelectedFile));
		if (fileStats.type === vscode.FileType.Directory) {
			startingFilePath = currentlySelectedFile;
			if (startingFilePath[startingFilePath.length - 1] !== '/') {
				startingFilePath += "/";
			}
		} else {
			startingFilePath = `${path.dirname(currentlySelectedFile)}/`;
		}
	}

	const newFilePath = (await vscode.window.showInputBox({
		value: startingFilePath,
		placeHolder: 'Enter filename',
		valueSelection: [startingFilePath.length, startingFilePath.length]
	}))?.trim();

	if (!newFilePath) {
		return;	
	}

	if (!doesPathBelongToWorkspace(newFilePath)) {
		await vscode.window.showErrorMessage(`${newFilePath} does not belong to a Workspace folder`);
		return;
	}

	if (newFilePath.length > 0 && newFilePath[newFilePath.length - 1] === "/") {
		// Create directory	
		await vscode.workspace.fs.createDirectory(vscode.Uri.file(newFilePath));
	} else {
		// Create file
		const filePath = vscode.Uri.file(newFilePath);
		await vscode.workspace.fs.writeFile(filePath, new Uint8Array());
		try {
			await vscode.window.showTextDocument(filePath);
		} catch (err) {
			console.error(err);
		}
	}

	await vscode.window.showInformationMessage(`Created : ${newFilePath}`);
}
