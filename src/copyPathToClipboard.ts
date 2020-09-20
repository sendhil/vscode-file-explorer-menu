import * as vscode from 'vscode';


export async function copyPathToClipboard(context: vscode.ExtensionContext) {
	await vscode.commands.executeCommand('copyFilePath');
}
