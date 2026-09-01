import { FootballSpinner } from "@/components/ui/football-spinner";

export default function AdminLoading() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center">
      <FootballSpinner size="lg" text="Loading Admin Control Center..." />
    </div>
  );
}
