// First-visit intro overlay. Must stay a server component so the overlay is in
// the initial HTML — a client component would flash the real site before
// hydration. Plays once per session; timing lives in globals.css.

// Keep the timeout in sync with the CSS timeline (.gd-camera / .gd-art end ~4.25s).
const INTRO_SCRIPT = `(function(){try{
  var d=document.documentElement;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||sessionStorage.getItem('gd-intro')){return;}
  d.setAttribute('data-intro','play');
  setTimeout(function(){
    try{sessionStorage.setItem('gd-intro','1');}catch(e){}
    d.setAttribute('data-intro','done');
  },4350);
}catch(e){}})();`;

export function IntroGate() {
  return (
    <>
      {/* Inline so it runs during HTML parse, before first paint */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />

      <div aria-hidden="true" className="gd-intro">
        <svg
          className="gd-overlay"
          viewBox="0 0 440 340"
          preserveAspectRatio="xMidYMid slice"
          role="img"
        >
          <defs>
            {/* black rect punches the doorway through to the page behind */}
            <mask id="gd-door-mask">
              <rect x="0" y="0" width="440" height="340" fill="#fff" />
              <rect x="210" y="197" width="20" height="38" fill="#000" />
            </mask>
          </defs>

          <g className="gd-camera">
            <rect
              x="0"
              y="0"
              width="440"
              height="340"
              style={{ fill: "var(--color-sand)" }}
              mask="url(#gd-door-mask)"
            />
          </g>

          {/* line art fades (doesn't scale) on the walk-in */}
          <g className="gd-art" transform="translate(110, 85)">
            {STROKES.map((s, i) => (
              <path
                key={i}
                d={s.d}
                pathLength={1}
                className="gd-stroke"
                style={{ animationDelay: `${s.delay}s` }}
              />
            ))}

            <g className="gd-leaf gd-leaf-left">
              <rect x="100" y="112" width="10" height="38" />
            </g>
            <g className="gd-leaf gd-leaf-right">
              <rect x="110" y="112" width="10" height="38" />
              <circle cx="116" cy="131" r="1.8" className="gd-dot" />
            </g>
          </g>
        </svg>

        <div className="gd-wordmark select-none">
          <p
            className="font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Garvoday
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)]">
            Developers
          </p>
        </div>
      </div>
    </>
  );
}

const STROKES: { d: string; delay: number }[] = [
  { d: "M10 150 H210", delay: 0 }, // ground
  { d: "M55 150 V82", delay: 0.14 }, // left wall
  { d: "M165 150 V82", delay: 0.28 }, // right wall
  { d: "M45 84 L110 36 L175 84", delay: 0.44 }, // roof
  { d: "M140 60 V40 H152 V70", delay: 0.58 }, // chimney
  { d: "M72 96 H98 V122 H72 Z M85 96 V122 M72 109 H98", delay: 0.72 }, // window L
  { d: "M122 96 H148 V122 H122 Z M135 96 V122 M122 109 H148", delay: 0.86 }, // window R
  { d: "M100 150 V112 H120 V150", delay: 1.0 }, // door frame
];
