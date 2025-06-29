// Vendor API endpoints
// Note: Based on Postman collection analysis, these endpoints handle vendor management
export const VENDOR_ENDPOINTS = {
  // Vendor CRUD endpoints
  VENDORS_CREATE: "/vendors/vendors",                   // POST create vendor
  VENDORS_LIST: "/vendor/vendors",                      // GET all vendors
  VENDOR_DETAIL: (vendorId: string) => `/vendor/vendors/${vendorId}`, // GET, PATCH, DELETE vendor by ID
  VENDORS_BY_CATEGORY: "/vendor/vendors",               // GET vendors by category (use query params)
  
  // Vendor Category endpoints
  VENDOR_CATEGORIES_CREATE: "/vendors/categories",      // POST create vendor category
  VENDOR_CATEGORIES_LIST: "/vendors/categories",        // GET all vendor categories (corrected)
  VENDOR_CATEGORY_DETAIL: (categoryId: string) => `/vendor/categories/${categoryId}`, // GET, PATCH, DELETE category by ID
}; 