
import { X } from 'lucide-react';
import React from 'react'
import ReactDOM from 'react-dom';


type Props = {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  };

function Modal({title, isOpen, onClose, children}: Props) {
  
    
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-50 p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg flex flex-col gap-4">
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-bold'>{title}</h1>
                <button onClick={() => onClose()}>
                    <X size={18} />
                </button>
            </div>
            {children}
        </div>
    </div>,
    document.body,
  )
}

export default Modal