const LoadingSpinner = ({ size = 'medium', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div className="spinner spinner-large"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={`spinner spinner-${size}`}></div>
    </div>
  );
};

export default LoadingSpinner;
