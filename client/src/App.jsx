import "./App.css";
import BaseComponent from "./Components/BaseComponent";
import Chatbot from "./Components/Chatbot";

console.log("App component is loading...");

const App = () => {
  console.log("App component is rendering...");

  return (
    <div className="App">
      <div
        style={{
          color: "black",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <BaseComponent />
        <Chatbot />
      </div>
    </div>
  );
};

export default App;
