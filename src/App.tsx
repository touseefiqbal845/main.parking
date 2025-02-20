import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import ECommerce from './pages/Dashboard/ECommerce';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DefaultLayout from './layout/DefaultLayout';
import AddLot from './pages/AddLot';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Lotaccess from './pages/Lotaccess';
import Vehicle from './pages/Vehicle';
import AddVehicle from './pages/AddVehicle';
import EditLot from './pages/EditLot';
import EditVehicle from './pages/EditVehicle';
import Uniqueaccess from './pages/Uniqueaccess';
import Adduniqueaccess from './pages/Adduniqueaccess';
import Edituniqueaccess from './pages/Edituniqueaccess';
import User from './pages/User';
import Adduser from './pages/Adduser';
import Edituser from './pages/Edituser';

// Custom Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const authToken = localStorage.getItem('authToken');
  return authToken ? children : <Navigate to="/" replace />;
};

// Custom Public Route for Login/Signup
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const authToken = localStorage.getItem('authToken');
  return authToken ? <Navigate to="/vehicles" replace /> : children;
};

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

    return loading ? (
      <Loader />
    ) : (
      <Routes>
        {/* Public Routes - Redirects authenticated users to /vehicles */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <>
                <PageTitle title="Login | React" />
                <Login />
              </>
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicRoute>
              <>
                <PageTitle title="SignUp | React" />
                <SignUp />
              </>
            </PublicRoute>
          }
        />

      {/* Protected Routes - Redirects unauthenticated users to / (Signup) */}
      <Route
        path="/index"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="React Dashboard | React" />
              <ECommerce />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Profile | React" />
              <Profile />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/forms/form-layout"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Form Layout | React" />
              <FormLayout />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Settings | React" />
              <Settings />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lotaccess"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Lot Access | React" />
              <Lotaccess />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lot/addlot"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Add Lot | React" />
              <AddLot />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lot/editlot/:id"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Edit Lot | React" />
              <EditLot />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Vehicles | React" />
              <Vehicle />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/addvehicles"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Add Vehicle | React" />
              <AddVehicle />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicle/editvehicle/:id"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Edit Vehicle | React" />
              <EditVehicle />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/uniqueaccess"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Unique Access | React" />
              <Uniqueaccess />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/uniqueaccess/adduniqueaccess"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Add Unique Access | React" />
              <Adduniqueaccess />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/uniqueaccess/edituniqueaccess/:id"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Edit Unique Access | React" />
              <Edituniqueaccess />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Users | React" />
              <User />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/addusers"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Add Users | React" />
              <Adduser />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/edituser/:id"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <PageTitle title="Edit Users | React" />
              <Edituser />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
