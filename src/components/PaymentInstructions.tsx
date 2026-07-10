
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface PaymentInstructionsProps {
  method: string;
  amount: number;
}

const PaymentInstructions = ({ method, amount }: PaymentInstructionsProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const renderInstructions = () => {
    switch (method) {
      case 'bank_qr':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Scan QR Code to Pay</h3>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                <img 
                  src="/team-members/7fd5379e-3c68-40b4-8436-929b735d7a4a.png" 
                  alt="Bank QR Code" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p><strong>Account Name:</strong> ROJAN TAMANG/MILAN KHANAL</p>
              <p><strong>Bank:</strong> Siddhartha Bank</p>
              <p><strong>Account Type:</strong> Platinum Savings</p>
              <div className="flex items-center gap-2">
                <span><strong>Account Number:</strong> 55508657669</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('55508657669')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Amount to Pay:</strong> Rs. {amount}</p>
            </div>
          </div>
        );

      case 'esewa':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Pay via eSewa</h3>
            </div>
            <div className="space-y-2">
              <p><strong>Account Name:</strong> Sabin Budhathoki</p>
              <div className="flex items-center gap-2">
                <span><strong>eSewa ID:</strong> 9840034153</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('9840034153')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Amount to Pay:</strong> Rs. {amount}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Instructions:</strong><br />
                1. Open eSewa app<br />
                2. Select "Send Money"<br />
                3. Enter eSewa ID: 9840034153<br />
                4. Enter amount: Rs. {amount}<br />
                5. Complete the transaction
              </p>
            </div>
          </div>
        );

      case 'khalti':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Pay via Khalti</h3>
            </div>
            <div className="space-y-2">
              <p><strong>Account Name:</strong> Sabin Budhathoki</p>
              <div className="flex items-center gap-2">
                <span><strong>Khalti ID:</strong> 9840034153</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('9840034153')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Amount to Pay:</strong> Rs. {amount}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Instructions:</strong><br />
                1. Open Khalti app<br />
                2. Select "Send Money"<br />
                3. Enter Khalti ID: 9840034153<br />
                4. Enter amount: Rs. {amount}<br />
                5. Complete the transaction
              </p>
            </div>
          </div>
        );

      case 'ime_pay':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Pay via IME Pay</h3>
            </div>
            <div className="space-y-2">
              <p><strong>Account Name:</strong> Sabin Budhathoki</p>
              <div className="flex items-center gap-2">
                <span><strong>IME Pay ID:</strong> 9840034153</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('9840034153')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Amount to Pay:</strong> Rs. {amount}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Instructions:</strong><br />
                1. Open IME Pay app<br />
                2. Select "Send Money"<br />
                3. Enter IME Pay ID: 9840034153<br />
                4. Enter amount: Rs. {amount}<br />
                5. Complete the transaction
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Payment Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderInstructions()}
      </CardContent>
    </Card>
  );
};

export default PaymentInstructions;
