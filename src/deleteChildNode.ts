import * as vscode from 'vscode';
import { getConfig, getCurrentlySelectedFilePath } from './utility';

export async function deleteChildNode(context: vscode.ExtensionContext) {
	const currentlySelectedFile = await getCurrentlySelectedFilePath();
	let isDirectory = false;
	try {
		const fileStats = await vscode.workspace.fs.stat(vscode.Uri.file(currentlySelectedFile));
		isDirectory = fileStats.type === vscode.FileType.Directory;
	} catch(_) {
		// File doesn't exist, exit out
		await vscode.window.showErrorMessage(`Error - file ${currentlySelectedFile} does not exist.`);
		return;
	}

	if (!await confirmDeletion(`Are you sure you wish to delete : ${currentlySelectedFile} (yN): ?`)) {
		return;
	}

	if (isDirectory) {
		let config = getConfig();
		let confirmFolderDeletion = config.get<Boolean>("confirmFolderDeletion");
		if (confirmFolderDeletion) {
			if (!await confirmDeletion(`Are you sure you wish to delete folder : ${currentlySelectedFile}?`)) {
				return;
			}
		}
		await vscode.workspace.fs.delete(vscode.Uri.file(currentlySelectedFile), {recursive: true});
		await vscode.commands.executeCommand("workbench.files.action.focusFilesExplorer");
		await vscode.window.showInformationMessage(`Deleted folder :${currentlySelectedFile}.`);
	} else {
		await vscode.workspace.fs.delete(vscode.Uri.file(currentlySelectedFile));
		await vscode.commands.executeCommand("workbench.files.action.focusFilesExplorer");
		await vscode.window.showInformationMessage(`Deleted file :${currentlySelectedFile}.`);
	}

}

async function confirmDeletion(message: string ): Promise<Boolean> {
	const confirmation = (await vscode.window.showInputBox({
		prompt: message,
		validateInput: text => {
			const lowerCaseText = text.toLocaleLowerCase();
			return ['y', 'n', 'yes', 'no'].indexOf(lowerCaseText) === -1 ? 'y or n' : null;
		}
	}))?.trim();

	return confirmation?.toLowerCase().indexOf("y") !== -1;
}
