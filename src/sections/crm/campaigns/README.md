# CRM Campaigns Section

This section provides comprehensive campaign management functionality for the CRM module, including end goals tracking, progress monitoring, and advanced filtering.

## Features

### 🎯 Enhanced Campaign Management
- **End Goals Tracking**: Define and monitor specific campaign objectives
- **Progress Monitoring**: Real-time progress tracking with visual indicators
- **Performance Metrics**: Comprehensive KPI tracking and ROI calculations
- **Priority Management**: Urgent, High, Medium, Low priority levels
- **Tag System**: Organize campaigns with custom tags
- **Assignment Tracking**: Assign campaigns to team members

### 📊 Advanced Analytics
- **Campaign Progress**: Overall progress percentage and goal completion
- **Financial Performance**: Budget utilization and ROI tracking
- **Performance Metrics**: Impressions, clicks, conversions, CTR
- **KPI Monitoring**: Key performance indicators with trend analysis
- **Timeline Progress**: Visual campaign timeline progress

### 🔍 Smart Filtering & Search
- **Multi-criteria Filtering**: Status, priority, type, and search
- **Active Filter Display**: Visual indication of applied filters
- **Clear Filters**: One-click filter reset
- **Pagination**: Efficient handling of large campaign lists

### 🎨 Rich UI Components
- **Enhanced Cards**: Detailed campaign cards with progress indicators
- **Visual Progress Bars**: Progress tracking for goals and timeline
- **Status Badges**: Color-coded status and priority indicators
- **Action Buttons**: Quick campaign management actions
- **Responsive Design**: Mobile-friendly layout

## Components

### `index.tsx`
Main campaigns page component that orchestrates all functionality:
- Campaign listing with pagination
- Create/Edit campaign dialogs
- Filter management
- Error handling and loading states

### `useCampaigns.ts`
Custom hook managing campaign data and operations:
- Campaign CRUD operations
- Pagination logic
- Filtering and search
- Campaign status management (launch, pause, complete, cancel)

### `CampaignForm.tsx`
Comprehensive form for creating and editing campaigns:
- **Basic Information**: Name, description, type, status, priority
- **Timeline & Budget**: Start/end dates, budget, target audience
- **End Goals**: Add/edit campaign objectives with targets and deadlines
- **Tags & Notes**: Campaign organization and additional information
- **Validation**: Form validation and error handling

### `CampaignCard.tsx`
Rich campaign display card with:
- **Header Section**: Campaign name, type, status, priority, actions
- **Campaign Info**: Budget, dates, target audience
- **Progress Tracking**: Overall progress, goals completed, days remaining
- **End Goals**: Individual goal progress with completion status
- **Performance Metrics**: Impressions, clicks, conversions, CTR
- **KPIs**: Key performance indicators with trend analysis
- **Financial Performance**: Spend and ROI calculations
- **Quick Actions**: Analytics, preview, audience, performance buttons

### `CampaignFilters.tsx`
Advanced filtering component:
- **Search**: Campaign name, description, tags search
- **Status Filter**: Draft, Active, Paused, Completed, Cancelled
- **Priority Filter**: Urgent, High, Medium, Low
- **Type Filter**: Email, Social, Display, Search
- **Active Filters Display**: Visual filter indicators
- **Clear Filters**: Reset all filters

### `CampaignPagination.tsx`
Pagination component for campaign lists:
- **Page Navigation**: First, previous, next, last buttons
- **Page Numbers**: Smart page number display with ellipsis
- **Item Count**: Showing X to Y of Z campaigns
- **Responsive Design**: Mobile-friendly pagination

## Data Structure

### Campaign Types
```typescript
interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: "email" | "social" | "display" | "search";
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  budget: number;
  target_audience?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  // Enhanced fields
  end_goals?: CampaignGoal[];
  current_progress?: CampaignProgress;
  kpis?: CampaignKPI[];
  tags?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  notes?: string;
}
```

### Campaign Goal
```typescript
interface CampaignGoal {
  id: string;
  name: string;
  target_value: number;
  current_value: number;
  unit: string; // e.g., "leads", "sales", "signups", "clicks"
  type: "conversion" | "engagement" | "revenue" | "awareness";
  deadline?: string;
  is_completed: boolean;
}
```

### Campaign Progress
```typescript
interface CampaignProgress {
  overall_progress: number; // 0-100
  goals_completed: number;
  total_goals: number;
  days_remaining: number;
  budget_utilized: number;
  budget_remaining: number;
  performance_score: number; // 0-100
}
```

### Campaign KPI
```typescript
interface CampaignKPI {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change_percentage: number;
}
```

## Usage

### Basic Campaign Creation
```typescript
const campaignData = {
  name: "Q4 Product Launch",
  description: "Comprehensive marketing campaign for new product",
  type: "email",
  status: "draft",
  start_date: "2024-10-01",
  end_date: "2024-12-31",
  budget: 50000,
  target_audience: "Enterprise customers",
  priority: "high",
  tags: ["product-launch", "enterprise"],
  end_goals: [
    {
      name: "Lead Generation",
      target_value: 500,
      unit: "leads",
      type: "conversion",
      deadline: "2024-12-31"
    }
  ]
};
```

### Campaign Status Management
```typescript
// Launch a draft campaign
await launchCampaign(campaignId);

// Pause an active campaign
await pauseCampaign(campaignId);

// Complete a campaign
await completeCampaign(campaignId);

// Cancel a campaign
await cancelCampaign(campaignId);
```

### Filtering Campaigns
```typescript
// Filter by status and priority
fetchCampaigns({
  status: "active",
  priority: "high",
  type: "email",
  search: "product launch"
});
```

## API Endpoints Required

### Campaign Management
- `GET /api/crm/campaigns` - List campaigns with pagination and filtering
- `POST /api/crm/campaigns` - Create new campaign
- `PUT /api/crm/campaigns/:id` - Update campaign
- `DELETE /api/crm/campaigns/:id` - Delete campaign

### Campaign Status Management
- `POST /api/crm/campaigns/:id/launch` - Launch campaign
- `POST /api/crm/campaigns/:id/pause` - Pause campaign
- `POST /api/crm/campaigns/:id/complete` - Complete campaign
- `POST /api/crm/campaigns/:id/cancel` - Cancel campaign

### Progress Tracking
- `PUT /api/crm/campaigns/:id/progress` - Update campaign progress
- `PUT /api/crm/campaigns/:id/goals/:goalId` - Update goal progress
- `GET /api/crm/campaigns/:id/analytics` - Get campaign analytics

## Styling

The components use Tailwind CSS classes and follow the design system:
- **Cards**: Consistent card styling with hover effects
- **Progress Bars**: Visual progress indicators
- **Badges**: Color-coded status and priority indicators
- **Buttons**: Consistent button styling with icons
- **Forms**: Organized form sections with proper spacing

## Future Enhancements

- **Campaign Templates**: Pre-built campaign templates
- **A/B Testing**: Campaign variant testing
- **Automation**: Automated campaign workflows
- **Integration**: Third-party marketing platform integration
- **Reporting**: Advanced campaign reporting and analytics
- **Collaboration**: Team collaboration features
- **Notifications**: Campaign milestone notifications 