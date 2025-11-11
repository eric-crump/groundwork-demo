
import { cache } from "react";
import { headers } from "next/headers";
import ContentstackServer from "@/lib/cstack";
import DataContextProvider from "@/context/data.context";

const fetchData = cache(async (locale) => {
  const headersList = await headers();
  const variantParam = headersList.get('x-personalize-variants');
  // example of how to fetch seo metadata from contentstack, replace "homepage" with the content type which contains the seo metadata
  const data = await ContentstackServer.getElementByType("homepage", locale, {}, variantParam);
  return data;
});

export const generateMetadata = async ({ params }) => {
  const { locale } = await params;
  const data = await fetchData(locale);
  const entry = data?.[0];

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
  const data = await fetchData(locale);

  return (
    <DataContextProvider data={data}>
      {children}
    </DataContextProvider>
  );
}
