// import React, { useState } from 'react';
// import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
// import Modal from 'react-modal';
// import '../css/style.css';
// import { motion, AnimatePresence } from 'framer-motion';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Modal from 'react-modal';
import '../css/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { lotApi, vehicleApi, Lot, Vehicle } from '../../services/api';
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

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    lot_number_id: '',
    status: '',
    start_date: '',
    end_date: '',
    duration_type: '1 Day' as Vehicle['duration_type'],
    vehicles: '',
  });

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const response = await lotApi.getAllLots();
      setLots(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching lots:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch lots');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDurationClick = (duration: Vehicle['duration_type']) => {
    setFormData(prev => ({
      ...prev,
      duration_type: duration
    }));
  };

  const closeModal = () => {
    setModalIsOpen(false);
    navigate('/vehicles');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse vehicles from textarea
      const vehicles = formData.vehicles
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [license_plate, permit_id] = line.split(',').map(s => s.trim());
          return { license_plate, permit_id };
        });

      if (vehicles.length === 0) {
        throw new Error('Please enter at least one vehicle entry');
      }

      await vehicleApi.bulkCreateVehicles({
        lot_number_id: parseInt(formData.lot_number_id),
        status: formData.status as Vehicle['status'],
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration_type: formData.duration_type,
        vehicles
      });

      setModalIsOpen(true);
    } catch (err) {
      console.error('Error creating vehicles:', err);
      setError(err instanceof Error ? err.message : 'Failed to create vehicles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Add Vehicle" />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="accordion">
          <div className="accordion-item">
            <div className="space-y-6 p-4 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="lot_number_id"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Select Lot Code
                  </label>
                  <select
                    id="lot_number_id"
                    name="lot_number_id"
                    value={formData.lot_number_id}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Lot Code</option>
                    {lots.map(lot => (
                      <option key={lot.id} value={lot.id}>
                        {lot.lot_code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Select Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Tenant">Tenant</option>
                    <option value="Employee">Employee</option>
                    <option value="Visitor">Visitor</option>
                    <option value="Do Not Tag">Do Not Tag</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-bold text-gray-700"
                  >
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2 flex-wrap gap-y-3">
                {(['1 Day', '7 Days', '1 Month', '1 Year', '5 Years'] as const).map(
                  (duration) => (
                    <button
                      type="button"
                      key={duration}
                      onClick={() => handleDurationClick(duration)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        formData.duration_type === duration
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200'
                      } focus:outline-none focus:ring focus:ring-indigo-500`}
                    >
                      {duration}
                    </button>
                  ),
                )}
              </div>
              <div>
                <label
                  htmlFor="vehicles"
                  className="block text-sm font-bold text-gray-700"
                >
                  Enter each entry in the format:{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">licensePlate, permitId</code>
                </label>
                <textarea
                  id="vehicles"
                  name="vehicles"
                  rows={4}
                  value={formData.vehicles}
                  onChange={handleInputChange}
                  placeholder="ABC123, PERMIT001&#10;XYZ789, PERMIT002"
                  className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Use a new line for each entry.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-2 text-white bg-[#764ba2 ] rounded-lg border hover:bg-white hover:text-[#764ba2] hover:border hover:border-[#764ba2] hover:scale-105 transition ease-in-out disabled:opacity-50"
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
            contentLabel="Vehicles Added Successfully"
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
                Vehicles added successfully!
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

export default AddVehicle;