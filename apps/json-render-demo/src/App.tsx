import { useState } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import "./App.css";

function App() {
  const [uiSchema, setUiSchema] = useState<any>({
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
        enum: ["admin", "user", "guest"],
        enumNames: ["Quản trị viên", "Người dùng", "Khách"],
      },
      subscribe: {
        type: "boolean",
        title: "Đăng ký nhận tin",
      },
    },
    required: ["name", "email"],
  });

  const [formData, setFormData] = useState({});

  const handleSubmit = (data: any) => {
    console.log("Form data:", data);
    setFormData(data);
  };

  const generateAdminForm = () => {
    setUiSchema({
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
    });
  };

  const generateUserForm = () => {
    setUiSchema({
      type: "object",
      properties: {
        fullName: {
          type: "string",
          title: "Họ tên đầy đủ",
        },
        age: {
          type: "number",
          title: "Tuổi",
          minimum: 18,
          maximum: 100,
        },
        preferences: {
          type: "object",
          title: "Tùy chọn",
          properties: {
            theme: {
              type: "string",
              title: "Giao diện",
              enum: ["light", "dark", "auto"],
            },
            notifications: {
              type: "boolean",
              title: "Thông báo",
            },
          },
        },
      },
    });
  };

  return (
    <JSONUIProvider>
      <div className="app">
        <header>
          <h1>JSON Render Demo - Basic GenUI</h1>
          <p>Form được render từ JSON schema, có thể thay đổi dynamic</p>
        </header>

        <div className="demo-container">
          <div className="controls">
            <h3>Tạo form mẫu</h3>
            <div className="button-group">
              <button onClick={generateAdminForm}>Form Admin</button>
              <button onClick={generateUserForm}>Form User</button>
              <button onClick={() => setFormData({})}>Clear Data</button>
            </div>
          </div>

          <div className="form-section">
            <h3>Form Render từ JSON Schema</h3>
            <div className="form-wrapper">
              <Renderer
                schema={uiSchema}
                data={formData}
                onChange={setFormData}
                onSubmit={handleSubmit}
                submitText="Gửi"
              />
            </div>
          </div>

          <div className="schema-section">
            <h3>JSON Schema hiện tại</h3>
            <pre>{JSON.stringify(uiSchema, null, 2)}</pre>
          </div>

          <div className="data-section">
            <h3>Dữ liệu đã nhập</h3>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>

        <footer>
          <h4>Key Takeaways:</h4>
          <ul>
            <li>
              UI được định nghĩa bằng JSON schema - không cần code component
            </li>
            <li>Validation, formatting được handle tự động</li>
            <li>Có thể generate schema từ AI/backend</li>
            <li>Phù hợp cho form builders, CRUD interfaces</li>
          </ul>
        </footer>
      </div>
    </JSONUIProvider>
  );
}

export default App;
