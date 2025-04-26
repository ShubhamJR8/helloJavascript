import React from 'react';

const RadialProgress = ({ value, max, color = '#00bcd4', size = 120, centerText }) => {
  const radius = size / 2 - 12;
  const stroke = 10;
  const normalizedValue = Math.min(value, max);
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (normalizedValue / max) * circumference;

  return (
    <div style={{ width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#23272f', borderRadius: '16px', boxShadow: '0 2px 8px #0002', padding: 8, position: 'relative' }}>
      <svg width={size} height={size} style={{ display: 'block' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#444851"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
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
        fontSize: size * 0.28,
        pointerEvents: 'none',
        lineHeight: 1.1
      }}>
        {centerText}
        <div style={{ color: '#b0b6c3', fontSize: size * 0.16, marginTop: size * 0.08 }}>{label}</div>
        <div style={{ fontWeight: 400, fontSize: size * 0.16, color: '#b0b6c3' }}>{value} / {max}</div>
      </div>
    </div>
  );
};

export default RadialProgress; 