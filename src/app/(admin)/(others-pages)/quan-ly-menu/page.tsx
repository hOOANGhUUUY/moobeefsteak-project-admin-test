import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Menu from "@/components/tables/Menu";
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
      <PageBreadcrumb pageTitle="Quản Lý Menu" />
      <div className="space-y-6">
        <ComponentCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quản Lý Menu</h2>
            <Menu />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
