import { useState, useMemo } from "react";
import { Menu, Button, Card, Drawer } from "antd";
import { MenuOutlined, HomeOutlined, SoundOutlined, PauseOutlined } from "@ant-design/icons";
import { Link, useSearchParams } from "react-router-dom";
import { useData } from "../../DataContext";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import "./index.less";

function Tools() {
  const { data } = useData();
  const tools = data.tools || [];
  const processes = data.processes || [];
  const { isSpeaking, speak, stop } = useSpeechSynthesis();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTool, setSelectedTool] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const currentName = searchParams.get("name");

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  useMemo(() => {
    if (tools.length > 0) {
      let index = -1;
      if (currentName) {
        index = tools.findIndex(t => t.name === currentName);
      }
      if (index === -1) {
        const savedIndex = localStorage.getItem("selectedToolIndex");
        if (savedIndex !== null && !isNaN(savedIndex) && savedIndex >= 0 && savedIndex < tools.length) {
          index = parseInt(savedIndex, 10);
        } else {
          index = 0;
        }
      }
      setSelectedTool(tools[index]);
    }
  }, [tools, currentName]);

  const updateUrl = (tool) => {
    setSearchParams({ name: tool.name });
  };

  const handlePrevTool = () => {
    if (selectedTool) {
      const currentIndex = tools.indexOf(selectedTool);
      const prevIndex = (currentIndex - 1 + tools.length) % tools.length;
      setSelectedTool(tools[prevIndex]);
      localStorage.setItem("selectedToolIndex", prevIndex);
      updateUrl(tools[prevIndex]);
      if (isSpeaking) stop();
    }
  };

  const handleNextTool = () => {
    if (selectedTool) {
      const currentIndex = tools.indexOf(selectedTool);
      const nextIndex = (currentIndex + 1) % tools.length;
      setSelectedTool(tools[nextIndex]);
      localStorage.setItem("selectedToolIndex", nextIndex);
      updateUrl(tools[nextIndex]);
      if (isSpeaking) stop();
    }
  };

  const handleRandomTool = () => {
    if (tools.length > 0) {
      const randomIndex = Math.floor(Math.random() * tools.length);
      setSelectedTool(tools[randomIndex]);
      localStorage.setItem("selectedToolIndex", randomIndex);
      updateUrl(tools[randomIndex]);
      if (isSpeaking) stop();
    }
  };

  const handleSelectTool = (tool, index) => {
    setSelectedTool(tool);
    localStorage.setItem("selectedToolIndex", index);
    updateUrl(tool);
    if (window.innerWidth <= 768) {
      setShowMenu(false);
    }
    if (isSpeaking) stop();
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
          <h1>工具技术</h1>
        </div>
        <div className="header-right">
          <Button onClick={() => {
            if (!selectedTool) return;
            if (isSpeaking) {
              stop();
              return;
            }
            let text = selectedTool.name + "。" + (selectedTool.definition || "");
            if (selectedTool.usedInProcess && selectedTool.usedInProcess.length > 0) {
              text += "所用过程：" + selectedTool.usedInProcess.join("、") + "。";
            }
            speak(text);
          }} disabled={!selectedTool}>
            {isSpeaking ? <><PauseOutlined /> 停止</> : <><SoundOutlined /> 朗读</>}
          </Button>
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
              <Link to="/"><HomeOutlined style={{ fontSize: '18px', color: '#78909C' }} /></Link>
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
                                to={`/process?name=${encodeURIComponent(processName)}`}
                                onClick={() => {
                                  const processIndex = processes.findIndex(p => p.process === processName);
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
