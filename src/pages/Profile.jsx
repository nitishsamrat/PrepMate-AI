import { Mail, CheckCircle } from "lucide-react";
import FaceVerification from "../components/face/FaceVerification";
import { useState } from "react";

function Profile() {
  const [faceVerified, setFaceVerified] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">

        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          My Profile
        </h1>

        <div className="flex flex-col items-center gap-6 md:flex-row">

          {/* Profile Photo */}
          <div>
            <img
              id="profile-photo"
              src="rrk.png"
              alt="Profile"
              className="h-44 w-44 rounded-full border-4 border-indigo-500 object-cover"
            />
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-900">
              Candidate Name
            </h2>

            <p className="mt-2 flex items-center gap-2 text-slate-600">
              <Mail size={18} />
              user@gmail.com
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                <span>Profile Photo Verified</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                <span>Documents Verified</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="text-yellow-500" size={20} />
                <span>
                    {faceVerified
                        ? "Face Verified Successfully"
                        : "Face Verification Pending"}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Status Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm text-slate-500">Profile Status</p>
            <p className="font-semibold text-green-600">Verified</p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-slate-500">Documents</p>
            <p className="font-semibold text-blue-600">Verified</p>
          </div>

          <div className="rounded-xl bg-yellow-50 p-4">
            <p className="text-sm text-slate-500">Face Match</p>
            <p
                className={`font-semibold ${
                    faceVerified
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
                >
                {faceVerified ? "Matched" : "Pending"}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-sm text-slate-500">Interview Access</p>
            <p 
            className={`font-semibold ${
                faceVerified
                ? "text-green-600"
                : "text-red-600"
        }`}
     >
    {faceVerified ? "Unlocked" : "Locked"}</p>
          </div>
        </div>

      </div>

      {/* Face Verification Component */}
      <div className="mx-auto mt-8 max-w-4xl">
        <FaceVerification
            onVerify={(verified) => {
            setFaceVerified(verified);
            }}
        />
    </div>

    </div>
  );
}

export default Profile;