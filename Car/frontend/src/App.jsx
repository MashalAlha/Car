import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LoadingManager from './components/ui/LoadingManager';
import { CartProvider } from './contexts/CartContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './pages/auth/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

// Eagerly loaded public/auth pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

// Lazy-loaded heavy pages (Public)
const CarCatalog = lazy(() => import('./pages/cars/CarCatalog'));
const CarDetails = lazy(() => import('./pages/cars/CarDetails'));
const BookService = lazy(() => import('./pages/workshop/BookService'));
const ServiceTracker = lazy(() => import('./pages/workshop/ServiceTracker'));
const StoreFront = lazy(() => import('./pages/store/StoreFront'));
const PartDetails = lazy(() => import('./pages/store/PartDetails'));
const CartPage = lazy(() => import('./pages/store/CartPage'));
const FavoritesList = lazy(() => import('./pages/user/FavoritesList'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));
const TrustRequests = lazy(() => import('./pages/user/TrustRequests'));
const MyRentals = lazy(() => import('./pages/user/MyRentals'));
const MyPurchases = lazy(() => import('./pages/user/MyPurchases'));
const PurchaseDetails = lazy(() => import('./pages/user/PurchaseDetails'));
const MyOrders = lazy(() => import('./pages/user/MyOrders'));
const MyAppointments = lazy(() => import('./pages/user/MyAppointments'));
const FinancialHistory = lazy(() => import('./pages/user/FinancialHistory'));
const MyMessages = lazy(() => import('./pages/user/MyMessages'));

// Lazy-loaded Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const WorkshopDashboard = lazy(() => import('./pages/admin/WorkshopDashboard'));
const InventoryApp = lazy(() => import('./pages/admin/InventoryApp'));
const AddVehicle = lazy(() => import('./pages/admin/AddVehicle'));
const EditVehicle = lazy(() => import('./pages/admin/EditVehicle'));
const RentalRequests = lazy(() => import('./pages/admin/RentalRequests'));
const TrustManagement = lazy(() => import('./pages/admin/TrustManagement'));
const ClientRelations = lazy(() => import('./pages/admin/ClientRelations'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const VehicleTracker = lazy(() => import('./pages/admin/VehicleTracker'));
const PurchaseManagement = lazy(() => import('./pages/admin/PurchaseManagement'));
const ManageStore = lazy(() => import('./pages/admin/ManageStore'));
const ContractFinalizer = lazy(() => import('./pages/admin/ContractFinalizer'));
const ProductOrders = lazy(() => import('./pages/admin/ProductOrders'));
const StoreInstallations = lazy(() => import('./pages/admin/StoreInstallations'));
const EditUser = lazy(() => import('./pages/admin/EditUser'));
const AddUser = lazy(() => import('./pages/admin/AddUser'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Error Pages
const NotFound = lazy(() => import('./pages/error/NotFound'));
const Unauthorized = lazy(() => import('./pages/error/Unauthorized'));

function App() {
  return (
    <CartProvider>
    <Router>
      <LoadingManager>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>

            {/* ADMIN ROUTES (Protected Layout) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="workshop" element={<AdminProtectedRoute allowedRoles={['Admin', 'WorkshopManager']}><WorkshopDashboard /></AdminProtectedRoute>} />
              <Route path="inventory" element={<AdminProtectedRoute><InventoryApp /></AdminProtectedRoute>} />
              <Route path="inventory/add" element={<AdminProtectedRoute><AddVehicle /></AdminProtectedRoute>} />
              <Route path="inventory/edit/:id" element={<AdminProtectedRoute><EditVehicle /></AdminProtectedRoute>} />
              <Route path="trust" element={<AdminProtectedRoute><TrustManagement /></AdminProtectedRoute>} />
              <Route path="rentals" element={<AdminProtectedRoute><RentalRequests /></AdminProtectedRoute>} />
              <Route path="rentals/track/:id" element={<AdminProtectedRoute><VehicleTracker /></AdminProtectedRoute>} />
              <Route path="purchases" element={<AdminProtectedRoute><PurchaseManagement /></AdminProtectedRoute>} />
              <Route path="purchases/contract/:id" element={<AdminProtectedRoute><ContractFinalizer /></AdminProtectedRoute>} />
              <Route path="store" element={<AdminProtectedRoute><ManageStore /></AdminProtectedRoute>} />
              <Route path="product-orders" element={<AdminProtectedRoute><ProductOrders /></AdminProtectedRoute>} />
              <Route path="installations" element={<AdminProtectedRoute allowedRoles={['Admin', 'WorkshopManager']}><StoreInstallations /></AdminProtectedRoute>} />
              <Route path="users" element={<AdminProtectedRoute><ClientRelations /></AdminProtectedRoute>} />
              <Route path="users/add" element={<AdminProtectedRoute><AddUser /></AdminProtectedRoute>} />
              <Route path="users/edit/:id" element={<AdminProtectedRoute><EditUser /></AdminProtectedRoute>} />
              <Route path="messages" element={<AdminProtectedRoute><AdminMessages /></AdminProtectedRoute>} />
              <Route path="profile" element={<AdminProtectedRoute allowedRoles={['Admin', 'WorkshopManager']}><AdminProfile /></AdminProtectedRoute>} />
              <Route path="settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
            </Route>

            {/* PUBLIC ROUTES (Navbar + Footer Layout) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              
              <Route path="/catalog" element={<CarCatalog />} />
              <Route path="/cars/:id" element={<CarDetails />} />
              
              <Route path="/store" element={<StoreFront />} />
              <Route path="/store/part/:id" element={<PartDetails />} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              
              <Route path="/workshop/book" element={<ProtectedRoute><BookService /></ProtectedRoute>} />
              <Route path="/workshop/track" element={<ServiceTracker />} />
              
              <Route path="/favorites" element={<ProtectedRoute><FavoritesList /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/trust-requests" element={<ProtectedRoute><TrustRequests /></ProtectedRoute>} />
              <Route path="/my-rentals" element={<ProtectedRoute><MyRentals /></ProtectedRoute>} />
              <Route path="/my-purchases" element={<ProtectedRoute><MyPurchases /></ProtectedRoute>} />
              <Route path="/my-purchases/:id" element={<ProtectedRoute><PurchaseDetails /></ProtectedRoute>} />
              <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/profile/finances" element={<ProtectedRoute><FinancialHistory /></ProtectedRoute>} />
              <Route path="/profile/messages" element={<ProtectedRoute><MyMessages /></ProtectedRoute>} />
            </Route>

            {/* AUTHENTICATION ROUTES (Standalone Background Layout) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* DEDICATED ADMIN LOGIN */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />

            {/* Global Fallback */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </LoadingManager>
    </Router>
    </CartProvider>
  );
}

export default App;
