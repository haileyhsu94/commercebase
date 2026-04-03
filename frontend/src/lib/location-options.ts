/** Curated lists for searchable country / city selectors (expand or replace with API in production). */

export const COUNTRIES: readonly string[] = `Afghanistan
Albania
Algeria
Argentina
Australia
Austria
Bangladesh
Belgium
Brazil
Bulgaria
Cambodia
Canada
Chile
China
Colombia
Croatia
Czech Republic
Denmark
Egypt
Estonia
Finland
France
Germany
Ghana
Greece
Hong Kong
Hungary
Iceland
India
Indonesia
Ireland
Israel
Italy
Japan
Kenya
Latvia
Lithuania
Luxembourg
Malaysia
Mexico
Morocco
Netherlands
New Zealand
Nigeria
Norway
Pakistan
Peru
Philippines
Poland
Portugal
Romania
Saudi Arabia
Singapore
Slovakia
Slovenia
South Africa
South Korea
Spain
Sweden
Switzerland
Taiwan
Thailand
Turkey
Ukraine
United Arab Emirates
United Kingdom
United States
Vietnam`.split("\n")

export const CITIES: readonly string[] = `Amsterdam
Atlanta
Auckland
Austin
Barcelona
Beijing
Berlin
Boston
Brussels
Bucharest
Budapest
Buenos Aires
Cairo
Chicago
Copenhagen
Dallas
Delhi
Denver
Detroit
Dubai
Dublin
Edinburgh
Frankfurt
Guangzhou
Hamburg
Helsinki
Ho Chi Minh City
Hong Kong
Houston
Istanbul
Jakarta
Johannesburg
Karachi
Kuala Lumpur
Lagos
Lisbon
London
Los Angeles
Lyon
Madrid
Manila
Melbourne
Mexico City
Miami
Milan
Montreal
Moscow
Mumbai
Munich
Nairobi
New York
Osaka
Paris
Philadelphia
Phoenix
Prague
Rio de Janeiro
Rome
San Francisco
Santiago
São Paulo
Seattle
Seoul
Shanghai
Singapore
Stockholm
Sydney
Taipei
Tel Aviv
Tokyo
Toronto
Vancouver
Vienna
Warsaw
Washington
Zurich`.split("\n")

/** Ensures the current value appears in the list (e.g. legacy free-text saved in localStorage). */
export function withOrphanOption(
  options: readonly string[],
  current: string | undefined
): string[] {
  const v = current?.trim()
  if (!v) return [...options]
  if (options.some((o) => o.toLowerCase() === v.toLowerCase())) return [...options]
  return [v, ...options]
}
