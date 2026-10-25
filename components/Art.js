// Hand-drawn style SVG pieces inspired by the invitation: tree branch, beehive,
// buzzing bees, a honey pot, a balloon and the scalloped "RSVP" cloud.

const BROWN = "#6E4A1F";
const HONEY = "#E9B451";
const HONEY_LIGHT = "#F6D488";

export function Bee({ x = 0, y = 0, scale = 1, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx="-3" cy="-9" rx="6" ry="8" fill="#fff" stroke={BROWN} strokeWidth="1.2" opacity=".9" transform="rotate(-20 -3 -9)" />
      <ellipse cx="4" cy="-9" rx="5" ry="7" fill="#fff" stroke={BROWN} strokeWidth="1.2" opacity=".9" transform="rotate(20 4 -9)" />
      <ellipse cx="0" cy="0" rx="10" ry="7" fill={HONEY} stroke={BROWN} strokeWidth="1.4" />
      <path d="M-3 -6.5 Q-1 0 -3 6.5 M2.5 -6.8 Q4.5 0 2.5 6.8" stroke={BROWN} strokeWidth="2.2" fill="none" />
      <circle cx="8" cy="-1" r="1.1" fill={BROWN} />
      <path d="M-10 0 l-4 1" stroke={BROWN} strokeWidth="1.4" />
    </g>
  );
}

export function BranchWithHive(props) {
  return (
    <svg viewBox="0 0 420 300" aria-hidden="true" {...props}>
      {/* leaves */}
      <g opacity=".95">
        <path d="M10 20 C30 -10 120 -10 170 10 C220 0 280 10 300 40 C320 70 290 100 250 96 C230 120 170 120 140 104 C110 120 50 116 30 92 C0 84 -10 50 10 20Z" fill="#A9BC84" />
        <path d="M40 30 C70 10 130 14 160 30 C200 18 250 26 270 50 C250 78 200 80 170 72 C130 90 80 86 50 70 C30 60 26 44 40 30Z" fill="#8FA56C" opacity=".75" />
        <path d="M70 40 C100 30 140 34 160 46 C180 40 220 44 236 56 C210 66 180 64 160 60 C130 70 96 66 74 56Z" fill="#7C935A" opacity=".55" />
        <g stroke="#55683A" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".7">
          <path d="M60 36 l14 8 M90 22 l10 12 M130 30 l6 14 M180 26 l-4 14 M220 36 l-10 10 M250 54 l-14 4 M110 62 l12 -6 M150 74 l8 -10 M200 70 l-6 -10 M70 70 l12 -4 M40 56 l14 0" />
        </g>
      </g>
      {/* branch */}
      <path d="M150 96 C190 110 230 112 262 126 C292 140 330 150 360 182 L352 190 C324 164 292 156 262 146 C228 134 196 124 160 112Z" fill="#8A5A34" stroke={BROWN} strokeWidth="2" strokeLinejoin="round" />
      <path d="M262 132 C258 112 266 100 280 90 L286 96 C274 106 270 118 272 134Z" fill="#8A5A34" stroke={BROWN} strokeWidth="2" />
      {/* string */}
      <path d="M300 150 Q302 175 300 196" stroke="#9AA3A8" strokeWidth="2" fill="none" />
      {/* hive */}
      <g transform="translate(300 196)" stroke={BROWN} strokeWidth="2">
        <ellipse cx="0" cy="8" rx="16" ry="9" fill={HONEY_LIGHT} />
        <ellipse cx="0" cy="22" rx="28" ry="11" fill={HONEY} />
        <ellipse cx="0" cy="38" rx="36" ry="12" fill={HONEY_LIGHT} />
        <ellipse cx="0" cy="55" rx="38" ry="12" fill={HONEY} />
        <ellipse cx="0" cy="71" rx="32" ry="11" fill={HONEY_LIGHT} />
        <ellipse cx="0" cy="85" rx="20" ry="8" fill={HONEY} />
        <ellipse cx="-4" cy="46" rx="7" ry="8" fill="#3A2810" />
      </g>
    </svg>
  );
}

export function BeeTrail(props) {
  return (
    <svg viewBox="0 0 300 200" aria-hidden="true" {...props}>
      <path d="M20 150 C60 110 90 170 120 130 C150 90 110 70 140 60 C180 46 200 100 240 70" stroke={BROWN} strokeWidth="1.5" strokeDasharray="5 6" fill="none" opacity=".6" />
      <Bee x={258} y={60} scale={1.4} />
      <path d="M60 40 C90 20 120 50 150 30" stroke={BROWN} strokeWidth="1.5" strokeDasharray="5 6" fill="none" opacity=".6" />
      <Bee x={46} y={46} scale={1} flip />
    </svg>
  );
}

export function Balloon(props) {
  return (
    <svg viewBox="0 0 100 220" aria-hidden="true" {...props}>
      <defs>
        <radialGradient id="bal" cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#FFF1CF" />
          <stop offset=".55" stopColor="#FCD99A" />
          <stop offset="1" stopColor="#EDB765" />
        </radialGradient>
      </defs>
      <path d="M50 108 C46 130 58 150 48 170 C40 186 54 200 50 220" stroke="#8C7A66" strokeWidth="1.5" fill="none" />
      <path d="M50 4 C78 4 94 28 94 54 C94 82 70 104 50 108 C30 104 6 82 6 54 C6 28 22 4 50 4Z" fill="url(#bal)" stroke="#C99A55" strokeWidth="1.5" />
      <path d="M44 108 l6 8 l6 -8Z" fill="#EDB765" />
      <ellipse cx="32" cy="34" rx="8" ry="13" fill="#fff" opacity=".45" transform="rotate(20 32 34)" />
    </svg>
  );
}

export function HoneyPot(props) {
  return (
    <svg viewBox="0 0 140 130" aria-hidden="true" {...props}>
      <ellipse cx="70" cy="120" rx="60" ry="8" fill={HONEY} opacity=".55" />
      <path d="M30 40 C14 60 14 100 36 116 C56 126 86 126 104 116 C126 100 126 60 110 40Z" fill="#9B6A3C" stroke={BROWN} strokeWidth="2.5" />
      <path d="M26 30 h88 a6 6 0 0 1 0 14 h-88 a6 6 0 0 1 0 -14Z" fill="#B07A47" stroke={BROWN} strokeWidth="2.5" />
      <path d="M30 58 h80 v26 h-80Z" fill="#A9C7BE" stroke={BROWN} strokeWidth="2" opacity=".95" />
      <path d="M36 32 C40 18 60 14 70 22 C80 12 102 18 104 32 C100 40 96 50 98 62 C94 70 88 66 88 56 C88 46 80 44 76 52 C72 60 64 58 64 48 C62 40 50 40 50 50 C50 56 42 58 40 50 C38 44 36 40 36 32Z" fill={HONEY} stroke={BROWN} strokeWidth="2" />
      <text x="70" y="77" textAnchor="middle" fontSize="13" fill={BROWN} fontFamily="var(--font-hand), sans-serif">HUNNY</text>
    </svg>
  );
}

export function Cloud() {
  return (
    <svg viewBox="0 0 190 150" aria-hidden="true">
      <path
        d="M40 40 C40 18 68 10 80 24 C88 6 118 6 124 26 C140 12 168 24 160 46 C182 50 186 78 168 88 C184 102 172 130 148 124 C142 146 110 148 100 132 C88 148 56 146 52 126 C28 136 8 112 22 96 C2 86 6 54 30 56 C28 50 32 44 40 40Z"
        fill="#F3E3B0"
        stroke={BROWN}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICON_PATHS = {
  Feeding: (
    <>
      <rect x="22" y="22" width="20" height="36" rx="7" />
      <path d="M24 22 v-4 h16 v4 M28 18 c0 -6 8 -6 8 0" />
      <path d="M22 34 h8 M22 42 h8 M22 50 h8" />
    </>
  ),
  Sleeping: (
    <>
      <path d="M40 12 a20 20 0 1 0 14 34 a16 16 0 1 1 -14 -34Z" />
      <path d="M48 16 h6 l-6 7 h6 M54 26 h4 l-4 5 h4" />
    </>
  ),
  Diapering: (
    <>
      <path d="M12 22 h40 v6 c0 14 -10 24 -20 24 s-20 -10 -20 -24Z" />
      <path d="M12 28 c6 0 10 4 10 10 M52 28 c-6 0 -10 4 -10 10" />
      <circle cx="32" cy="28" r="2.5" />
    </>
  ),
  Bathing: (
    <>
      <path d="M20 40 c-8 0 -10 -10 -4 -14 c-4 -10 8 -16 14 -10 c4 -4 12 -2 12 6 l8 -2 l-4 6 c8 2 10 14 0 18Z" />
      <circle cx="28" cy="22" r="1.5" />
      <path d="M8 48 q8 -4 16 0 t16 0 t16 0" />
    </>
  ),
  "Baby Gear": (
    <>
      <path d="M14 18 c0 18 10 24 24 24 h12 c0 -14 -10 -24 -24 -24Z" />
      <path d="M14 18 v24 h36 M50 42 l6 -14 h4" />
      <circle cx="22" cy="50" r="5" />
      <circle cx="44" cy="50" r="5" />
    </>
  ),
  "Health & Safety": (
    <>
      <path d="M32 54 C10 40 8 22 20 16 c6 -3 10 0 12 6 c2 -6 6 -9 12 -6 c12 6 10 24 -12 38Z" />
      <path d="M32 26 v14 M25 33 h14" />
    </>
  ),
  "Baby Clothing": (
    <>
      <path d="M22 12 l-12 8 l6 10 l6 -3 v16 c0 6 4 10 10 10 s10 -4 10 -10 v-16 l6 3 l6 -10 l-12 -8 c-2 6 -6 8 -10 8 s-8 -2 -10 -8Z" />
      <path d="M28 48 h8" />
    </>
  ),
  Playtime: (
    <>
      <rect x="10" y="32" width="20" height="20" rx="3" />
      <rect x="34" y="32" width="20" height="20" rx="3" />
      <rect x="22" y="10" width="20" height="20" rx="3" />
      <path d="M16 38 l8 8 M24 38 l-8 8 M40 42 h8 M32 16 v8 M28 20 h8" />
    </>
  ),
  "For Mom-to-Be": (
    <>
      <circle cx="32" cy="30" r="6" />
      <path d="M32 24 c-4 -10 4 -14 6 -8 c6 -4 12 4 4 8 c8 2 6 12 -2 10 c2 8 -8 10 -8 2 c-4 8 -14 4 -8 -2 c-8 0 -8 -10 0 -10 c-6 -6 2 -12 8 0Z" />
      <path d="M32 40 v16 M32 50 c4 -4 8 -4 10 -2" />
    </>
  ),
  "Gift Cards": (
    <>
      <rect x="10" y="20" width="44" height="30" rx="5" />
      <path d="M10 30 h44 M24 20 v30" />
      <path d="M24 30 c-6 -8 -12 -2 -6 0 M24 30 c6 -8 12 -2 6 0" />
    </>
  ),
};

export function CategoryIcon({ category }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke={BROWN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".7">
      {ICON_PATHS[category] || ICON_PATHS["Gift Cards"]}
    </svg>
  );
}
