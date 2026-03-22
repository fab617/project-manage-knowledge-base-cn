import { createContext, useContext, useState } from "react";
import processData from "./assets/process.json";
import performanceData from "./assets/performance.json";
import toolData from "./assets/tool.json";
import ioData from "./assets/io.json";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const groupedByDomain = processData.reduce((acc, process) => {
    if (!acc[process.domain]) {
      acc[process.domain] = [];
    }
    acc[process.domain].push(process);
    return acc;
  }, {});

  const groupedByGroup = processData.reduce((acc, process) => {
    if (!acc[process.group]) {
      acc[process.group] = [];
    }
    acc[process.group].push(process);
    return acc;
  }, {});

  const toolsWithUsage = toolData.map((tool) => {
    const usedInProcess = processData
      .filter((process) =>
        process.toolsAndTechniques?.some((t) => t.includes(tool.name))
      )
      .map((p) => p.process);
    return { ...tool, usedInProcess };
  });

  const ioWithUsage = ioData.map((io) => {
    const inputsOf = processData
      .filter((process) =>
        process.inputs?.some((i) => i.includes(io.name))
      )
      .map((p) => p.process);
    const outputsOf = processData
      .filter((process) =>
        process.outputs?.some((o) => o.includes(io.name))
      )
      .map((p) => p.process);
    return { ...io, inputsOf, outputsOf };
  });

  const data = {
    processes: processData,
    groupedByDomain,
    groupedByGroup,
    performanceDomains: performanceData.project_performance_domains || [],
    tools: toolsWithUsage,
    inputsOutputs: ioWithUsage,
  };

  return (
    <DataContext.Provider value={{ data, loading: false, error: null }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
