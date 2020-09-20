import * as vscode from 'vscode';
import { exec } from 'child_process';
import { getCurrentlySelectedFilePath } from './utility';


export async function listCurrentNode(context: vscode.ExtensionContext) {
	// TODO: Add option to display in terminal
	let currentFilePath = await getCurrentlySelectedFilePath();

	const { stdout, stderr } = await exec(`ls -la ${currentFilePath}`);
	stdout?.on("data", (output) => {
		vscode.window.showInformationMessage(output);
	});
	stderr?.on("data", (output) => {
		vscode.window.showErrorMessage(output);
	});
}
