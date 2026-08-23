import { getMediaFiles } from "@/actions/media-actions";
import { MediaClient } from "./media-client";

export default async function AdminMediaPage() {
  const media = await getMediaFiles();
  return <MediaClient initialMedia={media} />;
}
