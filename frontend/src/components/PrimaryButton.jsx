import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import './PrimaryButton.css';

const PrimaryButton = ({ onClick, children, className = '', ...props }) => {
  return (
    <BootstrapButton
      onClick={onClick}
      className={`main-btn ${className}`}
      {...props}
    >
      {children}
    </BootstrapButton>
  );
};

export default PrimaryButton;
