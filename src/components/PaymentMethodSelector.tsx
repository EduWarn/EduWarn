
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CreditCard, Smartphone, QrCode, Banknote } from 'lucide-react';

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: string) => void;
  selectedMethod: string;
}

const PaymentMethodSelector = ({ onMethodSelect, selectedMethod }: PaymentMethodSelectorProps) => {
  const paymentMethods = [
    {
      id: 'bank_qr',
      name: 'Bank Transfer (QR)',
      icon: <QrCode className="w-5 h-5" />,
      description: 'Scan QR code to pay via mobile banking'
    },
    {
      id: 'esewa',
      name: 'eSewa',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Pay using eSewa digital wallet'
    },
    {
      id: 'khalti',
      name: 'Khalti',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Pay using Khalti digital wallet'
    },
    {
      id: 'ime_pay',
      name: 'IME Pay',
      icon: <Banknote className="w-5 h-5" />,
      description: 'Pay using IME Pay digital wallet'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodSelect}>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                  {method.icon}
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
