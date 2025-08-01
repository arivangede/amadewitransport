"use-client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function CreateUnitSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="font-semibold">Add +</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Unit +</SheetTitle>
          <SheetDescription>
            Please fill out the form below to add a new unit to the system. Make
            sure all information is correct before saving.
          </SheetDescription>
        </SheetHeader>

        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant={"outline"} className="w-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
