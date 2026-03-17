import { useState, useMemo, useCallback } from "react";

// ─── Catalogue QDSi (noms officiels, profils fictifs mais réalistes) ────────
const INSTALLATIONS = [
  { id: "impulsion", name: "Impulsion", profile: "heavy", crew: 8, installDays: 5, desc: "Balançoires lumineuses et musicales" },
  { id: "loop", name: "LOOP", profile: "heavy", crew: 6, installDays: 4, desc: "Zootropes géants mécaniques" },
  { id: "pop", name: "POP!", profile: "medium", crew: 4, installDays: 3, desc: "Créatures colorées interactives" },
  { id: "spectrum", name: "Spectrum", profile: "medium", crew: 3, installDays: 3, desc: "Vibrations sonores et lumineuses" },
  { id: "diamants", name: "Les Diamants", profile: "light", crew: 2, installDays: 2, desc: "Structures géométriques lumineuses" },
  { id: "ilot", name: "Îlot de chaleur", profile: "medium", crew: 4, installDays: 3, desc: "Archipel d'assises chauffantes" },
  { id: "prisma", name: "Prismaphonik", profile: "light", crew: 2, installDays: 2, desc: "Harmonies visuelles et sonores" },
  { id: "lucia", name: "Lucia", profile: "heavy", crew: 6, installDays: 4, desc: "Expérience lumineuse immersive" },
  { id: "prismatica", name: "Prismatica", profile: "medium", crew: 4, installDays: 3, desc: "Prismes géants pivotants" },
  { id: "iceberg", name: "Iceberg", profile: "medium", crew: 3, installDays: 3, desc: "Arches lumineuses monumentales" },
  { id: "entre-rangs", name: "Entre les rangs", profile: "light", crew: 3, installDays: 2, desc: "Tiges lumineuses ondulantes" },
  { id: "domino", name: "Effet Domino", profile: "medium", crew: 4, installDays: 3, desc: "Dominos lumineux interactifs" },
  { id: "celestia", name: "Celestia", profile: "heavy", crew: 6, installDays: 4, desc: "Constellation immersive aérienne" },
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
  light:  { rentalBase: 8000,  machineryDays: 1, forkliftDays: 1, label: "Légère",  color: "#0693e3" },
  medium: { rentalBase: 15000, machineryDays: 2, forkliftDays: 2, label: "Moyenne",  color: "#9b51e0" },
  heavy:  { rentalBase: 25000, machineryDays: 3, forkliftDays: 3, label: "Lourde",   color: "#f78da7" },
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
  const [dtDays, setDtDays] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const install = INSTALLATIONS.find(i => i.id === installId);
  const region = REGIONS.find(r => r.id === regionId);
  const season = SEASONS.find(s => s.id === seasonId);
  const profile = install ? PROFILES[install.profile] : null;

  const canEstimate = install && region && season;

  const estimate = useMemo(() => {
    if (!canEstimate) return null;
    const s = season.multiplier;
    const effectiveDtDays = dtDays || install.installDays;

    const rental    = { low: profile.rentalBase, high: profile.rentalBase };
    const dtWork    = { low: effectiveDtDays * DT_DAILY, high: effectiveDtDays * DT_DAILY };
    const dtFlight  = { low: Math.round(region.flightBase * s * 0.9), high: Math.round(region.flightBase * s * 1.15) };
    const dtHotel   = { low: Math.round(effectiveDtDays * region.hotelBase * s * 0.9), high: Math.round(effectiveDtDays * region.hotelBase * s * 1.1) };
    const dtPerDiem = { low: effectiveDtDays * region.perDiemBase, high: effectiveDtDays * region.perDiemBase };
    const localLabor = { low: install.installDays * install.crew * LOCAL_DAILY, high: Math.round(install.installDays * install.crew * LOCAL_DAILY * 1.2) };
    const machinery = { low: profile.machineryDays * MACHINERY_DAILY, high: Math.round(profile.machineryDays * MACHINERY_DAILY * 1.15) };
    const forklift  = { low: profile.forkliftDays * FORKLIFT_DAILY, high: Math.round(profile.forkliftDays * FORKLIFT_DAILY * 1.15) };
    const transport = { low: Math.round(region.transportBase * 0.9), high: Math.round(region.transportBase * 1.2) };

    const lines = [
      { label: "Frais locatifs", ...rental, icon: "◆" },
      { label: `Direction technique — ${effectiveDtDays} jours`, ...dtWork, icon: "◉" },
      { label: "Vol — directeur technique", ...dtFlight, icon: "↗" },
      { label: `Hébergement — ${effectiveDtDays} nuits`, ...dtHotel, icon: "■" },
      { label: `Per diem — ${effectiveDtDays} jours`, ...dtPerDiem, icon: "●" },
      { label: `Main-d'œuvre locale — ${install.crew} pers. × ${install.installDays}j`, ...localLabor, icon: "▲" },
      { label: `Opérateur machinerie — ${profile.machineryDays}j`, ...machinery, icon: "⬡" },
      { label: `Chariot élévateur — ${profile.forkliftDays}j`, ...forklift, icon: "▣" },
      { label: "Transport de l'installation", ...transport, icon: "►" },
    ];

    const totalLow = lines.reduce((sum, l) => sum + l.low, 0);
    const totalHigh = lines.reduce((sum, l) => sum + l.high, 0);

    return { lines, totalLow, totalHigh };
  }, [canEstimate, install, region, season, profile, dtDays]);

  const handleEstimate = useCallback(() => {
    if (canEstimate) setShowResult(true);
  }, [canEstimate]);

  const reset = () => {
    setShowResult(false);
  };

  // ─── Styles ─────────────────────────────────────────────────────────
  const selectStyle = {
    width: "100%",
    padding: "11px 14px",
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    color: C.text,
    fontSize: "14px",
    fontFamily: "'Syne', sans-serif",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23505872' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.dim,
    marginBottom: "8px",
    fontFamily: "'Space Mono', monospace",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Syne', sans-serif",
      padding: "32px 20px 48px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        select:focus, input:focus { border-color: ${C.cyan} !important; }
        select option { background: ${C.bg}; color: ${C.text}; }
        ::selection { background: ${C.cyan}33; }
      `}</style>

      {/* ── Header ── */}
      <header style={{ maxWidth: 560, margin: "0 auto 36px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "16px",
        }}>
          <img
            src="/assets/logo-white.webp"
            alt="QDSi — Quartier des spectacles international"
            style={{
              height: 40,
              width: "auto",
            }}
          />
          <div style={{ textAlign: "left" }}>
            <div style={{
              fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}>Ballpark Estimator</div>
            <div style={{
              fontSize: "10px", color: C.dim, letterSpacing: "0.12em",
              textTransform: "uppercase", fontFamily: "'Space Mono', monospace",
              marginTop: "4px",
            }}>Quartier des spectacles international</div>
          </div>
        </div>
        <p style={{
          fontSize: "14px", color: C.muted, lineHeight: 1.6,
          maxWidth: 440, margin: "0 auto",
        }}>
          Estimation budgétaire rapide pour la tournée d'installations artistiques en espace public.
        </p>
      </header>

      {/* ── Formulaire ── */}
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "20px",
          boxShadow: C.glow,
        }}>
          {/* Installation */}
          <div style={{ marginBottom: "22px" }}>
            <label style={labelStyle}>Installation</label>
            <select
              style={selectStyle}
              value={installId}
              onChange={e => { setInstallId(e.target.value); reset(); }}
            >
              <option value="">Choisir une installation…</option>
              {INSTALLATIONS.map(i => (
                <option key={i.id} value={i.id}>{i.name} — {i.desc}</option>
              ))}
            </select>
            {install && (
              <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                <Badge color={profile.color}>{profile.label}</Badge>
                <span style={{
                  fontSize: "12px", color: C.muted,
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {install.crew} pers. · {install.installDays}j d'installation
                </span>
              </div>
            )}
          </div>

          {/* Destination + Saison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "22px" }}>
            <div>
              <label style={labelStyle}>Destination</label>
              <select
                style={selectStyle}
                value={regionId}
                onChange={e => { setRegionId(e.target.value); reset(); }}
              >
                <option value="">Région…</option>
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Saison</label>
              <select
                style={selectStyle}
                value={seasonId}
                onChange={e => { setSeasonId(e.target.value); reset(); }}
              >
                {SEASONS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Jours DT */}
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Jours DT sur place <span style={{ fontWeight: 400, opacity: 0.6 }}>(0 = auto)</span></label>
            <input
              type="number"
              min={0}
              max={30}
              value={dtDays}
              onChange={e => { setDtDays(parseInt(e.target.value) || 0); reset(); }}
              style={{
                ...selectStyle,
                width: "90px",
                backgroundImage: "none",
                MozAppearance: "textfield",
                textAlign: "center",
                fontFamily: "'Space Mono', monospace",
              }}
            />
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
              background: canEstimate ? C.accent : "#1a1a30",
              color: canEstimate ? "white" : "#3a3a5a",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              cursor: canEstimate ? "pointer" : "not-allowed",
              transition: "all 0.25s",
              letterSpacing: "0.02em",
              boxShadow: canEstimate ? "0 4px 24px rgba(6, 147, 227, 0.25)" : "none",
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
            borderRadius: "20px",
            padding: "28px",
            animation: "fadeIn 0.4s ease",
            boxShadow: C.glow,
          }}>

            {/* Entête résultat */}
            <div style={{
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
