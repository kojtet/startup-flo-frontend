import type { ApiClient } from "../core/client";
import { 
  Asset, 
  CreateAssetData, 
  UpdateAssetData, 
  AssetsResponse, 
  AssetResponse,
  AssetAssignment,
  AssignAssetData,
  UnassignAssetData,
  TransferAssetData,
  AssetAssignmentsResponse,
  AssetAssignmentResponse,
  AssetMaintenance,
  CreateMaintenanceData,
  UpdateMaintenanceData,
  CompleteMaintenanceData,
  AssetMaintenanceResponse,
  MaintenanceResponse,
  AssetCheckout,
  CheckoutAssetData,
  CheckinAssetData,
  AssetCheckoutsResponse,
  AssetCheckoutResponse,
  AssetCategory,
  CreateAssetCategoryData,
  UpdateAssetCategoryData,
  AssetCategoriesResponse,
  AssetCategoryResponse,
  AssetLocation,
  CreateAssetLocationData,
  UpdateAssetLocationData,
  AssetLocationsResponse,
  AssetLocationResponse,
  UpdateAssetStatusData,
  DepreciateAssetData,
  AssetDepreciationResponse,
  AssetReport,
  AssetSummaryReport,
  AssetDepreciationReport,
  AssetMaintenanceReport,
  AssetUtilizationReport,
  AssetReportsResponse,
  AssetReportResponse,
  AssetAuditLog,
  AssetAuditResponse,
  AssetAuditTrailResponse,
  AssetImportData,
  AssetImportResponse,
  AssetExportData,
  AssetExportResponse,
  AssetBulkUpdateData,
  AssetBulkUpdateResponse,
  AssetQRCodeResponse,
  AssetBarcodeResponse,
  AssetScanData,
  AssetScanResponse,
  PaginatedResponse, 
  PaginationParams 
} from "../types";
import { ASSETS_ENDPOINTS } from "../endpoints/assets";
import { handleApiError } from "../core/errors";
import { type ApiConfigOverride } from "../core/client";

export class AssetsService {
  constructor(private apiClient: ApiClient) {}

  // ================================
  // ASSET CRUD OPERATIONS
  // ================================

  /**
   * Get all assets
   * 
   * @param params - Query parameters for filtering and pagination
   * @param config - API configuration override
   * @returns Promise resolving to assets array
   * 
   * @example
   * ```typescript
   * // Get all assets
   * const assets = await assetsService.getAssets();
   * 
   * // Get assets with pagination
   * const assets = await assetsService.getAssets({ page: 1, limit: 20 });
   * 
   * // Filter by status
   * const availableAssets = await assetsService.getAssets({ status: "in_stock" });
   * ```
   */
  async getAssets(params?: PaginationParams & {
    status?: Asset['status'];
    category_id?: string;
    location?: string;
    search?: string;
  }, config?: ApiConfigOverride): Promise<Asset[]> {
    try {
      const response = await this.apiClient.get<Asset[]>(ASSETS_ENDPOINTS.ASSETS_LIST, { params, ...config });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get asset by ID
   * 
   * @param id - Asset ID
   * @param config - API configuration override
   * @returns Promise resolving to asset data
   * 
   * @example
   * ```typescript
   * const asset = await assetsService.getAsset("asset-123");
   * console.log(asset.name, asset.status);
   * ```
   */
  async getAsset(id: string, config?: ApiConfigOverride): Promise<Asset> {
    try {
      const response = await this.apiClient.get<AssetResponse>(ASSETS_ENDPOINTS.ASSET_DETAIL(id), config);
      return response.data.asset;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new asset
   * 
   * @param data - Asset creation data
   * @param config - API configuration override
   * @returns Promise resolving to created asset
   * 
   * @example
   * ```typescript
   * const newAsset = await assetsService.createAsset({
   *   name: "MacBook Pro 2024",
   *   category_id: "b58bc100-2d24-496d-830e-62ebbd9ac021",
   *   serial_number: "MBP2024-123456",
   *   purchase_date: "2024-03-15",
   *   purchase_cost: 1999.99,
   *   status: "active",
   *   location: "Office A",
   *   description: "16-inch MacBook Pro with M3 Pro",
   *   warranty_expiry: "2027-03-15",
   *   depreciation_method: "straight_line",
   *   useful_life_years: 4,
   *   asset_tag: "SDG3223",
   *   depreciation_start: "2023-04-05"
   * });
   * ```
   */
  async createAsset(data: CreateAssetData, config?: ApiConfigOverride): Promise<Asset> {
    try {
      const response = await this.apiClient.post<AssetResponse>(ASSETS_ENDPOINTS.ASSETS_LIST, data, config);
      return response.data.asset;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an asset
   * 
   * @param id - Asset ID
   * @param data - Asset update data
   * @param config - API configuration override
   * @returns Promise resolving to updated asset
   * 
   * @example
   * ```typescript
   * const updatedAsset = await assetsService.updateAsset("asset-123", {
   *   status: "maintenance",
   *   condition: "fair",
   *   notes: "Screen replacement needed"
   * });
   * ```
   */
  async updateAsset(id: string, data: UpdateAssetData, config?: ApiConfigOverride): Promise<Asset> {
    try {
      const response = await this.apiClient.put<AssetResponse>(ASSETS_ENDPOINTS.ASSET_DETAIL(id), data, config);
      return response.data.asset;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete an asset
   * 
   * @param id - Asset ID
   * @param config - API configuration override
   * @returns Promise resolving when asset is deleted
   * 
   * @example
   * ```typescript
   * await assetsService.deleteAsset("asset-123");
   * ```
   */
  async deleteAsset(id: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(ASSETS_ENDPOINTS.ASSET_DETAIL(id), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET ASSIGNMENT OPERATIONS
  // ================================

  /**
   * Assign asset to employee
   * 
   * @param assetId - Asset ID
   * @param data - Assignment data
   * @param config - API configuration override
   * @returns Promise resolving to assignment record
   * 
   * @example
   * ```typescript
   * const assignment = await assetsService.assignAsset("02436c35-a55e-4a83-b53d-47a16c6cda7f", {
   *   employee_id: "b888ba13-e47d-4a0f-8fb6-1d2fe8e3dec3",
   *   assignment_date: "2024-03-20",
   *   expected_return_date: "2025-03-20",
   *   notes: "Assigned for project work"
   * });
   * ```
   */
  async assignAsset(assetId: string, data: AssignAssetData, config?: ApiConfigOverride): Promise<AssetAssignment> {
    try {
      const response = await this.apiClient.post<AssetAssignmentResponse>(
        ASSETS_ENDPOINTS.ASSET_ASSIGN(assetId), 
        data, 
        config
      );
      return response.data.assignment;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Unassign asset from employee
   * 
   * @param assetId - Asset ID
   * @param data - Unassignment data
   * @param config - API configuration override
   * @returns Promise resolving to updated assignment record
   * 
   * @example
   * ```typescript
   * await assetsService.unassignAsset("asset-123", {
   *   return_date: "2024-03-25",
   *   return_condition: "good",
   *   notes: "Returned in good condition"
   * });
   * ```
   */
  async unassignAsset(assetId: string, data: UnassignAssetData, config?: ApiConfigOverride): Promise<AssetAssignment> {
    try {
      const response = await this.apiClient.post<AssetAssignmentResponse>(
        ASSETS_ENDPOINTS.ASSET_UNASSIGN(assetId), 
        data, 
        config
      );
      return response.data.assignment;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Transfer asset between employees
   * 
   * @param assetId - Asset ID
   * @param data - Transfer data
   * @param config - API configuration override
   * @returns Promise resolving to new assignment record
   * 
   * @example
   * ```typescript
   * const newAssignment = await assetsService.transferAsset("asset-123", {
   *   from_employee_id: "emp-456",
   *   to_employee_id: "emp-789",
   *   notes: "Team restructuring"
   * });
   * ```
   */
  async transferAsset(assetId: string, data: TransferAssetData, config?: ApiConfigOverride): Promise<AssetAssignment> {
    try {
      const response = await this.apiClient.post<AssetAssignmentResponse>(
        ASSETS_ENDPOINTS.ASSET_TRANSFER(assetId), 
        data, 
        config
      );
      return response.data.assignment;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get asset assignment history
   * 
   * @param assetId - Asset ID
   * @param config - API configuration override
   * @returns Promise resolving to assignment history
   * 
   * @example
   * ```typescript
   * const history = await assetsService.getAssetAssignmentHistory("asset-123");
   * ```
   */
  async getAssetAssignmentHistory(assetId: string, config?: ApiConfigOverride): Promise<AssetAssignment[]> {
    try {
      const response = await this.apiClient.get<AssetAssignment[]>(
        ASSETS_ENDPOINTS.ASSET_ASSIGNMENTS(assetId), 
        config
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET MAINTENANCE OPERATIONS
  // ================================

  /**
   * Get asset maintenance records
   * 
   * @param assetId - Asset ID
   * @param config - API configuration override
   * @returns Promise resolving to maintenance records
   * 
   * @example
   * ```typescript
   * const maintenance = await assetsService.getAssetMaintenance("asset-123");
   * ```
   */
  async getAssetMaintenance(assetId: string, config?: ApiConfigOverride): Promise<AssetMaintenance[]> {
    try {
      const response = await this.apiClient.get<AssetMaintenanceResponse>(
        ASSETS_ENDPOINTS.ASSET_MAINTENANCE(assetId), 
        config
      );
      return response.data.maintenance;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Schedule asset maintenance
   * 
   * @param data - Maintenance scheduling data
   * @param config - API configuration override
   * @returns Promise resolving to scheduled maintenance record
   * 
   * @example
   * ```typescript
   * const maintenance = await assetsService.scheduleMaintenance({
   *   asset_id: "asset-123",
   *   type: "preventive",
   *   title: "Annual laptop servicing",
   *   scheduled_date: "2024-06-15",
   *   cost: 150.00
   * });
   * ```
   */
  async scheduleMaintenance(data: CreateMaintenanceData, config?: ApiConfigOverride): Promise<AssetMaintenance> {
    try {
      const response = await this.apiClient.post<MaintenanceResponse>(
        ASSETS_ENDPOINTS.ASSET_MAINTENANCE(""), 
        data, 
        config
      );
      return response.data.maintenance;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update maintenance record
   * 
   * @param maintenanceId - Maintenance ID
   * @param data - Maintenance update data
   * @param config - API configuration override
   * @returns Promise resolving to updated maintenance record
   * 
   * @example
   * ```typescript
   * const updatedMaintenance = await assetsService.updateMaintenance("maint-123", {
   *   status: "in_progress",
   *   notes: "Parts ordered"
   * });
   * ```
   */
  async updateMaintenance(maintenanceId: string, data: UpdateMaintenanceData, config?: ApiConfigOverride): Promise<AssetMaintenance> {
    try {
      const response = await this.apiClient.put<MaintenanceResponse>(
        ASSETS_ENDPOINTS.ASSET_MAINTENANCE_DETAIL(maintenanceId), 
        data, 
        config
      );
      return response.data.maintenance;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Complete maintenance
   * 
   * @param maintenanceId - Maintenance ID
   * @param data - Completion data
   * @param config - API configuration override
   * @returns Promise resolving to completed maintenance record
   * 
   * @example
   * ```typescript
   * const completedMaintenance = await assetsService.completeMaintenance("maint-123", {
   *   completed_date: "2024-06-16",
   *   cost: 175.50,
   *   notes: "Screen replaced, battery calibrated",
   *   asset_condition: "excellent"
   * });
   * ```
   */
  async completeMaintenance(maintenanceId: string, data: CompleteMaintenanceData, config?: ApiConfigOverride): Promise<AssetMaintenance> {
    try {
      const response = await this.apiClient.post<MaintenanceResponse>(
        ASSETS_ENDPOINTS.ASSET_MAINTENANCE_COMPLETE(maintenanceId), 
        data, 
        config
      );
      return response.data.maintenance;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET CHECKOUT/CHECKIN OPERATIONS
  // ================================

  /**
   * Checkout asset to employee
   * 
   * @param assetId - Asset ID
   * @param data - Checkout data
   * @param config - API configuration override
   * @returns Promise resolving to checkout record
   * 
   * @example
   * ```typescript
   * const checkout = await assetsService.checkoutAsset("asset-123", {
   *   employee_id: "emp-456",
   *   expected_return_date: "2024-07-01",
   *   checkout_condition: "excellent",
   *   notes: "For conference presentation"
   * });
   * ```
   */
  async checkoutAsset(assetId: string, data: CheckoutAssetData, config?: ApiConfigOverride): Promise<AssetCheckout> {
    try {
      const response = await this.apiClient.post<AssetCheckoutResponse>(
        ASSETS_ENDPOINTS.ASSET_CHECKOUT(assetId), 
        data, 
        config
      );
      return response.data.checkout;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Checkin asset from employee
   * 
   * @param assetId - Asset ID
   * @param data - Checkin data
   * @param config - API configuration override
   * @returns Promise resolving to updated checkout record
   * 
   * @example
   * ```typescript
   * const checkin = await assetsService.checkinAsset("asset-123", {
   *   return_condition: "good",
   *   notes: "Minor scratches on back cover"
   * });
   * ```
   */
  async checkinAsset(assetId: string, data: CheckinAssetData, config?: ApiConfigOverride): Promise<AssetCheckout> {
    try {
      const response = await this.apiClient.post<AssetCheckoutResponse>(
        ASSETS_ENDPOINTS.ASSET_CHECKIN(assetId), 
        data, 
        config
      );
      return response.data.checkout;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get asset checkout history
   * 
   * @param assetId - Asset ID
   * @param config - API configuration override
   * @returns Promise resolving to checkout history
   * 
   * @example
   * ```typescript
   * const checkouts = await assetsService.getAssetCheckouts("asset-123");
   * ```
   */
  async getAssetCheckouts(assetId: string, config?: ApiConfigOverride): Promise<AssetCheckout[]> {
    try {
      const response = await this.apiClient.get<AssetCheckoutsResponse>(
        ASSETS_ENDPOINTS.ASSET_CHECKOUT(assetId), 
        config
      );
      return response.data.checkouts;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET CATEGORY OPERATIONS
  // ================================

  /**
   * Get all asset categories
   * 
   * @param config - API configuration override
   * @returns Promise resolving to asset categories
   * 
   * @example
   * ```typescript
   * const categories = await assetsService.getAssetCategories();
   * ```
   */
  async getAssetCategories(config?: ApiConfigOverride): Promise<AssetCategory[]> {
    try {
      const response = await this.apiClient.get<AssetCategory[]>(ASSETS_ENDPOINTS.ASSET_CATEGORIES_LIST, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create asset category
   * 
   * @param data - Category creation data
   * @param config - API configuration override
   * @returns Promise resolving to created category
   * 
   * @example
   * ```typescript
   * const category = await assetsService.createAssetCategory({
   *   name: "Computers",
   *   description: "Computer equipment and accessories",
   *   depreciation_rate: 25,
   *   depreciation_method: "straight_line",
   *   useful_life_months: 64
   * });
   * ```
   */
  async createAssetCategory(data: CreateAssetCategoryData, config?: ApiConfigOverride): Promise<AssetCategory> {
    try {
      const response = await this.apiClient.post<AssetCategoryResponse>(ASSETS_ENDPOINTS.ASSET_CATEGORIES, data, config);
      return response.data.category;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update asset category
   * 
   * @param categoryId - Category ID
   * @param data - Category update data
   * @param config - API configuration override
   * @returns Promise resolving to updated category
   * 
   * @example
   * ```typescript
   * const updatedCategory = await assetsService.updateAssetCategory("cat-123", {
   *   name: "Laptop Computers",
   *   depreciation_rate: 25
   * });
   * ```
   */
  async updateAssetCategory(categoryId: string, data: UpdateAssetCategoryData, config?: ApiConfigOverride): Promise<AssetCategory> {
    try {
      const response = await this.apiClient.put<AssetCategoryResponse>(
        ASSETS_ENDPOINTS.ASSET_CATEGORY_DETAIL(categoryId), 
        data, 
        config
      );
      return response.data.category;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete asset category
   * 
   * @param categoryId - Category ID
   * @param config - API configuration override
   * @returns Promise resolving when category is deleted
   * 
   * @example
   * ```typescript
   * await assetsService.deleteAssetCategory("cat-123");
   * ```
   */
  async deleteAssetCategory(categoryId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(ASSETS_ENDPOINTS.ASSET_CATEGORY_DETAIL(categoryId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET LOCATION OPERATIONS
  // ================================

  /**
   * Get all asset locations
   * 
   * @param config - API configuration override
   * @returns Promise resolving to asset locations
   * 
   * @example
   * ```typescript
   * const locations = await assetsService.getAssetLocations();
   * ```
   */
  async getAssetLocations(config?: ApiConfigOverride): Promise<AssetLocation[]> {
    try {
      const response = await this.apiClient.get<AssetLocationsResponse>(ASSETS_ENDPOINTS.ASSET_LOCATIONS, config);
      return response.data.locations;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create asset location
   * 
   * @param data - Location creation data
   * @param config - API configuration override
   * @returns Promise resolving to created location
   * 
   * @example
   * ```typescript
   * const location = await assetsService.createAssetLocation({
   *   name: "Main Office",
   *   description: "Primary office building",
   *   address: "123 Business St",
   *   building: "Building A",
   *   floor: "2nd Floor"
   * });
   * ```
   */
  async createAssetLocation(data: CreateAssetLocationData, config?: ApiConfigOverride): Promise<AssetLocation> {
    try {
      const response = await this.apiClient.post<AssetLocationResponse>(ASSETS_ENDPOINTS.ASSET_LOCATIONS, data, config);
      return response.data.location;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update asset location
   * 
   * @param locationId - Location ID
   * @param data - Location update data
   * @param config - API configuration override
   * @returns Promise resolving to updated location
   * 
   * @example
   * ```typescript
   * const updatedLocation = await assetsService.updateAssetLocation("loc-123", {
   *   name: "Main Office - Renovated",
   *   floor: "3rd Floor"
   * });
   * ```
   */
  async updateAssetLocation(locationId: string, data: UpdateAssetLocationData, config?: ApiConfigOverride): Promise<AssetLocation> {
    try {
      const response = await this.apiClient.put<AssetLocationResponse>(
        ASSETS_ENDPOINTS.ASSET_LOCATION_DETAIL(locationId), 
        data, 
        config
      );
      return response.data.location;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete asset location
   * 
   * @param locationId - Location ID
   * @param config - API configuration override
   * @returns Promise resolving when location is deleted
   * 
   * @example
   * ```typescript
   * await assetsService.deleteAssetLocation("loc-123");
   * ```
   */
  async deleteAssetLocation(locationId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(ASSETS_ENDPOINTS.ASSET_LOCATION_DETAIL(locationId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET STATUS & DEPRECIATION
  // ================================

  /**
   * Update asset status
   * 
   * @param assetId - Asset ID
   * @param data - Status update data
   * @param config - API configuration override
   * @returns Promise resolving to updated asset
   * 
   * @example
   * ```typescript
   * const updatedAsset = await assetsService.updateAssetStatus("asset-123", {
   *   status: "retired",
   *   condition: "poor",
   *   notes: "End of useful life"
   * });
   * ```
   */
  async updateAssetStatus(assetId: string, data: UpdateAssetStatusData, config?: ApiConfigOverride): Promise<Asset> {
    try {
      const response = await this.apiClient.put<AssetResponse>(
        ASSETS_ENDPOINTS.ASSET_STATUS_UPDATE(assetId), 
        data, 
        config
      );
      return response.data.asset;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Calculate asset depreciation
   * 
   * @param assetId - Asset ID
   * @param data - Depreciation calculation data
   * @param config - API configuration override
   * @returns Promise resolving to depreciation details
   * 
   * @example
   * ```typescript
   * const depreciation = await assetsService.depreciateAsset("asset-123", {
   *   depreciation_method: "straight_line",
   *   useful_life_years: 5,
   *   salvage_value: 100
   * });
   * ```
   */
  async depreciateAsset(assetId: string, data: DepreciateAssetData, config?: ApiConfigOverride): Promise<AssetDepreciationResponse> {
    try {
      const response = await this.apiClient.post<AssetDepreciationResponse>(
        ASSETS_ENDPOINTS.ASSET_DEPRECIATE(assetId), 
        data, 
        config
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET REPORTS
  // ================================

  /**
   * Get asset summary report
   * 
   * @param config - API configuration override
   * @returns Promise resolving to asset summary
   * 
   * @example
   * ```typescript
   * const summary = await assetsService.getAssetSummary();
   * console.log(`Total assets: ${summary.total_assets}`);
   * ```
   */
  async getAssetSummary(config?: ApiConfigOverride): Promise<AssetSummaryReport> {
    try {
      const response = await this.apiClient.get<{ summary: AssetSummaryReport }>(
        ASSETS_ENDPOINTS.ASSET_REPORTS_SUMMARY, 
        config
      );
      return response.data.summary;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get asset depreciation report
   * 
   * @param config - API configuration override
   * @returns Promise resolving to depreciation report
   * 
   * @example
   * ```typescript
   * const depreciationReport = await assetsService.getDepreciationReport();
   * ```
   */
  async getDepreciationReport(config?: ApiConfigOverride): Promise<AssetDepreciationReport> {
    try {
      const response = await this.apiClient.get<{ report: AssetDepreciationReport }>(
        ASSETS_ENDPOINTS.ASSET_REPORTS_DEPRECIATION, 
        config
      );
      return response.data.report;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get asset maintenance report
   * 
   * @param config - API configuration override
   * @returns Promise resolving to maintenance report
   * 
   * @example
   * ```typescript
   * const maintenanceReport = await assetsService.getMaintenanceReport();
   * ```
   */
  async getMaintenanceReport(config?: ApiConfigOverride): Promise<AssetMaintenanceReport> {
    try {
      const response = await this.apiClient.get<{ report: AssetMaintenanceReport }>(
        ASSETS_ENDPOINTS.ASSET_REPORTS_MAINTENANCE, 
        config
      );
      return response.data.report;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get asset utilization report
   * 
   * @param config - API configuration override
   * @returns Promise resolving to utilization report
   * 
   * @example
   * ```typescript
   * const utilizationReport = await assetsService.getUtilizationReport();
   * ```
   */
  async getUtilizationReport(config?: ApiConfigOverride): Promise<AssetUtilizationReport> {
    try {
      const response = await this.apiClient.get<{ report: AssetUtilizationReport }>(
        ASSETS_ENDPOINTS.ASSET_REPORTS_UTILIZATION, 
        config
      );
      return response.data.report;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET AUDIT & TRACKING
  // ================================

  /**
   * Get asset audit trail
   * 
   * @param assetId - Asset ID
   * @param config - API configuration override
   * @returns Promise resolving to audit trail
   * 
   * @example
   * ```typescript
   * const auditTrail = await assetsService.getAssetAuditTrail("asset-123");
   * ```
   */
  async getAssetAuditTrail(assetId: string, config?: ApiConfigOverride): Promise<AssetAuditLog[]> {
    try {
      const response = await this.apiClient.get<AssetAuditTrailResponse>(
        ASSETS_ENDPOINTS.ASSET_AUDIT_LOG(assetId), 
        config
      );
      return response.data.audit_trail;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ASSET QR/BARCODE OPERATIONS
  // ================================

  /**
   * Generate QR code for asset
   * 
   * @param assetId - Asset ID
   * @param config - API configuration override
   * @returns Promise resolving to QR code data
   * 
   * @example
   * ```typescript
   * const qrCode = await assetsService.generateAssetQRCode("asset-123");
   * console.log(qrCode.qr_code_url);
   * ```
   */
  async generateAssetQRCode(assetId: string, config?: ApiConfigOverride): Promise<AssetQRCodeResponse> {
    try {
      const response = await this.apiClient.post<AssetQRCodeResponse>(
        ASSETS_ENDPOINTS.ASSET_QR_CODE(assetId), 
        {}, 
        config
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Generate barcode for asset
   * 
   * @param assetId - Asset ID
   * @param config - API configuration override
   * @returns Promise resolving to barcode data
   * 
   * @example
   * ```typescript
   * const barcode = await assetsService.generateAssetBarcode("asset-123");
   * console.log(barcode.barcode_url);
   * ```
   */
  async generateAssetBarcode(assetId: string, config?: ApiConfigOverride): Promise<AssetBarcodeResponse> {
    try {
      const response = await this.apiClient.post<AssetBarcodeResponse>(
        ASSETS_ENDPOINTS.ASSET_BARCODE(assetId), 
        {}, 
        config
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Scan asset QR/barcode
   * 
   * @param data - Scan data
   * @param config - API configuration override
   * @returns Promise resolving to scanned asset data
   * 
   * @example
   * ```typescript
   * const scannedAsset = await assetsService.scanAsset({
   *   scan_data: "ASSET-123-QR-DATA",
   *   scan_type: "qr_code"
   * });
   * ```
   */
  async scanAsset(data: AssetScanData, config?: ApiConfigOverride): Promise<AssetScanResponse> {
    try {
      const response = await this.apiClient.post<AssetScanResponse>(ASSETS_ENDPOINTS.ASSET_SCAN, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // BULK OPERATIONS
  // ================================

  /**
   * Bulk update assets
   * 
   * @param data - Bulk update data
   * @param config - API configuration override
   * @returns Promise resolving to bulk update result
   * 
   * @example
   * ```typescript
   * const result = await assetsService.bulkUpdateAssets({
   *   asset_ids: ["asset-1", "asset-2", "asset-3"],
   *   updates: {
   *     status: "maintenance",
   *     location_id: "loc-456"
   *   }
   * });
   * ```
   */
  async bulkUpdateAssets(data: AssetBulkUpdateData, config?: ApiConfigOverride): Promise<AssetBulkUpdateResponse> {
    try {
      const response = await this.apiClient.put<AssetBulkUpdateResponse>(ASSETS_ENDPOINTS.ASSET_BULK_UPDATE, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Import assets from file
   * 
   * @param data - Import data
   * @param config - API configuration override
   * @returns Promise resolving to import result
   * 
   * @example
   * ```typescript
   * const importResult = await assetsService.importAssets({
   *   file: csvFile,
   *   file_type: "csv",
   *   options: {
   *     skip_header: true,
   *     update_existing: true
   *   }
   * });
   * ```
   */
  async importAssets(data: AssetImportData, config?: ApiConfigOverride): Promise<AssetImportResponse> {
    try {
      const response = await this.apiClient.post<AssetImportResponse>(ASSETS_ENDPOINTS.ASSET_IMPORT, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Export assets to file
   * 
   * @param data - Export data
   * @param config - API configuration override
   * @returns Promise resolving to export result
   * 
   * @example
   * ```typescript
   * const exportResult = await assetsService.exportAssets({
   *   format: "xlsx",
   *   filters: {
   *     status: ["available", "assigned"],
   *     category_ids: ["cat-123"]
   *   }
   * });
   * ```
   */
  async exportAssets(data: AssetExportData, config?: ApiConfigOverride): Promise<AssetExportResponse> {
    try {
      const response = await this.apiClient.post<AssetExportResponse>(ASSETS_ENDPOINTS.ASSET_EXPORT, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Check if asset is available for assignment
   */
  isAssetAvailable(asset: Asset): boolean {
    return asset.status === "in_stock" || asset.status === "active";
  }

  /**
   * Check if asset is assigned
   */
  isAssetAssigned(asset: Asset): boolean {
    return asset.status === "assigned";
  }

  /**
   * Check if asset is under maintenance
   */
  isAssetUnderMaintenance(asset: Asset): boolean {
    return asset.status === "maintenance";
  }

  /**
   * Check if asset is retired
   */
  isAssetRetired(asset: Asset): boolean {
    return asset.status === "retired";
  }

  /**
   * Calculate asset age in years
   */
  getAssetAge(asset: Asset): number {
    const purchaseDate = new Date(asset.purchase_date);
    const now = new Date();
    const ageInMs = now.getTime() - purchaseDate.getTime();
    return Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
  }

  /**
   * Calculate asset depreciation percentage
   */
  getDepreciationPercentage(asset: Asset): number {
    if (asset.purchase_cost === 0) return 0;
    const depreciation = asset.purchase_cost - asset.current_value;
    return (depreciation / asset.purchase_cost) * 100;
  }

  /**
   * Check if asset warranty is expired
   */
  isWarrantyExpired(asset: Asset): boolean {
    if (!asset.warranty_expiry) return false;
    const warrantyDate = new Date(asset.warranty_expiry);
    const now = new Date();
    return warrantyDate < now;
  }

  /**
   * Get asset condition color for UI
   */
  getConditionColor(condition: string): string {
    const colors: Record<string, string> = {
      excellent: "#10B981", // green
      good: "#3B82F6",      // blue
      fair: "#F59E0B",      // yellow
      poor: "#EF4444",      // red
      broken: "#7C2D12"     // dark red
    };
    return colors[condition] || "#6B7280"; // gray as default
  }

  /**
   * Get asset status color for UI
   */
  getStatusColor(status: Asset['status']): string {
    const colors = {
      active: "#10B981",      // green
      in_stock: "#10B981",    // green
      assigned: "#3B82F6",    // blue
      maintenance: "#F59E0B", // yellow
      retired: "#6B7280",     // gray
      lost: "#EF4444",        // red
      damaged: "#DC2626"      // red
    };
    return colors[status] || "#6B7280"; // gray as default
  }
} 