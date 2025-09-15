import React, { useState, useEffect } from "react";

const DAYS = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

const MEAL_KEYS = [
  { key: "sniadanie", label: "Śniadanie" },
  { key: "sniadanie2", label: "2. śniadanie" },
  { key: "lunch", label: "Lunch" },
  { key: "kolacja", label: "Kolacja" },
];

const emptyMeal = () => ({ title: "Nowy posiłek", ingredients: [""], recipe: "" });

export default function DietApp() {
  const [activeDay, setActiveDay] = useState(0);
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem("dietData_v1");
    if (raw) return JSON.parse(raw);
    const base = {};
    DAYS.forEach((d) => {
      base[d] = {};
      MEAL_KEYS.forEach((m) => (base[d][m.key] = { ...emptyMeal() }));
    });
    return base;
  });

  const [shopping, setShopping] = useState(() => {
    const raw = localStorage.getItem("dietShopping_v1");
    return raw ? JSON.parse(raw) : [];
  });

  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState(null);
  const [importExportMode, setImportExportMode] = useState(false);
  const [mobileView, setMobileView] = useState("plan"); // 🔥 nowy stan: plan | shopping

  useEffect(() => {
    localStorage.setItem("dietData_v1", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("dietShopping_v1", JSON.stringify(shopping));
  }, [shopping]);

  const toggleExpand = (day, mealKey) => {
    const id = `${day}_${mealKey}`;
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  };

  const updateMeal = (day, mealKey, patch) => {
    setData((d) => ({
      ...d,
      [day]: { ...d[day], [mealKey]: { ...d[day][mealKey], ...patch } },
    }));
  };

  const addIngredient = (day, mealKey) => {
    setData((d) => ({
      ...d,
      [day]: {
        ...d[day],
        [mealKey]: { ...d[day][mealKey], ingredients: [...d[day][mealKey].ingredients, ""] },
      },
    }));
  };

  const removeIngredient = (day, mealKey, idx) => {
    setData((d) => {
      const ing = d[day][mealKey].ingredients.filter((_, i) => i !== idx);
      return {
        ...d,
        [day]: { ...d[day], [mealKey]: { ...d[day][mealKey], ingredients: ing } },
      };
    });
  };

  const addShoppingItem = (text) => {
    if (!text || !text.trim()) return;
    setShopping((s) => [...s, { id: Date.now(), text: text.trim() }]);
  };

  const checkShopping = (id) => {
    setShopping((s) => s.filter((x) => x.id !== id));
  };

  const exportJSON = () => {
    const payload = { data, shopping };
    return JSON.stringify(payload, null, 2);
  };

  const importJSON = (raw) => {
    try {
      const obj = JSON.parse(raw);
      if (!obj.data || !obj.shopping) throw new Error("Brak wymaganych pól");
      setData(obj.data);
      setShopping(obj.shopping);
      alert("Zaimportowano pomyślnie");
    } catch (e) {
      alert("Błąd importu: " + e.message);
    }
  };

  const DayTabs = () => (
    <div style={styles.tabs}>
      {DAYS.map((d, i) => (
        <button
          key={d}
          onClick={() => setActiveDay(i)}
          style={i === activeDay ? styles.tabActive : styles.tab}
        >
          {d}
        </button>
      ))}
    </div>
  );

  const MealCard = ({ day, mealKey, meal }) => {
    const id = `${day}_${mealKey}`;
    const isExpanded = !!expanded[id];
    return (
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <strong>{MEAL_KEYS.find((m) => m.key === mealKey).label}</strong>
          <div>
            <button onClick={() => toggleExpand(day, mealKey)} style={styles.smallBtn}>
              {isExpanded ? "Zwiń" : "Rozwiń"}
            </button>
            <button
              onClick={() => setEditing({ day, mealKey })}
              style={{ ...styles.smallBtn, marginLeft: 6 }}
            >
              Edytuj
            </button>
          </div>
        </div>

        {isExpanded && (
          <div style={styles.cardBody}>
            <div style={{ marginBottom: 8 }}>
              <em>{meal.title}</em>
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong>Składniki:</strong>
              <ul>
                {meal.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing || <i>puste</i>}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Przygotowanie:</strong>
              <div style={{ whiteSpace: "pre-wrap" }}>{meal.recipe || <i>brak opisu</i>}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center" }}>DietApp — Twój tydzień diety</h2>

      <DayTabs />

      {/* 🔥 przełącznik mobilny */}
      <div style={styles.mobileSwitch}>
        <button
          style={mobileView === "plan" ? styles.tabActive : styles.tab}
          onClick={() => setMobileView("plan")}
        >
          Plan diety
        </button>
        <button
          style={mobileView === "shopping" ? styles.tabActive : styles.tab}
          onClick={() => setMobileView("shopping")}
        >
          Lista zakupów
        </button>
      </div>

      <div style={styles.content}>
        {/* plan diety */}
        <div
          style={{
            ...styles.left,
            display: mobileView === "plan" ? "block" : "none",
          }}
        >
          <h3>{DAYS[activeDay]}</h3>
          {MEAL_KEYS.map((m) => (
            <MealCard
              key={m.key}
              day={DAYS[activeDay]}
              mealKey={m.key}
              meal={data[DAYS[activeDay]][m.key]}
            />
          ))}
        </div>

        {/* lista zakupów */}
        <div
          style={{
            ...styles.right,
            display: mobileView === "shopping" ? "block" : "none",
          }}
        >
          <h3>Lista zakupów</h3>
          <Shopping
            items={shopping}
            onAdd={addShoppingItem}
            onCheck={checkShopping}
            onClear={() => setShopping([])}
          />

          <div style={{ marginTop: 18 }}>
            <button style={styles.btn} onClick={() => setImportExportMode((s) => !s)}>
              {importExportMode ? "Ukryj import/eksport" : "Pokaż import/eksport"}
            </button>
          </div>

          {importExportMode && (
            <div style={{ marginTop: 12 }}>
              <ExportImport
                exportJSON={exportJSON}
                importJSON={importJSON}
              />
            </div>
          )}
        </div>
      </div>

      {editing && (
        <Editor
          editing={editing}
          data={data}
          onClose={() => setEditing(null)}
          onSave={(day, mealKey, payload) => {
            updateMeal(day, mealKey, payload);
            setEditing(null);
          }}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
        />
      )}

      <div style={{ marginTop: 18, textAlign: "center", fontSize: 12 }}>
        <div>Dane zapisywane są lokalnie w przeglądarce (localStorage).</div>
        <div>Możesz eksportować plan i wklejać go w kolejnym tygodniu.</div>
      </div>
    </div>
  );
}

function Shopping({ items, onAdd, onCheck, onClear }) {
  const [text, setText] = useState("");
  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dodaj produkt..."
          style={styles.input}
        />
        <button
          onClick={() => {
            onAdd(text);
            setText("");
          }}
          style={styles.btn}
        >
          Dodaj
        </button>
      </div>

      <ul style={{ marginTop: 12, paddingLeft: 16 }}>
        {items.length === 0 && <li><i>Brak przedmiotów na liście</i></li>}
        {items.map((it) => (
          <li key={it.id} style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              onChange={() => onCheck(it.id)}
              style={{ marginRight: 8 }}
            />
            <span>{it.text}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 10 }}>
        <button onClick={onClear} style={styles.smallBtn}>Wyczyść listę</button>
      </div>
    </div>
  );
}

function ExportImport({ exportJSON, importJSON }) {
  const [payload, setPayload] = useState(exportJSON());
  useEffect(() => {
    setPayload(exportJSON());
  }, [exportJSON]);
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => setPayload(exportJSON())}
          style={{ ...styles.smallBtn, marginRight: 8 }}
        >
          Odśwież eksport
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(exportJSON());
            alert("Skopiowano JSON do schowka");
          }}
          style={styles.smallBtn}
        >
          Kopiuj do schowka
        </button>
      </div>

      <textarea
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        rows={8}
        style={{ width: "100%", fontFamily: "monospace" }}
      />

      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => importJSON(payload)}
          style={styles.btn}
        >
          Importuj
        </button>
      </div>
    </div>
  );
}

function Editor({ editing, data, onClose, onSave }) {
  const { day, mealKey } = editing;
  const meal = data[day][mealKey];
  const [title, setTitle] = useState(meal.title);
  const [ingredients, setIngredients] = useState([...meal.ingredients]);
  const [recipe, setRecipe] = useState(meal.recipe);

  const save = () => {
    onSave(day, mealKey, { title, ingredients, recipe });
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3>Edytuj posiłek — {day} / {MEAL_KEYS.find((m) => m.key === mealKey).label}</h3>
        <div style={{ marginBottom: 8 }}>
          <label>Tytuł:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Składniki:</label>
          <textarea
            rows={4}
            value={ingredients.join("\n")}
            onChange={(e) => setIngredients(e.target.value.split(/\n/))}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Przygotowanie:</label>
          <textarea
            rows={4}
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={styles.smallBtn}>Anuluj</button>
          <button onClick={save} style={styles.btn}>Zapisz</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: "12px auto", padding: 12, fontFamily: "Arial, sans-serif" },
  tabs: { display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 },
  tab: { padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", background: "#f7f7f7" },
  tabActive: { padding: "8px 12px", borderRadius: 6, border: "1px solid #2b8a3e", background: "#e6ffe8" },
  content: { display: "flex", gap: 18, flexWrap: "wrap" },
  left: { flex: 2, minWidth: "100%", maxWidth: "100%" },
  right: { flex: 1, borderLeft: "1px solid #eee", paddingLeft: 12, minWidth: "100%", maxWidth: "100%" },
  card: { border: "1px solid #ddd", borderRadius: 8, padding: 10, marginBottom: 10, background: "#fff" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardBody: { marginTop: 8 },
  btn: { padding: "8px 10px", borderRadius: 6, border: "none", background: "#2b8a3e", color: "white" },
  smallBtn: { padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc", background: "#fff" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #ccc", flex: 1 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { width: "95%", maxWidth: 600, background: "white", padding: 16, borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.2)" },
  mobileSwitch: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 },
};
