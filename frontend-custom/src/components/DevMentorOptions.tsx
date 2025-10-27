/**
 * DevMentor Options Page
 * Simple options page for the extension
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const DevMentorOptions = () => {
  const openPopup = () => {
    chrome.action.openPopup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">DevMentor AI</h1>
            <p className="text-muted-foreground">Chrome Built-in AI Challenge 2025</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to DevMentor AI</CardTitle>
            <CardDescription>
              Your intelligent coding assistant powered by Chrome's Built-in AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Code Explanation with AI</li>
                <li>Bug Detection and Fixes</li>
                <li>Documentation Generation</li>
                <li>Code Optimization</li>
                <li>Code Review</li>
                <li>GitHub Integration</li>
                <li>Gamification System</li>
                <li>Interactive Storytelling</li>
                <li>Multi-language Support (43 languages)</li>
                <li>Internationalization (PT, EN, ES)</li>
              </ul>
            </div>

            <div className="pt-4">
              <Button onClick={openPopup} className="w-full">
                Open Extension Popup
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>Version: 2.0.0</p>
              <p>Built with Chrome's Built-in AI APIs</p>
              <p>No external API keys required</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DevMentorOptions;
