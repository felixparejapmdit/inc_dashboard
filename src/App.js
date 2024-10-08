import { ChakraProvider } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
//import Login from "./pages/Login";
import Login from "./pages/LdapLogin";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile"; // Import Profile Page
import Layout from "./components/Layout"; // Import Layout to wrap around pages
import AddApps from "./pages/Admin"; // Import AddApps Page
import Users from "./pages/Users"; // Import User Page
import AddSuguan from "./pages/Suguan"; // Import AddSuguan Page
import AddEvents from "./pages/Events"; // Import AddEvents Page
import AddReminders from "./pages/Reminders"; // Import AddReminders Page
import Mastodon from "./pages/Mastodon"; // Import Mastodon Page
import customTheme from "./theme"; // Optional if you're using a custom theme
import LdapUser from "./pages/LdapUser"; // Import LdapUser page

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
            path="/user"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <Users />
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

          <Route
            path="/Mastodon"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <Mastodon />
              </Layout>
            }
          />

          {/* New Route for LdapUser */}
          <Route
            path="/ldap-users/"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <LdapUser />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
