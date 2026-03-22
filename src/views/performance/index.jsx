import { useState, useMemo } from "react";
import { Menu, Button, Switch, Card, Drawer } from "antd";
import { MenuOutlined, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useData } from "../../DataContext";
import "./index.less";

function Performance() {
  const { data } = useData();
  const performanceDomains = data.performanceDomains || [];
  
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [userExpandedDomain, setUserExpandedDomain] = useState(null);

  const setExpandedSection = (sections) => {
    setUserExpandedDomain(
      sections.length > 0 ? sections[sections.length - 1] : null
    );
  };

  useMemo(() => {
    if (performanceDomains.length > 0) {
      const savedIndex = localStorage.getItem("selectedPerformanceDomainIndex");
      let index = 0;
      if (savedIndex !== null && !isNaN(savedIndex) && savedIndex >= 0 && savedIndex < performanceDomains.length) {
        index = parseInt(savedIndex, 10);
      }
      const domain = performanceDomains[index];
      setSelectedDomain(domain);
      setUserExpandedDomain(domain.domain_name);
    }
  }, [performanceDomains]);

  const domainOpenKeys = useMemo(() => {
    return userExpandedDomain ? [userExpandedDomain] : [];
  }, [userExpandedDomain]);

  const handleRandomDomain = () => {
    if (performanceDomains.length > 0) {
      const randomIndex = Math.floor(Math.random() * performanceDomains.length);
      const randomDomain = performanceDomains[randomIndex];
      setSelectedDomain(randomDomain);
      setUserExpandedDomain(randomDomain.domain_name);
      localStorage.setItem("selectedPerformanceDomainIndex", randomIndex);
      if (window.innerWidth <= 768) {
        setShowMenu(false);
      }
    }
  };

  const handlePrevDomain = () => {
    if (selectedDomain) {
      const currentIndex = performanceDomains.indexOf(selectedDomain);
      const prevIndex = (currentIndex - 1 + performanceDomains.length) % performanceDomains.length;
      const prevDomain = performanceDomains[prevIndex];
      setSelectedDomain(prevDomain);
      setUserExpandedDomain(prevDomain.domain_name);
      localStorage.setItem("selectedPerformanceDomainIndex", prevIndex);
    }
  };

  const handleNextDomain = () => {
    if (selectedDomain) {
      const currentIndex = performanceDomains.indexOf(selectedDomain);
      const nextIndex = (currentIndex + 1) % performanceDomains.length;
      const nextDomain = performanceDomains[nextIndex];
      setSelectedDomain(nextDomain);
      setUserExpandedDomain(nextDomain.domain_name);
      localStorage.setItem("selectedPerformanceDomainIndex", nextIndex);
    }
  };

  const handleSelectDomain = (domain, index) => {
    setSelectedDomain(domain);
    setUserExpandedDomain(domain.domain_name);
    localStorage.setItem("selectedPerformanceDomainIndex", index);
    if (window.innerWidth <= 768) {
      setShowMenu(false);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const formatArray = (arr) => {
    if (!arr) return null;
    if (typeof arr === 'string') return arr;
    return arr;
  };

  const renderArrayItems = (arr, isList = true) => {
    if (!arr) return null;
    if (typeof arr === 'string') {
      return <p>{arr}</p>;
    }
    if (Array.isArray(arr)) {
      if (isList) {
        return (
          <ul>
            {arr.map((item, index) => (
              <li key={index}>{formatArray(item)}</li>
            ))}
          </ul>
        );
      }
      return arr.map((item, index) => (
        <p key={index}>{formatArray(item)}</p>
      ));
    }
    return <p>{String(arr)}</p>;
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
          <h1>绩效域</h1>
        </div>
        <div className="header-right">
          <Button onClick={handlePrevDomain}>
            &larr;
          </Button>
          <Button onClick={handleRandomDomain}>
            随机
          </Button>
          <Button onClick={handleNextDomain}>
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
          <Menu
            mode="inline"
            openKeys={domainOpenKeys}
            selectedKeys={selectedDomain ? [selectedDomain.domain_name] : []}
            onOpenChange={(keys) => setExpandedSection(keys)}
            items={performanceDomains.map((domain) => ({
              key: domain.domain_name,
              label: domain.domain_name,
              onClick: () => handleSelectDomain(domain, performanceDomains.indexOf(domain)),
            }))}
          />
        </Drawer>

        <main className="content">
          {selectedDomain ? (
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
                  {selectedDomain.domain_name}
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
                    <th colSpan="2">定义</th>
                  </tr>
                  <tr>
                    <td colSpan="2" className="text-indent">{selectedDomain.definition}</td>
                  </tr>

                  {showDetails && (
                    <>
                      {selectedDomain.expected_goals && (
                        <>
                          <tr>
                            <th colSpan="2">预期目标</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              {renderArrayItems(selectedDomain.expected_goals.specific_goals)}
                            </td>
                          </tr>
                        </>
                      )}

                      {selectedDomain.performance_points && (
                        <>
                          <tr>
                            <th colSpan="2">绩效要点</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              {selectedDomain.performance_points.key_points && (
                                <div className="point-section">
                                  <strong>关键点：</strong>
                                  {renderArrayItems(performanceDomains.performance_points?.key_points || selectedDomain.performance_points.key_points)}
                                </div>
                              )}
                              {selectedDomain.performance_points.purpose && (
                                <div className="point-section">
                                  <strong>目的：</strong>
                                  {renderArrayItems(selectedDomain.performance_points.purpose)}
                                </div>
                              )}
                              {selectedDomain.performance_points.function && (
                                <div className="point-section">
                                  <strong>功能：</strong>
                                  {renderArrayItems(selectedDomain.performance_points.function)}
                                </div>
                              )}
                            </td>
                          </tr>
                        </>
                      )}

                      {selectedDomain.relationship_with_other_domains && (
                        <>
                          <tr>
                            <th colSpan="2">与其他绩效域的关系</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              {renderArrayItems(selectedDomain.relationship_with_other_domains)}
                            </td>
                          </tr>
                        </>
                      )}

                      {selectedDomain.inspection_methods && (
                        <>
                          <tr>
                            <th colSpan="2">检查方法</th>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              {renderArrayItems(selectedDomain.inspection_methods)}
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
              <p>请选择一个绩效域</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export default Performance;
