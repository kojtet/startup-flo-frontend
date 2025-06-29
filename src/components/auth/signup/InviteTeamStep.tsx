import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Mail, Trash2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { SignupData } from "../SignupFlow";
import { SignupCredentials, User as ApiUser } from "@/apis/types";
import { useAuth } from "@/contexts/AuthContext";

interface InviteTeamStepProps {
  data: SignupData;
  updateData: (updates: Partial<SignupData>) => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// interface TeamMemberInvite { // Unused: removed
//   email: string;
//   role: string; 
// }

const roles = [
  "Admin", "Manager", "Employee", "Viewer"
];

// Dummy data for team members
const dummyTeamMembers = [
  { email: "jane.smith@company.com", role: "Manager", name: "Jane Smith" },
  { email: "mike.johnson@company.com", role: "Employee", name: "Mike Johnson" },
  { email: "sarah.wilson@company.com", role: "Employee", name: "Sarah Wilson" },
];

export function InviteTeamStep({ data, updateData, onBack, isLoading, setIsLoading }: InviteTeamStepProps) {
  const [newInvite, setNewInvite] = useState({ email: "", role: "Employee", name: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { register } = useAuth();
  // Removed unused teamMembers state and its handlers (handleAddMember, handleRemoveMember, handleMemberChange, newMemberEmail, newMemberRole)
  // const [teamMembers, setTeamMembers] = useState<TeamMemberInvite[]>(dummyTeamMembers); // This was problematic

  // Initialize with dummy data if no invites exist
  const invites = data.invites.length === 0 ? dummyTeamMembers : data.invites;

  // Helper function to prepare signup payload matching backend requirements
  const prepareSignupPayload = (): SignupCredentials => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      email: data.email?.trim(),
      password: data.password,
      company_name: data.companyName?.trim(),
    };

    // Add optional fields only if they have non-empty values
    if (data.firstName?.trim()) payload.first_name = data.firstName.trim();
    if (data.lastName?.trim()) payload.last_name = data.lastName.trim();
    if (data.jobTitle?.trim()) {
      payload.job_title = data.jobTitle.trim();
      payload.department = data.jobTitle.trim(); // Use job title as department if no separate department field
    }
    if (data.userPhone?.trim()) payload.user_phone = data.userPhone.trim();
    if (data.industry?.trim()) payload.industry = data.industry.trim();
    if (data.country?.trim()) payload.country = data.country.trim();
    if (data.website?.trim()) payload.website = data.website.trim();
    if (data.companySize?.trim()) {
      payload.company_size_category = data.companySize.trim();
      // Extract numeric team size from company size category if available
      const sizeMatch = data.companySize.match(/\d+/);
      if (sizeMatch) {
        payload.team_size = parseInt(sizeMatch[0]);
      }
    }
    if (data.foundedYear?.trim()) payload.founded_year = parseInt(data.foundedYear);
    if (data.annualRevenueRange?.trim()) payload.annual_revenue_range = data.annualRevenueRange.trim();
    if (data.businessType?.trim()) payload.business_type = data.businessType.trim();
    if (data.timezone?.trim()) payload.timezone = data.timezone.trim();
    if (data.currency?.trim()) payload.currency = data.currency.trim();
    if (data.phone?.trim()) payload.phone = data.phone.trim();
    if (data.address?.trim()) payload.address = data.address.trim();
    if (data.city?.trim()) payload.city = data.city.trim();
    if (data.stateProvince?.trim()) payload.state_province = data.stateProvince.trim();
    if (data.postalCode?.trim()) payload.postal_code = data.postalCode.trim();
    
    // Add default description if not provided
    if (!payload.description && payload.company_name) {
      payload.description = `${payload.company_name} is a ${payload.industry || 'innovative'} company focused on delivering excellent products and services.`;
    }
    
    // Add default mission statement if not provided
    if (!payload.mission_statement && payload.company_name) {
      payload.mission_statement = `To empower businesses through ${payload.industry || 'innovative'} solutions and exceptional service.`;
    }
    
    console.log("✅ Prepared signup payload:", payload);

    return payload;
  };

  const addInvite = () => {
    if (newInvite.email) {
      const updatedInvites = [...invites, { ...newInvite }];
      updateData({ invites: updatedInvites });
      setNewInvite({ email: "", role: "Employee", name: "" });
    }
  };

  const removeInvite = (index: number) => {
    const updatedInvites = invites.filter((_, i) => i !== index);
    updateData({ invites: updatedInvites });
  };

  const updateInviteRole = (index: number, role: string) => {
    const updatedInvites = invites.map((invite, i) => 
      i === index ? { ...invite, role } : invite
    );
    updateData({ invites: updatedInvites });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Step 1: Create user account and company (this will also auto-login)
      const payload = prepareSignupPayload();
      console.log("Sending signup payload:", JSON.stringify(payload, null, 2));
      
      const signupResponse: ApiUser = await register(payload);
      console.log("Signup successful, user:", signupResponse);

      // Step 2: Handle team invites (API not ready yet)
      if (invites.length > 0) {
        // TODO: Send team invites here when API is ready
        // This would be a separate API call to send invitations
        // For now, we'll just show success message mentioning invites
        console.log("Team invites to be sent:", invites);
      }

      setSuccess(true);

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Signup error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to create account";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const skipInvites = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Create account (this will also auto-login)
      const payload = prepareSignupPayload();
      console.log("Sending signup payload (skip invites):", JSON.stringify(payload, null, 2));
      
      const signupResponse: ApiUser = await register(payload);
      console.log("Signup successful, user:", signupResponse);

      router.push("/");

    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Signup error (skip invites):", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to create account";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Removed unused handleAddMember, handleRemoveMember, handleMemberChange functions
  // as they were operating on the removed `teamMembers` state.
  // The existing `addInvite`, `removeInvite`, `updateInviteRole` functions
  // correctly operate on `data.invites` via `updateData`.

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome to StartupFlo!
        </h3>
        <p className="text-gray-600 mb-4">
          Your account has been created successfully.
        </p>
        {invites.length > 0 && (
          <p className="text-sm text-gray-500">
            Team invitations will be sent to {invites.length} team member{invites.length > 1 ? 's' : ''} once you're set up.
          </p>
        )}
        <div className="mt-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Invite your team to collaborate on StartupFlo. You can always do this later.
        </p>
      </div>

      {/* Add new invite */}
      <Card className="border-dashed border-gray-300 bg-gray-50/50">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <UserPlus className="h-4 w-4" />
              <span>Add team member</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Email</Label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Name (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Full name"
                  value={newInvite.name}
                  onChange={(e) => setNewInvite({ ...newInvite, name: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Role</Label>
                <div className="flex space-x-2">
                  <Select 
                    value={newInvite.role} 
                    onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}
                  >
                    <SelectTrigger className="h-9 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addInvite}
                    disabled={!newInvite.email}
                    className="h-9 px-3"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current invites */}
      {invites.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Team Members ({invites.length})
          </Label>
          {invites.map((invite, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invite.name || invite.email}
                      </p>
                      {invite.name && (
                        <p className="text-xs text-gray-500">{invite.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={invite.role} 
                      onValueChange={(value) => updateInviteRole(index, value)}
                    >
                      <SelectTrigger className="h-8 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvite(index)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex space-x-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={skipInvites}
          className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          Skip for now
        </Button>
        
        <Button 
          type="submit" 
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Account...
            </div>
          ) : (
            `Create Account ${invites.length > 0 ? `& Save ${invites.length} Invite${invites.length > 1 ? 's' : ''}` : ''}`
          )}
        </Button>
      </div>
    </form>
  );
} 
