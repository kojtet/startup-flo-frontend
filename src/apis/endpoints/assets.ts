// Assets API endpoints
// Note: These endpoints cover comprehensive asset management functionality
export const ASSETS_ENDPOINTS = {
  // Asset CRUD endpoints
  ASSETS_LIST: "/assets/assets",                            // GET all assets, POST create asset
  ASSET_DETAIL: (assetId: string) => `/assets/assets/${assetId}`, // GET, PUT, DELETE asset by ID
  
  // Asset assignment endpoints
  ASSET_ASSIGN: (assetId: string) => `/assets/assignments/${assetId}`,     // POST assign asset to employee
  ASSET_UNASSIGN: (assetId: string) => `/asset/assignments/${assetId}/unassign`, // POST unassign asset from employee
  ASSET_TRANSFER: (assetId: string) => `/assets/${assetId}/transfer`, // POST transfer asset between employees
  ASSET_ASSIGNMENTS: (assetId: string) => `/asset/assignments/${assetId}`, // GET assignment history
  
  // Asset maintenance endpoints
  ASSET_MAINTENANCE: (assetId: string) => `/assets/${assetId}/maintenance`,           // GET maintenance history, POST schedule maintenance
  ASSET_MAINTENANCE_DETAIL: (maintenanceId: string) => `/assets/maintenance/${maintenanceId}`, // GET, PUT, DELETE maintenance record
  ASSET_MAINTENANCE_COMPLETE: (maintenanceId: string) => `/assets/maintenance/${maintenanceId}/complete`, // POST complete maintenance
  
  // Asset checkout/checkin endpoints
  ASSET_CHECKOUT: (assetId: string) => `/assets/${assetId}/checkout`, // POST checkout asset
  ASSET_CHECKIN: (assetId: string) => `/assets/${assetId}/checkin`,   // POST checkin asset
  
  // Asset status endpoints
  ASSET_STATUS_UPDATE: (assetId: string) => `/assets/${assetId}/status`, // PUT update asset status
  ASSET_DEPRECIATE: (assetId: string) => `/assets/${assetId}/depreciate`, // POST calculate/update depreciation
  
  // Asset categories endpoints
  ASSET_CATEGORIES: "/assets/categories",                   // POST create category
  ASSET_CATEGORIES_LIST: "/asset/categories",               // GET all categories
  ASSET_CATEGORY_DETAIL: (categoryId: string) => `/assets/categories/${categoryId}`, // GET, PUT, DELETE category by ID
  
  // Asset locations endpoints
  ASSET_LOCATIONS: "/assets/locations",                     // GET all locations, POST create location
  ASSET_LOCATION_DETAIL: (locationId: string) => `/assets/locations/${locationId}`, // GET, PUT, DELETE location by ID
  
  // Asset reports endpoints
  ASSET_REPORTS: "/assets/reports",                         // GET asset reports
  ASSET_REPORTS_SUMMARY: "/assets/reports/summary",         // GET asset summary report
  ASSET_REPORTS_DEPRECIATION: "/assets/reports/depreciation", // GET depreciation report
  ASSET_REPORTS_MAINTENANCE: "/assets/reports/maintenance", // GET maintenance report
  ASSET_REPORTS_UTILIZATION: "/assets/reports/utilization", // GET utilization report
  
  // Asset audit endpoints
  ASSET_AUDIT_LOG: (assetId: string) => `/assets/${assetId}/audit`,   // GET audit log for asset
  ASSET_AUDIT_TRAIL: "/assets/audit-trail",                // GET complete audit trail
  
  // Asset import/export endpoints
  ASSET_IMPORT: "/assets/import",                           // POST import assets from file
  ASSET_EXPORT: "/assets/export",                           // GET export assets to file
  ASSET_BULK_UPDATE: "/assets/bulk-update",                 // POST bulk update assets
  
  // Asset QR/Barcode endpoints
  ASSET_QR_CODE: (assetId: string) => `/assets/${assetId}/qr-code`,     // GET generate QR code
  ASSET_BARCODE: (assetId: string) => `/assets/${assetId}/barcode`,     // GET generate barcode
  ASSET_SCAN: "/assets/scan",                               // POST scan asset by QR/barcode
}; 