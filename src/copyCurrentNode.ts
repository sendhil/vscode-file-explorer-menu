import * as vscode from 'vscode';
import { getCurrentlySelectedFilePath } from './utility';


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
			await vscode.window.showErrorMessage("File already exists");
			return;
		}
	} catch (_) {
	}

	await vscode.workspace.fs.copy(vscode.Uri.file(currentFilePath), vscode.Uri.file(fileCopyPath));
	await vscode.window.showInformationMessage(`Copied ${currentFilePath} to ${fileCopyPath}`);
}
