import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const rawData = JSON.parse(
  readFileSync(join(process.cwd(), "src", "failed.json"), "utf-8")
);

type STAGE = "hydrax" | "wasabi" | "start";
type FailedType = {
  file: string;
  stage: STAGE;
  message: string;
  date: Date;
};

class FailedService {
  data = rawData as FailedType[];
  add = ({ file, stage, message }: Omit<FailedType, "date">) => {
    const exists = this.data.find(
      (item) =>
        item.file === file && item.stage === stage && item.message === message
    );
    if (exists) return;

    this.data.push({
      file,
      stage,
      message,
      date: new Date(),
    });
  };
  save = () => {
    writeFileSync(
      join(process.cwd(), "src", "failed.json"),
      JSON.stringify(this.data)
    );
    console.log(`Recorded ${this.data.length} failures`);
  };
}

const failedService = new FailedService();
export default failedService;
