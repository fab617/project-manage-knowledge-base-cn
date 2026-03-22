import { useState, useMemo } from "react";
import { Menu, Button, Card, Drawer } from "antd";
import { MenuOutlined, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useData } from "../../DataContext";
import "./index.less";

function InputsOutputs() {
  const { data } = useData();
  const inputsOutputs = data.inputsOutputs || [];
  
  const [selectedIO, setSelectedIO] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  useMemo(() => {
    if (inputsOutputs.length > 0) {
      const savedIndex = localStorage.getItem("selectedIOIndex");
      let index = 0;
      if (savedIndex !== null && !isNaN(savedIndex) && savedIndex >= 0 && savedIndex < inputsOutputs.length) {
        index = parseInt(savedIndex, 10);
      }
      setSelectedIO(inputsOutputs[index]);
    }
  }, [inputsOutputs]);

  const handlePrevIO = () => {
    if (selectedIO) {
      const currentIndex = inputsOutputs.indexOf(selectedIO);
      const prevIndex = (currentIndex - 1 + inputsOutputs.length) % inputsOutputs.length;
      setSelectedIO(inputsOutputs[prevIndex]);
      localStorage.setItem("selectedIOIndex", prevIndex);
    }
  };

  const handleNextIO = () => {
    if (selectedIO) {
      const currentIndex = inputsOutputs.indexOf(selectedIO);
      const nextIndex = (currentIndex + 1) % inputsOutputs.length;
      setSelectedIO(inputsOutputs[nextIndex]);
      localStorage.setItem("selectedIOIndex", nextIndex);
    }
  };

  const handleRandomIO = () => {
    if (inputsOutputs.length > 0) {
      const randomIndex = Math.floor(Math.random() * inputsOutputs.length);
      setSelectedIO(inputsOutputs[randomIndex]);
      localStorage.setItem("selectedIOIndex", randomIndex);
    }
  };

  const handleSelectIO = (io, index) => {
    setSelectedIO(io);
    localStorage.setItem("selectedIOIndex", index);
    if (window.innerWidth <= 768) {
      setShowMenu(false);
    }
  };

  const menuItems = inputsOutputs.map((io, index) => ({
    key: index.toString(),
    label: io.name,
  }));

  const handleMenuClick = (e) => {
    const index = parseInt(e.key, 10);
    handleSelectIO(inputsOutputs[index], index);
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
          <h1>输入输出</h1>
        </div>
        <div className="header-right">
          <Button onClick={handlePrevIO}>
            &larr;
          </Button>
          <Button onClick={handleRandomIO}>
            随机
          </Button>
          <Button onClick={handleNextIO}>
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
            selectedKeys={selectedIO ? [inputsOutputs.indexOf(selectedIO).toString()] : []}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Drawer>

        <main className="content">
          {selectedIO && (
            <Card className="process-card">
              <div slot="header" className="card-header">
                <span className="space">&nbsp;</span>
                <span className="title">
                  {selectedIO.name}
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
                    <td colSpan="2" className="text-indent">{selectedIO.definition}</td>
                  </tr>
                  {selectedIO.outputsOf && selectedIO.outputsOf.length > 0 && (
                    <>
                      <tr>
                        <th colSpan="2">输出过程</th>
                      </tr>
                      <tr>
                        <td colSpan="2">
                          <ul className="process-links">
                            {selectedIO.outputsOf.map((processName, idx) => (
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
                  {selectedIO.inputsOf && selectedIO.inputsOf.length > 0 && (
                    <>
                      <tr>
                        <th colSpan="2">输入过程</th>
                      </tr>
                      <tr>
                        <td colSpan="2">
                          <ul className="process-links">
                            {selectedIO.inputsOf.map((processName, idx) => (
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

export default InputsOutputs;
