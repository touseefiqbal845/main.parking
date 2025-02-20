import { useState } from 'react';
import { registrationApi } from '../../services/api';


import { Undo2 } from 'lucide-react';


type Errors = {
  lotcode: string;
  licencePlate: string;
};
type FormData = {
  lotcode: string;
  licencePlate: string;
  email: string;
  duration: string;
  date: string;
  time: string;
  startDate: string;
  endDate: string;
  txnRecord: string;
  selectedColors: string[];
  logoStyle: string;
};

type VehicleHistory = {
  lot_code: string;
  access_code: string;
  license_plate: string;
  permit_start: string;
  permit_end: string;
};

const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    lotcode: '',
    licencePlate: '',
    email: '',
    duration: '',
    date: '',
    time: '',
    startDate: '',
    endDate: '',
    txnRecord: '',
    selectedColors: [] as string[],
    logoStyle: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [vehicleHistory, setVehicleHistory] = useState<VehicleHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartOver = () => {
    setCurrentStep(1); // Reset to step 1
    setFormData({
      lotcode: '',
      licencePlate: '',
      email: '',
      duration: '',
      date: '',
      time: '',
      startDate: '',
      endDate: '',
      txnRecord: '',
      selectedColors: [],
      logoStyle: '',
    });
    setErrors({ lotcode: '', licencePlate: '' }); // Clear errors
  };
  ``;

  const handleRegistration = async () => {
    setIsLoading(true);

    try {
      //@ts-ignore
      const registrationResponse = await registrationApi.registerPermit({
        lot_code: formData.lotcode,
        license_plate: formData.licencePlate,
        email: formData.email,
        duration: formData.duration,
        start_date: formData.startDate,
        end_date: formData.endDate,
      });

      if (registrationResponse.data.success) {
        // Retrieve vehicle history after successful registration
        const historyResponse = await registrationApi.getVehicleHistory({
          lot_code: formData.lotcode,
          license_plate: formData.licencePlate,
        });
        setVehicleHistory(historyResponse.data.data);
        alert('Vehicle registered successfully!');
        setCurrentStep(3); // Move to Step 3 after success
      } else {
        alert('Error: ' + registrationResponse.data.message);
      }
    } catch (error) {
      alert('Registration failed. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const steps = [
    'Enter Lot & Plate Details',
    'Enter Permit Details!',
    'Registration Successful',
    // 'Thank You!',
  ];

  // Update progress bar
  const updateProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  const [errors, setErrors] = useState({
    lotcode: '',
    licencePlate: '',
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormData,
  ) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (value.length <= 10) {
      setFormData({ ...formData, [field]: value });
      setErrors({ ...errors, [field]: '' });
    } else {
      const errorMessage =
        field === 'lotcode'
          ? 'Maximum lot code lenght reached.'
          : 'Maximum license plate lenght reached.';
      setErrors({ ...errors, [field]: errorMessage });
    }
  };



  const validateStep = () => {
    let isValid = true;
    const newErrors = { lotcode: '', licencePlate: '' };

    if (!formData.lotcode) {
      newErrors.lotcode = 'You must enter your lot or unique access code';
      isValid = false;
    }

    if (!formData.licencePlate) {
      newErrors.licencePlate = 'You must enter your license plate number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const openModal = () => {
    if (!formData.lotcode || !formData.licencePlate) {
      setModalError(
        'To view your vehicle permit history, please first enter your access code and license plate.',
      );
      setIsModalOpen(true);
      return;
    }
    setModalError(''); // Clear error if fields are valid
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
  };

  const handlePrintReceipt = () => {
    console.log('Printing receipt...');
    // Logic to print or trigger a print preview
    window.print();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
        <div
          className="absolute top-0 left-0 h-1 bg-indigo-600 transition-all"
          style={{ width: `${updateProgress()}%` }}
        ></div>

        <div className={`step ${currentStep === 1 ? 'block' : 'hidden'}`}>
          <h2 className="text-2xl text-black mb-6 text-center font-bold">
            Step 1: Enter Lot & Plate Details
          </h2>

          <div className="mb-3">
            <label htmlFor="lotcode" className="block text-gray-700 mb-2">
              Lot or Unique Access Code
            </label>
            <input
              type="text"
              id="lotcode"
              value={formData.lotcode}
              onChange={(e) => handleInputChange(e, 'lotcode')}
              className="w-full p-2 border-2 border-gray-300 rounded-lg"
              required
            />
            {errors.lotcode && (
              <p className="text-red-600 my-2 text-sm">{errors.lotcode}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="licencePlate" className="block text-gray-700 mb-2">
              License Plate
            </label>
            <input
              type="text"
              id="licencePlate"
              value={formData.licencePlate}
              onChange={(e) => handleInputChange(e, 'licencePlate')}
              className="w-full p-2 border-2 border-gray-300 rounded-lg"
              required
            />
            {errors.licencePlate && (
              <p className="text-red-600 my-2 text-sm">{errors.licencePlate}</p>
            )}
          </div>

          <div className="flex justify-between mb-3">
            <button
              type="button"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md group hover:bg-white hover:text-primary hover:border-primary transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={handleNext}
            >
              Next Step
            </button>
          </div>
          <div className="mb-3">
            <button
              type="button"
              onClick={openModal}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-warning border border-transparent rounded-md group hover:bg-white hover:text-warning hover:border-warning transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning"
            >
              View Vehicle History
            </button>
          </div>
          <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded">
            <p className="text-md text-gray-800">
              M6 Parking enforces parking at participating private properties.
              For permits, submit all required information.
            </p>
            <div className="border-b my-3"></div>
            <p>
              Questions? Contact us at: <br />
              <a href="#">info@m6group.ca</a> or 416-779-4545.
            </p>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start pt-10">
            <div
              className={`bg-white rounded-lg shadow-lg transform transition-transform ${modalError ? 'w-2/3 md:w-1/3' : 'w-11/12 md:w-2/3 lg:w-1/2'
                }`}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Vehicle Permit History (last 35 days)
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700 text-4xl"
                  onClick={closeModal}
                >
                  &times;
                </button>
              </div>
              <div className="p-4">
                {modalError ? (
                  <p className="text-red-600 text-center">{modalError}</p>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-300 text-justify">
                        <th className="px-4 py-2">Lot Code</th>
                        <th className="px-4 py-2">Access Code</th>
                        <th className="px-4 py-2">License Plate</th>
                        <th className="px-4 py-2">Permit Start</th>
                        <th className="px-4 py-2">Permit End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleHistory.length > 0 ? (
                        vehicleHistory.map((history, index) => (
                          <tr key={index} className="border-b border-gray-300 text-justify">
                            <td className="px-4 py-2">{history.lot_code}</td>
                            <td className="px-4 py-2">{history.access_code}</td>
                            <td className="px-4 py-2">{history.license_plate}</td>
                            <td className="px-4 py-2">{history.permit_start}</td>
                            <td className="px-4 py-2">{history.permit_end}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-center">
                            No vehicle history available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`step ${currentStep === 2 ? 'block' : 'hidden'}`}>
          <h2 className="text-2xl text-indigo-600 mb-6 text-center font-bold">
            Step 2: Enter Permit Details!
          </h2>

          {/* Permit Info */}
          <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-gray-800">
              For license plate <span className="font-bold">DSADA</span> using
              access code <span className="font-bold">DSADAS</span>, you have{' '}
              <span className="font-bold">3 permits</span> remaining this month.
              Each permit duration: 24 hours.
            </p>
          </div>

          {/* Important Note */}
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
            <p className="text-sm text-gray-800">
              <span className="font-bold text-red-600 uppercase underline">
                Important:
              </span>{' '}
              All permits activate <span className="font-bold">5 minutes</span>{' '}
              after booking. Plan accordingly to avoid issues.
            </p>
          </div>

          {/* Start Date/Time */}
          <div className="mb-6">
            <label
              htmlFor="date"
              className="block text-gray-700 mb-2 font-medium"
            >
              Start Date/Time of Permit
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full p-2 border-2 border-gray-300 rounded-lg"
                required
              />
              <select
                id="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full p-2 border-2 border-gray-300 rounded-lg"
                required
              >
                <option value="9:20 PM">Currently: 9:20 PM</option>
                {/* Add other time options as needed */}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label
              htmlFor="duration"
              className="block text-gray-700 mb-2 font-medium"
            >
              Duration
            </label>
            <select
              id="duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="w-full p-2 border-2 border-gray-300 rounded-lg"
              required
            >
              <option value="1-permit">1 permit - 24 hours - $0.00</option>
              <option value="2-permit">2 permits - 48 hours - $0.00</option>
              <option value="3-permit">3 permits - 72 hours - $0.00</option>
            </select>
          </div>

          {/* Order Summary */}
          <div className="mb-6 bg-gray-100 p-4 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Order Summary
            </h3>
            <p className="text-md text-gray-700">
              Subtotal: <span className="float-right">$0.00</span>
            </p>
            <p className="text-md text-gray-700">
              Taxes (13% HST): <span className="float-right">$0.00</span>
            </p>
            <p className="text-md font-bold text-gray-700">
              Total: <span className="float-right">$0.00</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-10 gap-3">
            <div className="col-span-3">
              <button
                type="button"
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-danger border border-danger rounded-md group hover:bg-white hover:text-danger hover:border-danger transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
                onClick={handlePrev}
              >
                Back
              </button>
            </div>
            <div className="col-span-7">
              <button
                type="button"
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary"
                onClick={handleRegistration}
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register Vehicle'}
              </button>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={openModal}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-warning border border-transparent rounded-md group hover:bg-white hover:text-warning hover:border-warning transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning"
            >
              View Vehicle History
            </button>
          </div>
        </div>

        <div className={`step ${currentStep === 3 ? 'block' : 'hidden'}`}>
          <h2 className="text-2xl text-black mb-6 text-center font-bold">
            Registration Successful
          </h2>

          {/* Registration Details */}
          <div className="mb-6">
            <p className="text-gray-800 mb-1">
              <span className="font-bold">Access Code:</span> {formData.lotcode || 'N/A'}
            </p>
            <p className="text-gray-800 mb-1">
              <span className="font-bold">License Plate:</span> {formData.licencePlate || 'N/A'}
            </p>
            <p className="text-gray-800 mb-1">
              <span className="font-bold">Start Date:</span> {formData.startDate || 'N/A'}
            </p>
            <p className="text-gray-800 mb-1">
              <span className="font-bold">End Date:</span> {formData.endDate || 'N/A'}
            </p>
            <p className="text-gray-800 mb-1">
              <span className="font-bold">Create Date:</span> {new Date().toLocaleString()}
            </p>
            <p className="text-gray-800 mb-1">
              <span className="font-bold">Txn Record:</span> {formData.txnRecord || 'N/A'}
            </p>
          </div>


          {/* Success Message */}
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 rounded">
            <p className="text-gray-800 text-sm">
              <span className="font-bold">
                Your registration is successful! <br />
              </span>
              You may save it for your records or request an email receipt.
              Thank you.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handlePrintReceipt}
              >
                Print Receipt
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              // onClick={handleEmailReceipt}
              >
                Email Receipt
              </button>
            </div>
          </div>

          {/* Action Buttons */}

          {/* Start Over Button */}
          <div className="flex justify-center">
            <button
              type="button"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              onClick={handleStartOver}
            >
              <span>Register another vehicle, start over</span>
              <Undo2 />
            </button>
          </div>
        </div>

        <div className={`step ${currentStep === 4 ? 'block' : 'hidden'}`}>
          <div className="text-center p-10">
            <img
              src="/api/placeholder/80/80"
              alt="Success"
              className="mx-auto mb-6"
            />
            <h2 className="text-3xl text-gray-800">Thank You!</h2>
            <p>
              We've received your information and will contact you soon to
              discuss your logo design project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
