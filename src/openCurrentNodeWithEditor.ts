import * as vscode from 'vscode';
import { getCurrentlySelectedFilePath } from './utility';


export async function openCurrentNodeWithEditor(context: vscode.ExtensionContext) {
    let currentFilePath = await getCurrentlySelectedFilePath();

    try {
        await vscode.workspace.fs.stat(vscode.Uri.file(currentFilePath));
    } catch (_) {
        await vscode.window.showErrorMessage("Node does not exist.");
        return;
    }

    await vscode.env.openExternal(vscode.Uri.file(currentFilePath));
}