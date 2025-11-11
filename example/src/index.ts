/**
 * Example TypeScript library for demonstrating typedoc-mintlify
 * @packageDocumentation
 */

/**
 * Configuration options for API requests
 */
export interface RequestOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Retry policy configuration */
  retry?: {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Delay between retries in milliseconds */
    delay: number;
  };
}

/**
 * Represents a user in the system
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** Timestamp when the user was created */
  createdAt: Date;
  /** Whether the user account is active */
  isActive: boolean;
}

/**
 * Result of a user operation
 */
export type UserResult = { success: true; user: User } | { success: false; error: string };

/**
 * Fetches user data from the API
 *
 * @param userId - The unique identifier for the user
 * @param options - Optional request configuration
 * @returns A promise that resolves to the user data
 * @throws {Error} When the user is not found or the request fails
 *
 * @example
 * Basic usage:
 * ```typescript
 * const user = await fetchUser('user-123');
 * console.log(user.name);
 * ```
 *
 * @example
 * With custom options:
 * ```typescript
 * const user = await fetchUser('user-123', {
 *   timeout: 5000,
 *   retry: { maxAttempts: 3, delay: 1000 }
 * });
 * ```
 */
export async function fetchUser(userId: string, options?: RequestOptions): Promise<User> {
  // Implementation would go here
  throw new Error('Not implemented');
}

/**
 * Creates a new user in the system
 *
 * @param name - The user's display name
 * @param email - The user's email address
 * @param options - Optional request configuration
 * @returns A promise that resolves to the result of the operation
 *
 * @remarks
 * This function validates the email format before creating the user.
 * The user account is created as active by default.
 *
 * @example
 * ```typescript
 * const result = await createUser('John Doe', 'john@example.com');
 * if (result.success) {
 *   console.log('User created:', result.user.id);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 * ```
 */
export async function createUser(
  name: string,
  email: string,
  options?: RequestOptions
): Promise<UserResult> {
  // Implementation would go here
  throw new Error('Not implemented');
}

/**
 * A service class for managing users
 *
 * @remarks
 * This class provides a high-level interface for user management operations.
 * It handles caching, error handling, and retry logic automatically.
 */
export class UserService {
  private cache: Map<string, User> = new Map();

  /**
   * Creates a new UserService instance
   *
   * @param apiKey - API key for authentication
   * @param baseUrl - Base URL for the API (defaults to production)
   */
  constructor(
    private apiKey: string,
    private baseUrl: string = 'https://api.example.com'
  ) {}

  /**
   * Retrieves a user by ID with caching
   *
   * @param userId - The user ID to fetch
   * @returns The user object if found
   *
   * @example
   * ```typescript
   * const service = new UserService('api-key-123');
   * const user = await service.getUser('user-123');
   * ```
   */
  async getUser(userId: string): Promise<User> {
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    const user = await fetchUser(userId);
    this.cache.set(userId, user);
    return user;
  }

  /**
   * Clears the user cache
   *
   * @remarks
   * Call this method when you need to invalidate cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets the current cache size
   *
   * @returns The number of cached users
   */
  get cacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Error types that can be thrown by the API
 */
export enum ApiErrorType {
  /** The requested resource was not found */
  NOT_FOUND = 'NOT_FOUND',
  /** Authentication failed */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Rate limit exceeded */
  RATE_LIMITED = 'RATE_LIMITED',
  /** Server error occurred */
  SERVER_ERROR = 'SERVER_ERROR',
  /** Invalid request parameters */
  INVALID_REQUEST = 'INVALID_REQUEST',
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  /**
   * Creates a new ApiError
   *
   * @param type - The type of error
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code
   */
  constructor(
    public type: ApiErrorType,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
