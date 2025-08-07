import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pay from "@/components/tables/Pay";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: " Moo Beef Steak Prime",
  description:
    "Where Prime Cuts Meet Perfection",
    icons: "/images/logo/res.png",
};

export default function Tables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản Lý Phương Thức Thanh Toán" />
      <div className="space-y-6">
        <ComponentCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quản Lý Phương Thức Thanh Toán</h2>
            <Pay />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
