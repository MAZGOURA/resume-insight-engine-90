import { CVUpload } from '@/components/CVUpload';
import { CVAnalysis } from '@/components/CVAnalysis';
import { useState } from 'react';
import { ArrowLeft, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileAnalyzed = (analysisData: any) => {
    setAnalysis(analysisData);
  };

  const handleReset = () => {
    setAnalysis(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CV Analyzer</h1>
                <p className="text-sm text-muted-foreground">Professional resume analysis & insights</p>
              </div>
            </div>
            {analysis && (
              <Button 
                onClick={handleReset}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Analyze New CV</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!analysis ? (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-hover">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Analyze Your CV with AI
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get comprehensive insights, skill assessments, and personalized recommendations 
                to improve your resume and land your dream job.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Smart Parsing</h3>
                <p className="text-muted-foreground text-sm">
                  Advanced AI extracts and analyzes all key information from your CV
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Detailed Scoring</h3>
                <p className="text-muted-foreground text-sm">
                  Get scores for skills, experience, education, and formatting
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ArrowLeft className="h-6 w-6 text-accent rotate-180" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Actionable Insights</h3>
                <p className="text-muted-foreground text-sm">
                  Receive specific recommendations to improve your resume
                </p>
              </div>
            </div>

            {/* Upload Component */}
            <CVUpload 
              onFileAnalyzed={handleFileAnalyzed}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <CVAnalysis analysis={analysis} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
