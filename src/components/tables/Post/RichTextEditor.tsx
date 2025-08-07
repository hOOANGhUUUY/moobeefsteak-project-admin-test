// src/components/ui/form/RichTextEditor.tsx
"use client";

// import dynamic from "next/dynamic";
// import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";

// Load ReactQuill dynamic để tránh lỗi SSR
// NOTE: react-quill is not installed, commenting out to prevent build errors
// const ReactQuill = dynamic(() => import("react-quill"), {
//   ssr: false,
// });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RichTextEditor({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  value: _value,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: _onChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  placeholder: _placeholder = "Nhập nội dung...",
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-gray-400 text-sm">Đang tải trình soạn thảo...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 border rounded-md overflow-hidden">
      {/* ReactQuill component commented out as react-quill package is not installed */}
      <div className="p-4 text-gray-500">
        <p>RichTextEditor component is disabled (react-quill not installed)</p>
        <p>Please use CKEditor component instead from PostForm.tsx</p>
      </div>
      {/* 
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme="snow"
        className="min-h-[150px]"
      />
      */}
    </div>
  );
}
