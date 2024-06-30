import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Input } from "@/components/ui/input";

interface SubscribeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({
  url,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [loginError, setLoginError] = useState<string>("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!/\S+@\S+\.\S+/.test(e.target.value)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleSubscribe = async () => {
    if (!emailError && email) {
      try {
        const modifiedUrl = url.replace(
          /^https:\/\/paragraph\.xyz\/@([^/]+)\/.*$/,
          "https://paragraph.xyz/api/blogs/@$1/subscribe"
        );

        console.log(`modifiedUrl: ${modifiedUrl}`);

        await axios.post(modifiedUrl, { email });

        alert("Subscribed successfully!");
        setEmail("");
        onClose();
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.msg &&
          error.response.data.msg.startsWith("You're logged out")
        ) {
          setLoginError(
            "You're logged out, please log in using the following link:"
          );
        } else {
          console.error("Subscription failed:", error);
          alert("Subscription failed. Please try again later.");
        }
      }
    } else {
      setEmailError("Please enter a valid email address.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-1/4">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Subscribe</h2>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4 mt-4">
          {/* <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            className="w-full p-2 border rounded mb-2 ring-none focus:ring-none"
          /> */}
          <Input
            type="email"
            value={email}
            placeholder="Enter your email"
            className="w-full h-12"
            onChange={handleEmailChange}
          />
          {emailError && (
            <p className="text-red-500 text-sm mb-2">{emailError}</p>
          )}
          <button
            className={`w-full bg-gray-400 text-white py-2 mt-4 rounded ${
              !email || emailError ? "cursor-not-allowed" : ""
            }`}
            onClick={handleSubscribe}
            disabled={!email || !!emailError}
          >
            Subscribe
          </button>
          {loginError && (
            <div className="mt-4 text-center">
              <p className="text-red-500 mb-2">{loginError}</p>
              <a
                href={"https://paragraph.xyz"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Log in here
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
