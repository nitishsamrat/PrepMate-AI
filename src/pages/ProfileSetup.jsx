import { useState } from "react";

function ProfileSetup() {
  const [image, setImage] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-4 text-3xl font-bold">
        Complete Your Profile
      </h1>

      <p className="mb-6 text-slate-500">
        Upload your profile photo before starting the interview.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
      />

      {image && (
        <img
          src={image}
          alt="profile"
          className="mt-4 h-40 w-40 rounded-full object-cover"
        />
      )}

      <button
        disabled={!image}
        className={`mt-6 rounded-lg px-6 py-3 text-white ${
          image
            ? "bg-indigo-600"
            : "bg-slate-400"
        }`}
      >
        Start Interview
      </button>
    </div>
  );
}

export default ProfileSetup;
