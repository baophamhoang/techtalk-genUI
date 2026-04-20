import type { FormSchemaType } from "@techtalk/shared";

const createField = <T extends { type: string; label: string; required?: boolean }>(field: T): T & { required: boolean } => ({
  ...field,
  required: field.required ?? false,
});

export const STATIC_SCHEMAS: Record<string, FormSchemaType> = {
  healthcare: {
    id: "healthcare-booking",
    title: "Đặt lịch khám bệnh",
    description: "Form đặt lịch khám tại bệnh viện hoặc phòng khám.",
    submitLabel: "Xác nhận",
    fields: [
      { key: "patientName", field: createField({ type: "text", label: "Tên bệnh nhân", required: true }) },
      { key: "phoneNumber", field: createField({ type: "phone", label: "Số điện thoại", required: true }) },
      { key: "department", field: createField({ type: "select", label: "Chuyên khoa", required: true, options: [
        { value: "general", label: "Khám tổng quát" },
        { value: "cardiology", label: "Tim mạch" },
        { value: "dermatology", label: "Da liễu" },
      ]})},
      { key: "appointmentDate", field: createField({ type: "date", label: "Ngày khám", required: true }) },
    ],
  },
  fintech: {
    id: "fintech-kyc",
    title: "Xác minh danh tính (KYC)",
    description: "Hoàn tất xác minh để mở tài khoản. Form này thay đổi tuỳ quốc gia.",
    submitLabel: "Gửi xác minh",
    fields: [
      { key: "fullName", field: createField({ type: "text", label: "Họ và tên", required: true }) },
      { key: "nationalId", field: createField({ type: "text", label: "Số CCCD/CMND", required: true, pattern: "^[0-9]{9,12}$" }) },
      { key: "dateOfBirth", field: createField({ type: "date", label: "Ngày sinh", required: true }) },
      { key: "documentPhoto", field: createField({ type: "file", label: "Tải lên ảnh 2 mặt CCCD", accept: ".jpg,.png" }) },
    ],
  },
  insurance: {
    id: "insurance-claim",
    title: "Yêu cầu bồi thường bảo hiểm",
    description: "Bồi thường tai nạn ô tô, mất cắp, hoặc cháy nổ.",
    submitLabel: "Gửi yêu cầu",
    fields: [
      { key: "policyNumber", field: createField({ type: "text", label: "Số hợp đồng bảo hiểm", required: true }) },
      { key: "incidentDate", field: createField({ type: "date", label: "Ngày xảy ra sự cố", required: true }) },
      { key: "incidentType", field: createField({ type: "select", label: "Loại sự cố", required: true, options: [
        { value: "auto", label: "Tai nạn ô tô" },
        { value: "fire", label: "Cháy nổ" },
        { value: "theft", label: "Trộm cắp" },
      ]})},
      { key: "policeReport", field: createField({ type: "checkbox", label: "Đã báo công an?" }) },
    ],
  },
  logistics: {
    id: "logistics-tracking",
    title: "Giao nhận Logistics",
    description: "Cập nhật trạng thái lộ trình đơn hàng vận chuyển.",
    submitLabel: "Lưu trạng thái",
    fields: [
      { key: "trackingId", field: createField({ type: "text", label: "Mã vận đơn", required: true }) },
      { key: "status", field: createField({ type: "select", label: "Trạng thái", required: true, options: [
        { value: "picked", label: "Đã lấy hàng" },
        { value: "transit", label: "Đang trung chuyển" },
        { value: "delivered", label: "Đã giao" },
      ]})},
      { key: "location", field: createField({ type: "text", label: "Vị trí hiện tại", required: true }) },
    ],
  },
  ecommerce: {
    id: "ecommerce-onboarding",
    title: "Đăng ký Merchant",
    description: "Mở gian hàng mới trên sàn thương mại điện tử.",
    submitLabel: "Đăng ký",
    fields: [
      { key: "storeName", field: createField({ type: "text", label: "Tên gian hàng", required: true }) },
      { key: "businessType", field: createField({ type: "select", label: "Loại hình", required: true, options: [
        { value: "individual", label: "Cá nhân" },
        { value: "company", label: "Doanh nghiệp" },
      ]})},
      { key: "taxId", field: createField({ type: "text", label: "Mã số thuế" }) },
    ],
  },
  realestate: {
    id: "realestate-inspection",
    title: "Thẩm định nhà đất",
    description: "Yêu cầu chuyên gia thẩm định giá trị bất động sản.",
    submitLabel: "Gửi yêu cầu",
    fields: [
      { key: "propertyAddress", field: createField({ type: "text", label: "Địa chỉ BĐS", required: true }) },
      { key: "propertyType", field: createField({ type: "select", label: "Loại BĐS", required: true, options: [
        { value: "apartment", label: "Chung cư" },
        { value: "house", label: "Nhà phố" },
        { value: "land", label: "Đất nền" },
      ]})},
      { key: "areaSqM", field: createField({ type: "number", label: "Diện tích (m2)", required: true, min: 10 }) },
      { key: "inspectionDate", field: createField({ type: "date", label: "Ngày hẹn", required: true }) },
    ],
  },
};

export const SCHEMA_IDS = Object.keys(STATIC_SCHEMAS);