import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper function to match your exact hex color preferences
const getToastStyle = (type) => {
  switch (type) {
    case "success":
      return { backgroundColor: "#4caf50", color: "#fff" };
    case "error":
      return { backgroundColor: "#f44336", color: "#fff" };
    case "info":
      return { backgroundColor: "#2196f3", color: "#fff" };
    case "warning":
      return { backgroundColor: "#ff9800", color: "#fff" };
    default:
      return { backgroundColor: "#333", color: "#fff" };
  }
};

export const showToast = (type, message) => {
  const options = {
    autoClose: 3000,
    position: "top-right",
    // Injects your custom background & padding styles cleanly without creating a separate component
    style: {
      padding: "10px",
      borderRadius: "5px",
      ...getToastStyle(type),
    },
  };

  // Triggers the built-in type layout so the default icons look clean alongside your custom background
  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    case "info":
      toast.info(message, options);
      break;
    case "warning":
      toast.warn(message, options);
      break;
    default:
      toast(message, options);
  }
};