import { Dispatch, SetStateAction } from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";

interface ModalProps {
  setActiveModal: Dispatch<SetStateAction<boolean>>; // setActiveModal의 타입을 명시
}

export default function Modal({ setActiveModal }: ModalProps) {
  return (
    <div className="absolute bg-white text-black border border-black rounded-xl p-3 left-0">
      <p
        className="float-right"
        onClick={() => {
          setActiveModal(false);
        }}
      >
        <IoMdClose />
      </p>
      <div className="float-end">
        <p>옷차림은 02시에 발표된 오늘의 최고 기온을 기준으로 합니다.</p>
        <p>예보는 실시간으로 바뀔 수 있으니 참고자료로만 사용해주세요.</p>
      </div>
    </div>
  );
}
