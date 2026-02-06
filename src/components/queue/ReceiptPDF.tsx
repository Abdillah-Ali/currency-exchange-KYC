import { useRef, useEffect } from 'react';
import { QueueEntry } from '@/lib/types';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';

interface ReceiptPDFProps {
  entry: QueueEntry;
  onPrintComplete: () => void;
}

export function ReceiptPDF({ entry, onPrintComplete }: ReceiptPDFProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generatePDF = async () => {
      if (!receiptRef.current) return;

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [80, 150], // Receipt paper size
        });

        const imgWidth = 70;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);

        // Auto-download the PDF
        pdf.save(`queue-ticket-${entry.queueNumber}.pdf`);

        // Wait a moment then redirect
        setTimeout(() => {
          onPrintComplete();
        }, 1500);
      } catch (error) {
        console.error('PDF generation error:', error);
        onPrintComplete();
      }
    };

    generatePDF();
  }, [entry, onPrintComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="text-center mb-8">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Generating Receipt...</h2>
        <p className="text-muted-foreground mb-4">Your ticket will download automatically</p>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Try Again
          </Button>
          <Button
            variant="ghost"
            onClick={onPrintComplete}
            className="text-muted-foreground"
          >
            Continue without printing
          </Button>
        </div>
      </div>

      {/* Hidden receipt for PDF generation */}
      <div className="absolute -left-[9999px]">
        <div
          ref={receiptRef}
          className="bg-white p-6 w-[300px]"
          style={{ fontFamily: 'monospace' }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4">
            <h1 className="text-xl font-bold">FOREX EXCHANGE</h1>
            <p className="text-sm">Queue Ticket</p>
          </div>

          {/* Queue Number */}
          <div className="text-center py-6 border-2 border-black rounded mb-4">
            <p className="text-sm text-gray-600">YOUR QUEUE NUMBER</p>
            <p className="text-5xl font-bold">{entry.queueNumber}</p>
          </div>

          {/* Customer Info */}
          <div className="space-y-2 text-sm border-b border-dashed border-gray-400 pb-4 mb-4">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold">{entry.customer.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{entry.customer.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>ID:</span>
              <span>{entry.customer.idType.toUpperCase()}: {entry.customer.idNumber}</span>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="space-y-2 text-sm border-b border-dashed border-gray-400 pb-4 mb-4">
            <div className="flex justify-between">
              <span>Transaction:</span>
              <span className="font-bold uppercase">{entry.transactionType} {entry.currencyCode}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-bold">{entry.amount.toLocaleString()} {entry.currencyCode}</span>
            </div>
            <div className="flex justify-between">
              <span>Rate:</span>
              <span>1 {entry.currencyCode} = {entry.exchangeRate.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total TZS:</span>
              <span>{entry.localAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Wait Time */}
          <div className="text-center py-3 bg-gray-100 rounded mb-4">
            <p className="text-sm text-gray-600">Estimated Wait Time</p>
            <p className="text-2xl font-bold">{entry.estimatedWaitTime} min</p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>{format(entry.createdAt, 'dd/MM/yyyy HH:mm:ss')}</p>
            <p className="mt-2">Please wait for your number to be called</p>
            <p>Thank you for choosing us!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
