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
          <h1>GenUI Magic - Demo 1</h1>
          <p>Tạo UI Động từ Server-Driven Events (Không sử dụng Chat)</p>
        </header>

        <div className="demo-container">
          <div className="controls">
            <h3>⚙️ System Event Triggers (Kích hoạt hệ thống)</h3>
            <div style={{ padding: "16px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", marginBottom: "16px" }}>
               <strong>Sự kiện đã ghi nhận: </strong> <i>"{currentPrompt}"</i>
               {isGenerating && <span style={{ marginLeft: "8px", color: "#16a34a" }}> (Hệ thống đang Render UI...)</span>}
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
               <h3>⚡ Form UI Render Trực Tiếp</h3>
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
            <h3>⚙️ Tải Trọng JSON Schema (ẩn sau màn hình)</h3>
            <pre style={{ fontSize: "12px" }}>{JSON.stringify(currentSchema, null, 2)}</pre>
          </div>
        </div>

        <footer>
          <h4>Tại sao phương pháp này đột phá (GenUI):</h4>
          <ul>
            <li><strong>Không cần tạo tệp `.tsx` mới</strong>: Component được lắp ráp on-the-fly dựa theo ý đồ của AI.</li>
            <li><strong>Hiệu ứng Streaming</strong>: Ứng dụng vẽ UI real-time ngay khi AI vừa nhả ra payload tương ứng.</li>
            <li>Bảo mật cao hơn HTML Injection: Ứng dụng chỉ render các thẻ thuần được quy định sẵn tại Registry.</li>
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
