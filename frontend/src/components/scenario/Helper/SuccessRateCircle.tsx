import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const SuccessRateCircle = ({ final_success }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = start + (final_success - start) * progress;
      setAnimatedValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [final_success]);

  return (
    <div style={{ width: 200, height: 200, position: "relative" }}>
      <CircularProgressbar
        value={animatedValue}
        text={""}
        strokeWidth={14}
        background
        backgroundPadding={6}
        styles={buildStyles({
          backgroundColor: "#f0f0f0", // full background fill
          trailColor: "transparent",  // hide the default trail
          pathColor: "#007940",
        })}
      />
      {/* Text overlay */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          fontSize: "20px",
          color: "#000",
          lineHeight: "1.3",
          fontWeight: "bold",
        }}
      >
        <div>{`${animatedValue.toFixed(2)}%`}</div>
        <div>Success Rate</div>
      </div>
    </div>
  );
};

export default SuccessRateCircle;