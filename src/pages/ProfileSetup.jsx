import { useRef, useState } from "react";
import Webcam from "react-webcam";

function ProfileSetup() {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-4 text-3xl font-bold">
        Complete Your Profile
      </h1>

      <p className="mb-6 text-slate-500">
        Capture a live photo before starting the interview.
      </p>

      {!image ? (
        <>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg"
          />

          <button
            onClick={capturePhoto}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-3 text-white"
          >
            Capture Photo
          </button>
        </>
      ) : (
        <>
          <img
            src={image}
            alt="Captured"
            className="h-60 w-60 rounded-lg object-cover"
          />

          <button
            onClick={() => setImage(null)}
            className="mt-4 rounded-lg bg-red-500 px-6 py-3 text-white"
          >
            Retake Photo
          </button>
        </>
      )}

      <button
        disabled={!image}
        className={`mt-6 rounded-lg px-6 py-3 text-white ${
          image
            ? "bg-green-600"
            : "bg-slate-400"
        }`}
      >
        Start Interview
      </button>
    </div>
  );
}

export default ProfileSetup;