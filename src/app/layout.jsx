import { cache } from "react";
import { headers } from "next/headers";
import { Roboto, Inter, Noto_Serif, Irish_Grover, Schoolbell } from "next/font/google";
import "./globals.css";
import ContentstackServer from "@/lib/cstack";
import { PersonalizeProvider } from "@/context/personalize.context";
import { LyticsTracking } from "@/context/lyticsTracking";

// Configure Google Fonts
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSerif = Noto_Serif({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
});

const irishGrover = Irish_Grover({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-irish-grover',
  display: 'swap',
});

const schoolbell = Schoolbell({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-schoolbell',
  display: 'swap',
});

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
        className={`${roboto.variable} ${inter.variable} ${notoSerif.variable} ${irishGrover.variable} ${schoolbell.variable}`}
      >
        {process.env.LYTICS_TAG && <LyticsTracking />}
        {process.env.CONTENTSTACK_PERSONALIZATION ? <PersonalizeProvider>
          {children}
        </PersonalizeProvider> : <>{children}</>}
      </body>
    </html>
  );
}
