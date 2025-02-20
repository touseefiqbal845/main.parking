import React, { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import '../css/style.css';
import { SquarePen } from 'lucide-react';
import { vehicleApi, Vehicle as VehicleType } from '../../services/api';

Modal.setAppElement('#root');

const Vehicle: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'ALL'>(25);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [vehiclesToDelete, setVehiclesToDelete] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleApi.getAllVehicles();
      setVehicles(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelect = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(vehicles.map((vehicle) => vehicle.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleCopy = () => {
    const rowsToCopy = vehicles
      .filter((vehicle) => selectedRows.includes(vehicle.id))
      .map(
        ({ license_plate, permit_id, status }) =>
          `${license_plate}\t${permit_id}\t${status}`
      )
      .join('\n');

    navigator.clipboard.writeText(rowsToCopy);
    alert('Rows copied to clipboard!');
  };

  const handleExport = () => {
    const rowsToExport = vehicles.filter((vehicle) =>
      selectedRows.includes(vehicle.id)
    );
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['License Plate,Permit ID,Status,Start Date,End Date']
        .concat(
          rowsToExport.map(
            ({ license_plate, permit_id, status, start_date, end_date }) =>
              `${license_plate},${permit_id},${status},${start_date},${end_date}`
          )
        )
        .join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'vehicles.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDelete = async () => {
    try {
      // Use Promise.all to delete each vehicle individually
      await Promise.all(selectedRows.map(id => vehicleApi.deleteVehicle(id)));
      await fetchVehicles(); // Refresh the list of vehicles
      setSelectedRows([]); // Clear the selected rows
      setModalOpen(false); // Close the modal
    } catch (err) {
      console.error('Error deleting vehicles:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete vehicles');
    }
  };

  const filteredVehicles = useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    
    return vehicles.filter(vehicle => 
      vehicle.license_plate?.toLowerCase().includes(inputValue.toLowerCase()) ||
      vehicle.permit_id?.toLowerCase().includes(inputValue.toLowerCase()) ||
      vehicle.status?.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [vehicles, inputValue]);

  const currentRows = useMemo(() => {
    if (rowsPerPage === 'ALL') {
      return filteredVehicles;
    }
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return filteredVehicles.slice(indexOfFirstRow, indexOfLastRow);
  }, [currentPage, filteredVehicles, rowsPerPage]);

  const totalPages = rowsPerPage === 'ALL' ? 1 : Math.ceil(filteredVehicles.length / rowsPerPage);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb pageName="Vehicles" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between max-sm:flex-col">
          <div className="flex gap-[7px] items-end">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search vehicles..."
              aria-label="Text input"
            />
            {inputValue && (
              <button
                className="text-lg flex border p-2.5 rounded justify-end font-semibold hover:text-white hover:bg-[#6c757d] text-[#6c757d] dark:text-white transition-all hover:scale-125 hover:text-lg cursor-pointer"
                onClick={() => setInputValue('')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={16}
                  viewBox="0 0 448 512"
                  style={{ fill: 'currentColor' }}
                >
                  <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z" />
                </svg>
              </button>
            )}
            <Link to="/vehicles/addvehicles">
              <button className="text-lg flex border p-2 rounded justify-end font-semibold hover:text-white hover:bg-black text-black dark:text-white transition-all hover:scale-125 hover:text-lg cursor-pointer">
                <svg
                  height={20}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  style={{ fill: 'currentColor' }}
                  aria-label="Add Vehicle"
                >
                  <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
                </svg>
              </button>
            </Link>
          </div>
          <div>
            {selectedRows.length > 0 && (
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleCopy}
                  className="bg-[#0dcaf0] border border-[#0dcaf0] text-black py-2 px-4 rounded-md hover:bg-[#31d2f2]"
                >
                  Copy ({selectedRows.length})
                </button>
                <button
                  onClick={handleExport}
                  className="bg-[#6c757d] text-white border border-[#6c757d] py-2 px-4 rounded-md hover:bg-[#5c636a]"
                >
                  Export ({selectedRows.length})
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-[#dc3545] text-white py-2 px-4 rounded-md hover:bg-[#bb2d3b]"
                >
                  Delete ({selectedRows.length})
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="border-t border-b border-stroke py-4.5 px-4 dark:border-strokedark">
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === vehicles.length}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  License Plate
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Permit ID
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Start Date
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  End Date
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Duration
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Active
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-t border-b border-stroke dark:border-strokedark"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(vehicle.id)}
                      onChange={() => handleRowSelect(vehicle.id)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {vehicle.license_plate}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {vehicle.permit_id}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    <div
                      className={`vehicle-status-badge text-center px-2 py-1 text-xs font-semibold rounded-sm uppercase ${
                        vehicle.status === 'Tenant'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'Employee'
                          ? 'bg-blue-100 text-blue-800'
                          : vehicle.status === 'Visitor'
                          ? 'bg-yellow-100 text-yellow-800'
                          : vehicle.status === 'Do Not Tag'
                          ? 'bg-red-100 text-red-800'
                          : vehicle.status === 'Other'
                          ? 'bg-purple-100 text-purple-800'
                          : ''
                      }`}
                    >
                      {vehicle.status}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {new Date(vehicle.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {new Date(vehicle.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {vehicle.duration_type}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vehicle.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/vehicles/editvehicle/${vehicle.id}`}
                        aria-label="Edit vehicle"
                      >
                        <SquarePen
                          className="text-primary"
                          width={20}
                          height={20}
                        />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {currentRows.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            No vehicles available
          </div>
        )}
        <div className="flex justify-between items-center py-3 px-6 max-sm:flex-col max-sm:gap-[10px]">
          <div className="flex items-center space-x-2">
            <select
              id="rowsPerPage"
              className="border rounded ps-2 pe-3 py-1 text-md"
              value={rowsPerPage}
              onChange={(e) => {
                const value = e.target.value;
                setRowsPerPage(value === 'ALL' ? 'ALL' : parseInt(value, 10));
                setCurrentPage(1);
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value="ALL">ALL</option>
            </select>
            {/* <label htmlFor="rowsPerPage" className="text-sm text-gray-600">
              Showing {currentRows.length} of {filteredVehicles.length} vehicles
            </label> */}
          </div>
          <div>
            <button
              className="mr-2 px-3 py-1 border rounded-md cursor-pointer"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border rounded-md cursor-pointer"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Delete Vehicle Confirmation"
        className="bg-white border max-w-md mx-auto mt-24 p-4 rounded shadow"
      >
        <h2 className="text-lg font-bold">Confirm Delete</h2>
        <p>Are you sure you want to delete these vehicles?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Vehicle;