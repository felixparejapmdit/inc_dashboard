import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react"; // Icons used in image layout

const ProfileSidebar = ({ personnel }) => {
  if (!personnel) return <div>No personnel data found.</div>;

  const {
    profile_photo_path,
    email,
    mobile_number,
    address,
    username,
    educations = [],
    work_experiences = [],
    trainings = [],
  } = personnel;

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
      <div style={{ ...sectionStyle }}>
        <h4 style={{ ...itemTitleStyle }}>Contact</h4>
        <div style={{ marginTop: "0.75rem" }}>
          <p style={subTextStyle}>
            <Mail size={16} /> &nbsp; {email || "1234567890"}
          </p>
          <p style={subTextStyle}>
            <Phone size={16} /> &nbsp; {mobile_number || "1234567890"}
          </p>
          <p style={subTextStyle}>
            <MapPin size={16} /> &nbsp; {address || "1234567890"}
          </p>
          <p style={subTextStyle}>
            <Send size={16} /> &nbsp; @{username || "username"}
          </p>
        </div>
      </div>

      {/* Education Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Education</h4>
        {educations.map((edu, idx) => (
          <div key={idx} style={{ marginTop: "0.5rem" }}>
            <p style={{ fontWeight: "normal" }}>
              {edu.course || "Field of Study"}
            </p>
            <p style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
              {edu.school_name}
            </p>
            <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
              {edu.year_range}
            </p>
          </div>
        ))}
      </div>

      {/* Work Experience Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Work Experience</h4>
        {work_experiences.map((job, idx) => (
          <div key={idx} style={{ marginTop: "0.5rem" }}>
            <p style={{ fontWeight: "bold" }}>{job.position}</p>
            <p style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
              {job.company}
            </p>
            <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
              {job.years}
            </p>
          </div>
        ))}
      </div>

      {/* Skills & Training Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Skills and Training</h4>
        {trainings.map((train, idx) => (
          <div key={idx} style={{ marginTop: "0.5rem" }}>
            <p style={{ fontWeight: "bold" }}>{train.skill}</p>
            <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
              {train.date_trained}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSidebar;
