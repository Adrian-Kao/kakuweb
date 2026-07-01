import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, studioProjectId } from "./env";

export const sanityClient = createClient({
  projectId: studioProjectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
}: {
  query: string;
  params?: Record<string, string | number | boolean>;
}) {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<QueryResponse>(query, params, {
    next: { revalidate: 60 },
  });
}
