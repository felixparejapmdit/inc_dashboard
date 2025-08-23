// src/components/FileOrganizer/GlobalMenuButton.js
import React from "react";
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
}) => {
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
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
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
