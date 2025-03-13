import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Modal from 'react-modal';
import '../css/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { lotApi, vehicleApi, Lot, Vehicle } from '../../services/api';

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

const EditVehicle: React.FC = () => {
    const navigate = useNavigate();
  
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const closeModal = () => setModalIsOpen(false);

  const { id } = useParams<{ id: string }>();
  const [vehicleDuration, setVehicleDuration] = useState<string | null>(null);
  const [licensePlate, setLicensePlate] = useState<string | null>(null);
  const [permitId, setPermitId] = useState<string | null>(null);
  const [lotCodes, setLotCodes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [lotCode, setLotCode] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const vehicleId = Number(id); // Convert the string id to a number
        if (isNaN(vehicleId)) {
          throw new Error('Invalid vehicle ID');
        }

        const response = await vehicleApi.getAllVehicles();
        const vehicleData = response.data.data;

        const vehicle = vehicleData.find(
          (vehicle: any) => vehicle.id === vehicleId,
        );

        if (vehicle) {
          setVehicleDuration(vehicle.duration_type);
          setLicensePlate(vehicle.license_plate);
          setStatus(vehicle.status);

          setPermitId(vehicle.permit_id);

          const lotCodesArray = vehicleData.map(
            (vehicle: any) => vehicle.lot_number.lot_code,
          );
          const statusesArray = vehicleData.map(
            (vehicle: any) => vehicle.status,
          );
          console.log('sattus', vehicle);
          setLotCodes(lotCodesArray);
          setStatuses(statusesArray);
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };

    if (id) {
      fetchVehicleData();
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the data to send to the API
    const updateData: Partial<any> = {
      status: status,
      start_date: startDate,
      end_date: endDate,
      duration_type: vehicleDuration,
      license_plate: licensePlate,
      permit_id: permitId,
    };

    // Make the API call to update the vehicle
    vehicleApi
      .updateVehicle(id, updateData)
      .then(() => {
        // Handle success (e.g., show a success message or redirect)
        console.log('Vehicle updated successfully');

        // Show the modal and then navigate after the timeout
        setModalIsOpen(true);
        setTimeout(() => {
          navigate('/vehicles'); // Redirect to vehicles page
        }, 3000);
      })
      .catch((error) => {
        // Handle error (e.g., show an error message)
        console.error('Error updating vehicle:', error);
      });
  };

  const handleDurationClick = (duration: string) => {
    setVehicleDuration(duration);
  };

  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLicensePlate(e.target.value);
  };

  // Handle input change for Permit ID
  const handlePermitIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPermitId(e.target.value);
  };

  // Combine both values for the textarea
  const combinedValue = `${licensePlate}, ${permitId}`;
  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Edit Vehicle" />
      <form onSubmit={handleSubmit}>
        <div className="accordion">
          <div className="accordion-item">
            {/* <h2 className="accordion-header">Vehicle Information</h2> */}
            <div className="space-y-6 p-4 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="lotCode"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Select Lot Code
                  </label>
                  <select
                    id="lotCode"
                    name="lotCode"
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Lot Code</option>
                    {lotCodes.map((lotCode, index) => (
                      <option key={index} value={lotCode}>
                        {lotCode}
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
                    onChange={(e) => setStatus(e.target.value)}
                    value={status}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Status</option>
                    {statuses.map((status, index) => (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)} // Update the startDate state
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-bold text-gray-700"
                  >
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)} // Update the endDate state
                    className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-2 flex-wrap gap-y-3">
                {['1 Day', '7 Days', '1 Month', '1 Year', '5 Years'].map(
                  (duration) => (
                    <button
                      type="button"
                      key={duration}
                      className={`px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring focus:ring-indigo-500 ${
                        duration === vehicleDuration
                          ? 'bg-indigo-500 text-white'
                          : ''
                      }`} // Apply different style for selected duration
                      onClick={() => handleDurationClick(duration)} // Handle button click
                    >
                      {duration}
                    </button>
                  ),
                )}
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
                  value={combinedValue}
                  rows={4}
                  placeholder="licensePlate, permitID..."
                  className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Use a new line for each entry.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-10 py-1 text-white bg-[#764ba2] rounded-lg border hover:bg-white hover:text-[#764ba2] hover:border hover:border-[#764ba2] hover:scale-105 transition ease-in-out"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Modal */}
      <AnimatePresence>
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Vehicle Updated Successfully"
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
                Vehicle Edit successfully!
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

export default EditVehicle;
