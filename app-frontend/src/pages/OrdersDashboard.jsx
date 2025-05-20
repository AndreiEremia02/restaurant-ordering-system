import { useEffect, useState } from 'react';
import axios from 'axios';
import "../assets/styles/OrdersDashboard.css";

function OrdersDashboard() {
  const [ordersByTable, setOrdersByTable] = useState({});
  const [buzzState, setBuzzState] = useState({});
  const [expandedTables, setExpandedTables] = useState({});

  const fetchOrders = async () => {
    const data = {};
    for (let i = 1; i <= 8; i++) {
      try {
        const response = await axios.get(`https://smashly-backend.onrender.com/api/orders/${i}`);
        data[i] = response.data.orders || [];
      } catch (error) {
        console.error(`Error for table ${i}:`, error);
        data[i] = [];
      }
    }
    setOrdersByTable(data);
  };

  const refreshBuzzState = () => {
    const buzz = {};
    for (let i = 1; i <= 8; i++) {
      const expire = parseInt(sessionStorage.getItem(`buzz_table_${i}`), 10);
      if (expire && expire > Date.now()) {
        buzz[i] = true;
      }
    }
    setBuzzState(buzz);
  };

  const handleOrderDelivered = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`https://smashly-backend.onrender.com/api/order/${orderId}`, { newStatus });

      if (newStatus === 'livrat') {
        const { secondsReduced, isLast } = response.data;
        const expireAt = parseInt(sessionStorage.getItem("popupExpireAt"), 10);
        const newExpireAt = Math.max(Date.now(), expireAt - secondsReduced * 1000);
        sessionStorage.setItem("popupExpireAt", newExpireAt);

        if (isLast) {
          window.dispatchEvent(new Event("popupTimeUpdated"));
        }

        window.dispatchEvent(new Event("popupTimeUpdated"));
      }

      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const toggleExpand = (table) => {
    setExpandedTables(prev => ({ ...prev, [table]: !prev[table] }));
  };

  useEffect(() => {
    fetchOrders();
    refreshBuzzState();

    const handler = () => {
      refreshBuzzState();
    };

    window.addEventListener("buzzUpdated", handler);
    const interval = setInterval(refreshBuzzState, 5000);

    return () => {
      window.removeEventListener("buzzUpdated", handler);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="orders-dashboard">
      <h2 className="orders-title">Comenzi Active</h2>
      <div className="table-list">
        {Array.from({ length: 8 }, (_, index) => {
          const tableNumber = index + 1;
          const orders = ordersByTable[tableNumber] || [];
          const isExpanded = expandedTables[tableNumber];

          return (
            <div key={tableNumber} className="table-card">
              <div className="table-header" onClick={() => toggleExpand(tableNumber)}>
                <span className="table-title">
                  Masa #{tableNumber} - {orders.length} comenzi active
                  {buzzState[tableNumber] && <span className="buzz-badge"> BUZZ</span>}
                </span>
                <span className="arrow">{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div className="table-orders">
                  {orders.length === 0 ? (
                    <p>Nu sunt comenzi pentru aceasta masa.</p>
                  ) : (
                    orders.map(order => (
                      <div key={order._id} className="order-card">
                        <h5>Comanda #{order._id.slice(-6)}</h5>
                        <p><strong>Ora:</strong> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                        <p><strong>Status:</strong> <span className="order-status">{order.status}</span></p>
                        <p><strong>Total:</strong> {order.totalAmount} RON</p>
                        <ul>
                          {order.items.map((item, idx) => (
                            <li key={idx}>{item.name} - {item.price} RON</li>
                          ))}
                        </ul>
                        <button
                          className="btn-delivered"
                          onClick={() => handleOrderDelivered(order._id, 'livrat')}
                        >
                          Marcheaza ca livrat
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrdersDashboard;
