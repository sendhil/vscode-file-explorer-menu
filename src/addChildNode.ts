import * as vscode from 'vscode';
import * as path from 'path';
import { getCurrentlySelectedFilePath } from './utility';


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
