import { useMemo, useState } from "react";
import {
  OutbreakStatus,
  OutbreakDataPoint,
} from "../data/outbreaks";
import { loadOutbreaks, saveOutbreaks } from "../data/outbreakStorage";

type EditableOutbreak = OutbreakDataPoint & {
  id: string;
};

const STATUS_OPTIONS: OutbreakStatus[] = [
  "confirmed",
  "suspected",
  "monitoring",
];
const ADMIN_PASSWORD = "hantamanta2026";
const ADMIN_SESSION_KEY = "hantatracker.admin-authenticated";

function createEditableOutbreak(
  outbreak: OutbreakDataPoint,
  index: number,
): EditableOutbreak {
  return {
    ...outbreak,
    id: `${outbreak.name}-${index}-${crypto.randomUUID()}`,
  };
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true",
  );
  const [outbreaks, setOutbreaks] = useState<EditableOutbreak[]>(() =>
    loadOutbreaks().map(createEditableOutbreak),
  );
  const [savedMessage, setSavedMessage] = useState("");

  const totals = useMemo(
    () => ({
      cases: outbreaks.reduce((sum, outbreak) => sum + outbreak.confirmedCases, 0),
      deaths: outbreaks.reduce((sum, outbreak) => sum + outbreak.deaths, 0),
      countries: outbreaks.length,
    }),
    [outbreaks],
  );

  const updateOutbreak = <Field extends keyof EditableOutbreak>(
    id: string,
    field: Field,
    value: EditableOutbreak[Field],
  ) => {
    setOutbreaks((current) =>
      current.map((outbreak) =>
        outbreak.id === id ? { ...outbreak, [field]: value } : outbreak,
      ),
    );
  };

  const addCountry = () => {
    setOutbreaks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "New country",
        latitude: 0,
        longitude: 0,
        confirmedCases: 0,
        deaths: 0,
        status: "monitoring",
      },
    ]);
  };

  const removeCountry = (id: string) => {
    setOutbreaks((current) => current.filter((outbreak) => outbreak.id !== id));
  };

  const saveChanges = () => {
    saveOutbreaks(
      outbreaks.map(({ id, ...outbreak }) => ({
        ...outbreak,
        confirmedCases: Math.max(0, Math.round(outbreak.confirmedCases)),
        deaths: Math.max(0, Math.round(outbreak.deaths)),
      })),
    );
    setSavedMessage("Saved. The public map will use these values in this browser.");
  };

  const submitPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setIsAuthenticated(true);
      setPasswordError("");
      return;
    }

    setPasswordError("Incorrect password.");
  };

  if (!isAuthenticated) {
    return (
      <main className="admin-shell">
        <form className="admin-login" onSubmit={submitPassword}>
          <div>
            <p>HantaTracker Admin</p>
            <h1>Enter Password</h1>
          </div>
          <label>
            <span>Password</span>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {passwordError ? <p className="admin-login-error">{passwordError}</p> : null}
          <button className="primary-action" type="submit">
            Unlock Admin
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <div className="admin-header">
          <div>
            <p>HantaTracker Admin</p>
            <h1>Outbreak Data Editor</h1>
          </div>
          <div className="admin-totals" aria-label="Current totals">
            <span>{totals.cases} cases</span>
            <span>{totals.deaths} deaths</span>
            <span>{totals.countries} countries</span>
          </div>
        </div>

        <div className="admin-table">
          <div className="admin-row admin-row-header">
            <span>Name</span>
            <span>Cases</span>
            <span>Deaths</span>
            <span>Status</span>
            <span>Latitude</span>
            <span>Longitude</span>
            <span />
          </div>

          {outbreaks.map((outbreak) => (
            <div className="admin-row" key={outbreak.id}>
              <label>
                <span>Name</span>
                <input
                  value={outbreak.name}
                  onChange={(event) =>
                    updateOutbreak(outbreak.id, "name", event.target.value)
                  }
                />
              </label>
              <label>
                <span>Cases</span>
                <input
                  min="0"
                  type="number"
                  value={outbreak.confirmedCases}
                  onChange={(event) =>
                    updateOutbreak(
                      outbreak.id,
                      "confirmedCases",
                      Number(event.target.value),
                    )
                  }
                />
              </label>
              <label>
                <span>Deaths</span>
                <input
                  min="0"
                  type="number"
                  value={outbreak.deaths}
                  onChange={(event) =>
                    updateOutbreak(outbreak.id, "deaths", Number(event.target.value))
                  }
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={outbreak.status}
                  onChange={(event) =>
                    updateOutbreak(
                      outbreak.id,
                      "status",
                      event.target.value as OutbreakStatus,
                    )
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Latitude</span>
                <input
                  step="0.0001"
                  type="number"
                  value={outbreak.latitude}
                  onChange={(event) =>
                    updateOutbreak(
                      outbreak.id,
                      "latitude",
                      Number(event.target.value),
                    )
                  }
                />
              </label>
              <label>
                <span>Longitude</span>
                <input
                  step="0.0001"
                  type="number"
                  value={outbreak.longitude}
                  onChange={(event) =>
                    updateOutbreak(
                      outbreak.id,
                      "longitude",
                      Number(event.target.value),
                    )
                  }
                />
              </label>
              <button type="button" onClick={() => removeCountry(outbreak.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="admin-actions">
          <button type="button" onClick={addCountry}>
            Add Country
          </button>
          <button
            className="primary-action"
            type="button"
            onClick={saveChanges}
          >
            Save
          </button>
        </div>

        {savedMessage ? (
          <p className="admin-save-message" role="status">
            {savedMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}
