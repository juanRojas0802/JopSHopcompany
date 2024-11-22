import React, { useState, useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Network } from "vis-network";

// Registra los componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const HungarianMethod = () => {
  const [matrix, setMatrix] = useState([
    [16, 13, 15, 11],
    [15, 9999, 20, 13],
    [5, 7, 10, 6],
  ]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [method, setMethod] = useState("hungarian"); // Método seleccionado (hungarian o assignment)
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error
  const graphContainer = useRef(null); // Contenedor para el grafo

  useEffect(() => {
    if (method === "assignment" && graphContainer.current) {
      // Configuración de nodos y bordes dinámicos basados en la matriz
      const nodes = matrix
        .map((_, index) => ({
          id: index + 1,
          label: `A${index + 1}`,
          group: "source",
          font: { color: "black", align: "center" }, // Letra negra y centrada
        }))
        .concat(
          matrix[0].map((_, index) => ({
            id: matrix.length + index + 1,
            label: `T${index + 1}`,
            group: "task",
            font: { color: "black", align: "center" }, // Letra negra y centrada
          }))
        );

      const edges = [];
      matrix.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          edges.push({
            from: rowIndex + 1,
            to: matrix.length + colIndex + 1,
            label: cell === 9999 ? "M" : cell.toString(),
          });
        });
      });

      const data = { nodes, edges };

      const options = {
        nodes: {
          shape: "circle",
          size: 30,
          font: { size: 14, color: "black", vadjust: 0 }, // Letra negra dentro del círculo
          borderWidth: 2,
        },
        edges: {
          font: { align: "horizontal" },
          arrows: { to: { enabled: true } },
        },
        groups: {
          source: { color: { background: "blue", border: "darkblue" } },
          task: { color: { background: "green", border: "darkgreen" } },
        },
        physics: false,
      };

      new Network(graphContainer.current, data, options);
    }
  }, [method, matrix]);

  // Resolver el método seleccionado
  const solveHungarianMethod = () => {
    let stepsList = [];
    let solvedMatrix = [...matrix];

    if (method === "hungarian") {
      // Método Húngaro
      solvedMatrix = reduceRows(solvedMatrix);
      stepsList.push({
        description: "Paso 1: Reducción de filas",
        matrix: solvedMatrix,
      });

      solvedMatrix = reduceColumns(solvedMatrix);
      stepsList.push({
        description: "Paso 2: Reducción de columnas",
        matrix: solvedMatrix,
      });

      solvedMatrix = createFictitiousDemands(solvedMatrix);
      stepsList.push({
        description: "Paso 3: Crear demandas ficticias",
        matrix: solvedMatrix,
      });

      solvedMatrix = makeAssignments(solvedMatrix);
      stepsList.push({
        description: "Paso 4: Realizar asignación",
        matrix: solvedMatrix,
      });
    } else if (method === "assignment") {
      // Método de Asignación
      solvedMatrix = solveAssignmentProblem(solvedMatrix);
      stepsList.push({
        description: "Paso único: Resolver con asignación directa",
        matrix: solvedMatrix,
      });
    }

    setSteps(stepsList);
    setCurrentStep(0);
  };

  // Función para resolver por asignación directa
  const solveAssignmentProblem = (matrix) => {
    return matrix.map((row, i) =>
      row.map((cell, j) => (i === j ? 1 : 0)) // Ejemplo de asignación directa
    );
  };

  // Funciones auxiliares para el Método Húngaro
  const reduceRows = (matrix) => {
    return matrix.map((row) => {
      const minValue = Math.min(...row.filter((val) => val !== 9999));
      return row.map((cell) => (cell === 9999 ? cell : cell - minValue));
    });
  };

  const reduceColumns = (matrix) => {
    const transposedMatrix = transposeMatrix(matrix);
    const reducedColumns = reduceRows(transposedMatrix);
    return transposeMatrix(reducedColumns);
  };

  const transposeMatrix = (matrix) => {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  };

  const createFictitiousDemands = (matrix) => {
    return matrix.map((row) =>
      row.map((cell) => (cell === 0 ? 1 : cell)) // Sustituir ceros ficticios
    );
  };

  const makeAssignments = (matrix) => {
    return matrix.map((row) =>
      row.map((cell) => (cell === 0 ? 1 : cell)) // Lógica de asignación simplificada
    );
  };

  // Funciones para manejar la matriz
  const handleMatrixChange = (rowIndex, colIndex, value) => {
    const newValue = value === "M" ? 9999 : parseInt(value, 10);
    if (isNaN(newValue)) {
      setErrorMessage("El valor debe ser un número.");
      return;
    }
    setErrorMessage("");
    const updatedMatrix = [...matrix];
    updatedMatrix[rowIndex][colIndex] = newValue;
    setMatrix(updatedMatrix);
  };

  const addRow = () => setMatrix([...matrix, Array(matrix[0].length).fill(0)]);
  const removeRow = () => setMatrix(matrix.slice(0, -1));
  const addColumn = () => setMatrix(matrix.map((row) => [...row, 0]));
  const removeColumn = () => setMatrix(matrix.map((row) => row.slice(0, -1)));

  return (
    <div className="hungarian-method-container p-8 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">Job Shop Company</h2>

      {/* Botones para seleccionar el método */}
      <div className="method-buttons text-center mb-6">
        <button
          onClick={() => setMethod("hungarian")}
          className={`p-3 m-2 rounded-lg font-semibold ${
            method === "hungarian" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Resolver por Método Húngaro
        </button>
        <button
          onClick={() => setMethod("assignment")}
          className={`p-3 m-2 rounded-lg font-semibold ${
            method === "assignment" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Resolver por Método de Asignación
        </button>
      </div>

      {/* Mostrar la matriz editable */}
      <div className="matrix-container mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Matriz actual:</h3>
        {matrix.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-3">
            {row.map((col, colIndex) => (
              <input
                key={colIndex}
                type="text"
                value={col === 9999 ? "M" : col}
                onChange={(e) => handleMatrixChange(rowIndex, colIndex, e.target.value)}
                className="matrix-input border-2 border-gray-300 p-3 m-1 text-center text-lg font-semibold rounded-md focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
        ))}
        {errorMessage && <div className="text-red-500 text-center mt-2">{errorMessage}</div>}
      </div>

      {/* Controles para modificar la matriz */}
      <div className="controls mb-6 flex justify-center space-x-4">
        <button onClick={addRow} className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
          Agregar Fila
        </button>
        <button onClick={removeRow} className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600">
          Eliminar Fila
        </button>
        <button onClick={addColumn} className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
          Agregar Columna
        </button>
        <button onClick={removeColumn} className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600">
          Eliminar Columna
        </button>
      </div>

      {/* Botón para resolver */}
      <div className="resolve-button text-center">
        <button
          onClick={solveHungarianMethod}
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
        >
          Resolver {method === "hungarian" ? "Método Húngaro" : "Método de Asignación"}
        </button>
      </div>

      {/* Mostrar pasos o grafo */}
      {method === "hungarian" && steps.length > 0 && (
        <div className="steps-container mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Pasos:</h3>
          <div>
            <p className="font-semibold">{steps[currentStep].description}</p>
            {steps[currentStep].matrix.map((row, index) => (
              <div key={index} className="flex justify-center mb-2">
                {row.map((col, colIndex) => (
                  <span
                    key={colIndex}
                    className="matrix-element border-2 p-3 m-1 text-center text-lg font-semibold"
                  >
                    {col === 9999 ? "M" : col}
                  </span>
                ))}
              </div>
            ))}
            {currentStep < steps.length - 1 && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
              >
                Siguiente paso
              </button>
            )}
          </div>
        </div>
      )}

      {method === "assignment" && (
        <div className="graph-container mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Grafo de Asignación:</h3>
          <div ref={graphContainer} style={{ height: "500px", border: "1px solid #ddd" }}></div>
        </div>
      )}
    </div>
  );
};

export default HungarianMethod;
