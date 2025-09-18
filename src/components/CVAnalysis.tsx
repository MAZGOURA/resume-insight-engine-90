import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface CVAnalysisProps {
  analysis: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
    };
    skills: Array<{
      name: string;
      category: string;
      level: number;
    }>;
    experience: {
      totalYears: number;
      positions: Array<{
        title: string;
        company: string;
        duration: string;
        description: string;
      }>;
    };
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    score: {
      overall: number;
      breakdown: {
        skills: number;
        experience: number;
        education: number;
        format: number;
      };
    };
    feedback: Array<{
      type: 'positive' | 'suggestion';
      message: string;
    }>;
  };
}

export const CVAnalysis = ({ analysis }: CVAnalysisProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-gradient-success';
    if (score >= 60) return 'bg-gradient-to-r from-warning to-yellow-500';
    return 'bg-gradient-to-r from-destructive to-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">CV Analysis Report</h2>
            <p className="text-muted-foreground">Comprehensive analysis of your resume</p>
          </div>
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full ${getScoreBg(analysis.score.overall)} flex items-center justify-center text-white text-2xl font-bold shadow-hover`}>
              {analysis.score.overall}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Overall Score</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6 bg-gradient-card shadow-card">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{analysis.personalInfo.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{analysis.personalInfo.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{analysis.personalInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{analysis.personalInfo.location}</span>
            </div>
          </div>
        </Card>

        {/* Score Breakdown */}
        <Card className="p-6 bg-gradient-card shadow-card">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Score Breakdown</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(analysis.score.breakdown).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-foreground capitalize">{category}</span>
                  <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Skills */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Skills Assessment</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysis.skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {skill.category}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={skill.level * 20} className="h-2" />
                <span className="text-xs text-muted-foreground">{skill.level}/5</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Experience */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Work Experience</h3>
          <Badge className="bg-primary text-primary-foreground">
            {analysis.experience.totalYears} years
          </Badge>
        </div>
        <div className="space-y-4">
          {analysis.experience.positions.map((position, index) => (
            <div key={index} className="border-l-2 border-primary/20 pl-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-foreground">{position.title}</h4>
                  <p className="text-primary font-medium">{position.company}</p>
                </div>
                <Badge variant="outline">{position.duration}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{position.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Education */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Education</h3>
        </div>
        <div className="space-y-3">
          {analysis.education.map((edu, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                <p className="text-muted-foreground">{edu.institution}</p>
              </div>
              <Badge variant="outline">{edu.year}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Feedback */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
        </div>
        <div className="space-y-3">
          {analysis.feedback.map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              {item.type === 'positive' ? (
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              )}
              <p className="text-foreground">{item.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};