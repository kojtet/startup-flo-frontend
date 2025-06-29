import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe,
  MapPin,
  Phone,
  AlertCircle,
  Building2,
  ArrowLeft
} from "lucide-react";
import { SignupData } from "../SignupFlow";

interface CompanyDetailsStepProps {
  data: SignupData;
  updateData: (data: Partial<SignupData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const industries = [
  "Technology", "Healthcare", "Finance", "Education", "E-commerce", "Manufacturing",
  "Real Estate", "Marketing", "Consulting", "Media", "Non-profit", "Other"
];

const companySizes = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
];

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Australia",
  "India", "Singapore", "Nigeria", "Ghana", "South Africa", "Brazil", "Mexico", "Other"
];

const revenueRanges = [
  "under_100k", "100k-500k", "500k-1M", "1M-5M", "5M-10M", "10M-50M", "over_100M"
];

const businessTypes = [
  "Privately Held", "Publicly Traded", "Partnership", "Sole Proprietorship", "Non-Profit", "Government", "b2b", "b2c", "saas", "other"
];

const timezones = [
  "Africa/Accra", "America/New_York", "America/Los_Angeles", "Europe/London", 
  "Europe/Berlin", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney", "Other"
];

const currencies = [
  "USD", "EUR", "GBP", "GHS", "NGN", "ZAR", "CAD", "AUD", "JPY", "Other"
];

const foundedYears = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

export function CompanyDetailsStep({ data, updateData, onNext, onBack, isLoading }: CompanyDetailsStepProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: string[] = [];

    // Required fields
    if (!data.companyName.trim()) {
      newErrors.push("Company name is required");
    }

    if (!data.industry) {
      newErrors.push("Please select an industry");
    }

    if (!data.companySize) {
      newErrors.push("Please select company size");
    }

    if (!data.country) {
      newErrors.push("Please select your country");
    }

    if (!data.timezone) {
      newErrors.push("Please select your timezone");
    }

    if (!data.currency) {
      newErrors.push("Please select your currency");
    }

    // Optional but recommended fields
    if (!data.foundedYear) {
      newErrors.push("Please select the year your company was founded");
    }

    if (!data.businessType) {
      newErrors.push("Please select your business type");
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
          Help us understand your business to customize your experience
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-4 pr-2">

      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
          Company Name *
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyName"
            type="text"
            placeholder="Enter your company name"
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Industry *
        </Label>
        <Select value={data.industry} onValueChange={(value) => updateData({ industry: value })}>
          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Company Size *
        </Label>
        <Select value={data.companySize} onValueChange={(value) => updateData({ companySize: value })}>
          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="How many people work at your company?" />
          </SelectTrigger>
          <SelectContent>
            {companySizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Country *
        </Label>
        <Select value={data.country} onValueChange={(value) => updateData({ country: value })}>
          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Website (Optional)
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="url"
              placeholder="https://yourcompany.com"
              value={data.website}
              onChange={(e) => updateData({ website: e.target.value })}
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Founded Year *
          </Label>
          <Select value={data.foundedYear} onValueChange={(value) => updateData({ foundedYear: value })}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {foundedYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Annual Revenue Range
          </Label>
          <Select value={data.annualRevenueRange} onValueChange={(value) => updateData({ annualRevenueRange: value })}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select revenue range" />
            </SelectTrigger>
            <SelectContent>
              {revenueRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Business Type *
          </Label>
          <Select value={data.businessType} onValueChange={(value) => updateData({ businessType: value })}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Timezone *
          </Label>
          <Select value={data.timezone} onValueChange={(value) => updateData({ timezone: value })}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Currency *
          </Label>
          <Select value={data.currency} onValueChange={(value) => updateData({ currency: value })}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Company Phone
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="+233-30-299-9888"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
          Address
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="address"
            type="text"
            placeholder="123 Innovation Drive, 1st Floor"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            City
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Accra"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stateProvince" className="text-sm font-medium text-gray-700">
            State/Province
          </Label>
          <Input
            id="stateProvince"
            type="text"
            placeholder="Greater Accra"
            value={data.stateProvince}
            onChange={(e) => updateData({ stateProvince: e.target.value })}
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
            Postal Code
          </Label>
          <Input
            id="postalCode"
            type="text"
            placeholder="GA-123-4567"
            value={data.postalCode}
            onChange={(e) => updateData({ postalCode: e.target.value })}
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
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
