
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentVerificationProps {
  onSubmit: (data: { transactionId: string; screenshot: File | null }) => void;
  isSubmitting: boolean;
}

const PaymentVerification = ({ onSubmit, isSubmitting }: PaymentVerificationProps) => {
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      setScreenshot(file);
      toast.success('Screenshot uploaded successfully!');
    } else {
      toast.error('Please upload an image file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }
    
    if (!screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    onSubmit({ transactionId: transactionId.trim(), screenshot });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Payment Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID *</Label>
            <Input
              id="transactionId"
              type="text"
              placeholder="Enter your transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              Enter the transaction ID from your payment receipt
            </p>
          </div>

          <div className="space-y-2">
            <Label>Payment Screenshot *</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : screenshot 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('screenshot-input')?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              {screenshot ? (
                <div>
                  <p className="text-green-600 font-medium">{screenshot.name}</p>
                  <p className="text-sm text-gray-500">Click to change screenshot</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
            <input
              id="screenshot-input"
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Please upload a clear screenshot of your payment confirmation 
              that shows the transaction ID, amount, and date/time.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !transactionId.trim() || !screenshot}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment Verification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentVerification;
