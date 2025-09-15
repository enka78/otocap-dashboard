import React from 'react';

const PageHeader = ({ title, onAddNew, addButtonText }) => {
  return (
    <div className="orders-header">
      <h1 className="page-title">{title}</h1>
      {onAddNew && (
        <button 
          className="btn-success"
          onClick={onAddNew}
        >
          ➕ {addButtonText}
        </button>
      )}
    </div>
  );
};

export default PageHeader;