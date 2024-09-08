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
import AddApps from "./components/Admin"; // Import AddApps Page
import AddSuguan from "./components/Suguan"; // Import AddSuguan Page
import AddEvents from "./components/Events"; // Import AddEvents Page
import AddReminders from "./components/Reminders"; // Import AddReminders Page
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

          {/* New Routes for Add Apps, Add Suguan, Add Events, Add Reminders */}
          <Route
            path="/add-apps"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <AddApps />
              </Layout>
            }
          />

          {/* New Routes for Add Apps, Add Suguan, Add Events, Add Reminders */}
          <Route
            path="/add-suguan"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <AddSuguan />
              </Layout>
            }
          />

          {/* New Routes for Add Apps, Add Suguan, Add Events, Add Reminders */}
          <Route
            path="/add-events"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <AddEvents />
              </Layout>
            }
          />

          {/* New Routes for Add Apps, Add Suguan, Add Events, Add Reminders */}
          <Route
            path="/add-reminders"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <AddReminders />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
