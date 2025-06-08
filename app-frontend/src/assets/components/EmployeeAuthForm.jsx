import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/EmployeeAuthForm.css";
import { TEXTS } from "../data/texts";

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
      newErrors.employeeId = /^\d{6}$/.test(value) ? "" : TEXTS.EMPLOYEE_AUTH.ID_ERROR;
    }
    if (name === "name") {
      newErrors.name = /^[a-zA-Z\s]+$/.test(value) ? "" : TEXTS.EMPLOYEE_AUTH.NAME_ERROR;
    }
    if (name === "email" && mode === "register") {
      newErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : TEXTS.EMPLOYEE_AUTH.EMAIL_ERROR;
    }
    if (name === "password") {
      newErrors.password = value.length >= 6 ? "" : TEXTS.EMPLOYEE_AUTH.PASSWORD_ERROR;
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
      if (!inputs[field]) tempErrors[field] = TEXTS.EMPLOYEE_AUTH.REQUIRED_FIELD;
    });
    setErrors((prev) => ({ ...prev, ...tempErrors }));
    return Object.values({ ...errors, ...tempErrors }).every((e) => e === "");
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      if (mode === "login") {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/employees/login`,
          {
            employeeId: inputs.employeeId,
            name: inputs.name,
            password: inputs.password,
          }
        );

        sessionStorage.setItem("loggedEmployee", inputs.employeeId);

        navigate(`/employee/${inputs.employeeId}`);
        setSuccessMessage(TEXTS.EMPLOYEE_AUTH.LOGIN_SUCCESS);
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/employees/register`,
          {
            email: inputs.email,
            name: inputs.name,
            password: inputs.password,
          }
        );
        setSuccessMessage(
          `${TEXTS.EMPLOYEE_AUTH.REGISTER_SUCCESS}\nID: ${res.data.employeeId}`
        );
      }
    } catch (err) {
      setErrors({ ...errors, form: TEXTS.EMPLOYEE_AUTH.GENERAL_ERROR });
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
            {TEXTS.EMPLOYEE_AUTH.LOGIN}
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
            {TEXTS.EMPLOYEE_AUTH.REGISTER}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.form && <div className="popup-error">{errors.form}</div>}
          {successMessage && <div className="success">{successMessage}</div>}

          {mode === "register" && !isAuthorized ? (
            <>
              <label>{TEXTS.EMPLOYEE_AUTH.ADMIN_PASSWORD}</label>
              {adminError && <div className="error">{adminError}</div>}
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={TEXTS.EMPLOYEE_AUTH.ADMIN_PASSWORD}
              />
              <button
                type="button"
                className="send-button"
                onClick={async () => {
                  try {
                    const res = await axios.post(
                      `${import.meta.env.VITE_BACKEND_URL}/api/employees/check-admin-password`,
                      { password: adminPassword }
                    );
                    if (res.data.accessGranted) {
                      setIsAuthorized(true);
                      setAdminError("");
                    } else {
                      setAdminError(TEXTS.EMPLOYEE_AUTH.ADMIN_WRONG);
                    }
                  } catch {
                    setAdminError(TEXTS.EMPLOYEE_AUTH.ADMIN_ERROR);
                  }
                }}
              >
                {TEXTS.EMPLOYEE_AUTH.CHECK_ADMIN}
              </button>
            </>
          ) : (
            <>
              {mode === "register" && (
                <>
                  <label>{TEXTS.EMPLOYEE_AUTH.EMAIL}</label>
                  {errors.email && <div className="error">{errors.email}</div>}
                  <input
                    name="email"
                    value={inputs.email}
                    onChange={handleChange}
                    placeholder={TEXTS.EMPLOYEE_AUTH.EMAIL_PLACEHOLDER}
                    type="email"
                  />
                </>
              )}

              {mode === "login" && (
                <>
                  <label>{TEXTS.EMPLOYEE_AUTH.EMPLOYEE_ID}</label>
                  {errors.employeeId && <div className="error">{errors.employeeId}</div>}
                  <input
                    name="employeeId"
                    value={inputs.employeeId}
                    onChange={handleChange}
                    placeholder={TEXTS.EMPLOYEE_AUTH.EMPLOYEE_ID_PLACEHOLDER}
                  />
                </>
              )}

              <label>{TEXTS.EMPLOYEE_AUTH.NAME}</label>
              {errors.name && <div className="error">{errors.name}</div>}
              <input
                name="name"
                value={inputs.name}
                onChange={handleChange}
                placeholder={TEXTS.EMPLOYEE_AUTH.NAME_PLACEHOLDER}
              />

              <label>{TEXTS.EMPLOYEE_AUTH.PASSWORD}</label>
              {errors.password && <div className="error">{errors.password}</div>}
              <input
                name="password"
                type="password"
                value={inputs.password}
                onChange={handleChange}
                placeholder={TEXTS.EMPLOYEE_AUTH.PASSWORD}
              />

              <button className="send-button">
                {mode === "login"
                  ? TEXTS.EMPLOYEE_AUTH.LOGIN_BTN
                  : TEXTS.EMPLOYEE_AUTH.REGISTER_BTN}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default EmployeeAuthForm;
