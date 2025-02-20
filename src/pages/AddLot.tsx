import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Modal from 'react-modal';
import '../css/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { lotApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');
const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};
const tickVariants = {
  hidden: { rotate: 0, opacity: 0 },
  visible: { rotate: 360, opacity: 1 },
};

const messageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const AddLot: React.FC = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [enableFreePermits, setEnableFreePermits] = useState(false);
  const [enablePaidPermits, setEnablePaidPermits] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    lot_code: '',
    address: '',
    city: '',
    permits_per_month: 6,
    duration: '24 hours',
    status: 'Free' as const,
    note: '',
    pricing: null as any,
  });

  const closeModal = () => {
    setModalIsOpen(false);
    navigate('/lots'); // Redirect after successful addition
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pricingData = enablePaidPermits ? permitDurations.reduce((acc, { duration, price }) => {
        acc[duration] = parseFloat(price);
        return acc;
      }, {} as Record<string, number>) : null;

      const lotData = {
        ...formData,
        permits_per_month: enableFreePermits ? formData.permits_per_month : 0,
        duration: enableFreePermits ? formData.duration : null,
        pricing: pricingData,
        status: enablePaidPermits ? 'FreePaid' : 'Free'
      };

      await lotApi.createLot(lotData);
      setModalIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the lot');
    } finally {
      setLoading(false);
    }
  };

  const permitDurations = [
    { duration: '15 mins', price: '10.00' },
    { duration: '30 mins', price: '10.00' },
    { duration: '1 hour', price: '10.00' },
    { duration: '2 hours', price: '10.00' },
    { duration: '3 hours', price: '10.00' },
    { duration: '4 hours', price: '10.00' },
    { duration: '6 hours', price: '10.00' },
    { duration: '8 hours', price: '10.00' },
    { duration: '12 hours', price: '10.00' },
    { duration: '24 hours', price: '10.00' },
    { duration: '1 day', price: '10.00' },
    { duration: '3 days', price: '10.00' },
    { duration: '5 days', price: '10.00' },
    { duration: '7 days', price: '10.00' },
    { duration: '14 days', price: '10.00' },
    { duration: '30 days', price: '10.00' },
  ];

  const freePermitDurations = [
    '15 mins', '30 mins', '1 hour', '2 hours', '3 hours', '4 hours',
    '5 hours', '6 hours', '7 hours', '8 hours', '9 hours', '10 hours',
    '11 hours', '12 hours', '13 hours', '14 hours', '15 hours', '16 hours',
    '17 hours', '18 hours', '19 hours', '20 hours', '21 hours', '22 hours',
    '23 hours', '24 hours'
  ];

  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Add Lot" />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="accordion">
          <div className="accordion-item">
            <div className="accordion-content active">
              <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="lot_code" className="block text-sm font-bold text-gray-700">
                      Lot Code
                    </label>
                    <input
                      id="lot_code"
                      name="lot_code"
                      value={formData.lot_code}
                      onChange={handleInputChange}
                      placeholder="Enter Lot Code"
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-bold text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="Free">FREE</option>
                      <option value="FreePaid">FREE/PAID</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="address" className="block text-sm font-bold text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-bold text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="note" className="block text-sm font-bold text-gray-700">
                    Notes
                  </label>
                  <input
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Enter Notes"
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {/* Free Permits Section */}
                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="enableFreePermits"
                      checked={enableFreePermits}
                      onChange={(e) => setEnableFreePermits(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="enableFreePermits" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Free Permits
                    </label>
                  </div>
                  {enableFreePermits && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="permits_per_month" className="block text-sm font-bold text-gray-700">
                          Number of Free Permits Allowed per Month
                        </label>
                        <input
                          type="number"
                          id="permits_per_month"
                          name="permits_per_month"
                          value={formData.permits_per_month}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="duration" className="block text-sm font-bold text-gray-700">
                          Duration of Each Free Permit
                        </label>
                        <select
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          {freePermitDurations.map((duration) => (
                            <option 
                              key={duration} 
                              value={duration}
                            >
                              {duration}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Paid Permits Section */}
                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="enablePaidPermits"
                      checked={enablePaidPermits}
                      onChange={(e) => setEnablePaidPermits(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="enablePaidPermits" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Paid Permits
                    </label>
                  </div>
                  {enablePaidPermits && (
                    <div className="grid grid-cols-2 gap-4">
                      {permitDurations.map((permit, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-1/2">
                            <input
                              type="text"
                              value={permit.duration}
                              readOnly
                              className="block w-full px-3 py-2 bg-gray-50 border rounded-lg shadow-sm sm:text-sm"
                            />
                          </div>
                          <div className="w-1/2">
                            <input
                              type="number"
                              defaultValue={permit.price}
                              step="0.01"
                              className="block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-2 text-white bg-[#764ba2] rounded-lg border hover:bg-white hover:text-[#764ba2] hover:border hover:border-[#764ba2] hover:scale-105 transition ease-in-out disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <AnimatePresence>
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Lot Added Successfully"
            className="modal"
            overlayClassName="modal-overlay"
            ariaHideApp={false}
          >
            <motion.div
              className="flex flex-col items-center p-8 bg-white rounded-lg shadow-lg"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                height="70px"
                viewBox="0 0 512 512"
                variants={tickVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5 }}
              >
                <path
                  d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                  fill="#008000"
                />
              </motion.svg>
              <motion.h1
                className="mt-4 text-xl font-bold"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Lot added successfully!
              </motion.h1>
              <button
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}
              >
                Close
              </button>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddLot;