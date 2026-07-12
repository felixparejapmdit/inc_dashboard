import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
  RadioGroup,
  Radio,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { postData } from "../utils/fetchData";
import { useUserFormData } from "../hooks/userFormOptions";

const TransferReassignModal = ({ isOpen, onClose, personnel, onSuccess }) => {
  const { departments, sections, subsections, designations, districts, localCongregations } = useUserFormData();
  const toast = useToast();

  const [caseType, setCaseType] = useState("transfer");
  const [departmentId, setDepartmentId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subsectionId, setSubsectionId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [districtAssignmentId, setDistrictAssignmentId] = useState("");
  const [localCongregationAssignment, setLocalCongregationAssignment] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCaseType("transfer");
      setDepartmentId("");
      setSectionId("");
      setSubsectionId("");
      setDesignationId("");
      setDistrictAssignmentId("");
      setLocalCongregationAssignment("");
      setReason("");
    }
  }, [isOpen, personnel]);

  const handleSubmit = async () => {
    if (!personnel) return;
    setIsSubmitting(true);

    const payload = { case_type: caseType, reason };
    if (caseType === "transfer") {
      if (districtAssignmentId) payload.district_assignment_id = districtAssignmentId;
      if (localCongregationAssignment) payload.local_congregation_assignment = localCongregationAssignment;
    } else {
      if (departmentId) payload.department_id = departmentId;
      if (sectionId) payload.section_id = sectionId;
      if (subsectionId) payload.subsection_id = subsectionId;
      if (designationId) payload.designation_id = designationId;
    }

    try {
      await postData(`personnels/${personnel.personnel_id}/transfer`, payload);
      toast({
        title: caseType === "transfer" ? "Transfer Applied" : "Reassignment Applied",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: "Failed to Apply Change",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transfer / Reassign {personnel ? `— ${personnel.fullname}` : ""}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm">Change Type</FormLabel>
              <RadioGroup value={caseType} onChange={setCaseType}>
                <HStack spacing={6}>
                  <Radio value="transfer">Transfer (district / location)</Radio>
                  <Radio value="reassignment">Reassignment (department / section)</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            {caseType === "transfer" ? (
              <>
                <FormControl>
                  <FormLabel fontSize="sm">New District Assignment</FormLabel>
                  <Select placeholder="Select district" value={districtAssignmentId} onChange={(e) => setDistrictAssignmentId(e.target.value)}>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">New Local Congregation Assignment</FormLabel>
                  <Select placeholder="Select local congregation" value={localCongregationAssignment} onChange={(e) => setLocalCongregationAssignment(e.target.value)}>
                    {localCongregations.map((lc) => (
                      <option key={lc.id} value={lc.name || lc.local_congregation}>{lc.name || lc.local_congregation}</option>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : (
              <>
                <FormControl>
                  <FormLabel fontSize="sm">New Department</FormLabel>
                  <Select placeholder="Select department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">New Section</FormLabel>
                  <Select placeholder="Select section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">New Subsection</FormLabel>
                  <Select placeholder="Select subsection" value={subsectionId} onChange={(e) => setSubsectionId(e.target.value)}>
                    {subsections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">New Designation</FormLabel>
                  <Select placeholder="Select designation" value={designationId} onChange={(e) => setDesignationId(e.target.value)}>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <FormControl>
              <FormLabel fontSize="sm">Reason</FormLabel>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for this change" />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="teal" onClick={handleSubmit} isLoading={isSubmitting}>
            Save &amp; Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransferReassignModal;
