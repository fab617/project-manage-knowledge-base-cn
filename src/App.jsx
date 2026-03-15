import { useState, useEffect, useMemo } from "react";
import { Menu, Button, Switch, Card, Tabs, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import "./App.less";

function App() {
  const [processes, setProcesses] = useState([]);
  const [groupedByDomain, setGroupedByDomain] = useState({});
  const [groupedByGroup, setGroupedByGroup] = useState({});
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState("domain"); // 'domain' 或 'group'
  const [userExpandedDomain, setUserExpandedDomain] = useState(null);
  const [userExpandedGroup, setUserExpandedGroup] = useState(null);

  const formatList = (list) => {
    return list.replace("（", "<br/>（ ");
  };

  // 处理菜单展开/收起事件，确保每次只打开一个一级菜单
  const setExpandedSection = (menuType, sections) => {
    if (menuType === "domain") {
      // 只允许同时打开一个一级菜单，所以只取最后一个点击的
      setUserExpandedDomain(
        sections.length > 0 ? sections[sections.length - 1] : null
      );
    } else if (menuType === "group") {
      // 只允许同时打开一个一级菜单，所以只取最后一个点击的
      setUserExpandedGroup(
        sections.length > 0 ? sections[sections.length - 1] : null
      );
    }
  };

  useEffect(() => {
    // 读取processes.json文件
    fetch("./processes.json")
      .then((response) => response.json())
      .then((data) => {
        setProcesses(data);
        // 按领域分组
        const byDomain = data.reduce((acc, process) => {
          if (!acc[process.domain]) {
            acc[process.domain] = [];
          }
          acc[process.domain].push(process);
          return acc;
        }, {});
        setGroupedByDomain(byDomain);

        // 按过程组分组
        const byGroup = data.reduce((acc, process) => {
          if (!acc[process.group]) {
            acc[process.group] = [];
          }
          acc[process.group].push(process);
          return acc;
        }, {});
        setGroupedByGroup(byGroup);

        // 默认选择第一个过程或保存的过程
        if (data.length > 0) {
          const savedIndex = localStorage.getItem("selectedProcessIndex");
          let index = 0;
          if (savedIndex !== null && !isNaN(savedIndex) && savedIndex >= 0 && savedIndex < data.length) {
            index = parseInt(savedIndex, 10);
          }
          const process = data[index];
          setSelectedProcess(process);
          setUserExpandedDomain(process.domain);
          setUserExpandedGroup(process.group);
        }
      });
  }, []);

  // 使用useMemo计算菜单的展开状态
  const domainOpenKeys = useMemo(() => {
    return userExpandedDomain ? [userExpandedDomain] : [];
  }, [userExpandedDomain]);

  const groupOpenKeys = useMemo(() => {
    return userExpandedGroup ? [userExpandedGroup] : [];
  }, [userExpandedGroup]);

  // 随机访问过程
  const handleRandomProcess = () => {
    if (processes.length > 0) {
      const randomIndex = Math.floor(Math.random() * processes.length);
      const randomProcess = processes[randomIndex];
      setSelectedProcess(randomProcess);
      setUserExpandedDomain(randomProcess.domain);
      setUserExpandedGroup(randomProcess.group);
      localStorage.setItem("selectedProcessIndex", randomIndex);
      // 在移动端，选择过程后自动隐藏菜单
      if (window.innerWidth <= 768) {
        setShowMenu(false);
      }
    }
  };

  // 前一个过程
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

  // 后一个过程
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

  // 选择过程
  const handleSelectProcess = (process, index) => {
    setSelectedProcess(process);
    setUserExpandedDomain(process.domain);
    setUserExpandedGroup(process.group);
    localStorage.setItem("selectedProcessIndex", index);
    // 在移动端，选择过程后自动隐藏菜单
    if (window.innerWidth <= 768) {
      setShowMenu(false);
    }
  };

  // 切换菜单显示/隐藏
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // 切换菜单类型
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
          title="菜单"
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
          <div className="menu-tabs">
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
                  {/* 前三项：左th右td */}
                  <tr>
                    <th>领域</th>
                    <td>{selectedProcess.domain}</td>
                  </tr>
                  <tr>
                    <th>过程组</th>
                    <td>{selectedProcess.group}</td>
                  </tr>

                  {showDetails && (
                    <>
                      <tr>
                        <th>周期</th>
                        <td>{selectedProcess.cycle}</td>
                      </tr>
                      {/* 后面的：上th下td */}
                      <tr>
                        <th colSpan="2">定义</th>
                      </tr>
                      <tr>
                        <td colSpan="2" className="text-indent">
                          {selectedProcess.definition}
                        </td>
                      </tr>
                      {selectedProcess.effects && (
                        <>
                          <tr>
                            <th colSpan="2">作用</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
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
                            <th colSpan="2">输入</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              <ul>
                                {selectedProcess.inputs.map((input) => (
                                  <li
                                    key={input}
                                    dangerouslySetInnerHTML={{
                                      __html: formatList(input),
                                    }}
                                  ></li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        </>
                      )}
                      {selectedProcess.toolsandTechniques && (
                        <>
                          <tr>
                            <th colSpan="2">工具和技术</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              <ul>
                                {selectedProcess.toolsandTechniques.map(
                                  (technique) => (
                                    <li
                                      key={technique}
                                      dangerouslySetInnerHTML={{
                                        __html: formatList(technique),
                                      }}
                                    ></li>
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
                            <th colSpan="2">输出</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              <ul>
                                {selectedProcess.outputs.map((output) => (
                                  <li
                                    key={output}
                                    dangerouslySetInnerHTML={{
                                      __html: formatList(output),
                                    }}
                                  ></li>
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

export default App;