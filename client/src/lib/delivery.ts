export const nepalCities = {
  valley: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kirtipur'],
  major: ['Pokhara', 'Biratnagar', 'Birgunj', 'Butwal', 'Dharan', 'Hetauda', 'Itahari', 'Janakpur', 'Nepalgunj'],
  remote: ['Dhangadhi', 'Mahendranagar', 'Jumla', 'Rukum', 'Dolpa', 'Mustang', 'Humla', 'Taplejung'],
}

export const allCities = [
  ...nepalCities.valley,
  ...nepalCities.major,
  ...nepalCities.remote,
]

export function getDeliveryCharge(city: string): number {
  if (nepalCities.valley.includes(city)) return 100
  if (nepalCities.major.includes(city)) return 150
  return 200
}
