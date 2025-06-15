// Mock MMKV for testing
const storage = new Map<string, any>();

export class MMKV {
  set(key: string, value: any): void {
    storage.set(key, value);
    console.log(`💾 MMKV set: ${key} (mock)`);
  }

  getString(key: string): string | undefined {
    const value = storage.get(key);
    console.log(`💾 MMKV getString: ${key} = ${value} (mock)`);
    return value;
  }

  getBoolean(key: string): boolean | undefined {
    const value = storage.get(key);
    console.log(`💾 MMKV getBoolean: ${key} = ${value} (mock)`);
    return value;
  }

  delete(key: string): void {
    storage.delete(key);
    console.log(`💾 MMKV delete: ${key} (mock)`);
  }
}

export default { MMKV };