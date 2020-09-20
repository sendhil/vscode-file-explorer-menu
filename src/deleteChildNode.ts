import * as vscode from 'vscode';
import * as path from 'path';
import { getCurrentlySelectedFilePath } from './utility';


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
