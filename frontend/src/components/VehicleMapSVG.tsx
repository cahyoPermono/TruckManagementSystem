import { useEffect, useRef } from "react"

export function VehicleMapSVG() {
  const truckRef = useRef<SVGGElement>(null)

  // Simple CSS animation for moving the truck along the path.
  // In a real application, this would be updated via Zustand/WebSocket data from logs.
  useEffect(() => {
    if (!truckRef.current) return
    const el = truckRef.current
    el.style.offsetPath = "path('M 50 350 Q 200 50, 400 200 T 750 150')"
    el.style.animation = "moveTrack 15s linear infinite"
  }, [])

  return (
    <>
      <style>{`
        @keyframes moveTrack {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.4; r: 4; }
          50% { opacity: 1; r: 6; }
        }
      `}</style>
      <svg
        viewBox="0 0 800 450"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Truck Head Definition */}
          <g id="truckHead">
            <rect x="-15" y="-10" width="30" height="20" rx="4" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
            <rect x="5" y="-8" width="8" height="16" fill="#1e3a8a" />
            {/* Windshield glow */}
            <path d="M 8 -6 L 12 -6 L 12 6 L 8 6 Z" fill="#93c5fd" opacity="0.8" />
            {/* Wheels */}
            <rect x="-10" y="-12" width="6" height="4" rx="1" fill="#0f172a" />
            <rect x="-10" y="8" width="6" height="4" rx="1" fill="#0f172a" />
            <rect x="5" y="-12" width="6" height="4" rx="1" fill="#0f172a" />
            <rect x="5" y="8" width="6" height="4" rx="1" fill="#0f172a" />
          </g>

          {/* Chassis Definition */}
          <g id="chassisTrailer">
            <rect x="-25" y="-8" width="40" height="16" fill="#475569" stroke="#64748b" strokeWidth="1" />
            <circle cx="15" cy="0" r="3" fill="#94a3b8" /> {/* Connector point */}
            {/* Wheels */}
            <rect x="-20" y="-10" width="8" height="4" rx="1" fill="#0f172a" />
            <rect x="-20" y="6" width="8" height="4" rx="1" fill="#0f172a" />
            <rect x="-10" y="-10" width="8" height="4" rx="1" fill="#0f172a" />
            <rect x="-10" y="6" width="8" height="4" rx="1" fill="#0f172a" />
          </g>
        </defs>

        {/* Map Route Path */}
        <path
          d="M 50 350 Q 200 50, 400 200 T 750 150"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 50 350 Q 200 50, 400 200 T 750 150"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="8 8"
          strokeLinecap="round"
        />

        {/* Waypoints */}
        <circle cx="50" cy="350" fill="#3b82f6" className="origin-center animate-[pulseDot_2s_ease-in-out_infinite]" />
        <circle cx="400" cy="200" fill="#f59e0b" className="origin-center animate-[pulseDot_2.5s_ease-in-out_infinite]" />
        <circle cx="750" cy="150" fill="#10b981" className="origin-center animate-[pulseDot_3s_ease-in-out_infinite]" />

        {/* Animated Truck Setup */}
        <g ref={truckRef} style={{ offsetRotate: "auto" }}>
          <use href="#truckHead" x="0" y="0" />
          <use href="#chassisTrailer" x="-30" y="0" />
          <use href="#chassisTrailer" x="-75" y="0" />
          
          {/* Label Tooltip */}
          <g transform="translate(0, -30)">
            <rect x="-25" y="-12" width="50" height="18" rx="4" fill="#1e293b" opacity="0.9" />
            <text x="0" y="0" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
              THEAD-12
            </text>
          </g>
        </g>
      </svg>
    </>
  )
}
