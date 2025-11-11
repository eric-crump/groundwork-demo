import { cache } from "react";
import { headers } from "next/headers";
import "./globals.css";
import ContentstackServer from "@/lib/cstack";
import { PersonalizeProvider } from "@/context/personalize.context";
import { LyticsTracking } from "@/context/lyticsTracking";

const fetchData = cache(async (locale) => {
  const headersList = await headers();
  const variantParam = headersList.get('x-personalize-variants');
  // example of how to fetch seo metadata from contentstack, you can create a new content type for seo metadata and use it like this:
  const data = await ContentstackServer.getElementByUrl("seo", "/homepage", locale, {}, variantParam);
  return data;
});

export const generateMetadata = async ({ params }) => {
  const { locale } = await params;
  const data = await fetchData(locale);
  const entry = data?.[0]?.[0];

  return {
    title: entry?.seo?.title,
    description: entry?.seo?.description,
    robots: {
      index: entry?.seo?.no_index || false,
      follow: entry?.seo?.no_follow || false,
    },
    openGraph: {
      title: entry?.seo?.og_meta_tags?.title,
      description: entry?.seo?.og_meta_tags?.description,
      images: entry?.seo?.og_meta_tags?.image,
    },
  }
};

export default async function RootLayout({
  children,
  params,
}) {
  const { locale } = await params;
  
  return (
    <html lang={locale}>
      <body
      >
        {process.env.LYTICS_TAG && <LyticsTracking />}
        {process.env.CONTENTSTACK_PERSONALIZATION ? <PersonalizeProvider>
          {children}
        </PersonalizeProvider> : <>{children}</>}
      </body>
    </html>
  );
}
