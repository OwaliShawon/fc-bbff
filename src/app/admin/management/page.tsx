import { getManagementMembers } from "@/actions/management-actions";
import { getPlayers } from "@/actions/player-actions";
import { ManagementClient } from "./management-client";

export default async function AdminManagementPage() {
  const [members, { data: players }] = await Promise.all([
    getManagementMembers(),
    getPlayers({ pageSize: 100 }),
  ]);

  return <ManagementClient initialMembers={members} players={players} />;
}
