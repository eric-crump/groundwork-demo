"use client";
import { useDataContext } from "@/context/data.context";
import { ContentstackClient } from "@/lib/contentstack-client";
import DynamicForm from "@/components/DynamicForm";
import Hero from "@/components/Hero";
import Executives from "@/components/Executives";
import Footer from "@/components/Footer";
import { useState, useEffect, use } from "react";

export default function Home({ params }) {
  const { locale } = use(params);
  const initialData = useDataContext();

  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch the homepage content type which includes the underline_form field
      const data = await ContentstackClient.getElementByType("homepage", locale, initialData);
      if (data) {
        setEntry(data[0]);
        console.log("homepage", data[0]);
      } else {
        setEntry(null);
      }
    }

    ContentstackClient.onEntryChange(fetchData);
  }, [locale, initialData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {entry && (entry.background_color || entry.line_color || entry.text_color || entry.headline_font) && (
          <div className="mb-8">
            <Hero
              colors={{
                background_color: entry.background_color,
                line_color: entry.line_color,
                text_color: entry.text_color
              }}
              headline_font={entry.headline_font}
            />
          </div>
        )}

        {/* Render the Dynamic Form if it exists */}
        {entry?.underline_form && (
          <DynamicForm formData={entry.underline_form} />
        )}

        {/* Show message if no form data */}
        {entry && !entry.underline_form && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              No form configured for this page. Add a form using the Underline Form field in Contentstack.
            </p>
          </div>
        )}

        {/* Executives Section */}
        {entry?.executives && (
          <Executives executivesData={entry.executives} />
        )}
      </div>

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}
