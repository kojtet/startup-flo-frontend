import { ApiClient, type ApiConfigOverride } from "../core/client";
import { VENDOR_ENDPOINTS } from "../endpoints/vendor";
import { handleApiError } from "../core/errors";
import type {
  Vendor,
  CreateVendorData,
  UpdateVendorData,
  VendorsResponse,
  VendorResponse,
  VendorCategory,
  CreateVendorCategoryData,
  UpdateVendorCategoryData,
  VendorCategoriesResponse,
  VendorCategoryResponse,
  PaginationParams,
} from "../types";

export class VendorService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ================================
  // VENDOR CRUD OPERATIONS
  // ================================

  /**
   * Get all vendors
   * GET /vendor/vendors
   * Response: { vendors: Vendor[] }
   * 
   * @param params - Query parameters for filtering and pagination
   * @param config - API configuration override
   * @returns Promise resolving to vendors array
   * 
   * @example
   * ```typescript
   * // Get all vendors
   * const vendors = await vendorService.getVendors();
   * 
   * // Get vendors with pagination
   * const vendors = await vendorService.getVendors({ page: 1, limit: 20 });
   * 
   * // Filter by category
   * const vendors = await vendorService.getVendors({ category_id: "cat-123" });
   * 
   * // Filter by status
   * const activeVendors = await vendorService.getVendors({ status: "active" });
   * ```
   */
  async getVendors(params?: PaginationParams & {
    category_id?: string;
    status?: Vendor['status'];
    search?: string;
  }, config?: ApiConfigOverride): Promise<Vendor[]> {
    try {
      const response = await this.apiClient.get<VendorsResponse>(
        VENDOR_ENDPOINTS.VENDORS_LIST, 
        { ...config, params }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get vendors by category
   * GET /vendor/vendors?category_id={categoryId}
   * Response: { vendors: Vendor[] }
   * 
   * @param categoryId - Category ID to filter by
   * @param config - API configuration override
   * @returns Promise resolving to vendors array
   * 
   * @example
   * ```typescript
   * const softwareVendors = await vendorService.getVendorsByCategory("cat-123");
   * ```
   */
  async getVendorsByCategory(categoryId: string, config?: ApiConfigOverride): Promise<Vendor[]> {
    try {
      const response = await this.apiClient.get<VendorsResponse>(
        VENDOR_ENDPOINTS.VENDORS_BY_CATEGORY,
        { ...config, params: { category_id: categoryId } }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new vendor
   * POST /vendors/vendors
   * Body: {
   *   "name": "ABC Supplies Ltd",
   *   "category_id": "category-id",
   *   "tax_number": "TAX123456789",
   *   "phone": "+233123456789",
   *   "email": "contact@abcsupplies.com",
   *   "website": "https://abcsupplies.com",
   *   "address": "123 Business Street, Accra, Ghana"
   * }
   * Response: Vendor
   * 
   * @param data - Vendor creation data
   * @param config - API configuration override
   * @returns Promise resolving to created vendor
   * 
   * @example
   * ```typescript
   * const newVendor = await vendorService.createVendor({
   *   name: "ABC Supplies Ltd",
   *   category_id: "cat-123",
   *   tax_number: "TAX123456789",
   *   phone: "+233123456789",
   *   email: "contact@abcsupplies.com",
   *   website: "https://abcsupplies.com",
   *   address: "123 Business Street, Accra, Ghana",
   *   contact_person: "John Smith",
   *   payment_terms: "Net 30",
   *   credit_limit: 10000,
   *   status: "active"
   * });
   * ```
   */
  async createVendor(data: CreateVendorData, config?: ApiConfigOverride): Promise<Vendor> {
    try {
      const response = await this.apiClient.post<VendorResponse>(
        VENDOR_ENDPOINTS.VENDORS_CREATE, 
        data, 
        config
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single vendor by ID
   * GET /vendor/vendors/:id
   * Response: { vendor: Vendor }
   * 
   * @param vendorId - Vendor ID
   * @param config - API configuration override
   * @returns Promise resolving to vendor data
   * 
   * @example
   * ```typescript
   * const vendor = await vendorService.getVendorById("vendor-123");
   * console.log(vendor.name, vendor.email);
   * ```
   */
  async getVendorById(vendorId: string, config?: ApiConfigOverride): Promise<Vendor> {
    try {
      const response = await this.apiClient.get<VendorResponse>(
        VENDOR_ENDPOINTS.VENDOR_DETAIL(vendorId), 
        config
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update vendor
   * PATCH /vendor/vendors/:id
   * Body: {
   *   "name"?: "Updated Company Name",
   *   "email"?: "newemail@company.com",
   *   "phone"?: "+233987654321",
   *   "status"?: "active"
   * }
   * Response: Vendor
   * 
   * @param vendorId - Vendor ID
   * @param data - Vendor update data
   * @param config - API configuration override
   * @returns Promise resolving to updated vendor
   * 
   * @example
   * ```typescript
   * const updatedVendor = await vendorService.updateVendor("vendor-123", {
   *   email: "newemail@company.com",
   *   phone: "+233987654321",
   *   status: "active"
   * });
   * ```
   */
  async updateVendor(vendorId: string, data: UpdateVendorData, config?: ApiConfigOverride): Promise<Vendor> {
    try {
      const response = await this.apiClient.patch<VendorResponse>(
        VENDOR_ENDPOINTS.VENDOR_DETAIL(vendorId), 
        data, 
        config
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete vendor
   * DELETE /vendor/vendors/:id
   * Response: void
   * 
   * @param vendorId - Vendor ID
   * @param config - API configuration override
   * @returns Promise resolving when vendor is deleted
   * 
   * @example
   * ```typescript
   * await vendorService.deleteVendor("vendor-123");
   * ```
   */
  async deleteVendor(vendorId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(VENDOR_ENDPOINTS.VENDOR_DETAIL(vendorId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // VENDOR CATEGORY OPERATIONS
  // ================================

  /**
   * Get all vendor categories
   * GET /vendor/categories
   * Response: { categories: VendorCategory[] }
   * 
   * @param config - API configuration override
   * @returns Promise resolving to vendor categories
   * 
   * @example
   * ```typescript
   * const categories = await vendorService.getVendorCategories();
   * ```
   */
  async getVendorCategories(config?: ApiConfigOverride): Promise<VendorCategory[]> {
    try {
      const response = await this.apiClient.get<VendorCategoriesResponse>(
        VENDOR_ENDPOINTS.VENDOR_CATEGORIES_LIST, 
        config
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create vendor category
   * POST /vendors/categories
   * Body: {
   *   "name": "Software Vendors",
   *   "description": "Vendors providing software solutions"
   * }
   * Response: VendorCategory
   * 
   * @param data - Category creation data
   * @param config - API configuration override
   * @returns Promise resolving to created category
   * 
   * @example
   * ```typescript
   * const category = await vendorService.createVendorCategory({
   *   name: "Software Vendors",
   *   description: "Vendors providing software solutions and services"
   * });
   * ```
   */
  async createVendorCategory(data: CreateVendorCategoryData, config?: ApiConfigOverride): Promise<VendorCategory> {
    try {
      const response = await this.apiClient.post<VendorCategoryResponse>(
        VENDOR_ENDPOINTS.VENDOR_CATEGORIES_CREATE, 
        data, 
        config
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single vendor category by ID
   * GET /vendor/categories/:id
   * Response: { category: VendorCategory }
   * 
   * @param categoryId - Category ID
   * @param config - API configuration override
   * @returns Promise resolving to category data
   * 
   * @example
   * ```typescript
   * const category = await vendorService.getVendorCategoryById("cat-123");
   * ```
   */
  async getVendorCategoryById(categoryId: string, config?: ApiConfigOverride): Promise<VendorCategory> {
    try {
      const response = await this.apiClient.get<VendorCategoryResponse>(
        VENDOR_ENDPOINTS.VENDOR_CATEGORY_DETAIL(categoryId), 
        config
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update vendor category
   * PATCH /vendor/categories/:id
   * Body: {
   *   "name"?: "Updated Category Name",
   *   "description"?: "Updated description"
   * }
   * Response: VendorCategory
   * 
   * @param categoryId - Category ID
   * @param data - Category update data
   * @param config - API configuration override
   * @returns Promise resolving to updated category
   * 
   * @example
   * ```typescript
   * const updatedCategory = await vendorService.updateVendorCategory("cat-123", {
   *   name: "Hardware & Software Vendors",
   *   description: "Vendors providing both hardware and software solutions"
   * });
   * ```
   */
  async updateVendorCategory(categoryId: string, data: UpdateVendorCategoryData, config?: ApiConfigOverride): Promise<VendorCategory> {
    try {
      const response = await this.apiClient.patch<VendorCategoryResponse>(
        VENDOR_ENDPOINTS.VENDOR_CATEGORY_DETAIL(categoryId), 
        data, 
        config
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete vendor category
   * DELETE /vendor/categories/:id
   * Response: void
   * 
   * @param categoryId - Category ID
   * @param config - API configuration override
   * @returns Promise resolving when category is deleted
   * 
   * @example
   * ```typescript
   * await vendorService.deleteVendorCategory("cat-123");
   * ```
   */
  async deleteVendorCategory(categoryId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(VENDOR_ENDPOINTS.VENDOR_CATEGORY_DETAIL(categoryId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get vendors by status
   * 
   * @param status - Vendor status
   * @param config - API configuration override
   * @returns Promise resolving to vendors array
   * 
   * @example
   * ```typescript
   * const activeVendors = await vendorService.getVendorsByStatus("active");
   * const suspendedVendors = await vendorService.getVendorsByStatus("suspended");
   * ```
   */
  async getVendorsByStatus(status: Vendor['status'], config?: ApiConfigOverride): Promise<Vendor[]> {
    return this.getVendors({ status }, config);
  }

  /**
   * Get active vendors
   * 
   * @param config - API configuration override
   * @returns Promise resolving to active vendors
   * 
   * @example
   * ```typescript
   * const activeVendors = await vendorService.getActiveVendors();
   * ```
   */
  async getActiveVendors(config?: ApiConfigOverride): Promise<Vendor[]> {
    return this.getVendorsByStatus("active", config);
  }

  /**
   * Get inactive vendors
   * 
   * @param config - API configuration override
   * @returns Promise resolving to inactive vendors
   * 
   * @example
   * ```typescript
   * const inactiveVendors = await vendorService.getInactiveVendors();
   * ```
   */
  async getInactiveVendors(config?: ApiConfigOverride): Promise<Vendor[]> {
    return this.getVendorsByStatus("inactive", config);
  }

  /**
   * Get suspended vendors
   * 
   * @param config - API configuration override
   * @returns Promise resolving to suspended vendors
   * 
   * @example
   * ```typescript
   * const suspendedVendors = await vendorService.getSuspendedVendors();
   * ```
   */
  async getSuspendedVendors(config?: ApiConfigOverride): Promise<Vendor[]> {
    return this.getVendorsByStatus("suspended", config);
  }

  /**
   * Search vendors by name or email
   * 
   * @param searchTerm - Search term
   * @param config - API configuration override
   * @returns Promise resolving to matching vendors
   * 
   * @example
   * ```typescript
   * const vendors = await vendorService.searchVendors("ABC Supplies");
   * ```
   */
  async searchVendors(searchTerm: string, config?: ApiConfigOverride): Promise<Vendor[]> {
    return this.getVendors({ search: searchTerm }, config);
  }

  /**
   * Update vendor status
   * 
   * @param vendorId - Vendor ID
   * @param status - New status
   * @param config - API configuration override
   * @returns Promise resolving to updated vendor
   * 
   * @example
   * ```typescript
   * await vendorService.updateVendorStatus("vendor-123", "suspended");
   * ```
   */
  async updateVendorStatus(vendorId: string, status: Vendor['status'], config?: ApiConfigOverride): Promise<Vendor> {
    return this.updateVendor(vendorId, { status }, config);
  }

  /**
   * Activate vendor
   * 
   * @param vendorId - Vendor ID
   * @param config - API configuration override
   * @returns Promise resolving to activated vendor
   * 
   * @example
   * ```typescript
   * const activatedVendor = await vendorService.activateVendor("vendor-123");
   * ```
   */
  async activateVendor(vendorId: string, config?: ApiConfigOverride): Promise<Vendor> {
    return this.updateVendorStatus(vendorId, "active", config);
  }

  /**
   * Deactivate vendor
   * 
   * @param vendorId - Vendor ID
   * @param config - API configuration override
   * @returns Promise resolving to deactivated vendor
   * 
   * @example
   * ```typescript
   * const deactivatedVendor = await vendorService.deactivateVendor("vendor-123");
   * ```
   */
  async deactivateVendor(vendorId: string, config?: ApiConfigOverride): Promise<Vendor> {
    return this.updateVendorStatus(vendorId, "inactive", config);
  }

  /**
   * Suspend vendor
   * 
   * @param vendorId - Vendor ID
   * @param config - API configuration override
   * @returns Promise resolving to suspended vendor
   * 
   * @example
   * ```typescript
   * const suspendedVendor = await vendorService.suspendVendor("vendor-123");
   * ```
   */
  async suspendVendor(vendorId: string, config?: ApiConfigOverride): Promise<Vendor> {
    return this.updateVendorStatus(vendorId, "suspended", config);
  }

  /**
   * Create vendor with simplified data
   * 
   * @param name - Vendor name
   * @param email - Vendor email
   * @param phone - Vendor phone
   * @param options - Additional vendor options
   * @param config - API configuration override
   * @returns Promise resolving to created vendor
   * 
   * @example
   * ```typescript
   * const vendor = await vendorService.createVendorSimple(
   *   "ABC Supplies",
   *   "contact@abc.com",
   *   "+233123456789",
   *   { address: "123 Business St", website: "https://abc.com" }
   * );
   * ```
   */
  async createVendorSimple(
    name: string,
    email: string,
    phone: string,
    options?: {
      categoryId?: string;
      address?: string;
      website?: string;
      contactPerson?: string;
      paymentTerms?: string;
      creditLimit?: number;
      notes?: string;
    },
    config?: ApiConfigOverride
  ): Promise<Vendor> {
    const vendorData: CreateVendorData = {
      name,
      email,
      phone,
      category_id: options?.categoryId,
      address: options?.address,
      website: options?.website,
      contact_person: options?.contactPerson,
      payment_terms: options?.paymentTerms,
      credit_limit: options?.creditLimit,
      notes: options?.notes,
      status: "active"
    };

    return this.createVendor(vendorData, config);
  }

  /**
   * Get vendor count by status
   * 
   * @param config - API configuration override
   * @returns Promise resolving to vendor count by status
   * 
   * @example
   * ```typescript
   * const counts = await vendorService.getVendorCounts();
   * console.log(`Active: ${counts.active}, Inactive: ${counts.inactive}`);
   * ```
   */
  async getVendorCounts(config?: ApiConfigOverride): Promise<{
    active: number;
    inactive: number;
    suspended: number;
    total: number;
  }> {
    const [activeVendors, inactiveVendors, suspendedVendors] = await Promise.all([
      this.getActiveVendors(config),
      this.getInactiveVendors(config),
      this.getSuspendedVendors(config),
    ]);

    return {
      active: activeVendors.length,
      inactive: inactiveVendors.length,
      suspended: suspendedVendors.length,
      total: activeVendors.length + inactiveVendors.length + suspendedVendors.length,
    };
  }

  /**
   * Find vendor category by name
   * 
   * @param name - Category name
   * @param config - API configuration override
   * @returns Promise resolving to category or null if not found
   * 
   * @example
   * ```typescript
   * const category = await vendorService.findVendorCategoryByName("Software");
   * ```
   */
  async findVendorCategoryByName(name: string, config?: ApiConfigOverride): Promise<VendorCategory | null> {
    const categories = await this.getVendorCategories(config);
    return categories.find(category => category.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Create vendor category if it doesn't exist
   * 
   * @param name - Category name
   * @param description - Category description
   * @param config - API configuration override
   * @returns Promise resolving to existing or newly created category
   * 
   * @example
   * ```typescript
   * const category = await vendorService.createVendorCategoryIfNotExists(
   *   "Office Supplies",
   *   "Vendors providing office supplies and equipment"
   * );
   * ```
   */
  async createVendorCategoryIfNotExists(
    name: string,
    description?: string,
    config?: ApiConfigOverride
  ): Promise<VendorCategory> {
    const existingCategory = await this.findVendorCategoryByName(name, config);
    
    if (existingCategory) {
      return existingCategory;
    }

    return this.createVendorCategory({ name, description }, config);
  }

  /**
   * Get vendor count by category
   * 
   * @param config - API configuration override
   * @returns Promise resolving to vendor count by category
   * 
   * @example
   * ```typescript
   * const categoryCounts = await vendorService.getVendorCountsByCategory();
   * ```
   */
  async getVendorCountsByCategory(config?: ApiConfigOverride): Promise<{
    category_id: string;
    category_name: string;
    vendor_count: number;
  }[]> {
    const [vendors, categories] = await Promise.all([
      this.getVendors({}, config),
      this.getVendorCategories(config),
    ]);

    return categories.map(category => {
      const vendorCount = vendors.filter(vendor => vendor.category_id === category.id).length;
      return {
        category_id: category.id,
        category_name: category.name,
        vendor_count: vendorCount,
      };
    });
  }

  /**
   * Check if vendor is active
   */
  isVendorActive(vendor: Vendor): boolean {
    return vendor.status === "active";
  }

  /**
   * Check if vendor is suspended
   */
  isVendorSuspended(vendor: Vendor): boolean {
    return vendor.status === "suspended";
  }

  /**
   * Check if vendor is inactive
   */
  isVendorInactive(vendor: Vendor): boolean {
    return vendor.status === "inactive";
  }

  /**
   * Get vendor status color for UI
   */
  getVendorStatusColor(status: Vendor['status']): string {
    const colors = {
      active: "#10B981",      // green
      inactive: "#6B7280",    // gray
      suspended: "#EF4444"    // red
    };
    return colors[status] || "#6B7280"; // gray as default
  }

  /**
   * Format vendor display name
   */
  getVendorDisplayName(vendor: Vendor): string {
    return vendor.name;
  }

  /**
   * Get vendor contact information
   */
  getVendorContactInfo(vendor: Vendor): {
    email?: string;
    phone?: string;
    website?: string;
    contact_person?: string;
  } {
    return {
      email: vendor.email,
      phone: vendor.phone,
      website: vendor.website,
      contact_person: vendor.contact_person,
    };
  }
} 