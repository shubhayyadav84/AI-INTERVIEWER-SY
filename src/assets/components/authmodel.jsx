import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Auth from "../../pages/auth";

function AuthModel({ onClose }) {
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md z-10">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white transition-colors z-50 text-xl font-medium cursor-pointer"
        >
          ✕
        </button>
        <Auth isModal={true} />
      </div>
    </div>
  );
}

export default AuthModel;