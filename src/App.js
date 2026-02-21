import { ChakraProvider } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  matchPath,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile"; // Import Profile Page
import Layout from "./components/Layout"; // Import Layout to wrap around pages
import Applications from "./pages/Applications"; // Import AddApps Page
import Users from "./pages/Users"; // Import User Page
import TemporarilyDeletedUsers from "./pages/TemporarilyDeletedUsers"; // Import User Page
import ProgressTracking from "./pages/progress/ProgressTracking"; // Import User Page

import PersonnelPreview from "./pages/PersonnelPreview";
import PersonnelHistory from "./pages/PersonnelHistory";

import ProgressStep1 from "./pages/progress/Step1";
import ProgressStep2 from "./pages/progress/Step2";
import ProgressStep3 from "./pages/progress/Step3";
import ProgressStep4 from "./pages/progress/Step4";
import ProgressStep5 from "./pages/progress/Step5";
import ProgressStep6 from "./pages/progress/Step6";
import ProgressStep7 from "./pages/progress/Step7";
import ProgressStep8 from "./pages/progress/Step8";
import UsersProgress from "./pages/progress/UsersProgress";

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
import PhoneLocationManagement from "./pages/managements/PhoneLocationManagement.js";
import ApplicationTypeManagement from "./pages/managements/ApplicationTypeManagement.js";
import HousingManagement from "./pages/managements/HousingManagement.js";

import FileManagement from "./pages/managements/FileManagement.js";

import PhoneDirectory from "./pages/managements/PhoneDirectory.js";

import LoginAudits from "./pages/managements/LoginAudits.js";
import AttendanceTracker from "./pages/managements/AttendanceTracker.js";

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

import { PermissionProvider } from "./contexts/PermissionContext";

import OllamaAPI from "./pages/AI/OllamaAPI";

import Chatbot from "./components/Chatbot";
import Notifications from "./components/Notifications";
import ReminderNotifier from "./components/ReminderNotifier";
import SuguanNotifier from "./components/SuguanNotifier";

import "./App.css"; // ✅ Import your global CSS

import DragDropSettings from "./pages/settings/DragDropSettings";
import SchemaSync from "./pages/settings/SchemaSync"; // Import SchemaSync Page

import Maintenance from "./pages/Maintenance";
import PersonnelStatistics from "./components/PersonnelStatistics";

import InventoryDashboard from "./pages/InventoryDashboard.js";
import ATGDashboard from "./pages/ATG Dashboard.js";

// Plugins
import LokalProfile from "./pages/LokalProfile.js";

import ShelvesPage from "./pages/FileOrganizer/ShelvesPage.js";
import ContainersPage from "./pages/FileOrganizer/ContainersPage.js";
import FoldersPage from "./pages/FileOrganizer/FoldersPage.js";
import DocumentsPage from "./pages/FileOrganizer/DocumentsPage.js";
import GlobalSearchPage from "./pages/FileOrganizer/GlobalSearchPage.js";
import GlobalTreePage from "./components/FileOrganizer/GlobalTreePage.js"; // New import for the tree view
import GlobalSearchBar from "./components/FileOrganizer/GlobalSearchBar.js";
import GenerateQRCode from "./pages/FileOrganizer/GenerateQRCode.js";
import ScanningQrCode from "./pages/FileOrganizer/ScanningQrCode.js";

import ErrorBoundary from './components/ErrorBoundary'; // Import the new component

// --- Main Router Component ---
function App() {
  return (
    <PermissionProvider>
      <ChakraProvider theme={customTheme}>
        <Router>
          {/* CRITICAL FIX: Wrap the whole router in ErrorBoundary */}
          <ErrorBoundary>
            <MainApp />
          </ErrorBoundary>
        </Router>
      </ChakraProvider>
    </PermissionProvider>
  );
}

function MainApp() {
  const location = useLocation(); // Get current route
  const isUnderMaintenance = false; // Change to `true` to enable maintenance mode

  const showSearchBar = [
    "/shelvespage",
    "/file-organizer/shelves",
    "/containers/:shelfId",
    "/file-organizer/shelves/:shelfId/containers",
    "/containers/:containerId/folders",
    "/shelves/:shelfId/containers/:containerId/folders/:folderId/documents",
    "/file-organizer/qrcode",
    "/file-organizer/scancode",
    "/file-organizer/tree", // New path for tree view
  ].some((pattern) =>
    matchPath({ path: pattern, end: false }, location.pathname)
  );

  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    // Check if the page is loaded over https or http
    const isHTTPS = window.location.protocol === "https:";

    // Dynamically update API URL based on protocol
    const apiUrl = isHTTPS
      ? process.env.REACT_APP_API_URL.replace("http://", "https://")
      : process.env.REACT_APP_API_URL;

    setApiUrl(apiUrl);
    //console.log("API URL: ", apiUrl);
  }, []);

  const defaultUser = {
    name: "John Doe",
    avatarUrl: "/path/to/avatar.jpg",
  };

  return (
    <>
      {showSearchBar && <GlobalSearchBar />}
      <Routes>
        {isUnderMaintenance ? (
          <Route path="*" element={<Maintenance />} />
        ) : (
          <>
            <Route path="/maintenance" element={<Maintenance />} />
          </>
        )}

        <Route path="/step1" element={<Step1 />} />
        <Route path="/step2" element={<Step2 />} />
        <Route path="/step3" element={<Step3 />} />
        <Route path="/step4" element={<Step4 />} />
        <Route path="/step5" element={<Step5 />} />
        <Route path="/step6" element={<Step6 />} />
        <Route path="/step7" element={<Step7 />} />

        {/* Redirect the root URL to /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/enroll" element={<Enrollment />} />
        <Route path="/enrollment/:referenceNumber" element={<Enrollment />} />
        <Route path="/login" element={<Login />} />

        {/* Standalone Route for Personnel Preview */}
        <Route
          path="/personnel-preview/:personnelId"
          element={<PersonnelPreview />}
        />

        {/* File Organizer Standalone Routes */}
        <Route path="/shelvespage" element={<ShelvesPage />} />
        <Route path="/file-organizer/shelves" element={<ShelvesPage />} />
        <Route path="/containers/:shelfId" element={<ContainersPage />} />
        <Route
          path="/file-organizer/shelves/:shelfId/containers"
          element={<ContainersPage />}
        />
        <Route
          path="/containers/:containerId/folders"
          element={<FoldersPage />}
        />
        <Route
          path="/shelves/:shelfId/containers/:containerId/folders/:folderId/documents"
          element={<DocumentsPage />}
        />
        <Route path="/file-organizer/search" element={<GlobalSearchPage />} />
        <Route path="/file-organizer/qrcode" element={<GenerateQRCode />} />
        <Route path="/file-organizer/scancode" element={<ScanningQrCode />} />
        <Route path="/file-organizer/tree" element={<GlobalTreePage />} />

        <Route path="/ollama-api" element={<OllamaAPI />} />

        {/* --- ROUTES PROTECTED BY LAYOUT (SIDEBAR) --- */}
        <Route element={<Layout currentUser={defaultUser} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/personnel-statistics" element={<PersonnelStatistics />} />
          <Route path="/inv-dashboard" element={<InventoryDashboard />} />
          <Route path="/atg-dashboard" element={<ATGDashboard />} />
          <Route path="/application" element={<Applications />} />
          <Route path="/user" element={<Users />} />
          <Route path="/tempdeleted-users" element={<TemporarilyDeletedUsers />} />
          <Route path="/personnel-history" element={<PersonnelHistory />} />
          <Route path="/progresstracking" element={<ProgressTracking />} />
          <Route path="/progress/step1" element={<ProgressStep1 />} />
          <Route path="/progress/step2" element={<ProgressStep2 />} />
          <Route path="/progress/step3" element={<ProgressStep3 />} />
          <Route path="/progress/step4" element={<ProgressStep4 />} />
          <Route path="/progress/step5" element={<ProgressStep5 />} />
          <Route path="/progress/step6" element={<ProgressStep6 />} />
          <Route path="/progress/step7" element={<ProgressStep7 />} />
          <Route path="/progress/step8" element={<ProgressStep8 />} />
          <Route path="/progress/users-progress" element={<UsersProgress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-apps" element={<Applications />} />
          <Route path="/add-suguan" element={<Suguan />} />
          <Route path="/add-events" element={<Events />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/lokalprofile" element={<LokalProfile />} />
          <Route path="/Mastodon" element={<Mastodon />} />
          <Route path="/ldap-users/" element={<LdapUser />} />

          {/* Managements */}
          <Route path="/managements/departments" element={<DepartmentManagement />} />
          <Route path="/managements/sections" element={<SectionManagement />} />
          <Route path="/managements/subsections" element={<SubsectionManagement />} />
          <Route path="/managements/designations" element={<DesignationManagement />} />
          <Route path="/managements/districts" element={<DistrictManagement />} />
          <Route path="/managements/citizenships" element={<CitizenshipManagement />} />
          <Route path="/managements/nationalities" element={<NationalityManagement />} />
          <Route path="/managements/languages" element={<LanguagesManagement />} />
          <Route path="/managements/contact_infos" element={<ContactTypeInfoManagement />} />
          <Route path="/managements/government_issued_ids" element={<GovernmentIssuedIDManagement />} />
          <Route path="/managements/locations" element={<LocationManagement />} />
          <Route path="/managements/phonelocations" element={<PhoneLocationManagement />} />
          <Route path="/managements/applicationtype" element={<ApplicationTypeManagement />} />
          <Route path="/managements/housingmanagement" element={<HousingManagement />} />
          <Route path="/managements/filemanagement" element={<FileManagement />} />
          <Route path="/managements/phonedirectory" element={<PhoneDirectory />} />
          <Route path="/managements/loginaudits" element={<LoginAudits />} />
          <Route path="/managements/attendancetracker" element={<AttendanceTracker />} />
          <Route path="/managements/groupmanagement" element={<GroupManagement />} />
          <Route path="/managements/permissionmanagement" element={<PermissionManagement />} />
          <Route path="/managements/categorymanagement" element={<PermissionCategoriesManagement />} />

          {/* Settings */}
          <Route path="/settings/drag-drop" element={<DragDropSettings />} />
          <Route path="/settings/schema-sync" element={<SchemaSync />} />
        </Route>
      </Routes>

      {/* Render Chatbot/Notifiers only if NOT on /login AND NOT on enrollment pages */}
      <div className="noPrint">
        {/* Dashboard page: Show all notifiers */}
        {location.pathname === "/dashboard" && (
          <>
            <Notifications />
            <ReminderNotifier />
            <SuguanNotifier />
          </>
        )}

        {/* Reminders page: Only show the Reminder notifier */}
        {location.pathname === "/reminders" && <ReminderNotifier />}

        {/* Suguan page: Only show the Suguan notifier */}
        {location.pathname === "/add-suguan" && <SuguanNotifier />}
      </div>
    </>
  );
}
export default App;