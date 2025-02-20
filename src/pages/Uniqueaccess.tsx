import React, { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import '../css/style.css';
import { SquarePen } from 'lucide-react';
import { accessCodeApi, AccessCode } from '../../services/api';

Modal.setAppElement('#root');

const Uniqueaccess: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'ALL'>(25);
  const [modalOpen, setModalOpen] = useState(false);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const fetchAccessCodes = async () => {
    try {
      const response = await accessCodeApi.getAllAccessCodes();
      setAccessCodes(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching access codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch access codes');
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
      setSelectedRows(accessCodes.map((code) => code.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleExport = () => {
    const rowsToExport = accessCodes.filter((code) => selectedRows.includes(code.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Lot Code,Access Code,Permits/Month,Duration,Created At,Status',
        ...rowsToExport.map(
          ({ lot_number_id, access_code, permits_per_month, duration, created_at, is_active }) =>
            `${lot_number_id},${access_code},${permits_per_month},${duration},${created_at},${is_active ? 'Active' : 'Inactive'}`
        ),
      ].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'access_codes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      await Promise.all(selectedRows.map((id) => accessCodeApi.deleteAccessCode(id)));
      await fetchAccessCodes();
      setSelectedRows([]);
      setModalOpen(false);
    } catch (err) {
      console.error('Error deleting access codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete access codes');
    }
  };

  const filteredAccessCodes = useMemo(() => {
    return accessCodes.filter(
      (code) =>
        code.access_code.toLowerCase().includes(inputValue.toLowerCase()) ||
        code.lot?.lot_code?.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [accessCodes, inputValue]);

  const currentRows = useMemo(() => {
    if (rowsPerPage === 'ALL') {
      return filteredAccessCodes;
    }
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return filteredAccessCodes.slice(indexOfFirstRow, indexOfLastRow);
  }, [currentPage, filteredAccessCodes, rowsPerPage]);

  const totalPages = rowsPerPage === 'ALL' ? 1 : Math.ceil(filteredAccessCodes.length / rowsPerPage);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb pageName="Unique Access" />

      {/* Search Input */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between max-sm:flex-col">
          <div className="flex gap-[7px] items-end">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search access codes..."
              aria-label="Text input"
            />  
            {inputValue && (
              <button onClick={() => setInputValue('')} className="ml-2">
                Clear
              </button>
            )}
            <Link to="/uniqueaccess/adduniqueaccess">
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
            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <div className="flex space-x-2 mb-4">
                <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  Copy ({selectedRows.length})
                </button>
                <button onClick={handleExport} className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
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
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="border-t border-b border-stroke py-4.5 px-4 dark:border-strokedark">
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === accessCodes.length}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Lot Code
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Access Code
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Permits/Mo
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Duration
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Start Date
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((code) => (
                <tr key={code.id}
                    className="border-t border-b border-stroke dark:border-strokedark">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(code.id)}
                      onChange={() => handleRowSelect(code.id)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">{code.lot?.lot_code}</td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">{code.access_code}</td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">{code.permits_per_month}</td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">{code.duration}</td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">{new Date(code.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        code.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    <button>
                      <SquarePen />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* No Data Message */}
        {currentRows.length === 0 && (
          <div className="text-center text-gray-500">No access codes available</div>
        )}
        {/* Pagination */}
        <div className="flex justify-between items-center py-3 px-6 max-sm:flex-col max-sm:gap-[10px]">
          <div className="flex items-center space-x-2">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                const value = e.target.value;
                setRowsPerPage(value === 'ALL' ? 'ALL' : parseInt(value, 10));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value="ALL">ALL</option>
            </select>
          </div>
          <div>
            {/* <span className="mr-2">Showing {currentRows.length} of {filteredAccessCodes.length} access codes</span> */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              Previous
            </button>
            {/* <span className="mx-2">
              Page {currentPage} of {totalPages}
            </span> */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>




      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Confirm Delete"
        className="bg-white border max-w-md mx-auto mt-24 p-4 rounded shadow"
      >
        <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete these access codes?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Uniqueaccess;