import { useState, useMemo } from "react";
import { Menu, Button, Switch, Card, Tabs, Drawer } from "antd";
import { MenuOutlined, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useData } from "../../DataContext";
import "./index.less";

function Process() {
  const { data } = useData();
  const processes = data.processes || [];
  const groupedByDomain = data.groupedByDomain || {};
  const groupedByGroup = data.groupedByGroup || {};
  const ioList = data.inputsOutputs || [];
  const toolsList = data.tools || [];
  
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState("domain");
  const [userExpandedDomain, setUserExpandedDomain] = useState(null);
  const [userExpandedGroup, setUserExpandedGroup] = useState(null);

  const formatList = (list) => {
    return list.replace("（", "<br/>（ ");
  };

  const findAllMatchingIOs = (text, ioList) => {
    return ioList.filter(io => text.includes(io.name));
  };

  const findAllMatchingTools = (text, toolsList) => {
    return toolsList.filter(tool => text.includes(tool.name));
  };

  const renderWithToolLinks = (text) => {
    if (!text) return null;
    const matchedTools = findAllMatchingTools(text, toolsList);
    if (matchedTools.length === 0) {
      return <span dangerouslySetInnerHTML={{ __html: formatList(text) }} />;
    }
    matchedTools.sort((a, b) => b.name.length - a.name.length);
    const matches = [];
    matchedTools.forEach((tool) => {
      const index = text.indexOf(tool.name);
      if (index !== -1) {
        let overlaps = false;
        for (const m of matches) {
          if (index < m.end && index + tool.name.length > m.start) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          matches.push({ tool, start: index, end: index + tool.name.length });
        }
      }
    });
    matches.sort((a, b) => a.start - b.start);
    const parts = [];
    let lastIndex = 0;
    matches.forEach(({ tool, start, end }) => {
      if (start > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatList(text.slice(lastIndex, start)) }} />);
      }
      parts.push(
        <Link
          key={`tool-${start}`}
          to="/tools"
          onClick={() => {
            const toolIndex = toolsList.indexOf(tool);
            if (toolIndex !== -1) {
              localStorage.setItem("selectedToolIndex", toolIndex);
            }
          }}
        >
          {tool.name}
        </Link>
      );
      lastIndex = end;
    });
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatList(text.slice(lastIndex)) }} />);
    }
    return parts;
  };

  const renderWithIOLinks = (text) => {
    if (!text) return null;
    const matchedIOs = findAllMatchingIOs(text, ioList);
    if (matchedIOs.length === 0) {
      return <span dangerouslySetInnerHTML={{ __html: formatList(text) }} />;
    }
    matchedIOs.sort((a, b) => b.name.length - a.name.length);
    const matches = [];
    matchedIOs.forEach((io) => {
      const index = text.indexOf(io.name);
      if (index !== -1) {
        let overlaps = false;
        for (const m of matches) {
          if (index < m.end && index + io.name.length > m.start) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          matches.push({ io, start: index, end: index + io.name.length });
        }
      }
    });
    matches.sort((a, b) => a.start - b.start);
    const parts = [];
    let lastIndex = 0;
    matches.forEach(({ io, start, end }) => {
      if (start > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatList(text.slice(lastIndex, start)) }} />);
      }
      parts.push(
        <Link
          key={`io-${start}`}
          to="/inputs"
          onClick={() => {
            const ioIndex = ioList.indexOf(io);
            if (ioIndex !== -1) {
              localStorage.setItem("selectedIOIndex", ioIndex);
            }
          }}
        >
          {io.name}
        </Link>
      );
      lastIndex = end;
    });
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatList(text.slice(lastIndex)) }} />);
    }
    return parts;
  };

  const setExpandedSection = (menuType, sections) => {
    if (menuType === "domain") {
      setUserExpandedDomain(
        sections.length > 0 ? sections[sections.length - 1] : null
      );
    } else if (menuType === "group") {
      setUserExpandedGroup(
        sections.length > 0 ? sections[sections.length - 1] : null
      );
    }
  };

  useMemo(() => {
    if (processes.length > 0) {
      const savedIndex = localStorage.getItem("selectedProcessIndex");
      let index = 0;
      if (savedIndex !== null && !isNaN(savedIndex) && savedIndex >= 0 && savedIndex < processes.length) {
        index = parseInt(savedIndex, 10);
      }
      const process = processes[index];
      setSelectedProcess(process);
      setUserExpandedDomain(process.domain);
      setUserExpandedGroup(process.group);
    }
  }, [processes]);

  const domainOpenKeys = useMemo(() => {
    return userExpandedDomain ? [userExpandedDomain] : [];
  }, [userExpandedDomain]);

  const groupOpenKeys = useMemo(() => {
    return userExpandedGroup ? [userExpandedGroup] : [];
  }, [userExpandedGroup]);

  const handleRandomProcess = () => {
    if (processes.length > 0) {
      const randomIndex = Math.floor(Math.random() * processes.length);
      const randomProcess = processes[randomIndex];
      setSelectedProcess(randomProcess);
      setUserExpandedDomain(randomProcess.domain);
      setUserExpandedGroup(randomProcess.group);
      localStorage.setItem("selectedProcessIndex", randomIndex);
      if (window.innerWidth <= 768) {
        setShowMenu(false);
      }
    }
  };

  const handlePrevProcess = () => {
    if (selectedProcess) {
      const currentIndex = processes.indexOf(selectedProcess);
      const prevIndex = (currentIndex - 1 + processes.length) % processes.length;
      const prevProcess = processes[prevIndex];
      setSelectedProcess(prevProcess);
      setUserExpandedDomain(prevProcess.domain);
      setUserExpandedGroup(prevProcess.group);
      localStorage.setItem("selectedProcessIndex", prevIndex);
    }
  };

  const handleNextProcess = () => {
    if (selectedProcess) {
      const currentIndex = processes.indexOf(selectedProcess);
      const nextIndex = (currentIndex + 1) % processes.length;
      const nextProcess = processes[nextIndex];
      setSelectedProcess(nextProcess);
      setUserExpandedDomain(nextProcess.domain);
      setUserExpandedGroup(nextProcess.group);
      localStorage.setItem("selectedProcessIndex", nextIndex);
    }
  };

  const handleSelectProcess = (process, index) => {
    setSelectedProcess(process);
    setUserExpandedDomain(process.domain);
    setUserExpandedGroup(process.group);
    localStorage.setItem("selectedProcessIndex", index);
    if (window.innerWidth <= 768) {
      setShowMenu(false);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const switchMenu = (menuType) => {
    setActiveMenu(menuType);
  };

  return (
    <div className="app">
        <header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={toggleMenu}
              className="menu-toggle"
            />
            <h1>过程</h1>
          </div>
        <div className="header-right">
          <Button onClick={handlePrevProcess}>
            &larr;
          </Button>
          <Button onClick={handleRandomProcess}>
            随机
          </Button>
          <Button onClick={handleNextProcess}>
            &rarr;
          </Button>
        </div>
      </header>

      <div className="app-content">
        <Drawer
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>菜单</span>
              <Link to="/"><HomeOutlined style={{ fontSize: '18px' }} /></Link>
            </div>
          }
          placement="left"
          onClose={() => setShowMenu(false)}
          open={showMenu}
          clickAway={true}
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <div className="menu-tabs" style={{ paddingLeft: '0.5rem' }}>
            <Tabs
              activeKey={activeMenu}
              onChange={switchMenu}
              items={[
                {
                  key: "domain",
                  label: "知识领域",
                },
                {
                  key: "group",
                  label: "过程组",
                },
              ]}
            />
          </div>

          {activeMenu === "domain" && (
            <div className="menu-content">
              <Menu
                mode="inline"
                openKeys={domainOpenKeys}
                selectedKeys={selectedProcess ? [selectedProcess.process] : []}
                onOpenChange={(keys) => setExpandedSection("domain", keys)}
                items={Object.entries(groupedByDomain).map(
                  ([domain, domainProcesses]) => ({
                    key: domain,
                    label: domain,
                    children: domainProcesses.map((process) => ({
                      key: process.process,
                      label: process.process,
                      onClick: () => handleSelectProcess(process, processes.indexOf(process)),
                    })),
                  })
                )}
              />
            </div>
          )}

          {activeMenu === "group" && (
            <div className="menu-content">
              <Menu
                mode="inline"
                openKeys={groupOpenKeys}
                selectedKeys={selectedProcess ? [selectedProcess.process] : []}
                onOpenChange={(keys) => setExpandedSection("group", keys)}
                items={Object.entries(groupedByGroup).map(
                  ([group, groupProcesses]) => ({
                    key: group,
                    label: group,
                    children: groupProcesses.map((process) => ({
                      key: process.process,
                      label: process.process,
                      onClick: () => handleSelectProcess(process, processes.indexOf(process)),
                    })),
                  })
                )}
              />
            </div>
          )}
        </Drawer>

        <main className="content">
          {selectedProcess ? (
            <Card
              className="process-card"
              styles={{
                header: { fontSize: "1rem" },
                body: { padding: 0 },
              }}
            >
              <div slot="header" className="card-header">
                <span className="space">&nbsp;</span>
                <span className="title">
                  {selectedProcess.process}
                </span>
                <span className="switch">
                  <Switch
                    checked={showDetails}
                    onChange={(checked) => setShowDetails(checked)}
                    checkedChildren="显示"
                    unCheckedChildren="隐藏"
                  />
                </span>
              </div>
              <table className="process-table" cellSpacing="0">
                <tbody>
                  <tr>
                    <th>领域</th>
                    <td>{selectedProcess.domain}</td>
                    <th>过程组</th>
                    <td>{selectedProcess.group}</td>
                  </tr>

                  {showDetails && (
                    <>
                      <tr>
                        <th>周期</th>
                        <td colSpan="3">{selectedProcess.cycle}</td>
                      </tr>
                      <tr>
                        <th colSpan="4">定义</th>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-indent">
                          {selectedProcess.definition}
                        </td>
                      </tr>
                      {selectedProcess.effects && (
                        <>
                          <tr>
                            <th colSpan="4">作用</th>
                          </tr>
                          <tr>
                            <td colSpan="4">
                              <ul>
                                {selectedProcess.effects.map((effect) => (
                                  <li
                                    key={effect}
                                    dangerouslySetInnerHTML={{
                                      __html: formatList(effect),
                                    }}
                                  ></li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        </>
                      )}
                      {selectedProcess.inputs && (
                        <>
                          <tr>
                            <th colSpan="4">输入</th>
                          </tr>
                          <tr>
                            <td colSpan="4">
                              <ul>
                                {selectedProcess.inputs.map((input) => (
                                  <li key={input}>{renderWithIOLinks(input)}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        </>
                      )}
                      {selectedProcess.toolsAndTechniques && (
                        <>
                          <tr>
                            <th colSpan="4">工具和技术</th>
                          </tr>
                          <tr>
                            <td colSpan="4">
                              <ul>
                                {selectedProcess.toolsAndTechniques.map(
                                  (technique) => (
                                    <li key={technique}>{renderWithToolLinks(technique)}</li>
                                  )
                                )}
                              </ul>
                            </td>
                          </tr>
                        </>
                      )}
                      {selectedProcess.outputs && (
                        <>
                          <tr>
                            <th colSpan="4">输出</th>
                          </tr>
                          <tr>
                            <td colSpan="4">
                              <ul>
                                {selectedProcess.outputs.map((output) => (
                                  <li key={output}>{renderWithIOLinks(output)}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </Card>
          ) : (
            <Card title="提示">
              <p>请选择一个过程</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export default Process;
