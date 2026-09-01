import { getMatches } from "@/actions/match-actions";
import { getAllActiveTeams } from "@/actions/team-actions";
import { getSeasons, getCompetitions } from "@/actions/competition-actions";
import { MatchesClient } from "./matches-client";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = (params.status as string) || "";
  const search = (params.search as string) || "";
  const competitionId = (params.competitionId as string) || "";

  const [matchesData, teams, seasons, competitionsData] = await Promise.all([
    getMatches({ page, pageSize: 10, status, search, competitionId }),
    getAllActiveTeams(),
    getSeasons(),
    getCompetitions({ pageSize: 100 }),
  ]);

  return (
    <MatchesClient
      initialData={matchesData}
      teams={teams}
      seasons={seasons}
      competitions={competitionsData.data || []}
      currentPage={page}
      currentStatus={status}
      currentSearch={search}
      currentCompetitionId={competitionId}
    />
  );
}
