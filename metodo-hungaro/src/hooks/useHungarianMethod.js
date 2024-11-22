import { useState } from "react";
import {
  procesarMatriz,
  reducirFilas,
  reducirColumnas,
  asignarTareas,
  mostrarMatriz,
} from "../utils/hungarian";

export const useHungarianMethod = () => {
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState([]);

  const solveHungarianMethod = (matrix) => {
    // Paso 1: Procesar la matriz ingresada
    const matrizProcesada = procesarMatriz(matrix);

    // Paso 2: Reducir por filas
    const matrizReducidaFilas = reducirFilas(matrizProcesada);

    // Paso 3: Reducir por columnas
    const matrizReducidaColumnas = reducirColumnas(matrizReducidaFilas);

    // Paso 4: Asignar tareas
    const asignaciones = asignarTareas(matrizReducidaColumnas);

    // Paso 5: Mostrar la matriz final
    const matrizFinal = mostrarMatriz(matrizReducidaColumnas);

    // Actualizar el progreso del algoritmo
    setSteps([
      { step: "Matriz procesada", matrix: matrizProcesada },
      { step: "Reducción por filas", matrix: matrizReducidaFilas },
      { step: "Reducción por columnas", matrix: matrizReducidaColumnas },
      { step: "Asignaciones", assignments: asignaciones },
      { step: "Matriz final", matrix: matrizFinal }, 
    ]);

    // Guardar el resultado final
    setResult(asignaciones);
  };

  return { steps, result, solveHungarianMethod };
};
