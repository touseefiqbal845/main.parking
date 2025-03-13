import axios from 'axios';

// const BASE_URL = 'http://127.0.0.1:8000/api';

const BASE_URL = 'https://api.m6parking.ca/public/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add this interface to represent the login response
export interface LoginResponse {
  token: string; // The authentication token returned by the backend
}

// Add this to your api.ts file
export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post<LoginResponse>('/login', data),

  logout: () => api.get('/logout'),
};
export interface Lot {
  id: number;
  lot_code: string;
  address: string;
  city: string;
  permits_per_month: number;
  duration: string;
  status: 'Free' | 'FreePaid';
  note: string | null;
  pricing: any | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: number;
  lot_number_id: number;
  license_plate: string;
  permit_id: string;
  status: 'Tenant' | 'Employee' | 'Visitor' | 'Do Not Tag' | 'Other';
  start_date: string;
  end_date: string;
  duration_type: '1 Day' | '7 Days' | '1 Month' | '1 Year' | '5 Years';
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  lot?: any; // For joined data
}

export const lotApi = {
  getAllLots: (params: { page: number; per_page: number }) =>
    api.get<Lot[]>('/lots', { params }), // Pass params to API call
  getLot: (id: number) => api.get<Lot>(`/lots/${id}`),
  createLot: (data: {
    lot_code: string;
    address: string;
    city: string;
    permits_per_month: number;
    duration: string;
    status: 'Free' | 'FreePaid';
    note?: string;
    pricing?: any;
  }) => api.post<Lot>('/lots', data),
  updateLot: (id: number, data: Partial<Lot>) =>
    api.put<Lot>(`/lots/${id}`, data),
  deleteLot: (id: number) => api.delete(`/lots/${id}`),
  exportLots: (ids: number[]) =>
    api.post('/lots/export', { ids }, { responseType: 'blob' })
};

export const vehicleApi = {
  getAllVehicles: (params: { page: number; per_page: number }) =>
    api.get<{
      data: Vehicle[];
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    }>('/vehicles', { params }),

  getVehicle: (id: number) => api.get<Vehicle>(`/vehicles/${id}`),

  bulkCreateVehicles: (data: {
    lot_number_id: number;
    status: Vehicle['status'];
    start_date: string;
    end_date: string;
    duration_type: Vehicle['duration_type'];
    entries: Array<{
      license_plate: string;
      permit_id: string;
    }>;
  }) => api.post<Vehicle[]>('/vehicles/bulk', data),

  updateVehicle: (id: number, data: Partial<Vehicle>) =>
    api.put<Vehicle>(`/vehicles/${id}`, data),

  deleteVehicle: (id: number) => api.delete(`/vehicles/${id}`),
};


// Add this interface to your api.ts file
export interface AccessCode {
  id: number;
  lot_number_id: number;
  access_code: string;
  permits_per_month: number;
  duration: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lot?: Lot; // For joined data
}

// Add this to your api.ts file
export const accessCodeApi = {
  getAllAccessCodes: (params?: { per_page?: number; current_page?: number }) =>
    api.get<{
      data: AccessCode[];
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    }>('/access-codes', { params }),
  getAccessCode: (id: number) => api.get<AccessCode>(`/access-codes/${id}`),

  bulkCreateAccessCodes: (data: {
    lot_number_id: number;
    permits_per_month: number;
    duration: string;
    entries: string[];
  }) => api.post<AccessCode[]>('/access-codes/bulk', data),

  updateAccessCode: (id: number, data: Partial<AccessCode>) =>
    api.put<AccessCode>(`/access-codes/${id}`, data),

  deleteAccessCode: (id: number) => api.delete(`/access-codes/${id}`),

  toggleActive: (ids: number[]) =>
    api.put('/access-codes/toggle-active', { ids })
};

export interface User {
  id: number;
  username: string;
  role: 'Admin' | 'Property Manager';
  note: string | null;
  properties: string[];
  created_at: string;
  updated_at: string;
}

export const userApi = {
  getAllUsers: (params?: {
    search?: string;
    per_page?: number | 'all';
    current_page?: number;
  }) => api.get<{
    data: User[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  }>('/users', { params }),


  createUser: (data: {
    username: string;
    password: string;
    role: User['role'];
    note?: string;
    properties: string[];
  }) => api.post<User>('/users', data),

  updateUser: (id: number, data: Partial<Omit<User, 'id'>>) =>
    api.put<User>(`/users/${id}`, data),

  deleteUser: (id: number) => api.delete(`/users/${id}`),

  bulkDeleteUsers: (ids: number[]) =>
    api.delete('/users', { data: { ids } })
};

export interface RegistrationFormData {
  lot_code: string;
  license_plate: string;
  email?: string;
  duration: string;
  start_date: string;
  end_date: string;
}

export interface VehicleHistory {
  lot_code: string;
  access_code: string;
  license_plate: string;
  permit_start: string;
  permit_end: string;
}

export const registrationApi = {
  registerPermit: (data: RegistrationFormData) =>
    api.post<{ success: boolean; message: string }>('/registerPermit', data),

  getVehicleHistory: (data: { lot_code: string; license_plate: string }) =>
    api.post<{ data: VehicleHistory[] }>('/vehicleHistory', data),

  activateVehicle: (data: { 
    vehicle_management_id: number; 
    start_date: string; 
    start_time: string; 
    duration_hours: number;
  }) =>
    api.post<{ success: boolean; message: string }>('/vehicle/activate', data),

  sendActivationEmail: (data: { vehicle_id: number; email: string }) =>
    api.post<{ success: boolean; message: string }>('/vehicle/activate/email', data),
};


export default api;