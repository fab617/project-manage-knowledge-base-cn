import React, { useState, useMemo } from "react";
import { Menu, Button, Switch, Card, Drawer } from "antd";
import { MenuOutlined, HomeOutlined, SoundOutlined, PauseOutlined } from "@ant-design/icons";
import { Link, useSearchParams } from "react-router-dom";
import { useData } from "../../DataContext";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import "./index.less";

function Performance() {
  const { data } = useData();
  const performanceDomains = data.performanceDomains || [];
  const { isSpeaking, speak, stop } = useSpeechSynthesis();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [userExpandedDomain, setUserExpandedDomain] = useState(null);

  const currentName = searchParams.get("name");

  const setExpandedSection = (sections) => {
    setUserExpandedDomain(
      sections.length > 0 ? sections[sections.length - 1] : null
    );
  };

  useMemo(() => {
    if (performanceDomains.length > 0) {
      let index = -1;
      if (currentName) {
        index = performanceDomains.findIndex(d => d.name === currentName);
      }
      if (index === -1) {
        const savedIndex = localStorage.getItem("selectedPerformanceDomainIndex");
        if (savedIndex !== null && !isNaN(savedIndex) && savedIndex >= 0 && savedIndex < performanceDomains.length) {
          index = parseInt(savedIndex, 10);
        } else {
          index = 0;
        }
      }
      const domain = performanceDomains[index];
      setSelectedDomain(domain);
      setUserExpandedDomain(domain.name);
    }
  }, [performanceDomains, currentName]);

  const updateUrl = (domain) => {
    setSearchParams({ name: domain.name });
  };

  const domainOpenKeys = useMemo(() => {
    return userExpandedDomain ? [userExpandedDomain] : [];
  }, [userExpandedDomain]);

  const handleRandomDomain = () => {
    if (performanceDomains.length > 0) {
      const randomIndex = Math.floor(Math.random() * performanceDomains.length);
      const randomDomain = performanceDomains[randomIndex];
      setSelectedDomain(randomDomain);
      setUserExpandedDomain(randomDomain.name);
      localStorage.setItem("selectedPerformanceDomainIndex", randomIndex);
      updateUrl(randomDomain);
      if (window.innerWidth <= 768) {
        setShowMenu(false);
      }
      if (isSpeaking) {
        stop();
      }
    }
  };

  const handlePrevDomain = () => {
    if (selectedDomain) {
      const currentIndex = performanceDomains.indexOf(selectedDomain);
      const prevIndex = (currentIndex - 1 + performanceDomains.length) % performanceDomains.length;
      const prevDomain = performanceDomains[prevIndex];
      setSelectedDomain(prevDomain);
      setUserExpandedDomain(prevDomain.name);
      localStorage.setItem("selectedPerformanceDomainIndex", prevIndex);
      updateUrl(prevDomain);
      if (isSpeaking) {
        stop();
      }
    }
  };

  const handleNextDomain = () => {
    if (selectedDomain) {
      const currentIndex = performanceDomains.indexOf(selectedDomain);
      const nextIndex = (currentIndex + 1) % performanceDomains.length;
      const nextDomain = performanceDomains[nextIndex];
      setSelectedDomain(nextDomain);
      setUserExpandedDomain(nextDomain.name);
      localStorage.setItem("selectedPerformanceDomainIndex", nextIndex);
      updateUrl(nextDomain);
      if (isSpeaking) {
        stop();
      }
    }
  };

  const handleSelectDomain = (domain, index) => {
    setSelectedDomain(domain);
    setUserExpandedDomain(domain.name);
    localStorage.setItem("selectedPerformanceDomainIndex", index);
    updateUrl(domain);
    if (window.innerWidth <= 768) {
      setShowMenu(false);
    }
    if (isSpeaking) {
      stop();
    }
  };

  const getTextToSpeak = () => {
    if (!selectedDomain) return "";
    let text = selectedDomain.name + "。";
    text += "定义：" + selectedDomain.definition + "。";
    
    if (showDetails) {
      if (selectedDomain.goals) {
        text += "目标：";
        const goals = selectedDomain.goals;
        if (Array.isArray(goals)) {
          goals.forEach(goal => text += goal + "。");
        } else {
          text += goals + "。";
        }
      }
      
      if (selectedDomain.points) {
        text += "绩效要点：";
        const points = selectedDomain.points;
        Object.entries(points).forEach(([key, value]) => {
          text += key + "：";
          if (typeof value === 'string') {
            text += value + "。";
          } else if (Array.isArray(value)) {
            value.forEach(v => text += v + "。");
          }
        });
      }
      
      if (selectedDomain.relationships) {
        text += "与其他绩效域的关系：";
        const relationships = selectedDomain.relationships;
        Object.entries(relationships).forEach(([key, value]) => {
          text += key + "：";
          if (typeof value === 'string') {
            text += value + "。";
          } else if (Array.isArray(value)) {
            value.forEach(v => text += v + "。");
          }
        });
      }
      
      if (selectedDomain.inspections) {
        text += "检查方法：";
        const inspections = selectedDomain.inspections;
        Object.entries(inspections).forEach(([key, methods]) => {
          text += key + "：";
          if (Array.isArray(methods)) {
            methods.forEach(m => text += m + "。");
          } else {
            text += methods + "。";
          }
        });
      }
    }
    
    return text;
  };

  const handleSpeak = () => {
    if (!selectedDomain) return;
    
    if (isSpeaking) {
      stop();
      return;
    }
    
    const text = getTextToSpeak();
    speak(text);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const formatArray = (arr) => {
    if (!arr) return null;
    if (typeof arr === 'string') {
      const parts = arr.split('（');
      if (parts.length === 1) return arr;
      return parts.map((part, i) => 
        i === 0 ? part : <React.Fragment key={i}><br />（{part}</React.Fragment>
      );
    }
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
          <Button onClick={handleSpeak} disabled={!selectedDomain}>
            {isSpeaking ? <><PauseOutlined /> 停止</> : <><SoundOutlined /> 朗读</>}
          </Button>
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
              <Link to="/"><HomeOutlined style={{ fontSize: '18px', color: '#78909C' }} /></Link>
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
              key: domain.name,
              label: domain.name,
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
                  {selectedDomain.name}
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
                    <th>定义</th>
                  </tr>
                  <tr>
                    <td className="text-indent">{selectedDomain.definition}</td>
                  </tr>

                  {showDetails && (
                    <>
                      {selectedDomain.goals && (
                        <>
                          <tr>
                            <th>目标</th>
                          </tr>
                          <tr>
                            <td>
                              {renderArrayItems(selectedDomain.goals)}
                            </td>
                          </tr>
                        </>
                      )}

                      {selectedDomain.points && (
                        <>
                          <tr>
                            <th>绩效要点</th>
                          </tr>
                          {Object.entries(selectedDomain.points).map(([key, value], index) => (
                            <tr key={index}>
                              <td>
                                <div className="point-section">
                                  <strong>{key}：</strong>
                                  {typeof value === 'string' ? value : renderArrayItems(value)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}

                      {selectedDomain.inspections && (
                        <>
                          <tr>
                            <th>检查方法</th>
                          </tr>
                          {Object.entries(selectedDomain.inspections).map(([key, methods], index) => (
                            <tr key={index}>
                              <td>
                                <div className="inspection-section">
                                  <strong>{key}：</strong>
                                  {renderArrayItems(methods)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}

                      {selectedDomain.relationships && (
                        <>
                          <tr>
                            <th>与其他绩效域的关系</th>
                          </tr>
                          {Object.entries(selectedDomain.relationships).map(([key, value], index) => (
                            <tr key={index}>
                              <td>
                                <div className="point-section">
                                  <strong>{key}：</strong>
                                  {typeof value === 'string' ? value : renderArrayItems(value)}
                                </div>
                              </td>
                            </tr>
                          ))}
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
