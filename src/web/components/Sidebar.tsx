import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faSackDollar,
  faCrown,
  faUser,
  faRankingStar,
  faList,
  faTag,
  faRotate
} from "@fortawesome/free-solid-svg-icons";
import { useNeynarContext } from "@neynar/react";
import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client";

const Sidebar = () => {
  const supabase = createClient();
  const { user } = useNeynarContext();
  const [userPoint, setUserPoint] = useState<number>(0);

  const getUserPoint = useCallback(async () => {
    if (!user?.fid) {
      return;
    }
    const { data: fuzzle_point, error } = await supabase
      .from("fuzzle_point")
      .select("*")
      .eq("fid", Number(user?.fid));

    if (fuzzle_point && fuzzle_point.length > 0) {
      setUserPoint(fuzzle_point[0].point || 0);
    } else {
      console.log(`user?.fid: ${user?.fid}`);
      console.log(`user: ${JSON.stringify(user)}`);
      await supabase
        .from("fuzzle_point")
        .upsert({ fid: Number(user?.fid), point: 1000 })
        .select();
    }

    if (error) {
      console.error(error);
    }
  }, [supabase, user]);

  const resetUserPoint = useCallback(async () => {
    if (!user?.fid) {
      return;
    }
    const { data, error } = await supabase
      .from("fuzzle_point")
      .update({ point: 1000 })
      .eq("fid", Number(user?.fid))
      .select();

    if (error) {
      console.error(error);
    }

    console.log(`data: ${JSON.stringify(data)}`);
    if (data && data[0] && data[0].point && data[0].point > 0) {
      setUserPoint(data[0].point);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user) {
      getUserPoint();
    }
  }, [getUserPoint, user, userPoint]);

  return (
    <div>
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-start items-center mb-5">
            <Link href="/" className="text-2xl font-semibold">
              Fuzzle
            </Link>
          </div>
          <div className="flex justify-start items-center border-b border-gray-200 pb-2 mb-2">
            <FontAwesomeIcon
              icon={faUser}
              className="flex-shrink-0 w-5 h-5 text-gray-900 transition duration-75 dark:text-gray-400"
            />
            <span className="ms-3 font-semibold">User</span>
          </div>
          <ul className="space-y-1 font-medium">
            <li>
              <div
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <FontAwesomeIcon
                  icon={faMoneyBill}
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
                <span className="ms-3 flex-1 whitespace-nowrap">
                  Daily Allowance
                </span>
                <span className="inline-flex items-center justify-center px-3 py-1 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  1,000
                </span>
              </div>
            </li>
            <li>
              <div
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <FontAwesomeIcon
                  icon={faSackDollar}
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Total Balance
                </span>
                <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  {userPoint}
                  <button onClick={resetUserPoint}>
                    <FontAwesomeIcon
                    icon={faRotate}
                    className="ml-1 flex-shrink-0 w-4 h-4 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  />
                  </button>
                </span>
              </div>
            </li>
          </ul>
          <div className="flex justify-start items-center border-b border-gray-200 pb-2 mt-5  mb-2">
            <FontAwesomeIcon
              icon={faRankingStar}
              className="flex-shrink-0 w-5 h-5 text-gray-900 transition duration-75 dark:text-gray-400"
            />
            <span className="ms-3 font-semibold">Rank</span>
          </div>
          <ul className="space-y-1 font-medium">
            <li>
              <Link
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <FontAwesomeIcon
                  icon={faCrown}
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Leaderboard
                </span>
                <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  3
                </span>
              </Link>
            </li>
          </ul>
          <div className="flex justify-start items-center border-b border-gray-200 pb-2 mt-5  mb-2">
            <FontAwesomeIcon
              icon={faList}
              className="flex-shrink-0 w-5 h-5 text-gray-900 transition duration-75 dark:text-gray-400"
            />
            <span className="ms-3 font-semibold">Channels</span>
          </div>
          <ul className="space-y-1 font-medium">
            <li>
              <Link
                href="/?channel=paragraph"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <FontAwesomeIcon
                  icon={faTag}
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  /paragraph
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
