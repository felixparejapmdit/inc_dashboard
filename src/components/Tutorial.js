import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";

const StepContent = ({ img, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <img src={img} alt="pointer" style={{ width: 30, height: 30 }} />
    <span style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>{text}</span>
  </div>
);

const Tutorial = () => {
  const [run, setRun] = useState(false);

  const steps = [
    {
      target: '[data-tour="dashboard"]',
      content: (
        <StepContent
          img="/images/hand-pointer.png"
          text="I-click ito para pumunta sa iyong Dashboard."
        />
      ),
    },
    {
      target: '[data-tour="profile-settings"]',
      content: (
        <StepContent
          img="/images/hand-pointer.png"
          text="Dito mo makikita ang iyong Profile settings."
        />
      ),
    },
    {
      target: '[data-tour="share-link"]',
      content: (
        <StepContent
          img="/images/hand-pointer.png"
          text="I-click ito para gumawa o tingnan ang iyong Schedule."
        />
      ),
    },
    {
      target: '[data-tour="logout"]',
      content: (
        <StepContent
          img="/images/hand-pointer.png"
          text="I-click ito para mag-Logout."
        />
      ),
    },
  ];

  useEffect(() => {
    const seen = localStorage.getItem("hasSeenTutorial");

    const waitForTargets = () => {
      const allExist = steps.every((step) =>
        document.querySelector(step.target)
      );

      if (!seen && allExist) {
        setRun(true);
      } else if (!seen) {
        setTimeout(waitForTargets, 300); // Retry check
      }
    };

    const timer = setTimeout(waitForTargets, 500); // Wait for layout/rendering
    return () => clearTimeout(timer);
  }, []);

  const handleCallback = ({ status }) => {
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status);
    if (finished) {
      localStorage.setItem("hasSeenTutorial", "true");
    }
  };

  return (
    <Joyride
      run={run}
      steps={steps}
      callback={handleCallback}
      showSkipButton
      continuous
      scrollToFirstStep
      disableOverlayClose
      styles={{
        options: {
          arrowColor: "#f57c00",
          backgroundColor: "#fffde7",
          primaryColor: "#f57c00",
          textColor: "#000",
          zIndex: 9999,
        },
      }}
    />
  );
};

export default Tutorial;
