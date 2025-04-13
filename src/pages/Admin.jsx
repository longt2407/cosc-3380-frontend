import React, { useState, useEffect } from "react";
import Inventory from "../components/Inventory";
import Employee from "../components/Employee";
import Sales from "../components/Sales";
import Config from "../components/Config";
import ProductReport from "../components/ProductReport";
import CouponReport from "../components/CouponReport";
import CustomerReport from "../components/CustomerReport";
import CouponManagement from "../components/CouponManagement";
import Orders from "../components/Orders.jsx";
import Category from "../components/Category";
import Notification from "../components/Notification";
import AdminProfile from "../components/AdminProfile";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("Notification");
  const [orders, setOrders] = useState([]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800 text-white p-5 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          {[
            "Notification",
            "Profile",
            "Product",
            "Category",
            "Coupon",
            "Sale Event",
            "orders",
            "employees",
            "Product Report",
            "Coupon Report",
            "Customer Report",
            "Config",
          ].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`block w-full text-left px-4 py-2 mb-2 rounded-lg hover:bg-gray-700 ${
                activeSection === section ? "bg-gray-700" : ""
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {" "}
        {/* Added overflow-y-auto to enable vertical scrolling in the main content */}
        {activeSection === "Product" && <Inventory />}
        {activeSection === "Profile" && <AdminProfile />}
        {activeSection === "Category" && <Category />}
        {activeSection === "orders" && <Orders />}
        {activeSection === "employees" && <Employee />}
        {activeSection === "Coupon Management" && <CouponManagement />}
        {activeSection === "Product Report" && <ProductReport />}
        {activeSection === "Coupon Report" && <CouponReport />}
        {activeSection === "Customer Report" && <CustomerReport />}
        {activeSection === "Config" && <Config />}
        {activeSection === "Sale Event" && <Sales />}
        {activeSection === "Notification" && <Notification />}
      </div>
    </div>
  );
};

export default Admin;
