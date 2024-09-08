import { ChakraProvider } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Admin from "./components/Admin";
import Profile from "./components/Profile"; // Import Profile Page
import Layout from "./components/Layout"; // Import Layout to wrap around pages
import customTheme from "./theme"; // Optional if you're using a custom theme

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <Router>
        <Routes>
          {/* Redirect the root URL to /login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Define the login route */}
          <Route path="/login" element={<Login />} />

          {/* Routes wrapped with the sidebar layout */}
          <Route
            path="/dashboard"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/admin"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <Admin />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <Profile />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
