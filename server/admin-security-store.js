import crypto from 'node:crypto';
import { PersistentJsonStore } from './persistent-json-store.js';

const INITIAL_SECURITY_STATE = {
  loginLimits: {},
  sessions: {},
  totpSteps: {},
};

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function prune(state, now) {
  Object.entries(state.loginLimits).forEach(([key, entry]) => {
    if (Number(entry.lockedUntil || 0) <= now && Number(entry.windowStartedAt || 0) + 86_400_000 <= now) {
      delete state.loginLimits[key];
    }
  });
  Object.entries(state.sessions).forEach(([key, session]) => {
    if (Number(session.expiresAt || 0) + 86_400_000 <= now) delete state.sessions[key];
  });
}

export class AdminSecurityStore {
  constructor(filePath) {
    this.store = new PersistentJsonStore(filePath, INITIAL_SECURITY_STATE);
  }

  async ready() {
    await this.store.read();
    return true;
  }

  async getLoginLock(keys, now = Date.now()) {
    const state = await this.store.read();
    return keys.reduce((latest, key) => Math.max(latest, Number(state.loginLimits[key]?.lockedUntil || 0)), 0);
  }

  async recordLoginFailure(keys, policy, now = Date.now()) {
    return this.store.transaction((state) => {
      prune(state, now);
      let lockedUntil = 0;
      keys.forEach((key) => {
        const current = state.loginLimits[key];
        const inWindow = current && Number(current.windowStartedAt) + policy.windowMs > now;
        const attempts = inWindow ? Number(current.attempts || 0) + 1 : 1;
        const nextLock = Number(current?.lockedUntil || 0) > now
          ? Number(current.lockedUntil)
          : attempts >= policy.limit ? now + policy.lockMs : 0;
        state.loginLimits[key] = {
          attempts,
          windowStartedAt: inWindow ? Number(current.windowStartedAt) : now,
          lockedUntil: nextLock,
          updatedAt: now,
        };
        lockedUntil = Math.max(lockedUntil, nextLock);
      });
      return { lockedUntil };
    });
  }

  async clearLoginFailures(keys) {
    await this.store.transaction((state) => {
      keys.forEach((key) => delete state.loginLimits[key]);
      return true;
    });
  }

  async createSession({ id, email, expiresAt, createdAt = Date.now() }) {
    return this.store.transaction((state) => {
      prune(state, createdAt);
      state.sessions[digest(id)] = {
        email,
        expiresAt,
        createdAt,
        lastSeenAt: createdAt,
        revokedAt: null,
      };
      return true;
    });
  }

  async getSession(id, now = Date.now()) {
    const state = await this.store.read();
    const session = state.sessions[digest(id)];
    if (!session || session.revokedAt || Number(session.expiresAt) <= now) return null;
    return { ...session };
  }

  async touchSession(id, expiresAt, now = Date.now()) {
    return this.store.transaction((state) => {
      const session = state.sessions[digest(id)];
      if (!session || session.revokedAt || Number(session.expiresAt) <= now) return null;
      session.expiresAt = expiresAt;
      session.lastSeenAt = now;
      return { ...session };
    });
  }

  async revokeSession(id, now = Date.now()) {
    return this.store.transaction((state) => {
      const session = state.sessions[digest(id)];
      if (!session) return false;
      session.revokedAt = now;
      return true;
    });
  }

  async getLastTotpStep(email) {
    const state = await this.store.read();
    return Number.isInteger(Number(state.totpSteps[email])) ? Number(state.totpSteps[email]) : undefined;
  }

  async consumeTotpStep(email, timeStep, now = Date.now()) {
    return this.store.transaction((state) => {
      const previous = Number(state.totpSteps[email]);
      if (Number.isInteger(previous) && timeStep <= previous) return false;
      state.totpSteps[email] = timeStep;
      prune(state, now);
      return true;
    });
  }
}

export function hashAdminSecurityKey(value) {
  return digest(value);
}
