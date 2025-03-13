// import React, { useState } from 'react';
// import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
// import Modal from 'react-modal';
// import '../css/style.css';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate, useParams } from 'react-router-dom';
// import { accessCodeApi } from '../../services/api';

// Modal.setAppElement('#root');

// const Edituniqueaccess: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // State for form fields
//   const [lotNumberId, setLotNumberId] = useState('');
//   const [permitsPerMonth, setPermitsPerMonth] = useState('');
//   const [duration, setDuration] = useState('');
//   const [accessCode, setAccessCode] = useState('');

//   const closeModal = () => setModalIsOpen(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const updateData = {
//         lot_number_id: lotNumberId,
//         permits_per_month: Number(permitsPerMonth),
//         duration,
//         access_code: accessCode,
//       };

//       // Call the API to update access code
//       await accessCodeApi.updateAccessCode(Number(id), updateData);

//       // Show success modal
//       setModalIsOpen(true);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // For getting id from route params
import axios from 'axios';
import Modal from 'react-modal';
import { AnimatePresence, motion } from 'framer-motion'; // For animations
import { accessCodeApi } from '../../services/api';

const Edituniqueaccess = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get id from URL params
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [lotNumberId, setLotNumberId] = useState('');
  const [permitsPerMonth, setPermitsPerMonth] = useState('');
  const [duration, setDuration] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [lotCodes, setLotCodes] = useState([]);


  
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

  // Fetch the access code data on component mount
  useEffect(() => {
    const fetchAccessCodeData = async () => {
      try {
        setLoading(true);
        const response = await accessCodeApi.getAccessCode(Number(id));
        const data = response.data;

        // Populate the fields with the data from API
        setLotNumberId(data.lot_number_id || '');
        setPermitsPerMonth(data.permits_per_month || '');
        setDuration(data.duration || '');
        setAccessCode(data.access_code || '');
        setLotCodes(data?.lot_number?.lot_code)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessCodeData();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // const selectedLot = lotCodes.find(lot => lot.lot_code === lotCodes);
      const updateData = {
        lot_number_id: lotNumberId,
        permits_per_month: Number(permitsPerMonth),
        duration,
        access_code: accessCode,
        lot:lotCodes
      };

      // Call the API to update the access code
      await accessCodeApi.updateAccessCode(Number(id), updateData);

      // Show success modal
      setModalIsOpen(true);
      setTimeout(() => {
        navigate('/uniqueaccess');  
      }, 3000);  
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="accordion">
          <div className="accordion-item">
            <div className="accordion-content active">
              <div className="space-y-6 p-4 bg-white">
                <div className="grid grid-cols-2 gap-6">
                {/* <div>
                    <label htmlFor="permitsPerMonth" className="block text-sm font-bold text-gray-700">
                      Lot Code
                    </label>
                    <input
                      id="permitsPerMonth"
                      type="text"
                      value={lotCodes}
                      onChange={(e) => setLotCodes(e.target.value)}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div> */}
                  
                  <div>
                    <label htmlFor="permitsPerMonth" className="block text-sm font-bold text-gray-700">
                      Permits/Mo
                    </label>
                    <input
                      id="permitsPerMonth"
                      type="number"
                      value={permitsPerMonth}
                      onChange={(e) => setPermitsPerMonth(e.target.value)}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-bold text-gray-700">
                    Duration
                  </label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
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

                <div>
                  <label htmlFor="accessCode" className="block text-sm font-bold text-gray-700">
                    Access Code
                  </label>
                  <textarea
                    id="accessCode"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter access code..."
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-10 py-1 text-white bg-[#764ba2] rounded-lg border hover:bg-white hover:text-[#764ba2] hover:border hover:border-[#764ba2] hover:scale-105 transition ease-in-out"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>

      {/* Modal */}
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
                    Unique Access Code Updated successfully!
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

export default Edituniqueaccess;
