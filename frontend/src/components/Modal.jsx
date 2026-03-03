function Modal({ aberto, fechar, children }) {
    if (!aberto) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
          <button
            onClick={fechar}
            className="absolute top-3 right-3 text-gray-400"
          >
            ✕
          </button>
  
          {children}
        </div>
      </div>
    );
  }
  
  export default Modal;