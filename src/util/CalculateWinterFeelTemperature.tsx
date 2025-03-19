export default function CalculateWinterFeelTemperature(
  temp: string,
  windSpeed: string
): number {
  const changedTemp = Number(temp);
  const changedWind = Number(windSpeed)
  if (changedTemp > 10 || changedWind < 1.3) return changedTemp; // 체감온도 공식 적용 안됨

  return Math.round(
    13.12 +
      0.6215 * changedTemp -
      11.37 * Math.pow(changedWind, 0.16) +
      0.3965 * changedTemp * Math.pow(changedWind, 0.16)
  );
}
