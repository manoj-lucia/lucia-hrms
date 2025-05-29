'use client';

import { useState, useEffect } from 'react';
import { 
  PhotoIcon, 
  TrashIcon, 
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { facialRecognitionService, EmployeePhoto } from '@/lib/facialRecognition';

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
}

export default function EmployeePhotoManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeePhotos, setEmployeePhotos] = useState<EmployeePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees and their photos
      const [employeesResponse, photosResponse] = await Promise.all([
        fetch('/api/employees'),
        facialRecognitionService.getEmployeePhotos()
      ]);

      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
      }

      setEmployeePhotos(photosResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!selectedEmployee || !selectedFile) {
      alert('Please select an employee and photo');
      return;
    }

    try {
      setUploading(selectedEmployee);
      
      const result = await facialRecognitionService.uploadEmployeePhoto(
        selectedEmployee,
        selectedFile,
        'current-admin-id' // Replace with actual admin ID
      );

      if (result.success) {
        alert('Photo uploaded successfully!');
        setSelectedEmployee('');
        setSelectedFile(null);
        setPreviewUrl('');
        fetchData(); // Refresh data
      } else {
        alert(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const deletePhoto = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This will disable facial recognition for this employee.')) {
      return;
    }

    try {
      const result = await facialRecognitionService.deleteEmployeePhoto(employeeId);
      
      if (result.success) {
        alert('Photo deleted successfully');
        fetchData(); // Refresh data
      } else {
        alert(`Delete failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id);
  };

  const hasPhoto = (employeeId: string) => {
    return employeePhotos.some(photo => photo.employeeId === employeeId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-[#0745fe] bg-opacity-10 rounded-lg">
            <CameraIcon className="w-6 h-6 text-[#0745fe]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upload Employee Photo</h2>
            <p className="text-sm text-gray-500">Add facial recognition photos for employees</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Selection & File Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
              >
                <option value="">Choose an employee...</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG. Max size: 5MB
              </p>
            </div>

            <button
              onClick={uploadPhoto}
              disabled={!selectedEmployee || !selectedFile || uploading}
              className="w-full bg-[#0745fe] hover:bg-[#0635d1] text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#0745fe] focus:ring-opacity-30"
            >
              <div className="flex items-center justify-center space-x-2">
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PlusIcon className="w-4 h-4" />
                )}
                <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
              </div>
            </button>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Photo preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Photos List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Photos</h3>
        
        <div className="space-y-3">
          {employees.map(employee => {
            const photo = employeePhotos.find(p => p.employeeId === employee.id);
            const hasPhotoUploaded = hasPhoto(employee.id);
            
            return (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    hasPhotoUploaded ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {hasPhotoUploaded ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.department} • {employee.email}</p>
                    {photo && (
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasPhotoUploaded 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hasPhotoUploaded ? 'Photo Added' : 'No Photo'}
                  </span>
                  
                  {hasPhotoUploaded && (
                    <button
                      onClick={() => deletePhoto(employee.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete photo"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {employees.length === 0 && (
          <div className="text-center py-8">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
}
