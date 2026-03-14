import { useState, useEffect } from 'react'
import { Menu, Button, Switch, Form, Card, Space, Divider, Tabs } from 'antd'
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
          <Space>
            <Button 
              type="primary" 
              onClick={handleRandomProcess}
            >
              随机访问过程
            </Button>
            <Space>
              <Switch 
                checked={showDetails} 
                onChange={(checked) => setShowDetails(checked)}
                checkedChildren="显示"
                unCheckedChildren="隐藏"
              />
            </Space>
          </Space>
        </div>
      </header>
      
      <div className={`app-content ${showMenu ? 'menu-open' : ''}`}>
        <nav className="menu">
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
        </nav>
        
        <main className="content">
          {selectedProcess ? (
            <Card title={selectedProcess.process} className="process-card">
              <Form layout="vertical">
                <Form.Item label="领域">
                  <span>{selectedProcess.domain}</span>
                </Form.Item>
                <Form.Item label="过程组">
                  <span>{selectedProcess.group}</span>
                </Form.Item>
                <Form.Item label="周期">
                  <span>{selectedProcess.cycle}</span>
                </Form.Item>
                
                {showDetails && (
                  <>
                    <Divider />
                    <Form.Item label="定义">
                      <span>{selectedProcess.definition}</span>
                    </Form.Item>
                    <Form.Item label="作用">
                      <span>{selectedProcess.effect}</span>
                    </Form.Item>
                    {selectedProcess.document && (
                      <Form.Item label="输出文档">
                        <span>{selectedProcess.document}</span>
                      </Form.Item>
                    )}
                  </>
                )}
              </Form>
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