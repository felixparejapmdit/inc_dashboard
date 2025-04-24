import React from "react";
import { FaBriefcase, FaUserTie, FaUserCheck } from "react-icons/fa"; // Icons used in image layout
const PersonnelInfo = ({
  personnel,
  familyMembers,
  lookupData,
  personnelImage,
  personnelAddress,
}) => {
  if (!personnel) return <div>No personnel data found.</div>;

  const {
    surname_husband,
    givenname,
    middlename,
    suffix,
    nickname,
    age,
    bloodtype,
    assigned_number,
    panunumpa_date,
    ordination_date,
    personnel_type,
    m_status,
    gender,
    date_of_birth,
    place_of_birth,
    civil_status,
    datejoined,
  } = personnel;

  const getNamesByIds = (idsInput, array, nameField = "name") => {
    if (!idsInput || !Array.isArray(array)) return "N/A";

    // Ensure it's a string first
    const idsString =
      typeof idsInput === "string" ? idsInput : String(idsInput);

    const ids = idsString.split(",").map((id) => parseInt(id.trim(), 10));

    const names = ids
      .map((id) => {
        const match = array.find((entry) => entry.id === id);
        return match ? match[nameField] : null;
      })
      .filter(Boolean);

    return names.length ? names.join(", ") : "N/A";
  };

  const getAddressByType = (type) => {
    if (!Array.isArray(personnelAddress)) return null;
    return personnelAddress.find((addr) => addr.address_type === type) || null;
  };

  const home = getAddressByType("Home Address");
  const provincial = getAddressByType("Provincial Address");
  const housing = getAddressByType("INC Housing");

  // Format full name
  const fullName = [
    personnel.givenname,
    personnel.middlename,
    personnel.surname_husband,
    personnel.suffix !== "No Suffix" ? personnel.suffix : "",
  ]
    .filter(Boolean) // Exclude empty values
    .join(" ");

  // Filter family members by relationship type
  const parents = familyMembers.filter(
    (fm) =>
      fm.relationship_type === "Father" || fm.relationship_type === "Mother"
  );
  const siblings = familyMembers.filter(
    (fm) => fm.relationship_type === "Sibling"
  );
  const spouse = familyMembers.find((fm) => fm.relationship_type === "Spouse");

  const children = familyMembers.filter(
    (fm) => fm.relationship_type === "Child"
  );

  return (
    <div
      style={{
        width: "70%",
        background: "#fff",
        padding: "0.25rem",
        margin: "0 auto", // This centers the div horizontally
        textAlign: "center", // Optional: centers the text/content inside
      }}
    >
      <h2
        style={{
          backgroundColor: "#fff",
          color: "#333",
          padding: "10px 10px",
          margin: "0 0 0px 0",
          fontSize: "18px",
          fontWeight: "700",
          borderBottom: "4px solid #fdd835",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          lineHeight: "1.4",
        }}
      >
        PMD <br />
        PERSONNEL INFORMATION
      </h2>

      <h3
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "10px",
          textAlign: "center",
        }}
      >
        {fullName}
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          marginBottom: "20px",
          flexWrap: "nowrap", // Ensure it's a single row
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        <p
          style={{
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaBriefcase style={{ marginRight: "5px", color: "orange" }} />
          {getNamesByIds(personnel.section_id, lookupData.sections) || "N/A"}
        </p>
        <p
          style={{
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaUserTie style={{ marginRight: "5px", color: "orange" }} />
          {m_status}
        </p>
        <p
          style={{
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaUserCheck style={{ marginRight: "5px", color: "#cc7000" }} />
          {personnel_type}
        </p>
      </div>

      <h4
        style={{
          background: "#fdd835",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          fontWeight: "bold",
          letterSpacing: "1px",
          width: "fit-content",
          marginBottom: "0.75rem",
          marginTop: "2rem",
          borderBottom: "2px solid #fdd835",
        }}
      >
        PERSONAL INFORMATION
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "6px",
        }}
      >
        {[
          { label: "Surname", value: surname_husband },
          { label: "Given Name", value: givenname },
          { label: "Middle Name", value: middlename },
          {
            label: "Suffix",
            value:
              !suffix || suffix.trim().toLowerCase() === "no suffix"
                ? "-"
                : suffix,
          },
          { label: "Nickname", value: nickname },
          { label: "Gender", value: gender },
          { label: "Civil Status", value: civil_status },
          {
            label: "Citizenship",
            value: getNamesByIds(
              personnel.citizenship,
              lookupData.citizenships,
              "citizenship"
            ),
          },
          {
            label: "Ethnicity",
            value:
              getNamesByIds(
                personnel.nationality,
                lookupData.nationalities,
                "nationality"
              ) || "N/A",
          },
          { label: "Age", value: age },
          { label: "Date of Birth", value: date_of_birth },
          { label: "Place of Birth", value: place_of_birth },
          { label: "Blood Type", value: bloodtype },
          {
            label: "Language",
            value:
              getNamesByIds(personnel.language_id, lookupData.languages) ??
              "N/A",
          },
          { label: "Home Address", value: home?.name || "N/A", colSpan: 2 },
          {
            label: "Provincial Address",
            value: provincial?.name || "N/A",
            colSpan: 2,
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "0.20rem",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "0.95rem",
              gridColumn: item.colSpan ? `span ${item.colSpan}` : "auto",
            }}
          >
            {item.value || "N/A"}
            <div
              style={{
                fontWeight: "normal",
                fontSize: "0.75rem",
                color: "#555",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <h4
        style={{
          background: "#fdd835",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          fontWeight: "bold",
          letterSpacing: "1px",
          width: "fit-content",
          marginBottom: "0.75rem",
          marginTop: "2rem",
          borderBottom: "2px solid #fdd835",
        }}
      >
        CHURCH MEMBERSHIP
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "6px",
        }}
      >
        {[
          { label: "Personnel Type", value: personnel_type },
          { label: "Assigned Number", value: assigned_number },
          {
            label: "Oath-taking as Worker",
            value: panunumpa_date,
          },
          {
            label: "Date of Ordination",
            value: ordination_date,
          },
          {
            label: "Office Start Date",
            value: datejoined,
          },
          {
            label: "District Origin",
            value:
              getNamesByIds(personnel.district_id, lookupData.districts) ||
              "N/A",
          },
          {
            label: "Local Origin",
            value:
              getNamesByIds(
                personnel.local_congregation,
                lookupData.localCongregations
              ) || "N/A",
          },
          {
            label: "District Assignment",
            value:
              getNamesByIds(
                personnel.district_assignment_id,
                lookupData.districts
              ) || "N/A",
          },
          {
            label: "Local Assignment",
            value:
              getNamesByIds(
                personnel.local_congregation_assignment,
                lookupData.localCongregations
              ) || "N/A",
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "0.4rem 0.5rem",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "0.85rem",
              lineHeight: "1.2",
            }}
          >
            {item.value || "N/A"}
            <div
              style={{
                fontWeight: "normal",
                fontSize: "0.7rem",
                color: "#555",
                marginTop: "2px",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <h4
        style={{
          background: "#fdd835",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          fontWeight: "bold",
          letterSpacing: "1px",
          width: "fit-content",
          marginBottom: "0.75rem",
          marginTop: "2rem",
        }}
      >
        PARENT INFORMATION
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // two columns for Father and Mother
          gap: "6px",
        }}
      >
        {["Father", "Mother"].map((type) => {
          const parent = parents.find((p) => p.relationship_type === type);
          return (
            <div
              key={type}
              style={{
                display: "grid",
                gridTemplateRows: "auto auto auto",
                gap: "6px",
              }}
            >
              {[
                {
                  label: `${type}'s Name`,
                  value: parent
                    ? `${parent.givenname} ${parent.middlename || ""} ${
                        parent.lastname
                      } ${parent.suffix !== "No Suffix" ? parent.suffix : ""}`
                    : "N/A",
                },
                {
                  label: `${type}'s District`,
                  value: parent
                    ? getNamesByIds(parent.district_id, lookupData.districts)
                    : "N/A",
                },
                {
                  label: `${type}'s Date of Birth`,
                  value: parent?.date_of_birth
                    ? new Date(parent.date_of_birth).toLocaleDateString()
                    : "N/A",
                  isPair: true,
                  pairLabel: `${type}'s Contact No.`,
                  pairValue: parent?.contact_number || "N/A",
                },
                {
                  label: `${type}'s Civil Status`,
                  value: parent?.civil_status || "N/A",
                  isPair: true,
                  pairLabel: `${type}'s Citizenship`,
                  pairValue: parent?.citizenship
                    ? getNamesByIds(
                        parent.citizenship,
                        lookupData.citizenships,
                        "citizenship"
                      )
                    : "N/A",
                },
              ].map((item, index) => {
                if (item.isPair) {
                  return (
                    <div
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "6px",
                      }}
                    >
                      {[
                        { value: item.value, label: item.label },
                        { value: item.pairValue, label: item.pairLabel },
                      ].map((col, i) => (
                        <div
                          key={i}
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            padding: "0.4rem 0.5rem",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            lineHeight: "1.2",
                          }}
                        >
                          {col.value || "N/A"}
                          <div
                            style={{
                              fontWeight: "normal",
                              fontSize: "0.7rem",
                              color: "#555",
                              marginTop: "2px",
                            }}
                          >
                            {col.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      padding: "0.4rem 0.5rem",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      lineHeight: "1.2",
                    }}
                  >
                    {item.value || "N/A"}
                    <div
                      style={{
                        fontWeight: "normal",
                        fontSize: "0.7rem",
                        color: "#555",
                        marginTop: "2px",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <h4
        style={{
          background: "#fdd835",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          fontWeight: "bold",
          letterSpacing: "1px",
          width: "fit-content",
          marginBottom: "0.75rem",
          marginTop: "2rem",
        }}
      >
        SPOUSE INFORMATION
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px",
        }}
      >
        {[
          {
            label: "Spouse's Name",
            value: spouse
              ? `${spouse.givenname} ${spouse.middlename || ""} ${
                  spouse.lastname || ""
                } `
              : "N/A",
          },
          {
            label: "Wedding Date",
            value: personnel?.wedding_anniversary
              ? new Date(personnel.wedding_anniversary).toLocaleDateString()
              : "N/A",
          },
          {
            label: "Citizenship",
            value: spouse?.citizenship
              ? getNamesByIds(
                  spouse.citizenship,
                  lookupData.citizenships,
                  "citizenship"
                )
              : "N/A",
          },
          {
            label: "Ethnicity",
            value: spouse?.nationality
              ? getNamesByIds(
                  spouse.nationality,
                  lookupData.nationalities,
                  "nationality"
                )
              : "N/A",
          },
          {
            label: "District",
            value: spouse?.district_id
              ? getNamesByIds(spouse.district_id, lookupData.districts)
              : "N/A",
          },
          {
            label: "Occupation",
            value: spouse?.position || "N/A",
          },
          {
            label: "Date of Birth",
            value: spouse?.date_of_birth
              ? new Date(spouse.date_of_birth).toLocaleDateString()
              : "N/A",
            isPair: true,
            pairLabel: "Contact Number",
            pairValue: spouse?.contact_number || "N/A",
          },
        ].map((item, index) => {
          if (item.isPair) {
            return (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                {[
                  { value: item.value, label: item.label },
                  { value: item.pairValue, label: item.pairLabel },
                ].map((col, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      padding: "0.4rem 0.5rem",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      lineHeight: "1.2",
                    }}
                  >
                    {col.value}
                    <div
                      style={{
                        fontWeight: "normal",
                        fontSize: "0.7rem",
                        color: "#555",
                        marginTop: "2px",
                      }}
                    >
                      {col.label}
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "0.4rem 0.5rem",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "0.85rem",
                lineHeight: "1.2",
              }}
            >
              {item.value}
              <div
                style={{
                  fontWeight: "normal",
                  fontSize: "0.7rem",
                  color: "#555",
                  marginTop: "2px",
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <h4
        style={{
          background: "#fdd835",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          fontWeight: "bold",
          letterSpacing: "1px",
          width: "fit-content",
          marginBottom: "0.75rem",
          marginTop: "2rem",
        }}
      >
        CHILDREN
      </h4>

      {children.length > 0 ? (
        children.map((child, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "0.6rem",
              marginBottom: "0.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)", // 4 columns for 4 fields
              gap: "8px",
              alignItems: "center",
            }}
          >
            {[
              {
                label: "Name",
                value: child
                  ? `${child.givenname} ${child.middlename || ""} ${
                      child.lastname || ""
                    }  ${child.suffix !== "No Suffix" ? child.suffix : ""}`
                  : "N/A",
              },
              { label: "Gender", value: child.gender },
              { label: "Age", value: child.date_of_birth },
              { label: "Occupation", value: child.position },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "0.4rem 0.5rem",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  lineHeight: "1.2",
                }}
              >
                {item.value || "N/A"}
                <div
                  style={{
                    fontWeight: "normal",
                    fontSize: "0.7rem",
                    color: "#555",
                    marginTop: "2px",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>No children listed.</p>
      )}
    </div>
  );
};

export default PersonnelInfo;
