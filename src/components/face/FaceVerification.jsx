import Webcam from "react-webcam";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

function FaceVerification({ onVerify }) {
  const webcamRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [faceVerified, setFaceVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        setModelsLoaded(true);
        console.log("✅ Face API Models Loaded");
      } catch (error) {
        console.error("❌ Model Loading Error:", error);
      }
    };

    loadModels();
  }, []);  
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

 const handleVerify = async () => {
    if (!modelsLoaded) {
    alert("Models are still loading. Please wait.");
    return;
}
  setLoading(true);

  try {
    const profileImg = document.getElementById("profile-photo");

    if (!profileImg) {
      alert("Profile image not found");
      setLoading(false);
      return;
    }

    const profileDetection = await faceapi
      .detectSingleFace(
        profileImg,
        new faceapi.TinyFaceDetectorOptions(
        {
            minConfidence: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    const capturedImg = new Image();
    capturedImg.src = capturedImage;

    await new Promise((resolve) => {
      capturedImg.onload = () => resolve();
    });

    const capturedDetection = await faceapi
    .detectSingleFace(
        capturedImg,
        new faceapi.TinyFaceDetectorOptions({
            minConfidence: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();


    const allFaces = await faceapi.detectAllFaces(
    capturedImg,
    new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.5,
    })
    );

    if (allFaces.length > 1) {
        alert("Only one face should be visible.");
        setLoading(false);
        return;
    }


    if (!profileDetection || !capturedDetection) {
      alert("Face not detected in one of the images.");
      setLoading(false);
      return;
    }

    const distance = faceapi.euclideanDistance(
      profileDetection.descriptor,
      capturedDetection.descriptor
    );

    if (distance < 0.6) {
  console.log("Match successful!");

  setFaceVerified(true);

  if (onVerify) {
    onVerify(true);
  }

  alert("✅ Face Match Successful");
} else {
      console.log("Match failed.");
      setFaceVerified(false);

      if (onVerify) {
        onVerify(false);
      }

      alert("❌ Face does not match");
    }

    setLoading(false);
  } catch (error) {
    console.error(error);
    setLoading(false);
  }
};

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">
        Face Verification
      </h2>

      {!capturedImage ? (
        <>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user",
            }}
            className="rounded-xl"
          />

          <button
            onClick={capture}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
          >
            Capture Face
          </button>
        </>
      ) : (
        <>
          <img
            src={capturedImage}
            alt="Captured"
            className="h-60 w-60 rounded-lg object-cover"
          />

          <p
            className={`mt-4 font-semibold ${
              faceVerified
                ? "text-green-600"
                : "text-yellow-600"
            }`}
          >
            {faceVerified
              ? "Face Verified Successfully"
              : "Verification Pending"}
          </p>

            {!faceVerified && (
            <button
            onClick={handleVerify}
            disabled={loading}
            className="mt-4 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
            {loading ? "Verifying..." : "Verify Face"}
            </button>
            )}
        </>
      )}
    </div>
  );
}

export default FaceVerification;