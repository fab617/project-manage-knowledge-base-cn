import { useState, useEffect } from 'react'
import { Menu, Button, Switch, Form, Card, Space, Divider, Tabs, Drawer } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import './App.css'

function App() {
  const [processes, setProcesses] = useState([]);
  const [groupedByDomain, setGroupedByDomain] = useState({});
  const [groupedByGroup, setGroupedByGroup] = useState({});
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState('domain'); // 'domain' 或 'group'
  const [expandedSection, setExpandedSection] = useState(null);

  const formatList = (list) => {
    return list.replace("（", '<br/>（ ');
  }

  useEffect(() => {
    // 读取processes.json文件
    fetch('/processes.json')
      .then(response => response.json())
      .then(data => {
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
        
        // 默认选择第一个过程
        if (data.length > 0) {
          const process = data[new Date().getTime() % data.length];
          setSelectedProcess(process);
          // 默认展开第一个过程所在的分组
          setExpandedSection(process.domain);
        }
      });
  }, []);

  // 随机访问过程
  const handleRandomProcess = () => {
    if (processes.length > 0) {
      const randomIndex = Math.floor(Math.random() * processes.length);
      const randomProcess = processes[randomIndex];
      setSelectedProcess(randomProcess);
      // 展开随机过程所在的分组
      setExpandedSection(activeMenu === 'domain' ? randomProcess.domain : randomProcess.group);
      // 在移动端，选择过程后自动隐藏菜单
      if (window.innerWidth <= 768) {
        setShowMenu(false);
      }
    }
  };

  // 选择过程
  const handleSelectProcess = (process) => {
    setSelectedProcess(process);
    // 展开选择过程所在的分组
    setExpandedSection(activeMenu === 'domain' ? process.domain : process.group);
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
    // 切换菜单类型时，展开当前选中过程所在的分组
    if (selectedProcess) {
      setExpandedSection(menuType === 'domain' ? selectedProcess.domain : selectedProcess.group);
    }
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
            <Button 
              type="primary" 
              onClick={handleRandomProcess}
            >
              随机访问过程
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
              padding: 0
            }
          }}
        >
          <div className="menu-tabs">
            <Tabs 
              activeKey={activeMenu} 
              onChange={switchMenu}
              items={[
                {
                  key: 'domain',
                  label: '知识领域'
                },
                {
                  key: 'group',
                  label: '过程组'
                }
              ]}
            />
          </div>
          
          {activeMenu === 'domain' && (
            <div className="menu-content">
              <Menu
                mode="inline"
                defaultOpenKeys={[expandedSection]}
                onOpenChange={(keys) => setExpandedSection(keys[0])}
                items={Object.entries(groupedByDomain).map(([domain, domainProcesses]) => ({
                  key: domain,
                  label: domain,
                  children: domainProcesses.map((process) => ({
                    key: process.process,
                    label: process.process,
                    onClick: () => handleSelectProcess(process)
                  }))
                }))}
              />
            </div>
          )}
          
          {activeMenu === 'group' && (
            <div className="menu-content">
              <Menu
                mode="inline"
                defaultOpenKeys={[expandedSection]}
                onOpenChange={(keys) => setExpandedSection(keys[0])}
                items={Object.entries(groupedByGroup).map(([group, groupProcesses]) => ({
                  key: group,
                  label: group,
                  children: groupProcesses.map((process) => ({
                    key: process.process,
                    label: process.process,
                    onClick: () => handleSelectProcess(process)
                  }))
                }))}
              />
            </div>
          )}
        </Drawer>
        
        <main className="content">
          {selectedProcess ? (
            <Card className="process-card" styles={{
              header: {fontSize: '1rem'},
              body: {padding: 0}}} >
                <div slot="header">
                  <span style={{fontSize: '1rem'}}>{selectedProcess.process}</span>
                  <span style={{float:'right'}}><Switch 
                    checked={showDetails} 
                    onChange={(checked) => setShowDetails(checked)}
                    checkedChildren="显示"
                    unCheckedChildren="隐藏"
                  /></span>
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
                        <td colSpan="2">{selectedProcess.definition}</td>
                      </tr>
                      <tr>
                        <th colSpan="2">作用</th>
                      </tr>
                      <tr>
                        <td colSpan="2">{selectedProcess.effect}</td>
                      </tr>
                      {selectedProcess.inputs && (
                        <>
                          <tr>
                            <th colSpan="2">输入</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              <ul>
                                {selectedProcess.inputs.map((input) => <li key={input} dangerouslySetInnerHTML={{__html: formatList(input)}}></li>)}
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
                                {selectedProcess.toolsandTechniques.map((technique) => <li key={technique} dangerouslySetInnerHTML={{__html: formatList(technique)}}></li>)}
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
                                {selectedProcess.outputs.map((output) => <li key={output} dangerouslySetInnerHTML={{__html: formatList(output)}}></li>)}
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
  )
}

export default App