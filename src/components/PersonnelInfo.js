import React from "react";

const PersonnelInfo = ({ personnel }) => {
  if (!personnel) return <div>No personnel data found.</div>;

  const {
    surname_husband,
    givenname,
    middlename,
    suffix,
    nickname,
    citizenship,
    ethnicity,
    age,
    blood_type,
    language,
    address,
    province,
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

  const fullName = `${surname_husband}, ${givenname} ${middlename || ""}${
    suffix && suffix.toLowerCase() !== "no suffix" ? " " + suffix : ""
  }`.toUpperCase();

  return (
    <div style={{ width: "70%", background: "#fff", padding: "0.25rem" }}>
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
          flexWrap: "wrap",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        <p>
          <strong>Section:</strong> {department?.name || "N/A"}
        </p>
        <p>
          <strong>Employment Type:</strong> {employment_type}
        </p>
        <p>
          <strong>Status:</strong> {employment_status}
        </p>
      </div>

      <h4
        style={{
          background: "#fdd835",
          color: "#333",
          padding: "0.5rem 1.2rem",
          fontWeight: "bold",
          display: "inline-block",
          marginTop: "2rem",
          marginBottom: "1rem",
          fontSize: "1.1rem",
          letterSpacing: "2px",
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
          { label: "Suffix", value: suffix || "-" },
          { label: "Nickname", value: nickname },
          { label: "Gender", value: gender },
          { label: "Civil Status", value: civil_status },
          { label: "Citizenship", value: citizenship },
          { label: "Ethnicity", value: ethnicity },
          { label: "Age", value: age },
          { label: "Date of Birth", value: birthdate },
          { label: "Place of Birth", value: birthplace },
          { label: "Blood Type", value: blood_type },
          { label: "Language", value: language },
          { label: "Address", value: address, colSpan: 2 },
          { label: "Province", value: province, colSpan: 2 },
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
          { label: "Personnel Type", value: church_membership?.type },
          { label: "Assigned Number", value: church_membership?.number },
          {
            label: "Oath-taking as Worker",
            value: church_membership?.baptized_at,
          },
          {
            label: "Date of Ordination",
            value: church_membership?.ordination_date,
          },
          {
            label: "Office Start Date",
            value: church_membership?.office_start_date,
          },
          {
            label: "District Origin",
            value: church_membership?.district_origin,
          },
          { label: "Local Origin", value: church_membership?.local_origin },
          {
            label: "District Assignment",
            value: church_membership?.district_assignment,
          },
          {
            label: "Local Assignment",
            value: church_membership?.local_assignment,
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
          gridTemplateColumns: "1fr 1fr", // two equal columns for Father and Mother
          gap: "6px",
        }}
      >
        {["father", "mother"].map((parentType) => (
          <div
            key={parentType}
            style={{
              display: "grid",
              gridTemplateRows: "auto auto auto", // 3 rows for general info
              gap: "6px",
            }}
          >
            {[
              {
                label: `${
                  parentType === "father" ? "Father's" : "Mother's"
                } Name`,
                value: parents?.[`${parentType}_name`],
              },
              {
                label: `${
                  parentType === "father" ? "Father's" : "Mother's"
                } District`,
                value: parents?.[`${parentType}_district`],
              },

              // Grouping Date of Birth and Contact No. in the same row
              {
                label: `${
                  parentType === "father" ? "Father's" : "Mother's"
                } Date of Birth`,
                value: parents?.[`${parentType}_birthdate`],
                isPair: true,
                pairLabel: `${
                  parentType === "father" ? "Father's" : "Mother's"
                } Contact No.`,
                pairValue: parents?.[`${parentType}_contact`],
              },

              // Grouping Civil Status and Citizenship in the same row
              {
                label: `${
                  parentType === "father" ? "Father's" : "Mother's"
                } Civil Status`,
                value: parents?.[`${parentType}_civil_status`],
                isPair: true,
                pairLabel: `${
                  parentType === "father" ? "Father's" : "Mother's"
                } Citizenship`,
                pairValue: parents?.[`${parentType}_citizenship`],
              },
            ].map((item, index) => {
              if (item.isPair) {
                return (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr", // Two columns for paired items
                      gap: "6px",
                    }}
                  >
                    <div
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
                    <div
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
                      {item.pairValue || "N/A"}
                      <div
                        style={{
                          fontWeight: "normal",
                          fontSize: "0.7rem",
                          color: "#555",
                          marginTop: "2px",
                        }}
                      >
                        {item.pairLabel}
                      </div>
                    </div>
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
        Spouse Information
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // Two columns for spouse and children
          gap: "6px",
        }}
      >
        {[
          { label: "Spouse", value: spouse?.surname_husband || spouse?.name },
          { label: "Wedding Date", value: spouse?.wedding_date },
          { label: "Citizenship", value: spouse?.citizenship },
          { label: "Ethnicity", value: spouse?.ethnicity },
          { label: "District", value: spouse?.district },
          { label: "Occupation", value: spouse?.occupation },

          // Grouping Date of Birth and Contact Number in the same row
          {
            label: "Date Of Birth",
            value: spouse?.birthdate,
            isPair: true,
            pairLabel: "Contact Number",
            pairValue: spouse?.contact_number,
          },
        ].map((item, index) => {
          if (item.isPair) {
            return (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr", // Two columns for paired items
                  gap: "6px",
                }}
              >
                <div
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
                <div
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
                  {item.pairValue || "N/A"}
                  <div
                    style={{
                      fontWeight: "normal",
                      fontSize: "0.7rem",
                      color: "#555",
                      marginTop: "2px",
                    }}
                  >
                    {item.pairLabel}
                  </div>
                </div>
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
        Children
      </h4>

      {children.length > 0 ? (
        children.map((child, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {[
              { label: "Name", value: child.name },
              { label: "Gender", value: child.gender },
              { label: "Age", value: child.age },
              { label: "Occupation", value: child.occupation },
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
                  marginTop: "0.5rem",
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
