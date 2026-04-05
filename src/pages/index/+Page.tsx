import { PublicResumeSite } from "@/components/PublicResumeSite";
import { getSiteVariant } from "@/lib/resume-data";

export default function Page() {
  return <PublicResumeSite variant={getSiteVariant()} />;
}
