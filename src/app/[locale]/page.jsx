"use client";
import { useDataContext } from "@/context/data.context";
import { ContentstackClient } from "@/lib/contentstack-client";
import DynamicForm from "@/components/DynamicForm";
import { useState, useEffect, use } from "react";

export default function Home({ params }) {
  const { locale } = use(params);
  const initialData = useDataContext();

  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch the homepage content type which includes the groundwork_form field
      const data = await ContentstackClient.getElementByType("homepage", locale, initialData);
      if(data) {
        setEntry(data[0]);
        console.log(data[0]);
      } else {
        setEntry(null);
      }
    }

    ContentstackClient.onEntryChange(fetchData);
  }, [locale, initialData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        {entry?.title && (
          <div className="mb-8">
            <h1 
              {...entry?.$?.title} 
              className="text-4xl font-bold text-gray-900"
            >
              {entry.title}
            </h1>
          </div>
        )}

        {/* Render the Dynamic Form if it exists */}
        {entry?.groundwork_form && (
          <DynamicForm formData={entry.groundwork_form} />
        )}

        {/* Show message if no form data */}
        {entry && !entry.groundwork_form && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              No form configured for this page. Add a form using the Groundwork Form field in Contentstack.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
