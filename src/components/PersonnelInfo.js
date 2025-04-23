import React from "react";

const PersonnelInfo = ({ personnel }) => {
  if (!personnel) return <div>No personnel data found.</div>;

  const {
    surname_husband,
    givenname,
    middlename,
    extname,
    department,
    employment_type,
    employment_status,
    gender,
    birthdate,
    birthplace,
    civil_status,
    church_membership = {},
    parents = {},
    spouse = {},
    children = [],
  } = personnel;

  const fullName = `${surname_husband}, ${givenname} ${middlename || ""} ${
    extname || ""
  }`.toUpperCase();

  return (
    <div style={{ width: "70%", background: "#fff", padding: "2rem" }}>
      <h2 style={{ borderBottom: "2px solid #fdd835" }}>
        PMD PERSONNEL INFORMATION
      </h2>
      <h3>{fullName}</h3>
      <p>Department: {department?.name || "N/A"}</p>
      <p>Employment Type: {employment_type}</p>
      <p>Status: {employment_status}</p>

      <h4 style={{ background: "#fdd835", padding: "0.5rem" }}>
        Personal Information
      </h4>
      <p>Gender: {gender}</p>
      <p>Birthdate: {birthdate}</p>
      <p>Birthplace: {birthplace}</p>
      <p>Civil Status: {civil_status}</p>

      <h4 style={{ background: "#fdd835", padding: "0.5rem" }}>
        Church Membership
      </h4>
      <p>Membership Type: {church_membership.type}</p>
      <p>Membership No: {church_membership.number}</p>
      <p>Date Baptized: {church_membership.baptized_at}</p>

      <h4 style={{ background: "#fdd835", padding: "0.5rem" }}>
        Parent Information
      </h4>
      <p>Father: {parents.father_name}</p>
      <p>Mother: {parents.mother_name}</p>

      <h4 style={{ background: "#fdd835", padding: "0.5rem" }}>
        Spouse & Children
      </h4>
      <p>Spouse: {spouse?.surname_husband || spouse?.name || "N/A"}</p>
      {children.length > 0 ? (
        children.map((child, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ccc",
              padding: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <p>Name: {child.name}</p>
            <p>Birthdate: {child.birthdate}</p>
          </div>
        ))
      ) : (
        <p>No children listed.</p>
      )}
    </div>
  );
};

export default PersonnelInfo;
