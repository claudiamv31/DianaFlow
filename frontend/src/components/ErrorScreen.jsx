import './ErrorScreen.css';
import Button from 'react-bootstrap/Button';

export default function ErrorScreen({ onRetry }) {
  return (
    <div className="error-screen">
      <h2>Oops...</h2>
      <p>There was an error loading the page. Try again later.</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="btn">
          Try again
        </Button>
      )}
    </div>
  );
}
