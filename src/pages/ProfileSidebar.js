// components/ProfileSidebar.js
import React from "react";
import "./ProfileSidebar.css";

const ProfileSidebar = ({ personnel }) => {
  return (
    <div className="profile-sidebar">
      <div className="avatar-container">
        <img
          src={personnel.avatarUrl || "/default-avatar.png"}
          alt="Avatar"
          className="avatar"
        />
      </div>

      <div className="section">
        <h3>📞 Contact</h3>
        <p>📧 {personnel.email}</p>
        <p>📱 {personnel.phone}</p>
        <p>📍 {personnel.address}</p>
        {/* Add socials as needed */}
      </div>

      <div className="section">
        <h3>🎓 Education</h3>
        {personnel.education.map((edu, i) => (
          <p key={i}>
            {edu.school} ({edu.yearRange})
          </p>
        ))}
      </div>

      <div className="section">
        <h3>💼 Work Experience</h3>
        {personnel.experience.map((exp, i) => (
          <p key={i}>
            {exp.position} - {exp.company} ({exp.years})
          </p>
        ))}
      </div>

      <div className="section">
        <h3>🛠 Skills & Training</h3>
        {personnel.skills.map((skill, i) => (
          <p key={i}>
            {skill.name} - {skill.dateTrained}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ProfileSidebar;
