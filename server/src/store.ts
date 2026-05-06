import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SavedReceipt } from "./types.js";

const dataDir = path.resolve("data");
const receiptsPath = path.join(dataDir, "receipts.json");

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(receiptsPath, "utf8");
  } catch {
    await writeFile(receiptsPath, "[]", "utf8");
  }
}

export async function getReceipts(): Promise<SavedReceipt[]> {
  await ensureStore();
  const file = await readFile(receiptsPath, "utf8");
  return JSON.parse(file) as SavedReceipt[];
}

export async function saveReceipt(receipt: SavedReceipt) {
  const receipts = await getReceipts();
  const index = receipts.findIndex((item) => item.id === receipt.id);

  if (index >= 0) {
    receipts[index] = receipt;
  } else {
    receipts.unshift(receipt);
  }

  await writeFile(receiptsPath, JSON.stringify(receipts, null, 2), "utf8");
  return receipt;
}

