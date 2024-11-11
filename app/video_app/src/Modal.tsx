import React from 'react';
import './Modal.css'; 

interface Props {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode
}

const Modal = (props: Props) => {
    const { isOpen, closeModal, children } = props;
    if (!isOpen) return null; // Don't render the modal if it's not open

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={closeModal}>
                    ×
                </button>
                <div style={{ margin: "40px"}} />
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
