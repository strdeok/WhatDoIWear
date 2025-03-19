import axios from "axios";

const KakaoKey = import.meta.env.VITE_KAKAO_KEY;
export default async function useGetAddress(location: {
  latitude: number;
  longitude: number;
}) {
  try {
    const res = await axios.get(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${location?.longitude}&y=${location?.latitude}`,
      {
        headers: {
          Authorization: `KakaoAK ${KakaoKey}`,
          "Content-Type": "content-type: application/json;charset=UTF-8",
        },
      }
    );

    const data = res.data.documents[1];

    if (!data) {
      console.error("주소 데이터를 찾을 수 없음");
      return null;
    }

    const saveData = {
      depth_1: data.region_1depth_name,
      depth_2: data.region_2depth_name,
      depth_3: data.region_3depth_name,
    };
    return saveData;
  } catch (error) {
    console.log(error);
    return null;
  }
}
