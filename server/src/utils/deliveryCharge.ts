/**
 * Delivery charge calculation based on city tiers.
 *
 * Tier 1 - Kathmandu Valley (Rs.100): Kathmandu, Lalitpur, Bhaktapur
 * Tier 2 - Major cities (Rs.150): Pokhara, Biratnagar, Birgunj, Dharan, Butwal, Hetauda, Bharatpur, Nepalgunj, etc.
 * Tier 3 - Remote areas (Rs.200): Everything else
 */

const KATHMANDU_VALLEY_CHARGE = 100;
const MAJOR_CITY_CHARGE = 150;
const REMOTE_AREA_CHARGE = 200;

const kathmanduValleyCities: string[] = [
  'kathmandu',
  'lalitpur',
  'bhaktapur',
];

const majorCities: string[] = [
  'pokhara',
  'biratnagar',
  'birgunj',
  'dharan',
  'butwal',
  'hetauda',
  'bharatpur',
  'nepalgunj',
  'dhangadhi',
  'janakpur',
  'itahari',
  'banepa',
  'tulsipur',
  'siddharthanagar',
  'ghorahi',
  'kirtipur',
  'lahan',
  'rajbiraj',
  'damak',
];

/**
 * Calculates the delivery charge based on the delivery city.
 *
 * @param city - The delivery city name (case-insensitive)
 * @returns The delivery charge in NPR (100, 150, or 200)
 *
 * @precondition city is a non-empty string
 * @postcondition returns a non-negative number that is one of the defined tiers
 */
export function calculateDeliveryCharge(city: string): number {
  const normalizedCity = city.trim().toLowerCase();

  if (kathmanduValleyCities.includes(normalizedCity)) {
    return KATHMANDU_VALLEY_CHARGE;
  }

  if (majorCities.includes(normalizedCity)) {
    return MAJOR_CITY_CHARGE;
  }

  return REMOTE_AREA_CHARGE;
}
