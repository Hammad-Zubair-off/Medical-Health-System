/**
 * Static geo options for address dropdowns (patient form, settings, etc.).
 * Replaces the deleted Content → Countries/States/Cities CMS pages.
 */

export interface GeoOption {
  value: string;
  label: string;
}

export const GEO_COUNTRIES: GeoOption[] = [
  { value: "USA", label: "USA" },
  { value: "Canada", label: "Canada" },
  { value: "UK", label: "UK" },
  { value: "Germany", label: "Germany" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "India", label: "India" },
  { value: "UAE", label: "UAE" },
  { value: "Australia", label: "Australia" },
];

/** Flat state list (kept simple for CommonSelect; not cascade-filtered). */
export const GEO_STATES: GeoOption[] = [
  { value: "California", label: "California" },
  { value: "Texas", label: "Texas" },
  { value: "New York", label: "New York" },
  { value: "Florida", label: "Florida" },
  { value: "Ontario", label: "Ontario" },
  { value: "British Columbia", label: "British Columbia" },
  { value: "England", label: "England" },
  { value: "Scotland", label: "Scotland" },
  { value: "Bavaria", label: "Bavaria" },
  { value: "Punjab", label: "Punjab" },
  { value: "Sindh", label: "Sindh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Dubai", label: "Dubai" },
  { value: "New South Wales", label: "New South Wales" },
];

export const GEO_CITIES: GeoOption[] = [
  { value: "Los Angeles", label: "Los Angeles" },
  { value: "San Francisco", label: "San Francisco" },
  { value: "Houston", label: "Houston" },
  { value: "New York City", label: "New York City" },
  { value: "Miami", label: "Miami" },
  { value: "Toronto", label: "Toronto" },
  { value: "Vancouver", label: "Vancouver" },
  { value: "London", label: "London" },
  { value: "Manchester", label: "Manchester" },
  { value: "Munich", label: "Munich" },
  { value: "Lahore", label: "Lahore" },
  { value: "Karachi", label: "Karachi" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Dubai City", label: "Dubai City" },
  { value: "Sydney", label: "Sydney" },
];

/** Legacy CommonSelect shape used across the template (includes a Select placeholder). */
export const Country: GeoOption[] = [
  { value: "Select", label: "Select" },
  ...GEO_COUNTRIES,
];

export const State: GeoOption[] = [
  { value: "Select", label: "Select" },
  ...GEO_STATES,
];

export const City: GeoOption[] = [
  { value: "Select", label: "Select" },
  ...GEO_CITIES,
];
