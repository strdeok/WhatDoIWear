import axios from "axios";

interface LocationData {
  depth_1: string;
  depth_2: string;
  depth_3: string;
}

export default function useGetXY(
  address: {
    depth_1: string;
    depth_2: string;
    depth_3: string;
  },
  setXY: (newXY: object) => void
) {
  const getXY = async () => {
    await axios
      .get("/location.json")
      .then((res) => {
        const locationData = res.data.data;

        // Step 1: depth_3이 일치하는 항목 필터링
        let filtered = locationData.filter(
          (element: LocationData) => element.depth_3 === address.depth_3
        );

        // Step 2: depth_2가 일치하는 항목이 있으면 필터링
        if (filtered.length > 1) {
          const filteredByDepth2 = filtered.filter(
            (element: LocationData) => element.depth_2 === address.depth_2
          );
          if (filteredByDepth2.length > 0) {
            filtered = filteredByDepth2;
          }
        }

        // Step 3: depth_1까지 일치하는 항목이 있으면 필터링
        if (filtered.length > 1) {
          const filteredByDepth1 = filtered.filter(
            (element: LocationData) => element.depth_1 === address.depth_1
          );
          if (filteredByDepth1.length > 0) {
            filtered = filteredByDepth1;
          }
        }

        // 가장 최적의 결과 출력
        if (filtered.length > 0) {
          const getXY_value = { x: filtered[0].X, y: filtered[0].Y };
          setXY(getXY_value);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return getXY;
}
