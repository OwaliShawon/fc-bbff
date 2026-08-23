import { getSeasons } from "@/actions/competition-actions";
import { SeasonsClient } from "./seasons-client";

export default async function AdminSeasonsPage() {
  const seasons = await getSeasons();
  return <SeasonsClient initialSeasons={seasons} />;
}
