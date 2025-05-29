'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeftIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import LoadingButton from '@/components/ui/LoadingButton';




import DatePicker from '@/components/ui/DatePicker';

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [branches, setBranches] = useState([]);
  const [teams, setTeams] = useState([]);

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [ifscError, setIfscError] = useState('');
  const [panError, setPanError] = useState('');
  const [aadharError, setAadharError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state - all empty for new employee
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '+91 ', // Default to Indian country code
    address: '',
    dateOfBirth: '',
    gender: '',
    department: '',
    designation: '',
    employeeId: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0], // Default to today
    branchId: '',
    teamId: '',
    status: 'ACTIVE', // Default status for new employees
    bankAccountNo: '',
    ifscCode: '',
    panCard: '',
    aadharCard: '',
    profileImage: ''
  });

  // Profile image state
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string>('');

  // Valid country codes (comprehensive list of 195+ countries)
  const validCountryCodes = [
    '+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49',
    '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90',
    '+91', '+92', '+93', '+94', '+95', '+98', '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227',
    '+228', '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244',
    '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262',
    '+263', '+264', '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298', '+299', '+350', '+351', '+352', '+353', '+354',
    '+355', '+356', '+357', '+358', '+359', '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+380', '+381', '+382',
    '+383', '+385', '+386', '+387', '+389', '+420', '+421', '+423', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508',
    '+509', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', '+599', '+670', '+672', '+673', '+674', '+675', '+676',
    '+677', '+678', '+679', '+680', '+681', '+682', '+683', '+684', '+685', '+686', '+687', '+688', '+689', '+690', '+691', '+692', '+850',
    '+852', '+853', '+855', '+856', '+880', '+886', '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971',
    '+972', '+973', '+974', '+975', '+976', '+977', '+992', '+993', '+994', '+995', '+996', '+998'
  ];

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageUploadError('Image size must be less than 5MB');
      return;
    }

    setImageUploadError('');
    setProfileImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove profile image
  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setImageUploadError('');
    setFormData(prev => ({ ...prev, profileImage: '' }));
  };

  // Generate random password
  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    let password = '';
    // Ensure at least one of each required type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += special[Math.floor(Math.random() * special.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // Fill the rest randomly
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = 3; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('');
      return true;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Correct format: example@example.com');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validate phone number with country code
  const validatePhone = (phone: string) => {
    if (!phone || phone.trim() === '+91 ' || phone.trim() === '+91') {
      setPhoneError('');
      return true;
    }

    const trimmedPhone = phone.trim();

    // Check if phone starts with a country code
    if (!trimmedPhone.startsWith('+')) {
      setPhoneError('Country code required (e.g., +91)');
      return false;
    }

    // Extract country code and phone number
    const countryCodeMatch = trimmedPhone.match(/^\+(\d{1,4})/);
    if (!countryCodeMatch) {
      setPhoneError('Invalid country code format');
      return false;
    }

    const countryCode = '+' + countryCodeMatch[1];
    const phoneWithoutCountryCode = trimmedPhone.substring(countryCode.length).replace(/\D/g, '');

    // Check if country code is valid
    if (!validCountryCodes.includes(countryCode)) {
      setPhoneError('Invalid country code');
      return false;
    }

    // For Indian numbers (+91), require exactly 10 digits
    if (countryCode === '+91') {
      if (phoneWithoutCountryCode.length !== 10) {
        setPhoneError('Indian phone number must have exactly 10 digits after +91');
        return false;
      }
    } else {
      // For other countries, require at least 7 digits (minimum international standard)
      if (phoneWithoutCountryCode.length < 7) {
        setPhoneError('Phone number too short for this country code');
        return false;
      }
    }

    setPhoneError('');
    return true;
  };

  // Validate password
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('');
      return true;
    }
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (!hasMinLength || !hasUpperCase || !hasSpecialChar) {
      setPasswordError('8 characters, 1 special character, 1 Caps alphabet');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Validate IFSC code
  const validateIfsc = (ifsc: string) => {
    if (!ifsc) {
      setIfscError('');
      return true;
    }

    const trimmedIfsc = ifsc.trim().toUpperCase();

    // IFSC format: 11 characters total
    // First 4 characters: Bank code (alphabetic)
    // 5th character: Always 0 (zero)
    // Last 6 characters: Branch code (alphanumeric)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (trimmedIfsc.length !== 11) {
      setIfscError('IFSC code must be exactly 11 characters');
      return false;
    }

    if (!ifscRegex.test(trimmedIfsc)) {
      setIfscError('Invalid IFSC format. Example: SBIN0000123');
      return false;
    }

    setIfscError('');
    return true;
  };

  // Validate PAN card
  const validatePan = (pan: string) => {
    if (!pan) {
      setPanError('');
      return true;
    }

    const trimmedPan = pan.trim().toUpperCase();

    // PAN format: AAAPA1234A
    // First 5 characters: 3 alphabetic + 1 alphabetic (entity type) + 1 alphabetic
    // Next 4 characters: Numeric (0-9)
    // Last character: Alphabetic check digit
    const panRegex = /^[A-Z]{3}[ABCFGHLJPTK][A-Z][0-9]{4}[A-Z]$/;

    if (trimmedPan.length !== 10) {
      setPanError('PAN must be exactly 10 characters');
      return false;
    }

    if (!panRegex.test(trimmedPan)) {
      setPanError('Invalid PAN format. Example: ABCDE1234F');
      return false;
    }

    // Validate the 4th character (entity type)
    const entityType = trimmedPan[3];
    const validEntityTypes = ['A', 'B', 'C', 'F', 'G', 'H', 'L', 'J', 'P', 'T', 'K'];
    if (!validEntityTypes.includes(entityType)) {
      setPanError('Invalid entity type in PAN. 4th character must be P(Individual), F(Firm), C(Company), H(HUF), A(AOP), T(Trust), etc.');
      return false;
    }

    setPanError('');
    return true;
  };

  // Validate Aadhaar card
  const validateAadhar = (aadhar: string) => {
    if (!aadhar) {
      setAadharError('');
      return true;
    }

    // Remove spaces and non-numeric characters for validation
    const cleanedAadhar = aadhar.replace(/\s+/g, '').replace(/\D/g, '');

    // Aadhaar format: 12 digits
    if (cleanedAadhar.length !== 12) {
      setAadharError('Aadhaar must be exactly 12 digits');
      return false;
    }

    // Check if all digits are the same (invalid Aadhaar)
    if (/^(\d)\1{11}$/.test(cleanedAadhar)) {
      setAadharError('Invalid Aadhaar number. All digits cannot be the same');
      return false;
    }

    // Check if it starts with 0 or 1 (invalid Aadhaar)
    if (cleanedAadhar.startsWith('0') || cleanedAadhar.startsWith('1')) {
      setAadharError('Invalid Aadhaar number. Cannot start with 0 or 1');
      return false;
    }

    // Basic Verhoeff algorithm check (simplified)
    if (!isValidAadharChecksum(cleanedAadhar)) {
      setAadharError('Invalid Aadhaar number. Checksum validation failed');
      return false;
    }

    setAadharError('');
    return true;
  };

  // Simplified Verhoeff algorithm for Aadhaar validation
  const isValidAadharChecksum = (aadhar: string): boolean => {
    // This is a simplified version. In production, you'd use the full Verhoeff algorithm
    // For now, we'll do basic validation
    const digits = aadhar.split('').map(Number);

    // Check if it's a valid sequence (not all same digits, not sequential)
    const isSequential = digits.every((digit, index) =>
      index === 0 || digit === (digits[index - 1] + 1) % 10
    );

    if (isSequential) {
      return false;
    }

    // For demo purposes, we'll accept most valid-looking 12-digit numbers
    // In production, implement full Verhoeff algorithm
    return true;
  };

  // Fetch branches and teams
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('/api/branches');
        setBranches(response.data);
        // Set default branch if available
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, branchId: response.data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams');
        setTeams(response.data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchBranches();
    fetchTeams();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let processedValue = value;

    // For IFSC and PAN, convert to uppercase
    if (name === 'ifscCode' || name === 'panCard') {
      processedValue = value.toUpperCase();
    }
    // For Aadhaar, format with spaces (XXXX XXXX XXXX) and allow only digits
    else if (name === 'aadharCard') {
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 12 digits
      const limitedDigits = digitsOnly.slice(0, 12);
      // Format with spaces every 4 digits
      processedValue = limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    // For phone, ensure it starts with +91 if user tries to remove it
    else if (name === 'phone') {
      if (!value.startsWith('+91')) {
        // If user deleted the country code, restore it
        if (value.length === 0) {
          processedValue = '+91 ';
        } else if (!value.startsWith('+')) {
          processedValue = '+91 ' + value;
        } else {
          processedValue = value;
        }
      } else {
        processedValue = value;
      }
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Clear errors when user starts typing (better UX)
    if (name === 'email' && emailError) {
      setEmailError('');
    } else if (name === 'phone' && phoneError) {
      setPhoneError('');
    } else if (name === 'password' && passwordError) {
      setPasswordError('');
    } else if (name === 'ifscCode' && ifscError) {
      setIfscError('');
    } else if (name === 'panCard' && panError) {
      setPanError('');
    } else if (name === 'aadharCard' && aadharError) {
      setAadharError('');
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only validate on blur for better UX
    if (name === 'email') {
      validateEmail(value);
    } else if (name === 'phone') {
      validatePhone(value);
    } else if (name === 'password') {
      validatePassword(value);
    } else if (name === 'ifscCode') {
      validateIfsc(value);
    } else if (name === 'panCard') {
      validatePan(value);
    } else if (name === 'aadharCard') {
      validateAadhar(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password ||
          !formData.dateOfBirth || !formData.gender || !formData.employeeId || !formData.department ||
          !formData.designation || !formData.salary || !formData.joiningDate || !formData.branchId ||
          !formData.bankAccountNo || !formData.ifscCode || !formData.panCard || !formData.aadharCard) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email, password, IFSC, PAN, and Aadhaar formats
      const isEmailValid = validateEmail(formData.email);
      const isPasswordValid = validatePassword(formData.password);
      const isIfscValid = validateIfsc(formData.ifscCode);
      const isPanValid = validatePan(formData.panCard);
      const isAadharValid = validateAadhar(formData.aadharCard);

      // Only validate phone if it's provided and not just the default country code
      const isPhoneValid = !formData.phone || formData.phone.trim() === '+91 ' || formData.phone.trim() === '+91' || validatePhone(formData.phone);

      if (!isEmailValid || !isPhoneValid || !isPasswordValid || !isIfscValid || !isPanValid || !isAadharValid) {
        throw new Error('Please fix the validation errors before submitting');
      }

      // Prepare data for API
      let profileImageUrl = '';

      // Upload profile image if provided
      if (profileImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', profileImageFile);

        try {
          const uploadResponse = await axios.post('/api/upload', imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          profileImageUrl = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Failed to upload profile image. Please try again.');
        }
      }

      const submitData = {
        ...formData,
        profileImage: profileImageUrl
      };

      // Send data to API (POST for creating new employee)
      await axios.post('/api/employees', submitData);

      // Success
      setSubmitSuccess('Employee created successfully');

      // Redirect to employees list after a short delay
      setTimeout(() => {
        router.push('/employees');
      }, 2000);

      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error creating employee:', err);
      setSubmitError(err.response?.data?.error || 'Failed to create employee. Please try again.');

      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 min-h-screen" style={{ backgroundColor: '#f7f7fa' }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0745fe] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen" style={{ backgroundColor: '#f7f7fa' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/employees"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-150"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Employees
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create a new employee profile with all required information.
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="text-sm font-medium text-green-800">{submitSuccess}</div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="text-sm font-medium text-red-800">{submitError}</div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Profile Section */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Employee Profile</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Set up the employee's basic profile information.
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Profile Image Upload */}
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Profile Photo
                      </label>

                      {/* Image Upload Area */}
                      <div className="relative">
                        <input
                          type="file"
                          id="profileImage"
                          name="profileImage"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />

                        {profileImagePreview ? (
                          /* Image Preview with Actions */
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-3 border-white shadow-lg ring-2 ring-gray-200">
                              <img
                                src={profileImagePreview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => document.getElementById('profileImage')?.click()}
                              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#0745fe] hover:bg-[#0635d1] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ring-2 ring-white"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={removeProfileImage}
                              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ring-2 ring-white"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          /* Upload Avatar */
                          <label
                            htmlFor="profileImage"
                            className="cursor-pointer block"
                          >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-3 border-white shadow-lg ring-2 ring-gray-200 hover:ring-[#0745fe] transition-all duration-200 flex items-center justify-center group relative overflow-hidden">
                              {/* Background Pattern */}
                              <div className="absolute inset-0 bg-gradient-to-br from-[#0745fe]/5 to-[#0635d1]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                              {/* Upload Icon */}
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="w-8 h-8 bg-gray-300 group-hover:bg-[#0745fe] group-hover:text-white rounded-full flex items-center justify-center mb-1 transition-all duration-200">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-[#0745fe] transition-colors">
                                  Add Photo
                                </span>
                              </div>
                            </div>
                          </label>
                        )}

                        {/* File Requirements */}
                        <div className="mt-2 text-center">
                          <p className="text-xs text-gray-500">
                            JPG, PNG • Max 5MB
                          </p>
                          {imageUploadError && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{imageUploadError}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Employee ID */}
                    <div className="flex-1 min-w-0">
                      <label htmlFor="profileEmployeeId" className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="employeeId"
                          id="profileEmployeeId"
                          required
                          value={formData.employeeId}
                          onChange={handleChange}
                          placeholder="e.g., EMP001, JD2024"
                          className="block w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-[#0745fe] rounded-lg text-sm shadow-sm transition-all duration-200"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 flex items-center">
                        <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Unique identifier for login and system access
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Personal Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the employee's personal details.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                        Middle name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="middleName"
                          id="middleName"
                          value={formData.middleName}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full px-4 py-2.5 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-md text-sm ${
                            emailError
                              ? 'border-red-500 bg-red-50 focus:ring-red-500'
                              : 'border-gray-300 bg-white focus:ring-[#0745fe]'
                          }`}
                          placeholder="employee@example.com"
                        />
                      </div>
                      {emailError && (
                        <p className="mt-1 text-xs text-red-600">{emailError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          pattern=".*"
                          title="8 characters, 1 special character, 1 Caps alphabet"
                          placeholder="Enter password"
                          className={`block w-full px-4 py-2.5 pr-20 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-md text-sm ${
                            passwordError
                              ? 'border-red-500 bg-red-50 focus:ring-red-500'
                              : 'border-gray-300 bg-white focus:ring-[#0745fe]'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="px-2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                          <div className="h-6 w-px bg-gray-300 mx-1"></div>
                          <button
                            type="button"
                            onClick={() => {
                              const newPassword = generatePassword();
                              setFormData(prev => ({ ...prev, password: newPassword }));
                              validatePassword(newPassword);
                              setShowPassword(true); // Show password when generated
                            }}
                            className="px-2 text-xs text-[#0745fe] hover:text-[#0635d1] font-medium"
                          >
                            <KeyIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {passwordError && (
                        <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full px-4 py-2.5 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-md text-sm ${
                            phoneError
                              ? 'border-red-500 bg-red-50 focus:ring-red-500'
                              : 'border-gray-300 bg-white focus:ring-[#0745fe]'
                          }`}
                          placeholder="+91 9876543210"
                        />
                      </div>
                      {phoneError && (
                        <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                      )}
                    </div>

                    <div>
                      <DatePicker
                        label="Date of Birth"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                        placeholder="Select date of birth"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="gender"
                          name="gender"
                          required
                          value={formData.gender}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm appearance-none pr-10"
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <textarea
                          name="address"
                          id="address"
                          rows={2}
                          value={formData.address}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Employment Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the employee's job details.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="department"
                          id="department"
                          required
                          value={formData.department}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="designation"
                          id="designation"
                          required
                          value={formData.designation}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="branchId"
                          name="branchId"
                          required
                          value={formData.branchId}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm appearance-none pr-10"
                        >
                          <option value="">Select Branch</option>
                          {branches.map((branch: any) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-2">
                        Team
                      </label>
                      <div className="relative">
                        <select
                          id="teamId"
                          name="teamId"
                          value={formData.teamId}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm appearance-none pr-10"
                        >
                          <option value="">Not Assigned</option>
                          {teams.map((team: any) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                        Salary <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="salary"
                          id="salary"
                          required
                          min="0"
                          step="0.01"
                          value={formData.salary}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <DatePicker
                        label="Joining Date"
                        name="joiningDate"
                        id="joiningDate"
                        value={formData.joiningDate}
                        onChange={(date) => setFormData(prev => ({ ...prev, joiningDate: date }))}
                        placeholder="Select joining date"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Additional Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the employee's additional details.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="bankAccountNo" className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="bankAccountNo"
                          id="bankAccountNo"
                          required
                          value={formData.bankAccountNo}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="ifscCode"
                          id="ifscCode"
                          required
                          maxLength={11}
                          value={formData.ifscCode}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full px-4 py-2.5 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-md text-sm ${
                            ifscError
                              ? 'border-red-500 bg-red-50 focus:ring-red-500'
                              : 'border-gray-300 bg-white focus:ring-[#0745fe]'
                          }`}
                          placeholder="SBIN0000123"
                        />
                      </div>
                      {ifscError && (
                        <p className="mt-1 text-xs text-red-600">{ifscError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="panCard" className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Card <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="panCard"
                          id="panCard"
                          required
                          maxLength={10}
                          value={formData.panCard}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full px-4 py-2.5 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-md text-sm ${
                            panError
                              ? 'border-red-500 bg-red-50 focus:ring-red-500'
                              : 'border-gray-300 bg-white focus:ring-[#0745fe]'
                          }`}
                          placeholder="ABCDE1234F"
                        />
                      </div>
                      {panError && (
                        <p className="mt-1 text-xs text-red-600">{panError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="aadharCard" className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhaar Card <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="aadharCard"
                          id="aadharCard"
                          required
                          maxLength={14} // 12 digits + 2 spaces
                          value={formData.aadharCard}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full px-4 py-2.5 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-md text-sm ${
                            aadharError
                              ? 'border-red-500 bg-red-50 focus:ring-red-500'
                              : 'border-gray-300 bg-white focus:ring-[#0745fe]'
                          }`}
                          placeholder="1234 5678 9012"
                        />
                      </div>
                      {aadharError && (
                        <p className="mt-1 text-xs text-red-600">{aadharError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between gap-x-4">
              <div>
                <Link
                  href="/employees"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0745fe] transition-colors duration-150"
                >
                  Cancel
                </Link>
              </div>

              <div className="flex items-center gap-x-4">
                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  variant="primary"
                  size="md"
                  loadingText="Creating Employee..."
                >
                  Create Employee
                </LoadingButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}