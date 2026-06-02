import { generateOrderNumber } from './orderNumber';

describe('generateOrderNumber', () => {
  it('should match the format NJ-YYYYMMDD-XXXX', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^NJ-\d{8}-[A-Z0-9]{4}$/);
  });

  it('should start with NJ- prefix', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber.startsWith('NJ-')).toBe(true);
  });

  it('should contain a valid date portion', () => {
    const orderNumber = generateOrderNumber();
    const datePart = orderNumber.split('-')[1];
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6));
    const day = parseInt(datePart.substring(6, 8));

    expect(year).toBeGreaterThanOrEqual(2024);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });

  it('should have a 4-character alphanumeric random suffix', () => {
    const orderNumber = generateOrderNumber();
    const parts = orderNumber.split('-');
    const randomPart = parts[2];
    expect(randomPart).toHaveLength(4);
    expect(randomPart).toMatch(/^[A-Z0-9]{4}$/);
  });

  it('should generate different order numbers on successive calls', () => {
    const numbers = new Set<string>();
    for (let i = 0; i < 100; i++) {
      numbers.add(generateOrderNumber());
    }
    // With 36^4 = 1,679,616 possible combinations, 100 calls should all be unique
    expect(numbers.size).toBe(100);
  });
});
