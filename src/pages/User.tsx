import React, { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import '../css/style.css';
import { SquarePen } from 'lucide-react';
import { userApi, User as UserType } from '../../services/api';

Modal.setAppElement('#root');

const User: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'ALL'>(25);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState(5);


  useEffect(() => {
    fetchUsers();
  }, [currentPage, rowsPerPage, perPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await userApi.getAllUsers({
        per_page: perPage,
        current_page: currentPage,
      });
  
      const { data, total, current_page, last_page } = response.data; // ✅ response.data contains data
  
      setUsers(data); // ✅ Ensure users is an array
      setTotalUsers(total);
      setCurrentPage(current_page);
      setLastPage(last_page);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
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
      setSelectedRows(users.map((user) => user.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleCopy = () => {
    const rowsToCopy = users
      .filter((user) => selectedRows.includes(user.id))
      .map(({ username, role, note }) => `${username}\t${role}\t${note || ''}`)
      .join('\n');

    navigator.clipboard.writeText(rowsToCopy);
    alert('Rows copied to clipboard!');
  };

  const handleExport = () => {
    const rowsToExport = users.filter((user) => selectedRows.includes(user.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Username,Role,Note,Properties']
        .concat(
          rowsToExport.map(
            ({ username, role, note, properties }) =>
              `${username},${role},${note || ''},${properties.join(';')}`,
          ),
        )
        .join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'users.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      await userApi.bulkDeleteUsers(selectedRows);
      await fetchUsers();
      setSelectedRows([]);
      setModalOpen(false);
    } catch (err) {
      console.error('Error deleting users:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete users');
    }
  };
    const filteredUsers= useMemo(() => {
      if (!Array.isArray(users)) return [];
  
      return users.filter(
        (user) =>
          user.username
            ?.toLowerCase()
            .includes(inputValue.toLowerCase()) ||
          user.note?.toLowerCase().includes(inputValue.toLowerCase()) ||
          user.role?.toLowerCase().includes(inputValue.toLowerCase()),
      );
    }, [users, inputValue]);

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
      <Breadcrumb pageName="Users and Access Management" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="py-6 px-4 md:px-6 xl:px-7.5  h-[100px] flex justify-between max-sm:flex-col">
          <div className="flex gap-[7px] items-end">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search..."
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
            <Link to="/users/addusers">
              <button className="text-lg flex border p-2 rounded justify-end font-semibold hover:text-white hover:bg-black text-black dark:text-white transition-all hover:scale-125 hover:text-lg cursor-pointer">
                <svg
                  height={20}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  style={{ fill: 'currentColor' }}
                  aria-label="Add user"
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
                    checked={selectedRows.length === users.length}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Users
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Password
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Role
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Note
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Assigned
                </th>
                <th className="px-4 py-2 text-left font-medium text-sm text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-b border-stroke dark:border-strokedark"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(user.id)}
                      onChange={() => handleRowSelect(user.id)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {user.username}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    ********
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {user.role}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {user.note}
                  </td>
                  <td className="px-4 py-2 text-sm text-black dark:text-white">
                    {user.properties.join(', ')}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/user/edituser/${user.id}`}
                        aria-label="Edit user"
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
        {filteredUsers.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            No Users available
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
          {/* <div>
            <button
              className="mr-2 px-3 py-1 border rounded-md cursor-pointer"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border rounded-md cursor-pointer"
              disabled={currentPage === Math.ceil(totalRecords / (rowsPerPage === 'ALL' ? totalRecords : rowsPerPage))}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div> */}
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
        contentLabel="Delete User Confirmation"
        className="bg-white border max-w-md mx-auto mt-24 p-4 rounded shadow"
      >
        <h2 className="text-lg font-bold">Confirm Delete</h2>
        <p>Are you sure you want to delete these users?</p>
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

export default User;
