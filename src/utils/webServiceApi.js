/**
 * API utility for fetching data from web services via secure backend proxy
 * Headers and API keys are never exposed to the frontend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';

/**
 * Fetch data from a web service via the secure backend proxy
 * @param {string} webServiceId - The unique web service ID
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function fetchWebServiceData(webServiceId) {
  try {
    const response = await fetch(`${API_URL}/api/web-services/${webServiceId}/fetch`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Fetch failed' }));
      throw new Error(error.error || 'Failed to fetch web service data');
    }

    return response.json();
  } catch (error) {
    console.error('Web service fetch error:', error);
    throw error;
  }
}

