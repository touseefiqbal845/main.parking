import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Modal from 'react-modal';
import '../css/style.css';
import { motion, AnimatePresence } from 'framer-motion';

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

const Edituniqueaccess: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const closeModal = () => setModalIsOpen(false);

  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Edit Unique Access" />
      <form>
        <div className="accordion">
          <div className="accordion-item">
            <div className="accordion-content active">
              <div className="space-y-6 p-4 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="lotCode"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Lot Code
                    </label>
                    <select
                      id="lotCode"
                      name="lotCode"
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Lot Code</option>
                      <option value="">1270F</option>
                      <option value="">1270F_DNT</option>
                      <option value="">1270F_OUT</option>
                      <option value="">2433F</option>
                      <option value="">2433F_DNT</option>
                      <option value="">2433F_OUT</option>
                    </select>
                    <div className="mt-4">
                      <label
                        htmlFor="duration"
                        className="block text-sm font-bold text-gray-700"
                      >
                        Duration
                      </label>
                      <select
                        id="duration"
                        name="duration"
                        className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">24 hours</option>
                        <option value="">7 hours</option>
                        <option value="">8 hours</option>
                        <option value="">9 hours</option>
                        <option value="">10 hours</option>
                        <option value="">11 hours</option>
                        <option value="">12 hours</option>
                        <option value="">13 hours</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Permits/Mo
                    </label>
                    <input
                      id="status"
                      name="status"
                      type="number"
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    ></input>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="entries"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Enter each entry in the format:{' '}
                    <code>'licensePlate, permitId'</code>
                  </label>
                  <textarea
                    id="entries"
                    name="entries"
                    rows={4}
                    placeholder="Access Code..."
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">
                    Use a new line for each entry.
                  </p>
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
            Add
          </button>
        </div>
      </form>

      {/* Modal */}
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

export default Edituniqueaccess;
