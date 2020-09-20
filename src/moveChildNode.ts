import * as vscode from 'vscode';
import { getCurrentlySelectedFilePath } from './utility';


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
