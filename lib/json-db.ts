import fs from "fs";
import path from "path";
import crypto from "crypto";

type FilterFn<T> = (item: T) => boolean;
type Filter<T> = Partial<T> | FilterFn<T>;
type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

function matchesFilter<T>(
  item: T,
  filter: Filter<T>
): boolean {
  if (typeof filter === "function") return filter(item);
  const f = filter as Record<string, unknown>;
  const i = item as Record<string, unknown>;
  for (const key of Object.keys(f)) {
    if (f[key] !== undefined && i[key] !== f[key]) return false;
  }
  return true;
}

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `${timestamp}${random}`;
}

export class JsonDB<T extends { id: string }> {
  private filePath: string;
  private cache: T[] | null = null;
  private writeLock: Promise<void> = Promise.resolve();

  constructor(relativePath: string) {
    this.filePath = path.join(process.cwd(), relativePath);
  }

  private ensureDir(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readData(): T[] {
    if (this.cache) return this.cache;
    this.ensureDir();
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]", "utf-8");
      this.cache = [];
      return [];
    }
    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      this.cache = JSON.parse(raw || "[]") as T[];
      return this.cache;
    } catch {
      this.cache = [];
      return [];
    }
  }

  private async writeData(data: T[]): Promise<void> {
    this.writeLock = this.writeLock.then(async () => {
      this.ensureDir();
      const tmpPath = this.filePath + ".tmp";
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tmpPath, this.filePath);
      this.cache = data;
    });
    await this.writeLock;
  }

  async findMany(filter?: Filter<T>): Promise<T[]> {
    const data = this.readData();
    if (!filter) return [...data];
    return data.filter((item) => matchesFilter(item, filter));
  }

  async findUnique(id: string): Promise<T | null> {
    const data = this.readData();
    return data.find((item) => item.id === id) ?? null;
  }

  async findFirst(filter: Filter<T>): Promise<T | null> {
    const data = this.readData();
    return data.find((item) => matchesFilter(item, filter)) ?? null;
  }

  async count(filter?: Filter<T>): Promise<number> {
    if (!filter) return this.readData().length;
    return (await this.findMany(filter)).length;
  }

  async create(input: CreateInput<T>): Promise<T> {
    const data = this.readData();
    const now = new Date().toISOString();
    const record = {
      createdAt: now,
      updatedAt: now,
      ...input,
      id: input.id || generateId(),
    } as unknown as T;
    data.push(record);
    await this.writeData(data);
    return record;
  }

  async createMany(inputs: CreateInput<T>[]): Promise<T[]> {
    const data = this.readData();
    const now = new Date().toISOString();
    const records: T[] = inputs.map((input) => {
      const record = {
        createdAt: now,
        updatedAt: now,
        ...input,
        id: (input as Record<string, unknown>).id || generateId(),
      } as unknown as T;
      return record;
    });
    data.push(...records);
    await this.writeData(data);
    return records;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const data = this.readData();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    data[index] = { ...data[index], ...updates, id } as T;
    if ("updatedAt" in data[index]) {
      (data[index] as Record<string, unknown>).updatedAt = now;
    }
    await this.writeData(data);
    return data[index];
  }

  async updateMany(
    filter: Filter<T>,
    updates: Partial<T>
  ): Promise<number> {
    const data = this.readData();
    const now = new Date().toISOString();
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (matchesFilter(data[i], filter)) {
        const id = data[i].id;
        data[i] = { ...data[i], ...updates, id } as T;
        if ("updatedAt" in data[i]) {
          (data[i] as Record<string, unknown>).updatedAt = now;
        }
        count++;
      }
    }
    if (count > 0) await this.writeData(data);
    return count;
  }

  async upsert(
    filter: Filter<T>,
    createData: CreateInput<T>,
    updateData: Partial<T>
  ): Promise<T> {
    const existing = await this.findFirst(filter);
    if (existing) {
      return (await this.update(existing.id, updateData))!;
    }
    return this.create(createData);
  }

  async delete(id: string): Promise<boolean> {
    const data = this.readData();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return false;
    data.splice(index, 1);
    await this.writeData(data);
    return true;
  }

  async deleteMany(filter?: Filter<T>): Promise<number> {
    const data = this.readData();
    if (!filter) {
      const count = data.length;
      await this.writeData([]);
      return count;
    }
    const remaining: T[] = [];
    let count = 0;
    for (const item of data) {
      if (matchesFilter(item, filter)) {
        count++;
      } else {
        remaining.push(item);
      }
    }
    if (count > 0) await this.writeData(remaining);
    return count;
  }

  async aggregate(
    field: keyof T,
    filter?: Filter<T>
  ): Promise<{ sum: number; count: number; avg: number }> {
    const items = filter ? await this.findMany(filter) : this.readData();
    let sum = 0;
    let count = 0;
    for (const item of items) {
      const val = Number(item[field]);
      if (!isNaN(val)) {
        sum += val;
        count++;
      }
    }
    return { sum, count, avg: count > 0 ? sum / count : 0 };
  }

  async groupBy(
    field: keyof T,
    filter?: Filter<T>
  ): Promise<Record<string, number>> {
    const items = filter ? await this.findMany(filter) : this.readData();
    const result: Record<string, number> = {};
    for (const item of items) {
      const key = String(item[field]);
      result[key] = (result[key] || 0) + 1;
    }
    return result;
  }

  invalidateCache(): void {
    this.cache = null;
  }
}
