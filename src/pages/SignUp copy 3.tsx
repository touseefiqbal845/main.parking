import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import 'tailwindcss/tailwind.css';

interface Summary {
  subtotal: number;
  tax: number;
  total: number;
}

interface DurationOption {
  value: string;
  text: string;
  subtotal?: number;
}

interface VehicleHistoryEntry {
  lotCode: string;
  accessCode: string;
  licensePlate: string;
  permitStart: string;
  permitEnd: string;
}

const App: React.FC = () => {
  const [lotCode, setLotCode] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [durationOptions, setDurationOptions] = useState<DurationOption[]>([]);
  const [summary, setSummary] = useState<Summary>({ subtotal: 0, tax: 0, total: 0 });
  const [vehicleHistory, setVehicleHistory] = useState<VehicleHistoryEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [overlapAlert, setOverlapAlert] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // To handle multistep form

  const mockHistoryData: VehicleHistoryEntry[] = [
    {
      lotCode: 'LOT2',
      accessCode: '',
      licensePlate: 'ABC123',
      permitStart: '2024-01-15 10:30',
      permitEnd: '2024-01-16 10:30',
    },
    {
      lotCode: 'LOT2',
      accessCode: 'ACCESS123',
      licensePlate: 'ABC123',
      permitStart: '2024-02-20 14:45',
      permitEnd: '2024-02-21 14:45',
    },
  ];

  const updateDurationOptions = () => {
    if (
      lotCode.toUpperCase() === 'LOT3' &&
      licensePlate.toUpperCase() === 'ABC123'
    ) {
      const options: DurationOption[] = [
        { value: '24', text: '1 permit - 24 hours - $8.00', subtotal: 8.0 },
        { value: '48', text: '2 permits - 48 hours - $16.00', subtotal: 16.0 },
        { value: '72', text: '3 permits - 72 hours - $24.00', subtotal: 24.0 },
      ];
      setDurationOptions(options);
    } else {
      const options: DurationOption[] = [
        { value: '24', text: '1 permit - 24 hours - $0.00' },
        { value: '48', text: '2 permits - 48 hours - $0.00' },
        { value: '72', text: '3 permits - 72 hours - $0.00' },
      ];
      setDurationOptions(options);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = durationOptions.find(
      (option) => option.value === e.target.value,
    );
    if (selectedOption) {
      const tax = selectedOption.subtotal ? selectedOption.subtotal * 0.13 : 0;
      const total = selectedOption.subtotal ? selectedOption.subtotal + tax : 0;
      setSummary({ subtotal: selectedOption.subtotal || 0, tax, total });
    }
  };

  const handleViewHistory = () => {
    if (!lotCode || !licensePlate) {
      alert('Please enter lot code and license plate to view history.');
      return;
    }

    const filteredHistory = mockHistoryData.filter(
      (entry) =>
        entry.lotCode.toUpperCase() === lotCode.toUpperCase() &&
        entry.licensePlate.toUpperCase() === licensePlate.toUpperCase(),
    );
    setVehicleHistory(filteredHistory);
    setShowHistoryModal(true);
  };

  const checkOverlappingPermits = () => {
    if (
      lotCode.toUpperCase() === 'LOT4' &&
      licensePlate.toUpperCase() === 'ABC123' &&
      new Date() < new Date('2024-12-06')
    ) {
      setOverlapAlert(true);
    } else {
      setOverlapAlert(false);
    }
  };

  useEffect(() => {
    updateDurationOptions();
    checkOverlappingPermits();
  }, [lotCode, licensePlate]);

  const nextStep = () => setStep((prevStep) => Math.min(prevStep + 1, 2)); // Assuming max 2 steps
  const prevStep = () => setStep((prevStep) => Math.max(prevStep - 1, 1));

  return (
    <div className="p-8 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Vehicle Registration</h1>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Lot Code:</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lotCode}
              onChange={(e) => setLotCode(e.target.value)}
              placeholder="Enter lot code"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">License Plate:</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="Enter license plate"
            />
          </div>

          {overlapAlert && (
            <div className="bg-red-200 text-red-800 p-4 rounded-md mb-6">
              <strong>Overlapping Permit Alert:</strong> This vehicle has an overlapping permit.
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Duration:</label>
            <select
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleDurationChange}
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            <p className="text-gray-700">Subtotal: ${summary.subtotal.toFixed(2)}</p>
            <p className="text-gray-700">Tax: ${summary.tax.toFixed(2)}</p>
            <p className="text-gray-700">Total: ${summary.total.toFixed(2)}</p>
          </div>

          <div className="flex justify-between mb-6">
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition duration-300"
              onClick={nextStep}
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <div className="flex justify-between mb-6">
            <button
              className="bg-gray-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-gray-600 transition duration-300"
              onClick={prevStep}
            >
              Back
            </button>
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 transition duration-300"
              onClick={handleViewHistory}
            >
              View Vehicle History
            </button>
          </div>

          {/* Vehicle History Modal */}
          <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Vehicle History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <table className="w-full border border-gray-300 rounded-md">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Lot Code</th>
                    <th className="px-4 py-2 text-left">Access Code</th>
                    <th className="px-4 py-2 text-left">License Plate</th>
                    <th className="px-4 py-2 text-left">Permit Start</th>
                    <th className="px-4 py-2 text-left">Permit End</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleHistory.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="px-4 py-2">{entry.lotCode}</td>
                      <td className="px-4 py-2">{entry.accessCode}</td>
                      <td className="px-4 py-2">{entry.licensePlate}</td>
                      <td className="px-4 py-2">{entry.permitStart}</td>
                      <td className="px-4 py-2">{entry.permitEnd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default App;
