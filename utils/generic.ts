// Generic helper functions for the test framework

/**
 * Generate a unique test identifier
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate test data with unique identifiers
 */
export function generateUniqueTestData(prefix: string = 'Test'): {
  title: string;
  body: string;
  timestamp: string;
} {
  const timestamp = new Date().toISOString();
  const uniqueId = generateTestId();
  
  return {
    title: `${prefix} Post - ${uniqueId}`,
    body: `This is a test post created at ${timestamp} with ID: ${uniqueId}`,
    timestamp
  };
}

/**
 * Wait for a specified amount of time (useful for API rate limiting)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random user ID between 1 and 10
 */
export function getRandomUserId(): number {
  return Math.floor(Math.random() * 10) + 1;
}

/**
 * Generate test payload with unique data
 */
export function generateTestPostPayload(title?: string, body?: string, userId?: number) {
  const testData = generateUniqueTestData();
  
  return {
    title: title || testData.title,
    body: body || testData.body,
    userId: userId || getRandomUserId()
  };
}

/**
 * Validate that a value is a positive integer
 */
export function isValidPostId(id: any): boolean {
  return typeof id === 'number' && id > 0 && Number.isInteger(id);
}

/**
 * Clean string for logging (remove sensitive data if any)
 */
export function sanitizeForLogging(data: any): string {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

/**
 * Generate random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if running in CI environment
 */
export function isRunningInCI(): boolean {
  return !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.JENKINS_URL);
}

export const testHelpers = {
  generateTestId,
  generateUniqueTestData,
  delay,
  getRandomUserId,
  generateTestPostPayload,
  isValidPostId,
  sanitizeForLogging,
  generateRandomString,
  isRunningInCI
};
