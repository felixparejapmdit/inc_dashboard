
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import your Sidebar component
import axios from "axios";
import { usePermissionContext } from "../contexts/PermissionContext"; // Import Permission Context
import {
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";
import { getAuthHeaders } from "../utils/apiHeaders"; // adjust path as needed
import { fetchData, fetchLoginData } from "../utils/fetchData";
const Layout = ({ children, currentUser }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { fetchPermissions } = usePermissionContext();
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const INACTIVITY_LIMIT = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  //const INACTIVITY_LIMIT = 1 * 60 * 1000; // 1 minute in milliseconds

  const inactivityTimerRef = useRef();

  // Reset the inactivity timer and define logout behavior
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(async () => {
      onOpen(); // Show alert modal first

      try {
        const userId = localStorage.getItem("username"); // Make sure this is set on login

        if (userId) {
          await axios.put(
            `/api/users/update-login-status`,
            {
              ID: userId,
              isLoggedIn: false,
            }
          );
          console.log("User status set to logged out due to inactivity.");
        }
      } catch (error) {
        console.error(
          "Error updating login status on inactivity:",
          error.response?.data || error.message
        );
      }

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    }, INACTIVITY_LIMIT);
  }, [navigate, onOpen]);

  useEffect(() => {
    const groupId = localStorage.getItem("groupId");

    const username = localStorage.getItem("username"); // adjust if stored differently

    fetchPermissions(groupId); // Fetch permissions for the group


    const checkLoginStatus = async () => {
      try {
        if (!username) {
          navigate("/login");
          return;
        }

        // Use relative path to leverage the proxy and avoid hardcoded URLs
        const userResponse = await axios.get(
          `/api/users_access/${username}`,
          {
            headers: getAuthHeaders(),
            timeout: 5000,
          }
        );

        const user = userResponse.data;

        // Only redirect if we have a definitive answer that the user is NOT logged in
        if (user && (user.isLoggedIn === false || user.isLoggedIn === 0)) {
          console.warn("User session invalid on server. Redirecting to login.");
          navigate("/login");
        }
      } catch (error) {
        // Do NOT redirect to login on network errors (timeouts, 500s, etc.)
        // The global 401 interceptor in fetchData.js will handle session expiration.
        // Redirecting on every error causes "auto-logout" when the server is slow.
        console.error("🔍 Background login check encountered an issue (not necessarily logged out):", {
          message: error.message,
          code: error.code
        });

        // Only if it's a definitive 401/403 should we maybe consider it a logout
        // but it's better handled by the global interceptor.
      }
    };

    checkLoginStatus(); // Call the check on mount
  }, [fetchPermissions, navigate]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    const handleActivity = () => resetInactivityTimer();

    // Set listeners for user activity
    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Initialize the inactivity timer
    resetInactivityTimer();

    // Cleanup on component unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [resetInactivityTimer]);

  return (
    <div style={{ display: "flex", position: "relative", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        onSidebarToggle={setIsSidebarExpanded}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1, // Take remaining space
          width: "100%",
          padding: "20px",
        }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { isSidebarExpanded });
          }
          return child;
        })}
      </div>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            borderRadius="xl"
            p={6}
            bgGradient="linear(to-r, orange.400, yellow.300)"
            color="white"
            boxShadow="xl"
          >
            <AlertDialogHeader
              fontSize="xl"
              fontWeight="bold"
              textAlign="center"
              userSelect="none"
            >
              Session Expired
            </AlertDialogHeader>

            <AlertDialogBody textAlign="center" fontSize="md">
              Your session has expired due to inactivity.
              <br />
              Redirecting to login...
            </AlertDialogBody>

            <AlertDialogFooter justifyContent="center" mt={4}>
              <Button
                ref={cancelRef}
                onClick={onClose}
                colorScheme="whiteAlpha"
                variant="outline"
                borderColor="whiteAlpha.700"
                _hover={{ bg: "whiteAlpha.300" }}
              >
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

export default Layout;
