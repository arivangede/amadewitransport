import Image from "next/image";
import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";

export default function UnitCard() {
  return (
    <div className="flex items-center justify-between bg-background border rounded-md overflow-hidden">
      <div className="flex items-center gap-2">
        <Image
          alt="unit-image"
          width={150}
          height={150}
          className="object-cover h-full"
          src={"https://placehold.co/150x150.png"}
        />
        <div className="flex flex-col">
          <div className="font-bold">Car Name</div>
          <div>year: 2025</div>
          <div>base rate: IDR 3.200.000/12hours</div>
          <div>inclusions:</div>
        </div>
      </div>
      <div className="flex gap-2 items-center p-4">
        <Button className="bg-[#60a5fa]">
          <Pencil />
        </Button>
        <Button className="bg-[#f87171]">
          <Trash />
        </Button>
      </div>
    </div>
  );
}
