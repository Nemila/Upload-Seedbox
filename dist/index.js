import axios from "axios";
import failedService from "./failed.js";
import hydrax from "./hydrax.js";
import { deleteFile, getFilesRecursively } from "./manager.js";
import wasabi from "./wasabi.js";
const FOLDER_PATH = process.env.sonarr_series_path;
const EVENT_TYPE = process.env.sonarr_eventtype;
if (EVENT_TYPE !== "Test") {
    (async () => {
        if (!FOLDER_PATH)
            throw new Error("No folder path");
        const files = getFilesRecursively(FOLDER_PATH);
        for (const file of files) {
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
            await deleteFile(file);
        }
        failedService.save();
        await axios.get(`https://catoonhub.com/api/hydrax`);
        console.log("DONE");
    })();
}
