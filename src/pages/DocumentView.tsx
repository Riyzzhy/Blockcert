import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '@/lib/utils';
import { FileText, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents } = useDocuments();
  const doc = documents.find(d => d.id === id);

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
          <p className="text-muted-foreground">This certificate does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { label: 'Verified', variant: 'default' as const },
      pending_verification: { label: 'Pending', variant: 'secondary' as const },
      failed: { label: 'Failed', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.failed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Certificate Details Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Certificate Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Certificate Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Full Name:</strong> {doc.metadata?.fullName || 'Not specified'}
                </div>
                <div>
                  <strong>Certificate Name:</strong> {doc.metadata?.certificateName || doc.name}
                </div>
                <div>
                  <strong>Institution:</strong> {doc.metadata?.institution || 'Not specified'}
                </div>
                <div>
                  <strong>Start Date:</strong> {doc.metadata?.startDate || 'Not specified'}
                </div>
                <div>
                  <strong>Issue Date:</strong> {doc.metadata?.issueDate || 'Not specified'}
                </div>
                <div>
                  <strong>Grades:</strong> {doc.metadata?.grades || 'Not specified'}
                </div>
                <div className="md:col-span-2">
                  <strong>Personality:</strong> {doc.metadata?.personality || 'Not specified'}
                </div>
                {doc.metadata?.additionalDetails && (
                  <div className="md:col-span-2">
                    <strong>Additional Details:</strong> {doc.metadata.additionalDetails}
                  </div>
                )}
              </div>
            </div>

            {/* File Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">File Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>File Name:</strong> {doc.name}
                </div>
                <div>
                  <strong>File Type:</strong> {doc.type || 'Unknown'}
                </div>
                <div>
                  <strong>File Size:</strong> {(doc.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div>
                  <strong>Upload Date:</strong> {new Date(doc.uploadDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Verification Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Verification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <strong>Status:</strong> {getStatusBadge(doc.status)}
                </div>
                <div>
                  <strong>Confidence:</strong> {doc.confidence}%
                </div>
                <div className="md:col-span-2">
                  <strong>Hash_ID:</strong> 
                  <div className="font-mono text-sm bg-muted p-2 rounded mt-1 break-all">
                    {doc.hash}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <strong>Certificate_ID:</strong> 
                  <div className="font-mono text-sm bg-muted p-2 rounded mt-1 break-all">
                    {doc.id}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Results */}
            {doc.analysis && doc.analysis.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">AI Analysis Results</h3>
                <ul className="space-y-2">
                  {doc.analysis.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentView;