import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, RotateCcw, CheckCircle2, UserRound } from 'lucide-react'

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
}

function ProfilePhotoCapture({ image, onCapture, onRetake }) {
  const webcamRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot()
    if (screenshot) onCapture(screenshot)
  }, [onCapture])

  return (
    <div>
      <p className="mb-3 text-[13px] text-slate-400">
        {image ? 'Photo captured' : 'Camera access required'}
      </p>

      <div className="relative overflow-hidden rounded-xl bg-slate-950 ring-1 ring-slate-900/10">
        {!image ? (
          <>
            {!cameraReady && !cameraError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-300">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
                <p className="text-[13px]">Starting camera…</p>
              </div>
            )}

            {cameraError ? (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
                <UserRound className="h-10 w-10 text-slate-500" />
                <p className="text-[13px] text-slate-300">{cameraError}</p>
                <p className="text-[12px] text-slate-500">
                  Allow camera access in your browser, then refresh.
                </p>
              </div>
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                screenshotQuality={0.92}
                videoConstraints={videoConstraints}
                onUserMedia={() => {
                  setCameraReady(true)
                  setCameraError('')
                }}
                onUserMediaError={() => {
                  setCameraReady(false)
                  setCameraError('Camera access was blocked or unavailable.')
                }}
                className="aspect-video w-full object-cover"
              />
            )}

            {!cameraError && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[72%] w-[48%] rounded-[40%] border border-white/25 shadow-[0_0_0_9999px_rgba(2,6,23,0.28)]" />
              </div>
            )}
          </>
        ) : (
          <div className="relative aspect-video">
            <img src={image} alt="Captured profile" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 py-3">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-white">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Looking good — photo saved
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {!image ? (
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!cameraReady || !!cameraError}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 active:translate-y-0 active:scale-[0.98] active:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0"
          >
            <Camera className="h-4 w-4" />
            Capture photo
          </button>
        ) : (
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:translate-y-0 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Retake
          </button>
        )}
      </div>
    </div>
  )
}

export default ProfilePhotoCapture
