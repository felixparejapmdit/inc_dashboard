// components/FileOrganizer/QRPrintToolbar.js

import React from "react";
import { Flex, Select, Input, Button, Spacer } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

const QRPrintToolbar = ({ category, setCategory, search, setSearch, onDownloadPDF }) => {
  return (
    <Flex gap={4} align="center" flexWrap="wrap">
      <Select value={category} onChange={(e) => setCategory(e.target.value)} width="200px">
        <option value="Shelves">Shelves</option>
        <option value="Containers">Containers</option>
        <option value="Folders">Folders</option>
        <option value="Documents">Documents</option>
      </Select>

      <Input
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        width="300px"
      />

      <Spacer />
    </Flex>
  );
};

export default QRPrintToolbar;
