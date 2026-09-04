import { cloneDefaultBusinessSettings, normalizeBusinessSettings } from './business-settings.js';
import { PersistentJsonStore } from './persistent-json-store.js';

export class BusinessSettingsRepository {
  constructor(filePath) {
    this.store = new PersistentJsonStore(filePath, { settings: cloneDefaultBusinessSettings() });
  }

  async ready() {
    await this.store.read();
    return true;
  }

  async get() {
    const data = await this.store.read();
    return normalizeBusinessSettings(data.settings);
  }

  async save(settings) {
    const normalized = normalizeBusinessSettings(settings);
    return this.store.transaction((data) => {
      data.settings = normalized;
      return normalized;
    });
  }
}
