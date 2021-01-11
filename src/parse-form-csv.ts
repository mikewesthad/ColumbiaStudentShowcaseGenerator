import { createReadStream } from "fs";
import parse from "csv-parse";

export default async function parseFormCsv(csvPath: string): Promise<Array<string[]>> {
  // Skip the header, starting at line 2.
  const parser = createReadStream(csvPath).pipe(parse({ from: 2 }));
  const records = [];
  for await (const record of parser) {
    records.push(record);
  }
  return records;
}
