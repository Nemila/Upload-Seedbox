import axios from "axios";
import failedService from "./failed.js";
import hydrax from "./hydrax.js";
import { deleteFile, getFilesRecursively } from "./manager.js";
import wasabi from "./wasabi.js";
import lockfile from "proper-lockfile";
import { join } from "path";
const FOLDER_PATH = "/home/nemila/Videos/Media";
const LOCK_FILE_PATH = join(process.cwd(), "upload-lock.lock");
lockfile
    .lock(LOCK_FILE_PATH)
    .then(async (release) => {
    if (!FOLDER_PATH)
        throw new Error("No folder path");
    const files = getFilesRecursively(FOLDER_PATH);
    const filenameRegex = /^.+-(TV|MOVIE)-\d+-S\d{2}-E\d{2}(?:-\[\w{2,3}\])?(\.mkv)?$/i;
    for (const file of files) {
        const filename = file.split("/").pop();
        if (!filename)
            continue;
        if (!filenameRegex.test(filename)) {
            console.log("Invalid filename");
            failedService.add({
                message: "Invalid filename",
                stage: "start",
                file,
            });
            continue;
        }
        const key = "media" + file.split(/\/media/i)[1];
        const wasabiRes = await wasabi.uploadFile(file, key);
        if (!wasabiRes.ok) {
            failedService.add({
                message: wasabiRes.msg,
                stage: "wasabi",
                file,
            });
        }
        const hydraxRes = await hydrax.uploadFile(file);
        if (!hydraxRes.ok) {
            failedService.add({
                message: hydraxRes.msg,
                stage: "hydrax",
                file,
            });
        }
        if (hydraxRes.ok && wasabiRes.ok) {
            await deleteFile(file);
        }
    }
    failedService.save();
    await axios.get(`https://catoonhub.com/api/hydrax`);
    return release();
})
    .catch((e) => {
    console.error(e);
});
