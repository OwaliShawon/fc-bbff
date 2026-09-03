import { FootballSpinner } from "@/components/ui/football-spinner";

export default function AdminLoading() {
    return (
    <div className="flex h-[75vh] w-full flex-col items-center justify-center bg-neutral-950">
      <FootballSpinner size="lg" text="Loading BBFF Admin" />
    </div>
  );
}
