import React, { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import '../css/style.css';
import { SquarePen } from 'lucide-react';
import { lotApi, Lot } from '../../services/api';

Modal.setAppElement('#root');

const Lotaccess: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'ALL'>(5);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [lotToDelete, setLotToDelete] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
 const [total, setTotal] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState(5);


  useEffect(() => {
    console.log('Page or Rows per Page changed:', currentPage, rowsPerPage);
    fetchLots();
  }, [currentPage, rowsPerPage]);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const response = await lotApi.getAllLots({
        page: currentPage,
        per_page: rowsPerPage === 'ALL' ? total : perPage,
      });
      const { data, total, current_page, last_page } = response.data;

      setLots(data);
      setTotal(total);
      setCurrentPage(current_page);
      setLastPage(last_page);
    } catch (err) {
      setError('Error fetching lots');
      console.error('Error fetching lots:', err);
    } finally {
      setLoading(false);
    }
  };
  console.log('lots', lots);


  const handleRowSelect = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(lots.map((lot) => lot.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleCopy = () => {
    const rowsToCopy = lots
      .filter((lot) => selectedRows.includes(lot.id))
      .map(
        ({ lot_code, address, city, created_at }) => {
          const formattedDate = new Date(created_at)
            .toISOString()
            .replace('T', ' ') // Replace the 'T' with a space to match your format
            .substring(0, 19); // Extract the first 19 characters (YYYY-MM-DD HH:MM:SS)
            
          return `${lot_code}\t${address}\t${city}\t${formattedDate}`;
        }
      )
      .join('\n');
  
    navigator.clipboard.writeText(rowsToCopy);
    alert('Rows copied to clipboard!');
  };
  

  const handleExport = async () => {
    try {
      const response = await lotApi.exportLots(selectedRows);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lots.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting lots:', err);
      setError(err instanceof Error ? err.message : 'Failed to export lots');
    }
  };

  const handleDelete = async () => {
    try {
      await Promise.all(selectedRows.map((id) => lotApi.deleteLot(id)));
      await fetchLots();
      setSelectedRows([]);
      setModalOpen(false);
    } catch (err) {
      console.error('Error deleting lots:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete lots');
    }
  };

  const filteredLots = useMemo(() => {
    if (!Array.isArray(lots)) return [];

    return lots.filter(
      (lot) =>
        lot.lot_code?.toLowerCase().includes(inputValue.toLowerCase()) ||
        lot.address?.toLowerCase().includes(inputValue.toLowerCase()) ||
        lot.city?.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [lots, inputValue]);

 
  const currentRows = useMemo(() => {
    if (rowsPerPage === 'ALL') {
      return filteredLots;
    }

    const rowsPerPageNumber = parseInt(rowsPerPage as string, 10);
    if (isNaN(rowsPerPageNumber) || rowsPerPageNumber <= 0) {
      return []; // Return an empty array if rowsPerPage is invalid
    }

    const indexOfLastRow = currentPage * rowsPerPageNumber;
    const indexOfFirstRow = indexOfLastRow - rowsPerPageNumber;

    return filteredLots.slice(indexOfFirstRow, indexOfLastRow);
  }, [currentPage, filteredLots, rowsPerPage]);

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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page); // Direct page change
    }
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value); // Update rows per page
  };

  useEffect(() => {
    console.log('Filtered Vehicles:', filteredLots);
  }, [filteredLots]);

  const totalPages =
    rowsPerPage === 'ALL' ? 1 : Math.ceil(filteredLots.length / rowsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
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
      <Breadcrumb pageName="Lots" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="py-6 px-4 md:px-6 xl:px-7.5 flex h-[100px] justify-between max-sm:flex-col">
          <div className="flex gap-[7px] items-end">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search Lots..."
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
            <Link to="/lot/addlot">
              <button className="text-lg flex border p-2 rounded justify-end font-semibold hover:text-white hover:bg-black text-black dark:text-white transition-all hover:scale-125 hover:text-lg cursor-pointer">
                <svg
                  height={20}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  style={{ fill: 'currentColor' }}
                  aria-label="Add Lots"
                >
                  <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
                </svg>
              </button>
            </Link>
          </div>
          <div>
            {selectedRows.length > 0 && (
              <div className="flex space-x-2 mt-4">
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
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="border-t border-b border-stroke py-4.5 px-4 dark:border-strokedark">
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === lots.length}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Lot Code
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Address
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  City
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Permits/Mo
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Duration
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Note
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLots.map((lot) => (
                <tr
                  key={lot.id}
                  className="border-t border-b border-stroke dark:border-strokedark"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(lot.id)}
                      onChange={() => handleRowSelect(lot.id)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {lot.lot_code}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {lot.address}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {lot.city}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {lot.permits_per_month}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {lot.duration}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    <div
                      className={`lot-status-badge text-center px-2 py-1 text-xs font-semibold rounded-sm uppercase ${lot.status === 'Free'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {lot.status}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {lot.note}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Link to={`/lot/editlot/${lot.id}`} aria-label="Edit Lot">
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
        {filteredLots.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            No Lots available
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
        const updatedValue = value === "ALL" ? "ALL" : parseInt(value, 10);
        
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
            
            onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
            </span>
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
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Delete Lot Confirmation"
        className="bg-white border max-w-md mx-auto mt-24 p-4 rounded shadow"
      >
        <h2 className="text-lg font-bold">Confirm Delete</h2>
        <p>Are you sure you want to delete these lots?</p>
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

export default Lotaccess;
