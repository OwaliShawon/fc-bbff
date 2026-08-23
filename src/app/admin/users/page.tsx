import { getUsers } from "@/actions/user-actions";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ page?: string; search?: string; role?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const users = await getUsers({
    page,
    pageSize: 15,
    search: searchParams.search,
    role: searchParams.role,
    status: searchParams.status,
  });

  return <UsersClient initialData={users} />;
}
