export default function CalculateWinterFeelTemperature(
  temp: number,
  windSpeed: number
): number {
  if (temp > 10 || windSpeed < 1.3) return temp; // 체감온도 공식 적용 안됨

  return (
    Math.round(13.12 +
    0.6215 * temp -
    11.37 * Math.pow(windSpeed, 0.16) +
    0.3965 * temp * Math.pow(windSpeed, 0.16))
  )
}
