import React from "react";
import Modal from "../Modal";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    title: string; // Title of the confirmation modal
    message: string; // Message to display in the modal
    onConfirm: () => void; // Function to call when the user confirms
    isLoading?: boolean; // Optional: Loading state for the confirmation action
};

export default function ConfirmOperationModal({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    isLoading = false,
}: Props) {
    return (
        <Modal title={title} isOpen={isOpen} onClose={onClose}>
            <div className="p-4 flex flex-col gap-4"> {/* Added padding */}
                <p className="text-gray-700">{message}</p> {/* Improved message styling */}

                <div className="flex justify-end gap-2"> {/* Aligned buttons to the right */}
                    <button
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Confirming..." : "Confirm"} {/* Show loading text */}
                    </button>
                </div>
            </div>
        </Modal>
    );
}