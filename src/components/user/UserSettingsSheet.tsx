"use client";

import { useState } from "react";
import useUserStore from "@/store/userStore";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { ChevronLeft, Settings } from "lucide-react";
import AccountForm from "./AccountForm";
import PasswordForm from "./PasswordForm";

export function UserSettingsSheet() {
  const { user } = useUserStore();
  const [step, setStep] = useState<"menu" | "account" | "password">("menu");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "account") {
      console.log("Update account:", formData.name, formData.email);
    } else if (step === "password") {
      console.log(
        "Change password:",
        formData.currentPassword,
        formData.newPassword
      );
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="h-12 w-12 flex justify-center items-center bg-primary p-2 rounded-md cursor-pointer hover:bg-primary/80 transition">
          <Settings />
        </button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Account Settings</SheetTitle>
          <SheetDescription>
            Manage your account settings and preferences.
          </SheetDescription>
        </SheetHeader>

        {step === "menu" && (
          <div className="flex flex-col gap-4 mt-6 p-4">
            <Button variant="outline" onClick={() => setStep("account")}>
              Change Account Information
            </Button>
            <Button variant="outline" onClick={() => setStep("password")}>
              Change Password
            </Button>
          </div>
        )}
        {step === "account" && (
          <div className="p-4 flex-1">
            <div className="flex items-center gap-2">
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => setStep("menu")}
              >
                <ChevronLeft />
              </Button>
              <h3 className="font-semibold">Change Account Information</h3>
            </div>
            <AccountForm />
          </div>
        )}
        {step === "password" && (
          <div className="p-4 flex-1">
            <div className="flex items-center gap-2">
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => setStep("menu")}
              >
                <ChevronLeft />
              </Button>
              <h3 className="font-semibold">Change Password</h3>
            </div>
            <PasswordForm />
          </div>
        )}
        {step !== "menu" && (
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("menu")}
            >
              Back
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
