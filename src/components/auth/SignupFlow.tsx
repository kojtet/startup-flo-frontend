import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button"; // Button was unused
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { EmailPasswordStep } from "./signup/EmailPasswordStep";
import { AccountCreationStep } from "./signup/AccountCreationStep";
import { CompanyDetailsStep } from "./signup/CompanyDetailsStep";
import { InviteTeamStep } from "./signup/InviteTeamStep";

export interface SignupData {
  // Step 1: Email & Password
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Account Creation
  firstName: string;
  lastName: string;
  jobTitle: string;
  userPhone: string;
  
  // Step 3: Company Details
  companyName: string;
  industry: string;
  companySize: string;
  country: string;
  website: string;
  foundedYear: string;
  annualRevenueRange: string;
  businessType: string;
  timezone: string;
  currency: string;
  phone: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  
  // Step 4: Team Invites
  invites: Array<{
    email: string;
    role: string;
    name?: string;
  }>;
}

const steps = [
  { id: 1, title: "Account", description: "Create your account" },
  { id: 2, title: "Profile", description: "Personal information" },
  { id: 3, title: "Company", description: "Company details" },
  { id: 4, title: "Team", description: "Invite your team" },
];

export function SignupFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    userPhone: "",
    companyName: "",
    industry: "",
    companySize: "",
    country: "",
    website: "",
    foundedYear: "",
    annualRevenueRange: "",
    businessType: "",
    timezone: "",
    currency: "",
    phone: "",
    address: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    invites: [],
  });

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EmailPasswordStep
            data={signupData}
            updateData={updateSignupData}
            onNext={nextStep}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <AccountCreationStep
            data={signupData}
            updateData={updateSignupData}
            onNext={nextStep}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <CompanyDetailsStep
            data={signupData}
            updateData={updateSignupData}
            onNext={nextStep}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );
      case 4:
        return (
          <InviteTeamStep
            data={signupData}
            updateData={updateSignupData}
            onBack={prevStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <span className="text-sm text-gray-500">
              {currentStep} of {steps.length}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-1 ${
                  step.id < currentStep
                    ? "text-green-600"
                    : step.id === currentStep
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      step.id === currentStep
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300"
                    }`}
                  />
                )}
                <span className="text-xs font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderStep()}
      </CardContent>
    </Card>
  );
} 
