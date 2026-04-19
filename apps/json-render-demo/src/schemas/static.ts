import type { FormSchemaType } from "@techtalk/shared";

const createField = <T extends { type: string; label: string; required?: boolean }>(field: T): T & { required: boolean } => ({
  ...field,
  required: field.required ?? false,
});

export const STATIC_SCHEMAS: Record<string, FormSchemaType> = {
  healthcare: {
    id: "healthcare-booking",
    title: "Đặt lịch khám bệnh",
    description: "Điền thông tin để đặt lịch khám tại bệnh viện",
    submitLabel: "Xác nhận đặt lịch",
    fields: [
      { key: "fullName", field: createField({ type: "text", label: "Họ và tên", required: true }) },
      { key: "phone", field: createField({ type: "phone", label: "Số điện thoại", required: true }) },
      { key: "email", field: createField({ type: "email", label: "Email", placeholder: "email@example.com" }) },
      { key: "department", field: createField({ type: "select", label: "Khoa khám", required: true, options: [
        { value: "cardio", label: "Tim mạch" },
        { value: "ortho", label: "Chỉnh hình" },
        { value: "neuro", label: "Thần kinh" },
        { value: "pediatric", label: "Nhi" },
      ]})},
      { key: "appointmentDate", field: createField({ type: "date", label: "Ngày hẹn khám", required: true }) },
      { key: "symptoms", field: createField({ type: "textarea", label: "Mô tả triệu chứng", rows: 3 }) },
    ],
  },
  fintech: {
    id: "fintech-kyc",
    title: "Xác minh danh tính (KYC)",
    description: "Hoàn tất xác minh để mở tài khoản",
    submitLabel: "Gửi xác minh",
    fields: [
      { key: "fullName", field: createField({ type: "text", label: "Họ và tên theo CCCD", required: true }) },
      { key: "cccd", field: createField({ type: "text", label: "Số CCCD/CMND", required: true, pattern: "^[0-9]{9,12}$" }) },
      { key: "dateOfBirth", field: createField({ type: "date", label: "Ngày sinh", required: true }) },
      { key: "income", field: createField({ type: "select", label: "Thu nhập hàng tháng", required: true, options: [
        { value: "under10", label: "Dưới 10 triệu" },
        { value: "10-30", label: "10 - 30 triệu" },
        { value: "30-50", label: "30 - 50 triệu" },
        { value: "over50", label: "Trên 50 triệu" },
      ]})},
      { key: "agreeTerms", field: createField({ type: "checkbox", label: "Tôi đồng ý với điều khoản và chính sách bảo mật", required: true }) },
    ],
  },
  insurance: {
    id: "insurance-claim",
    title: "Yêu cầu bồi thường bảo hiểm",
    description: "Điền thông tin để nộp yêu cầu bồi thường",
    submitLabel: "Gửi yêu cầu",
    fields: [
      { key: "policyNumber", field: createField({ type: "text", label: "Số hợp đồng", required: true }) },
      { key: "incidentDate", field: createField({ type: "date", label: "Ngày xảy ra sự cố", required: true }) },
      { key: "incidentType", field: createField({ type: "select", label: "Loại sự cố", required: true, options: [
        { value: "accident", label: "Tai nạn" },
        { value: "health", label: "Sức khỏe" },
        { value: "property", label: "Tài sản" },
        { value: "other", label: "Khác" },
      ]})},
      { key: "description", field: createField({ type: "textarea", label: "Mô tả chi tiết sự cố", required: true, rows: 4 }) },
      { key: "estimatedAmount", field: createField({ type: "number", label: "Số tiền yêu cầu (VND)", required: true, min: 0 }) },
      { key: "documents", field: createField({ type: "file", label: "Tải lên tài liệu", accept: ".pdf,.jpg,.png" }) },
    ],
  },
  logistics: {
    id: "logistics-tracking",
    title: "Theo dõi vận đơn",
    description: "Nhập thông tin để theo dõi lô hàng",
    submitLabel: "Tra cứu",
    fields: [
      { key: "trackingCode", field: createField({ type: "text", label: "Mã vận đơn", required: true, placeholder: "VD: GHN123456789" }) },
      { key: "phone", field: createField({ type: "phone", label: "Số điện thoại người nhận", required: true }) },
      { key: "notifySMS", field: createField({ type: "checkbox", label: "Nhận thông báo qua SMS" }) },
    ],
  },
  ecommerce: {
    id: "ecommerce-onboarding",
    title: "Đăng ký làm người bán",
    description: "Hoàn tất hồ sơ để bắt đầu bán hàng",
    submitLabel: "Đăng ký",
    fields: [
      { key: "storeName", field: createField({ type: "text", label: "Tên cửa hàng", required: true }) },
      { key: "category", field: createField({ type: "select", label: "Ngành hàng chính", required: true, options: [
        { value: "fashion", label: "Thời trang" },
        { value: "electronics", label: "Điện tử" },
        { value: "home", label: "Nhà cửa" },
        { value: "food", label: "Thực phẩm" },
      ]})},
      { key: "email", field: createField({ type: "email", label: "Email liên hệ", required: true }) },
      { key: "taxCode", field: createField({ type: "text", label: "Mã số thuế", required: true }) },
      { key: "bankAccount", field: createField({ type: "number", label: "Số tài khoản ngân hàng", required: true }) },
    ],
  },
  realEstate: {
    id: "realestate-inspection",
    title: "Đăng ký kiểm tra nhà đất",
    description: "Đặt lịch kiểm tra bất động sản",
    submitLabel: "Đặt lịch",
    fields: [
      { key: "fullName", field: createField({ type: "text", label: "Họ và tên", required: true }) },
      { key: "phone", field: createField({ type: "phone", label: "Số điện thoại", required: true }) },
      { key: "propertyType", field: createField({ type: "select", label: "Loại bất động sản", required: true, options: [
        { value: "apartment", label: "Căn hộ" },
        { value: "house", label: "Nhà riêng" },
        { value: "land", label: "Đất nền" },
        { value: "commercial", label: "Thương mại" },
      ]})},
      { key: "budget", field: createField({ type: "select", label: "Ngân sách dự kiến", required: true, options: [
        { value: "under1b", label: "Dưới 1 tỷ" },
        { value: "1-3b", label: "1 - 3 tỷ" },
        { value: "3-5b", label: "3 - 5 tỷ" },
        { value: "over5b", label: "Trên 5 tỷ" },
      ]})},
      { key: "visitDate", field: createField({ type: "date", label: "Ngày muốn đi xem", required: true }) },
      { key: "note", field: createField({ type: "textarea", label: "Ghi chú thêm", rows: 2 }) },
    ],
  },
};

export const SCHEMA_IDS = Object.keys(STATIC_SCHEMAS);