/** A column is headed by its saved scenario's title, or by its end year when it has none. */
export default function columnHeading(title: string | null, endYear: number): string {
  return title ?? String(endYear);
}
