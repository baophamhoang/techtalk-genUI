import React, { useState } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import "./App.css";
import { genUIRegistry } from "./catalog";

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", background: "#fee" }}>
          <h2>Something went wrong in the component.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            <summary>Error details</summary>
            <br />
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
            <br />
            {this.state.error?.stack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("Hãy chọn một Sự kiện hệ thống (Event) bên dưới để xem luồng SDUI!");
  const [currentSchema, setCurrentSchema] = useState<any>({});

  const configuratorSchema = {
    // ... no changes to schema ...
    root: "configuratorForm",
    elements: {
      configuratorForm: {
        type: "object",
        props: {
          properties: {
            gpu: { type: "string", title: "Tuỳ chọn Cạc Đồ Hoạ (GPU)", enum: ["rtx4060", "rtx4070", "rtx4080"], enumNames: ["NVIDIA RTX 4060 (Tiêu chuẩn)", "NVIDIA RTX 4070 (+ 5.000.000đ)", "NVIDIA RTX 4080 (+ 15.000.000đ)"] },
            ramUpgrade: { type: "boolean", title: "Nâng cấp lên 32GB RAM (+ 2.000.000đ)" },
            warrantyYears: { type: "number", title: "Gói bảo hành mở rộng (Số năm)", placeholder: "Nhập số năm (VD: 1 hoặc 2)" },
            color: { type: "string", title: "Màu sắc vỏ máy", enum: ["black", "titanium"], enumNames: ["Đen nhám (Matte Black)", "Xám Titanium"] }
          },
          required: ["gpu", "color"],
          actionButtons: [
            { label: "Thêm Vào Giỏ Hàng", variant: "primary", action: "add_to_cart" }
          ]
        }
      },
    },
  };

  const triageSchema = {
    root: "triageForm",
    elements: {
      triageForm: {
        type: "object",
        props: {
          properties: {
            lightStatus: { type: "string", title: "Trạng thái đèn báo trên táp lô", enum: ["flashing", "solid", "intermittent"], enumNames: ["Nhấp nháy liên tục (Cảnh báo đỏ!)", "Sáng tĩnh", "Lúc sáng lúc tắt"] },
            burntSmell: { type: "boolean", title: "Bạn có ngửi thấy mùi khét từ nắp phanh/capo không?" },
            engineTemp: { type: "number", title: "Nhiệt độ nước làm mát hiển thị (độ C)", placeholder: "VD: 90" },
            lastService: { type: "string", title: "Lần bảo dưỡng gần nhất", enum: ["under_1_month", "under_6_months", "over_1_year"], enumNames: ["Dưới 1 tháng trước", "Trong vòng 6 tháng", "Đã hơn 1 năm"] }
          },
          required: ["lightStatus", "engineTemp"],
          actionButtons: [
            { label: "Phân Tích Báo Cáo Lỗi Lập Tức", variant: "danger", action: "diagnose_error" },
            { label: "Gọi Cứu Hộ Lập Tức", variant: "secondary", action: "call_tow" }
          ]
        }
      },
    },
  };

  const splitBillSchema = {
    root: "splitBillForm",
    elements: {
      splitBillForm: {
        type: "object",
        props: {
          properties: {
            totalAmount: { type: "number", title: "Kết quả trích xuất: Tổng hoá đơn (VNĐ)", placeholder: "700000" },
            partySize: { type: "number", title: "Số người chia tiền (Detect: 4 người)", placeholder: "4" },
            splitMethod: { type: "string", title: "Xác nhận phương thức chia", enum: ["even", "itemized"], enumNames: ["Chia đều bằng nhau", "Tính chi tiết từng item theo người"] },
            paymentApp: { type: "boolean", title: "Tự động tạo mã QR chuyển khoản Momo?" }
          },
          required: ["totalAmount", "partySize", "splitMethod"],
          actionButtons: [
            { label: "Tạo Link Yêu Cầu Thu Tiền (175k/người)", variant: "primary", action: "generate_qr" }
          ]
        }
      },
    },
  };

  const handleSimulateGenUI = async (prompt: string, schema: any) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setCurrentPrompt(prompt);
    
    // Khởi tạo schema rỗng
    const rootName = schema.root;
    let partialSchema: any = {
      root: rootName,
      elements: {
        [rootName]: {
          type: "object",
          props: { properties: {}, required: schema.elements[rootName].props.required }
        }
      }
    };
    
    setCurrentSchema(JSON.parse(JSON.stringify(partialSchema)));
    
    // Hiển thị từng trường dữ liệu để giả lập hệ thống streaming schema
    const fullProps = schema.elements[rootName].props;
    const keys = Object.keys(fullProps.properties);
    
    for (let i = 0; i < keys.length; i++) {
       await new Promise(resolve => setTimeout(resolve, 800)); // Độ trễ 800ms
       const key = keys[i];
       partialSchema.elements[rootName].props.properties[key] = fullProps.properties[key];
       setCurrentSchema(JSON.parse(JSON.stringify(partialSchema)));
    }

    if (fullProps.actionButtons) {
       await new Promise(resolve => setTimeout(resolve, 800));
       partialSchema.elements[rootName].props.actionButtons = fullProps.actionButtons;
       setCurrentSchema(JSON.parse(JSON.stringify(partialSchema)));
    }
    
    setIsGenerating(false);
  };

  return (
    <ErrorBoundary>
    <JSONUIProvider registry={genUIRegistry.registry}>
      <div className="app">
        <header>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ margin: 0 }}>Demo 1 — Server-Driven UI (SDUI)</h1>
              <p style={{ margin: "4px 0 0", opacity: 0.8 }}>UI tự sinh từ System Events — Không cần Chat, Không cần AI</p>
            </div>
            <span style={{ padding: "6px 14px", backgroundColor: "#166534", color: "#bbf7d0", borderRadius: "999px", fontSize: "13px", fontWeight: "bold", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
              ⚙️ RULE-BASED · NO AI
            </span>
          </div>

          {/* Flow diagram */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px", flexWrap: "wrap", fontSize: "13px", fontWeight: "600" }}>
            {[
              { icon: "📡", label: "System Event" },
              { icon: "⚙️", label: "Rule Engine" },
              { icon: "📋", label: "JSON Schema" },
              { icon: "✨", label: "UI Render" },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.25)" }}>
                  <span>{step.icon}</span>
                  <span>{step.label}</span>
                </div>
                {i < arr.length - 1 && <span style={{ opacity: 0.5, fontSize: "18px" }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </header>

        <div className="demo-container">
          <div className="controls">
            <h3>📡 System Event Triggers</h3>
            <div style={{ padding: "12px 16px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
               <strong>Event nhận được: </strong> <i>"{currentPrompt}"</i>
               {isGenerating && <span style={{ marginLeft: "8px", color: "#16a34a", fontWeight: "bold" }}> → Rule Engine đang chọn schema...</span>}
            </div>
            
            <div className="button-group" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                 onClick={() => handleSimulateGenUI("Hành vi: Khách hàng nhấp vào tuỳ chọn 'Build cấu hình PC' trên Website.", configuratorSchema)} 
                 disabled={isGenerating}
                 style={{ textAlign: "left", padding: "12px" }}
              >
                💻 Event 1: Product Configurator (Web Routing)
              </button>
              <button 
                 onClick={() => handleSimulateGenUI("Cảm biến: Phát hiện lỗi mã P0300 (Engine Misfire) và nhiệt độ ô tô tăng bất thường.", triageSchema)} 
                 disabled={isGenerating}
                 style={{ textAlign: "left", padding: "12px" }}
              >
                🚗 Event 2: Interactive Triage (IoT Sensor Trigger)
              </button>
              <button 
                 onClick={() => handleSimulateGenUI("Hệ thống OCR: Hoàn tất trích xuất dữ liệu ảnh hoá đơn và yêu cầu xác nhận chia tiền.", splitBillSchema)}  
                 disabled={isGenerating}
                 style={{ textAlign: "left", padding: "12px" }}
              >
                🧾 Event 3: Extract & Correction (Image OCR Input)
              </button>
            </div>
          </div>

          <div className="form-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <h3>✨ UI Render (từ JSON Schema)</h3>
               {isGenerating && <div className="spinner" style={{ width: "20px", height: "20px", borderRadius: "50%", border: "3px solid #ccc", borderTopColor: "#3b82f6", animation: "spin 1s linear infinite" }} />}
            </div>
            
            <div className="form-wrapper" style={{ minHeight: "300px" }}>
              {currentSchema.root ? (
                 <Renderer spec={currentSchema as any} registry={genUIRegistry.registry} />
              ) : (
                 <p style={{ color: "#6b7280", fontStyle: "italic", textAlign: "center", marginTop: "100px" }}>UI sẽ xuất hiện tại đây khi AI bắt đầu phân tích...</p>
              )}
            </div>
          </div>

          <div className="schema-section">
            <h3>📋 JSON Schema Payload <span style={{ fontSize: "12px", fontWeight: "normal", opacity: 0.6 }}>(Rule Engine trả về)</span></h3>
            <pre style={{ fontSize: "12px" }}>{JSON.stringify(currentSchema, null, 2)}</pre>
          </div>
        </div>

        <footer>
          <h4>Tại sao SDUI là nền tảng của GenUI?</h4>
          <ul>
            <li><strong>Không cần tạo file `.tsx` mới:</strong> Component lắp ráp on-the-fly từ JSON — engineer định nghĩa Registry một lần duy nhất.</li>
            <li><strong>Safe by design:</strong> Chỉ render các component đã đăng ký trong Registry, tránh HTML injection hoàn toàn.</li>
            <li><strong>Tách biệt data và presentation:</strong> Server quyết định <em>cái gì</em> hiển thị, client chỉ lo <em>hiển thị như thế nào</em>.</li>
            <li style={{ color: "#2563eb", fontWeight: "bold" }}>→ Demo 2 sẽ thay Rule Engine bằng AI thật để tự tạo ra JSON Schema này.</li>
          </ul>
        </footer>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </JSONUIProvider>
    </ErrorBoundary>
  );
}

export default App;
