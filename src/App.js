import { ChakraProvider } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile"; // Import Profile Page
import Layout from "./components/Layout"; // Import Layout to wrap around pages
import Applications from "./pages/Applications"; // Import AddApps Page
import Users from "./pages/Users"; // Import User Page
import AddSuguan from "./pages/Suguan"; // Import AddSuguan Page
import AddEvents from "./pages/Events"; // Import AddEvents Page
import AddReminders from "./pages/Reminders"; // Import ldap-users Page
import Mastodon from "./pages/Mastodon"; // Import Mastodon Page
import customTheme from "./theme"; // Optional if you're using a custom theme
import LdapUser from "./pages/LdapUser"; // Import LdapUser page
import Enrollment from "./pages/EnrollmentForm"; // Import LdapUser page
import DepartmentManagement from "./pages/managements/DepartmentManagement.js"; // Import the new DepartmentManagement page
import SectionManagement from "./pages/managements/SectionManagement.js";
import SubsectionManagement from "./pages/managements/SubsectionManagement.js";
import DistrictManagement from "./pages/managements/DistrictManagement.js";
import CitizenshipManagement from "./pages/managements/CitizenshipManagement.js";
import NationalityManagement from "./pages/managements/NationalityManagement.js";
import LanguagesManagement from "./pages/managements/LanguagesManagement.js";
import DesignationManagement from "./pages/managements/DesignationManagement .js";

import Step1 from "./pages/Step1";
import Step2 from "./pages/Step2";
import Step3 from "./pages/Step3";
import Step4 from "./pages/Step4";
import Step5 from "./pages/Step5";
import Step6 from "./pages/Step6";
import Step7 from "./pages/Step7";
import Step8 from "./pages/Step8";
// import Step9 from "./pages/Step9";
// import Step10 from "./pages/Step10";

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <Router>
        <Routes>
          <Route path="/step1" element={<Step1 />} />
          <Route path="/step2" element={<Step2 />} />
          <Route path="/step3" element={<Step3 />} />
          <Route path="/step4" element={<Step4 />} />
          <Route path="/step5" element={<Step5 />} />
          <Route path="/step6" element={<Step6 />} />
          <Route path="/step7" element={<Step7 />} />
          <Route path="/step8" element={<Step8 />} />
          {/* <Route path="/step9" element={<Step9 />} />
          <Route path="/step10" element={<Step10 />} /> */}
          
          {/* Redirect the root URL to /login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Standalone Route for Enrollment Page */}
          <Route path="/enroll" element={<Enrollment />} />

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
            path="/application"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <Applications />
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
                <Applications />
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

          {/* New Route for Department Management */}
          <Route
            path="/managements/departments"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <DepartmentManagement />
              </Layout>
            }
          />
          <Route
            path="/managements/sections"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <SectionManagement />
              </Layout>
            }
          />
          <Route
            path="/managements/subsections"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <SubsectionManagement />
              </Layout>
            }
          />
          <Route
            path="/managements/designations"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <DesignationManagement />
              </Layout>
            }
          />
          <Route
            path="/managements/districts"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <DistrictManagement />
              </Layout>
            }
          />
          <Route
            path="/managements/citizenships"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <CitizenshipManagement />
              </Layout>
            }
          />
          <Route
            path="/managements/nationalities"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <NationalityManagement />
              </Layout>
            }
          />
          <Route
            path="/managements/languages"
            element={
              <Layout
                currentUser={{
                  name: "John Doe",
                  avatarUrl: "/path/to/avatar.jpg",
                }}
              >
                <LanguagesManagement />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
