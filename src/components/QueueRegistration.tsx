import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyCode, TransactionType, Customer, QueueEntry } from '@/lib/types';
import { currencies, generateQueueNumber, getCurrencyByCode } from '@/lib/mockData';
import { ATMTextInput } from '@/components/queue/ATMTextInput';
import { ATMOptionSelect } from '@/components/queue/ATMOptionSelect';
import { ATMAmountInput } from '@/components/queue/ATMAmountInput';
import { DocumentScanner } from '@/components/queue/DocumentScanner';
import { ReceiptPDF } from '@/components/queue/ReceiptPDF';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, ArrowRight, Home } from 'lucide-react';

type Step =
  | 'welcome'
  | 'fullName'
  | 'phoneNumber'
  | 'idType'
  | 'idNumber'
  | 'scanDocument'
  | 'transactionType'
  | 'currencySelect'
  | 'amount'
  | 'confirm'
  | 'printing';

interface FormData {
  fullName: string;
  phoneNumber: string;
  idType: 'passport' | 'nida' | 'zanid';
  idNumber: string;
  documentImage: string;
  transactionType: TransactionType;
  currencyCode: CurrencyCode | '';
  amount: string;
}

export function QueueRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    idType: 'nida',
    idNumber: '',
    documentImage: '',
    transactionType: 'buy',
    currencyCode: '',
    amount: '',
  });
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);

  const selectedCurrency = formData.currencyCode ? getCurrencyByCode(formData.currencyCode as CurrencyCode) : null;
  const rate = selectedCurrency
    ? (formData.transactionType === 'buy' ? selectedCurrency.buyRate : selectedCurrency.sellRate)
    : 0;
  const localAmount = formData.amount ? parseFloat(formData.amount) * rate : 0;

  const updateFormData = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleConfirm = async () => {
    try {
      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          id_type: formData.idType,
          id_number: formData.idNumber,
          transaction_type: formData.transactionType,
          currency_code: formData.currencyCode,
          active_amount: formData.amount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join queue');
      }

      const data = await response.json();

      const customer: Customer = {
        id: `cust-${Date.now()}`,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        idType: formData.idType,
        idNumber: formData.idNumber,
        isVerified: true,
        kycStatus: 'verified',
        createdAt: new Date(),
        transactionCount: 0,
      };

      const entry: QueueEntry = {
        id: `q-${Date.now()}`,
        queueNumber: data.ticket,
        customer,
        transactionType: formData.transactionType,
        currencyCode: formData.currencyCode as CurrencyCode,
        amount: parseFloat(formData.amount),
        exchangeRate: rate,
        localAmount,
        status: 'waiting',
        estimatedWaitTime: data.estimated_wait,
        createdAt: new Date(),
      };

      setQueueEntry(entry);
      setStep('printing');
    } catch (error) {
      console.error('Queue error:', error);
      // We could add a toast here if we had the toast hook imported
    }
  };

  const handlePrintComplete = () => {
    navigate('/');
  };

  const idTypeOptions = [
    { value: 'nida', label: 'NIDA', icon: '🪪', description: 'National ID' },
    { value: 'passport', label: 'Passport', icon: '📕', description: 'Travel Document' },
    { value: 'zanid', label: 'ZanID', icon: '🏝️', description: 'Zanzibar ID' },
  ];

  const transactionOptions = [
    { value: 'buy', label: 'Buy Foreign', icon: '💵', description: 'TZS → Foreign' },
    { value: 'sell', label: 'Sell Foreign', icon: '🏦', description: 'Foreign → TZS' },
  ];

  const currencyOptions = currencies.map(c => ({
    value: c.code,
    label: c.code,
    icon: c.flag,
    description: c.name,
  }));

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center p-8">
        <div className="text-center animate-fade-in">
          <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-6xl">💱</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to Forex Exchange</h1>
          <p className="text-xl text-muted-foreground mb-12">Touch the screen to start your transaction</p>

          <Button
            className="h-20 px-16 text-2xl bg-success hover:bg-success/90"
            onClick={() => setStep('fullName')}
          >
            Start Registration
            <ArrowRight className="h-8 w-8 ml-4" />
          </Button>

          <Button
            variant="ghost"
            className="mt-8 text-muted-foreground"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Printing Screen
  if (step === 'printing' && queueEntry) {
    return <ReceiptPDF entry={queueEntry} onPrintComplete={handlePrintComplete} />;
  }

  // Confirmation Screen
  if (step === 'confirm' && selectedCurrency) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Confirm Your Details</h1>
            <p className="text-muted-foreground">Please verify all information is correct</p>
          </div>

          <div className="bg-card rounded-2xl p-6 space-y-4 shadow-lg border">
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Name</span>
              <span className="font-semibold">{formData.fullName}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-semibold">{formData.phoneNumber}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">ID</span>
              <span className="font-semibold">{formData.idType.toUpperCase()}: {formData.idNumber}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Transaction</span>
              <span className="font-semibold capitalize">
                {formData.transactionType} {selectedCurrency.flag} {selectedCurrency.code}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">
                {selectedCurrency.symbol}{parseFloat(formData.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-semibold">1 {selectedCurrency.code} = {rate.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between py-4 bg-primary/10 rounded-lg px-4">
              <span className="font-bold text-lg">Total (TZS)</span>
              <span className="font-bold text-2xl text-primary">
                {localAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Document Preview */}
          {formData.documentImage && (
            <div className="mt-6 bg-card rounded-xl p-4 border">
              <p className="text-sm text-muted-foreground mb-2">Scanned Document</p>
              <img
                src={formData.documentImage}
                alt="ID Document"
                className="w-full h-32 object-contain rounded-lg"
              />
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              className="flex-1 h-16 text-lg"
              onClick={() => setStep('amount')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <Button
              className="flex-1 h-16 text-lg bg-success hover:bg-success/90"
              onClick={handleConfirm}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirm & Print
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main ATM Flow Container
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Forex Queue Registration</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground/80 hover:text-primary-foreground"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-1" />
            Exit
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card border-b">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Step {getStepNumber(step)} of 9</span>
            <span>{Math.round((getStepNumber(step) / 9) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(getStepNumber(step) / 9) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-6">
        {step === 'fullName' && (
          <ATMTextInput
            label="Enter Your Full Name"
            subtitle="As it appears on your ID document"
            placeholder="JOHN DOE"
            value={formData.fullName}
            onChange={(v) => updateFormData('fullName', v)}
            onNext={() => setStep('phoneNumber')}
            onBack={() => setStep('welcome')}
            isNextDisabled={formData.fullName.length < 3}
          />
        )}

        {step === 'phoneNumber' && (
          <ATMTextInput
            label="Enter Your Phone Number"
            subtitle="We'll send you transaction updates"
            placeholder="+255 XXX XXX XXX"
            value={formData.phoneNumber}
            onChange={(v) => updateFormData('phoneNumber', v)}
            onNext={() => setStep('idType')}
            onBack={() => setStep('fullName')}
            isNextDisabled={formData.phoneNumber.length < 10}
          />
        )}

        {step === 'idType' && (
          <ATMOptionSelect
            title="Select Your ID Type"
            subtitle="Choose the document you will use for verification"
            options={idTypeOptions}
            selectedValue={formData.idType}
            onSelect={(v) => {
              updateFormData('idType', v as 'passport' | 'nida' | 'zanid');
              setStep('idNumber');
            }}
            onBack={() => setStep('phoneNumber')}
            columns={3}
          />
        )}

        {step === 'idNumber' && (
          <ATMTextInput
            label={`Enter Your ${formData.idType.toUpperCase()} Number`}
            subtitle="Enter the number exactly as shown on your document"
            placeholder="XXXXXXXXX"
            value={formData.idNumber}
            onChange={(v) => updateFormData('idNumber', v)}
            onNext={() => setStep('scanDocument')}
            onBack={() => setStep('idType')}
            isNextDisabled={formData.idNumber.length < 5}
          />
        )}

        {step === 'scanDocument' && (
          <DocumentScanner
            capturedImage={formData.documentImage}
            onCapture={(img) => updateFormData('documentImage', img)}
            onNext={() => setStep('transactionType')}
            onBack={() => setStep('idNumber')}
          />
        )}

        {step === 'transactionType' && (
          <ATMOptionSelect
            title="What Would You Like To Do?"
            subtitle="Select your transaction type"
            options={transactionOptions}
            selectedValue={formData.transactionType}
            onSelect={(v) => {
              updateFormData('transactionType', v as TransactionType);
              setStep('currencySelect');
            }}
            onBack={() => setStep('scanDocument')}
            columns={2}
          />
        )}

        {step === 'currencySelect' && (
          <ATMOptionSelect
            title="Select Currency"
            subtitle={`Choose the currency you want to ${formData.transactionType}`}
            options={currencyOptions}
            selectedValue={formData.currencyCode}
            onSelect={(v) => {
              updateFormData('currencyCode', v as CurrencyCode);
              setStep('amount');
            }}
            onBack={() => setStep('transactionType')}
            columns={4}
          />
        )}

        {step === 'amount' && selectedCurrency && (
          <ATMAmountInput
            value={formData.amount}
            onChange={(v) => updateFormData('amount', v)}
            onNext={() => setStep('confirm')}
            onBack={() => setStep('currencySelect')}
            currency={selectedCurrency}
            transactionType={formData.transactionType}
            rate={rate}
          />
        )}
      </main>
    </div>
  );
}

function getStepNumber(step: Step): number {
  const steps: Step[] = [
    'welcome', 'fullName', 'phoneNumber', 'idType', 'idNumber',
    'scanDocument', 'transactionType', 'currencySelect', 'amount'
  ];
  return steps.indexOf(step) + 1;
}
