// API client for OptiChoice
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optichoice.onrender.com';

async function apiCall(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

export async function submitAnalysis(analysisData) {
  return apiCall('/analyze', analysisData);
}

export async function submitDecision(decisionData) {
  return apiCall('/decide', decisionData);
}

export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
