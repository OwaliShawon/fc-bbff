import { getPlayers } from "@/actions/player-actions";
import { getAllActiveTeams } from "@/actions/team-actions";
import { PlayersClient } from "./players-client";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = (params.search as string) || "";
  const status = (params.status as string) || "";
  const position = (params.position as string) || "";

  const [playersData, teams] = await Promise.all([
    getPlayers({ page, pageSize: 10, search, status, position }),
    getAllActiveTeams(),
  ]);

  return (
    <PlayersClient
      initialData={playersData}
      teams={teams}
      currentPage={page}
      currentSearch={search}
      currentStatus={status}
      currentPosition={position}
    />
  );
}
