import * as vscode from 'vscode';
import { exec } from 'child_process';
import { getConfig, getCurrentlySelectedFilePath } from './utility';


export async function listCurrentNode(context: vscode.ExtensionContext) {
	let currentFilePath = await getCurrentlySelectedFilePath();

	try {
		 await vscode.workspace.fs.stat(vscode.Uri.file(currentFilePath));
	} catch (_) {
		await vscode.window.showErrorMessage("Node does not exist.");
		return;
	}

	// TODO: Get this to work on Windows.
	const command = `ls -ld ${currentFilePath}`;

	let config = getConfig();
	if (config.get<Boolean>("displayListNodeInTerminal")) {
		let terminal = vscode.window.createTerminal({ 
			hideFromUser: true
		});
		terminal.sendText(command);
		terminal.show();
	} else {
		const { stdout, stderr } = exec(command);
		stdout?.on("data", (output) => {
			vscode.window.showInformationMessage(output);
		});
		stderr?.on("data", (output) => {
			vscode.window.showErrorMessage(output);
		});
	}
}
