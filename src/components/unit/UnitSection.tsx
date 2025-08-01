import CreateUnitDialog from "./Dialog/CreateUnitDialog";
import CreateUnitSheet from "./Sheets/CreateUnitSheet";
import UnitCard from "./UnitCard";

export default function UnitSection() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex w-full items-center justify-between p-4 rounded-md shadow border bg-background">
        <h3 className="font-bold text-xl">Units</h3>
        <CreateUnitDialog />
      </div>
      <div className="flex flex-col w-full">
        <UnitCard />
      </div>
    </div>
  );
}
