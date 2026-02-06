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
    gender,
  } = personnel;

  const getNamesByIds = (idsInput, array, nameField = "name") => {
    if (!idsInput || !Array.isArray(array)) return "N/A";
    const idsString = typeof idsInput === "string" ? idsInput : String(idsInput);
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

  const fullName = [
    personnel.givenname,
    personnel.middlename,
    personnel.surname_husband,
    personnel.suffix !== "No Suffix" ? personnel.suffix : "",
  ].filter(Boolean).join(" ");

  const capitalizeFullName = (name) => {
    if (name == null) return null;
    return name.toUpperCase();
  };

  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const parents = familyMembers.filter(
    (fm) =>
      fm.relationship_type === "Father" || fm.relationship_type === "Mother"
  );
  const spouse = familyMembers.find((fm) => fm.relationship_type === "Spouse");
  const children = familyMembers.filter(
    (fm) => fm.relationship_type === "Child"
  );

  // --- COMPACT STYLES FOR PRINTING ---
  const cardStyle = {
    border: "1px solid #cbd5e1", // Slightly darker border for visibility
    borderRadius: "4px",
    padding: "0.25rem 0.1rem",
    textAlign: "center",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column", // Value First (Top), Label Second (Bottom)
    justifyContent: "center",
    minHeight: "42px"
  };

  const valueStyle = {
    fontWeight: "800", // Bolder value
    fontSize: "0.85rem",
    color: "#0f172a",
    lineHeight: "1.1",
    marginBottom: "2px",
    textTransform: "uppercase" // Uppercase values as per image
  };

  const labelStyle = {
    fontWeight: "600",
    fontSize: "0.6rem",
    color: "#64748b",
    textTransform: "none", // Normal case labels? Image has "Surname" (Title Case)
    letterSpacing: "0",
    lineHeight: "1"
  };

  const sectionHeaderContainerStyle = {
    marginBottom: "0.5rem",
    marginTop: "1rem",
  };

  const sectionHeaderTextStyle = {
    backgroundColor: "#fbbf24", // Yellow background
    color: "#000",
    padding: "0.2rem 1.5rem", // Wider padding like image
    fontSize: "0.9rem",
    fontWeight: "800",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    display: "inline-block",
    // No border radius in image, looks rectangular
  };

  return (
    <>
      <style>
        {`
        @media screen {
            .personnel-info-container {
                width: 70%;
                margin: 2rem auto;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                border: 1px solid #e2e8f0;
                border-radius: 8px;
            }
        }
        @media print {
            .personnel-info-container {
                width: 100% !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 0 0 1.5rem !important;
            }
        }
      `}
      </style>
      <div
        className="personnel-info-container"
        style={{
          background: "#fff",
          padding: "0.5rem",
          fontFamily: "'Inter', sans-serif",
          color: "#333",
          fontSize: "0.8rem",
          boxSizing: "border-box"
        }}
      >
        {/* Header Info */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {/* Removed PMD Information Header per request */}

          <h3
            style={{
              fontSize: "1.6rem",
              fontWeight: "900",
              color: "#0f172a",
              margin: "0.5rem 0",
              textTransform: "uppercase",
              lineHeight: "1",
              paddingBottom: "0.5rem",
              borderBottom: "3px solid #f59e0b", // Line stroke below name
              display: "inline-block",
              minWidth: "50%"
            }}
          >
            {capitalizeFullName(fullName)}
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              marginBottom: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#64748b",
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <FaBriefcase style={{ marginRight: "6px", color: "#f59e0b" }} size={14} />
              {getNamesByIds(personnel.section_id, lookupData.sections) || "N/A"}
            </span>
            <span style={{ display: "flex", alignItems: "center" }}>
              <FaUserTie style={{ marginRight: "6px", color: "#f59e0b" }} size={14} />
              {m_status}
            </span>
            <span style={{ display: "flex", alignItems: "center" }}>
              <FaUserCheck style={{ marginRight: "6px", color: "#d97706" }} size={14} />
              {personnel_type}
            </span>
          </div>
        </div>

        <div style={sectionHeaderContainerStyle}>
          <div style={sectionHeaderTextStyle}>Personal Information</div>
          <div style={{ height: "2px", background: "#f59e0b", width: "100%", marginTop: "-2px", zIndex: -1 }}></div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "4px",
          }}
        >
          {[
            { label: "Surname", value: capitalizeFullName(surname_husband) },
            { label: "Given Name", value: capitalizeFullName(givenname) },
            { label: "Middle Name", value: capitalizeFullName(middlename) },
            {
              label: "Suffix",
              value: !suffix || suffix.trim().toLowerCase() === "no suffix" ? "-" : suffix,
            },
            { label: "Nickname", value: capitalizeFullName(nickname) },
            { label: "Gender", value: capitalizeFullName(gender) },

            { label: "Civil Status", value: capitalizeFullName(civil_status) },
            { label: "Citizenship", value: capitalizeFullName(getNamesByIds(personnel.citizenship, lookupData.citizenships, "citizenship")) || "N/A", colSpan: 2 },
            { label: "Ethnicity", value: capitalizeFullName(getNamesByIds(personnel.nationality, lookupData.nationalities, "nationality")) || "N/A", colSpan: 2 },
            { label: "Age", value: calculateAge(date_of_birth) },

            { label: "Date of Birth", value: date_of_birth, colSpan: 2 },
            { label: "Blood Type", value: capitalizeFullName(bloodtype) },
            { label: "Office Start Date", value: datejoined, colSpan: 3 },

            {
              label: "Place of Birth",
              value: capitalizeFullName(place_of_birth),
              colSpan: 3,
            },
            {
              label: "Language",
              value: capitalizeFullName(getNamesByIds(personnel.language_id, lookupData.languages)) ?? "N/A",
              colSpan: 3,
            },
            {
              label: "Home Address",
              value: capitalizeFullName(home?.name) || "N/A",
              colSpan: 6,
            },
            {
              label: "Provincial Address",
              value: capitalizeFullName(provincial?.name) || "N/A",
              colSpan: 6,
            },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                ...cardStyle,
                gridColumn: item.colSpan ? `span ${item.colSpan}` : "auto",
              }}
            >
              <div style={valueStyle}>{item.value || "N/A"}</div>
              <div style={labelStyle}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={sectionHeaderContainerStyle}>
          <div style={sectionHeaderTextStyle}>Church Membership</div>
          <div style={{ height: "2px", background: "#f59e0b", width: "100%", marginTop: "-2px", zIndex: -1 }}></div>
        </div>

        {personnel.personnel_type !== "Lay Member" &&
          personnel.personnel_type !== "Minister's Wife" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "4px",
            }}
          >
            {[
              { label: "Personnel Type", value: capitalizeFullName(personnel_type) },
              { label: "Assigned No.", value: assigned_number },
              { label: "Oath Taking", value: panunumpa_date },
              { label: "Ordination", value: ordination_date },
              { label: "Classification", value: is_offered === "1" || is_offered === 1 ? "Offered" : is_offered === "0" || is_offered === 0 ? "Convert" : "N/A" },
              { label: "Baptism Date", value: date_baptized },

              { label: "Baptism Place", value: place_of_baptism, colSpan: 2 },
              { label: "Evangelist", value: minister_officiated, colSpan: 2 },
              {
                label: "District 1st Reg",
                value: capitalizeFullName(getNamesByIds(personnel.district_first_registered, lookupData.districts)) || "N/A",
                colSpan: 2
              },

              {
                label: "Local 1st Reg",
                value: capitalizeFullName(getNamesByIds(personnel.local_first_registered, lookupData.localCongregations)) || "N/A",
                colSpan: 2
              },
              {
                label: "District Origin",
                value: capitalizeFullName(getNamesByIds(personnel.district_id, lookupData.districts)) || "N/A",
                colSpan: 2,
              },
              {
                label: "Local Origin",
                value: capitalizeFullName(getNamesByIds(personnel.local_congregation, lookupData.localCongregations)) || "N/A",
                colSpan: 2
              },

              {
                label: "District Assign",
                value: capitalizeFullName(getNamesByIds(personnel.district_assignment_id, lookupData.districts)) || "N/A",
                colSpan: 3,
              },
              {
                label: "Local Assign",
                value: capitalizeFullName(getNamesByIds(personnel.local_congregation_assignment, lookupData.localCongregations)) || "N/A",
                colSpan: 3,
              },
            ].map((item, index) => (
              <div key={index} style={{ ...cardStyle, gridColumn: item.colSpan ? `span ${item.colSpan}` : undefined }}>
                <div style={valueStyle}>{item.value || "N/A"}</div>
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}
          </div>
        ) : (
          // --- Lay Member view ---
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "4px",
            }}
          >
            {[
              { label: "Classification", value: is_offered === "1" ? "Offered" : "Convert" },
              { label: "Baptism Date", value: date_baptized },
              { label: "Baptism Place", value: place_of_baptism },
              { label: "Evangelist", value: minister_officiated },
              { label: "District 1st Reg", value: capitalizeFullName(getNamesByIds(personnel.district_first_registered, lookupData.districts)) || "N/A", colSpan: 2 },
              { label: "Local 1st Reg", value: capitalizeFullName(getNamesByIds(personnel.local_first_registered, lookupData.localCongregations)) || "N/A", colSpan: 2 },
            ].map((item, index) => (
              <div key={index} style={{ ...cardStyle, gridColumn: item.colSpan ? `span ${item.colSpan}` : undefined }}>
                <div style={valueStyle}>{item.value || "N/A"}</div>
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}

            {/* Duties */}
            {Array.isArray(personnelDuties) && personnelDuties.length > 0 && (
              <div style={{ gridColumn: "span 4", marginTop: "0.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#f1f5f9", padding: "0.2rem", fontWeight: "700", fontSize: "0.75rem", border: "1px solid #e2e8f0" }}>
                  <div>Duty</div><div style={{ textAlign: "center" }}>Years</div>
                </div>
                {personnelDuties.map((duty, index) => (
                  <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #e2e8f0", borderTop: "none", padding: "0.2rem", fontSize: "0.75rem", background: "#fff" }}>
                    <div>{duty.duty}</div>
                    <div style={{ textAlign: "center" }}>{duty.start_year} - {duty.end_year || "Present"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={sectionHeaderContainerStyle}>
          <div style={sectionHeaderTextStyle}>Parent Information</div>
          <div style={{ height: "2px", background: "#f59e0b", width: "100%", marginTop: "-2px", zIndex: -1 }}></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {["Father", "Mother"].map((type) => {
            const parent = parents.find((p) => p.relationship_type === type);
            return (
              <div key={type} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px" }}>
                {[
                  {
                    label: `${type}'s Name`,
                    value: parent ? capitalizeFullName([
                      parent.givenname,
                      parent.middlename,
                      parent.lastname,
                      parent.suffix && parent.suffix.trim() !== "No Suffix" ? parent.suffix : ""
                    ].filter(Boolean).join(" ")) : "N/A",
                    colSpan: 2
                  },
                  { label: "District", value: parent ? capitalizeFullName(getNamesByIds(parent.district_id, lookupData.districts)) : "N/A", colSpan: 2 },
                  { label: "Birth Date", value: parent?.date_of_birth ? new Date(parent.date_of_birth).toLocaleDateString() : "N/A" },
                  { label: "Contact", value: parent?.contact_number || "N/A" },
                  { label: "Civil Status", value: capitalizeFullName(parent?.civil_status) || "N/A" },
                  { label: "Citizenship", value: parent?.citizenship ? capitalizeFullName(getNamesByIds(parent.citizenship, lookupData.citizenships, "citizenship")) : "N/A" }
                ].map((item, idx) => (
                  <div key={idx} style={{ ...cardStyle, gridColumn: item.colSpan ? `span ${item.colSpan}` : "auto" }}>
                    <div style={valueStyle}>{item.value}</div>
                    <div style={labelStyle}>{item.label}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {personnel?.civil_status === "Married" && (
          <div style={{ breakInside: "avoid" }}>
            <div style={sectionHeaderContainerStyle}>
              <div style={sectionHeaderTextStyle}>Spouse Information</div>
              <div style={{ height: "2px", background: "#f59e0b", width: "100%", marginTop: "-2px", zIndex: -1 }}></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px" }}>
              {[
                {
                  label: "Spouse Name",
                  value: spouse ? capitalizeFullName([
                    spouse.givenname,
                    spouse.middlename,
                    spouse.surname_husband,
                    spouse.suffix && spouse.suffix.trim() !== "No Suffix" ? spouse.suffix : ""
                  ].filter(Boolean).join(" ")) : "N/A",
                  colSpan: 2
                },
                { label: "Date of Birth", value: spouse?.date_of_birth ? new Date(spouse.date_of_birth).toLocaleDateString() : "N/A" },
                { label: "Contact", value: spouse?.contact_number || "N/A" },
                { label: "Occupation", value: capitalizeFullName(spouse?.position) || "N/A", colSpan: 2 },

                { label: "Present Address", value: capitalizeFullName(spouse?.address) || "N/A", colSpan: 3 },
                { label: "Civil Status", value: capitalizeFullName(spouse?.civil_status) || "N/A" },
                { label: "District", value: spouse?.district_id ? capitalizeFullName(getNamesByIds(spouse.district_id, lookupData.districts)) : "N/A", colSpan: 1 },
                { label: "Local", value: spouse?.local_congregation ? capitalizeFullName(getNamesByIds(spouse.local_congregation, lookupData.localCongregations)) : "N/A", colSpan: 1 }
              ].map((item, idx) => (
                <div key={idx} style={{ ...cardStyle, gridColumn: item.colSpan ? `span ${item.colSpan}` : "auto" }}>
                  <div style={valueStyle}>{item.value}</div>
                  <div style={labelStyle}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!(["Minister", "Regular"].includes(personnel?.personnel_type) && personnel?.civil_status === "Single") && children.length > 0 && (
          <div style={{ breakInside: "avoid", marginTop: "0.25rem" }}>
            <div style={sectionHeaderContainerStyle}>
              <div style={sectionHeaderTextStyle}>Children</div>
              <div style={{ height: "2px", background: "#f59e0b", width: "100%", marginTop: "-2px", zIndex: -1 }}></div>
            </div>
            <div style={{ display: "grid", gap: "2px" }}>
              {children.map((child, idx) => (
                <div key={idx} style={{ ...cardStyle, flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "0.15rem 0.5rem", textAlign: "left", minHeight: "auto" }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ ...valueStyle, fontSize: "0.75rem" }}>
                      {capitalizeFullName([
                        child.givenname,
                        child.middlename,
                        child.lastname,
                        child.suffix && child.suffix.trim() !== "No Suffix" ? child.suffix : ""
                      ].filter(Boolean).join(" "))}
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}><div style={{ ...valueStyle, fontSize: "0.75rem" }}>{capitalizeFullName(child.gender)}</div></div>
                  <div style={{ flex: 1, textAlign: "center" }}><div style={{ ...valueStyle, fontSize: "0.75rem" }}>{calculateAge(child.date_of_birth)} yrs</div></div>
                  <div style={{ flex: 1, textAlign: "right" }}><div style={{ ...valueStyle, fontSize: "0.75rem" }}>{capitalizeFullName(child.position) || "N/A"}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default PersonnelInfo;
