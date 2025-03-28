import { Suspense, useEffect, useState } from "react";
import { useStore } from "./zustand/state";
import { IoIosInformationCircleOutline } from "@react-icons/all-files/io/IoIosInformationCircleOutline";
import Loading from "./components/Loading";
import Modal from "./components/Modal";
import useGetAddress from "./util/GetAddress";
import useGetXY from "./util/GetXY";
import GetMicroDust from "./components/GetMicroDust";
import GetKakaoMap from "./util/GetKakaoMap";
import NowWeather from "./components/NowWeather";
import TodayWeather from "./components/TodayWeather";
import RecommendedClothes from "./components/RecommendClothes";

function App() {
  const { setXY, address, setAddress, active, setActive }: any = useStore(); // zustand 변수

  // react 훅
  const [activeModal, setActiveModal] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // const [loading, setLoading] = useState(false);

  const school = "송도1동";
  const schoolLocation = { latitude: 37.376786, longitude: 126.634701 };

  useEffect(() => {
    console.log(`.           |
　╲　　　　　　　　　　　╱
　　　　　　　　　/
　　　╲　　　　　　　　╱
　　╲　　    설마...　　　╱
-　-　　　제 목소리가　　-　-　-
　　╱　   들리시나요?　　╲
　╱　　/               .
　　╱　　　　　　　　╲
　　　　　/　|　　　
　　　　　　　.`);
    console.log("source code: https://github.com/strdeok/WhatDoIWear");
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let currentLocation = schoolLocation;

        if (active === "school") {
          setLocation(currentLocation);
        } else if (!sessionStorage.getItem("location")) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          sessionStorage.setItem("location", JSON.stringify(currentLocation));

          setLocation(currentLocation);
        } else {
          const storedLocation = JSON.parse(
            sessionStorage.getItem("location") as string
          );

          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );

          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          if (
            storedLocation.latitude !== newLocation.latitude ||
            storedLocation.longitude !== newLocation.longitude
          ) {
            sessionStorage.setItem("location", JSON.stringify(newLocation));
            sessionStorage.removeItem("todayWeather"); // 위치가 달라지면 오늘의 날씨를 구하는 곳도 달라지기 때문
            setLocation(newLocation);
          } else {
            setLocation(storedLocation);
          }
        }
      } catch (error) {}
    };

    fetchLocation();
  }, [active]);

  useEffect(() => {
    if (!location) return;

    const getAddressData = new Promise((resolve, reject) => {
      useGetAddress(location)
        .then((addressData) => {
          resolve(addressData);
        })
        .catch((error) => {
          console.error("주소 데이터 가져오기 실패:", error);
          reject(error);
        });
    });

    getAddressData
      .then((address): Promise<{ x: number; y: number }> => {
        const typedAddress = address as {
          depth_1: string;
          depth_2: string;
          depth_3: string;
        };

        setAddress(typedAddress);
        return useGetXY(typedAddress);
      })
      .then((xy: { x: number; y: number }) => {
        setXY(xy);
      });
  }, [location]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative w-full h-full pb-16 flex flex-col items-center justify-center text-center text-white  bg-gradient-to-b from-[#62c1e5] to-[#20a7db] overflow-x-hidden min-h-[45rem]">
        <main
          className="relative flex flex-col w-full max-w-xs items-center justify-center gap-8 border-2 p-10 rounded-xl shadow-2xl mt-10 
        "
        >
          <GetKakaoMap location={location} />
          <div>
            <div>{active === "now" ? address.depth_3 : school}</div>
            <NowWeather />
          </div>

          <div>
            <GetMicroDust address={address} />
          </div>

          <TodayWeather />

          <div>
            <div className="flex flex-row items-center">
              <div className="text-xl mr-2">추천 옷차림</div>
              <div
                onClick={() => {
                  setActiveModal(true);
                }}
              >
                <IoIosInformationCircleOutline />
              </div>
            </div>
            {activeModal ? <Modal setActiveModal={setActiveModal} /> : null}

            <RecommendedClothes />
          </div>
        </main>

        <div className="max-w-xs mt-14 w-full flex flex-row gap-3 justify-between">
          <button
            className={`border rounded-lg p-2 shadow-md w-1/2 ${
              active == "now" ? "bg-[#1a81a9] border-none" : "border-white"
            }`}
            onClick={() => {
              if (active === "school") {
                setActive("now");
                // setLoading(true);
              }
            }}
          >
            현재 지역 날씨
          </button>

          <button
            className={`border rounded-lg p-2 shadow-md w-1/2 ${
              active != "now" ? "bg-[#1a81a9] border-none" : "border-white"
            }`}
            onClick={() => {
              if (active === "now") {
                setActive("school");
                // setLoading(true);
              }
            }}
          >
            현재 학교 날씨
          </button>
        </div>

        <footer className="text-xs text-blue-300 mt-8">
          <p>출처: 기상청 | 한국환경공단 | 카카오 API</p>
          <a href="https://open.kakao.com/o/sEt8gDlh">
            문의: https://open.kakao.com/o/sEt8gDlh
          </a>
        </footer>
      </div>
    </Suspense>
  );
}

export default App;
