export default function CalculateSummerFeelTemperature(
  temp: string,
  humidity: string
): number {
  const changedTemp = Number(temp);
  const changedHumidity = Number(humidity);

  return Math.round(
    -8.7847 +
      1.6114 * changedTemp +
      2.3385 * changedHumidity -
      0.1466 * changedTemp * changedHumidity -
      0.0123 * changedTemp ** 2 -
      0.0164 * changedHumidity ** 2 +
      0.0022 * changedTemp ** 2 * changedHumidity +
      0.0007 * changedTemp * changedHumidity ** 2 +
      0.0003 * changedTemp ** 2 * changedHumidity ** 2
  );
}
