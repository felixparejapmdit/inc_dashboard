// components/Tutorial.js
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";

const Tutorial = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // ✅ Move style objects before usage
  const contentStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.95rem",
    lineHeight: "1.4",
  };

  const imageStyle = {
    width: "30px",
    height: "30px",
    flexShrink: 0,
  };

  const steps = [
    {
      target: '[data-tour="dashboard"]',
      content: (
        <div style={contentStyle}>
          <img
            src="/images/hand-pointer.png"
            alt="hand pointer"
            style={imageStyle}
          />
          <span>
            I-click ito para pumunta sa iyong <strong>Dashboard</strong>.
          </span>
        </div>
      ),
    },
    {
      target: '[data-tour="profile-settings"]',
      content: (
        <div style={contentStyle}>
          <img
            src="/images/hand-pointer.png"
            alt="hand pointer"
            style={imageStyle}
          />
          <span>
            Dito mo makikita ang iyong <strong>Profile settings</strong>.
          </span>
        </div>
      ),
    },
    {
      target: '[data-tour="schedule-button"]',
      content: (
        <div style={contentStyle}>
          <img
            src="/images/hand-pointer.png"
            alt="hand pointer"
            style={imageStyle}
          />
          <span>
            I-click ito para gumawa o tingnan ang iyong{" "}
            <strong>Schedule</strong>.
          </span>
        </div>
      ),
    },
    {
      target: '[data-tour="logout"]',
      content: (
        <div style={contentStyle}>
          <img
            src="/images/hand-pointer.png"
            alt="hand pointer"
            style={imageStyle}
          />
          <span>
            I-click ito para mag-<strong>Logout</strong>.
          </span>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status);
    if (finished) {
      localStorage.setItem("hasSeenTutorial", "true");
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      showSkipButton={true}
      continuous={true}
      scrollToFirstStep={true}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: "#f57c00",
          backgroundColor: "#fff8e1",
          textColor: "#000",
          primaryColor: "#f57c00",
          width: 300,
        },
      }}
    />
  );
};

export default Tutorial;
