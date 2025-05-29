// Facial Recognition Service
// This service handles facial verification by comparing live camera data with stored employee photos

export interface FacialVerificationResult {
  success: boolean;
  confidence: number;
  employeeData?: {
    id: string;
    name: string;
    department: string;
    photo: string;
  };
  message: string;
}

export interface EmployeePhoto {
  employeeId: string;
  photoUrl: string;
  encodings: number[]; // Face encodings for comparison
  uploadedAt: string;
  uploadedBy: string; // Super admin who uploaded
}

class FacialRecognitionService {
  private apiEndpoint = '/api/facial-recognition';
  private confidenceThreshold = 0.75; // 75% confidence required

  /**
   * Verify a captured image against stored employee photos
   */
  async verifyFace(capturedImageData: string): Promise<FacialVerificationResult> {
    try {
      // Convert base64 image to blob for upload
      const blob = this.dataURLToBlob(capturedImageData);
      
      // Create form data for API request
      const formData = new FormData();
      formData.append('image', blob, 'captured_face.jpg');
      formData.append('timestamp', new Date().toISOString());

      // Send to facial recognition API
      const response = await fetch(`${this.apiEndpoint}/verify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Validate confidence threshold
      if (result.success && result.confidence < this.confidenceThreshold) {
        return {
          success: false,
          confidence: result.confidence,
          message: `Low confidence match (${(result.confidence * 100).toFixed(1)}%). Please try again with better lighting.`
        };
      }

      return result;
    } catch (error) {
      console.error('Facial verification error:', error);
      return {
        success: false,
        confidence: 0,
        message: 'Verification service unavailable. Please try again later.'
      };
    }
  }

  /**
   * Upload and store employee photo (Super Admin only)
   */
  async uploadEmployeePhoto(
    employeeId: string, 
    photoFile: File, 
    uploadedBy: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('employeeId', employeeId);
      formData.append('uploadedBy', uploadedBy);
      formData.append('timestamp', new Date().toISOString());

      const response = await fetch(`${this.apiEndpoint}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Photo upload error:', error);
      return {
        success: false,
        message: 'Failed to upload photo. Please try again.'
      };
    }
  }

  /**
   * Get stored employee photos (Admin only)
   */
  async getEmployeePhotos(): Promise<EmployeePhoto[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/photos`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee photos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employee photos:', error);
      return [];
    }
  }

  /**
   * Delete employee photo (Super Admin only)
   */
  async deleteEmployeePhoto(employeeId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/photos/${employeeId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting employee photo:', error);
      return {
        success: false,
        message: 'Failed to delete photo. Please try again.'
      };
    }
  }

  /**
   * Test facial recognition system
   */
  async testSystem(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/test`);
      return await response.json();
    } catch (error) {
      console.error('System test error:', error);
      return {
        success: false,
        message: 'System test failed. Please check the facial recognition service.'
      };
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<{
    totalEmployees: number;
    photosUploaded: number;
    verificationAttempts: number;
    successRate: number;
  }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch system stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalEmployees: 0,
        photosUploaded: 0,
        verificationAttempts: 0,
        successRate: 0
      };
    }
  }

  /**
   * Convert data URL to Blob
   */
  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Validate image quality before verification
   */
  validateImageQuality(imageData: string): { valid: boolean; message: string } {
    try {
      // Basic validation - check if it's a valid data URL
      if (!imageData.startsWith('data:image/')) {
        return { valid: false, message: 'Invalid image format' };
      }

      // Check image size (should not be too small)
      const blob = this.dataURLToBlob(imageData);
      if (blob.size < 10000) { // Less than 10KB
        return { valid: false, message: 'Image quality too low. Please ensure good lighting.' };
      }

      if (blob.size > 5000000) { // More than 5MB
        return { valid: false, message: 'Image file too large. Please try again.' };
      }

      return { valid: true, message: 'Image quality acceptable' };
    } catch (error) {
      return { valid: false, message: 'Failed to validate image quality' };
    }
  }

  /**
   * Get recommended camera settings
   */
  getRecommendedSettings() {
    return {
      video: {
        width: { ideal: 640, min: 480 },
        height: { ideal: 480, min: 360 },
        facingMode: 'user',
        frameRate: { ideal: 30, min: 15 }
      },
      lighting: {
        recommendation: 'Ensure good lighting on your face',
        avoid: ['Direct sunlight', 'Backlighting', 'Very dim lighting']
      },
      positioning: {
        distance: 'Position yourself 1-2 feet from the camera',
        angle: 'Look directly at the camera',
        background: 'Use a plain background if possible'
      }
    };
  }
}

// Export singleton instance
export const facialRecognitionService = new FacialRecognitionService();

// Export types
export type { EmployeePhoto };
