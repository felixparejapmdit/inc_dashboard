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
import { HamburgerIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";

const GlobalMenuButton = ({
  onEdit,
  onDelete,
  onShowQr,
  onGenerateQr,
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
          <MenuItem
            icon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit Shelf
          </MenuItem>

          <MenuItem
            icon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete Shelf
          </MenuItem>

          <MenuDivider my={2} />

          <MenuItem
            icon={<ViewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              if (generatedCode) {
                onShowQr();
              } else {
                onGenerateQr();
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
