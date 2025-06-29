import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Briefcase, Phone, AlertCircle, ArrowLeft } from "lucide-react";
import { SignupData } from "../SignupFlow";

interface AccountCreationStepProps {
  data: SignupData;
  updateData: (data: Partial<SignupData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const jobTitleSuggestions = [
  "CEO", "CTO", "COO", "CFO", "VP Engineering", "Product Manager", 
  "Engineering Manager", "Developer", "Designer", "Marketing Manager",
  "Sales Manager", "Operations Manager", "HR Manager", "Other"
];

export function AccountCreationStep({ data, updateData, onNext, onBack, isLoading }: AccountCreationStepProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!data.firstName.trim()) {
      newErrors.push("First name is required");
    }

    if (!data.lastName.trim()) {
      newErrors.push("Last name is required");
    }

    if (!data.jobTitle.trim()) {
      newErrors.push("Job title is required");
    }

    if (!data.userPhone.trim()) {
      newErrors.push("Phone number is required");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleJobTitleSelect = (title: string) => {
    updateData({ jobTitle: title });
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          Tell us a bit about yourself to personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            First Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Last Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={data.lastName}
              onChange={(e) => updateData({ lastName: e.target.value })}
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
          Job Title
        </Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="jobTitle"
            type="text"
            placeholder="What's your role?"
            value={data.jobTitle}
            onChange={(e) => updateData({ jobTitle: e.target.value })}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {jobTitleSuggestions
              .filter(title => 
                title.toLowerCase().includes(data.jobTitle.toLowerCase()) ||
                data.jobTitle === ""
              )
              .map((title) => (
                <button
                  key={title}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => handleJobTitleSelect(title)}
                >
                  {title}
                </button>
              ))
            }
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="userPhone" className="text-sm font-medium text-gray-700">
          Phone Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="userPhone"
            type="tel"
            placeholder="+233-55-123-4567"
            value={data.userPhone}
            onChange={(e) => updateData({ userPhone: e.target.value })}
            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

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
          type="submit" 
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </form>
  );
} 