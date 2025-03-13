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
  const [totalAccessCodes, setTotalAccessCodes] = useState<number>(0); // Declare total state
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState(5);

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const fetchAccessCodes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await accessCodeApi.getAllAccessCodes({
        per_page: perPage,
        current_page: currentPage,
      });

      const { data, total, current_page, last_page } = response.data;

      setAccessCodes(data);
      setTotalAccessCodes(total);
      setCurrentPage(current_page);
      setLastPage(last_page);
    } catch (error) {
      console.error('Error fetching access codes:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch access codes',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelect = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(accessCodes.map((code) => code.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleCopy = () => {
    const rowsToCopy = accessCodes
      .filter((access) => selectedRows.includes(access.id))
      .map(
        ({
          lot_number: { lot_code, address, city },
          access_code,
          permits_per_month,
        }) => `${lot_code}\t${address}\t${city}`,
      )
      .join('\n');

    navigator.clipboard.writeText(rowsToCopy);
    alert('Rows copied to clipboard!');
  };

  const handleExport = () => {
    const rowsToExport = accessCodes.filter((code) =>
      selectedRows.includes(code.id),
    );
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Lot Code,Access Code,Permits/Month,Duration,Created At,Status',
        ...rowsToExport.map(
          ({
            lot_number_id,
            access_code,
            permits_per_month,
            duration,
            created_at,
            is_active,
          }) =>
            `${lot_number_id},${access_code},${permits_per_month},${duration},${created_at},${
              is_active ? 'Active' : 'Inactive'
            }`,
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
      await Promise.all(
        selectedRows.map((id) => accessCodeApi.deleteAccessCode(id)),
      );
      await fetchAccessCodes();
      setSelectedRows([]);
      setModalOpen(false);
    } catch (err) {
      console.error('Error deleting access codes:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to delete access codes',
      );
    }
  };

  const filteredAccessCodes = useMemo(() => {
    return accessCodes.filter(
      (code) =>
        code.access_code.toLowerCase().includes(inputValue.toLowerCase()) ||
        code.lot?.lot_code?.toLowerCase().includes(inputValue.toLowerCase()),
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

  const totalPages =
    rowsPerPage === 'ALL'
      ? 1
      : Math.ceil(filteredAccessCodes.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < lastPage) {
      setCurrentPage((prevPage) => prevPage + 1); // Go to the next page
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => Math.max(1, prevPage - 1)); // Prevent going below page 1
    }
  };

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
        <div className="py-6 px-4 md:px-6 xl:px-7.5 flex  h-[100px] justify-between max-sm:flex-col">
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
                <button className="bg-[#28a745] border border-[#28a745] text-black py-2 px-3 rounded-md hover:bg-[#218838] h-full text-sm font-semibold">
                  No of selected rows: {selectedRows.length}
                </button>

                <button
                  onClick={handleCopy}
                  className="bg-[#0dcaf0] border border-[#0dcaf0] text-black py-2 px-3 rounded-md hover:bg-[#31d2f2] h-full text-sm font-semibold"
                >
                  Copy ({selectedRows.length})
                </button>
                <button
                  onClick={handleExport}
                  className="bg-[#6c757d] text-white border border-[#6c757d] py-2 px-3 rounded-md hover:bg-[#5c636a] h-full text-sm font-semibold"
                >
                  Export ({selectedRows.length})
                </button>

                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-[#dc3545] text-white py-2 px-3 rounded-md hover:bg-[#bb2d3b] h-full text-sm font-semibold"
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
              {filteredAccessCodes.map((code) => (
                <tr
                  key={code.id}
                  className="border-t border-b border-stroke dark:border-strokedark"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(code.id)}
                      onChange={() => handleRowSelect(code.id)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {code.lot_number?.lot_code}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {code.access_code}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {code.permits_per_month}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {code.duration}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        code.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {code.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    <div className="flex gap-2">
                      <Link
                        to={`/uniqueaccess/edituniqueaccess/${code.id}`}
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
        {/* No Data Message */}
        {filteredAccessCodes.length === 0 && (
          <div className="text-center text-gray-500">
            No access codes available
          </div>
        )}
        {/* Pagination */}
        <div className="flex justify-between items-center py-3 px-6 max-sm:flex-col max-sm:gap-[10px]">
          <div className="flex items-center space-x-2">
            <select
              id="rowsPerPage"
              className="border rounded ps-2 pe-3 py-1 text-md"
              value={rowsPerPage}
              onChange={(e) => {
                const value = e.target.value;
                const updatedValue =
                  value === 'ALL' ? 'ALL' : parseInt(value, 10);

                setRowsPerPage(updatedValue);
                setPerPage(updatedValue); // Update perPage dynamically
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value="ALL">ALL</option>
            </select>

            <label htmlFor="rowsPerPage" className="text-sm text-gray-600">
              Showing {currentPage} of {lastPage}
            </label>
          </div>
          <div className="pagination">
            <button
              className="mr-2 px-3 py-1 border rounded-md cursor-pointer"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span></span>
            <button
              className="px-3 py-1 border rounded-md cursor-pointer"
              onClick={handleNextPage}
              disabled={currentPage === lastPage}
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
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Uniqueaccess;
