import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Modal from 'react-modal';
import '../css/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { userApi } from '../../services/api';
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

const Adduser: React.FC = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    note: ''
  });

  const propertyOptions = ['1CA', '1704V', '2243E', '219R', '25D', '2600J', '3251B', '6161B'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (property: string) => {
    setSelectedProperties(prev =>
      prev.includes(property)
        ? prev.filter(item => item !== property)
        : [...prev, property]
    );
  };

  const closeModal = () => {
    setModalIsOpen(false);
    navigate('/users');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await userApi.createUser({
        ...formData,
        role: formData.role as 'Admin' | 'Property Manager',
        properties: selectedProperties
      });
      setModalIsOpen(true);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Add New User" />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 p-4 bg-white">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-bold text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Property Manager">Property Manager</option>
              </select>
            </div>
            <div>
              <label htmlFor="note" className="block text-sm font-bold text-gray-700">
                Note
              </label>
              <input
                id="note"
                name="note"
                type="text"
                value={formData.note}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">Property Access</label>
            <div className="grid grid-cols-3 gap-4 p-2 border rounded-lg">
              {propertyOptions.map((property) => (
                <label key={property} className="flex items-center space-x-2 w-10">
                  <input
                    type="checkbox"
                    value={property}
                    checked={selectedProperties.includes(property)}
                    onChange={() => handleCheckboxChange(property)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{property}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-2 text-white bg-[#764ba2] rounded-lg border hover:bg-white hover:text-[#764ba2] hover:border hover:border-[#764ba2] hover:scale-105 transition ease-in-out disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
      
      <AnimatePresence>
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="New User Added Successfully"
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
                New User added successfully!
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

export default Adduser;