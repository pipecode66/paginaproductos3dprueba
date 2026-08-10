import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class PersistentJsonStore {
  constructor(filePath, initialData) {
    this.filePath = filePath;
    this.initialData = clone(initialData);
    this.queue = Promise.resolve();
  }

  async read() {
    try {
      return JSON.parse(await readFile(this.filePath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await this.write(this.initialData);
      return clone(this.initialData);
    }
  }

  async write(data) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }

  async transaction(mutator) {
    const operation = this.queue.catch(() => undefined).then(async () => {
      const data = await this.read();
      const result = await mutator(data);
      await this.write(data);
      return clone(result);
    });

    this.queue = operation;
    return operation;
  }
}
