import "./loading.css";

export default function Loading() {
  return (
    <div className="absolute bg-black bg-opacity-75 w-full h-full top-0 z-10 flex flex-col items-center justify-center gap-4">
      <span className="loadingCloud"></span>
      <span className="loader">날씨를 불러오는 중</span>
    </div>
  );
}
