import Svg, { Rect, Path, Circle } from 'react-native-svg';

const DigiScribeLogo = ({ size = 72 }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Rect x="4" y="4" width="120" height="120" rx="36" fill="#cfe7ff" />

    {/* stylized bars */}
    <Rect x="22" y="38" width="50" height="16" rx="8" fill="#3a7adf" />
    <Rect x="22" y="62" width="40" height="16" rx="8" fill="#4c8ef5" />
    <Rect x="22" y="86" width="30" height="16" rx="8" fill="#6aa8f3" />

    {/* accent block */}
    <Rect x="28" y="32" width="46" height="70" rx="12" stroke="#93c5fd" strokeWidth="3" fill="none" />

    {/* Eye outline */}
    <Path
      d="M82 34 C104 44 114 60 114 74 C114 88 104 104 82 114"
      stroke="#0b1f3a"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M60 34 C82 44 92 60 92 74 C92 88 82 104 60 114"
      stroke="#0b1f3a"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />

    {/* Pupil */}
    <Circle cx="88" cy="74" r="14" fill="#0b1f3a" />
    <Path
      d="M86 66 L94 74 L86 82"
      stroke="#5bc4ff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="98" cy="64" r="4" fill="#a4d2ff" />
  </Svg>
);

export default DigiScribeLogo;
