import React, { useEffect, useState } from "react";
import { FaBriefcase, FaUserTie, FaUserCheck } from "react-icons/fa"; // Icons used in image layout
import styles from "./PersonnelImage.module.css";
// Configuration for API URLs
const API_URL = process.env.REACT_APP_API_URL; // API URL

const PersonnelInfo = ({
  personnel,
  familyMembers,
  lookupData,
  personnelAddress,
  personnelImage,
  personnelDuties,
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
    is_offered,
    minister_officiated,
    date_baptized,
    place_of_baptism,
    local_first_registered,
    district_first_registered,
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

  const capitalizeFullName = (name) => {
    if (name == null) {
      // This checks for both null and undefined
      return null; // or return ""; if you prefer to return an empty string
    }
    return name.toUpperCase();
  };

  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);

    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

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
          marginBottom: "0px",
          textAlign: "center",
        }}
      >
        {capitalizeFullName(fullName)}
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          marginBottom: "30px",
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
          backgroundColor: "#FFD600", // yellow background
          padding: "0.15rem 1rem",
          fontSize: "1.2rem",
          fontWeight: "bold",
          letterSpacing: "5px",
          textTransform: "uppercase",
          color: "black",
          width: "fit-content",
          marginBottom: "0",
          marginTop: "1rem",
          position: "relative", // Important for the yellow line
        }}
      >
        PERSONAL INFORMATION
      </h4>
      <div
        style={{
          height: "2px",
          backgroundColor: "#F57C00", // dark orange line below
          width: "100%",
          marginBottom: "0.50rem",
        }}
      ></div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)", // ✅ Fixed to 5 columns
          gap: "1px",
        }}
      >
        {[
          { label: "Surname", value: capitalizeFullName(surname_husband) },
          { label: "Given Name", value: capitalizeFullName(givenname) },
          { label: "Middle Name", value: capitalizeFullName(middlename) },
          {
            label: "Suffix",
            value:
              !suffix || suffix.trim().toLowerCase() === "no suffix"
                ? "-"
                : suffix,
          },
          { label: "Nickname", value: capitalizeFullName(nickname) },
          { label: "Gender", value: capitalizeFullName(gender) },
          { label: "Civil Status", value: capitalizeFullName(civil_status) },
          {
            label: "Citizenship",
            value: capitalizeFullName(
              getNamesByIds(
                personnel.citizenship,
                lookupData.citizenships,
                "citizenship"
              )
            ),
          },
          {
            label: "Ethnicity",
            value:
              capitalizeFullName(
                getNamesByIds(
                  personnel.nationality,
                  lookupData.nationalities,
                  "nationality"
                )
              ) || "N/A",
          },
          { label: "Age", value: calculateAge(date_of_birth) },
          { label: "Date of Birth", value: date_of_birth, colSpan: 2 },

          { label: "Blood Type", value: capitalizeFullName(bloodtype) },
          { label: "Office Start Date", value: datejoined, colSpan: 2 },

          {
            label: "Place of Birth",
            value: capitalizeFullName(place_of_birth),
            colSpan: 3,
          },
          {
            label: "Language",
            value:
              capitalizeFullName(
                getNamesByIds(personnel.language_id, lookupData.languages)
              ) ?? "N/A",
            colSpan: 2,
          },
          {
            label: "Home Address",
            value: capitalizeFullName(home?.name) || "N/A",
            colSpan: 5,
          },
          {
            label: "Provincial Address",
            value: capitalizeFullName(provincial?.name) || "N/A",
            colSpan: 5,
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "0.10rem",
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
                fontSize: "0.70rem",
                color: "#555",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          breakInside: "avoid", // Prevent breaking across pages
          pageBreakInside: "avoid", // Fallback for older browsers
        }}
      >
        {personnel && (
          <>
            <h4
              style={{
                backgroundColor: "#FFD600", // yellow background
                padding: "0.15rem 1rem",
                fontSize: "1.2rem",
                fontWeight: "bold",
                letterSpacing: "5px",
                textTransform: "uppercase",
                color: "black",
                width: "fit-content",
                marginBottom: "0",
                marginTop: "1rem",
                position: "relative", // Important for underline
              }}
            >
              CHURCH MEMBERSHIP
            </h4>
            <div
              style={{
                height: "2px",
                backgroundColor: "#F57C00", // dark orange line below
                width: "100%",
                marginBottom: "0.50rem",
              }}
            ></div>

            {personnel.personnel_type !== "Lay Member" ? (
              // --- Non-Lay Member view ---
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "6px",
                }}
              >
                {[
                  {
                    label: "Personnel Type",
                    value: capitalizeFullName(personnel_type),
                  },
                  { label: "Assigned Number", value: assigned_number },
                  { label: "Oath-taking as Worker", value: panunumpa_date },
                  { label: "Date of Ordination", value: ordination_date },
                  {
                    label: "Classification",
                    value:
                      is_offered === "1" || is_offered === 1
                        ? "Offered"
                        : is_offered === "0" || is_offered === 0
                        ? "Convert"
                        : "N/A",
                  },
                  {
                    label: "Date of Baptism",
                    value: date_baptized,
                  },
                  {
                    label: "Place of Baptism",
                    value: place_of_baptism,
                  },
                  {
                    label: "Evangelist (Nagdoktrina)",
                    value: minister_officiated,
                  },
                  {
                    label: "District First Registered",
                    value:
                      capitalizeFullName(
                        getNamesByIds(
                          personnel.district_first_registered,
                          lookupData.districts
                        )
                      ) || "N/A",
                  },
                  {
                    label: "Local First Registered",
                    value:
                      capitalizeFullName(
                        getNamesByIds(
                          personnel.local_first_registered,
                          lookupData.localCongregations
                        )
                      ) || "N/A",
                  },
                  {
                    label: "District Origin",
                    value:
                      capitalizeFullName(
                        getNamesByIds(
                          personnel.district_id,
                          lookupData.districts
                        )
                      ) || "N/A",
                    colSpan: 2,
                  },
                  {
                    label: "Local Origin",
                    value:
                      capitalizeFullName(
                        getNamesByIds(
                          personnel.local_congregation,
                          lookupData.localCongregations
                        )
                      ) || "N/A",
                  },
                  {
                    label: "District Assignment",
                    value:
                      capitalizeFullName(
                        getNamesByIds(
                          personnel.district_assignment_id,
                          lookupData.districts
                        )
                      ) || "N/A",
                  },
                  {
                    label: "Local Assignment",
                    value:
                      capitalizeFullName(
                        getNamesByIds(
                          personnel.local_congregation_assignment,
                          lookupData.localCongregations
                        )
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
                      gridColumn: item.colSpan
                        ? `span ${item.colSpan}`
                        : undefined,
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
            ) : (
              // --- Lay Member view ---
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "6px",
                }}
              >
                {/* First Row: Office Start Date, Minister Officiated, Date Baptized */}
                {[
                  {
                    label: "Classification",
                    value:
                      is_offered === "1" || is_offered === 1
                        ? "Offered"
                        : is_offered === "0" || is_offered === 0
                        ? "Convert"
                        : "N/A",
                  },
                  { label: "Date of Baptism", value: date_baptized },
                  { label: "Place of Baptism", value: place_of_baptism },
                  {
                    label: "Evangelist (Nagdoktrina)",
                    value: minister_officiated,
                  },
                  {
                    label: "District First Registered",
                    value:
                      capitalizeFullName(
                        getNamesByIds(
                          personnel.district_first_registered,
                          lookupData.districts
                        )
                      ) || "N/A",
                  },
                  {
                    label: "Local First Registered",
                    value:
                      capitalizeFullName(
                        getNamesByIds(
                          personnel.local_first_registered,
                          lookupData.localCongregations
                        )
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

                {/* Second Row: Duties */}
                {Array.isArray(personnelDuties) &&
                personnelDuties.length > 0 ? (
                  <>
                    {/* Header Row */}
                    <div
                      style={{
                        gridColumn: "span 3",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        backgroundColor: "#f5f5f5",
                        padding: "0.5rem",
                        fontWeight: "bold",
                        borderTopLeftRadius: "5px",
                        borderTopRightRadius: "5px",
                        border: "1px solid #ccc",
                        borderBottom: "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      <div>Duty</div>
                      <div style={{ textAlign: "center" }}>Years</div>
                    </div>

                    {/* Duties Rows */}
                    {personnelDuties.map((duty, index) => (
                      <div
                        key={index}
                        style={{
                          gridColumn: "span 3",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          border: "1px solid #ccc",
                          borderTop: "none",
                          padding: "0.5rem",
                          fontSize: "0.85rem",
                          alignItems: "center",
                        }}
                      >
                        <div>{duty.duty}</div>
                        <div style={{ textAlign: "center" }}>
                          {duty.start_year} to{" "}
                          {duty.end_year === new Date().getFullYear() ||
                          !duty.end_year
                            ? "Present"
                            : duty.end_year}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div
                    style={{
                      gridColumn: "span 3",
                      textAlign: "center",
                      color: "#999",
                      padding: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    No duties recorded.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div
        style={{
          breakInside: "avoid", // Prevent breaking across pages
          pageBreakInside: "avoid", // Fallback for older browsers
        }}
      >
        <h4
          style={{
            backgroundColor: "#FFD600", // yellow background
            padding: "0.15rem 1rem",
            fontSize: "1.2rem",
            fontWeight: "bold",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "black",
            width: "fit-content",
            marginBottom: "0",
            marginTop: "1rem",
            position: "relative", // for line positioning
          }}
        >
          PARENT INFORMATION
        </h4>
        <div
          style={{
            height: "2px",
            backgroundColor: "#F57C00", // dark orange underline
            width: "100%",
            marginBottom: "0.50rem",
          }}
        ></div>

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
                      ? capitalizeFullName(
                          `${parent.givenname || ""} ${
                            parent.middlename || ""
                          } ${parent.lastname || ""} ${
                            parent.suffix && parent.suffix !== "No Suffix"
                              ? parent.suffix
                              : ""
                          }`
                        )
                          .replace(/\s+/g, " ")
                          .trim() // to clean up extra spaces
                      : "N/A",
                  },
                  {
                    label: `${type}'s District`,
                    value: parent
                      ? capitalizeFullName(
                          getNamesByIds(
                            parent.district_id,
                            lookupData.districts
                          )
                        )
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
                    value: capitalizeFullName(parent?.civil_status) || "N/A",
                    isPair: true,
                    pairLabel: `${type}'s Citizenship`,
                    pairValue: parent?.citizenship
                      ? capitalizeFullName(
                          getNamesByIds(
                            parent.citizenship,
                            lookupData.citizenships,
                            "citizenship"
                          )
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
      </div>

      {personnel?.civil_status === "Married" && (
        <div
          style={{
            breakInside: "avoid", // Prevent breaking across pages
            pageBreakInside: "avoid", // Fallback for older browsers
          }}
        >
          <h4
            style={{
              backgroundColor: "#FFD600", // yellow background
              padding: "0.15rem 1rem",
              fontSize: "1.2rem",
              fontWeight: "bold",
              letterSpacing: "5px",
              textTransform: "uppercase",
              color: "black",
              width: "fit-content",
              marginBottom: "0",
              marginTop: "1rem",
              position: "relative",
            }}
          >
            SPOUSE INFORMATION
          </h4>
          <div
            style={{
              height: "2px",
              backgroundColor: "#F57C00", // dark orange underline
              width: "100%",
              marginBottom: "0.50rem",
            }}
          ></div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)", // ✅ Fixed to 5 columns
              gap: "6px",
            }}
          >
            {[
              {
                label: "Spouse's Name",
                value: spouse
                  ? capitalizeFullName(
                      `${spouse.givenname} ${spouse.middlename || ""} ${
                        spouse.lastname || ""
                      } `
                    )
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
                  ? capitalizeFullName(
                      getNamesByIds(
                        spouse.citizenship,
                        lookupData.citizenships,
                        "citizenship"
                      )
                    )
                  : "N/A",
              },
              {
                label: "Ethnicity",
                value: spouse?.nationality
                  ? capitalizeFullName(
                      getNamesByIds(
                        spouse.nationality,
                        lookupData.nationalities,
                        "nationality"
                      )
                    )
                  : "N/A",
              },
              {
                label: "Present Address",
                value: capitalizeFullName(spouse?.address) || "N/A",
              },
              {
                label: "Occupation",
                value: capitalizeFullName(spouse?.position) || "N/A",
              },
              {
                label: "Date of Birth",
                value: spouse?.date_of_birth
                  ? new Date(spouse.date_of_birth).toLocaleDateString()
                  : "N/A",
              },
              {
                label: "Contact Number",
                value: spouse?.contact_number || "N/A",
              },
              {
                label: "District",
                value: spouse?.district_id
                  ? capitalizeFullName(
                      getNamesByIds(spouse.district_id, lookupData.districts)
                    )
                  : "N/A",
                colSpan: 2,
              },
              {
                label: "Local Congregation",
                value: spouse?.district_id
                  ? capitalizeFullName(
                      getNamesByIds(
                        spouse.local_congregation,
                        lookupData.localCongregations
                      )
                    )
                  : "N/A",
                colSpan: 2,
              },
            ].map((item, index) => {
              // Handle paired items
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
                          gridColumn: col.colSpan
                            ? `span ${col.colSpan}`
                            : "span 1",
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
                    gridColumn: item.colSpan
                      ? `span ${item.colSpan}`
                      : "span 1", // ✅ Apply colSpan
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
            }}
          >
            {/* the map loop for spouse info here */}
          </div>
        </div>
      )}

      {!(
        ["Minister", "Regular"].includes(personnel?.personnel_type) &&
        personnel?.civil_status === "Single"
      ) && (
        <div
          style={{
            breakInside: "avoid", // Prevent breaking across pages
            pageBreakInside: "avoid", // Fallback for older browsers
          }}
        >
          {children.length > 0 ? (
            <>
              <h4
                style={{
                  backgroundColor: "#FFD600", // yellow background
                  padding: "0.15rem 1rem",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  letterSpacing: "5px",
                  textTransform: "uppercase",
                  color: "black",
                  width: "fit-content",
                  marginBottom: "0",
                  marginTop: "1rem",
                  position: "relative",
                }}
              >
                CHILDREN
              </h4>
              <div
                style={{
                  height: "2px",
                  backgroundColor: "#F57C00", // dark orange underline
                  width: "100%",
                  marginBottom: "0.50rem",
                }}
              ></div>
              {children.map((child, idx) => (
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
                        ? capitalizeFullName(
                            `${child.givenname} ${child.middlename || ""} ${
                              child.lastname || ""
                            }  ${
                              child.suffix !== "No Suffix" ? child.suffix : ""
                            }`
                          )
                        : "N/A",
                    },
                    {
                      label: "Gender",
                      value: capitalizeFullName(child.gender),
                    },
                    { label: "Age", value: calculateAge(child.date_of_birth) },
                    {
                      label: "Occupation",
                      value: capitalizeFullName(child.position),
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
              ))}
            </>
          ) : (
            personnel?.civil_status === "Married" && <p>No children listed.</p>
          )}
        </div>
      )}

      {/* === FORCE PAGE BREAK AFTER CHILDREN === */}
      <div className={styles.pageBreak}></div>

      {/* === PAGE BREAK & WHOLE BODY FOR PRINT === */}
      {personnelImage?.wholeBody && (
        <div
          className={`${styles.printOnly} ${styles.pageBreak} wholeBodyPrint`}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src={`${API_URL}${personnelImage.wholeBody}`}
              alt="Whole Body"
              style={{
                width: "100%",
                maxWidth: "600px",
                height: "auto",
                margin: "1rem auto",
                display: "block",
                objectFit: "contain",
                border: "2px solid #000",
                borderRadius: "8px",
              }}
            />
            <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              Whole Body Picture
            </div>
          </div>
        </div>
      )}

      {/* === DISPLAY 2x2 & HALF BODY === */}
      {(personnelImage?.twoByTwo || personnelImage?.halfBody) && (
        <div
          className={`${styles.printOnly} twoByTwoHalfBodyPrint`}
          style={{
            marginTop: "2rem",
            textAlign: "center",
          }}
        >
          {/* 2x2 Pictures Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
              justifyContent: "center",
              marginBottom: "2rem",
            }}
          >
            {[...Array(4)].map((_, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={
                    personnelImage.twoByTwo
                      ? `${API_URL}${personnelImage.twoByTwo}`
                      : "/default-avatar.png"
                  }
                  alt={`2x2 Picture ${index + 1}`}
                  style={{
                    width: "100%",
                    maxWidth: "150px",
                    height: "auto",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    margin: "0 auto",
                  }}
                />
                <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                  2x2 Picture
                </div>
              </div>
            ))}
          </div>

          {/* Half Body Picture */}
          {personnelImage.halfBody && (
            <div style={{ textAlign: "center" }}>
              <img
                src={`${API_URL}${personnelImage.halfBody}`}
                alt="Half Body"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "auto",
                  objectFit: "cover",
                  border: "2px solid #333",
                  borderRadius: "6px",
                  margin: "0 auto",
                }}
              />
              <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                Half Body Picture
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default PersonnelInfo;
