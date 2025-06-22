import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";
import { basename } from "path";
class Hydrax {
    baseUrl = "https://up.hydrax.net";
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    getContentType(filename) {
        const ext = filename.toLowerCase().split(".").pop();
        switch (ext) {
            case "mp4":
                return "video/mp4";
            case "avi":
                return "video/avi";
            case "mkv":
                return "video/x-matroska";
            case "mkv":
                return "video/x-matroska";
            case "mov":
                return "video/quicktime";
            case "wmv":
                return "video/x-ms-wmv";
            case "flv":
                return "video/x-flv";
            case "webm":
                return "video/webm";
            default:
                return "application/octet-stream";
        }
    }
    async uploadFile(filePath) {
        try {
            const filename = basename(filePath);
            const formData = new FormData();
            formData.append("file", createReadStream(filePath), {
                filename: filename,
                contentType: this.getContentType(filename),
            });
            console.log("Uploading file to Hydrax...");
            const response = await axios.request({
                method: "POST",
                data: formData,
                url: `${this.baseUrl}/${this.apiKey}`,
                headers: { ...formData.getHeaders() },
                onUploadProgress(progressEvent) {
                    const progres = ((progressEvent?.progress || 0) * 100).toFixed(0);
                    console.log(`${progres}% uploaded`);
                },
            });
            const data = response.data;
            if (!data)
                return { msg: "No response from Hydrax", ok: false };
            if (!data.status)
                return { msg: "Failed to upload", ok: false };
            console.log("File uploaded");
            return { msg: "File uploaded", ok: true, res: data.slug };
        }
        catch (error) {
            if (error instanceof Error) {
                return { ok: false, msg: error.message };
            }
            else {
                return { ok: false, msg: "Something went wrong" };
            }
        }
    }
}
const hydrax = new Hydrax("9d411365c675a87353180808c7365e0b");
export default hydrax;
