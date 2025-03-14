import axios from "axios";

const KakaoKey = import.meta.env.VITE_KAKAO_KEY;
export default function useGetAddress(
  location: {
    latitude: number;
    longitude: number;
  } | null,
  setAddress: (newAddress: object) => void
) {
  const getAddress = async () => {
    await axios
      .get(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${location?.longitude}&y=${location?.latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${KakaoKey}`,
            "Content-Type": "content-type: application/json;charset=UTF-8",
          },
        }
      )
      .then((res) => {
        const data = res.data.documents[1];
        const saveData = {
          depth_1: data.region_1depth_name,
          depth_2: data.region_2depth_name,
          depth_3: data.region_3depth_name,
        };
        setAddress(saveData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return getAddress;
}
