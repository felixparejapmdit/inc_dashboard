export const filterPersonnelData = (data, options = {}) => {
    const sectionId = localStorage.getItem("section_id");
    const subsectionId = localStorage.getItem("subsection_id");
    const designationName = localStorage.getItem("designation_name");
    const currentPersonnelId = localStorage.getItem("user_id"); // personnel_id
    const currentUserId = localStorage.getItem("userId"); // users.id
    const currentUsername = localStorage.getItem("username");
    const groupName = localStorage.getItem("groupName");

    // Helper to check for effectively null or empty values
    const isInvalid = (val) => {
        if (val === null || val === undefined) return true;
        const s = String(val).toLowerCase().trim();
        return s === "" || s === "null" || s === "undefined" || s === "0";
    };

    // 1. Admin/VIP Exception (Full Access)
    if (groupName === "Admin" || groupName === "VIP") {
        return data;
    }

    // 2. Strict Guard for Un-enrolled Users (LDAP or New Account)
    // If you have no personnel_id, you are NOT enrolled.
    // blocked from seeing ANY personnel data to prevent leakage.
    if (isInvalid(currentPersonnelId)) {
        return data.filter(item => {
            // Strictly specific to the logged-in user only

            // A. Username Match (Primary)
            if (!isInvalid(currentUsername) && !isInvalid(item.username)) {
                return String(item.username).toLowerCase() === String(currentUsername).toLowerCase();
            }

            // B. User ID Match (Fallback for self, but NEVER match invalid/missing IDs)
            if (!isInvalid(currentUserId)) {
                const itemId = item.id || item.ID || item.user_id;
                if (!isInvalid(itemId) && String(itemId) === String(currentUserId)) {
                    // Safety: If matching by numeric User ID, verify it's NOT a personnel record
                    // (Prevent User #10 matching Personnel #10 or Felix Pareja)
                    if (!isInvalid(item.personnel_id)) return false;
                    return true;
                }
            }

            return false;
        });
    }

    // 3. Section Chief (Section Filter Only)
    // "If you are a Section Chief, you should see everyone who shares the same section_id."
    if (designationName === "Section Chief") {
        if (isInvalid(sectionId)) return [];
        return data.filter(item => {
            const itemSectionId = item.section_id || item.personnel_section_id;
            return !isInvalid(itemSectionId) && String(itemSectionId) === String(sectionId);
        });
    }

    // 4. Team Leader (Subsection Filter)
    // "If the designation_name is Team Leader, you should only see personnel with the same subsection_id as yours."
    if (designationName === "Team Leader") {
        if (isInvalid(subsectionId)) return [];
        return data.filter(item => {
            const itemSubsectionId = item.subsection_id || item.personnel_subsection_id;
            const itemSectionId = item.section_id || item.personnel_section_id;

            const subsectionMatch = !isInvalid(itemSubsectionId) && String(itemSubsectionId) === String(subsectionId);
            const sectionMatch = isInvalid(sectionId) ? true : (!isInvalid(itemSectionId) && String(itemSectionId) === String(sectionId));

            return subsectionMatch && sectionMatch;
        });
    }

    // 5. Staff / Enrolled Standard User (Self Only)
    // "If you are Staff, you should only be able to see your own personnel_id and section_id."
    return data.filter(item => {
        // Match Personnel ID
        if (!isInvalid(currentPersonnelId)) {
            if (String(item.personnel_id) === String(currentPersonnelId)) return true;
            // Support for components using 'id' as personnel_id (careful)
            if (String(item.id) === String(currentPersonnelId)) return true;
            // Support for created items (Reminders/Suguan)
            if (String(item.created_by) === String(currentPersonnelId)) return true;
        }
        return false;
    });
};
