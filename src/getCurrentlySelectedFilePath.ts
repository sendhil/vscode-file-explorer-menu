import * as vscode from 'vscode';

export async function getCurrentlySelectedFilePath(): Promise<string> {
	let currentText = await vscode.env.clipboard.readText();
	await vscode.commands.executeCommand('copyFilePath');
	let pathOfActiveFile = await vscode.env.clipboard.readText();
	await vscode.env.clipboard.writeText(currentText);
	return pathOfActiveFile;
}
