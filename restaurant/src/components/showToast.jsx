import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getToastStyle = (type) => {
  const accent = {
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  return {
    background: "#ffffff",
    color: "#1f2937",
    border: `1px solid ${accent[type] || "#e5e7eb"}`,
    borderLeft: `4px solid ${accent[type] || "#d1d5db"}`,
    borderRadius: "10px",
    padding: "14px 16px",
    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
    fontSize: "14px",
    fontWeight: 500,
  };
};

export const showToast = (type, message) => {
  const options = {
    autoClose: 3000,
    position: "top-right",
    hideProgressBar: true,
    closeButton: false,
    pauseOnHover: true,
    draggable: true,
    style: getToastStyle(type),
  };

  switch (type) {
    case "success":
      toast.success(message, options);
      break;

    case "error":
      toast.error(message, options);
      break;

    case "warning":
      toast.warning(message, options);
      break;

    case "info":
      toast.info(message, options);
      break;

    default:
      toast(message, options);
  }
};