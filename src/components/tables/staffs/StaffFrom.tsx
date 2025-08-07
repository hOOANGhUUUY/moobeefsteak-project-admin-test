import React, { useState, useEffect } from "react";
import { useForm, RegisterOptions } from "react-hook-form";

interface Staff {
  id: number;
  name: string;
  email?: string;
  phone: string;
  status: number; // 0: ngừng hoạt động, 1: đang hoạt động
  avatar?: string;
  profile_image?: string;
  created_at?: string;
}

interface StaffFormData {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  status?: number;
}

interface StaffFormProps {
  onSubmit?: (data: StaffFormData) => void;
  editStaff?: Staff;
}

const StaffForm: React.FC<StaffFormProps> = ({ onSubmit, editStaff }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
    watch,
  } = useForm<StaffFormData>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editStaff) {
      setValue("name", editStaff.name || "");
      setValue("email", editStaff.email || "");
      setValue("phone", editStaff.phone || "");
      setValue("status", editStaff.status);
      setValue("password", "");
      setValue("confirmPassword", "");
    } else {
      reset();
    }
  }, [editStaff, setValue, reset]);

  const submitHandler = async (data: StaffFormData) => {
    setLoading(true);
    try {
      if (onSubmit) onSubmit(data);
    } catch (err: unknown) {
      const errorWithResponse = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (errorWithResponse.response?.data?.errors) {
        const apiErrors = errorWithResponse.response.data.errors;
        Object.keys(apiErrors).forEach((key) => {
          setError(key as keyof StaffFormData, { type: "manual", message: apiErrors[key][0] });
        });
      } else {
        alert("Có lỗi xảy ra khi lưu nhân viên!");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    name: keyof StaffFormData,
    label: string,
    type: string = "text",
    placeholder: string,
    icon: React.ReactNode,
    validation: RegisterOptions<StaffFormData, keyof StaffFormData>
  ) => (
    <div className="flex flex-col">
      <label className="mb-1 font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          {...register(name, validation)}
          className={`border-2 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[#D4AF37] transition ${
            errors[name] ? "border-red-400" : "border-gray-200"
          }`}
          placeholder={placeholder}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
          {icon}
        </span>
      </div>
      {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
    </div>
  );

  const renderPasswordInput = (
    name: "password" | "confirmPassword",
    label: string,
    placeholder: string,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    validation: RegisterOptions<StaffFormData, "password" | "confirmPassword">
  ) => (
    <div className="flex flex-col">
      <label className="mb-1 font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          {...register(name, validation)}
          className={`border-2 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[#D4AF37] transition ${
            errors[name] ? "border-red-400" : "border-gray-200"
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.97 10.97 0 0112 19c-7 0-11-7-11-7a21.77 21.77 0 015.06-6.06M1 1l22 22" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.53 9.53A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .47-.11.91-.29 1.29" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="w-full h-full flex flex-col justify-center items-center"
      style={{ minWidth: 320, minHeight: 500 }}
    >
      <div className="w-full grid grid-cols-1 gap-y-4">
        {renderInput(
          "name",
          "Họ tên",
          "text",
          "Nhập họ tên",
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" fill="#bbb"/>
          </svg>,
          { required: "Vui lòng nhập họ tên" }
        )}

        {editStaff && renderInput(
          "email",
          "Email",
          "email",
          "Nhập email",
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 0v.01L12 13l8-8.99V4H4zm0 16h16V6.83l-8 8-8-8V20z" fill="#bbb"/>
          </svg>,
          {
            pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" }
          }
        )}

        {renderInput(
          "phone",
          "Số điện thoại",
          "tel",
          "Nhập số điện thoại",
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 4.5A1 1 0 013 3.5h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" fill="#bbb"/>
          </svg>,
          {
            required: "Vui lòng nhập số điện thoại",
            pattern: { value: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }
          }
        )}

        {editStaff && (
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-700">Trạng thái</label>
            <ul className="flex gap-4">
              <li>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    value={1}
                    {...register("status", { required: "Vui lòng chọn trạng thái" })}
                    checked={watch("status") === 1}
                    onChange={() => setValue("status", 1)}
                  />
                  <span className="text-green-700 font-medium">Đang hoạt động</span>
                </label>
              </li>
              <li>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    value={0}
                    {...register("status", { required: "Vui lòng chọn trạng thái" })}
                    checked={watch("status") === 0}
                    onChange={() => setValue("status", 0)}
                  />
                  <span className="text-red-600 font-medium">Ngừng hoạt động</span>
                </label>
              </li>
            </ul>
            {errors.status && <span className="text-red-500 text-xs">{errors.status?.message}</span>}
          </div>
        )}

        {renderPasswordInput(
          "password",
          editStaff ? "Mật khẩu mới" : "Mật khẩu",
          editStaff ? "Để trống nếu không đổi mật khẩu" : "Nhập mật khẩu",
          showPassword,
          setShowPassword,
          {
            required: !editStaff ? "Vui lòng nhập mật khẩu" : false,
            minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
          }
        )}

        {(!editStaff || (editStaff && !!watch("password"))) && (
          renderPasswordInput(
            "confirmPassword",
            editStaff ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu",
            editStaff ? "Nhập lại mật khẩu mới nếu đổi" : "Nhập lại mật khẩu",
            showConfirm,
            setShowConfirm,
            {
              required: !editStaff ? "Vui lòng xác nhận mật khẩu" : !!watch("password"),
              validate: (value: string | undefined) => {
                if (!value) return true;
                return value === watch("password") || "Mật khẩu xác nhận không khớp";
              }
            }
          )
        )}
      </div>

      <div className="w-full mt-8 flex">
        <button
          type="submit"
          className="bg-[#3E2723] hover:bg-[#D4AF37] text-white font-semibold py-3 px-8 rounded-xl shadow transition text-lg flex items-center gap-2"
          disabled={loading}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {loading ? (editStaff ? "Đang cập nhật..." : "Đang tạo...") : (editStaff ? "Cập nhật" : "Tạo nhân viên")}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
