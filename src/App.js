import React, { useState } from "react";
import "./App.css";

function App() {
  const [days, setDays] = useState([
    { name: "Poniedziałek", expanded: false, meals: {} },
    { name: "Wtorek", expanded: false, meals: {} },
    { name: "Środa", expanded: false, meals: {} },
    { name: "Czwartek", expanded: false, meals: {} },
    { name: "Piątek", expanded: false, meals: {} },
    { name: "Sobota", expanded: false, meals: {} },
    { name: "Niedziela", expanded: false, meals: {} },
  ]);

  const [shoppingList, setShoppingList] = useState([]);

  const toggleDay = (index) => {
    const newDays = [...days];
    newDays[index].expanded = !newDays[index].expanded;
    setDays(newDays);
  };

  const toggleIngredient = (index) => {
    const newList = [...shoppingList];
    newList[index].done = !newList[index].done;
    setShoppingList(newList);
  };

  return (
    <div className="App">
      <h1>Moja Dieta</h1>

      {days.map((day, i) => (
        <div
          key={i}
          style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
        >
          <h2
            style={{ cursor: "pointer" }}
            onClick={() => toggleDay(i)}
          >
            {day.name} {day.expanded ? "▲" : "▼"}
          </h2>

          {day.expanded &&
            Object.entries(day.meals).map(([mealKey, meal]) => (
              <div key={mealKey} style={{ marginLeft: "20px" }}>
                <h3>{meal.name}</h3>
                <p>{meal.recipe}</p>
                <ul>
                  {meal.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      ))}

      <h2>Lista zakupów</h2>
      <ul>
        {shoppingList.map((item, idx) => (
          <li
            key={idx}
            style={{ textDecoration: item.done ? "line-through" : "none" }}
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleIngredient(idx)}
            />
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
