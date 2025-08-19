"use client";

import api from "@/lib/axios";
import useUserStore from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "./loading";
import { UserSettingsSheet } from "./user/UserSettingsSheet";

export default function AdminNavbar() {
  const { user, setUser } = useUserStore();

  const { isLoading } = useQuery({
    queryKey: ["userme"],
    queryFn: async () => {
      const res = await api.get("/api/auth/me");
      if (res.data && res.data.user) {
        setUser(res.data.user);
      }
      return res.data.user;
    },
    enabled: user === null,
  });

  function getGreeting() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  }

  return (
    <div className="flex justify-between items-center text-foreground pt-4 px-4 w-full">
      <div className="flex flex-col items-center md:flex-row md:gap-2">
        <span className="text-2xl font-bold">
          AD<span className="text-primary">TS</span>
        </span>

        <span className="font-semibold text-sm hidden md:inline-block md:text-md">
          | Admin Panel
        </span>
      </div>
      {isLoading ? (
        <div>
          <Loading />
        </div>
      ) : user ? (
        <div className="flex justify-end items-center gap-2 md:gap-4 md:justify-start">
          <h3 className="text-sm text-end md:text-md">
            {getGreeting()}! <br />{" "}
            <span className="font-bold">{user.name}</span>
          </h3>
          <UserSettingsSheet />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
