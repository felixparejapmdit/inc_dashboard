// src/components/FileOrganizer/GlobalMenuButton.js

import React from "react";
// 💡 Add imports for routing hooks
import { useNavigate, useLocation } from "react-router-dom"; 
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Portal,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import { FaPaintBrush } from "react-icons/fa";

const GlobalMenuButton = ({
  itemType = "shelf", // default
  onView,
  onEdit,
  onDelete,
  onShowQr,
  onGenerateQr,
  onColorChange,
  generatedCode,
  // 💡 NOTE: We don't strictly need 'item' here if onEdit is passed as a function 
  // that already has the item bound (e.g., onEdit={() => onUpdate(container)})
}) => {
  // 💡 Initialize routing hooks
  const navigate = useNavigate();
  const location = useLocation(); 

  // Function to handle the edit action
  const handleEdit = (e) => {
    e.stopPropagation();
    
    // ✅ FIX: Check if the current URL contains the tree view path
    if (location.pathname.includes("/file-organizer/tree")) {
      // If in Tree View, simply call the onEdit prop. 
      // This prop is expected to open a modal in the parent GlobalTreePage.
      if (onEdit) {
        onEdit();
      }
    } else {
      // Standard behavior: navigate to the edit page 
      // NOTE: This assumes your edit routes follow a pattern like: /shelves/:id/edit
      const editRoute = `/${itemType}s/edit`; 
      
      // Since the card's onEdit is probably what navigates here, we can just call it
      // if onEdit is meant for navigation outside the tree, or use navigate directly:
      // Since onEdit prop is provided, we prioritize using the prop logic:
      if (onEdit) {
        onEdit(); // Assuming onEdit handles external navigation or logic outside the tree
      }
    }
  };

  return (
    <Menu isLazy placement="bottom-start">
      <MenuButton
        as={IconButton}
        size="sm"
        icon={<HamburgerIcon />}
        variant="ghost"
        aria-label="Options"
        onClick={(e) => e.stopPropagation()}
      />
      <Portal>
        <MenuList
          zIndex={3000}
          py={1}
          px={0}
          minW="170px"
          boxShadow="lg"
          borderRadius="md"
        >
          {/* View File Option (for documents only) */}
          {itemType === "document" && onView && (
            <MenuItem
              icon={<ViewIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              View File
            </MenuItem>
          )}

          {/* Edit Option */}
          <MenuItem
            icon={<EditIcon />}
            // ✅ Use the new centralized handler
            onClick={handleEdit} 
          >
            {`Edit ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
          </MenuItem>
          
          {/* Change Color Option */}
          {onColorChange && (
            <MenuItem
              icon={<FaPaintBrush />}
              onClick={(e) => {
                e.stopPropagation();
                onColorChange();
              }}
            >
              Change Color
            </MenuItem>
          )}

          <MenuDivider my={2} />

          {/* Delete Option */}
          <MenuItem
            icon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            {`Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
          </MenuItem>

          {/* QR Code Option */}
          <MenuDivider my={2} />
          <MenuItem
            icon={<ViewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              if (generatedCode) {
                onShowQr?.();
              } else {
                onGenerateQr?.();
              }
            }}
          >
            {generatedCode ? "Show QR Code" : "Generate QR Code"}
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default GlobalMenuButton;