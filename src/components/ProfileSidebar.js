import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ProfileSidebar = ({
  personnel,
  personnelContact = {},
  personnelEducationalBackground,
  personnelWorkExperience,
}) => {
  if (!personnel) return <div>No personnel data found.</div>;

  const { profile_photo_path, username } = personnel;

  const { email, mobile_number, address } = personnelContact;

  // Ensure fallback to empty arrays if null/undefined
  const educationList = Array.isArray(personnelEducationalBackground)
    ? personnelEducationalBackground
    : [];

  const workList = Array.isArray(personnelWorkExperience)
    ? personnelWorkExperience
    : [];

  const sectionStyle = {
    borderTop: "1px solid #fff",
    paddingTop: "1rem",
    marginTop: "1rem",
  };

  const itemTitleStyle = {
    fontWeight: "bold",
    fontSize: "0.85rem",
    textTransform: "uppercase",
  };

  const subTextStyle = {
    fontWeight: "normal",
    fontSize: "0.8rem",
    marginBottom: "0.5rem",
  };

  return (
    <div
      style={{
        width: "280px",
        background: "#f57c00",
        color: "#fff",
        padding: "2rem 1.5rem",
        fontFamily: "Arial, sans-serif",
        fontSize: "0.9rem",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            margin: "0 auto",
            background: "#2196f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={profile_photo_path || "/default-avatar.png"}
            alt="Avatar"
            style={{ width: "60%", borderRadius: "50%" }}
          />
        </div>
      </div>

      {/* Contact Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Contact</h4>
        <div style={{ marginTop: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <Mail size={16} style={{ marginRight: "0.5rem" }} />
            <span style={subTextStyle}>{email || "No email"}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <Phone size={16} style={{ marginRight: "0.5rem" }} />
            <span style={subTextStyle}>{mobile_number || "No phone"}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <MapPin size={16} style={{ marginRight: "0.5rem" }} />
            <span style={subTextStyle}>{address || "No address"}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <Send size={16} style={{ marginRight: "0.5rem" }} />
            <span style={subTextStyle}>@{username || "username"}</span>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Education</h4>
        {educationList.length === 0 && (
          <p style={subTextStyle}>No education data</p>
        )}
        {educationList.map((edu, idx) => (
          <div key={idx} style={{ marginTop: "0.5rem" }}>
            <p style={{ fontWeight: "normal" }}>{edu.course || "No course"}</p>
            <p style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
              {edu.school_name || "No school name"}
            </p>
            <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
              {edu.start_year} - {edu.end_year}
            </p>
          </div>
        ))}
      </div>

      {/* Work Experience Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Work Experience</h4>
        {workList.length === 0 && (
          <p style={subTextStyle}>No work experience data</p>
        )}
        {workList.map((job, idx) => (
          <div key={idx} style={{ marginTop: "0.5rem" }}>
            <p style={{ fontWeight: "bold" }}>
              {job.position_title || "No position"}
            </p>
            <p style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
              {job.company_name || "No company name"}
            </p>
            <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
              {job.start_year} - {job.end_year}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSidebar;
