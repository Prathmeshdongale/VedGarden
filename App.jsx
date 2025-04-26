import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './component/Home/Home';
import Login from './component/Auth/Login';
import Register from './component/Auth/Register';
import PlantPage from './component/Plant/PlantPage';
import DiseasePage from './component/disease/DiseasePage';
import SymptomChecker from './component/SymptomChecker/SymptomChecker';
import Shopping from './component/Shopping/Shopping';
import Form from './component/form/form';
import Profile from './component/profile/profile';
import Navbar from './component/Navbar/Navbar';
import { Container, Box } from '@mui/material';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Create a Layout component that includes the Navbar and outlet for child routes
function Layout() {
  return (
    <>
      <Navbar />
      <Box sx={{ mt: 2 }}>
        <Container>
          <Outlet />
        </Container>
      </Box>
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/register",
        element: <Register />
      },
      {
        path: "/form",
        element: <PrivateRoute><Form /></PrivateRoute>
      },
      {
        path: "/profile",
        element: <PrivateRoute><Profile /></PrivateRoute>
      },  
      {
        path: "/plants",
        element: (
          <PrivateRoute>
            <PlantPage />
          </PrivateRoute>
        )
      },
      {
        path: "/diseases",
        element: (
          <PrivateRoute>
            <DiseasePage />
          </PrivateRoute>
        )
      },
      {
        path: "/symptoms",
        element: (
          <PrivateRoute>
            <SymptomChecker />
          </PrivateRoute>
        )
      },
      {
        path: "/shop",
        element: (
          <PrivateRoute>
            <Shopping />
          </PrivateRoute>
        )
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  // Modified to use just the RouterProvider
  return <RouterProvider router={router} />;
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}