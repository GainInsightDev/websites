/**
 * Sample unit test - replace with your own tests.
 *
 * Location: tests/unit/sample.test.ts
 * Run: npm run test:unit
 */
describe('Sample Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('hello');
    expect(result).toBe('hello');
  });

  // Remove this file after adding real tests
});
