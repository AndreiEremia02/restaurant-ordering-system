import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { TEXTS } from '../assets/data/texts';
import '../assets/styles/OrdersDashboard.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://smashly-backend.onrender.com';

function OrdersDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ordersByTable, setOrdersByTable] = useState({});
  const [buzzState, setBuzzState] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  const pathParts = location.pathname.split('/');
  const employeeId = pathParts[2] || '';

  useEffect(() => {
    fetchOrders();
    refreshBuzzState();

    const buzzHandler = () => refreshBuzzState();
    window.addEventListener('buzzUpdated', buzzHandler);

    const buzzInterval = setInterval(refreshBuzzState, 5000);
    const orderInterval = setInterval(fetchOrders, 3000);

    return () => {
      window.removeEventListener('buzzUpdated', buzzHandler);
      clearInterval(buzzInterval);
      clearInterval(orderInterval);
    };
  }, []);

  const fetchOrders = async () => {
    const newData = {};
    for (let i = 1; i <= 8; i++) {
      try {
        const response = await axios.get(`${API_BASE}/api/orders/${i}`);
        newData[String(i)] = response.data.orders || [];
      } catch (error) {
        newData[String(i)] = [];
      }
    }
    setOrdersByTable(newData);
  };

  const refreshBuzzState = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/buzz-status`);
      const buzz = {};
      response.data.tables.forEach(tableNum => {
        const activeOrders = ordersByTable[String(tableNum)];
        if (activeOrders && activeOrders.length > 0) {
          buzz[tableNum] = true;
        }
      });
      setBuzzState(buzz);
    } catch (e) {
      setBuzzState({});
    }
  };

  const handleOrderDelivered = async (orderId, newStatus, tableNumber) => {
    try {
      const response = await axios.put(`${API_BASE}/api/order/${orderId}`, { newStatus });
      if (newStatus === 'livrat') {
        const { secondsReduced } = response.data;
        const tableKey = `popupExpireAt_masa_${tableNumber}`;
        const expireAt = parseInt(sessionStorage.getItem(tableKey), 10);
        const newExpireAt = Math.max(Date.now(), expireAt - secondsReduced * 1000);
        sessionStorage.setItem(tableKey, newExpireAt);
        window.dispatchEvent(new Event('popupTimeUpdated'));
      }
      fetchOrders();
    } catch (error) {}
  };

  const toggleExpand = (table) => {
    setExpandedTables((prev) => ({ ...prev, [table]: !prev[table] }));
  };

  const confirmDelete = (orderId) => {
    setDeleteOrderId(orderId);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setDeleteOrderId(null);
    setShowConfirm(false);
  };

  const deleteOrder = async () => {
    try {
      await axios.put(`${API_BASE}/api/order/${deleteOrderId}/hide`);
      setDeleteOrderId(null);
      setShowConfirm(false);
      fetchOrders();
      window.dispatchEvent(new Event('popupTimeUpdated'));
    } catch (err) {}
  };

  return (
    <div className="orders-dashboard">
      <div className="orders-header">
        <h2 className="orders-title">{TEXTS.DASHBOARD.TITLE}</h2>
        <div className="header-buttons">
          <button
            className="stats-button"
            onClick={() => navigate(`/employee/${employeeId}/stats`)}
          >
            STATISTICI
          </button>
          <button
            className="logout-button"
            onClick={() => {
              sessionStorage.removeItem('loggedEmployee');
              navigate('/login');
            }}
          >
            {TEXTS.DASHBOARD.LOGOUT_BUTTON}
          </button>
        </div>
      </div>

      <div className="table-list">
        {Array.from({ length: 8 }, (_, index) => {
          const tableNumber = index + 1;
          const orders = ordersByTable[String(tableNumber)] || [];
          const isExpanded = expandedTables[tableNumber];

          return (
            <div key={tableNumber} className="table-card">
              <div className="table-header" onClick={() => toggleExpand(tableNumber)}>
                <span className="table-title">
                  {TEXTS.DASHBOARD.TABLE_LABEL} #{tableNumber} - {orders.length} {TEXTS.DASHBOARD.ACTIVE_ORDERS}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {buzzState[tableNumber] && orders.length > 0 && (
                    <span className="buzz-badge">{TEXTS.DASHBOARD.BUZZ}</span>
                  )}
                  <span className="arrow">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="table-orders">
                  {orders.length === 0 ? (
                    <p>{TEXTS.DASHBOARD.NO_ORDERS}</p>
                  ) : (
                    orders.map(order => (
                      <div key={order._id || order.id} className="order-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h5>
                            {TEXTS.DASHBOARD.ORDER} #{(order._id || order.id || '').toString().slice(-6)}
                          </h5>
                          <button
                            className="delete-button"
                            onClick={() => confirmDelete(order._id || order.id)}
                          >
                            X
                          </button>
                        </div>
                        <p><strong>{TEXTS.DASHBOARD.TIME}:</strong> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>{TEXTS.DASHBOARD.STATUS}:</strong> <span className={`order-status order-status-${order.status}`}>{order.status}</span></p>
                        <p><strong>{TEXTS.DASHBOARD.TOTAL}:</strong> {order.totalAmount} {TEXTS.GENERAL.CURRENCY}</p>
                        <ul>
                          {order.products.map((item, idx) => {
                            const noteArray = Array.isArray(order.notes) ? order.notes : (order.notes?.split(';') || []);
                            const productNote = noteArray[idx]?.trim();
                            return (
                              <li key={idx}>
                                {item.name} {productNote ? `(${productNote})` : ''} - {item.price} {TEXTS.GENERAL.CURRENCY}
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          className="btn-delivered"
                          onClick={() => handleOrderDelivered(order._id || order.id, 'livrat', order.tableNumber)}
                          disabled={order.status === 'livrat'}
                        >
                          {order.status === 'livrat' ? TEXTS.DASHBOARD.ALREADY_DELIVERED : TEXTS.DASHBOARD.MARK_DELIVERED}
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

      {showConfirm && (
        <div className="confirm-delete-overlay">
          <div className="confirm-delete-popup">
            <p>{TEXTS.DASHBOARD.DELETE_CONFIRMATION}"{deleteOrderId?.slice(-6)}"?</p>
            <div className="confirm-delete-buttons">
              <button id="btn-confirm-delete" onClick={deleteOrder}>DA</button>
              <button id="btn-cancel-delete" onClick={cancelDelete}>NU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersDashboard;
