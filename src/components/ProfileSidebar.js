import React from "react";

const ProfileSidebar = ({ personnel }) => {
  if (!personnel) return <div>No personnel data found.</div>;

  const {
    profile_photo_path,
    email,
    mobile_number,
    address,
    educations = [],
    work_experiences = [],
    trainings = [],
  } = personnel;

  return (
    <div
      style={{
        width: "30%",
        background: "#f57c00",
        color: "#fff",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <img
          src={profile_photo_path || "/default-avatar.png"}
          alt="Avatar"
          style={{ width: 120, height: 120, borderRadius: "50%" }}
        />
      </div>

      <h3>Contact</h3>
      <p>Email: {email || "N/A"}</p>
      <p>Phone: {mobile_number || "N/A"}</p>
      <p>Address: {address || "N/A"}</p>

      <h3>Education</h3>
      {educations.map((edu, idx) => (
        <p key={idx}>
          {edu.school_name} ({edu.year_range})
        </p>
      ))}

      <h3>Work Experience</h3>
      {work_experiences.map((job, idx) => (
        <p key={idx}>
          {job.position} at {job.company} ({job.years})
        </p>
      ))}

      <h3>Skills & Training</h3>
      {trainings.map((train, idx) => (
        <p key={idx}>
          {train.skill} ({train.date_trained})
        </p>
      ))}
    </div>
  );
};

export default ProfileSidebar;
