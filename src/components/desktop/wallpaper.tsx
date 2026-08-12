/**
 * Fixed, no parallax. Four stacked layers, values verbatim from kit 5A: a
 * steep green gradient, a chartreuse glow up and right, a cold blue pool down
 * and left, then the wave paths.
 *
 * The waves are drawn at the kit's 1440×900 and sliced, so the composition
 * holds its proportions at any viewport instead of stretching.
 */
export function Wallpaper() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#0e1f14_0%,#123222_26%,#1c4d2e_46%,#2e6b35_58%,#173a24_76%,#0a1710_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_72%_30%,rgba(201,247,58,.22)_0%,rgba(201,247,58,.05)_38%,transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_18%_78%,rgba(20,60,90,.5)_0%,transparent_60%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M-100 640 C 300 480, 560 760, 900 600 S 1400 420, 1560 520 L 1560 950 L -100 950 Z"
          fill="rgba(8,20,12,.55)"
        />
        <path
          d="M-100 720 C 360 590, 640 830, 1020 690 S 1420 560, 1560 640 L 1560 950 L -100 950 Z"
          fill="rgba(5,12,8,.65)"
        />
        <path
          d="M-100 300 C 340 180, 700 380, 1080 240 S 1440 120, 1560 200"
          stroke="rgba(201,247,58,.14)"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}
