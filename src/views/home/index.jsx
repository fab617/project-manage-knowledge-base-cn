import { Link } from "react-router-dom";
import "./index.less";

function Home() {
  return (
    <div className="home-container">
      <h1>项目管理实践</h1>
      <div className="entry-cards">
        <Link to="/process" className="entry-card">
          <h2>过程</h2>
        </Link>
        <Link to="/performance" className="entry-card">
          <h2>绩效域</h2>
        </Link>
        <Link to="/tools" className="entry-card">
          <h2>工具与技术</h2>
        </Link>
        <Link to="/inputs" className="entry-card">
          <h2>输入输出</h2>
        </Link>
      </div>
    </div>
  );
}

export default Home;
