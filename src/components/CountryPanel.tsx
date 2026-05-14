import { useMemo, useState } from "react";
import { OutbreakDataPoint } from "../data/outbreaks";
import { countryMatchesSearch, SupportedLanguage, translateCountryName, translateUiText } from "../i18n";

type Tab = "confirmed" | "suspected" | "monitoring" | "deaths";

type CountryPanelProps = {
  outbreaks: OutbreakDataPoint[];
  language: SupportedLanguage;
  onCountryClick: (lat: number, lng: number) => void;
};

const STATUS_COLORS: Record<Tab, string> = {
  confirmed: "#e53935",
  suspected: "#f59e0b",
  monitoring: "#8b5cf6",
  deaths: "#94a3b8",
};

export default function CountryPanel({ outbreaks, language, onCountryClick }: CountryPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("confirmed");
  const [search, setSearch] = useState("");

  const tabCounts = useMemo(
    () => ({
      confirmed: outbreaks.filter((o) => o.status === "confirmed").length,
      suspected: outbreaks.filter((o) => o.status === "suspected").length,
      monitoring: outbreaks.filter((o) => o.status === "monitoring").length,
      deaths: outbreaks.filter((o) => o.deaths > 0).length,
    }),
    [outbreaks],
  );

  const filtered = useMemo(() => {
    let list: OutbreakDataPoint[];
    if (activeTab === "deaths") {
      list = outbreaks.filter((o) => o.deaths > 0);
      list = [...list].sort((a, b) => b.deaths - a.deaths);
    } else {
      list = outbreaks.filter((o) => o.status === activeTab);
      list = [...list].sort((a, b) => b.confirmedCases - a.confirmedCases || a.name.localeCompare(b.name));
    }
    if (search.trim()) {
      list = list.filter((o) => countryMatchesSearch(o.name, search.trim()));
    }
    return list;
  }, [outbreaks, activeTab, search]);

  const tabs: { key: Tab; labelKey: string }[] = [
    { key: "confirmed", labelKey: "Confirmed" },
    { key: "suspected", labelKey: "Suspected" },
    { key: "monitoring", labelKey: "Monitoring" },
    { key: "deaths", labelKey: "Deaths" },
  ];

  function handleTabClick(tab: Tab) {
    setActiveTab(tab);
    setSearch("");
  }

  return (
    <aside
      className="country-panel"
      aria-label="Country outbreak status"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="panel-header">
        <p>{translateUiText("Countries", language)}</p>
        <span className="panel-count-badge">{outbreaks.length}</span>
      </div>

      <div className="panel-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`panel-tab panel-tab--${tab.key}${activeTab === tab.key ? " panel-tab--active" : ""}`}
            style={activeTab === tab.key ? { borderBottomColor: STATUS_COLORS[tab.key] } : undefined}
            onClick={() => handleTabClick(tab.key)}
          >
            {translateUiText(tab.labelKey, language)}
            <span className="panel-tab-count">{tabCounts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="panel-search">
        <input
          type="search"
          className="panel-search-input"
          placeholder={translateUiText("Search countries...", language)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={translateUiText("Search countries...", language)}
        />
      </div>

      <div className="panel-ad-slot" aria-label="Advertisement space">
        <span>AD</span>
      </div>

      <div className="panel-list" role="listbox" aria-label={translateUiText("Countries", language)}>
        {filtered.length === 0 ? (
          <p className="panel-empty">{translateUiText("No countries found", language)}</p>
        ) : (
          filtered.map((o) => {
            const statLabel =
              activeTab === "deaths"
                ? `${o.deaths}`
                : o.confirmedCases > 0
                  ? `${o.confirmedCases}`
                  : null;
            const statSuffix =
              activeTab === "deaths"
                ? o.deaths === 1
                  ? translateUiText("death", language)
                  : translateUiText("deaths", language)
                : o.confirmedCases === 1
                  ? translateUiText("case", language)
                  : translateUiText("cases", language);

            return (
              <button
                key={o.name}
                className={`panel-country-item panel-country-item--${activeTab === "deaths" ? o.status : activeTab}`}
                onClick={() => onCountryClick(o.latitude, o.longitude)}
                role="option"
                aria-selected={false}
              >
                <span className="panel-country-dot" style={{ background: STATUS_COLORS[activeTab === "deaths" ? o.status as Tab : activeTab] }} />
                <span className="panel-country-name">{translateCountryName(o.name, language)}</span>
                {statLabel !== null && (
                  <span className="panel-country-stat">
                    {statLabel} <span className="panel-country-stat-label">{statSuffix}</span>
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
