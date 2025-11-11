"use client";
import { useDataContext } from "@/context/data.context";
import { ContentstackClient } from "@/lib/contentstack-client";
import DynamicForm from "@/components/DynamicForm";
import ColorPickerDemo from "@/components/ColorPickerDemo";
import { useState, useEffect, use } from "react";

export default function Home({ params }) {
  const { locale } = use(params);
  const initialData = useDataContext();

  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch the homepage content type which includes the underline_form field
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
        {/* Color Picker Demo */}
        {entry && (entry.background_color || entry.line_color || entry.text_color) && (
          <div className="mb-8">
            <ColorPickerDemo 
              colors={{
                background_color: entry.background_color,
                line_color: entry.line_color,
                text_color: entry.text_color
              }}
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
      </div>
    </div>
  );
}
