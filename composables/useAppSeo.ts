const SITE_URL = 'https://pdfeditor.lumicore-labs.com';
const SITE_NAME = 'LumiCore PDF Editor';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface AppSeoOptions {
  /** Page <title> and og:title */
  title: string;
  /** Meta description and og:description */
  description: string;
  /** Path portion of the URL, e.g. "/tools/edit-pdf" */
  path: string;
  /** Override the default OG image */
  ogImage?: string;
}

/**
 * Centralised SEO composable.
 * Sets useSeoMeta (description, OG, Twitter), canonical link.
 * Call once per page inside <script setup>.
 */
export function useAppSeo({ title, description, path, ogImage }: AppSeoOptions) {
  const canonical = `${SITE_URL}${path}`;
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: canonical,
    ogImage: image,
    ogSiteName: SITE_NAME,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    twitterSite: '@lumicoreapp',
  });

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  });
}
