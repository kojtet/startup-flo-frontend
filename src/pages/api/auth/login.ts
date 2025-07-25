import type { NextApiRequest, NextApiResponse } from "next";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    company_id: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: string;
    refreshTokenExpires: string;
    tokenType: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password }: LoginCredentials = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Call the real backend API
    const response = await fetch("https://startup-flo-backend.onrender.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        error: errorData.message || `Login failed with status ${response.status}` 
      });
    }

    const authResponse: AuthResponse = await response.json();
    res.status(200).json(authResponse);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
} 