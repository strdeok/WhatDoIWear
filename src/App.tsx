import { lazy, useEffect, useState } from "react";
import { useStore } from "./zustand/state";
import { IoIosInformationCircleOutline } from "@react-icons/all-files/io/IoIosInformationCircleOutline";
import Loading from "./components/Loading";
import Modal from "./components/Modal";
import useGetAddress from "./util/GetAddress";
import useGetXY from "./util/GetXY";
import GetMicroDust from "./components/GetMicroDust";
import GetKakaoMap from "./util/GetKakaoMap";

const NowWeather = lazy(() => import("./components/NowWeather"));
const TodayWeather = lazy(() => import("./components/TodayWeather"));
const RecommendedClothes = lazy(() => import("./components/RecommendClothes"));

function App() {
  const { location, setXY, address, setAddress, fetchLocation }: any =
    useStore(); // zustand 변수

  // react 훅
  const [activeModal, setActiveModal] = useState(false);

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
    fetchLocation();
  }, []);

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

  if (!location || !address) {
    return <Loading />;
  }

  return (
    <div className="relative w-full h-full pb-16 flex flex-col items-center justify-center text-center text-white  bg-gradient-to-b from-[#62c1e5] to-[#20a7db] overflow-x-hidden min-h-[45rem]">
      <main
        className="relative flex flex-col w-full max-w-xs items-center justify-center gap-8 border-2 p-10 rounded-xl shadow-2xl mt-10 
      "
      >
        <GetKakaoMap location={location} />
        <div>
          <div>{address.depth_3}</div>
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

      <footer className="text-xs text-blue-300 mt-8">
        <p>출처: 기상청 | 한국환경공단 | 카카오 API</p>
        <a href="https://open.kakao.com/o/sEt8gDlh">
          문의: https://open.kakao.com/o/sEt8gDlh
        </a>
      </footer>
    </div>
  );
}

export default App;
