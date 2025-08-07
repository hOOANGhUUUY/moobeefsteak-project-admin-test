"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import data from "@/model/data.json";
import { ITable } from "@/model/type";
import ApiClient from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import NotificationModal from "./NotificationModal";

// Interface cho Order theo API backend Laravel
export interface IOrder {
  id: number;
  id_voucher?: number | null;
  id_user: number;
  id_table: number;
  name_user: string;
  phone?: string | null;
  time?: string | null;
  date?: string | null;
  number_table: number;
  capacity: number;
  status?: number; // 0,1,2,3
  payment?: number; // 0,1,2
  status_deposit?: number; // 0,1
  created_at?: string;
  updated_at?: string;
  // Nếu có quan hệ orderItems
  order_items?: IOrderItem[];
}


// Interface cho OrderItem nếu cần (tùy backend trả về)
export interface IOrderItem {
  id: number;
  id_order: number;
  id_product: number;
  id_user: number;
  name: string;
  image: string;
  price: number;
  status: number;
  meta_description: string;
  detail_description: string;
  quantity_sold: number;
  created_at?: string;
  updated_at?: string;
}

// Interface cho PendingOrder (order tạm lưu localStorage)

// API Response interfaces
interface ApiResponse<T = unknown> {
  data?: T;
  [key: string]: unknown;
}

interface TableApiResponse {
  id?: number;
  table_number?: number;
  number_table?: number;
  status?: number;
  capacity?: number;
  image?: string | null;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  type?: string | null;
  view?: string | null;
  purpose?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

interface PaymentMethodApiResponse {
  data?: IPaymentMethod[];
  [key: string]: unknown;
}

interface OrderApiResponse {
  id?: number;
  [key: string]: unknown;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface DataJsonType {
  orders?: Array<{
    id?: number | string;
    id_table: number | string;
    status: number;
    created_at?: string;
    [key: string]: unknown;
  }>;
  products?: Array<{
    id: number;
    category_id?: number;
    id_category?: number;
    name?: string;
    price?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}
interface PendingOrder {
  order_id?: number;
  created_at?: string;
  orders: OrderItem[];
}

export interface IPaymentMethod {
  id: number;
  payment_method: string; // Tên phương thức (cash, bank, momo, etc.)
  payment_status: number; // Trạng thái hoạt động (1: hoạt động, 2: ngưng hoạt động)
  id_user: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface AdTablesProps {
  tableId: string;
}
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
interface TotalOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function AdTables({ tableId }: AdTablesProps) {
  const { user } = useAuth();
  // Lấy thông tin bàn
  const [table, setTable] = useState<ITable | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    title: string;
    description?: string;
    emoji?: React.ReactNode;
    acceptText?: string;
    rejectText?: string;
    onAccept?: () => void;
    onReject?: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    emoji: <span style={{ fontSize: 28 }}>🤔</span>,
    acceptText: "Đồng ý",
    rejectText: "Hủy",
  });
  // Lấy thông tin bàn từ API
  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = (await ApiClient.get(`/tables/${tableId}`)) as ApiResponse<TableApiResponse>;
        console.log("Table response:", response); // Debug log
        
        // Kiểm tra cấu trúc response
        const tableData = response.data || response;
        console.log("Table data:", tableData); // Debug log
        
        // Đảm bảo dữ liệu bàn có đầy đủ thông tin cần thiết
        if (tableData) {
          const typedTableData = tableData as TableApiResponse;
          setTable({
            id: typedTableData.id || Number(tableId),
            table_number: typedTableData.table_number || typedTableData.number_table || Number(tableId),
            status: typedTableData.status || 1, // Default to available
            capacity: typedTableData.capacity || 4,
            image: typedTableData.image || null,
            description: typedTableData.description || null,
            start_time: typedTableData.start_time || null,
            end_time: typedTableData.end_time || null,
            type: typedTableData.type || null,
            view: typedTableData.view || null,
            purpose: typedTableData.purpose || null,
            created_at: typedTableData.created_at || undefined,
          });
        } else {
          console.error("Invalid table data received");
          setTable(null);
        }
      } catch (error) {
        console.error("Failed to fetch table:", error);
        setTable(null);
      }
    };
    fetchTable();
  }, [tableId]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const data = (await ApiClient.get('/payment-method')) as PaymentMethodApiResponse;
        // Lọc chỉ lấy các phương thức thanh toán đang hoạt động (payment_status = 1)
        const activeMethods = (data.data || []).filter((method: IPaymentMethod) => method.payment_status === 1);
        setPaymentMethods(activeMethods);

        // Set phương thức thanh toán mặc định là phương thức đầu tiên if available
        if (activeMethods.length > 0) {
          setPaymentMethod(String(activeMethods[0].id));
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        // Fallback nếu API không hoạt động
        setPaymentMethods([
          { id: 1, payment_method: "Tiền mặt", payment_status: 1, id_user: 1 },
          { id: 2, payment_method: "Chuyển khoản", payment_status: 1, id_user: 1 },
          { id: 3, payment_method: "Ví Momo", payment_status: 1, id_user: 1 }
        ]);
      }
    };
    
    fetchPaymentMethods();
  }, []);
  // Lấy order hiện tại của bàn (status: 1=processing, 2=occupied, 3=reserved)
  const isActiveOrder = (order: { id_table: number | string; status: number }) => {
    return (
      String(order.id_table) === String(tableId) &&
      (order.status === 1 || order.status === 2 || order.status === 3)
    );
  };
  const typedData = data as DataJsonType;
  const orders = (Array.isArray(typedData.orders) ? typedData.orders : [])
    .filter(isActiveOrder);
  const order = orders[0];
  // Map products by id, support both category_id and id_category
  const productsMap = Object.fromEntries(
    (Array.isArray(typedData.products) ? typedData.products : []).map((p: { id: number; category_id?: number; id_category?: number; name?: string; price?: number; [key: string]: unknown }) => [
      String(p.id),
      {
        ...p,
        id_category: p.category_id ?? p.id_category,
      }
    ])
  );

  let orderProducts = Array.isArray(order?.products) ? order.products : [];
  let orderItems: OrderItem[] = orderProducts.map((item: { product_id: string; quantity: number }) => {
    const product = productsMap[item.product_id];
    return {
      id: item.product_id,
      name: product?.name || "Sản phẩm",
      price: Number(product?.price) || 0,
      quantity: item.quantity,
    };
  });

  // State để lưu order tạm từ localStorage
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);

  // Thêm state để trigger reload khi xóa món
  const [reload, setReload] = useState(0);

  useEffect(() => {
    // Lấy order tạm từ localStorage nếu có
    const local = localStorage.getItem(`pending_order_${tableId}`);
    if (local) {
      setPendingOrder(JSON.parse(local));
    }
  }, [tableId, reload]);

  // Hàm xóa món ăn khỏi hóa đơn
  const handleRemoveItem = async (itemId: string) => {
    if (pendingOrder) {
      // Xóa khỏi order tạm
      const newOrders = pendingOrder.orders.filter((item: OrderItem) => String(item.id) !== String(itemId));
      const newPending = { ...pendingOrder, orders: newOrders };
      setPendingOrder(newPending);
      localStorage.setItem(`pending_order_${tableId}`, JSON.stringify(newPending));
      setReload(r => r + 1);
      // Nếu là reorder, cập nhật backend ngay
      if (pendingOrder.order_id) {
        try {
          await syncOrderItemsToServer(pendingOrder.order_id, newOrders);
          // Tính lại tổng tiền
          const newTotal = newOrders.reduce((sum: number, o: OrderItem) => sum + o.price * o.quantity, 0);
          await ApiClient.put(`/orders/${pendingOrder.order_id}`, {
            total_payment: newTotal
          });
        } catch (err) {
          console.error('Lỗi khi đồng bộ món ăn khi xóa:', err);
        }
      }
    } else if (order) {
      // Xóa khỏi order db (chỉ cập nhật local, khi thanh toán mới gửi lên server)
      orderProducts = orderProducts.filter((item: { product_id: string }) => String(item.product_id) !== String(itemId));
      orderItems = orderItems.filter((item: OrderItem) => String(item.id) !== String(itemId));
      setReload(r => r + 1);
    }
  };

  // Hàm hủy hóa đơn
  const handleCancelOrder = async () => {
    setNotification({
      open: true,
      title: "Xác nhận hủy hóa đơn",
      description: "Bạn có chắc muốn hủy hóa đơn này không?",
      emoji: <span style={{ fontSize: 28 }}>⚠️</span>,
      acceptText: "Đồng ý",
      rejectText: "Hủy",
      onAccept: async () => {
        try {
          // First update table status to available
          const tableUpdatePayload = {
            status: 1,
            start_time: null,
            end_time: null,
            description: null,
            number_table: table?.number_table || Number(tableId),
            capacity: table?.capacity || 4,
            name: table?.name || `Bàn ${tableId}`
          };

          console.log("Updating table with payload:", tableUpdatePayload);

          const tableUpdateResponse = await ApiClient.patch(`/tables/${tableId}`, tableUpdatePayload);

          console.log("Table update response:", tableUpdateResponse);

          if (!tableUpdateResponse || !tableUpdateResponse.data) {
            throw new Error("Failed to update table status");
          }

          const orderId = pendingOrder?.order_id || order?.id;
          if (orderId) {
            await ApiClient.put(`/orders/${orderId}`, { status: 4 });
            localStorage.removeItem(`pending_order_${tableId}`);
          }

          setNotification({
            open: true,
            title: "Thành công",
            description: "Đã hủy hóa đơn và chuyển bàn về trạng thái trống.",
            emoji: <span style={{ fontSize: 28 }}>✅</span>,
            acceptText: "OK",
            onAccept: () => {
              window.location.href = "/quan-ly-dat-ban";
            }
          });
        } catch (error: unknown) {
          console.error("Error canceling order:", error);
          const typedError = error as ErrorResponse;
          const errorMessage = typedError?.response?.data?.message || typedError?.message || "Có lỗi xảy ra khi hủy hóa đơn!";
          setNotification({
            open: true,
            title: "Lỗi",
            description: errorMessage,
            emoji: <span style={{ fontSize: 28 }}>❌</span>,
            acceptText: "OK",
            onAccept: () => setNotification(prev => ({ ...prev, open: false }))
          });
        }
      },
      onReject: () => setNotification(prev => ({ ...prev, open: false }))
    });
  };

  // Nếu có order tạm và đã có order trên db, thì cộng dồn các món vào hóa đơn hiện tại
  if (pendingOrder && order) {
    const map = new Map<string, OrderItem>();

    orderItems.forEach((item: OrderItem) => {
      map.set(String(item.id), { ...item });
    });
    pendingOrder.orders.forEach((item: OrderItem) => {
      const key = String(item.id);
      if (map.has(key)) {
        const existing = map.get(key);
        if (existing) existing.quantity += item.quantity;
      } else {
        map.set(key, { ...item });
      }
    });
    orderItems = Array.from(map.values());
  } else if (pendingOrder) {
    // Nếu chỉ có order tạm thì hiển thị order tạm
    orderItems = pendingOrder.orders.map((item: OrderItem) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));
  }

  const total: number = orderItems.reduce(
    (sum: number, o: TotalOrderItem) => sum + o.price * o.quantity,
    0
  );

  // Lấy ngày giờ tạo order
  let createdAt = order?.created_at
    ? new Date(order.created_at).toLocaleString("vi-VN")
    : "-";
  if (pendingOrder && pendingOrder.created_at) {
    createdAt = new Date(pendingOrder.created_at).toLocaleString("vi-VN");
  }

  // Lấy trạng thái bàn
  const statusMap: Record<string, string> = {
    available: "Trống",
    occupied: "Đang sử dụng",
    reserved: "Đã đặt trước"
  };
  let tableStatus = table?.status || "available";
  if (orderItems.length > 0) tableStatus = "occupied";
  const tableStatusLabel = statusMap[tableStatus] || tableStatus;

  // Thêm state lưu thông tin QR/link SePay
  const [sepayPayment, setSepayPayment] = useState<{ qr_code?: string; payment_url?: string } | null>(null);

  useEffect(() => {
    // Reset QR state khi đổi phương thức thanh toán hoặc đổi bàn
    setSepayPayment(null);
    setIsWaitingSePay(false);
    setCanConfirmSePay(false);
    // setOrderIdForSePay(null);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [paymentMethod, tableId]);

  const [isWaitingSePay, setIsWaitingSePay] = useState(false);
  const [canConfirmSePay, setCanConfirmSePay] = useState(false);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

  const startPollingOrderStatus = (orderId: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = (await ApiClient.get(`/orders/${orderId}`)) as ApiResponse<{ status?: number; data?: { status?: number } }>;
        console.log("Polling raw response:", res);
        let status = undefined;
        if (res.data?.data?.status !== undefined) {
          status = res.data.data.status;
        } else if (res.data?.status !== undefined) {
          status = res.data.status;
        }
        console.log("Polling order status:", status, "orderId:", orderId, res.data?.data);
        if (status === 2) {
          setCanConfirmSePay(true);
          setIsWaitingSePay(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // ignore
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    const selectedMethod = paymentMethods.find(m => String(m.id) === paymentMethod);
    try {
      if (!selectedMethod) {
        setNotification({
          open: true,
          title: "Lỗi",
          description: "Phương thức thanh toán không hợp lệ!",
          emoji: <span style={{ fontSize: 28 }}>❌</span>,
          acceptText: "OK",
          onAccept: () => setNotification(prev => ({ ...prev, open: false }))
        });
        return;
      }
      if (selectedMethod.payment_method.toLowerCase().includes('sepay')) {
        if (canConfirmSePay) {
          // Nếu có order_id, cập nhật lại đơn hàng cũ
          if (pendingOrder && typeof pendingOrder.order_id === 'number') {
            const orderId = pendingOrder.order_id;
            // Xóa order tạm khỏi localStorage để bàn về trạng thái Trống và đồng bộ ds món ăn
            await syncOrderItemsToServer(orderId, pendingOrder.orders);
            localStorage.removeItem(`pending_order_${tableId}`);
          }
          // Đã nhận callback, chỉ show popup, KHÔNG gọi API nữa!
          setNotification({
            open: true,
            title: 'Thanh toán thành công!',
            description: 'Hệ thống đã nhận xác nhận từ SePay.',
            emoji: <span style={{ fontSize: 28 }}>✅</span>,
            acceptText: 'OK',
            onAccept: () => {
              setNotification(prev => ({ ...prev, open: false }));
              window.location.href = "/quan-ly-dat-ban";
              setTimeout(() => { window.location.reload(); }, 200);
            },
          });
          setIsProcessing(false);
          return;
        }
        // Nếu đã có order (status=1) thì dùng luôn, không tạo mới
        let sepayOrderId: number | null = null;
        if (pendingOrder?.order_id) {
          sepayOrderId = pendingOrder.order_id;
        } else if (order?.id) {
          sepayOrderId = Number(order.id) || null;
        }
        if (!sepayOrderId) {
          // Nếu không có order nào, mới tạo mới (trường hợp này hiếm)
          if (!user?.id) throw new Error('Vui lòng đăng nhập để tạo đơn hàng');
          if (!table) throw new Error('Không tìm thấy thông tin bàn');
          const tableNumber = table.number_table || Number(tableId);
          const tableCapacity = table.capacity || 4;
          const orderPayload = {
            id_table: Number(tableId),
            id_user: user.id,
            number_table: tableNumber,
            capacity: tableCapacity,
            name_user: user.name || "Khách tại bàn",
            date: new Date().toLocaleDateString('en-CA'),
            phone: user.phone || null,
            total_payment: total || null,
          };
          const resOrder = (await ApiClient.post("/orders", orderPayload)) as ApiResponse<OrderApiResponse>;
          sepayOrderId = resOrder.data?.id || null;
          if (!sepayOrderId) throw new Error('Không tạo được đơn hàng!');
        }
        // setOrderIdForSePay(sepayOrderId);
        setSepayPayment({
          qr_code: `https://qr.sepay.vn/img?acc=VQRQADFUC9149&bank=MBBank&amount=${total}&des=Thanh Toán Bàn Số ${tableId}`,
          payment_url: "https://my.sepay.vn/payment-link-demo"
        });
        setIsWaitingSePay(true);
        setCanConfirmSePay(false);
        startPollingOrderStatus(sepayOrderId);
        setIsProcessing(false);
        return;
      }

      // Validate table data
      if (!table) {
        throw new Error("Không tìm thấy thông tin bàn");
      }

      // Log table data for debugging
      console.log("Current table data:", table);

      // Ensure table has required fields
      const tableNumber = table.number_table || Number(tableId);
      const tableCapacity = table.capacity || 4;

      if (pendingOrder && pendingOrder.order_id) {
        // Nếu có order_id, cập nhật lại đơn hàng cũ
        const orderId = pendingOrder.order_id;
        // Cập nhật lại thông tin đơn hàng (tổng tiền, trạng thái, ...)
        await ApiClient.put(`/orders/${orderId}`, {
          status: 2, // Đã thanh toán
          id_payment: selectedMethod.id,
          status_deposit: 2, // Đã thanh toán
          total_payment: total,
        });
        // Đồng bộ lại danh sách món ăn
        await syncOrderItemsToServer(orderId, pendingOrder.orders);
        localStorage.removeItem(`pending_order_${tableId}`);
        setNotification({
          open: true,
          title: "Thành công",
          description: `Đã cập nhật lại đơn hàng #${orderId} và thanh toán thành công bằng ${selectedMethod.payment_method}!`,
          emoji: <span style={{ fontSize: 28 }}>✅</span>,
          acceptText: "OK",
          onAccept: () => {
            window.location.href = "/quan-ly-dat-ban";
          }
        });
        return;
      }

      let orderId: number | null = null;

      if (pendingOrder && !order) {
        try {
          // Validate user data
          if (!user?.id) {
            throw new Error("Vui lòng đăng nhập để tạo đơn hàng");
          }

          // Prepare order payload
          const orderPayload = {
            id_table: Number(tableId),
            id_user: user.id,
            number_table: tableNumber,
            capacity: tableCapacity,
            name_user: user.name || "Khách tại bàn",
            date: new Date().toLocaleDateString('en-CA'), // Format: YYYY-MM-DD
            phone: user.phone || null,
            total_payment : total || null,
          };
            
          console.log("Creating order with payload:", orderPayload);

          // Create order
          const orderData = (await ApiClient.post("/orders", orderPayload)) as ApiResponse<OrderApiResponse>;
          console.log("Order creation response:", orderData);

          if (!orderData.data?.id) {
            throw new Error("Không nhận được ID đơn hàng sau khi tạo");
          }

          orderId = orderData.data.id;

          // Sync order items
          const syncPayload = {
            items: pendingOrder.orders.map((item: { id: number | string; quantity: number }) => ({
              id_product: Number(item.id),
              quantity: item.quantity
            }))
          };

          console.log("Syncing order items with payload:", syncPayload);
          
          await ApiClient.post(`/orders/${orderId}/sync-items`, syncPayload);
          
          // Update payment status
          await ApiClient.put(`/orders/${orderId}`, {
            status: 2,
            status_deposit: 2,
            id_payment: selectedMethod.id
          });
          
          // Clear pending order from localStorage
          localStorage.removeItem(`pending_order_${tableId}`);

          // Update table status
          const tableUpdatePayload = {
            status: 1,
            start_time: null,
            end_time: null,
            description: null,
            number_table: tableNumber,
            capacity: tableCapacity,
            name: table.name || `Bàn ${tableId}`
          };

          console.log("Updating table with payload:", tableUpdatePayload);

          const tableUpdateResponse = await ApiClient.patch(`/tables/${tableId}`, tableUpdatePayload);

          console.log("Table update response:", tableUpdateResponse);

          if (!tableUpdateResponse || !tableUpdateResponse.data) {
            console.error("Table update response:", tableUpdateResponse);
            throw new Error("Không thể cập nhật trạng thái bàn");
          }

          setNotification({
            open: true,
            title: "Thành công",
            description: `Thanh toán thành công bằng ${selectedMethod.payment_method}!`,
            emoji: <span style={{ fontSize: 28 }}>✅</span>,
            acceptText: "OK",
            onAccept: () => {
              window.location.href = "/quan-ly-dat-ban";
            }
          });
        } catch (error: unknown) {
          console.error("Chi tiết lỗi:", error);
          if ((error as { response?: { data?: { message?: string } } })?.response?.data?.message) {
            throw new Error((error as { response: { data: { message: string } } }).response.data.message);
          }
          throw new Error(`Lỗi khi tạo đơn hàng: ${(error as Error).message}`);
        }
      } else if (order) {
        // Cập nhật đơn hàng hiện có
        await ApiClient.put(`/orders/${order.id}`, {
          status: 2,
          id_payment: selectedMethod.id,
          status_deposit: 2,
        });
        
        orderId = order.id ? Number(order.id) : null;
      } else {
        throw new Error("Không tìm thấy thông tin đơn hàng");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setNotification({
        open: true,
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Có lỗi xảy ra khi thanh toán!",
        emoji: <span style={{ fontSize: 28 }}>❌</span>,
        acceptText: "OK",
        onAccept: () => setNotification(prev => ({ ...prev, open: false }))
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Nếu order là reserved thì lấy thêm thông tin đặt trước từ table
  let reservedInfo: { start_time?: string; end_time?: string; description?: string } = {};
  if (order && order.status === 3 && table) {
    reservedInfo = {
      start_time: table.start_time ?? undefined,
      end_time: table.end_time ?? undefined,
      description: table.description ?? undefined,
    };
  }

  console.log("Sending payment method:", paymentMethod, "as value:");
  console.log("Order items being processed:", orderItems);

  // Thêm hàm gửi toàn bộ danh sách món từ localStorage về backend
  const syncOrderItemsToServer = async (orderId: number, items: OrderItem[]) => {
    try {
      // Validate items array
      if (!items || items.length === 0) {
        throw new Error("Danh sách món ăn không được để trống");
      }

      // Validate each item
      const validItems = items.map(item => {
        if (!item.id) {
          throw new Error(`Món "${item.name}" không có ID sản phẩm`);
        }
        if (!item.quantity || item.quantity < 1) {
          throw new Error(`Số lượng món "${item.name}" không hợp lệ`);
        }
        return {
          id_product: Number(item.id),
          quantity: Number(item.quantity)
        };
      });

      console.log("Syncing order items:", {
        orderId,
        items: validItems
      });

      const response = await ApiClient.post(`/orders/${orderId}/sync-items`, {
        items: validItems
      });

      console.log("Sync response:", response);
      return response;
    } catch (err: unknown) {
      console.error("Error syncing order items:", err);
      const typedError = err as ErrorResponse;
      if (typedError.response?.data?.message) {
        throw new Error(typedError.response.data.message);
      }
      throw new Error("Failed to sync order items");
    }
  };

  // QR Payment
  // const qrCodeImage = `https://qr.sepay.vn/img?acc=VQRQADFUC9149&bank=MBBank&amount=${total}&des=Thanh Toán Bàn Số ${tableId}`;
  return (
    <>
    <div
      className={`w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 shadow-lg p-3 sm:p-6 lg:p-8 min-h-screen sm:min-h-[80vh] flex flex-col justify-start pb-20 sm:pb-8`}
      style={{ fontSize: "1rem" }}
    >
        <Link href={`/quan-ly-dat-ban/${tableId}/orders`} className="mb-4 sm:mb-6">
          <button
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 sm:px-6 sm:py-3 rounded-[8px] font-semibold text-sm sm:text-[14px] transition"
            type="button"
          >
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Trở về
          </button>
        </Link>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wider text-gray-600 dark:text-amber-50">HÓA ĐƠN THANH TOÁN</h2>
        
        {/* Thông tin bàn - responsive */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:justify-between mb-4 text-sm sm:text-lg dark:text-amber-50">
          <span className="text-sm sm:text-base pr-[60px]"><strong>Bàn:</strong> {table?.name || tableId}</span>
          <span className="text-sm sm:text-base"><strong>Trạng thái:</strong> {tableStatusLabel}</span>
        </div>
        <div className="space-y-2 sm:space-y-0 sm:flex sm:justify-between mb-6 sm:mb-8 text-sm sm:text-lg dark:text-amber-50">
          <span className="text-sm sm:text-base pr-[10px]"><strong>Ngày giờ:</strong> {createdAt}</span>
          <span className="text-sm sm:text-base"><strong>Mã hóa đơn:</strong> {order?.id || pendingOrder?.order_id}</span>
        </div>
        
        {/* Hiển thị thông tin đặt trước nếu hóa đơn là reserved */}
        {order?.status === 3 && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-50 rounded border border-blue-200 text-sm sm:text-base">
            <div className="font-semibold text-blue-700 mb-2">Thông tin đặt trước:</div>
            <div className="space-y-1">
              <div>
                <strong>Thời gian bắt đầu:</strong>{" "}
                {reservedInfo.start_time
                  ? new Date(reservedInfo.start_time).toLocaleString("vi-VN")
                  : "-"}
              </div>
              <div>
                <strong>Thời gian kết thúc:</strong>{" "}
                {reservedInfo.end_time
                  ? new Date(reservedInfo.end_time).toLocaleString("vi-VN")
                  : "-"}
              </div>
              <div>
                <strong>Ghi chú:</strong> {reservedInfo.description || "-"}
              </div>
            </div>
          </div>
        )}
        
        {/* Table responsive */}
        <div className="overflow-x-auto mb-6 sm:mb-8 -mx-3 sm:mx-0">
          <div className="min-w-full">
            <table className="w-full border text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-2 sm:px-4 sm:py-2 text-left">Tên món</th>
                  <th className="border px-2 py-2 sm:px-4 sm:py-2 text-center">SL</th>
                  <th className="border px-2 py-2 sm:px-4 sm:py-2 text-right">Đơn giá</th>
                  <th className="border px-2 py-2 sm:px-4 sm:py-2 text-right">Thành tiền</th>
                  <th className="border px-2 py-2 sm:px-4 sm:py-2 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 sm:py-8 text-gray-400 text-base sm:text-xl">Chưa có món nào được order.</td>
                  </tr>
                ) : (
                  orderItems.map((item: OrderItem) => (
                    <tr key={item.id}>
                      <td className="border px-2 py-2 sm:px-4 sm:py-2 text-sm sm:text-base">{item.name}</td>
                      <td className="border px-2 py-2 sm:px-4 sm:py-2 text-center">{item.quantity}</td>
                      <td className="border px-2 py-2 sm:px-4 sm:py-2 text-right text-sm sm:text-base">{item.price.toLocaleString()}đ</td>
                      <td className="border px-2 py-2 sm:px-4 sm:py-2 text-right text-sm sm:text-base">{(item.price * item.quantity).toLocaleString()}đ</td>
                      <td className="border px-2 py-2 sm:px-4 sm:py-2 text-center">
                        <button
                          className="text-red-600 hover:text-red-900 font-bold text-sm sm:text-base"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Xóa món"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Tổng tiền */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <span className="font-semibold dark:text-white text-lg sm:text-2xl text-black">Tổng cộng:</span>
          <span className="text-red-600 text-xl sm:text-3xl font-bold">{total.toLocaleString()} đ</span>
        </div>
        
        {/* Chọn phương thức thanh toán */}
        {orderItems.length > 0 && (
          <div className="flex flex-col mb-4 w-full space-y-2">
            <label className="font-semibold text-base sm:text-lg dark:text-amber-50">
              Phương thức thanh toán:
            </label>
            <div className="w-full sm:w-auto sm:flex sm:justify-end">
              <select
                className="border px-3 py-2 sm:px-4 sm:py-2 rounded text-sm sm:text-lg w-full max-w-xs sm:max-w-none sm:w-auto min-w-[200px]"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                disabled={paymentMethods.length === 0}
              >
                {paymentMethods.length === 0 ? (
                  <option value="">Đang tải phương thức...</option>
                ) : (
                  paymentMethods.map(method => (
                    <option key={method.id} value={String(method.id)}>
                      {method.payment_method}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}
        
        {/* QR Code */}
        <div className="flex justify-center mb-4">
          {sepayPayment?.qr_code && (
            <Image 
              src={sepayPayment.qr_code} 
              alt="QR Code" 
              width={320}
              height={320}
              className="max-w-full h-auto mx-auto max-h-64 sm:max-h-80" 
            />
          )}
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row mt-4 gap-3 sm:gap-4 w-full">
          {orderItems.length > 0 && (
            <>
              {/* Nút hủy hóa đơn */}
              <button
                className="bg-white border border-red-500 text-red-600 hover:bg-red-50 px-4 py-3 sm:px-6 sm:py-3 rounded-[8px] font-semibold text-sm sm:text-[14px] transition w-full sm:w-auto order-2 sm:order-1"
                onClick={handleCancelOrder}
                type="button"
              >
                Hủy hóa đơn
              </button>
              {/* Nút hoàn tất thanh toán */}
              {(() => {
                const selectedMethod = paymentMethods.find(m => String(m.id) === paymentMethod);
                const isSePayMethod = selectedMethod?.payment_method.toLowerCase().includes('sepay');
                const isButtonDisabled = isProcessing || (isWaitingSePay && !canConfirmSePay && isSePayMethod);
                
                return (
                  <button
                    className={`transition font-semibold text-sm sm:text-[14px] w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-3 rounded-[8px] order-1 sm:order-2 sm:ml-auto
                      ${isButtonDisabled 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-[#3E2723] text-white hover:bg-[#5d4037]'}
                    `}
                    onClick={handleCompletePayment}
                    disabled={isButtonDisabled}
                    type="button"
                    style={{ minWidth: 120 }}
                  >
                    {isProcessing ? 'Đang xử lý...' : isWaitingSePay && isSePayMethod ? 'Đang chờ thanh toán...' : 'Thanh toán'}
                  </button>
                );
              })()}
            </>
          )}
        </div>
      </div>
      <NotificationModal
        open={notification.open}
        title={notification.title}
        description={notification.description}
        emoji={notification.emoji}
        acceptText={notification.acceptText}
        rejectText={notification.rejectText}
        onAccept={() => {
          notification.onAccept?.();
          setNotification(prev => ({ ...prev, open: false }));
        }}
        onReject={() => {
          notification.onReject?.();
          setNotification(prev => ({ ...prev, open: false }));
        }}
      />
      </>
  )};
