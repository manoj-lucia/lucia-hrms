'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

interface Client {
  id: string;
  userId: string;
  clientId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  industry: string;
  status: string;
  branch: {
    id: string;
    name: string;
  };
  phone: string;
  address: string;
  gstNumber: string;
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use() with type assertion
  const unwrappedParams = React.use(params as any) as { id: string };
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [branches, setBranches] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    companyName: '',
    industry: '',
    clientId: '',
    branchId: '',
    status: '',
    gstNumber: ''
  });

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/clients/${unwrappedParams.id}`);
        setClient(response.data);

        // Initialize form data
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          password: '', // Don't populate password
          phone: response.data.phone || '',
          address: response.data.address || '',
          companyName: response.data.companyName || '',
          industry: response.data.industry || '',
          clientId: response.data.clientId,
          branchId: response.data.branch.id,
          status: response.data.status,
          gstNumber: response.data.gstNumber || ''
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Failed to load client details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [unwrappedParams.id]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('/api/branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      // Prepare data for API
      const clientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password || undefined, // Only include if provided
        phone: formData.phone,
        address: formData.address,
        companyName: formData.companyName,
        industry: formData.industry,
        clientId: formData.clientId,
        branchId: formData.branchId,
        status: formData.status,
        gstNumber: formData.gstNumber
      };

      // Update client
      await axios.put(`/api/clients/${unwrappedParams.id}`, clientData);

      setSubmitSuccess('Client updated successfully');

      // Refresh client data
      const response = await axios.get(`/api/clients/${unwrappedParams.id}`);
      setClient(response.data);

    } catch (err: any) {
      console.error('Error updating client:', err);
      setSubmitError(err.response?.data?.error || 'Failed to update client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle client deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await axios.delete(`/api/clients/${unwrappedParams.id}`);

      // Redirect to clients list
      router.push('/clients');

    } catch (err: any) {
      console.error('Error deleting client:', err);
      setSubmitError(err.response?.data?.error || 'Failed to delete client. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/clients" className="mr-4">
              <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Loading Client Details...</h1>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="animate-pulse text-center">
              <p className="text-gray-500">Loading client information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/clients" className="mr-4">
              <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Error</h1>
          </div>
          <div className="mt-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/clients" className="mr-4">
              <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Client: {client?.companyName || `${client?.firstName} ${client?.lastName}`}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirmation(true)}
            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Delete Client
          </button>
        </div>

        {/* Success message */}
        {submitSuccess && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="text-sm text-green-700">{submitSuccess}</div>
            </div>
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="text-sm text-red-700">{submitError}</div>
            </div>
          </div>
        )}

        {/* Client form */}
        {/* Form implementation would go here */}

        {/* Delete confirmation dialog */}
        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDelete}
          title="Delete Client"
          message={`Are you sure you want to delete ${client?.companyName || `${client?.firstName} ${client?.lastName}`}? This action cannot be undone.`}
          confirmButtonText="Delete"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
