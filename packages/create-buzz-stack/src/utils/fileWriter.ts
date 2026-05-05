import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type FileWriteStatus = "created" | "updated" | "skipped" | "dry-run";

export interface FileWriteResult {
  path: string;
  status: FileWriteStatus;
}

export interface FileWriterOptions {
  dryRun: boolean;
  allowOverwrite?: boolean;
  backupOnOverwrite?: boolean;
}

export class FileWriter {
  private readonly dryRun: boolean;
  private readonly allowOverwrite: boolean;
  private readonly backupOnOverwrite: boolean;

  constructor(options: FileWriterOptions) {
    this.dryRun = options.dryRun;
    this.allowOverwrite = options.allowOverwrite ?? false;
    this.backupOnOverwrite = options.backupOnOverwrite ?? true;
  }

  async writeFile(filePath: string, contents: string): Promise<FileWriteResult> {
    const existingContents = await this.readIfPresent(filePath);

    if (this.dryRun) {
      return { path: filePath, status: "dry-run" };
    }

    await mkdir(path.dirname(filePath), { recursive: true });

    if (existingContents === null) {
      await writeFile(filePath, contents, "utf8");
      return { path: filePath, status: "created" };
    }

    if (!this.allowOverwrite) {
      return { path: filePath, status: "skipped" };
    }

    if (this.backupOnOverwrite) {
      await copyFile(filePath, `${filePath}.bak`);
    }
    await writeFile(filePath, contents, "utf8");
    return { path: filePath, status: "updated" };
  }

  private async readIfPresent(filePath: string): Promise<string | null> {
    try {
      return await readFile(filePath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }
}
