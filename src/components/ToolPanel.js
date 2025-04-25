const ToolPanel = ({ onSelectTool, selectedTool }) => {
  return (
    <div className="tool-panel">
      <button 
        className={`tool-button ${selectedTool === 'pan' ? 'selected' : ''}`} 
        onClick={() => onSelectTool('pan')}
        title="Pan Tool"
      >
        <IconHandGrab />
      </button>
      <button 
        className={`tool-button ${selectedTool === 'blackhole' ? 'selected' : ''}`} 
        onClick={() => onSelectTool('blackhole')}
        title="Black Hole Tool"
      >
        <IconHole />
      </button>
      <button 
        className={`tool-button ${selectedTool === 'whitehole' ? 'selected' : ''}`} 
        onClick={() => onSelectTool('whitehole')}
        title="White Hole Tool"
      >
        <IconWhiteHole />
      </button>
      {/* Add more tools as needed */}
    </div>
  );
};

export default ToolPanel; 