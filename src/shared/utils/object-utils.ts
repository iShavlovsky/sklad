import { isPlainObject } from './type-guards';

/**
 * Creates a shallow copy of an object with a single property removed.
 * Uses destructuring to efficiently exclude the specified key.
 *
 * @template T - The type of the source object
 * @template K - The key type to be omitted (must be a key of T)
 * @param obj - The source object to omit from
 * @param key - The property key to exclude
 * @returns A new object without the specified property
 *
 * @example
 * // Remove a single property from an object
 * const user = { id: 1, name: 'John', password: 'secret' };
 * const safeUser = omit(user, 'password');
 * // Result: { id: 1, name: 'John' }
 *
 * @example
 * // Type-safe omission with TypeScript
 * interface Config {
 *     apiKey: string;
 *     debug: boolean;
 *     timeout: number;
 * }
 * const config: Config = { apiKey: 'abc123', debug: true, timeout: 5000 };
 * const publicConfig = omit(config, 'apiKey');
 * // Type: Omit<Config, 'apiKey'> = { debug: boolean; timeout: number }
 *
 * @example
 * // Preparing data for API response
 * const dbRecord = { id: 42, createdAt: new Date(), internalFlag: true };
 * const response = omit(dbRecord, 'internalFlag');
 * // Result: { id: 42, createdAt: Date }
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  key: K
): Omit<T, K> {
  const { [key]: _, ...rest } = obj;
  return rest;
}

/**
 * Creates a shallow copy of an object with multiple properties removed.
 * Iterates over the keys array and deletes each property from the cloned object.
 *
 * @template T - The type of the source object
 * @template K - The union type of keys to be omitted (must be keys of T)
 * @param obj - The source object to omit from
 * @param keys - An array of property keys to exclude
 * @returns A new object without the specified properties
 *
 * @example
 * // Remove multiple sensitive fields
 * const user = {
 *     id: 1,
 *     name: 'Alice',
 *     email: 'alice@example.com',
 *     password: 'hashed_pw',
 *     ssn: '123-45-6789'
 * };
 * const publicUser = omitMany(user, ['password', 'ssn']);
 * // Result: { id: 1, name: 'Alice', email: 'alice@example.com' }
 *
 * @example
 * // Clean up internal metadata before serialization
 * const document = {
 *     title: 'Report',
 *     content: '...',
 *     _rev: '3-abc',
 *     _id: 'doc123',
 *     _attachments: {}
 * };
 * const cleanDoc = omitMany(document, ['_rev', '_id', '_attachments']);
 * // Result: { title: 'Report', content: '...' }
 *
 * @example
 * // Dynamic key omission based on conditions
 * const data = { a: 1, b: 2, c: 3, d: 4 };
 * const keysToRemove: Array<'a' | 'b' | 'c' | 'd'> = ['a', 'c'];
 * const filtered = omitMany(data, keysToRemove);
 * // Result: { b: 2, d: 4 }
 */
export function omitMany<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const clone = { ...obj };
  for (const k of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete clone[k];
  }
  return clone;
}

/**
 * Creates a new object containing only the specified properties from the source object.
 * Useful for extracting a subset of properties while maintaining type safety.
 *
 * @template T - The type of the source object
 * @template K - The union type of keys to pick (must be keys of T)
 * @param obj - The source object to pick from
 * @param keys - An array of property keys to include
 * @returns A new object containing only the specified properties
 *
 * @example
 * // Extract specific fields for a form
 * const fullUser = {
 *     id: 1,
 *     username: 'johndoe',
 *     email: 'john@example.com',
 *     avatar: 'https://...',
 *     createdAt: new Date(),
 *     role: 'admin'
 * };
 * const formData = pick(fullUser, ['username', 'email']);
 * // Result: { username: 'johndoe', email: 'john@example.com' }
 *
 * @example
 * // Create a DTO from an entity
 * interface Product {
 *     id: number;
 *     name: string;
 *     price: number;
 *     inventory: number;
 *     supplierId: number;
 * }
 * const product: Product = { id: 1, name: 'Widget', price: 29.99, inventory: 100, supplierId: 5 };
 * const catalogItem = pick(product, ['id', 'name', 'price']);
 * // Type: Pick<Product, 'id' | 'name' | 'price'>
 * // Result: { id: 1, name: 'Widget', price: 29.99 }
 *
 * @example
 * // Extract coordinates from a complex object
 * const event = { type: 'click', x: 100, y: 200, target: HTMLElement, timestamp: 1234567890 };
 * const coords = pick(event, ['x', 'y']);
 * // Result: { x: 100, y: 200 }
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) {
    if (k in obj) {
      out[k] = obj[k];
    }
  }
  return out;
}

/**
 * Recursively merges two objects, with properties from the second object
 * taking precedence. Nested objects are merged deeply, while arrays and
 * primitive values are overwritten.
 *
 * @template T - The type of the first (base) object
 * @template U - The type of the second (override) object
 * @param a - The base object to merge into
 * @param b - The object whose properties will override or extend the base
 * @returns A new deeply merged object combining both inputs
 *
 * @remarks
 * - Arrays are NOT merged; they are replaced entirely by the second object's array
 * - Only plain objects are recursively merged; class instances are treated as values
 * - The original objects are not mutated
 * - Return type uses intersection (&) which TypeScript handles well
 *
 * @example
 * // Basic deep merge of configuration objects
 * const defaults = {
 *     api: { timeout: 5000, retries: 3 },
 *     ui: { theme: 'light', language: 'en' }
 * };
 * const userConfig = {
 *     api: { timeout: 10000 },
 *     ui: { theme: 'dark' }
 * };
 * const config = deepMerge(defaults, userConfig);
 * // Result: {
 * //     api: { timeout: 10000, retries: 3 },
 * //     ui: { theme: 'dark', language: 'en' }
 * // }
 *
 * @example
 * // Merging with new properties
 * const base = { a: { b: 1 } };
 * const extension = { a: { c: 2 }, d: 3 };
 * const merged = deepMerge(base, extension);
 * // Result: { a: { b: 1, c: 2 }, d: 3 }
 *
 * @example
 * // Arrays are replaced, not merged
 * const obj1 = { tags: ['a', 'b'], meta: { ids: [1, 2] } };
 * const obj2 = { tags: ['c'], meta: { ids: [3] } };
 * const result = deepMerge(obj1, obj2);
 * // Result: { tags: ['c'], meta: { ids: [3] } }
 */
export function deepMerge<T extends object, U extends object>(
  a: T,
  b: U
): T & U {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = { ...a };

  for (const [key, value] of Object.entries(b)) {
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }

  return out as T & U;
}
