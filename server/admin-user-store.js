import { buildInvitedAdminUser, invitationTokenMatches, normalizeAdminEmail, normalizePermissions } from './admin-users.js';
import { PersistentJsonStore } from './persistent-json-store.js';

export class AdminUserStore {
  constructor(filePath) {
    this.store = new PersistentJsonStore(filePath, { users: [] });
  }

  async ready() {
    await this.store.read();
    return true;
  }

  async list() {
    const data = await this.store.read();
    return [...data.users].sort((first, second) => first.createdAt - second.createdAt);
  }

  async findByEmail(email) {
    const normalized = normalizeAdminEmail(email);
    return (await this.list()).find((user) => user.email === normalized) ?? null;
  }

  async hasActiveMaster() {
    return (await this.list()).some((user) => user.role === 'master' && user.status === 'ACTIVE' && user.active !== false);
  }

  async createInvitation(input) {
    const invited = buildInvitedAdminUser(input);
    return this.store.transaction((data) => {
      const index = data.users.findIndex((user) => user.email === invited.email);
      if (index >= 0 && data.users[index].status === 'ACTIVE') return null;
      if (index >= 0) data.users[index] = { ...data.users[index], ...invited, createdAt: data.users[index].createdAt };
      else data.users.push(invited);
      return invited;
    });
  }

  async activate(email, token, passwordHash, now = Date.now()) {
    const normalized = normalizeAdminEmail(email);
    return this.store.transaction((data) => {
      const user = data.users.find((candidate) => candidate.email === normalized);
      if (
        !user
        || user.status !== 'INVITED'
        || user.active === false
        || Number(user.inviteExpiresAt || 0) <= now
        || !invitationTokenMatches(token, user.inviteTokenHash)
      ) return null;
      user.passwordHash = passwordHash;
      user.status = 'ACTIVE';
      user.inviteTokenHash = null;
      user.inviteExpiresAt = null;
      user.updatedAt = now;
      user.lastLoginAt = now;
      return { ...user };
    });
  }

  async update(email, input = {}, now = Date.now()) {
    const normalized = normalizeAdminEmail(email);
    return this.store.transaction((data) => {
      const user = data.users.find((candidate) => candidate.email === normalized);
      if (!user) return null;
      if (typeof input.name === 'string' && input.name.trim()) user.name = input.name.trim().replace(/\s+/g, ' ').slice(0, 100);
      if (user.role !== 'master' && Array.isArray(input.permissions)) {
        user.permissions = normalizePermissions(input.permissions, user.role);
      }
      if (user.role !== 'master' && typeof input.active === 'boolean') user.active = input.active;
      user.updatedAt = now;
      return { ...user };
    });
  }

  async recordLogin(email, now = Date.now()) {
    return this.store.transaction((data) => {
      const user = data.users.find((candidate) => candidate.email === normalizeAdminEmail(email));
      if (!user) return null;
      user.lastLoginAt = now;
      user.updatedAt = now;
      return { ...user };
    });
  }
}
