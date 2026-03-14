import { useState, useEffect } from 'react'
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

  // 切换分组展开/折叠
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleMenu}>
            ☰
          </button>
          <h1>过程</h1>
        </div>
        <div className="header-right">
          <button className="random-button" onClick={handleRandomProcess}>
            随机访问过程
          </button>
          <div className="toggle-container">
            <label>
              <input 
                type="checkbox" 
                checked={showDetails} 
                onChange={() => setShowDetails(!showDetails)}
              />
              显示详细内容
            </label>
          </div>
        </div>
      </header>
      
      <div className={`app-content ${showMenu ? 'menu-open' : ''}`}>
        <nav className="menu">
          <div className="menu-tabs">
            <button 
              className={`menu-tab ${activeMenu === 'domain' ? 'active' : ''}`}
              onClick={() => switchMenu('domain')}
            >
              知识领域
            </button>
            <button 
              className={`menu-tab ${activeMenu === 'group' ? 'active' : ''}`}
              onClick={() => switchMenu('group')}
            >
              过程组
            </button>
          </div>
          
          {activeMenu === 'domain' && (
            <div className="menu-content">
              {Object.entries(groupedByDomain).map(([domain, domainProcesses]) => {
                const isExpanded = expandedSection === domain;
                return (
                  <div key={domain} className="menu-section">
                    <h2 className="section-header" onClick={() => toggleSection(domain)}>
                      {domain}
                      <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </h2>
                    {isExpanded && (
                      <ul>
                        {domainProcesses.map((process) => (
                          <li 
                            key={process.process} 
                            className={selectedProcess?.process === process.process ? 'active' : ''}
                            onClick={() => handleSelectProcess(process)}
                          >
                            {process.process}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {activeMenu === 'group' && (
            <div className="menu-content">
              {Object.entries(groupedByGroup).map(([group, groupProcesses]) => {
                const isExpanded = expandedSection === group;
                return (
                  <div key={group} className="menu-section">
                    <h2 className="section-header" onClick={() => toggleSection(group)}>
                      {group}
                      <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </h2>
                    {isExpanded && (
                      <ul>
                        {groupProcesses.map((process) => (
                          <li 
                            key={process.process} 
                            className={selectedProcess?.process === process.process ? 'active' : ''}
                            onClick={() => handleSelectProcess(process)}
                          >
                            {process.process}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>
        
        <main className="content">
          {selectedProcess ? (
            <div className="process-detail">
              <h2>{selectedProcess.process}</h2>
              <div className="process-meta">
                <p><strong>领域：</strong>{selectedProcess.domain}</p>
                <p><strong>过程组：</strong>{selectedProcess.group}</p>
                <p><strong>周期：</strong>{selectedProcess.cycle}</p>
              </div>
              
              {showDetails && (
                <div className="process-details">
                  <p><strong>定义：</strong>{selectedProcess.definition}</p>
                  <p><strong>作用：</strong>{selectedProcess.effect}</p>
                  {selectedProcess.document && (
                    <p><strong>输出文档：</strong>{selectedProcess.document}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>请选择一个过程</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App