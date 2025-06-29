import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function TestLoginPage() {
  const [email, setEmail] = useState("michaeltettteh@gmail.com");
  const [password, setPassword] = useState("A-very-strong-password!1");
  const [result, setResult] = useState<string>("");
  
  const { login, user, isAuthenticated, loading, error } = useAuth();

  const handleTestLogin = async () => {
    try {
      setResult("Testing login...");
      const loginResult = await login({ email, password });
      setResult(`Login successful! User: ${JSON.stringify(loginResult, null, 2)}`);
    } catch (err) {
      setResult(`Login failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleDirectAPITest = async () => {
    try {
      setResult("Testing direct API call...");
      const response = await fetch("https://startup-flo-backend.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`Direct API call successful! Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`Direct API call failed: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      setResult(`Direct API call error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <h1 className="text-xl font-bold">Test Login & API</h1>
          <p className="text-sm text-gray-600">Testing authentication with provided credentials</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTestLogin} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Testing..." : "Test Auth Context Login"}
            </Button>
            
            <Button 
              onClick={handleDirectAPITest} 
              variant="outline"
              className="flex-1"
            >
              Test Direct API Call
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Auth Status:</strong> {isAuthenticated ? "Authenticated" : "Not authenticated"}
            </div>
            
            {user && (
              <div className="text-sm">
                <strong>Current User:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto max-h-32">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-600">
                <strong>Error:</strong> {error.message}
              </div>
            )}
            
            {result && (
              <div className="text-sm">
                <strong>Test Result:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 whitespace-pre-wrap overflow-auto max-h-64">
                  {result}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
