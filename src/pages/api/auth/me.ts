import type { NextApiRequest, NextApiResponse } from "next";

interface UserProfile {
  id: string;
  email: string;
  company_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string | null;
  job_title: string;
  department: string;
  employee_id: string | null;
  hire_date: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  last_login_at: string;
  is_active: boolean;
  is_verified: boolean;
  preferences: Record<string, unknown>;
  timezone: string;
  language: string;
  company_creator: boolean;
  role: string;
}

interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserProfile | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Authorization header required" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Call the real backend API
    const response = await fetch("https://startup-flo-backend.onrender.com/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        error: errorData.message || `Failed to get user profile with status ${response.status}` 
      });
    }

    const userProfileResponse: UserProfileResponse = await response.json();
    res.status(200).json(userProfileResponse.data);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
} 