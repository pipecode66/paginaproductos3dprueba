import { PersistentJsonStore } from './persistent-json-store.js';
import { getDefaultSiteContent } from './site-content.js';

export class SiteContentRepository {
  constructor(filePath) {
    this.store = new PersistentJsonStore(filePath, { content: getDefaultSiteContent() });
  }

  async get() {
    return (await this.store.read()).content;
  }

  async save(content) {
    return this.store.transaction((data) => {
      data.content = content;
      return content;
    });
  }
}
