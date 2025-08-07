import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdTables from "@/components/tables/AdTables";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: " Moo Beef Steak Prime",
  description: "Where Prime Cuts Meet Perfection",
  icons: "/images/logo/res.png",
};



export default async function Tables({ params }: { params: Promise<{ tablesId: string }> }) {
  const { tablesId } = await params;
  console.log({ tablesId });
  return (
    <div>
      <PageBreadcrumb pageTitle="Trang Hóa Đơn" />
      <div className="space-y-6">
        <ComponentCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quản Lý Hóa Đơn</h2>
            <AdTables tableId={tablesId} />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
