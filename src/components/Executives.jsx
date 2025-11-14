"use client";
import { useState, useEffect } from "react";
import { fetchWebServiceData } from "@/utils/webServiceApi";

/**
 * Executives Component
 * Fetches and displays company executives from a web service endpoint via secure backend proxy
 * Headers and API keys are never exposed to the frontend - handled securely server-side
 * 
 * @param {Object} props.executivesData - Web service configuration from Contentstack
 * @param {string} props.executivesData.webServiceId - Web service ID (used to fetch config server-side)
 * @param {string} props.executivesData.componentKey - Component key identifier
 */
export default function Executives({ executivesData }) {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExecutives = async () => {
      if (!executivesData?.webServiceId) {
        setError("No web service ID configured");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch via secure backend proxy - headers/keys handled server-side
        const response = await fetchWebServiceData(executivesData.webServiceId);

        // Handle response format
        if (response.success && response.data) {
          const data = response.data;
          
          // Handle different response formats
          if (data.success && data.data) {
            setExecutives(data.data);
          } else if (Array.isArray(data)) {
            setExecutives(data);
          } else if (data.data && Array.isArray(data.data)) {
            setExecutives(data.data);
          } else {
            throw new Error("Unexpected response format");
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error('Error fetching executives:', err);
        setError(err.message || 'Failed to load executives');
      } finally {
        setLoading(false);
      }
    };

    fetchExecutives();
  }, [executivesData]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading executives...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold mb-1">Error Loading Executives</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!executives || executives.length === 0) {
    return (
      <div className="mb-8">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-center">No executives found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {executives.map((executive, index) => (
            <div
              key={executive.id || index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100 relative">
                {executive.imageUrl ? (
                  <img
                    src={executive.imageUrl}
                    alt={executive.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-24 h-24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {executive.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {executive.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

