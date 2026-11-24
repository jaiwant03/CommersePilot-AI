import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div 
      className="not-found-page"
      style={{ 
        minHeight: '70vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <div 
          style={{ 
            fontSize: '5rem', 
            fontWeight: 800, 
            background: 'var(--gradient-text-accent)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            marginBottom: '16px'
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Page Not Found</h1>
        <p style={{ color: '#94A3B8', marginBottom: '28px', fontSize: '0.95rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
