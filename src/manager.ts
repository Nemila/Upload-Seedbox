import { readdirSync } from "fs";
import { unlink } from "fs/promises";
import { join } from "path";

export const getFilesRecursively = (dirPath: string): string[] => {
  const files: string[] = [];

  try {
    const items = readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dirPath, item.name);

      if (item.isDirectory()) {
        files.push(...getFilesRecursively(fullPath));
      } else if (item.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return files;
};

export const deleteFile = async (filePath: string) => {
  await unlink(filePath);
};
