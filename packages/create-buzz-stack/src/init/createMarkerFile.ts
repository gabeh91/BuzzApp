import { FileWriter, type FileWriteResult } from "../utils/fileWriter.ts";
import { getMarkerPath, type BuzzStackMarker } from "../utils/marker.ts";

export async function createMarkerFile(
  cwd: string,
  marker: BuzzStackMarker,
  options: { dryRun: boolean; allowOverwrite?: boolean }
): Promise<FileWriteResult> {
  const writer = new FileWriter({
    dryRun: options.dryRun,
    allowOverwrite: options.allowOverwrite
  });

  return writer.writeFile(getMarkerPath(cwd), `${JSON.stringify(marker, null, 2)}\n`);
}
