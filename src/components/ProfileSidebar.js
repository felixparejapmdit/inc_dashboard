import React from "react";
import { Phone, Send, Instagram, MapPin, Facebook } from "lucide-react";

// Configuration for API URLs
const API_URL = process.env.REACT_APP_API_URL; // API URL

const ProfileSidebar = ({
  personnel,
  personnelImage = {},
  personnelContact = [],
  personnelEducationalBackground = [],
  personnelWorkExperience = [],
}) => {
  if (!personnel) return <div>Loading personnel data...</div>;

  const { twoByTwo } = personnelImage || {};
  const { username } = personnel;

  // Divider style seen in image (line between sections)
  const dividerStyle = {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.4)",
    margin: "1rem 0",
    width: "100%",
  };

  const sectionStyle = {
    paddingTop: "0",
    marginTop: "0",
  };

  const itemTitleStyle = {
    fontWeight: "bold",
    fontSize: "0.85rem", // Reduced
    textTransform: "uppercase",
    marginBottom: "0.3rem",
    color: "#fff",
  };

  const textStyle = {
    fontSize: "0.75rem", // Reduced
    color: "#fff",
    marginBottom: "0.15rem",
    lineHeight: "1.3",
  };

  const boldTextStyle = {
    fontSize: "0.8rem", // Reduced
    color: "#fff",
    fontWeight: "bold",
    marginBottom: "0.1rem",
    lineHeight: "1.3",
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
  const facebookData = getContactByType(3);
  const instagramData = getContactByType(4);

  const telephone =
    personnelContact && Array.isArray(personnelContact)
      ? personnelContact.find(
        (c) => c.contactype_id === 5 && (c.contact_location || c.extension)
      )
      : null;

  const formatYear = (val) => {
    if (!val) return "";
    const str = String(val);

    // Check if it's already a year (4 digits)
    if (/^\d{4}$/.test(str)) return str;

    // Check if it's YYYY-MM-DD
    const dateMatch = str.match(/^(\d{4})-\d{2}-\d{2}/);
    if (dateMatch) return dateMatch[1]; // Return just the year part

    // Fallback to Date parse
    const d = new Date(val);
    return !isNaN(d.getTime()) ? d.getFullYear() : str;
  };

  return (
    <div
      className="profile-sidebar"
      style={{
        width: "240px", // Reduced width
        minWidth: "240px",
        background: "linear-gradient(180deg, #fb923c 0%, #ea580c 100%)", // Orange gradient
        color: "#fff",
        padding: "1.25rem 0.85rem", // Tighter padding
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        fontSize: "0.75rem", // Base font size reduced further
        minHeight: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Profile Image (2x2 Picture) */}
      <div style={{ textAlign: "center", marginBottom: "0.85rem" }}>
        <div
          style={{
            width: 90, // Scaled down to 90
            height: 90, // Scaled down to 90
            borderRadius: "50%",
            margin: "0 auto",
            overflow: "hidden",
            border: "none",
            marginBottom: "0.4rem"
          }}
        >
          <img
            src={
              twoByTwo
                ? `${API_URL}${twoByTwo}`
                : "/default-avatar.png"
            }
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = "/default-avatar.png";
            }}
            alt={username}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      <div style={dividerStyle}></div>

      {/* Contact Info */}
      <div style={sectionStyle}>
        <div style={itemTitleStyle}>
          Contact
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Phone size={16} color="#fff" strokeWidth={2} />
            <span style={textStyle}>{cellphone ? cellphone.contact_info : "N/A"}</span>
          </div>

          {telegram && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Send size={16} color="#fff" strokeWidth={2} />
              <span style={textStyle}>Telegram: {telegram.contact_info}</span>
            </div>
          )}

          {telephone && (
            <div style={{ display: "flex", alignItems: "start", gap: "0.6rem" }}>
              <MapPin size={16} color="#fff" strokeWidth={2} style={{ marginTop: 2 }} />
              <div>
                <div style={textStyle}>{telephone.contact_location}</div>
                {telephone.extension && <div style={textStyle}>Ext: {telephone.extension}</div>}
              </div>
            </div>
          )}

          {facebookData && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Facebook size={16} color="#fff" strokeWidth={2} />
              <span style={textStyle}>{facebookData.contact_info}</span>
            </div>
          )}

          {instagramData && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Instagram size={16} color="#fff" strokeWidth={2} />
              <span style={textStyle}>{instagramData.contact_info}</span>
            </div>
          )}
        </div>
      </div>

      <div style={dividerStyle}></div>

      {/* Education */}
      <div style={sectionStyle}>
        <div style={itemTitleStyle}>Education</div>
        {personnelEducationalBackground &&
          personnelEducationalBackground.length > 0 ? (
          personnelEducationalBackground.map((edu, index) => {
            // Correct Mapping based on provided Model
            const schoolName = edu.school || edu.institution || edu.school_name || "";
            const courseName = edu.degree || edu.field_of_study || edu.course || "";
            const yearGrad = formatYear(edu.completion_year || edu.year_graduated);
            const yearStart = formatYear(edu.startfrom || edu.start_year); // Model uses 'startfrom'

            const eduPeriod = yearStart && yearGrad ? `${yearStart} - ${yearGrad}` : (yearGrad || yearStart || "");

            return (
              <div key={index} style={{ marginBottom: "0.75rem" }}>
                <div style={textStyle}>{courseName}</div>
                <div style={boldTextStyle}>{schoolName}</div>
                <div style={textStyle}>
                  {eduPeriod}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>No education data.</div>
        )}
      </div>

      <div style={dividerStyle}></div>

      {/* Work Experience */}
      <div style={sectionStyle}>
        <div style={itemTitleStyle}>Work Experience</div>
        {personnelWorkExperience && personnelWorkExperience.length > 0 ? (
          personnelWorkExperience.map((work, index) => {
            const startYear = formatYear(work.start_year || work.start_date || work.from_year);
            const endYearRaw = work.end_year || work.end_date || work.to_year;
            const endYear = endYearRaw ? formatYear(endYearRaw) : "Present";
            const company = work.company_name || work.company || "";

            return (
              <div key={index} style={{ marginBottom: "0.75rem" }}>
                <div style={textStyle}>{work.position}</div>
                <div style={boldTextStyle}>{company}</div>
                <div style={textStyle}>
                  {startYear} - {endYear}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>No work experience.</div>
        )}
      </div>
    </div>
  );
};
export default ProfileSidebar;
