import { calculateDeliveryCharge } from './deliveryCharge';

describe('calculateDeliveryCharge', () => {
  describe('Kathmandu Valley cities (Rs.100)', () => {
    it('should return 100 for Kathmandu', () => {
      expect(calculateDeliveryCharge('Kathmandu')).toBe(100);
    });

    it('should return 100 for Lalitpur', () => {
      expect(calculateDeliveryCharge('Lalitpur')).toBe(100);
    });

    it('should return 100 for Bhaktapur', () => {
      expect(calculateDeliveryCharge('Bhaktapur')).toBe(100);
    });

    it('should be case-insensitive', () => {
      expect(calculateDeliveryCharge('KATHMANDU')).toBe(100);
      expect(calculateDeliveryCharge('kathmandu')).toBe(100);
      expect(calculateDeliveryCharge('KaThMaNdU')).toBe(100);
    });

    it('should handle leading/trailing whitespace', () => {
      expect(calculateDeliveryCharge('  Kathmandu  ')).toBe(100);
    });
  });

  describe('Major cities (Rs.150)', () => {
    it('should return 150 for Pokhara', () => {
      expect(calculateDeliveryCharge('Pokhara')).toBe(150);
    });

    it('should return 150 for Biratnagar', () => {
      expect(calculateDeliveryCharge('Biratnagar')).toBe(150);
    });

    it('should return 150 for Birgunj', () => {
      expect(calculateDeliveryCharge('Birgunj')).toBe(150);
    });

    it('should return 150 for Dharan', () => {
      expect(calculateDeliveryCharge('Dharan')).toBe(150);
    });

    it('should return 150 for Butwal', () => {
      expect(calculateDeliveryCharge('Butwal')).toBe(150);
    });

    it('should return 150 for Nepalgunj', () => {
      expect(calculateDeliveryCharge('Nepalgunj')).toBe(150);
    });
  });

  describe('Remote areas (Rs.200)', () => {
    it('should return 200 for unknown cities', () => {
      expect(calculateDeliveryCharge('Jumla')).toBe(200);
    });

    it('should return 200 for remote areas', () => {
      expect(calculateDeliveryCharge('Humla')).toBe(200);
      expect(calculateDeliveryCharge('Dolpa')).toBe(200);
      expect(calculateDeliveryCharge('Mustang')).toBe(200);
    });
  });

  describe('Return value properties', () => {
    it('should always return a non-negative number', () => {
      const cities = ['Kathmandu', 'Pokhara', 'Jumla', 'RandomPlace'];
      for (const city of cities) {
        expect(calculateDeliveryCharge(city)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should always return one of the defined tiers', () => {
      const validTiers = [100, 150, 200];
      const cities = ['Kathmandu', 'Lalitpur', 'Pokhara', 'Birgunj', 'Jumla', 'SomeVillage'];
      for (const city of cities) {
        expect(validTiers).toContain(calculateDeliveryCharge(city));
      }
    });
  });
});
