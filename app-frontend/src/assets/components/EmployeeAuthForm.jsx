import { useState } from "react";
import axios from "axios";
import "../styles/EmployeeAuthForm.css";

function EmployeeAuthForm() {
  const [mode, setMode] = useState("login");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [inputs, setInputs] = useState({
    employeeId: "",
    name: "",
    password: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === "employeeId" && mode === "login") {
      newErrors.employeeId = /^\d{6}$/.test(value) ? "" : "ID trebuie sa contina 6 cifre";
    }
    if (name === "name") {
      newErrors.name = /^[a-zA-Z\s]+$/.test(value) ? "" : "Numele trebuie sa contina doar litere";
    }
    if (name === "email" && mode === "register") {
      newErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email invalid";
    }
    if (name === "password") {
      newErrors.password = value.length >= 6 ? "" : "Parola trebuie sa aiba minim 6 caractere";
    }
    setErrors(newErrors);
  };

  const validateAll = () => {
    const fields = mode === "login"
      ? ["employeeId", "name", "password"]
      : ["email", "name", "password"];
    const tempErrors = {};
    fields.forEach((field) => {
      validateField(field, inputs[field]);
      if (!inputs[field]) tempErrors[field] = "Camp obligatoriu";
    });
    setErrors((prev) => ({ ...prev, ...tempErrors }));
    return Object.values({ ...errors, ...tempErrors }).every((e) => e === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      if (mode === "login") {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/employees/login`, {
          employeeId: inputs.employeeId,
          name: inputs.name,
          password: inputs.password,
        });
        setSuccessMessage("Autentificare reusita");
      } else {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/employees/register`, {
          email: inputs.email,
          name: inputs.name,
          password: inputs.password,
        });
        setSuccessMessage(`Noteaza-ti ID-ul de Angajat!\nID Angajat: ${res.data.employeeId}`);
      }
    } catch (err) {
      setErrors({ ...errors, form: "Eroare la autentificare sau crearea contului" });
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, form: "" }));
      }, 3000);
    }
  };

  return (
    <div className="employee-auth-container">
      <div className="auth-box">
        <div className="auth-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setSuccessMessage("");
              setIsAuthorized(false);
              setAdminPassword("");
              setAdminError("");
            }}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setSuccessMessage("");
              setIsAuthorized(false);
              setAdminPassword("");
              setAdminError("");
            }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.form && <div className="popup-error">{errors.form}</div>}
          {successMessage && <div className="success">{successMessage}</div>}

          {mode === "register" && !isAuthorized ? (
            <>
              <label>Parola Admin</label>
              {adminError && <div className="error">{adminError}</div>}
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Parola Admin"
              />
              <button
                type="button"
                className="send-button"
                onClick={async () => {
                    try {
                        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/employees/check-admin-password`, {
                        password: adminPassword
                        });
                        if (res.data.accessGranted) {
                        setIsAuthorized(true);
                        setAdminError("");
                        } else {
                        setAdminError("Parola Admin incorecta");
                        }
                    } catch (error) {
                        console.error("Eroare la verificare:", error);
                        setAdminError("Eroare la verificare");
                    }
                }}
              >
                Verifica Parola
              </button>
            </>
          ) : (
            <>
              {mode === "register" && (
                <>
                  <label>Email</label>
                  {errors.email && <div className="error">{errors.email}</div>}
                  <input
                    name="email"
                    value={inputs.email}
                    onChange={handleChange}
                    placeholder="ex: user@mail.com"
                    type="email"
                  />
                </>
              )}

              {mode === "login" && (
                <>
                  <label>ID Angajat</label>
                  {errors.employeeId && <div className="error">{errors.employeeId}</div>}
                  <input
                    name="employeeId"
                    value={inputs.employeeId}
                    onChange={handleChange}
                    placeholder="ex: 123456"
                  />
                </>
              )}

              <label>Nume</label>
              {errors.name && <div className="error">{errors.name}</div>}
              <input
                name="name"
                value={inputs.name}
                onChange={handleChange}
                placeholder="ex: Ion Popescu"
              />

              <label>Parola</label>
              {errors.password && <div className="error">{errors.password}</div>}
              <input
                name="password"
                type="password"
                value={inputs.password}
                onChange={handleChange}
                placeholder="Parola"
              />

              <button className="send-button">
                {mode === "login" ? "Autentificare" : "Creeaza cont"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default EmployeeAuthForm;
