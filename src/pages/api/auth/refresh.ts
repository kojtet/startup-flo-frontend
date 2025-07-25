import type { NextApiRequest, NextApiResponse } from "next";
import { AuthResponse } from "@/apis/types/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // Mock token validation - extract user ID from refresh token
    const tokenParts = refreshToken.split("_");
    if (tokenParts.length < 4) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const userId = tokenParts[3]; // Extract user ID from mock refresh token
    
    // Generate new tokens
    const tokens = {
      accessToken: `mock_access_token_${userId}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${userId}_${Date.now()}`,
      accessTokenExpires: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      tokenType: "Bearer",
    };

    // Mock user data (in real app, fetch from database)
    const user = {
      id: userId,
      email: "user@example.com",
      firstName: "User",
      lastName: "Name",
      role: "user" as any,
      companyId: "1",
      jobTitle: "Employee",
      isActive: true,
      emailVerifiedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response: AuthResponse = {
      message: "Token refreshed successfully",
      user,
      tokens,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
} 