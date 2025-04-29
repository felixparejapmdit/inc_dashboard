import React from "react";
import { Mail, Phone, MapPin, Send, Instagram } from "lucide-react";

// Configuration for API URLs
const API_URL = process.env.REACT_APP_API_URL; // API URL

const ProfileSidebar = ({
  personnel,
  personnelImage = {},
  personnelContact = [],
  personnelEducationalBackground = [],
  personnelWorkExperience = [],
}) => {
  const { twoByTwo = "", halfBody = "", wholeBody = "" } = personnelImage;
  if (!personnel) return <div>Loading personnel data...</div>;

  const { username } = personnel;

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

  // Helpers
  const getContactByType = (id) => {
    if (!personnelContact || !Array.isArray(personnelContact)) return null;

    return personnelContact.find(
      (c) =>
        c.contactype_id === id &&
        c.contact_info !== "n/a" &&
        c.contact_info !== "-"
    );
  };

  const cellphone = getContactByType(1);
  const telegram = getContactByType(2);
  const facebook = getContactByType(3);
  const instagram = getContactByType(4);

  const telephone =
    personnelContact && Array.isArray(personnelContact)
      ? personnelContact.find(
          (c) => c.contactype_id === 5 && (c.contact_location || c.extension)
        )
      : null;

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
      {/* Profile Image (2x2 Picture) */}
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
            overflow: "hidden",
          }}
        >
          <img
            src={twoByTwo ? `${API_URL}${twoByTwo}` : "/default-avatar.png"}
            alt="2x2 Avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      {/* Contact Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Contact</h4>
        <div style={{ marginTop: "0.75rem" }}>
          {cellphone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <Phone size={16} style={{ marginRight: "0.5rem" }} />
              <span style={subTextStyle}>{cellphone.contact_info}</span>
            </div>
          )}
          {telegram && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <Send size={16} style={{ marginRight: "0.5rem" }} />
              <span style={subTextStyle}>
                Telegram: {telegram.contact_info}
              </span>
            </div>
          )}
          {facebook && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <Send size={16} style={{ marginRight: "0.5rem" }} />
              <span style={subTextStyle}>
                Facebook: {facebook.contact_info}
              </span>
            </div>
          )}
          {instagram && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <Instagram size={16} style={{ marginRight: "0.5rem" }} />
              <span style={subTextStyle}>
                Instagram: {instagram.contact_info}
              </span>
            </div>
          )}
          {telephone && (
            <div
              style={{
                display: "flex",
                alignItems: "start",
                marginBottom: "0.5rem",
              }}
            >
              <MapPin
                size={16}
                style={{ marginRight: "0.5rem", marginTop: "0.2rem" }}
              />
              <div>
                <span style={subTextStyle}>
                  {telephone.contact_location || "N/A"}
                </span>
                {telephone.extension && (
                  <div style={{ fontSize: "0.75rem", color: "#fff" }}>
                    Ext: {telephone.extension}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Education</h4>

        {personnelEducationalBackground &&
        personnelEducationalBackground.length > 0 ? (
          personnelEducationalBackground.map((edu, idx) => (
            <div key={idx} style={{ marginTop: "0.5rem" }}>
              <p style={{ fontWeight: "normal" }}>
                {edu.degree || "No degree specified"}
              </p>
              <p style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                {edu.school || "No school name"}
              </p>
              <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                {edu.startfrom || "Start Year"} -{" "}
                {edu.completion_year || "Completion Year"}
              </p>
            </div>
          ))
        ) : (
          <p style={subTextStyle}>No education data</p>
        )}
      </div>

      {/* Work Experience Section */}
      <div style={sectionStyle}>
        <h4 style={itemTitleStyle}>Work Experience</h4>

        {personnelWorkExperience && personnelWorkExperience.length > 0 ? (
          personnelWorkExperience.map((job, idx) => (
            <div key={idx} style={{ marginTop: "0.5rem" }}>
              <p style={{ fontWeight: "normal" }}>
                {job.position || "No position"}
              </p>
              <p style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                {job.company || "No company name"}
              </p>
              <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                {job.start_date?.substring(0, 4) || "Start Date"} -{" "}
                {job.end_date?.substring(0, 4) || "Present"}
              </p>
            </div>
          ))
        ) : (
          <p style={subTextStyle}>No work experience data</p>
        )}
      </div>
    </div>
  );
};

export default ProfileSidebar;
