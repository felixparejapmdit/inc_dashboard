import { ChakraProvider } from "@chakra-ui/react";
import React, { useEffect } from "react";
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
import ProgressTracking from "./pages/progress/ProgressTracking"; // Import User Page

import PersonnelPreview from "./pages/PersonnelPreview";

import ProgressStep1 from "./pages/progress/Step1";
import ProgressStep2 from "./pages/progress/Step2";
import ProgressStep3 from "./pages/progress/Step3";
import ProgressStep4 from "./pages/progress/Step4";
import ProgressStep5 from "./pages/progress/Step5";
import ProgressStep6 from "./pages/progress/Step6";
import ProgressStep7 from "./pages/progress/Step7";
import ProgressStep8 from "./pages/progress/Step8";

import Suguan from "./pages/Suguan"; // Import Suguan Page
import Events from "./pages/Events"; // Import Events Page
import Reminders from "./pages/Reminders"; // Import ldap-users Page
import Mastodon from "./pages/Mastodon"; // Import Mastodon Page
import customTheme from "./theme"; // Optional if you're using a custom theme
import LdapUser from "./pages/LdapUser"; // Import LdapUser page
import DepartmentManagement from "./pages/managements/DepartmentManagement.js"; // Import the new DepartmentManagement page
import SectionManagement from "./pages/managements/SectionManagement.js";
import SubsectionManagement from "./pages/managements/SubsectionManagement.js";
import DistrictManagement from "./pages/managements/DistrictManagement.js";
import CitizenshipManagement from "./pages/managements/CitizenshipManagement.js";
import NationalityManagement from "./pages/managements/NationalityManagement.js";
import DesignationManagement from "./pages/managements/DesignationManagement .js";
import LanguagesManagement from "./pages/managements/LanguagesManagement.js";
import ContactTypeInfoManagement from "./pages/managements/ContactTypeInfoManagement.js";
import GovernmentIssuedIDManagement from "./pages/managements/GovernmentIssuedIDManagement.js";
import LocationManagement from "./pages/managements/LocationManagement.js";

import Enrollment from "./pages/Enrollment/EnrollmentForm.js"; // Import LdapUser page
import Step1 from "./pages/Enrollment/Step1.js";
import Step2 from "./pages/Enrollment/Step2.js";
import Step3 from "./pages/Enrollment/Step3.js";
import Step4 from "./pages/Enrollment/Step4.js";
import Step5 from "./pages/Enrollment/Step5.js";
import Step6 from "./pages/Enrollment/Step6.js";
import Step7 from "./pages/Enrollment/Step7.js";

import GroupManagement from "./pages/managements/GroupManagement.js";
import PermissionManagement from "./pages/managements/PermissionManagement.js";
import PermissionCategoriesManagement from "./pages/managements/PermissionCategoriesManagement.js";

//import { PermissionProvider } from "./contexts/PermissionContext";
import { PermissionProvider } from "./contexts/PermissionContext";

function App() {
  return (
    <PermissionProvider>
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

            {/* Redirect the root URL to /login */}
            <Route path="/" element={<Navigate to="/login" />} />
            {/* Standalone Route for Enrollment Page */}
            <Route path="/enroll" element={<Enrollment />} />

            <Route
              path="/enrollment/:referenceNumber"
              element={<Enrollment />}
            />

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
              path="/personnel-preview/:personnelId"
              element={<PersonnelPreview />}
            />

            <Route
              path="/progresstracking"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressTracking />
                </Layout>
              }
            />

            <Route
              path="/progress/step1"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressStep1 />
                </Layout>
              }
            />

            {/* <Route path="/progress/step1" element={<ProgressStep1 />} /> */}
            <Route
              path="/progress/step2"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressStep2 />
                </Layout>
              }
            />
            <Route
              path="/progress/step3"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressStep3 />
                </Layout>
              }
            />
            <Route
              path="/progress/step4"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressStep4 />
                </Layout>
              }
            />

            <Route
              path="/progress/step5"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressStep5 />
                </Layout>
              }
            />
            <Route
              path="/progress/step6"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressStep6 />
                </Layout>
              }
            />
            <Route
              path="/progress/step7"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressStep7 />
                </Layout>
              }
            />
            <Route
              path="/progress/step8"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ProgressStep8 />
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
                  <Suguan />
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
                  <Events />
                </Layout>
              }
            />
            <Route
              path="/reminders"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <Reminders />
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
            <Route
              path="/managements/contact_infos"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <ContactTypeInfoManagement />
                </Layout>
              }
            />
            <Route
              path="/managements/government_issued_ids"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <GovernmentIssuedIDManagement />
                </Layout>
              }
            />

            <Route
              path="/managements/locations"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <LocationManagement />
                </Layout>
              }
            />

            <Route
              path="/managements/groupmanagement"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <GroupManagement />
                </Layout>
              }
            />

            <Route
              path="/managements/permissionmanagement"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <PermissionManagement />
                </Layout>
              }
            />

            <Route
              path="/managements/categorymanagement"
              element={
                <Layout
                  currentUser={{
                    name: "John Doe",
                    avatarUrl: "/path/to/avatar.jpg",
                  }}
                >
                  <PermissionCategoriesManagement />
                </Layout>
              }
            />
          </Routes>
        </Router>
      </ChakraProvider>
    </PermissionProvider>
  );
}

export default App;
