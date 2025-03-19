import { MutableRefObject, useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface Location {
  latitude: number;
  longitude: number;
}

export default function GetKakaoMap({
  location,
}: {
  location: Location | null;
}) {
  const mapRef = useRef<HTMLElement | null>(null);

  const initMap = () => {
    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(
        location?.latitude,
        location?.longitude
      ),
      level: 3,
    };

    // 마커가 표시될 위치입니다
    const markerPosition = new window.kakao.maps.LatLng(
      location?.latitude,
      location?.longitude
    );

    // 마커를 생성합니다
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });

    // 맵 생성성
    const map = new window.kakao.maps.Map(container as HTMLElement, options);
    (mapRef as MutableRefObject<any>).current = map;
    marker.setMap(map);
  };

  useEffect(() => {
    if (location?.latitude !== 0 && location?.longitude !== 0) {
      window.kakao.maps.load(() => initMap());
    }
  }, [location, mapRef]);
  return <div id="map" className="w-full h-40 rounded-lg"></div>;
}
