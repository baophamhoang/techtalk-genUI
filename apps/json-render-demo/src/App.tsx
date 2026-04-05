import { useState } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import "./App.css";

// Import from your working project
import { genUIRegistry } from "./catalog";

function App() {
  const [currentForm, setCurrentForm] = useState<"user" | "admin">("user");
  const [formData, setFormData] = useState({});

  // User form schema
  const userFormSchema = {
    root: "userForm",
    elements: {
      userForm: {
        type: "object",
        properties: {
          name: {
            type: "string",
            title: "Họ và tên",
            placeholder: "Nhập họ và tên của bạn",
          },
          email: {
            type: "string",
            title: "Email",
            format: "email",
            placeholder: "example@email.com",
          },
          role: {
            type: "string",
            title: "Vai trò",
            enum: ["user", "guest"],
            enumNames: ["Người dùng", "Khách"],
          },
          subscribe: {
            type: "boolean",
            title: "Đăng ký nhận tin",
          },
        },
        required: ["name", "email"],
      },
    },
  };

  // Admin form schema
  const adminFormSchema = {
    root: "adminForm",
    elements: {
      adminForm: {
        type: "object",
        properties: {
          username: {
            type: "string",
            title: "Tên đăng nhập",
            pattern: "^[a-zA-Z0-9_]{3,}$",
          },
          permissions: {
            type: "array",
            title: "Quyền hạn",
            items: {
              type: "string",
              enum: ["read", "write", "delete", "manage_users"],
            },
            uniqueItems: true,
          },
          department: {
            type: "string",
            title: "Phòng ban",
            enum: ["IT", "HR", "Sales", "Marketing"],
          },
        },
        required: ["username"],
      },
    },
  };

  const currentSchema =
    currentForm === "user" ? userFormSchema : adminFormSchema;

  // Form data would be captured via json-render's internal handling
  // For demo purposes, we show static data

  const handleSubmit = () => {
    console.log("Form data:", formData);
    alert(
      `Form submitted as ${currentForm}!\n${JSON.stringify(formData, null, 2)}`,
    );
  };

  return (
    <JSONUIProvider registry={genUIRegistry.registry}>
      <div className="app">
        <header>
          <h1>JSON Render Demo - Basic GenUI</h1>
          <p>Form được render từ JSON schema - Static rules based solution</p>
        </header>

        <div className="demo-container">
          <div className="controls">
            <h3>Select User Role</h3>
            <div className="button-group">
              <button
                onClick={() => setCurrentForm("user")}
                className={currentForm === "user" ? "active" : ""}
              >
                User Form
              </button>
              <button
                onClick={() => setCurrentForm("admin")}
                className={currentForm === "admin" ? "active" : ""}
              >
                Admin Form
              </button>
              <button onClick={() => setFormData({})}>Clear Data</button>
            </div>
          </div>

          <div className="form-section">
            <h3>Form Render từ JSON Schema ({currentForm})</h3>
            <div className="form-wrapper">
              <Renderer
                spec={currentSchema as any}
                registry={genUIRegistry.registry}
              />
            </div>
            <div className="form-actions">
              <button onClick={handleSubmit} className="submit-btn">
                Submit as {currentForm}
              </button>
            </div>
          </div>

          <div className="schema-section">
            <h3>Current JSON Schema ({currentForm})</h3>
            <pre>{JSON.stringify(currentSchema, null, 2)}</pre>
          </div>

          <div className="data-section">
            <h3>Form Data</h3>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>

        <footer>
          <h4>Key Takeaways:</h4>
          <ul>
            <li>
              UI được định nghĩa bằng JSON schema - không cần code component
            </li>
            <li>Static rules: Different schema for different user roles</li>
            <li>Validation, formatting được handle tự động</li>
            <li>Phù hợp cho form builders, CRUD interfaces</li>
            <li>
              <strong>Cost:</strong> Zero API cost - all client-side
            </li>
          </ul>
        </footer>
      </div>
    </JSONUIProvider>
  );
}

export default App;
