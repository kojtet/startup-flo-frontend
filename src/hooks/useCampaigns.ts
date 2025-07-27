import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Campaign, CreateCampaignData, UpdateCampaignData } from '@/apis/types';

// Dummy data for campaigns
const dummyCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Q4 Product Launch Campaign",
    description: "Comprehensive marketing campaign for our new product launch targeting enterprise customers",
    type: "email",
    status: "active",
    start_date: "2024-10-01",
    end_date: "2024-12-31",
    budget: 50000,
    target_audience: "Enterprise customers",
    impressions: 125000,
    clicks: 8500,
    conversions: 425,
    spend: 32000,
    company_id: "company-1",
    created_by: "user-1",
    created_at: "2024-09-15T10:00:00Z",
    updated_at: "2024-10-15T14:30:00Z"
  },
  {
    id: "2",
    name: "Social Media Brand Awareness",
    description: "Social media campaign to increase brand awareness among millennials",
    type: "social",
    status: "active",
    start_date: "2024-09-01",
    end_date: "2024-11-30",
    budget: 25000,
    target_audience: "Millennials (25-40)",
    impressions: 89000,
    clicks: 12000,
    conversions: 180,
    spend: 18500,
    company_id: "company-1",
    created_by: "user-1",
    created_at: "2024-08-20T09:00:00Z",
    updated_at: "2024-10-10T16:45:00Z"
  },
  {
    id: "3",
    name: "Google Ads Search Campaign",
    description: "PPC campaign targeting high-intent search keywords",
    type: "search",
    status: "paused",
    start_date: "2024-08-15",
    end_date: "2024-10-15",
    budget: 15000,
    target_audience: "High-intent buyers",
    impressions: 45000,
    clicks: 3200,
    conversions: 95,
    spend: 12000,
    company_id: "company-1",
    created_by: "user-1",
    created_at: "2024-08-01T11:00:00Z",
    updated_at: "2024-10-05T10:20:00Z"
  },
  {
    id: "4",
    name: "Display Advertising Retargeting",
    description: "Display ads to retarget website visitors who didn't convert",
    type: "display",
    status: "draft",
    start_date: "2024-11-01",
    end_date: "2024-12-31",
    budget: 20000,
    target_audience: "Website visitors",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0,
    company_id: "company-1",
    created_by: "user-1",
    created_at: "2024-10-20T15:00:00Z",
    updated_at: "2024-10-20T15:00:00Z"
  },
  {
    id: "5",
    name: "Holiday Season Email Campaign",
    description: "Email marketing campaign for the holiday season with special offers",
    type: "email",
    status: "completed",
    start_date: "2024-12-01",
    end_date: "2024-12-31",
    budget: 30000,
    target_audience: "Existing customers",
    impressions: 75000,
    clicks: 15000,
    conversions: 750,
    spend: 28000,
    company_id: "company-1",
    created_by: "user-1",
    created_at: "2024-11-15T13:00:00Z",
    updated_at: "2024-12-31T23:59:00Z"
  },
  {
    id: "6",
    name: "LinkedIn B2B Campaign",
    description: "B2B marketing campaign targeting decision makers on LinkedIn",
    type: "social",
    status: "cancelled",
    start_date: "2024-07-01",
    end_date: "2024-09-30",
    budget: 40000,
    target_audience: "B2B decision makers",
    impressions: 25000,
    clicks: 1800,
    conversions: 45,
    spend: 15000,
    company_id: "company-1",
    created_by: "user-1",
    created_at: "2024-06-15T10:30:00Z",
    updated_at: "2024-08-15T14:00:00Z"
  }
];

export function useCampaigns() {
  const { user } = useAuth() as any;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setCampaignsError('No company ID available');
      return;
    }

    setIsLoadingCampaigns(true);
    setCampaignsError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter campaigns based on params
      let filteredCampaigns = [...dummyCampaigns];
      
      if (params?.status && params.status !== "all") {
        filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === params.status);
      }
      
      setCampaigns(filteredCampaigns);
    } catch (error: any) {
      console.error('Failed to fetch campaigns:', error);
      setCampaignsError(error.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [user?.company_id]);

  const createCampaign = useCallback(async (campaignData: CreateCampaignData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      ...campaignData,
      end_goals: campaignData.end_goals?.map(goal => ({
        ...goal,
        id: Date.now().toString() + Math.random(),
        current_value: 0,
        is_completed: false
      })) || [],
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      company_id: user.company_id,
      created_by: user.id || "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return newCampaign;
  }, [user?.company_id, user?.id]);

  const updateCampaign = useCallback(async (campaignId: string, campaignData: UpdateCampaignData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const existingCampaign = campaigns.find(c => c.id === campaignId)!;
    const updatedCampaign: Campaign = {
      ...existingCampaign,
      ...campaignData,
      end_goals: campaignData.end_goals?.map(goal => ({
        ...goal,
        id: Date.now().toString() + Math.random(),
        current_value: 0,
        is_completed: false
      })) || existingCampaign.end_goals || [],
      updated_at: new Date().toISOString()
    };

    return updatedCampaign;
  }, [user?.company_id, campaigns]);

  const deleteCampaign = useCallback(async (campaignId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In a real implementation, this would call the API
    // For now, we just return successfully
  }, [user?.company_id]);

  const launchCampaign = useCallback(async (campaignId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const updatedCampaign: Campaign = {
      ...campaign,
      status: "active",
      updated_at: new Date().toISOString()
    };

    return updatedCampaign;
  }, [user?.company_id, campaigns]);

  const pauseCampaign = useCallback(async (campaignId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const updatedCampaign: Campaign = {
      ...campaign,
      status: "paused",
      updated_at: new Date().toISOString()
    };

    return updatedCampaign;
  }, [user?.company_id, campaigns]);

  const completeCampaign = useCallback(async (campaignId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const updatedCampaign: Campaign = {
      ...campaign,
      status: "completed",
      updated_at: new Date().toISOString()
    };

    return updatedCampaign;
  }, [user?.company_id, campaigns]);

  const cancelCampaign = useCallback(async (campaignId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const updatedCampaign: Campaign = {
      ...campaign,
      status: "cancelled",
      updated_at: new Date().toISOString()
    };

    return updatedCampaign;
  }, [user?.company_id, campaigns]);

  useEffect(() => {
    if (user?.company_id) {
      fetchCampaigns();
    }
  }, [user?.company_id, fetchCampaigns]);

  return {
    campaigns,
    isLoadingCampaigns,
    campaignsError,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign,
    pauseCampaign,
    completeCampaign,
    cancelCampaign
  };
} 