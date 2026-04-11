import { defineRegistry } from "@json-render/react";

// Simple registry for demo purposes
export const genUIRegistry = defineRegistry(null as any, {
  components: {
    string: ({ props }: any) => {
      if (props.enum) {
        return (
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>{props.title}</label>
            <select style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}>
              {props.enum.map((opt: string, i: number) => (
                <option key={opt} value={opt}>{props.enumNames?.[i] || opt}</option>
              ))}
            </select>
          </div>
        );
      }
      return (
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>{props.title}</label>
          <input type="text" placeholder={props.placeholder} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </div>
      );
    },
    number: ({ props }: any) => (
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>{props.title}</label>
        <input type="number" placeholder={props.placeholder} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
      </div>
    ),
    boolean: ({ props }: any) => (
      <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
        <input type="checkbox" />
        <label style={{ fontWeight: "bold" }}>{props.title}</label>
      </div>
    ),
    array: ({ props }: any) => (
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>{props.title}</label>
        {props.items?.enum ? (
          <select multiple style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}>
            {props.items.enum.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <div style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>Array Items</div>
        )}
      </div>
    ),
    object: ({ props, emit, on }: any) => (
      <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#fff" }}>
        {props.properties && Object.entries(props.properties).map(([key, childProps]: [string, any]) => {
          const Component = genUIRegistry.registry[childProps.type as keyof typeof genUIRegistry.registry];
          return Component ? <Component key={key} element={{ type: childProps.type, props: childProps }} emit={emit} on={on} /> : <div key={key}>Unsupported type: {childProps.type}</div>;
        })}
        
        {props.actionButtons && (
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "16px", borderTop: "1px dashed #cbd5e1" }}>
            {props.actionButtons.map((btn: any, idx: number) => {
               const bg = btn.variant === "danger" ? "#ef4444" : btn.variant === "secondary" ? "#e5e7eb" : "#3b82f6";
               const color = btn.variant === "secondary" ? "#374151" : "#ffffff";
               return (
                 <button 
                   key={idx}
                   onClick={() => alert(`Hành động thông minh được kích hoạt: [${btn.action}]\nBởi GenUI!`)}
                   style={{
                     padding: "10px 20px",
                     borderRadius: "6px",
                     border: "none",
                     backgroundColor: bg,
                     color: color,
                     fontWeight: "bold",
                     cursor: "pointer",
                     transition: "opacity 0.2s"
                   }}
                 >
                   {btn.label}
                 </button>
               );
            })}
          </div>
        )}
      </div>
    ),
  },
});
