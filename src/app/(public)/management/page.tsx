import Image from "next/image";
import Link from "next/link";
import { getManagementMembers } from "@/actions/management-actions";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, Crown, ShieldAlert, Calendar, ArrowRight, Landmark } from "lucide-react";

export default async function ManagementPage() {
  const members = await getManagementMembers();

  const presidents = members.filter((m) => m.role === "PRESIDENT");
  const managers = members.filter((m) => m.role === "MANAGER");
  const captains = members.filter((m) => m.role === "CAPTAIN");
  const viceCaptains = members.filter((m) => m.role === "VICE_CAPTAIN");

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-white md:text-6xl">Club Leadership & Management</h1>
          <p className="mt-4 text-neutral-400 max-w-2xl mx-auto">
            Honoring the presidents, managers, captains, and vice-captains who have guided and inspired FC BBFF since 2014
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-20">
          {/* ====== 1. PRESIDENTS ====== */}
          <div>
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Landmark className="h-6 w-6 text-purple-400" /> Club Presidents
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Presiding over club governance, long-term vision, and executive leadership</p>
              </div>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">
                {presidents.length} Records
              </Badge>
            </div>

            {presidents.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-neutral-500">
                <Landmark className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
                <p className="text-sm">Presidential history records will be listed here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {presidents.map((member) => (
                  <div
                    key={member.id}
                    className={`rounded-2xl border p-6 backdrop-blur-sm flex flex-col justify-between transition-all ${
                      member.isCurrent
                        ? "border-purple-500/40 bg-purple-950/20"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 flex items-center justify-center">
                          {member.photoUrl ? (
                            <Image
                              src={member.photoUrl}
                              alt={member.name || "President"}
                              fill
                              className="object-cover object-top"
                              unoptimized
                            />
                          ) : (
                            <span className="text-xl font-bold text-purple-400">
                              {member.name?.charAt(0) || "P"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg text-white">{member.name}</h3>
                            {member.isCurrent ? (
                              <Badge className="bg-purple-500 text-white text-[10px]">Current President</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 text-[10px]">Former President</Badge>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-purple-400 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" /> Tenure: {member.tenure}
                          </p>
                        </div>
                      </div>

                      {member.bio && (
                        <p className="text-sm text-neutral-300 leading-relaxed mt-2">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    {member.player && (
                      <div className="mt-4 border-t border-white/5 pt-3">
                        <Link
                          href={`/players/${member.player.slug}`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                          View Player Profile <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ====== 2. MANAGERS ====== */}
          <div>
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-emerald-400" /> Club Managers
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Guiding club operations, tactics, and club legacy</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                {managers.length} Records
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {managers.map((member) => (
                <div
                  key={member.id}
                  className={`rounded-2xl border p-6 backdrop-blur-sm flex flex-col justify-between transition-all ${
                    member.isCurrent
                      ? "border-emerald-500/40 bg-emerald-950/20"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 flex items-center justify-center">
                        {member.photoUrl ? (
                          <Image
                            src={member.photoUrl}
                            alt={member.name || "Manager"}
                            fill
                            className="object-cover object-top"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xl font-bold text-emerald-400">
                            {member.name?.charAt(0) || "M"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-white">{member.name}</h3>
                          {member.isCurrent ? (
                            <Badge className="bg-emerald-500 text-white text-[10px]">Current</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 text-[10px]">Former Manager</Badge>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" /> Tenure: {member.tenure}
                        </p>
                      </div>
                    </div>

                    {member.bio && (
                      <p className="text-sm text-neutral-300 leading-relaxed mt-2">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  {member.player && (
                    <div className="mt-4 border-t border-white/5 pt-3">
                      <Link
                        href={`/players/${member.player.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        View Player Profile <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ====== 3. CAPTAINS ====== */}
          <div>
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Crown className="h-6 w-6 text-amber-400" /> Club Captains
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Leading FC BBFF on the pitch</p>
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-400">
                {captains.length} Records
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {captains.map((member) => (
                <div
                  key={member.id}
                  className={`rounded-2xl border p-6 backdrop-blur-sm flex flex-col justify-between transition-all ${
                    member.isCurrent
                      ? "border-amber-500/40 bg-amber-950/20"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 flex items-center justify-center">
                        {member.photoUrl ? (
                          <Image
                            src={member.photoUrl}
                            alt={member.name || "Captain"}
                            fill
                            className="object-cover object-top"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xl font-bold text-amber-400">
                            {member.name?.charAt(0) || "C"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-white">{member.name}</h3>
                          {member.isCurrent ? (
                            <Badge className="bg-amber-500 text-neutral-950 font-bold text-[10px]">Current Captain (C)</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 text-[10px]">Former Captain</Badge>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-400 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" /> Tenure: {member.tenure}
                        </p>
                      </div>
                    </div>

                    {member.bio && (
                      <p className="text-sm text-neutral-300 leading-relaxed mt-2">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  {member.player && (
                    <div className="mt-4 border-t border-white/5 pt-3">
                      <Link
                        href={`/players/${member.player.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        View Player Profile <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ====== 4. VICE-CAPTAINS ====== */}
          <div>
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-blue-400" /> Vice-Captains
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Squad leadership and support</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
                {viceCaptains.length} Records
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {viceCaptains.map((member) => (
                <div
                  key={member.id}
                  className={`rounded-2xl border p-6 backdrop-blur-sm flex flex-col justify-between transition-all ${
                    member.isCurrent
                      ? "border-blue-500/40 bg-blue-950/20"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 flex items-center justify-center">
                        {member.photoUrl ? (
                          <Image
                            src={member.photoUrl}
                            alt={member.name || "Vice-Captain"}
                            fill
                            className="object-cover object-top"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xl font-bold text-blue-400">
                            {member.name?.charAt(0) || "V"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-white">{member.name}</h3>
                          {member.isCurrent ? (
                            <Badge className="bg-blue-500 text-white font-bold text-[10px]">Current VC</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 text-[10px]">Former VC</Badge>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-blue-400 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" /> Tenure: {member.tenure}
                        </p>
                      </div>
                    </div>

                    {member.bio && (
                      <p className="text-sm text-neutral-300 leading-relaxed mt-2">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  {member.player && (
                    <div className="mt-4 border-t border-white/5 pt-3">
                      <Link
                        href={`/players/${member.player.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        View Player Profile <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
