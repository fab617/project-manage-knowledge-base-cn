import { useState, useMemo } from "react";
import { Menu, Button, Card, Drawer } from "antd";
import { MenuOutlined, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useData } from "../../DataContext";
import "./index.less";

function Tools() {
  const { data } = useData();
  const tools = data.tools || [];
  
  const [selectedTool, setSelectedTool] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  useMemo(() => {
    if (tools.length > 0) {
      const savedIndex = localStorage.getItem("selectedToolIndex");
      let index = 0;
      if (savedIndex !== null && !isNaN(savedIndex) && savedIndex >= 0 && savedIndex < tools.length) {
        index = parseInt(savedIndex, 10);
      }
      setSelectedTool(tools[index]);
    }
  }, [tools]);

  const handlePrevTool = () => {
    if (selectedTool) {
      const currentIndex = tools.indexOf(selectedTool);
      const prevIndex = (currentIndex - 1 + tools.length) % tools.length;
      setSelectedTool(tools[prevIndex]);
      localStorage.setItem("selectedToolIndex", prevIndex);
    }
  };

  const handleNextTool = () => {
    if (selectedTool) {
      const currentIndex = tools.indexOf(selectedTool);
      const nextIndex = (currentIndex + 1) % tools.length;
      setSelectedTool(tools[nextIndex]);
      localStorage.setItem("selectedToolIndex", nextIndex);
    }
  };

  const handleRandomTool = () => {
    if (tools.length > 0) {
      const randomIndex = Math.floor(Math.random() * tools.length);
      setSelectedTool(tools[randomIndex]);
      localStorage.setItem("selectedToolIndex", randomIndex);
    }
  };

  const handleSelectTool = (tool, index) => {
    setSelectedTool(tool);
    localStorage.setItem("selectedToolIndex", index);
    if (window.innerWidth <= 768) {
      setShowMenu(false);
    }
  };

  const menuItems = tools.map((tool, index) => ({
    key: index.toString(),
    label: tool.name,
  }));

  const handleMenuClick = (e) => {
    const index = parseInt(e.key, 10);
    handleSelectTool(tools[index], index);
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
          <h1>工具与技术</h1>
        </div>
        <div className="header-right">
          <Button onClick={handlePrevTool}>
            &larr;
          </Button>
          <Button onClick={handleRandomTool}>
            随机
          </Button>
          <Button onClick={handleNextTool}>
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
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedTool ? [tools.indexOf(selectedTool).toString()] : []}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Drawer>

        <main className="content">
          {selectedTool && (
            <Card className="process-card">
              <div slot="header" className="card-header">
                <span className="space">&nbsp;</span>
                <span className="title">
                  {selectedTool.name}
                </span>
                <span className="switch">
                  &nbsp;
                </span>
              </div>
              <table className="process-table" cellSpacing="0">
                <tbody>
                  <tr>
                    <th colSpan="2">定义</th>
                  </tr>
                  <tr>
                    <td colSpan="2" className="text-indent">{selectedTool.definition}</td>
                  </tr>
                  {selectedTool.usedInProcess && selectedTool.usedInProcess.length > 0 && (
                    <>
                      <tr>
                        <th colSpan="2">所用过程</th>
                      </tr>
                      <tr>
                        <td colSpan="2">
                          <ul className="process-links">
                            {selectedTool.usedInProcess.map((processName, idx) => (
                              <li><Link
                                key={idx}
                                to="/process"
                                onClick={() => {
                                  const processIndex = data.processes.findIndex(p => p.process === processName);
                                  if (processIndex !== -1) {
                                    localStorage.setItem("selectedProcessIndex", processIndex);
                                  }
                                }}
                              >
                                {processName}
                              </Link></li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export default Tools;
