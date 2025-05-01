export default function CalculateSummerFeelTemperature(
  temp: string,
  humidity: string
): number {
  const T_C = Number(temp);
  const RH = Number(humidity);

  // 조건: 기온이 27°C 미만이거나 습도가 40% 미만이면 원래 기온 반환
  if (T_C < 27 || RH < 40) {
    return Math.round(T_C);
  }

  // 섭씨를 화씨로 변환
  const T = T_C * 9 / 5 + 32;

  // 화씨 기준 Heat Index 계산
  const HI_f =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T ** 2 -
    0.05481717 * RH ** 2 +
    0.00122874 * T ** 2 * RH +
    0.00085282 * T * RH ** 2 -
    0.00000199 * T ** 2 * RH ** 2;

  // 다시 섭씨로 변환
  const HI_C = (HI_f - 32) * 5 / 9;

  return Math.round(HI_C);
}
