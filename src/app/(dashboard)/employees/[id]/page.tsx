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
import ConfirmationDialog from '@/components/common/ConfirmationDialog';




import DatePicker from '@/components/ui/DatePicker';
import ImageUpload from '@/components/ui/ImageUpload';


interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  status: string;
  branch: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
  } | null;
  joiningDate: string;
  phone: string;
  address: string;
  profileImage?: string;
  salary: number;
  bankAccountNo: string;
  panCard: string;
  aadharCard: string;
}

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  // Properly unwrap params using React.use() with type assertion
  const unwrappedParams = React.use(params as any) as { id: string };
  const employeeId = unwrappedParams.id;
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [branches, setBranches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [ifscError, setIfscError] = useState('');
  const [panError, setPanError] = useState('');
  const [aadharError, setAadharError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    department: '',
    designation: '',
    employeeId: '',
    salary: '',
    joiningDate: '',
    branchId: '',
    teamId: '',
    status: '',
    bankAccountNo: '',
    ifscCode: '',
    panCard: '',
    aadharCard: ''
  });

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
    if (!phone) {
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

  // Fetch and decrypt actual password
  const fetchActualPassword = async () => {
    try {
      const response = await axios.get(`/api/employees/${employeeId}/password`);
      const data = response.data;

      if (data.password) {
        return data.password;
      } else if (data.error) {
        if (data.needsMigration) {
          return '[Password needs migration - contact admin]';
        }
        return '[Cannot decrypt password]';
      }

      return null;
    } catch (error) {
      console.error('Error fetching password:', error);
      return '[Error fetching password]';
    }
  };

  // Handle password visibility toggle
  const handlePasswordToggle = async () => {
    if (formData.password === '••••••••••••') {
      if (!showPassword) {
        // Fetch and show the decrypted password
        const decryptedPassword = await fetchActualPassword();
        if (decryptedPassword) {
          setFormData(prev => ({ ...prev, password: decryptedPassword }));
          setShowPassword(true);
        } else {
          // If decryption failed, show error message
          setFormData(prev => ({ ...prev, password: '[Cannot decrypt password]' }));
          setShowPassword(true);
        }
      } else {
        // Go back to masked view
        setFormData(prev => ({ ...prev, password: '••••••••••••' }));
        setShowPassword(false);
      }
    } else {
      // Normal toggle for user-entered passwords
      setShowPassword(!showPassword);
    }
  };

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        // Enhanced debugging for the employee ID
        console.log('Client: Fetching employee with ID:', employeeId);

        // Check if ID is valid
        if (!employeeId) {
          throw new Error('Employee ID is missing or invalid');
        }

        // Validate ID format (should be a UUID)
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employeeId)) {
          throw new Error(`Invalid employee ID format: ${employeeId}`);
        }

        // Make the API request with additional error handling
        console.log('Client: Making API request to:', `/api/employees/${employeeId}`);
        const response = await axios.get(`/api/employees/${employeeId}`, {
          // Increase timeout for slower API responses
          timeout: 30000,
          // Add headers for debugging
          headers: {
            'X-Client-Debug': 'true'
          }
        });
        setEmployee(response.data);

        // Initialize profile image
        setProfileImage(response.data.profileImage || null);

        // Initialize form data
        setFormData({
          firstName: response.data.firstName,
          middleName: response.data.middleName || '',
          lastName: response.data.lastName,
          email: response.data.email,
          password: '••••••••••••', // Show masked password placeholder
          phone: response.data.phone || '',
          address: response.data.address || '',
          dateOfBirth: response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] : '',
          gender: response.data.gender || '',
          department: response.data.department,
          designation: response.data.designation,
          employeeId: response.data.employeeId,
          salary: response.data.salary.toString(),
          joiningDate: new Date(response.data.joiningDate).toISOString().split('T')[0],
          branchId: response.data.branch.id,
          teamId: response.data.team?.id || '',
          status: response.data.status,
          bankAccountNo: response.data.bankAccountNo || '',
          ifscCode: response.data.ifscCode || '',
          panCard: response.data.panCard || '',
          aadharCard: response.data.aadharCard || ''
        });

        setError(null);
      } catch (err: any) {
        console.error('Error fetching employee:', err);
        // Show more specific error message based on the error type
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', err.response.status, err.response.data);
          if (err.response.status === 404) {
            setError(`Employee with ID ${employeeId} not found. The employee may have been deleted or the ID is incorrect.`);
          } else {
            setError(`Server error: ${err.response.status}. ${err.response.data?.error || 'Please try again later.'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error('Error request:', err.request);
          setError('No response from server. Please check your network connection and try again.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  // Fetch branches and teams
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('/api/branches');
        setBranches(response.data);
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

    // Special handling for password field
    if (name === 'password') {
      // If user starts typing on the masked password, clear it first then set new value
      if (formData.password === '••••••••••••' && value !== '••••••••••••') {
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsPasswordChanged(true);
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value !== '••••••••••••') {
          setIsPasswordChanged(true);
        }
      }
      if (passwordError) {
        setPasswordError('');
      }
    } else {
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

      setFormData(prev => ({ ...prev, [name]: processedValue }));

      // Clear errors when user starts typing (better UX)
      if (name === 'email' && emailError) {
        setEmailError('');
      } else if (name === 'phone' && phoneError) {
        setPhoneError('');
      } else if (name === 'ifscCode' && ifscError) {
        setIfscError('');
      } else if (name === 'panCard' && panError) {
        setPanError('');
      } else if (name === 'aadharCard' && aadharError) {
        setAadharError('');
      }
    }
  };

  // Handle password field focus
  const handlePasswordFocus = () => {
    // Only clear if user starts typing, not just on focus
    // This prevents clearing on simple click/focus
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
      // Only validate if password has been changed
      if (isPasswordChanged && value) {
        validatePassword(value);
      }
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
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.employeeId ||
          !formData.dateOfBirth || !formData.gender || !formData.department || !formData.designation ||
          !formData.salary || !formData.joiningDate || !formData.branchId ||
          !formData.bankAccountNo || !formData.ifscCode || !formData.panCard || !formData.aadharCard) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email, phone, password, IFSC, PAN, and Aadhaar formats (only if password is provided and changed)
      const isEmailValid = validateEmail(formData.email);
      const isPhoneValid = validatePhone(formData.phone);
      const isPasswordValid = (isPasswordChanged && formData.password && formData.password !== '••••••••••••')
        ? validatePassword(formData.password)
        : true;
      const isIfscValid = validateIfsc(formData.ifscCode);
      const isPanValid = validatePan(formData.panCard);
      const isAadharValid = validateAadhar(formData.aadharCard);

      if (!isEmailValid || !isPhoneValid || !isPasswordValid || !isIfscValid || !isPanValid || !isAadharValid) {
        throw new Error('Please fix the validation errors before submitting');
      }

      // Prepare data for API - exclude password if not changed
      const { password, ...submitData } = formData;
      const finalSubmitData: any = (!isPasswordChanged || formData.password === '••••••••••••')
        ? submitData
        : { ...submitData, password };

      // Add profile image
      finalSubmitData.profileImage = profileImage;

      // Send data to API
      await axios.put(`/api/employees/${employeeId}`, finalSubmitData);

      // Success
      setSubmitSuccess('Employee updated successfully');

      // Refresh employee data
      const updatedEmployee = await axios.get(`/api/employees/${employeeId}`);
      setEmployee(updatedEmployee.data);

      // Update profile image
      setProfileImage(updatedEmployee.data.profileImage || null);

      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error updating employee:', err);
      setSubmitError(err.response?.data?.error || 'Failed to update employee. Please try again.');

      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle employee deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    setSubmitError(null);
    try {
      const response = await axios.delete(`/api/employees/${employeeId}`);
      console.log('Delete response:', response.data);

      // Redirect to employees list with success message
      router.push('/employees?deleted=true');
    } catch (err: any) {
      console.error('Error deleting employee:', err);

      // Get the error message from the response if available
      let errorMessage = 'Failed to delete employee. Please try again.';

      if (err.response) {
        console.log('Error response:', err.response);
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }

      setSubmitError(errorMessage);
      setShowDeleteConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Link href="/employees" className="mr-4 text-blue-500 hover:text-blue-600">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-medium text-gray-900">Loading Employee</h1>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-12 flex justify-center">
              <div className="animate-pulse text-center">
                <div className="h-8 w-8 mx-auto mb-4 rounded-full bg-blue-200"></div>
                <p className="text-gray-500">Loading employee information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Link href="/employees" className="mr-4 text-blue-500 hover:text-blue-600">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-medium text-gray-900">Error</h1>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6">
              <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="text-sm font-medium text-red-700">{error}</div>
                </div>
              </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update employee information and manage their profile details.
            </p>
          </div>
        </div>

        {/* Success message */}
        {submitSuccess && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-100 shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-sm font-medium text-green-800">{submitSuccess}</div>
            </div>
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-100 shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-sm font-medium text-red-800">{submitError}</div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Profile Section */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                    {/* Profile Image */}
                    <div className="flex justify-center sm:justify-start mb-4 sm:mb-0">
                      <ImageUpload
                        currentImage={profileImage || undefined}
                        onImageChange={(imageData) => setProfileImage(imageData)}
                      />
                    </div>

                    {/* Employee Information */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        {/* Left side - Name and Email */}
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-bold text-gray-900">
                              {employee?.firstName} {employee?.middleName ? `${employee.middleName} ` : ''}{employee?.lastName}
                            </h1>
                            <span className="text-sm font-medium text-gray-700 mt-1">
                              ID: {formData.employeeId}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-base text-gray-600">{formData.email}</p>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              formData.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : formData.status === 'INACTIVE'
                                ? 'bg-gray-100 text-gray-800'
                                : formData.status === 'SUSPENDED'
                                ? 'bg-red-100 text-red-800'
                                : formData.status === 'ON_LEAVE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <svg className={`mr-1.5 h-2 w-2 ${
                                formData.status === 'ACTIVE'
                                  ? 'fill-green-400'
                                  : formData.status === 'INACTIVE'
                                  ? 'fill-gray-400'
                                  : formData.status === 'SUSPENDED'
                                  ? 'fill-red-400'
                                  : formData.status === 'ON_LEAVE'
                                  ? 'fill-yellow-400'
                                  : 'fill-gray-400'
                              }`} viewBox="0 0 6 6" aria-hidden="true">
                                <circle cx={3} cy={3} r={3} />
                              </svg>
                              {formData.status === 'ACTIVE' ? 'Active' :
                               formData.status === 'INACTIVE' ? 'Inactive' :
                               formData.status === 'SUSPENDED' ? 'Suspended' :
                               formData.status === 'ON_LEAVE' ? 'On Leave' :
                               formData.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-800">Personal Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update the employee's personal details.
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
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={handlePasswordFocus}
                          onBlur={handleBlur}
                          pattern=".*"
                          title="8 characters, 1 special character, 1 Caps alphabet"
                          placeholder={formData.password === '••••••••••••' ? 'Current password (click to change)' : 'Enter new password'}
                          className={`block w-full px-4 py-2.5 pr-20 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-md text-sm ${
                            passwordError
                              ? 'border-red-500 bg-red-50 focus:ring-red-500'
                              : 'border-gray-300 bg-white focus:ring-[#0745fe]'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <button
                            type="button"
                            onClick={handlePasswordToggle}
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
                              setIsPasswordChanged(true);
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
                    Update the employee's job details.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="employeeId"
                          id="employeeId"
                          required
                          value={formData.employeeId}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-transparent rounded-md text-sm appearance-none pr-10"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="ON_LEAVE">On Leave</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

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
                    Update the employee's additional details.
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
                          value={formData.ifscCode || ''}
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
                          value={formData.panCard || ''}
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
                          value={formData.aadharCard || ''}
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
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Delete Employee
                </button>
              </div>

              <div className="flex items-center gap-x-4">
                <Link
                  href="/employees"
                  className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 border border-gray-300 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-md bg-[#0745fe] px-6 py-2 text-sm font-medium text-white hover:bg-[#0635d1] focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee?.firstName} ${employee?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
