import * as vscode from 'vscode';
import * as fs from 'fs';
import { basename } from 'path';
import { promisify } from 'util';
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

	if (process.platform === "win32") {
		await listCurrentNodeWindows(currentFilePath);
		return;
	}

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

async function listCurrentNodeWindows(currentFilePath:string) {
	let stat = promisify(fs.stat);
	const fileStats = await stat(currentFilePath, {bigint: true});
	
	const fileTypePrefix = fileStats.isDirectory() ? "DIR" : "FILE";
	const fileTypeOutput = `${fileTypePrefix}:${basename(currentFilePath)}`;
	const modifiedOutput = `MOD:${fileStats.mtime.toLocaleDateString(undefined,
		{
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric"
		}
	)}`;
	const bytesOutput = `BYTES:${fileStats.size}`;
	const filePermissionOutput = `PERMISSIONS:${getFilePermissionString(Number(fileStats.mode))}`;

	// TODO: Give option to display this as a status message as the output tends to not fit in the information message pop up?
	await vscode.window.showInformationMessage(`${fileTypeOutput} ${modifiedOutput} ${bytesOutput} ${filePermissionOutput}`);
}

function getFilePermissionString(fileMode:number):string {
	// For some reason, fs.constants.S_IRUSR and friends don't seem to be defined in node's fs module. 
	// Peeking at the code(https://github.com/nodejs/node/blob/1e8cb08edcbbfe01e7ef186a09d4781b33b490cc/deps/uv/src/win/fs.c#L1788)
	// it seems like on Windows the file permission bits are the same for owner/group/other, but lets just check each one just incase.

	let readBit = 0o0400;
	let writeBit = 0o0200;
	let executeBit = 0o0100;

	let output = "";

	for (let i=0; i < 3; i++) {
		output += fileMode & readBit ? "r" : "-";
		output += fileMode & writeBit ? "w" : "-";
		output += fileMode & executeBit ? "x" : "-";

		readBit  = readBit >> 1;
		writeBit = writeBit >> 1;
		executeBit = executeBit >> 1;
	}

	return output;
}