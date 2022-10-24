/* eslint-disable curly */
import * as vscode from "vscode";
import handleChange from "./extensionManager";
import * as glob from "glob";

let watcher: vscode.FileSystemWatcher;

function setupFileWatcher() {
    watcher = vscode.workspace.createFileSystemWatcher("**/Entity/*.php");

    onChange();
}

function onChange() {
    watcher.onDidChange(() => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const workspaceFolders = vscode.workspace.workspaceFolders[0].uri.fsPath.replace(/\\/g, "/");

            glob(workspaceFolders + "/**/src/Entity/*.php", (err, files) => {

                if (err) console.log(__filename + " : " + err);

                if (files.length > 0) handleChange(files);

                vscode.window.showInformationMessage('DoctrineUML Active');

            });
        }
    });

}

function dispose() {
    if (watcher) watcher.dispose();
}

export {
    setupFileWatcher,
    dispose
};