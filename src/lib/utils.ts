import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@/apis/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets a user's display name, falling back to email if name is not available
 */
export function getUserDisplayName(user: { first_name?: string; last_name?: string; email: string } | null) {
  if (!user) return 'Unknown User';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  return user.email || 'Unknown User';
}

/**
 * Transforms a User object from the API to the format expected by ExtensibleLayout
 */
export function transformUserForLayout(user: User | null) {
  if (!user) return null;
  
  return {
    name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email || 'User',
    email: user.email || '',
    role: user.role || 'Employee',
    avatarUrl: user.avatar_url,
    companyId: user.company_id
  };
}
