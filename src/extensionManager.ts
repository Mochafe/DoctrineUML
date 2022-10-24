import { parseFiles, } from "./parser";
import * as ioFile from "./ioFile";

export default async function handleChange(paths: string[]) {
    try {

        const filesContent = await ioFile.openFiles(paths);

        const parsedContent = await parseFiles(filesContent);

        const markdown = await ioFile.makeMarkdown(parsedContent);

        ioFile.writeMarkdown(markdown);

    } catch (err) {
        console.log(err);
    }


}