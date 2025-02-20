import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Modal from 'react-modal';
import '../css/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { lotApi, accessCodeApi } from '../../services/api';
import { Lot } from '../../services/api';

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

const Adduniqueaccess: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    lot_number_id: '',
    permits_per_month: '',
    duration: '',
    accessCodes: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse access codes from textarea
      const accessCodes = formData.accessCodes
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (accessCodes.length === 0) {
        throw new Error('Please enter at least one access code');
      }

      // Prepare payload
      const payload = {
        lot_number_id: parseInt(formData.lot_number_id),
        permits_per_month: parseInt(formData.permits_per_month),
        duration: formData.duration,
        accessCodes,
      };

      // Call API to create access codes
      await accessCodeApi.bulkCreateAccessCodes(payload);

      // Show success modal
      setModalIsOpen(true);
    } catch (err) {
      console.error('Error creating access codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to create access codes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Add Unique Access" />

      {/* Error Display */}
      {error && <div className="text-red-500">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="accordion">
          <div className="accordion-item">
            <div className="accordion-content active">
              <div className="space-y-6 p-4 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="lotCode" className="block text-sm font-bold text-gray-700">
                      Lot Code
                    </label>
                    <select
                      id="lotCode"
                      name="lot_number_id"
                      value={formData.lot_number_id}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Lot Code</option>
                      {lots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          {lot.lot_code}
                        </option>
                      ))}
                    </select>

                    <div className="mt-4">
                      <label htmlFor="duration" className="block text-sm font-bold text-gray-700">
                        Duration
                      </label>
                      <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Duration</option>
                        <option value="24 hours">24 hours</option>
                        <option value="7 hours">7 hours</option>
                        <option value="8 hours">8 hours</option>
                        <option value="9 hours">9 hours</option>
                        <option value="10 hours">10 hours</option>
                        <option value="11 hours">11 hours</option>
                        <option value="12 hours">12 hours</option>
                        <option value="13 hours">13 hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="permitsPerMonth" className="block text-sm font-bold text-gray-700">
                      Permits/Mo
                    </label>
                    <input
                      id="permitsPerMonth"
                      name="permits_per_month"
                      type="number"
                      value={formData.permits_per_month}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="accessCodes" className="block text-sm font-bold text-gray-700">
                    You can place bulk entries for unique Access Codes, in the format: <code>'accessCode'</code>. <br />
                    Use a new line for each entry.
                  </label>
                  <textarea
                    id="accessCodes"
                    name="accessCodes"
                    rows={4}
                    value={formData.accessCodes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, accessCodes: e.target.value }))
                    }
                    placeholder="accessCode...&#10;accessCode..."
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">Use a new line for each entry.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-10 py-1 text-white bg-[#764ba2] rounded-lg border hover:bg-white hover:text-[#764ba2] hover:border hover:border-[#764ba2] hover:scale-105 transition ease-in-out"
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
            contentLabel="Unique Access Added Successfully"
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
                Unique Access added successfully!
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

export default Adduniqueaccess;