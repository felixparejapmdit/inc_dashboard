import React from "react";
import { Box, Checkbox } from "@chakra-ui/react";
import Select from "react-select";

// A checkbox-per-row, searchable, multi-select dropdown. Selected values are
// summarized in the control ("N selected") instead of rendering one chip per
// item, which gets unwieldy once more than a handful of options are picked.
const CheckboxOption = (props) => {
  const { isSelected, isFocused, innerRef, innerProps, children } = props;
  return (
    <Box
      ref={innerRef}
      {...innerProps}
      display="flex"
      alignItems="center"
      gap={2}
      px={3}
      py={2}
      cursor="pointer"
      bg={isFocused ? "gray.100" : "white"}
    >
      <Checkbox isChecked={isSelected} pointerEvents="none" colorScheme="blue" />
      <Box flex="1" minW={0}>
        {children}
      </Box>
    </Box>
  );
};

const NoValueContainer = () => null;

const SearchableCheckboxMultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Search…",
  isLoading = false,
  formatOptionLabel,
  noOptionsMessage = "No options found",
  summaryNoun = "selected",
  selectedCount = null,
}) => {
  const normalizedValue = new Set((Array.isArray(value) ? value : []).map((entry) => String(entry)));
  const selectedOptions = options.filter((option) => normalizedValue.has(String(option.value)));
  const countForSummary = selectedCount ?? selectedOptions.length;
  const displayPlaceholder = selectedOptions.length > 0
    ? `${countForSummary} ${summaryNoun}`
    : placeholder;

  return (
    <Select
      isMulti
      isSearchable
      isLoading={isLoading}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      controlShouldRenderValue={false}
      backspaceRemovesValue={false}
      options={options}
      value={selectedOptions}
      onChange={(selected) => onChange((selected || []).map((option) => option.value))}
      placeholder={displayPlaceholder}
      formatOptionLabel={formatOptionLabel}
      noOptionsMessage={() => noOptionsMessage}
      components={{ Option: CheckboxOption, MultiValue: NoValueContainer }}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base) => ({
          ...base,
          borderRadius: "0.75rem",
          minHeight: "40px",
        }),
      }}
    />
  );
};

export default SearchableCheckboxMultiSelect;
