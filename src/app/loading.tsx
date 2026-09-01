import { FootballSpinner } from "@/components/ui/football-spinner";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-md">
      {/* Background Crest Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
        <img
          src="/logo.png"
          alt="BBFF Crest"
          className="h-96 w-96 object-contain"
        />
      </div>

      <FootballSpinner size="xl" text="Loading FC BBFF..." />
    </div>
  );
}
