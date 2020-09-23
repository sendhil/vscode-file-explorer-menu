import * as vscode from 'vscode';
import * as path from 'path';

export async function getCurrentlySelectedFilePath(): Promise<string> {
	let currentText = await vscode.env.clipboard.readText();
	await vscode.commands.executeCommand('copyFilePath');
	let pathOfActiveFile = await vscode.env.clipboard.readText();
	await vscode.env.clipboard.writeText(currentText);
	return pathOfActiveFile;
}

// TODO: Make this configurable
export function doesPathBelongToWorkspace(filePath:string): Boolean {
	if (!vscode.workspace.workspaceFolders) {
		return false;
	}

	// Source - https://stackoverflow.com/questions/37521893/determine-if-a-path-is-subdirectory-of-another-in-node-js
	const isPathRelative = (workspaceRoot:string) : Boolean => {
		let relative = path.relative(workspaceRoot, filePath);
		return relative.length > 0 && !relative.startsWith('..') && !path.isAbsolute(relative);
	};

	for (let workspaceFolder of vscode.workspace.workspaceFolders) {
		if (isPathRelative(workspaceFolder.uri.fsPath)) {
			return true;
		}
	}

	return false;
}

export function getConfig(): vscode.WorkspaceConfiguration {
	return vscode.workspace.getConfiguration("fileExplorerMenu");
}