import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { getManagementMembers } from "@/actions/management-actions";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  UserCheck,
  Crown,
  ShieldAlert,
  Calendar,
  ArrowRight,
  Landmark,
  Award,
  Wallet,
  ClipboardList,
  Camera,
} from "lucide-react";
import type { ManagementRoleValue } from "@/lib/management-roles";

type RoleSection = {
  role: ManagementRoleValue;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Always render the section, even with no records (original core roles) */
  alwaysShow: boolean;
  emptyText: string;
  fallbackInitial: string;
  currentLabel: string;
  formerLabel: string;
  // Full Tailwind class strings (kept literal so Tailwind can detect them)
  iconClass: string;
  countBadgeClass: string;
  currentCardClass: string;
  currentBadgeClass: string;
  accentTextClass: string;
};

const SECTIONS: RoleSection[] = [
  {
    role: "PRESIDENT",
    title: "Club Presidents",
    description: "Presiding over club governance, long-term vision, and executive leadership",
    icon: Landmark,
    alwaysShow: true,
    emptyText: "Presidential history records will be listed here.",
    fallbackInitial: "P",
    currentLabel: "Current President",
    formerLabel: "Former President",
    iconClass: "text-purple-400",
    countBadgeClass: "bg-purple-500/10 text-purple-400",
    currentCardClass: "border-purple-500/40 bg-purple-950/20",
    currentBadgeClass: "bg-purple-500 text-white",
    accentTextClass: "text-purple-400",
  },
  {
    role: "VICE_PRESIDENT",
    title: "Vice Presidents",
    description: "Supporting the President in club governance and executive decisions",
    icon: Award,
    alwaysShow: false,
    emptyText: "Vice President records will be listed here.",
    fallbackInitial: "V",
    currentLabel: "Current Vice President",
    formerLabel: "Former Vice President",
    iconClass: "text-fuchsia-400",
    countBadgeClass: "bg-fuchsia-500/10 text-fuchsia-400",
    currentCardClass: "border-fuchsia-500/40 bg-fuchsia-950/20",
    currentBadgeClass: "bg-fuchsia-500 text-white",
    accentTextClass: "text-fuchsia-400",
  },
  {
    role: "TREASURER",
    title: "Treasurers",
    description: "Managing club finances, budgets, and member contributions",
    icon: Wallet,
    alwaysShow: false,
    emptyText: "Treasurer records will be listed here.",
    fallbackInitial: "T",
    currentLabel: "Current Treasurer",
    formerLabel: "Former Treasurer",
    iconClass: "text-yellow-400",
    countBadgeClass: "bg-yellow-500/10 text-yellow-400",
    currentCardClass: "border-yellow-500/40 bg-yellow-950/20",
    currentBadgeClass: "bg-yellow-500 text-neutral-950 font-bold",
    accentTextClass: "text-yellow-400",
  },
  {
    role: "MANAGER",
    title: "Club Managers",
    description: "Guiding club operations, tactics, and club legacy",
    icon: UserCheck,
    alwaysShow: true,
    emptyText: "Manager records will be listed here.",
    fallbackInitial: "M",
    currentLabel: "Current",
    formerLabel: "Former Manager",
    iconClass: "text-emerald-400",
    countBadgeClass: "bg-emerald-500/10 text-emerald-400",
    currentCardClass: "border-emerald-500/40 bg-emerald-950/20",
    currentBadgeClass: "bg-emerald-500 text-white",
    accentTextClass: "text-emerald-400",
  },
  {
    role: "ASSISTANT_MANAGER",
    title: "Assistant Managers",
    description: "Assisting the manager with squad, training, and matchday operations",
    icon: ClipboardList,
    alwaysShow: false,
    emptyText: "Assistant Manager records will be listed here.",
    fallbackInitial: "A",
    currentLabel: "Current Asst. Manager",
    formerLabel: "Former Asst. Manager",
    iconClass: "text-teal-400",
    countBadgeClass: "bg-teal-500/10 text-teal-400",
    currentCardClass: "border-teal-500/40 bg-teal-950/20",
    currentBadgeClass: "bg-teal-500 text-white",
    accentTextClass: "text-teal-400",
  },
  {
    role: "MEDIA_MANAGER",
    title: "Media Managers",
    description: "Running club media, social channels, photography, and announcements",
    icon: Camera,
    alwaysShow: false,
    emptyText: "Media Manager records will be listed here.",
    fallbackInitial: "M",
    currentLabel: "Current Media Manager",
    formerLabel: "Former Media Manager",
    iconClass: "text-pink-400",
    countBadgeClass: "bg-pink-500/10 text-pink-400",
    currentCardClass: "border-pink-500/40 bg-pink-950/20",
    currentBadgeClass: "bg-pink-500 text-white",
    accentTextClass: "text-pink-400",
  },
  {
    role: "CAPTAIN",
    title: "Club Captains",
    description: "Leading FC BBFF on the pitch",
    icon: Crown,
    alwaysShow: true,
    emptyText: "Captain records will be listed here.",
    fallbackInitial: "C",
    currentLabel: "Current Captain (C)",
    formerLabel: "Former Captain",
    iconClass: "text-amber-400",
    countBadgeClass: "bg-amber-500/10 text-amber-400",
    currentCardClass: "border-amber-500/40 bg-amber-950/20",
    currentBadgeClass: "bg-amber-500 text-neutral-950 font-bold",
    accentTextClass: "text-amber-400",
  },
  {
    role: "VICE_CAPTAIN",
    title: "Vice-Captains",
    description: "Squad leadership and support",
    icon: ShieldAlert,
    alwaysShow: true,
    emptyText: "Vice-Captain records will be listed here.",
    fallbackInitial: "V",
    currentLabel: "Current VC",
    formerLabel: "Former VC",
    iconClass: "text-blue-400",
    countBadgeClass: "bg-blue-500/10 text-blue-400",
    currentCardClass: "border-blue-500/40 bg-blue-950/20",
    currentBadgeClass: "bg-blue-500 text-white font-bold",
    accentTextClass: "text-blue-400",
  },
];

export default async function ManagementPage() {
  const members = await getManagementMembers();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-white md:text-6xl">Club Leadership &amp; Management</h1>
          <p className="mt-4 text-neutral-400 max-w-2xl mx-auto">
            Honoring the presidents, officers, managers, captains, and vice-captains who have guided and inspired FC BBFF since 2014
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-20">
          {SECTIONS.map((section) => {
            const roleMembers = members.filter((m) => m.role === section.role);
            if (!section.alwaysShow && roleMembers.length === 0) return null;
            const Icon = section.icon;

            return (
              <div key={section.role}>
                <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Icon className={`h-6 w-6 ${section.iconClass}`} /> {section.title}
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1">{section.description}</p>
                  </div>
                  <Badge variant="secondary" className={section.countBadgeClass}>
                    {roleMembers.length} Records
                  </Badge>
                </div>

                {roleMembers.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-neutral-500">
                    <Icon className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
                    <p className="text-sm">{section.emptyText}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roleMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`rounded-2xl border p-6 backdrop-blur-sm flex flex-col justify-between transition-all ${
                          member.isCurrent ? section.currentCardClass : "border-white/10 bg-white/5"
                        }`}
                      >
                        <div>
                          <div className="flex items-start gap-4 mb-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 flex items-center justify-center">
                              {member.photoUrl ? (
                                <Image
                                  src={member.photoUrl}
                                  alt={member.name || section.title}
                                  fill
                                  className="object-cover object-top"
                                  unoptimized
                                />
                              ) : (
                                <span className={`text-xl font-bold ${section.accentTextClass}`}>
                                  {member.name?.charAt(0) || section.fallbackInitial}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg text-white">{member.name}</h3>
                                {member.isCurrent ? (
                                  <Badge className={`${section.currentBadgeClass} text-[10px]`}>{section.currentLabel}</Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 text-[10px]">
                                    {section.formerLabel}
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-xs font-semibold flex items-center gap-1 mt-1 ${section.accentTextClass}`}>
                                <Calendar className="h-3 w-3" /> Tenure: {member.tenure}
                              </p>
                            </div>
                          </div>

                          {member.bio && (
                            <p className="text-sm text-neutral-300 leading-relaxed mt-2">{member.bio}</p>
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
            );
          })}
        </div>
      </section>
    </div>
  );
}
