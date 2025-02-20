import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Modal from 'react-modal';
import '../css/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { lotApi } from '../../services/api';

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

const EditLot: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for form data
  const [formData, setFormData] = useState({
    lot_code: '',
    address: '',
    city: '',
    permits_per_month: 0,
    duration: '',
    status: 'Free' as 'Free' | 'FreePaid',
    note: '',
    pricing: null as any,
  });

  // State for permit toggles
  const [enableFreePermits, setEnableFreePermits] = useState(false);
  const [enablePaidPermits, setEnablePaidPermits] = useState(false);

  // Permit durations (same as in AddLot)
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

  // Fetch lot data on component mount
  useEffect(() => {
    const fetchLotData = async () => {
      try {
        if (id) {
          const response = await lotApi.getLot(parseInt(id));
          const { lot_code, address, city, permits_per_month, duration, status, note, pricing } = response.data;

          // Set initial state based on fetched data
          setFormData({
            lot_code,
            address,
            city,
            permits_per_month: permits_per_month || 0,
            duration: duration || '',
            status,
            note: note || '',
            pricing: pricing || null,
          });

          // Determine if free or paid permits are enabled
          setEnableFreePermits(!!permits_per_month && status === 'Free');
          setEnablePaidPermits(status === 'FreePaid');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the lot data');
      }
    };
    fetchLotData();
  }, [id]);

  const closeModal = () => {
    setModalIsOpen(false);
    navigate('/lots'); // Redirect after successful update
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare pricing data for paid permits
      const pricingData = enablePaidPermits
        ? permitDurations.reduce((acc, { duration, price }) => {
            acc[duration] = parseFloat(price);
            return acc;
          }, {} as Record<string, number>)
        : null;

      // Prepare lot data for API submission
      const lotData = {
        ...formData,
        permits_per_month: enableFreePermits ? formData.permits_per_month : 0,
        duration: enableFreePermits ? formData.duration : null,
        pricing: pricingData,
        status: enablePaidPermits ? 'FreePaid' : 'Free',
      };

      // Call the API to update the lot
      if (id) {
        await lotApi.updateLot(parseInt(id), lotData);
        setModalIsOpen(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the lot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Edit Lot" />
      {error && <p className="text-red-500">{error}</p>}
      <div className="accordion">
        <div className="accordion-item">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-4 bg-white">
              {/* Lot Code */}
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
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-bold text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => {
                      const status = e.target.value as 'Free' | 'FreePaid';
                      setFormData((prev) => ({ ...prev, status }));
                      setEnablePaidPermits(status === 'FreePaid');
                      setEnableFreePermits(status === 'Free');
                    }}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Free">FREE</option>
                    <option value="FreePaid">FREE/PAID</option>
                  </select>
                </div>
              </div>

              {/* Address and City */}
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

              {/* Notes */}
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
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableFreePermits}
                    onChange={(e) => setEnableFreePermits(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Free Permits</span>
                </label>
                {enableFreePermits && (
                  <>
                    <div className="mt-2">
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
                    <div className="mt-2">
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
                          <option key={duration} value={duration}>
                            {duration}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Paid Permits Section */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enablePaidPermits}
                    onChange={(e) => setEnablePaidPermits(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Paid Permits</span>
                </label>
                {enablePaidPermits && (
                  <div className="mt-2">
                    {permitDurations.map(({ duration, price }, index) => (
                      <div key={index} className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">{duration}</span>
                        <input
                          type="text"
                          defaultValue={price}
                          disabled
                          className="block w-20 px-3 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-10 py-1 text-white bg-[#764ba2] rounded-lg border hover:bg-white hover:text-[#764ba2] hover:border hover:border-[#764ba2] hover:scale-105 transition ease-in-out"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Lot Update Successfully"
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
                Lot Updated successfully!
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

export default EditLot;