import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Unlock from './pages/Unlock';
import Developer from './pages/Developer';
import BioBuilder from './pages/BioBuilder';
import BioPage from './pages/BioPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unlock/:shortCode" element={<Unlock />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics/:id" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developer" 
              element={
                <ProtectedRoute>
                  <Developer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bio-builder" 
              element={
                <ProtectedRoute>
                  <BioBuilder />
                </ProtectedRoute>
              } 
            />
            <Route path="/bio/:username" element={<BioPage />} />
            <Route path="*" element={<div className="text-center py-20 text-3xl font-bold text-white">404 - Page Not Found</div>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
