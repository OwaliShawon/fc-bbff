import { getCompetitions, getSeasons } from "@/actions/competition-actions";
import { getTeams } from "@/actions/team-actions";
import { CompetitionsClient } from "./competitions-client";

export default async function AdminCompetitionsPage(props: {
  searchParams: Promise<{ page?: string; seasonId?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const [competitions, seasons, { data: teams }] = await Promise.all([
    getCompetitions({
      page,
      pageSize: 15,
      seasonId: searchParams.seasonId,
      status: searchParams.status,
    }),
    getSeasons(),
    getTeams({ pageSize: 50 }),
  ]);

  return <CompetitionsClient initialData={competitions} seasons={seasons} teams={teams} />;
}
