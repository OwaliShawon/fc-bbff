import { getSiteSettings } from "@/actions/settings-actions";
import { Shield, Target, Eye, Heart, Calendar, Award, Users } from "lucide-react";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20 lg:py-28">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="text-4xl font-black text-white md:text-6xl">About {settings.clubName}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-400">{settings.aboutText}</p>
        </div>
      </section>

      {/* History */}
      {settings.clubHistory && (
        <section className="border-b border-white/10 bg-neutral-950 py-16">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-emerald-500" />
              <h2 className="text-2xl font-bold text-white">Our History</h2>
            </div>
            <p className="text-lg leading-relaxed text-neutral-300">{settings.clubHistory}</p>
          </div>
        </section>
      )}

      {/* Mission, Vision, Values */}
      <section className="border-b border-white/10 bg-neutral-900/50 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {settings.mission && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/20">
                  <Target className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Our Mission</h3>
                <p className="text-neutral-400">{settings.mission}</p>
              </div>
            )}
            {settings.vision && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/20">
                  <Eye className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Our Vision</h3>
                <p className="text-neutral-400">{settings.vision}</p>
              </div>
            )}
            {settings.clubValues && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20">
                  <Heart className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Our Values</h3>
                <div className="flex flex-wrap gap-2">
                  {settings.clubValues.split(",").map((v) => (
                    <span key={v.trim()} className="rounded-lg bg-white/10 px-3 py-1 text-sm text-neutral-300">
                      {v.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
