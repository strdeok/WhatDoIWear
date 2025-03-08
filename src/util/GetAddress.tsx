import axios from "axios";
import { RefObject } from "react";

const KakaoKey = import.meta.env.VITE_KAKAO_KEY;
export default function useGetAddress(
  locationRef: RefObject<{
    latitude: number;
    longitude: number;
  }>,
  setAddress: (newAddress: object) => void
) {
  const getAddress = async () => {
    await axios
      .get(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${locationRef.current.longitude}&y=${locationRef.current.latitude}`,
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
