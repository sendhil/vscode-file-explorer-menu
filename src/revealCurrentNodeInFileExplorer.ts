import * as vscode from 'vscode';


export async function revealCurrentNodeInFileExplorer(context: vscode.ExtensionContext) {
	vscode.commands.executeCommand("revealFileInOS");
}
