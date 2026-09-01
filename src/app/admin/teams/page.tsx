import { getTeams } from "@/actions/team-actions";
import { getAllActivePlayers } from "@/actions/player-actions";
import { TeamsClient } from "./teams-client";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = (params.search as string) || "";
  const status = (params.status as string) || "";

  const [teamsData, allPlayers] = await Promise.all([
    getTeams({ page, pageSize: 10, search, status }),
    getAllActivePlayers(),
  ]);

  return (
    <TeamsClient
      initialData={teamsData}
      allPlayers={allPlayers}
      currentPage={page}
      currentSearch={search}
      currentStatus={status}
    />
  );
}
