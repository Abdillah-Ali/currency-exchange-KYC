import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, RotateCcw, Check, ArrowLeft, ArrowRight } from 'lucide-react';

interface DocumentScannerProps {
  onCapture: (imageData: string) => void;
  onNext: () => void;
  onBack: () => void;
  capturedImage?: string;
}

export function DocumentScanner({ onCapture, onNext, onBack, capturedImage }: DocumentScannerProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      // Fallback to file upload
      fileInputRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    onCapture('');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Scan Your ID Document</h2>
        <p className="text-muted-foreground">
          Take a clear photo of your Passport, NIDA, or ZanID
        </p>
      </div>

      <div className="w-full aspect-[4/3] bg-muted rounded-2xl overflow-hidden relative mb-6 border-4 border-dashed border-primary/30">
        {isCapturing ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="absolute inset-0 pointer-events-none">
              {/* Scan frame overlay */}
              <div className="absolute inset-8 border-2 border-white/50 rounded-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-success rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-success rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-success rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-success rounded-br-lg" />
              </div>
            </div>
          </>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured document"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <Camera className="h-20 w-20 mb-4 opacity-50" />
            <p className="text-lg">Position your ID document here</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex gap-4 w-full max-w-md mb-6">
        {isCapturing ? (
          <>
            <Button
              variant="outline"
              className="flex-1 h-14 text-lg"
              onClick={stopCamera}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-14 text-lg bg-success hover:bg-success/90"
              onClick={capturePhoto}
            >
              <Camera className="h-5 w-5 mr-2" />
              Capture
            </Button>
          </>
        ) : capturedImage ? (
          <>
            <Button
              variant="outline"
              className="flex-1 h-14 text-lg"
              onClick={handleRetake}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </Button>
            <Button
              className="flex-1 h-14 text-lg bg-success hover:bg-success/90"
              onClick={onNext}
            >
              <Check className="h-5 w-5 mr-2" />
              Confirm
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1 h-14 text-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload
            </Button>
            <Button
              className="flex-1 h-14 text-lg bg-primary"
              onClick={startCamera}
            >
              <Camera className="h-5 w-5 mr-2" />
              Take Photo
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 w-full max-w-md">
        <Button
          variant="outline"
          className="flex-1 h-14 text-lg"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        {capturedImage && (
          <Button
            className="flex-1 h-14 text-lg bg-success hover:bg-success/90"
            onClick={onNext}
          >
            Next
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
