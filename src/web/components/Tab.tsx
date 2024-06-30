"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faArrowUpRightFromSquare,
  faThumbsUp as faThumbsUpHover,
} from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp } from "@fortawesome/free-regular-svg-icons";
import { useNeynarContext } from "@neynar/react";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SubscribeModal from "@/components/SubscribeModal";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

dayjs.extend(relativeTime);

const Tab = () => {
  const supabase = createClient();
  const { user } = useNeynarContext();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerTab user={user} supabase={supabase} />
    </Suspense>
  );
};

const InnerTab = ({ user, supabase }: { user: any; supabase: any }) => {
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("Following");
  const [castLink, setCastLink] = useState<string>("");
  const [error, setError] = useState(null);
  const [casts, setCasts] = useState<any[]>([]);
  const [url, setUrl] = useState<string>("");
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] =
    useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const [castHashs, setCastHashs] = useState<string[]>([]);
  const [castPoints, setCastPoints] = useState<{ [key: string]: number }>({});
  const [pointModal, setPointModal] = useState<{ [key: string]: boolean }>({});

  const modalRef = useRef(null);

  const openSubscribeModal = () => setIsSubscribeModalOpen(true);
  const closeSubscribeModal = () => setIsSubscribeModalOpen(false);

  const handleIconClick = (hash: string) => {
    setPointModal((prevState) => ({
      ...prevState,
      [hash]: !prevState[hash],
    }));
  };

  const handleClickOutside = (event: any) => {
    if (
      modalRef.current &&
      (modalRef.current as HTMLElement).contains &&
      !(modalRef.current as HTMLElement).contains(event.target)
    ) {
      setPointModal({});
    }
  };

  const handlePublishCast = async () => {
    try {
      await axios.post<{ message: string }>("/api/cast", {
        signerUuid: user?.signer_uuid,
        text: castLink,
      });
      alert("Cast Published!");
      setCastLink("");
    } catch (err) {
      const { message } = (err as AxiosError).response?.data as any;
      alert(message);
    }
  };

  const fetchCasts = useCallback(async () => {
    let casts = [];
    let castHashs = [];
    if (searchParams.get("channel") === "paragraph") {
      const response = await axios.get(
        `/api/cast-channel?channel=${searchParams.get("channel")}`
      );
      console.log(`response: ${JSON.stringify(response)}`);
      casts = response.data.casts || [];
      castHashs = casts.map((cast: any) => cast.hash);
    } else {
      const response = await axios.get("/api/cast-link");
      casts = response.data.casts || [];
      castHashs = casts.map((cast: any) => cast.hash);
    }
    setCasts(casts);
    setCastHashs(castHashs);
  }, [searchParams]);

  const getCastsPoint = useCallback(async () => {
    const { data: fuzzle_point, error } = await supabase
      .from("fuzzle_cast")
      .select("*")
      .in("hash", castHashs);

    if (fuzzle_point && fuzzle_point.length > 0) {
      setCastPoints(
        fuzzle_point.reduce((acc: any, cast: any) => {
          acc[cast.hash] = cast.point || 0;
          return acc;
        }, {})
      );
    }

    if (error) {
      console.error(error);
    }
  }, [castHashs, supabase]);

  const updateCastPoint = async (hash: string, point: number, currentPoint: number) => {
    const { data: fuzzle_point_data } = await supabase
      .from("fuzzle_point")
      .select("*")
      .eq("fid", Number(user?.fid));
    if (
      fuzzle_point_data &&
      fuzzle_point_data[0] &&
      fuzzle_point_data[0].point
    ) {
      await supabase
        .from("fuzzle_point")
        .update({ point: fuzzle_point_data[0].point - point })
        .eq("fid", Number(user?.fid))
        .select();
      const { data, error } = await supabase
        .from("fuzzle_cast")
        .upsert({ hash, point: currentPoint + point })
        .select();
      if (error) {
        console.error(error);
      }
      if (data) {
        setCastPoints({ ...castPoints, [hash]: currentPoint + point });
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchCasts();
  }, [searchParams, fetchCasts]);

  useEffect(() => {
    if (casts.length === 0) fetchCasts();
    if (Object.keys(castPoints).length === 0) getCastsPoint();
  }, [castHashs, castPoints, casts.length, fetchCasts, getCastsPoint]);

  return (
    <div className="w-full mx-10">
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={closeSubscribeModal}
        url={url}
      />
      <div className="font-semibold text-center text-gray-500 dark:text-gray-400 ml-64 flex justify-center items-center border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="me-2">
            <button
              onClick={() => setSelectedTab("Following")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                selectedTab === "Following"
                  ? "text-gray-900 border-gray-900 z-10"
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Following
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => setSelectedTab("Trending")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                selectedTab === "Trending"
                  ? "text-gray-900 border-gray-900"
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              aria-current="page"
            >
              Trending
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => setSelectedTab("Recent")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                selectedTab === "Recent"
                  ? "text-gray-900 border-gray-900"
                  : "hover:text-gray-6000 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Recent
            </button>
          </li>
        </ul>
      </div>
      <div className="mt-10 font-semibold text-center text-gray-500 dark:text-gray-400 ml-64 flex flex-col space-y-3 justify-center items-center">
        <div className="flex justify-center items-center space-x-3">
          <Input
            placeholder="Cast Link"
            className="w-96 h-12"
            onChange={(e) => setCastLink(e.target.value)}
          />
          <button
            className="bg-gray-500 text-white w-10 h-10 rounded-full"
            onClick={handlePublishCast}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
      <div className="mt-10 font-semibold text-center text-gray-500 dark:text-gray-400 ml-64 flex flex-col space-y-3 justify-center items-center">
        {casts &&
          casts.map((cast) => {
            if (!cast.frames || cast.frames.length === 0) {
              return null;
            }

            return (
              <div
                key={cast.hash}
                className="mb-4 p-4 border border-gray-200 rounded-lg w-1/2"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3 w-full">
                    <Image
                      src={cast.author.pfp_url}
                      alt={cast.author.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    <p className="font-bold">@{cast.author.username}</p>
                    <p className="text-gray-500 text-sm ml-5">
                      {dayjs(cast.timestamp).fromNow()}
                    </p>
                  </div>
                  <button
                    className="flex items-center space-x-3"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => handleIconClick(cast.hash)}
                  >
                    <FontAwesomeIcon
                      icon={isHovered ? faThumbsUpHover : faThumbsUp}
                      className="transition duration-75 cursor-pointer h-5 w-5 relative"
                    />
                    <p className="ext-gray-700">{castPoints[cast.hash] || 0}</p>
                    {pointModal && pointModal[cast.hash] && (
                      <div
                        ref={modalRef}
                        className="absolute mt-20 p-2 bg-white border rounded shadow-lg"
                      >
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => updateCastPoint(cast.hash, 100, castPoints[cast.hash] || 0)}
                        >
                          +100
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => updateCastPoint(cast.hash, 200, castPoints[cast.hash] || 0)}
                        >
                          +200
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => updateCastPoint(cast.hash, 500, castPoints[cast.hash] || 0)}
                        >
                          +500
                        </button>
                      </div>
                    )}
                  </button>
                </div>
                <div className="mt-3 text-gray-700 text-start ml-3">
                  {cast.text}
                </div>
                <div className="mt-4">
                  {cast.frames &&
                    cast.frames.slice(0, 3).map((frame: any, index: any) => (
                      <div
                        key={index}
                        className="border-t pt-4 mt-4 flex flex-col justify-center items-center"
                      >
                        <h2 className="font-semibold text-lg">{frame.title}</h2>
                        {frame.image && (
                          <Image
                            src={frame.image}
                            alt={frame.title}
                            width={
                              frame.image_aspect_ratio === "1:1" ? 400 : 600
                            }
                            height={
                              frame.image_aspect_ratio === "1:1" ? 400 : 300
                            }
                            className="rounded mt-2"
                          />
                        )}
                        <div className="flex justify-center items-center space-x-2">
                          {frame.buttons &&
                            frame.buttons
                              .slice(0, 3)
                              .map((button: any, buttonIndex: any) => {
                                if (buttonIndex === 2) {
                                  return (
                                    <button
                                      key={buttonIndex}
                                      onClick={() => {
                                        setUrl(frame.frames_url);
                                        openSubscribeModal();
                                      }}
                                      className="inline-block mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                    >
                                      {button.title}
                                    </button>
                                  );
                                }

                                return (
                                  <Link
                                    key={buttonIndex}
                                    href={
                                      buttonIndex === 0
                                        ? frame.frames_url
                                        : buttonIndex === 1
                                        ? `https://warpcast.com/${cast.author.username}/${cast.hash}`
                                        : "#"
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                  >
                                    {buttonIndex === 1
                                      ? "Warpcast"
                                      : button.title}
                                    {(buttonIndex === 0 ||
                                      buttonIndex === 1) && (
                                      <FontAwesomeIcon
                                        icon={faArrowUpRightFromSquare}
                                        className="ml-2"
                                      />
                                    )}
                                  </Link>
                                );
                              })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Tab;
