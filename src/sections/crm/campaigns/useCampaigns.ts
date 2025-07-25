import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Campaign, CreateCampaignData, UpdateCampaignData, CampaignGoal, CampaignProgress, CampaignKPI } from '@/apis/types';

// Enhanced dummy data for campaigns
const dummyCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Q4 Product Launch Campaign",
    description: "Comprehensive marketing campaign for our new product launch targeting enterprise customers with multi-channel approach",
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
    updated_at: "2024-10-15T14:30:00Z",
    priority: "high",
    tags: ["product-launch", "enterprise", "q4"],
    assigned_to: "user-2",
    notes: "Focus on enterprise decision makers. High priority for Q4 revenue targets.",
    end_goals: [
      {
        id: "goal-1",
        name: "Lead Generation",
        target_value: 500,
        current_value: 425,
        unit: "leads",
        type: "conversion",
        deadline: "2024-12-31",
        is_completed: false
      },
      {
        id: "goal-2",
        name: "Revenue Target",
        target_value: 1000000,
        current_value: 850000,
        unit: "USD",
        type: "revenue",
        deadline: "2024-12-31",
        is_completed: false
      },
      {
        id: "goal-3",
        name: "Brand Awareness",
        target_value: 100000,
        current_value: 125000,
        unit: "impressions",
        type: "awareness",
        deadline: "2024-12-31",
        is_completed: true
      }
    ],
    current_progress: {
      overall_progress: 75,
      goals_completed: 1,
      total_goals: 3,
      days_remaining: 45,
      budget_utilized: 32000,
      budget_remaining: 18000,
      performance_score: 82
    },
    kpis: [
      {
        id: "kpi-1",
        name: "Conversion Rate",
        current_value: 5.0,
        target_value: 4.0,
        unit: "%",
        trend: "up",
        change_percentage: 25
      },
      {
        id: "kpi-2",
        name: "Cost per Lead",
        current_value: 75,
        target_value: 100,
        unit: "USD",
        trend: "down",
        change_percentage: -25
      },
      {
        id: "kpi-3",
        name: "ROI",
        current_value: 265,
        target_value: 200,
        unit: "%",
        trend: "up",
        change_percentage: 32.5
      }
    ]
  },
  {
    id: "2",
    name: "Social Media Brand Awareness",
    description: "Social media campaign to increase brand awareness among millennials and Gen Z",
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
    updated_at: "2024-10-10T16:45:00Z",
    priority: "medium",
    tags: ["brand-awareness", "social-media", "millennials"],
    assigned_to: "user-3",
    notes: "Focus on Instagram and TikTok. Engage with influencers.",
    end_goals: [
      {
        id: "goal-4",
        name: "Social Engagement",
        target_value: 15000,
        current_value: 12000,
        unit: "engagements",
        type: "engagement",
        deadline: "2024-11-30",
        is_completed: false
      },
      {
        id: "goal-5",
        name: "Follower Growth",
        target_value: 5000,
        current_value: 4200,
        unit: "followers",
        type: "awareness",
        deadline: "2024-11-30",
        is_completed: false
      }
    ],
    current_progress: {
      overall_progress: 68,
      goals_completed: 0,
      total_goals: 2,
      days_remaining: 20,
      budget_utilized: 18500,
      budget_remaining: 6500,
      performance_score: 71
    },
    kpis: [
      {
        id: "kpi-4",
        name: "Engagement Rate",
        current_value: 13.5,
        target_value: 12.0,
        unit: "%",
        trend: "up",
        change_percentage: 12.5
      },
      {
        id: "kpi-5",
        name: "Cost per Engagement",
        current_value: 1.54,
        target_value: 1.67,
        unit: "USD",
        trend: "down",
        change_percentage: -7.8
      }
    ]
  },
  {
    id: "3",
    name: "Google Ads Search Campaign",
    description: "PPC campaign targeting high-intent search keywords for B2B software",
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
    updated_at: "2024-10-05T10:20:00Z",
    priority: "medium",
    tags: ["ppc", "b2b", "search"],
    assigned_to: "user-4",
    notes: "Paused due to budget constraints. Will resume in Q1.",
    end_goals: [
      {
        id: "goal-6",
        name: "Qualified Leads",
        target_value: 120,
        current_value: 95,
        unit: "leads",
        type: "conversion",
        deadline: "2024-10-15",
        is_completed: false
      }
    ],
    current_progress: {
      overall_progress: 79,
      goals_completed: 0,
      total_goals: 1,
      days_remaining: 0,
      budget_utilized: 12000,
      budget_remaining: 3000,
      performance_score: 79
    },
    kpis: [
      {
        id: "kpi-6",
        name: "Quality Score",
        current_value: 8.5,
        target_value: 8.0,
        unit: "/10",
        trend: "up",
        change_percentage: 6.25
      },
      {
        id: "kpi-7",
        name: "Cost per Conversion",
        current_value: 126,
        target_value: 125,
        unit: "USD",
        trend: "up",
        change_percentage: 0.8
      }
    ]
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
    updated_at: "2024-10-20T15:00:00Z",
    priority: "low",
    tags: ["retargeting", "display", "conversion"],
    assigned_to: "user-5",
    notes: "Ready for launch. Creative assets approved.",
    end_goals: [
      {
        id: "goal-7",
        name: "Retargeting Conversions",
        target_value: 200,
        current_value: 0,
        unit: "conversions",
        type: "conversion",
        deadline: "2024-12-31",
        is_completed: false
      }
    ],
    current_progress: {
      overall_progress: 0,
      goals_completed: 0,
      total_goals: 1,
      days_remaining: 60,
      budget_utilized: 0,
      budget_remaining: 20000,
      performance_score: 0
    }
  },
  {
    id: "5",
    name: "Holiday Season Email Campaign",
    description: "Email marketing campaign for the holiday season with special offers and promotions",
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
    updated_at: "2024-12-31T23:59:00Z",
    priority: "high",
    tags: ["holiday", "email", "retention"],
    assigned_to: "user-6",
    notes: "Exceeded all targets. Excellent customer engagement.",
    end_goals: [
      {
        id: "goal-8",
        name: "Email Opens",
        target_value: 60000,
        current_value: 75000,
        unit: "opens",
        type: "engagement",
        deadline: "2024-12-31",
        is_completed: true
      },
      {
        id: "goal-9",
        name: "Revenue Generated",
        target_value: 500000,
        current_value: 650000,
        unit: "USD",
        type: "revenue",
        deadline: "2024-12-31",
        is_completed: true
      }
    ],
    current_progress: {
      overall_progress: 100,
      goals_completed: 2,
      total_goals: 2,
      days_remaining: 0,
      budget_utilized: 28000,
      budget_remaining: 2000,
      performance_score: 95
    },
    kpis: [
      {
        id: "kpi-8",
        name: "Open Rate",
        current_value: 20.0,
        target_value: 18.0,
        unit: "%",
        trend: "up",
        change_percentage: 11.1
      },
      {
        id: "kpi-9",
        name: "Revenue per Email",
        current_value: 8.67,
        target_value: 8.33,
        unit: "USD",
        trend: "up",
        change_percentage: 4.1
      }
    ]
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
    updated_at: "2024-08-15T14:00:00Z",
    priority: "medium",
    tags: ["b2b", "linkedin", "decision-makers"],
    assigned_to: "user-7",
    notes: "Cancelled due to poor performance and high cost per lead.",
    end_goals: [
      {
        id: "goal-10",
        name: "B2B Leads",
        target_value: 100,
        current_value: 45,
        unit: "leads",
        type: "conversion",
        deadline: "2024-09-30",
        is_completed: false
      }
    ],
    current_progress: {
      overall_progress: 45,
      goals_completed: 0,
      total_goals: 1,
      days_remaining: 0,
      budget_utilized: 15000,
      budget_remaining: 25000,
      performance_score: 45
    },
    kpis: [
      {
        id: "kpi-10",
        name: "Cost per Lead",
        current_value: 333,
        target_value: 400,
        unit: "USD",
        trend: "down",
        change_percentage: -16.8
      }
    ]
  }
];

export function useCampaigns() {
  const { user } = useAuth() as any;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

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

      if (params?.priority && params.priority !== "all") {
        filteredCampaigns = filteredCampaigns.filter(campaign => campaign.priority === params.priority);
      }

      if (params?.type && params.type !== "all") {
        filteredCampaigns = filteredCampaigns.filter(campaign => campaign.type === params.type);
      }

      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredCampaigns = filteredCampaigns.filter(campaign =>
          campaign.name.toLowerCase().includes(searchTerm) ||
          (campaign.description && campaign.description.toLowerCase().includes(searchTerm)) ||
          (campaign.target_audience && campaign.target_audience.toLowerCase().includes(searchTerm)) ||
          (campaign.tags && campaign.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      }

      // Set total items for pagination
      setTotalItems(filteredCampaigns.length);

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
      
      setCampaigns(paginatedCampaigns);
    } catch (error: any) {
      console.error('Failed to fetch campaigns:', error);
      setCampaignsError(error.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [user?.company_id, currentPage, itemsPerPage]);

  const createCampaign = useCallback(async (campaignData: CreateCampaignData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      ...campaignData,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      company_id: user.company_id,
      created_by: user.id || "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      end_goals: campaignData.end_goals?.map((goal, index) => ({
        id: `goal-${Date.now()}-${index}`,
        ...goal,
        current_value: 0,
        is_completed: false
      })),
      current_progress: {
        overall_progress: 0,
        goals_completed: 0,
        total_goals: campaignData.end_goals?.length || 0,
        days_remaining: Math.ceil((new Date(campaignData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        budget_utilized: 0,
        budget_remaining: campaignData.budget,
        performance_score: 0
      }
    };

    return newCampaign;
  }, [user?.company_id, user?.id]);

  const updateCampaign = useCallback(async (campaignId: string, campaignData: UpdateCampaignData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const existingCampaign = campaigns.find(c => c.id === campaignId);
    if (!existingCampaign) throw new Error('Campaign not found');

    const updatedCampaign: Campaign = {
      ...existingCampaign,
      ...campaignData,
      updated_at: new Date().toISOString(),
      // Handle end_goals properly if provided
      end_goals: campaignData.end_goals ? campaignData.end_goals.map((goal, index) => ({
        id: `goal-${Date.now()}-${index}`,
        ...goal,
        current_value: 0,
        is_completed: false
      })) : existingCampaign.end_goals
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

  // Update campaigns when page changes
  useEffect(() => {
    if (user?.company_id) {
      fetchCampaigns();
    }
  }, [user?.company_id, fetchCampaigns, currentPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return {
    campaigns,
    isLoadingCampaigns,
    campaignsError,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    itemsPerPage,
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