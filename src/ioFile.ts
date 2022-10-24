/* eslint-disable curly */
import * as fs from "fs";
import { Table, Property } from "./type/Table";
import * as vs from "vscode";


function openFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            fs.readFile(path, "utf-8", (err, data) => {
                if (err) {
                    throw new Error("function openFile error-" + err);
                }
                resolve(data);
            });
        } catch (err) {
            reject(__filename + " : " + err);
        }
    });
}

function openFiles(paths: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
        try {
            let files: string[] = [];
            let promises: Promise<string | void>[] = [];

            paths.forEach(path => {
                promises.push(openFile(path).then(file => {
                    if (file === "") return;
                    files.push(file);
                }));
            });
            
            Promise.all(promises).then(() => {
                resolve(files);
            });
        } catch (err) {
            reject(__filename + " : " + err);
        }
    });
}

function makeMarkdown(tables: Table[]): Promise<string> {
    return new Promise((resolve, reject) => {
        let markdown : string = "```mermaid\nclassDiagram\n\n";

        tables.forEach(table => {
            let strBuff = "class " + table.name + "{\n";
            let relations : string[] = [];
            table.properties.forEach(property => {
                if(property.id) strBuff += "PK - ";
                strBuff += property.name + "\n";
                if(property.reference !== undefined) {
                    if(property.reference.className !== undefined) {
                        relations.push(property.reference.className);
                    }
                }
            });
            strBuff += "}\n\n";
            relations.forEach(relation => {

                strBuff += `${table.name} -- ${relation}\n` ;
            });
            markdown += strBuff;
        });

        markdown += "\n```";

        resolve(markdown);
    });
}

async function writeMarkdown(markdown: string) {
    try {
        if(vs.workspace.workspaceFolders === undefined) return;

        fs.writeFile(vs.workspace.workspaceFolders[0].uri.fsPath + "/UML.md", markdown, (err: any) => {
            if(err) throw new Error(__filename + " Error in writeFile function : " + err);
        });
    } catch (err) {
        console.error(err);
    }
   
}

export {
    openFile,
    openFiles,
    makeMarkdown,
    writeMarkdown
};