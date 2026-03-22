import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState({
    processes: [],
    groupedByDomain: {},
    groupedByGroup: {},
    performanceDomains: [],
    tools: [],
    inputsOutputs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("./process.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch processes");
        return res.json();
      }),
      fetch("./performance.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch performance");
        return res.json();
      }),
      fetch("./tool.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tools");
        return res.json();
      }),
      fetch("./io.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch inputs outputs");
        return res.json();
      }),
    ])
      .then(([processesData, performanceData, toolsData, ioData]) => {
        const groupedByDomain = processesData.reduce((acc, process) => {
          if (!acc[process.domain]) {
            acc[process.domain] = [];
          }
          acc[process.domain].push(process);
          return acc;
        }, {});

        const groupedByGroup = processesData.reduce((acc, process) => {
          if (!acc[process.group]) {
            acc[process.group] = [];
          }
          acc[process.group].push(process);
          return acc;
        }, {});

        const toolsWithUsage = toolsData.map((tool) => {
          const usedInProcess = processesData
            .filter((process) =>
              process.toolsAndTechniques?.some((t) => t.includes(tool.name))
            )
            .map((p) => p.process);
          return { ...tool, usedInProcess };
        });

        const ioWithUsage = ioData.map((io) => {
          const inputsOf = processesData
            .filter((process) =>
              process.inputs?.some((i) => i.includes(io.name))
            )
            .map((p) => p.process);
          const outputsOf = processesData
            .filter((process) =>
              process.outputs?.some((o) => o.includes(io.name))
            )
            .map((p) => p.process);
          return { ...io, inputsOf, outputsOf };
        });

        setData({
          processes: processesData,
          groupedByDomain,
          groupedByGroup,
          performanceDomains: performanceData.project_performance_domains || [],
          tools: toolsWithUsage,
          inputsOutputs: ioWithUsage,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
