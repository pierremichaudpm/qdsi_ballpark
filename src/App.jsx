import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ─── Catalogue QDSi (noms officiels, profils fictifs mais réalistes) ────────
const INSTALLATIONS = [
  { id: "impulsion", name: "Impulsion", profile: "heavy", crew: 8, mountDays: 5, unmountDays: 3, desc: "Balançoires lumineuses et musicales" },
  { id: "loop", name: "LOOP", profile: "heavy", crew: 6, mountDays: 4, unmountDays: 2, desc: "Zootropes géants mécaniques" },
  { id: "pop", name: "POP!", profile: "medium", crew: 4, mountDays: 3, unmountDays: 2, desc: "Créatures colorées interactives" },
  { id: "spectrum", name: "Spectrum", profile: "medium", crew: 3, mountDays: 3, unmountDays: 2, desc: "Vibrations sonores et lumineuses" },
  { id: "diamants", name: "Les Diamants", profile: "light", crew: 2, mountDays: 2, unmountDays: 1, desc: "Structures géométriques lumineuses" },
  { id: "ilot", name: "Îlot de chaleur", profile: "medium", crew: 4, mountDays: 3, unmountDays: 2, desc: "Archipel d'assises chauffantes" },
  { id: "prisma", name: "Prismaphonik", profile: "light", crew: 2, mountDays: 2, unmountDays: 1, desc: "Harmonies visuelles et sonores" },
  { id: "lucia", name: "Lucia", profile: "heavy", crew: 6, mountDays: 4, unmountDays: 2, desc: "Expérience lumineuse immersive" },
  { id: "prismatica", name: "Prismatica", profile: "medium", crew: 4, mountDays: 3, unmountDays: 2, desc: "Prismes géants pivotants" },
  { id: "iceberg", name: "Iceberg", profile: "medium", crew: 3, mountDays: 3, unmountDays: 2, desc: "Arches lumineuses monumentales" },
  { id: "entre-rangs", name: "Entre les rangs", profile: "light", crew: 3, mountDays: 2, unmountDays: 1, desc: "Tiges lumineuses ondulantes" },
  { id: "domino", name: "Effet Domino", profile: "medium", crew: 4, mountDays: 3, unmountDays: 2, desc: "Dominos lumineux interactifs" },
  { id: "celestia", name: "Celestia", profile: "heavy", crew: 6, mountDays: 4, unmountDays: 2, desc: "Constellation immersive aérienne" },
];

const REGIONS = [
  { id: "qc", name: "Québec / Ontario", flightBase: 0, hotelBase: 180, perDiemBase: 75, transportBase: 2500 },
  { id: "us_east", name: "Est des États-Unis", flightBase: 450, hotelBase: 220, perDiemBase: 90, transportBase: 4500 },
  { id: "us_west", name: "Ouest des États-Unis", flightBase: 650, hotelBase: 250, perDiemBase: 95, transportBase: 8000 },
  { id: "europe_west", name: "Europe de l'Ouest", flightBase: 1100, hotelBase: 200, perDiemBase: 85, transportBase: 12000 },
  { id: "europe_east", name: "Europe de l'Est", flightBase: 950, hotelBase: 140, perDiemBase: 65, transportBase: 14000 },
  { id: "asia", name: "Asie-Pacifique", flightBase: 1800, hotelBase: 180, perDiemBase: 80, transportBase: 22000 },
  { id: "middle_east", name: "Moyen-Orient", flightBase: 1400, hotelBase: 200, perDiemBase: 90, transportBase: 18000 },
];

const SEASONS = [
  { id: "low", name: "Basse saison", multiplier: 0.85 },
  { id: "mid", name: "Saison régulière", multiplier: 1.0 },
  { id: "high", name: "Haute saison", multiplier: 1.25 },
];

const PROFILES = {
  light:  { rentalPerWeek: 2000,  machineryDays: 1, forkliftDays: 1, label: "Légère",  color: "#0693e3" },
  medium: { rentalPerWeek: 3500,  machineryDays: 2, forkliftDays: 2, label: "Moyenne",  color: "#9b51e0" },
  heavy:  { rentalPerWeek: 5500,  machineryDays: 3, forkliftDays: 3, label: "Lourde",   color: "#f78da7" },
};

const DT_DAILY = 850;
const LOCAL_DAILY = 450;
const MACHINERY_DAILY = 600;
const FORKLIFT_DAILY = 350;

// ─── Couleurs QDSi ─────────────────────────────────────────────────────────
const C = {
  bg:        "#06060f",
  card:      "#0c0c1c",
  border:    "#1a1a32",
  text:      "#e8eaf0",
  muted:     "#8892a8",
  dim:       "#505872",
  red:       "#cc2b2b",
  cyan:      "#0693e3",
  purple:    "#9b51e0",
  pink:      "#f78da7",
  accent:    "linear-gradient(135deg, #cc2b2b, #9b51e0)",
  accentAlt: "linear-gradient(135deg, #9b51e0, #f78da7)",
  glow:      "0 0 40px rgba(6, 147, 227, 0.08), 0 0 80px rgba(155, 81, 224, 0.05)",
};

const BAR_COLORS = [
  "#0693e3", "#9b51e0", "#f78da7", "#6ee7b7",
  "#38bdf8", "#c4b5fd", "#fbbf24", "#fb923c", "#f472b6",
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency", currency: "CAD", maximumFractionDigits: 0,
  }).format(n);
}

// ─── Composants ─────────────────────────────────────────────────────────────
function Select({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "11px 36px 11px 14px",
          background: C.bg,
          border: `1px solid ${open ? C.cyan : C.border}`,
          borderRadius: "10px",
          color: selected ? C.text : C.dim,
          fontSize: "14px",
          fontFamily: "'Syne', sans-serif",
          textAlign: "left",
          cursor: "pointer",
          transition: "border-color 0.2s",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {selected ? selected.label : placeholder}
        <span style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          fontSize: "10px", color: C.dim, pointerEvents: "none",
          transition: "transform 0.2s",
          ...(open ? { transform: "translateY(-50%) rotate(180deg)" } : {}),
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "10px",
          maxHeight: 240,
          overflowY: "auto",
          zIndex: 100,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                padding: "10px 14px",
                fontSize: "14px",
                color: o.value === value ? C.cyan : C.text,
                cursor: "pointer",
                borderBottom: `1px solid ${C.border}`,
                transition: "background 0.15s",
                background: o.value === value ? C.cyan + "10" : "transparent",
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.cyan + "15"}
              onMouseLeave={e => e.currentTarget.style.background = o.value === value ? C.cyan + "10" : "transparent"}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "10px",
      fontWeight: 600,
      letterSpacing: "0.06em",
      background: color + "18",
      color: color,
      border: `1px solid ${color}30`,
      textTransform: "uppercase",
    }}>{children}</span>
  );
}

function CostRow({ label, low, high, icon, color, pct }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      padding: "11px 0",
      borderBottom: `1px solid ${C.border}`,
      alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "8px",
          background: color + "15",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", flexShrink: 0,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: "13px", color: C.text, lineHeight: 1.3 }}>{label}</div>
          {pct > 0 && (
            <div style={{ fontSize: "10px", color: C.dim, marginTop: "1px" }}>
              {pct}% du total
            </div>
          )}
        </div>
      </div>
      <span style={{
        fontSize: "13px",
        fontFamily: "'Space Mono', monospace",
        color: C.text,
        textAlign: "right",
        fontWeight: 500,
      }}>
        {fmt(low)}{high !== low ? ` — ${fmt(high)}` : ""}
      </span>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function BallparkEstimator() {
  const [installId, setInstallId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [seasonId, setSeasonId] = useState("mid");
  const [rentalWeeks, setRentalWeeks] = useState(4);
  const [showResult, setShowResult] = useState(false);

  const install = INSTALLATIONS.find(i => i.id === installId);
  const region = REGIONS.find(r => r.id === regionId);
  const season = SEASONS.find(s => s.id === seasonId);
  const profile = install ? PROFILES[install.profile] : null;

  const canEstimate = install && region && season;

  const estimate = useMemo(() => {
    if (!canEstimate) return null;
    const s = season.multiplier;
    // DT fait 2 déplacements : montage + démontage (séparés)
    const mDays = install.mountDays;
    const uDays = install.unmountDays;
    const totalDtDays = mDays + uDays;
    const trips = 2; // aller-retour montage + aller-retour démontage

    const rentalCost = rentalWeeks * profile.rentalPerWeek;
    const rental     = { low: rentalCost, high: rentalCost };
    const dtWork     = { low: totalDtDays * DT_DAILY, high: totalDtDays * DT_DAILY };
    const dtFlights  = { low: Math.round(region.flightBase * trips * s * 0.9), high: Math.round(region.flightBase * trips * s * 1.15) };
    const dtHotel    = { low: Math.round(totalDtDays * region.hotelBase * s * 0.9), high: Math.round(totalDtDays * region.hotelBase * s * 1.1) };
    const dtPerDiem  = { low: totalDtDays * region.perDiemBase, high: totalDtDays * region.perDiemBase };
    const localLabor = { low: (mDays + uDays) * install.crew * LOCAL_DAILY, high: Math.round((mDays + uDays) * install.crew * LOCAL_DAILY * 1.2) };
    const machinery  = { low: profile.machineryDays * MACHINERY_DAILY, high: Math.round(profile.machineryDays * MACHINERY_DAILY * 1.15) };
    const forklift   = { low: profile.forkliftDays * FORKLIFT_DAILY, high: Math.round(profile.forkliftDays * FORKLIFT_DAILY * 1.15) };
    const transport  = { low: Math.round(region.transportBase * 0.9), high: Math.round(region.transportBase * 1.2) };

    const lines = [
      { label: `Location — ${rentalWeeks} sem.`, ...rental, icon: "🎪" },
      { label: `Direction technique — ${mDays}j montage + ${uDays}j démontage`, ...dtWork, icon: "🎬" },
      { label: `Vols DT — ${trips} allers-retours`, ...dtFlights, icon: "✈️" },
      { label: `Hébergement DT — ${totalDtDays} nuits`, ...dtHotel, icon: "🏨" },
      { label: `Per diem DT — ${totalDtDays} jours`, ...dtPerDiem, icon: "🍽️" },
      { label: `Main-d'œuvre locale — ${install.crew} pers. × ${mDays + uDays}j`, ...localLabor, icon: "👷" },
      { label: `Opérateur machinerie — ${profile.machineryDays}j`, ...machinery, icon: "🏗️" },
      { label: `Chariot élévateur — ${profile.forkliftDays}j`, ...forklift, icon: "🚜" },
      { label: "Transport de l'installation", ...transport, icon: "🚛" },
    ];

    const totalLow = lines.reduce((sum, l) => sum + l.low, 0);
    const totalHigh = lines.reduce((sum, l) => sum + l.high, 0);

    return { lines, totalLow, totalHigh };
  }, [canEstimate, install, region, season, profile, rentalWeeks]);

  const handleEstimate = useCallback(() => {
    if (canEstimate) setShowResult(true);
  }, [canEstimate]);

  const reset = () => {
    setShowResult(false);
  };

  // ─── Styles ─────────────────────────────────────────────────────────
  const inputStyle = {
    padding: "11px 14px",
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    color: C.text,
    fontSize: "14px",
    fontFamily: "'Space Mono', monospace",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.cyan,
    marginBottom: "8px",
    fontFamily: "'Space Mono', monospace",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 50% 0%, #1a0a1e 0%, ${C.bg} 60%)`,
      color: C.text,
      fontFamily: "'Syne', sans-serif",
      padding: "32px 20px 48px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        input:focus { border-color: ${C.cyan} !important; }
        ::selection { background: ${C.cyan}33; }
        @media (max-width: 480px) {
          .grid-2col { grid-template-columns: 1fr !important; }
          .result-header { flex-direction: column !important; }
          .result-header > div:last-child { text-align: left !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ maxWidth: 560, margin: "0 auto 40px", textAlign: "center" }}>
        <img
          src="/assets/logo-white.webp"
          alt="QDSi — Quartier des spectacles international"
          style={{
            height: 52,
            width: "auto",
            marginBottom: "16px",
          }}
        />
        <div style={{
          fontSize: "16px", fontWeight: 600, letterSpacing: "0.04em",
          color: C.muted,
          textTransform: "uppercase",
          fontFamily: "'Space Mono', monospace",
        }}>Estimateur <span style={{ color: C.red }}>ballpark</span></div>
        <p style={{
          fontSize: "14px", color: C.dim, lineHeight: 1.6,
          maxWidth: 440, margin: "10px auto 0",
        }}>
          Estimation budgétaire rapide pour la tournée d'installations en espace public.
        </p>
      </header>

      {/* ── Formulaire ── */}
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderTop: `2px solid ${C.red}`,
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "20px",
          boxShadow: C.glow,
        }}>
          {/* Installation */}
          <div style={{ marginBottom: "22px" }}>
            <label style={labelStyle}>Installation</label>
            <Select
              value={installId}
              onChange={v => { setInstallId(v); reset(); }}
              placeholder="Choisir une installation…"
              options={INSTALLATIONS.map(i => ({ value: i.id, label: i.name }))}
            />
            {install && (
              <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <Badge color={profile.color}>{profile.label}</Badge>
                <span style={{
                  fontSize: "12px", color: C.muted,
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {install.crew} pers. · {install.mountDays}j montage + {install.unmountDays}j démontage
                </span>
                <span style={{ fontSize: "12px", color: C.dim }}>
                  — {install.desc}
                </span>
              </div>
            )}
          </div>

          {/* Destination + Saison */}
          <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "22px" }}>
            <div>
              <label style={labelStyle}>Destination</label>
              <Select
                value={regionId}
                onChange={v => { setRegionId(v); reset(); }}
                placeholder="Région…"
                options={REGIONS.map(r => ({ value: r.id, label: r.name }))}
              />
            </div>
            <div>
              <label style={labelStyle}>Saison</label>
              <Select
                value={seasonId}
                onChange={v => { setSeasonId(v); reset(); }}
                placeholder="Saison…"
                options={SEASONS.map(s => ({ value: s.id, label: s.name }))}
              />
            </div>
          </div>

          {/* Durée de location */}
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Durée de location</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="number"
                min={1}
                max={52}
                value={rentalWeeks}
                onChange={e => { setRentalWeeks(parseInt(e.target.value) || 1); reset(); }}
                style={{
                  ...inputStyle,
                  width: "70px",
                  MozAppearance: "textfield",
                  textAlign: "center",
                }}
              />
              <span style={{ fontSize: "12px", color: C.muted }}>semaines</span>
            </div>
          </div>

          {/* Bouton */}
          <button
            onClick={handleEstimate}
            disabled={!canEstimate}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: canEstimate ? C.red : "#1a1a30",
              color: canEstimate ? "white" : "#3a3a5a",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              cursor: canEstimate ? "pointer" : "not-allowed",
              transition: "all 0.25s",
              letterSpacing: "0.02em",
              boxShadow: canEstimate ? "0 4px 24px rgba(204, 43, 43, 0.3)" : "none",
            }}
          >
            Générer l'estimation
          </button>
        </div>

        {/* ── Résultats ── */}
        {showResult && estimate && (
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderTop: `2px solid ${C.purple}`,
            borderRadius: "20px",
            padding: "28px",
            animation: "fadeIn 0.4s ease",
            boxShadow: C.glow,
          }}>

            {/* Entête résultat */}
            <div className="result-header" style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              marginBottom: "24px", paddingBottom: "20px",
              borderBottom: `1px solid ${C.border}`,
              flexWrap: "wrap", gap: "12px",
            }}>
              <div>
                <div style={{
                  fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em",
                  marginBottom: "4px",
                }}>{install.name}</div>
                <div style={{
                  fontSize: "12px", color: C.muted,
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {region.name} · {season.name}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: "10px", textTransform: "uppercase",
                  letterSpacing: "0.1em", color: C.dim, marginBottom: "4px",
                  fontFamily: "'Space Mono', monospace",
                }}>Fourchette estimée</div>
                <div style={{
                  fontSize: "22px", fontWeight: 800,
                  fontFamily: "'Space Mono', monospace",
                  background: C.accent,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.2,
                }}>
                  {fmt(estimate.totalLow)}
                </div>
                <div style={{
                  fontSize: "14px", fontWeight: 500,
                  fontFamily: "'Space Mono', monospace",
                  color: C.muted,
                }}>
                  à {fmt(estimate.totalHigh)}
                </div>
              </div>
            </div>

            {/* Lignes de coût */}
            {estimate.lines.map((line, i) => {
              const pct = Math.round((line.low / estimate.totalLow) * 100);
              return (
                <CostRow
                  key={i}
                  label={line.label}
                  low={line.low}
                  high={line.high}
                  icon={line.icon}
                  color={BAR_COLORS[i]}
                  pct={pct}
                />
              );
            })}

            {/* Barre de répartition */}
            <div style={{ marginTop: "24px" }}>
              <div style={{
                fontSize: "10px", textTransform: "uppercase",
                letterSpacing: "0.1em", color: C.dim, marginBottom: "10px",
                fontFamily: "'Space Mono', monospace",
              }}>
                Répartition des coûts
              </div>
              <div style={{
                display: "flex", height: "10px",
                borderRadius: "5px", overflow: "hidden", gap: "2px",
              }}>
                {estimate.lines.map((line, i) => {
                  const pct = (line.low / estimate.totalLow) * 100;
                  return (
                    <div
                      key={i}
                      title={`${line.label}: ${Math.round(pct)}%`}
                      style={{
                        width: `${pct}%`,
                        background: BAR_COLORS[i],
                        borderRadius: "3px",
                        minWidth: pct > 0 ? "3px" : "0",
                        transition: "width 0.6s ease",
                        opacity: 0.85,
                      }}
                    />
                  );
                })}
              </div>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: "12px",
              }}>
                {estimate.lines.map((line, i) => {
                  const pct = Math.round((line.low / estimate.totalLow) * 100);
                  if (pct < 3) return null;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      fontSize: "11px", color: C.muted,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "3px",
                        background: BAR_COLORS[i], opacity: 0.85,
                      }} />
                      {line.label.split("—")[0].trim()} <span style={{ color: C.dim }}>({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Avertissement */}
            <div style={{
              marginTop: "24px",
              padding: "14px 16px",
              background: C.bg,
              borderRadius: "12px",
              border: `1px solid ${C.border}`,
            }}>
              <div style={{
                fontSize: "11px", color: C.muted, lineHeight: 1.6,
                fontFamily: "'Space Mono', monospace",
              }}>
                Estimation préliminaire à titre indicatif uniquement. Basée sur des moyennes historiques
                et les profils d'installation du catalogue QDSi. Les prix réels (vols, hébergement,
                transport) varient selon la disponibilité et les conditions du marché.
                Un devis détaillé suit après validation des paramètres.
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer style={{
          marginTop: "40px",
          textAlign: "center",
          paddingTop: "20px",
          borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontSize: "10px",
            color: C.dim,
            letterSpacing: "0.08em",
            fontFamily: "'Space Mono', monospace",
          }}>
            Propulsé par <span style={{ color: C.muted }}>Studio Micho</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
