import React from 'react';

const RadialProgress = ({ value, max, color = '#00bcd4', size = 120, centerText }) => {
  const radius = size / 2 - 12;
  const stroke = 10;
  const normalizedValue = Math.min(value, max);
  const arcLength = 270; // Degrees for visible arc
  const circumference = 2 * Math.PI * radius;
  const visibleCircumference = (arcLength / 360) * circumference;
  const progress = visibleCircumference - (normalizedValue / max) * visibleCircumference;

  const rotate = 135; // rotate the arc to start at bottom-left

  return (
    <div style={{ width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#23272f', borderRadius: '16px', boxShadow: '0 2px 8px #0002', padding: 8, position: 'relative' }}>
      <svg width={size} height={size} style={{ display: 'block' }}>
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#444851"
          strokeWidth={stroke}
          strokeDasharray={`${visibleCircumference} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${visibleCircumference} ${circumference}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.25,
        pointerEvents: 'none',
        lineHeight: 1.1,
        width: '100%',
        padding: '0 8px'
      }}>
        {centerText}
        <div style={{
          fontWeight: 400,
          fontSize: size * 0.16,
          color: '#b0b6c3',
          marginTop: '2px'
        }}>
          {value} / {max}
        </div>
      </div>
    </div>
  );
};

export default RadialProgress;
