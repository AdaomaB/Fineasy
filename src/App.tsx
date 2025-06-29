import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TrialBalance from './pages/TrialBalance';
import IncomeStatement from './pages/IncomeStatement';
import BalanceSheet from './pages/BalanceSheet';
import CashFlow from './pages/CashFlow';
import DocumentUpload from './pages/DocumentUpload';
import InvoiceCreator from './pages/InvoiceCreator';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/trial-balance" element={
                <ProtectedRoute>
                  <TrialBalance />
                </ProtectedRoute>
              } />
              <Route path="/income-statement" element={
                <ProtectedRoute>
                  <IncomeStatement />
                </ProtectedRoute>
              } />
              <Route path="/balance-sheet" element={
                <ProtectedRoute>
                  <BalanceSheet />
                </ProtectedRoute>
              } />
              <Route path="/cash-flow" element={
                <ProtectedRoute>
                  <CashFlow />
                </ProtectedRoute>
              } />
              <Route path="/documents" element={
                <ProtectedRoute>
                  <DocumentUpload />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <InvoiceCreator />
                </ProtectedRoute>
              } />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;