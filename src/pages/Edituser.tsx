import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Modal from 'react-modal';
import '../css/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../../services/api';
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

const Edituser: React.FC = () => {
  const { id } = useParams();  // Extract user ID from the URL
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);  // State to hold user data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    note: '',
  });  // Form data state
  const navigate = useNavigate();

  // Fetch user data when the component mounts
  useEffect(() => {
    if (id) {
      userApi.getAllUsers().then(response => {
        const user = response.data.data.find(user => user.id === parseInt(id));  // Access the 'data' array before finding the user
        if (user) {
          setUserData(user);  // Set the fetched user data
          setFormData({
            username: user.username || '',
            password: '',  // Assuming password is either empty or will be updated
            role: user.role || '',  // Ensure you're getting the role from the user data
            note: user.note || '',
          });
        }
      }).catch(error => {
        console.error('Error fetching users:', error);  // Log any errors for debugging
      });
    }
  }, [id]);
  
  

  const closeModal = () => setModalIsOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    // Send all formData values as the update request
    const updateData: Partial<any> = {
      username: formData.username,
      password: formData.password,
      role: formData.role,
      note: formData.note,
    };
  
    // Make API call to update the user
    userApi.updateUser(id, updateData).then(() => {

    });
    setModalIsOpen(true);
    setTimeout(() => {
      navigate('/users');  
    }, 3000); };
  

  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Edit User" />
      <form onSubmit={handleSubmit}>
        <div className="accordion">
          <div className="accordion-item">
            <div className="accordion-content active">
              <div className="space-y-6 p-4 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Role</option>
                      <option value="Admin">Admin</option>
                      <option value="Property Manager">Property Manager</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="note"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Note
                    </label>
                    <input
                      id="note"
                      name="note"
                      type="text"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
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
            Save User
          </button>
        </div>
      </form>

      {/* Modal */}
      <AnimatePresence>
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel=" User Updated Successfully"
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
                User Updated successfully!
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

export default Edituser;