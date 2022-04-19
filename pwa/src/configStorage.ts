export interface ConfigStorage {
  getToken(): string | null;
  getHostList(): string[];
  setHostList(hosts: string[]): void;
  setApiHost(host: string): void;
  getApiHost(): string|null;
  updateToken(token: string, expiresAt?: number): void ; /* expiresAt should be unix epoch */
  setToken(token: string, persist: boolean, expiresAt?: number): void ; /* expiresAt should be unix epoch */
  clearToken(): void;
}

enum ConfigItem {
  Token = 'credentials',
  HostList = 'api-host-list',
  ApiHost = 'api-host',
}

class BrowserConfigStorage implements ConfigStorage {
  storageType = null;

  defaultExpiration = 3600 * 24 * 30; /* 30 days */

  credentials: { refreshToken: string; expiresAt: number;} | null = null;

  #loadToken(storage: any) {
    const sItem = storage.getItem(ConfigItem.Token);
    if (sItem !== null) {
      try {
        const creds = JSON.parse(sItem);
        if (creds && creds.refreshToken && creds.expiresAt > new Date().getTime() / 1000) {
          this.storageType = storage;
          this.credentials = creds;
          return creds;
        }
      } catch (err) {
        /* no-empty */
      }
    }
    return null;
  }

  #storeToken(token: string, expiresAt: number, storage: any) {
    const newToken = { refreshToken: token, expiresAt };
    storage.setItem(ConfigItem.Token, JSON.stringify(newToken));
    this.credentials = newToken;
  }

  getToken(): string | null {
    /* Try session storage */
    let creds = this.#loadToken(sessionStorage);
    if (!creds) {
      creds = this.#loadToken(localStorage);
    }
    return creds?.refreshToken;
  }

  updateToken(token: string, expiresAt?: number) {
    const now = new Date().getTime() / 1000;
    if (!this.storageType || !this.credentials) {
      throw new Error('No token present to update');
    }
    this.#storeToken(token, expiresAt || (now + this.defaultExpiration), this.storageType);
  }

  setToken(token: string, persist = false, expiresAt: number|null = null): void {
    const now = new Date().getTime() / 1000;
    this.#storeToken(token, expiresAt || (now + this.defaultExpiration), persist ? localStorage : sessionStorage);
  }

  clearToken(): void {
    sessionStorage.removeItem(ConfigItem.Token);
    localStorage.removeItem(ConfigItem.Token);
    this.credentials = null;
    this.storageType = null;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getHostList(): string[] {
    try {
      const hostListItem = localStorage.getItem(ConfigItem.HostList);
      if (hostListItem !== null) {
        return JSON.parse(hostListItem);
      }
    } catch (err) {
      /* no-empty */
    }
    return [];
  }

  /* eslint-disable-next-line class-methods-use-this */
  setHostList(hosts: string[]) {
    localStorage.setItem(ConfigItem.HostList, JSON.stringify(hosts));
  }

  /* eslint-disable-next-line class-methods-use-this */
  getApiHost(): string | null {
    return localStorage.getItem(ConfigItem.ApiHost);
  }

  /* eslint-disable-next-line class-methods-use-this */
  setApiHost(host: string) {
    localStorage.setItem(ConfigItem.ApiHost, host);
  }
}

const storage = new BrowserConfigStorage();

export default storage;
