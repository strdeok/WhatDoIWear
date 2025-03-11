export default function CalculateSummerFeelTemperature(
  temp: number,
  humidity: number
): number {
  return Math.round(
    -8.7847 +
      1.6114 * temp +
      2.3385 * humidity -
      0.1466 * temp * humidity -
      0.0123 * temp ** 2 -
      0.0164 * humidity ** 2 +
      0.0022 * temp ** 2 * humidity +
      0.0007 * temp * humidity ** 2 +
      0.0003 * temp ** 2 * humidity ** 2
  );
}
