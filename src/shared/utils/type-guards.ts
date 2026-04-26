/**
 * Checks if a value is defined (not null and not undefined).
 * Useful for filtering out nullish values from arrays or narrowing types.
 *
 * @template T - The type of the value when defined
 * @param value - The value to check
 * @returns True if the value is neither null nor undefined
 *
 * @example
 * // Type narrowing in conditionals
 * const maybeUser: User | null = getUser();
 * if (isDefined(maybeUser)) {
 *     console.log(maybeUser.name); // TypeScript knows maybeUser is User
 * }
 *
 * @example
 * // Filtering arrays
 * const items: (string | null | undefined)[] = ['a', null, 'b', undefined];
 * const defined = items.filter(isDefined); // string[]
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Checks if a value is a non-empty string.
 * Returns false for empty strings, whitespace-only strings are considered valid.
 *
 * @param value - The value to check
 * @returns True if the value is a string with at least one character
 *
 * @example
 * isNonEmptyString('hello');    // true
 * isNonEmptyString('');         // false
 * isNonEmptyString('   ');      // true (whitespace counts)
 * isNonEmptyString(null);       // false
 * isNonEmptyString(123);        // false
 *
 * @example
 * // Safe property access
 * const config = { apiKey: process.env.API_KEY };
 * if (isNonEmptyString(config.apiKey)) {
 *     fetch('/api', { headers: { 'X-API-Key': config.apiKey } });
 * }
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Checks if a value is a non-null object (record).
 * Returns true for plain objects, arrays, and class instances.
 * Returns false for null, primitives, and functions.
 *
 * @param value - The value to check
 * @returns True if the value is a non-null object
 *
 * @example
 * isRecord({});              // true
 * isRecord({ foo: 'bar' });  // true
 * isRecord([1, 2, 3]);       // true (arrays are objects)
 * isRecord(new Date());      // true
 * isRecord(null);            // false
 * isRecord('string');        // false
 * isRecord(undefined);       // false
 *
 * @example
 * // Safe property access on unknown data
 * function processResponse(data: unknown) {
 *     if (isRecord(data) && 'id' in data) {
 *         console.log(data.id);
 *     }
 * }
 */
export function isRecord(
  value: unknown
): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type-safe wrapper around Object.hasOwn that narrows the object type.
 * Checks if an object has a specific property as its own (not inherited).
 *
 * @template O - The object type
 * @template K - The property key type
 * @param obj - The object to check
 * @param key - The property key to look for
 * @returns True if the object has the property as its own
 *
 * @example
 * const user = { name: 'John', age: 30 };
 * if (hasOwn(user, 'name')) {
 *     console.log(user.name); // TypeScript knows 'name' exists
 * }
 *
 * @example
 * // Checking for optional properties
 * interface Config {
 *     apiUrl: string;
 *     timeout?: number;
 * }
 * function getTimeout(config: Config): number {
 *     return hasOwn(config, 'timeout') ? config.timeout : 5000;
 * }
 */
export function hasOwn<O extends object, K extends PropertyKey>(
  obj: O,
  key: K
): obj is O & Record<K, unknown> {
  return Object.hasOwn(obj, key);
}

/**
 * Checks if a value resembles an Error object by having a 'message' property.
 * Useful for duck-typing error-like objects from unknown sources.
 *
 * @param value - The value to check
 * @returns True if the value is an object with a 'message' property
 *
 * @example
 * isErrorLike(new Error('oops'));           // true
 * isErrorLike({ message: 'Custom error' }); // true
 * isErrorLike({ code: 'ERR_001' });         // false (no message)
 * isErrorLike('error string');              // false
 * isErrorLike(null);                        // false
 *
 * @example
 * // Safe error handling in catch blocks
 * try {
 *     await fetchData();
 * } catch (err) {
 *     if (isErrorLike(err)) {
 *         console.error('Error:', err.message);
 *     }
 * }
 */
export function isErrorLike(value: unknown): value is { message?: unknown } {
  return isRecord(value) && 'message' in value;
}

/**
 * Checks if a value is a valid HTTP or HTTPS URL string.
 * Only validates the protocol prefix, not the full URL structure.
 *
 * @param value - The value to check
 * @returns True if the value is a string starting with http:// or https://
 *
 * @example
 * isHttpUrl('https://example.com');       // true
 * isHttpUrl('http://localhost:3000');     // true
 * isHttpUrl('HTTP://EXAMPLE.COM');        // true (case-insensitive)
 * isHttpUrl('ftp://files.example.com');   // false
 * isHttpUrl('/api/users');                // false (relative URL)
 * isHttpUrl('');                          // false
 * isHttpUrl(null);                        // false
 *
 * @example
 * // Validating API base URL
 * function createClient(baseUrl: unknown) {
 *     if (!isHttpUrl(baseUrl)) {
 *         throw new Error('baseUrl must be a valid HTTP(S) URL');
 *     }
 *     return new ApiClient(baseUrl);
 * }
 */
export function isHttpUrl(value: unknown): value is string {
  return isNonEmptyString(value) && /^https?:\/\//i.test(value);
}

/**
 * Checks if a value is a finite number.
 * Returns false for NaN, Infinity, -Infinity, and non-number types.
 *
 * @param value - The value to check
 * @returns True if the value is a finite number
 *
 * @example
 * isNumber(42);           // true
 * isNumber(3.14);         // true
 * isNumber(-100);         // true
 * isNumber(0);            // true
 * isNumber(NaN);          // false
 * isNumber(Infinity);     // false
 * isNumber('42');         // false (string)
 * isNumber(null);         // false
 *
 * @example
 * // Validating numeric input
 * function setPage(page: unknown) {
 *     if (isNumber(page) && page > 0) {
 *         currentPage = page;
 *     }
 * }
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Converts a value to a non-empty string, or returns undefined.
 * Useful for safely extracting string values from unknown sources.
 *
 * @param value - The value to convert
 * @returns The string value if non-empty, otherwise undefined
 *
 * @example
 * toNonEmptyString('hello');     // 'hello'
 * toNonEmptyString('');          // undefined
 * toNonEmptyString(null);        // undefined
 * toNonEmptyString(123);         // undefined
 * toNonEmptyString(undefined);   // undefined
 *
 * @example
 * // Extracting optional string fields
 * const config = parseConfig(rawData);
 * const apiKey = toNonEmptyString(config.apiKey) ?? 'default-key';
 *
 * @example
 * // Processing query parameters
 * const searchQuery = toNonEmptyString(params.get('q'));
 * if (searchQuery) {
 *     performSearch(searchQuery);
 * }
 */
export function toNonEmptyString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value : undefined;
}

/**
 * Converts a value to a finite number, or returns undefined.
 * Accepts numbers and numeric strings (with optional whitespace trimming).
 *
 * @param value - The value to convert
 * @returns The numeric value if finite, otherwise undefined
 *
 * @example
 * toFiniteNumber(42);           // 42
 * toFiniteNumber('3.14');       // 3.14
 * toFiniteNumber('  100  ');    // 100 (whitespace trimmed)
 * toFiniteNumber('-50');        // -50
 * toFiniteNumber('abc');        // undefined
 * toFiniteNumber('');           // undefined
 * toFiniteNumber(NaN);          // undefined
 * toFiniteNumber(Infinity);     // undefined
 * toFiniteNumber(null);         // undefined
 * toFiniteNumber({});           // undefined
 *
 * @example
 * // Parsing environment variables
 * const port = toFiniteNumber(process.env.PORT) ?? 3000;
 *
 * @example
 * // Processing form input
 * const age = toFiniteNumber(formData.get('age'));
 * if (age !== undefined && age >= 18) {
 *     allowAccess();
 * }
 */
export function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;

    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  }

  return undefined;
}

/**
 * Checks if an object has a specific property that is not null or undefined.
 *
 * @param obj - The object to check
 * @param key - The property key to look for
 * @returns True if the object has the property and its value is defined
 *
 * @example
 * const data = { id: 1, name: null };
 * hasProperty(data, 'id');   // true
 * hasProperty(data, 'name'); // false
 * hasProperty(data, 'age');  // false
 */
export function hasProperty(obj: unknown, key: PropertyKey): boolean {
  try {
    return isRecord(obj) && hasOwn(obj, key) && isDefined(obj[key]);
  } catch {
    return false;
  }
}

/**
 * Checks if a value is an instance of Error.
 *
 * @param value - The value to check
 * @returns True if the value is an instance of Error
 *
 * @example
 * isError(new Error('test'));      // true
 * isError(new TypeError('test'));   // true
 * isError({ message: 'error' });    // false
 * isError('error');                 // false
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Checks if a value is a BigInt.
 *
 * @param value - The value to check
 * @returns True if the value is a bigint
 *
 * @example
 * isBigInt(42n);          // true
 * isBigInt(BigInt(100));  // true
 * isBigInt(42);           // false
 * isBigInt('42');         // false
 */
export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

/**
 * Checks if a value is an array.
 *
 * @template T - The type of array elements
 * @param value - The value to check
 * @returns True if the value is an array
 *
 * @example
 * isArray([]);            // true
 * isArray([1, 2, 3]);     // true
 * isArray('array');       // false
 * isArray({ length: 0 }); // false
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Checks if a value is a "plain object" — an object created by the Object constructor or with a null prototype.
 * Returns true for object literals ({}) and Object.create(null).
 *
 * @param value - The value to check
 * @returns True if the value is a plain object
 *
 * @example
 * isPlainObject({});                  // true
 * isPlainObject({ a: 1 });            // true
 * isPlainObject(Object.create(null)); // true
 * isPlainObject(new Date());          // false
 * isPlainObject([]);                  // false
 * isPlainObject(null);                // false
 */
export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function assertEnv(
  value: string | undefined,
  entity?: string
): asserts value is string {
  if (!value)
    throw new Error(
      'Missing environment variable' + entity ? `: ${entity}` : ''
    );
}

export function requireEnv(value: string | undefined, entity?: string): string {
  assertEnv(value, entity);
  return value.trim();
}
