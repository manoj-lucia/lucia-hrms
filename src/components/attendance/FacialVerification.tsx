'use client';

import { useState, useRef, useEffect } from 'react';
import {
  CameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { facialRecognitionService } from '@/lib/facialRecognition';

interface FacialVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (employeeData: any) => void;
  onVerificationFailed: (reason: string) => void;
  actionType: 'check-in' | 'check-out';
}

export default function FacialVerification({
  isOpen,
  onClose,
  onVerificationSuccess,
  onVerificationFailed,
  actionType
}: FacialVerificationProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    confidence: number;
    employeeData?: any;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onVerificationFailed('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(true);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    setVerificationResult(null);
  };

  const verifyFace = async () => {
    if (!capturedImage) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Validate image quality first
      const qualityCheck = facialRecognitionService.validateImageQuality(capturedImage);
      if (!qualityCheck.valid) {
        setVerificationResult({
          success: false,
          confidence: 0,
          message: qualityCheck.message
        });
        setIsVerifying(false);
        return;
      }

      // Call actual facial recognition service
      const result = await facialRecognitionService.verifyFace(capturedImage);

      if (result.success && result.employeeData) {
        result.message = `Face verified with ${(result.confidence * 100).toFixed(1)}% confidence`;
        setVerificationResult(result);

        // Auto-proceed after successful verification
        setTimeout(() => {
          onVerificationSuccess(result.employeeData);
          handleClose();
        }, 2000);
      } else {
        setVerificationResult({
          success: false,
          confidence: result.confidence,
          message: result.message || 'Face not recognized. Please try again or contact administrator.'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        confidence: 0,
        message: 'Verification service unavailable. Please try again later.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setIsCapturing(false);
    setIsVerifying(false);
    setVerificationResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0745fe] to-[#0635d1] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <CameraIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Facial Verification</h2>
                <p className="text-sm text-blue-100">
                  Verify your identity to {actionType === 'check-in' ? 'start work' : 'end work'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Camera/Captured Image */}
          <div className="relative mb-6">
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
              {!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Face detection overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-[#0745fe] rounded-full opacity-50"></div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black bg-opacity-70 text-white text-sm px-3 py-2 rounded-lg text-center">
                {!capturedImage ? 'Position your face in the circle and click capture' : 'Review your photo'}
              </div>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className={`mb-6 p-4 rounded-xl border ${
              verificationResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                {verificationResult.success ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    verificationResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {verificationResult.success ? 'Verification Successful!' : 'Verification Failed'}
                  </p>
                  <p className={`text-sm ${
                    verificationResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {verificationResult.message}
                  </p>
                  {verificationResult.success && verificationResult.employeeData && (
                    <div className="mt-2 flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        Welcome, {verificationResult.employeeData.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!capturedImage ? (
              <button
                onClick={captureImage}
                className="w-full bg-[#0745fe] hover:bg-[#0635d1] text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[#0745fe] focus:ring-opacity-30"
              >
                <div className="flex items-center justify-center space-x-2">
                  <CameraIcon className="w-5 h-5" />
                  <span>Capture Photo</span>
                </div>
              </button>
            ) : !verificationResult ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={retakePhoto}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-30"
                >
                  Retake
                </button>
                <button
                  onClick={verifyFace}
                  disabled={isVerifying}
                  className="bg-[#0745fe] hover:bg-[#0635d1] text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[#0745fe] focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isVerifying ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5" />
                    )}
                    <span>{isVerifying ? 'Verifying...' : 'Verify'}</span>
                  </div>
                </button>
              </div>
            ) : !verificationResult.success ? (
              <button
                onClick={retakePhoto}
                className="w-full bg-[#0745fe] hover:bg-[#0635d1] text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[#0745fe] focus:ring-opacity-30"
              >
                Try Again
              </button>
            ) : null}
          </div>
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
