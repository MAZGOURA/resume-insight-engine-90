import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CVUploadProps {
  onFileAnalyzed: (analysis: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export const CVUpload = ({ onFileAnalyzed, isAnalyzing, setIsAnalyzing }: CVUploadProps) => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsAnalyzing(true);

    try {
      // Simulate CV analysis with mock data for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = {
        personalInfo: {
          name: "John Doe",
          email: "john.doe@email.com",
          phone: "+1 (555) 123-4567",
          location: "New York, NY"
        },
        skills: [
          { name: "JavaScript", category: "Programming", level: 4 },
          { name: "React", category: "Frontend", level: 4 },
          { name: "Node.js", category: "Backend", level: 3 },
          { name: "Python", category: "Programming", level: 3 },
          { name: "SQL", category: "Database", level: 3 },
          { name: "Project Management", category: "Soft Skills", level: 4 }
        ],
        experience: {
          totalYears: 5,
          positions: [
            {
              title: "Senior Software Developer",
              company: "Tech Corp",
              duration: "2021 - Present",
              description: "Led development of web applications using React and Node.js"
            },
            {
              title: "Software Developer",
              company: "StartupXYZ",
              duration: "2019 - 2021",
              description: "Developed mobile and web applications"
            }
          ]
        },
        education: [
          {
            degree: "Bachelor of Computer Science",
            institution: "University of Technology",
            year: "2019"
          }
        ],
        score: {
          overall: 85,
          breakdown: {
            skills: 88,
            experience: 82,
            education: 85,
            format: 87
          }
        },
        feedback: [
          { type: "positive", message: "Strong technical skills portfolio" },
          { type: "positive", message: "Good work experience progression" },
          { type: "suggestion", message: "Consider adding more quantifiable achievements" },
          { type: "suggestion", message: "Include certifications if available" }
        ]
      };

      onFileAnalyzed(mockAnalysis);
      toast({
        title: "CV Analyzed Successfully",
        description: "Your CV has been processed and analyzed.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [onFileAnalyzed, setIsAnalyzing, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  });

  return (
    <Card className="p-8 bg-gradient-card shadow-card transition-all duration-300 hover:shadow-hover">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
        } ${isAnalyzing ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isAnalyzing ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          ) : (
            <div className="relative">
              <Upload className="h-16 w-16 text-muted-foreground" />
              {uploadedFile && (
                <FileText className="h-8 w-8 text-primary absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-card" />
              )}
            </div>
          )}
          
          <div className="space-y-2">
            {isAnalyzing ? (
              <>
                <h3 className="text-xl font-semibold text-foreground">Analyzing CV...</h3>
                <p className="text-muted-foreground">
                  Processing your resume and extracting insights
                </p>
              </>
            ) : uploadedFile ? (
              <>
                <h3 className="text-xl font-semibold text-foreground">File Uploaded</h3>
                <p className="text-muted-foreground">
                  {uploadedFile.name}
                </p>
                <Button 
                  onClick={() => onDrop([uploadedFile])}
                  className="mt-4 bg-gradient-primary hover:opacity-90"
                >
                  Analyze CV
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-foreground">
                  {isDragActive ? 'Drop your CV here' : 'Upload Your CV'}
                </h3>
                <p className="text-muted-foreground">
                  Drag and drop your CV file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOC, and DOCX files
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};